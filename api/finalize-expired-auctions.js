const { getSupabaseAdmin } = require('./_supabaseAdmin');

const sendJson = (res, statusCode, body) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify(body));
}

const getTopBid = async (supabase, productId) => {
    const { data, error } = await supabase
        .from('product_bids')
        .select('*')
        .eq('product_id', productId)
        .order('price', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

const closeProduct = async (supabase, product) => {
    const topBid = await getTopBid(supabase, product.id);
    const now = Date.now();

    if (!topBid) {
        const { error } = await supabase
            .from('products')
            .update({ status: 'Expired', closed_at: now })
            .eq('id', product.id);

        if (error) throw error;
        return { id: product.id, status: 'Expired' };
    }

    const { data: winner, error: winnerError } = await supabase
        .from('users')
        .select('*')
        .eq('username', topBid.username)
        .maybeSingle();

    if (winnerError) throw winnerError;

    const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('*')
        .eq('uid', product.uid)
        .maybeSingle();

    if (sellerError) throw sellerError;

    const sellerUsername = seller?.username || product.display_name;
    if (!sellerUsername) {
        const error = Error('Seller profile was not found.');
        error.statusCode = 422;
        throw error;
    }

    const winnerSummary = {
        username: topBid.username,
        uid: topBid.uid,
        email: winner?.email || null,
        phoneNumber: winner?.phone_number || null,
        price: topBid.price
    };

    const { error: productError } = await supabase
        .from('products')
        .update({
            status: 'Finalized',
            closed_at: now,
            winner: winnerSummary
        })
        .eq('id', product.id);

    if (productError) throw productError;

    const notifications = [
        {
            username: sellerUsername,
            type: 'auction-finalized',
            product_id: product.id,
            title: product.title || '',
            payload: { winner: winnerSummary },
            read: false
        },
        {
            username: topBid.username,
            type: 'auction-won',
            product_id: product.id,
            title: product.title || '',
            payload: { price: topBid.price },
            read: false
        }
    ];

    const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

    if (notificationError) throw notificationError;
    return { id: product.id, status: 'Finalized' };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
        sendJson(res, 405, { message: 'Method not allowed.' });
        return;
    }

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.authorization || '';
        if (authHeader !== `Bearer ${cronSecret}`) {
            sendJson(res, 401, { message: 'Invalid cron authorization.' });
            return;
        }
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'Active')
            .lte('expires_at', Date.now())
            .limit(50);

        if (error) throw error;

        const results = [];
        for (const product of products || []) {
            results.push(await closeProduct(supabase, product));
        }

        sendJson(res, 200, {
            message: 'Expired auction finalization complete.',
            count: results.length,
            results
        });
    } catch (error) {
        sendJson(res, error.statusCode || 500, {
            message: error.statusCode ? error.message : 'Unexpected server error.'
        });
    }
}

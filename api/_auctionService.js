const { throwHttpError } = require('./_errors');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizePrice = value => {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) {
        throwHttpError('Invalid price value.', 400);
    }
    return price;
}

const getAuctionExpiry = product => {
    if (product.expires_at) return Number(product.expires_at);
    if (product.expiresAt) return Number(product.expiresAt);

    const createdAt = Number(product.date);
    const durationDays = Number(product.duration);

    if (!Number.isFinite(createdAt) || !Number.isFinite(durationDays) || durationDays <= 0) {
        throwHttpError('Auction duration is invalid.', 422);
    }

    return createdAt + durationDays * MS_PER_DAY;
}

const getBearerToken = req => {
    const header = req.headers.authorization || req.headers.Authorization;
    const match = typeof header === 'string' && header.match(/^Bearer\s+(.+)$/i);
    if (!match) throwHttpError('Authorization token is required.', 401);
    return match[1];
}

const authenticateUser = async ({ supabase, req }) => {
    const token = getBearerToken(req);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) throwHttpError('Invalid authorization token.', 401);

    const username = String(req.body?.username || '').trim();
    if (!username) throwHttpError('Username is required.', 400);

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throwHttpError('User profile was not found.', 404);
    if (profile.uid !== authData.user.id) throwHttpError('Invalid user token.', 401);

    return {
        ...profile,
        username,
        uid: authData.user.id
    };
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

const placeBid = async ({ supabase, user, body }) => {
    const productId = String(body?.productId || '').trim();
    if (!productId) throwHttpError('Product id is required.', 400);

    const price = normalizePrice(body.price);

    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

    if (productError) throw productError;
    if (!product) throwHttpError("Product doesn't exist anymore.", 404);
    if (product.uid === user.uid) throwHttpError('Owners cannot bid on their own auctions.', 403);
    if (product.status !== 'Active') throwHttpError('Auction is not active.', 409);

    const expiresAt = getAuctionExpiry(product);
    if (Date.now() >= expiresAt) throwHttpError('Auction has expired.', 409);

    const topBid = await getTopBid(supabase, productId);
    const minimumPrice = Math.max(Number(product.price) || 0, Number(topBid?.price) || 0) + 1;
    if (price < minimumPrice) throwHttpError(`Price must be at least ${minimumPrice}.`, 400);

    const { error: bidError } = await supabase
        .from('product_bids')
        .upsert({
            product_id: productId,
            username: user.username,
            date: Date.now(),
            price,
            uid: user.uid
        }, { onConflict: 'product_id,username' });

    if (bidError) throw bidError;

    const { error: productUpdateError } = await supabase
        .from('products')
        .update({
            current_bid: {
                username: user.username,
                uid: user.uid,
                price
            },
            expires_at: expiresAt
        })
        .eq('id', productId);

    if (productUpdateError) throw productUpdateError;

    return { message: 'You have successfully bid.', minimumPrice, price };
}

const finalizeAuction = async ({ supabase, user, body }) => {
    const productId = String(body?.productId || '').trim();
    if (!productId) throwHttpError('Product id is required.', 400);

    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

    if (productError) throw productError;
    if (!product) throwHttpError("Product doesn't exist anymore.", 404);
    if (product.uid !== user.uid) throwHttpError('Only the seller can finalize this auction.', 403);

    const expiresAt = getAuctionExpiry(product);
    const now = Date.now();

    if (product.status === 'Finalized' || product.status === 'Expired') {
        return { message: 'Auction is already closed.', status: product.status, expiresAt };
    }

    if (now < expiresAt) {
        const { error } = await supabase
            .from('products')
            .update({ expires_at: expiresAt, status: 'Active' })
            .eq('id', productId);

        if (error) throw error;
        return { message: 'Auction expiry has been scheduled.', status: 'Active', expiresAt };
    }

    const topBid = await getTopBid(supabase, productId);
    if (!topBid) {
        const { error } = await supabase
            .from('products')
            .update({ status: 'Expired', closed_at: now, expires_at: expiresAt })
            .eq('id', productId);

        if (error) throw error;
        return { message: 'Auction expired with no bids.', status: 'Expired', expiresAt };
    }

    const { data: winner, error: winnerError } = await supabase
        .from('users')
        .select('*')
        .eq('username', topBid.username)
        .maybeSingle();

    if (winnerError) throw winnerError;

    const winnerSummary = {
        username: topBid.username,
        uid: topBid.uid,
        email: winner?.email || null,
        phoneNumber: winner?.phone_number || null,
        price: topBid.price
    };

    const { error: updateError } = await supabase
        .from('products')
        .update({
            status: 'Finalized',
            closed_at: now,
            expires_at: expiresAt,
            winner: winnerSummary
        })
        .eq('id', productId);

    if (updateError) throw updateError;

    const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
            {
                username: user.username,
                type: 'auction-finalized',
                product_id: productId,
                title: product.title || '',
                payload: { winner: winnerSummary },
                read: false
            },
            {
                username: topBid.username,
                type: 'auction-won',
                product_id: productId,
                title: product.title || '',
                payload: {
                    seller: {
                        username: user.username,
                        email: user.email || null,
                        phoneNumber: user.phone_number || null
                    },
                    price: topBid.price
                },
                read: false
            }
        ]);

    if (notificationError) throw notificationError;

    return { message: 'Auction finalized.', status: 'Finalized', expiresAt, winner: winnerSummary };
}

module.exports = {
    authenticateUser,
    finalizeAuction,
    getAuctionExpiry,
    getBearerToken,
    getTopBid,
    normalizePrice,
    placeBid
};

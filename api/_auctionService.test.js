const test = require('node:test');
const assert = require('node:assert/strict');
const {
    finalizeAuction,
    getAuctionExpiry,
    normalizePrice,
    placeBid
} = require('./_auctionService');

const createSupabase = ({ product, topBid, winner }) => {
    const writes = [];

    const createQuery = table => {
        const query = {
            filters: {},
            select() {
                return this;
            },
            eq(column, value) {
                this.filters[column] = value;
                return this;
            },
            order() {
                return this;
            },
            limit() {
                return this;
            },
            async maybeSingle() {
                if (table === 'products') return { data: product || null, error: null };
                if (table === 'product_bids') return { data: topBid || null, error: null };
                if (table === 'users') return { data: winner || null, error: null };
                return { data: null, error: null };
            },
            async upsert(payload, options) {
                writes.push({ table, action: 'upsert', payload, options });
                return { error: null };
            },
            update(payload) {
                return {
                    eq: async (column, value) => {
                        writes.push({ table, action: 'update', payload, filter: { column, value } });
                        return { error: null };
                    }
                };
            },
            async insert(payload) {
                writes.push({ table, action: 'insert', payload });
                return { error: null };
            }
        };

        return query;
    };

    return {
        writes,
        from: createQuery
    };
}

test('normalizes valid prices and rejects invalid prices', () => {
    assert.equal(normalizePrice('12.5'), 12.5);
    assert.throws(() => normalizePrice('0'), { statusCode: 400 });
    assert.throws(() => normalizePrice('abc'), { statusCode: 400 });
});

test('calculates auction expiry from creation date and duration', () => {
    assert.equal(getAuctionExpiry({ date: 1000, duration: 2 }), 172801000);
    assert.equal(getAuctionExpiry({ expires_at: 5000, date: 1000, duration: 2 }), 5000);
});

test('rejects bids lower than the current highest bid', async () => {
    const supabase = createSupabase({
        product: {
            uid: 'seller-uid',
            status: 'Active',
            price: 100,
            date: Date.now(),
            duration: 2
        },
        topBid: {
            username: 'current-buyer',
            uid: 'buyer-uid',
            price: 150
        }
    });

    await assert.rejects(
        () => placeBid({
            supabase,
            user: { uid: 'new-buyer-uid', username: 'new-buyer' },
            body: { productId: 'product-1', price: 150 }
        }),
        { statusCode: 400, message: 'Price must be at least 151.' }
    );
});

test('finalizes expired auctions with no bids', async () => {
    const supabase = createSupabase({
        product: {
            uid: 'seller-uid',
            status: 'Active',
            price: 100,
            date: Date.now() - 3 * 24 * 60 * 60 * 1000,
            duration: 1
        }
    });

    const result = await finalizeAuction({
        supabase,
        user: { uid: 'seller-uid', username: 'seller' },
        body: { productId: 'product-1' }
    });

    assert.equal(result.status, 'Expired');
    const closingWrite = supabase.writes.find(write => write.payload.status === 'Expired');
    assert.equal(closingWrite.table, 'products');
    assert.equal(closingWrite.payload.status, 'Expired');
});

test('finalizes expired auctions with winner notifications', async () => {
    const supabase = createSupabase({
        product: {
            id: 'product-1',
            uid: 'seller-uid',
            status: 'Active',
            title: 'Turbo kit',
            price: 100,
            date: Date.now() - 3 * 24 * 60 * 60 * 1000,
            duration: 1
        },
        topBid: {
            username: 'buyer',
            uid: 'buyer-uid',
            price: 175
        },
        winner: {
            username: 'buyer',
            email: 'buyer@example.com',
            phone_number: '+971500000000'
        }
    });

    const result = await finalizeAuction({
        supabase,
        user: {
            uid: 'seller-uid',
            username: 'seller',
            email: 'seller@example.com',
            phone_number: '+971511111111'
        },
        body: { productId: 'product-1' }
    });

    assert.equal(result.status, 'Finalized');
    assert.deepEqual(result.winner, {
        username: 'buyer',
        uid: 'buyer-uid',
        email: 'buyer@example.com',
        phoneNumber: '+971500000000',
        price: 175
    });

    const productWrite = supabase.writes.find(write => write.table === 'products');
    assert.equal(productWrite.payload.status, 'Finalized');
    assert.equal(productWrite.payload.winner.username, 'buyer');

    const notificationWrite = supabase.writes.find(write => write.table === 'notifications');
    assert.equal(notificationWrite.payload.length, 2);
    assert.equal(notificationWrite.payload[0].username, 'seller');
    assert.equal(notificationWrite.payload[1].username, 'buyer');
    assert.equal(notificationWrite.payload[1].payload.seller.email, 'seller@example.com');
});

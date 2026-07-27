const test = require('node:test');
const assert = require('node:assert/strict');
const {
    finalizeAuction,
    getAuctionExpiry,
    normalizePrice,
    placeBid
} = require('./_auctionService');

const createCollectionRef = path => ({
    path,
    doc: id => ({ kind: 'doc', path: `${path}/${id || 'generated-id'}` }),
    orderBy: () => ({
        limit: () => ({ kind: 'query', path })
    })
});

const createDb = ({ product, topBid, winner }) => {
    const writes = [];
    const db = {
        doc: path => ({ kind: 'doc', path }),
        collection: createCollectionRef,
        runTransaction: async callback => callback({
            get: async ref => {
                if (ref.path?.startsWith('products/product-1/bids')) {
                    return {
                        docs: topBid ? [{
                            id: topBid.username,
                            data: () => topBid
                        }] : []
                    };
                }

                if (ref.path === 'products/product-1') {
                    return {
                        exists: Boolean(product),
                        data: () => product
                    };
                }

                if (ref.path === `users/${topBid?.username}`) {
                    return {
                        exists: Boolean(winner),
                        data: () => winner
                    };
                }

                return { exists: false, data: () => undefined };
            },
            set: (ref, data, options) => writes.push({ path: ref.path, data, options })
        })
    };

    return { db, writes };
}

test('normalizes valid prices and rejects invalid prices', () => {
    assert.equal(normalizePrice('12.5'), 12.5);
    assert.throws(() => normalizePrice('0'), { statusCode: 400 });
    assert.throws(() => normalizePrice('abc'), { statusCode: 400 });
});

test('calculates auction expiry from creation date and duration', () => {
    assert.equal(getAuctionExpiry({ date: 1000, duration: 2 }), 172801000);
    assert.equal(getAuctionExpiry({ expiresAt: 5000, date: 1000, duration: 2 }), 5000);
});

test('rejects bids lower than the current highest bid', async () => {
    const { db } = createDb({
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
            db,
            user: { uid: 'new-buyer-uid', username: 'new-buyer' },
            body: { productId: 'product-1', price: 150 }
        }),
        { statusCode: 400, message: 'Price must be at least 151.' }
    );
});

test('finalizes expired auctions with no bids', async () => {
    const { db, writes } = createDb({
        product: {
            uid: 'seller-uid',
            status: 'Active',
            price: 100,
            date: Date.now() - 3 * 24 * 60 * 60 * 1000,
            duration: 1
        }
    });

    const result = await finalizeAuction({
        db,
        FieldValue: { serverTimestamp: () => 'server-time' },
        user: { uid: 'seller-uid', username: 'seller' },
        body: { productId: 'product-1' }
    });

    assert.equal(result.status, 'Expired');
    const closingWrite = writes.find(write => write.data.status === 'Expired');
    assert.equal(closingWrite.path, 'products/product-1');
    assert.equal(closingWrite.data.status, 'Expired');
});

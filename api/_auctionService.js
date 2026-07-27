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

const authenticateUser = async ({ auth, db, req }) => {
    const decodedToken = await auth.verifyIdToken(getBearerToken(req));
    const username = String(req.body?.username || '').trim();
    if (!username) throwHttpError('Username is required.', 400);

    const userDoc = await db.doc(`users/${username}`).get();
    if (!userDoc.exists) throwHttpError('User profile was not found.', 404);

    const user = userDoc.data();
    if (user.uid !== decodedToken.uid) throwHttpError('Invalid user token.', 401);

    return { ...user, username, uid: decodedToken.uid };
}

const getTopBidSnapshot = (db, productId) => (
    db
        .collection(`products/${productId}/bids`)
        .orderBy('price', 'desc')
        .limit(1)
        .get()
);

const placeBid = async ({ db, user, body }) => {
    const productId = String(body?.productId || '').trim();
    if (!productId) throwHttpError('Product id is required.', 400);

    const price = normalizePrice(body.price);
    const productRef = db.doc(`products/${productId}`);

    return db.runTransaction(async transaction => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) throwHttpError("Product doesn't exist anymore.", 404);

        const product = productDoc.data();
        if (product.uid === user.uid) throwHttpError('Owners cannot bid on their own auctions.', 403);
        if (product.status !== 'Active') throwHttpError('Auction is not active.', 409);

        const expiresAt = getAuctionExpiry(product);
        if (Date.now() >= expiresAt) throwHttpError('Auction has expired.', 409);

        const topBidSnapshot = await transaction.get(
            db.collection(`products/${productId}/bids`).orderBy('price', 'desc').limit(1)
        );
        const topBid = topBidSnapshot.docs[0]?.data();
        const minimumPrice = Math.max(Number(product.price) || 0, Number(topBid?.price) || 0) + 1;
        if (price < minimumPrice) throwHttpError(`Price must be at least ${minimumPrice}.`, 400);

        transaction.set(db.doc(`products/${productId}/bids/${user.username}`), {
            date: Date.now(),
            price,
            uid: user.uid
        }, { merge: true });

        transaction.set(productRef, {
            currentBid: {
                username: user.username,
                uid: user.uid,
                price
            },
            expiresAt
        }, { merge: true });

        return { message: 'You have successfully bid.', minimumPrice, price };
    });
}

const finalizeAuction = async ({ db, FieldValue, user, body }) => {
    const productId = String(body?.productId || '').trim();
    if (!productId) throwHttpError('Product id is required.', 400);

    const productRef = db.doc(`products/${productId}`);
    const now = Date.now();

    const result = await db.runTransaction(async transaction => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) throwHttpError("Product doesn't exist anymore.", 404);

        const product = productDoc.data();
        if (product.uid !== user.uid) throwHttpError('Only the seller can finalize this auction.', 403);

        const expiresAt = getAuctionExpiry(product);
        if (!product.expiresAt) {
            transaction.set(productRef, { expiresAt, status: 'Active' }, { merge: true });
        }

        if (product.status === 'Finalized' || product.status === 'Expired') {
            return { message: 'Auction is already closed.', status: product.status, expiresAt };
        }

        if (now < expiresAt) {
            return { message: 'Auction expiry has been scheduled.', status: 'Active', expiresAt };
        }

        const topBidSnapshot = await transaction.get(
            db.collection(`products/${productId}/bids`).orderBy('price', 'desc').limit(1)
        );
        const topBidDoc = topBidSnapshot.docs[0];

        if (!topBidDoc) {
            transaction.set(productRef, {
                status: 'Expired',
                closedAt: now,
                expiresAt
            }, { merge: true });
            return { message: 'Auction expired with no bids.', status: 'Expired', expiresAt };
        }

        const winningBid = topBidDoc.data();
        const winnerUsername = topBidDoc.id;
        const winnerDoc = await transaction.get(db.doc(`users/${winnerUsername}`));
        const winner = winnerDoc.exists ? winnerDoc.data() : {};

        const winnerSummary = {
            username: winnerUsername,
            uid: winningBid.uid,
            email: winner.email || null,
            phoneNumber: winner.phoneNumber || null,
            price: winningBid.price
        };

        transaction.set(productRef, {
            status: 'Finalized',
            closedAt: now,
            expiresAt,
            winner: winnerSummary
        }, { merge: true });

        const sellerNotificationRef = db.collection(`users/${user.username}/notifications`).doc();
        const buyerNotificationRef = db.collection(`users/${winnerUsername}/notifications`).doc();

        transaction.set(sellerNotificationRef, {
            type: 'auction-finalized',
            productId,
            title: product.title || '',
            winner: winnerSummary,
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

        transaction.set(buyerNotificationRef, {
            type: 'auction-won',
            productId,
            title: product.title || '',
            seller: {
                username: user.username,
                email: user.email || null,
                phoneNumber: user.phoneNumber || null
            },
            price: winningBid.price,
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

        return { message: 'Auction finalized.', status: 'Finalized', expiresAt, winner: winnerSummary };
    });

    return result;
}

module.exports = {
    authenticateUser,
    finalizeAuction,
    getAuctionExpiry,
    getBearerToken,
    getTopBidSnapshot,
    normalizePrice,
    placeBid
};

const { HttpError } = require('./_errors');
const { getFirebaseAdmin } = require('./_firebaseAdmin');
const { authenticateUser } = require('./_auctionService');

const sendJson = (res, statusCode, body) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify(body));
}

const createHandler = action => async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'POST, OPTIONS');
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJson(res, 405, { message: 'Method not allowed.' });
        return;
    }

    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!/^Bearer\s+.+/i.test(authHeader)) {
        sendJson(res, 401, { message: 'Authorization token is required.' });
        return;
    }

    try {
        const firebase = getFirebaseAdmin();
        const user = await authenticateUser({ ...firebase, req });
        const result = await action({ ...firebase, user, body: req.body || {} });
        sendJson(res, 200, result);
    } catch (error) {
        const statusCode = error instanceof HttpError ? error.statusCode : 500;
        sendJson(res, statusCode, {
            message: statusCode === 500 ? 'Unexpected server error.' : error.message
        });
    }
}

module.exports = { createHandler };

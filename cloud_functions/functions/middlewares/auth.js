const { db, auth } = require('../firebase');
const throwError = require('../utils/throwError');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        const token = authHeader.split(' ')[1];
        const username = req.body.username;
        if (!username) throwError('Username is required!', 403);
        const decodedToken = await auth.verifyIdToken(token);
        const user = (await db.doc(`users/${username}`).get()).data();
        if (user.uid !== decodedToken.uid) throwError('Invalid token!', 401);
        user.username = username;
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}
const db = require('../firebase').db;
const throwError = require('../utils/throwError');

module.exports = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const productSnapShot = (await db.doc(`products/${productId}`).get());
        if (!productSnapShot.exists) throwError("Product doesn't exist anymore!", 404);
        req.product = productSnapShot.data();
        req.product.id = productId;
        next()
    }
    catch (err) {
        next(err);
    }
}
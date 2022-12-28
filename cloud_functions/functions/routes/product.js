const authMiddleware = require('../middlewares/auth');
const productMiddleware = require('../middlewares/product');
const db = require('../firebase').db;
const throwError = require('../utils/throwError');
const cron = require('node-cron');
const sendEmail = require('../utils/sendEmail');

const router = require('express').Router();


const priceValidator = (req, res, next) => {
    const price = req.body.price;
    if (!price || !+price || price <= 0) throwError('Invalid Price Value', 403);
    next();
}

router.post('/bid-product', priceValidator, authMiddleware, productMiddleware, (req, res) => {
    const { productId, username, price } = req.body;
    db.doc(`products/${productId}/bids/${username}`).set({ date: new Date().getTime(), price, uid: req.user.uid })
        .then(() => res.status(201).json({ message: 'You have successfully bid' }))
        .catch(err => next(err));
})

router.post('/expire-product', authMiddleware, productMiddleware, (req, res, next) => {
    try {
        const { product, user } = req;
        if (product.uid !== user.uid) throwError('You are not allowed', 405);
        const date = new Date(product.date);
        date.setDate(date.getDay() + product.duration);
        const expiry = `0 0 ${date.getDate()} ${date.getMonth() + 1} *`;
        const job = cron.schedule(expiry, () => {
            const productDeleteHandler = () => {
                const productRef = `products/${product.id}`;
                const promise = [];
                const parentPromise = [
                    db.collection(`${productRef}/bids`).get().then(snapshot => snapshot.docs.forEach(doc => promise.push(db.doc(`${productRef}/bids/${doc.id}`).delete()))),
                    db.collection(`${productRef}/comments`).get().then(snapshot => snapshot.docs.forEach(doc => promise.push(db.doc(`${productRef}/comments/${doc.id}`).delete())))
                ]
                promise.push(db.doc(productRef).delete());
                Promise.all(parentPromise)
                    .then(() => Promise.all(promise))
            }

            db.collection(`products/${product.id}/bids`).orderBy('price', 'desc').limit(1).get()
                .then(snapshot => {
                    const doc = snapshot.docs[0];
                    if (!doc) throwError('Product is not sold!', 410);
                    return db.doc(`users/${doc.id}`).get();
                })
                .then(buyerDoc => {
                    const buyer = buyerDoc.data();
                    sendEmail.send({
                        to: buyer.email,
                        from: 'm.ubaidbadar@gmail.com',
                        subject: `Congratulations, you have won bid of ${product.title}!`,
                        html: `
                            You have successfully won the bid on <b>${product.title}</b>.
                            Now, you can buy this product in <b>${product.price}</b> by contacting to the seller through 
                            his phone number <a href="tel:${user.phoneNumber}">${user.phoneNumber}</a> 
                            or his email <a href="mailto:${user.email}">${user.email}</a>
                        `
                    })
                    return sendEmail.send({
                        to: user.email,
                        from: 'm.ubaidbadar@gmail.com',
                        subject: `Congratulations, your product ${product.title} bid has been finalized at ${product.price}!`,
                        html: `
                            You can contact to the winner of this bid through 
                            his phone number <a href="tel:${buyer.phoneNumber}">${buyer.phoneNumber}</a> 
                            or his email <a href="mailto:${buyer.email}">${buyer.email}</a>
                        `
                    })
                })
                .then(productDeleteHandler)
                .catch(err => {
                    if (err.status === 410) productDeleteHandler();
                    else db.collection(`errors`).add({ ...err, date: new Date() });
                });
            job.stop();
        }, { scheduled: true, timezone: 'America/New_York' });
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        next(err);
    }
})


module.exports = router;
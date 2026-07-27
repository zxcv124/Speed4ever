const throwError = require("./throwError");

const getData = async (req) => {
    if (req.method !== 'POST') throwError('Method not allowed!', 405);
    const { username, productId } = req.body;

    if (!username) throwError('Username is required!', 403);
    if (!productId) return throwError('ProcuctId is required!', 403);

    const userRef = await db.doc(`users/${username}`).get()
    const user = userRef.data();
    if (!user) throwError('User not found!', 404);
}

module.exports = getData;
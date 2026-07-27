const firebase = require('firebase-admin');

firebase.initializeApp();


const auth = firebase.auth();
const db = firebase.firestore();

module.exports = { auth, db };

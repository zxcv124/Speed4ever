const firebase = require('firebase-admin');

firebase.initializeApp({
    apiKey: "AIzaSyCpvheGojmm1cLDrHLSPc-_DgPRiLvHhTI",
    authDomain: "speed-4-ever.firebaseapp.com",
    projectId: "speed-4-ever",
    storageBucket: "speed-4-ever.appspot.com",
    messagingSenderId: "890686113603",
    appId: "1:890686113603:web:b79f8e9aae680f57bf51f6"
})


const auth = firebase.auth();
const db = firebase.firestore();

module.exports = { auth, db };
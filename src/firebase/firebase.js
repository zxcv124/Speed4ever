import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebase = initializeApp({
    apiKey: "AIzaSyCpvheGojmm1cLDrHLSPc-_DgPRiLvHhTI",
    authDomain: "speed-4-ever.firebaseapp.com",
    projectId: "speed-4-ever",
    storageBucket: "speed-4-ever.appspot.com",
    messagingSenderId: "890686113603",
    appId: "1:890686113603:web:b79f8e9aae680f57bf51f6"
});

export const auth = getAuth(firebase);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, provider);


export const db = getFirestore(firebase);
export default firebase;

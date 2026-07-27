import firebase from "./firebase";
import { doc as document, getFirestore, getDoc, setDoc, collection, addDoc, onSnapshot } from "firebase/firestore";
import getAbsDate from "../utils/getDate";
import { auth } from "./auth";

const db = getFirestore(firebase);

const doc = path => document(db, path);


export const getDOC = path => getDoc(doc(path));
export const getCollection = path => collection(db, path);


const getData = data => {
    const { displayName, uid } = auth.currentUser;
    if (displayName) data.displayName = displayName;
    return { ...data, uid, date: getAbsDate().getTime() }
}

export const addDOC = ({ path, ...data }) => addDoc(getCollection(path), getData(data));
export const setDOC = ({ path, merge = true, ...data }) => setDoc(doc(path), getData(data), { merge })
export const getSnapShot = (path, cb, errcb) => onSnapshot(getCollection(path), cb, errcb)
import firebase from "./firebase";
import {
    getAuth,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    updateEmail,
    updateProfile
} from "firebase/auth";
import { getDOC, setDOC } from "./db";
import { onUploadFile } from "./storage";

export const auth = getAuth(firebase);

export const getRecaptcha = (id, cb, ecb) => {
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(id, {
        'size': 'invisible',
        'callback': cb,
        'expired-callback': ecb
    }, auth);
    return window.recaptchaVerifier.render();
}

export const normalizePhoneNumber = phoneNumber => {
    const value = String(phoneNumber || '').replace(/[^\d+]/g, '');
    if (value.startsWith('+')) return value;
    if (value.startsWith('00')) return `+${value.slice(2)}`;
    if (value.startsWith('0')) return `+971${value.slice(1)}`;
    if (value.startsWith('5')) return `+971${value}`;
    return value;
}

export const onAuthUserChanged = cb => onAuthStateChanged(auth, cb);

export const signOutUser = () => signOut(auth);

export const resetRecaptcha = () => {
    if (!window.recaptchaVerifier) return Promise.resolve();

    return window.recaptchaVerifier
        .render()
        .then(widgetId => {
            if (window.grecaptcha) window.grecaptcha.reset(widgetId);
        })
        .catch(() => undefined);
}

export const onLogin = phoneNumber => signInWithPhoneNumber(
    auth,
    normalizePhoneNumber(phoneNumber),
    window.recaptchaVerifier
);

export const onSaveUser = formProps => {

    const { username, profilePicture, email } = formProps.values;

    const displayName = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const user = auth.currentUser;
    const path = `users/${displayName}`;

    const isPicture = profilePicture.length > 0;

    updateEmail(user, email)
        .then(() => getDOC(path))
        .then(snapshop => {
            if (snapshop.exists()) throw Error("Username is already in used!")
        })
        .then(() => isPicture && onUploadFile(profilePicture[0]))
        .then(url => {
            const data = { displayName };
            if (url) data.photoURL = url;
            Promise.all([
                updateProfile(user, data),
                setDOC({ ...data, email, path, phoneNumber: user.phoneNumber }),
            ])
        })
        .then(formProps.onSuccess)
        .catch((err) => {
            if (err.message === "Firebase: Error (auth/requires-recent-login).") {
                setTimeout(() => {
                    signOutUser();
                }, 1000)
                return formProps.onFailure({ message: "You need to login 1 more time!" });
            }
            formProps.onFailure(err)
        })

}

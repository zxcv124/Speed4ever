import { getDOC, setDOC } from './db';
import { onUploadFile } from './storage';
import supabase from './client';

let currentUser = null;

const normalizeUser = (user, session) => {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const displayName = metadata.displayName || metadata.username || '';

    return {
        ...user,
        uid: user.id,
        displayName,
        photoURL: metadata.photoURL || '',
        phoneNumber: user.phone || metadata.phoneNumber || '',
        accessToken: session?.access_token || '',
        metadata
    };
}

const setCurrentUser = (user, session) => {
    currentUser = normalizeUser(user, session);
    return currentUser;
}

export const auth = {
    get currentUser() {
        return currentUser;
    }
};

export const getRecaptcha = () => Promise.resolve();

export const resetRecaptcha = () => Promise.resolve();

export const onAuthUserChanged = cb => {
    supabase.auth.getSession().then(({ data }) => {
        cb(setCurrentUser(data.session?.user, data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        cb(setCurrentUser(session?.user, session));
    });

    return () => data.subscription.unsubscribe();
}

export const signOutUser = () => supabase.auth.signOut().then(() => {
    currentUser = null;
});

export const onLogin = email => {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    return supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
            shouldCreateUser: true
        }
    }).then(({ error }) => {
        if (error) throw error;

        return {
            confirm: token => supabase.auth.verifyOtp({
                email: normalizedEmail,
                token,
                type: 'email'
            }).then(({ data, error }) => {
                if (error) throw error;
                setCurrentUser(data.user, data.session);
                return data;
            })
        };
    });
}

export const onSaveUser = formProps => {
    const { username, profilePicture, email } = formProps.values;
    const displayName = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const user = auth.currentUser;
    const path = `users/${displayName}`;
    const isPicture = profilePicture.length > 0;

    if (!user) {
        formProps.onFailure({ message: 'You need to login again.' });
        return;
    }

    getDOC(path)
        .then(snapshot => {
            const existing = snapshot.data();
            if (snapshot.exists() && existing.uid !== user.uid) throw Error('Username is already in use.');
        })
        .then(() => isPicture ? onUploadFile(profilePicture[0]) : user.photoURL)
        .then(photoURL => {
            const data = {
                displayName,
                email,
                photoURL: photoURL || '',
                phoneNumber: user.phoneNumber || ''
            };

            return Promise.all([
                supabase.auth.updateUser({
                    email,
                    data: {
                        displayName,
                        username: displayName,
                        photoURL: data.photoURL
                    }
                }),
                setDOC({ ...data, path })
            ]);
        })
        .then(() => supabase.auth.getSession())
        .then(({ data }) => setCurrentUser(data.session?.user, data.session))
        .then(formProps.onSuccess)
        .catch(formProps.onFailure);
}

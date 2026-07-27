import { getDOC, setDOC } from './db';
import { onUploadFile } from './storage';
import supabase, { isSupabaseConfigured } from './client';

let currentUser = null;

const GUEST_USERNAME_PREFIX = 'guest';
const LOCAL_GUEST_STORAGE_KEY = 'speed4ever-local-guest-user';
const LOCAL_GUEST_AUTH_EVENT = 'speed4ever-local-guest-auth';

const getGuestUsername = userId => `${GUEST_USERNAME_PREFIX}${String(userId || '').replace(/-/g, '').slice(0, 12)}`;

const getLocalGuestId = () => {
    const stored = localStorage.getItem(LOCAL_GUEST_STORAGE_KEY);
    if (stored) return JSON.parse(stored).uid;

    const uid = `local-${window.crypto?.randomUUID?.() || Date.now()}`;
    localStorage.setItem(LOCAL_GUEST_STORAGE_KEY, JSON.stringify({ uid }));
    return uid;
}

const getLocalGuestUser = () => {
    const uid = getLocalGuestId();
    return {
        id: uid,
        uid,
        displayName: 'guest',
        photoURL: '',
        phoneNumber: '',
        accessToken: `local-guest:${uid}`,
        metadata: { isGuest: true },
        isGuest: true,
        isLocalGuest: true
    };
}

const notifyLocalGuestAuthChange = () => window.dispatchEvent(new Event(LOCAL_GUEST_AUTH_EVENT));

const normalizeUser = (user, session) => {
    if (!user) return null;
    if (user.isLocalGuest) return user;

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
    if (!isSupabaseConfigured) {
        const onLocalAuthChange = () => cb(currentUser);
        const stored = localStorage.getItem(LOCAL_GUEST_STORAGE_KEY);
        cb(stored ? setCurrentUser(getLocalGuestUser()) : null);
        window.addEventListener(LOCAL_GUEST_AUTH_EVENT, onLocalAuthChange);
        return () => window.removeEventListener(LOCAL_GUEST_AUTH_EVENT, onLocalAuthChange);
    }

    supabase.auth.getSession().then(({ data }) => {
        cb(setCurrentUser(data.session?.user, data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        cb(setCurrentUser(session?.user, session));
    });

    return () => data.subscription.unsubscribe();
}

export const signOutUser = () => {
    if (!isSupabaseConfigured) {
        localStorage.removeItem(LOCAL_GUEST_STORAGE_KEY);
        currentUser = null;
        notifyLocalGuestAuthChange();
        return Promise.resolve();
    }

    return supabase.auth.signOut().then(() => {
        currentUser = null;
    });
}

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

export const onGuestLogin = async () => {
    if (!isSupabaseConfigured) {
        const user = setCurrentUser(getLocalGuestUser());
        notifyLocalGuestAuthChange();
        return user;
    }

    let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    let user = sessionData.session?.user;
    let session = sessionData.session;

    if (!user || !user.is_anonymous) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        user = data.user;
        session = data.session;
    }

    const displayName = user.user_metadata?.displayName || user.user_metadata?.username || getGuestUsername(user.id);
    const profile = {
        username: displayName,
        uid: user.id,
        display_name: displayName,
        email: null,
        phone_number: null,
        photo_url: '',
        date: Date.now()
    };

    const { error: profileError } = await supabase
        .from('users')
        .upsert(profile, { onConflict: 'username' });

    if (profileError) throw profileError;

    const { data: updated, error: updateError } = await supabase.auth.updateUser({
        data: {
            displayName,
            username: displayName,
            isGuest: true
        }
    });

    if (updateError) throw updateError;

    const { data: refreshed } = await supabase.auth.getSession();
    return setCurrentUser(updated.user || user, refreshed.session || session);
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

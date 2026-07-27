import { createContext, useEffect, useRef, useState } from 'react';
import ProfileForm from '../components/ProfileForm/ProfileForm';
import { auth, onAuthUserChanged, signOutUser } from '../supabase/auth';

const AuthContext = createContext({ user: null });

export const AuthContextProvider = ({ children }) => {

    const [user, setUser] = useState("loading");
    const timerRef = useRef(null);

    const isInvalid = user && user !== 'loading' && !user.displayName;

    useEffect(() => {
        const authUnSubscription = onAuthUserChanged(currentUser => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (currentUser) {
                if (!currentUser.displayName) {
                    const date = new Date();
                    let futureTime = localStorage.getItem('expiry-time');
                    if (!futureTime) {
                        futureTime = date.getTime() + 15 * 60 * 1000;
                        localStorage.setItem('expiry-time', futureTime);
                    }
                    timerRef.current = setTimeout(() => {
                        localStorage.clear();
                        signOutUser();
                    }, Math.max(Number(futureTime) - new Date().getTime(), 0));
                }
            }
            setUser(currentUser);
        })
        return () => {
            authUnSubscription();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [])

    const onUserStateChange = () => {
        setUser("loading");
        setTimeout(() => {
            setUser(auth.currentUser);
        }, 1000)
    }
    return (
        <AuthContext.Provider value={{ user }}>
            {isInvalid ? <ProfileForm onSuccess={onUserStateChange} /> : children}
        </AuthContext.Provider>
    )
}


export default AuthContext;

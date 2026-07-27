import { useEffect, useState } from "react";
import { getDOC } from "../supabase/db";
import { auth } from "../supabase/auth";

const useDoc = (path, getUserInfo) => {
    const [status, setStatus] = useState({ isLoading: true });
    useEffect(() => {
        getDOC(path)
            .then(doc => {
                const data = doc.data();
                if (!data) throw Error("404!, Page not found!")
                data.id = doc.id;
                data.owner = auth.currentUser?.uid === data.uid;
                if (getUserInfo) getDOC(`users/${data.displayName}`).then(doc => setStatus({ data: { ...data, user: doc.data()} }))
                else setStatus({ data });
            })
            .catch(err => setStatus({ err: err.message }))
    }, [getUserInfo, path])
    return [status, setStatus];
}

export default useDoc;

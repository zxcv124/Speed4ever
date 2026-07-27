import { useEffect, useState } from "react"
import { getSnapShot } from "../../firebase/db";
import ProfileImage from "../ProfileImage/ProfileImage";

const Comments = ({ productId, path }) => {
    const [{ isLoading, err, comments = [] }, setStatus] = useState({ isLoading: true });
    useEffect(() => {
        const unSubscription = getSnapShot(`${path}/${productId}/comments`, ({ docs }) => {
            const newComments = docs.map(doc => {
                const comment = doc.data();
                comment.id = doc.id;
                return comment
            })
            setStatus({ comments: newComments, isLoading: false });
        }, err => setStatus({ err: err.message }));
        return () => unSubscription();
    }, [path, productId])
    return isLoading ? <div className="m-auto loader" role="status" aria-label="Loading comments"></div> : err ? <h1 className="m-0">{err}</h1> : comments.map(comment => (
        <div className='d-flex gap-lg-4 gap-3' key={comment.id}>
            <p className="m-0 border flex-1 b-radius-3 mb-auto p-3">{comment.comment}</p>
            <ProfileImage username={comment.displayName} src={comment.photoURL} />
        </div>
    ))
}

export default Comments;

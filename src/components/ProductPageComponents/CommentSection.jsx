import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { addDOC } from "../../firebase/db";
import Form from "../../hoc/Form";
import TextArea from "../../ui/TextArea/TextArea";
import ProfileImage from "../ProfileImage/ProfileImage";
import Comments from "./Comments";

const CommentSection = ({ path, productId }) => {
    const user = useContext(AuthContext).user;
    const onSubmit = props => {
        const { values, onSuccess, onFailure } = props;
        if (user.photoURL) values.photoURL = user.photoURL;
        addDOC({ ...values, path: `${path}/${productId}/comments` })
            .then(() => onSuccess())
            .catch(onFailure);
    }
    return (
        <div className="d-grid mt-5 gap-4">
            <p className="my-0 py-1 me-auto px-4 b-radius-3 bg-secondary">التعليقــــــات</p>
            <Comments path={path} productId={productId} />
            <div className='d-flex gap-lg-4 gap-3'>
                <Form onSubmit={onSubmit}
                    className="p-relative flex-1"
                    footer={isLoading => (
                        <div className="p-absolute bottom-0 start-0 mb-5 pb-md-1 mx-3">
                            <button className="btn-primary">Post</button>
                        </div>
                    )}
                >
                    <TextArea rows={4} className='flex-1' required={true} minLength={3} helperText="Min. 3 characters long!" name='comment' />
                </Form>
                <ProfileImage src={user.photoURL} username={user.displayName} />
            </div>
        </div>
    )
}

export default CommentSection;
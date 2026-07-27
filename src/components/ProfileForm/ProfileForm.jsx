import { Link } from "react-router-dom";
import logo from '../../assets/fulllogo.png'
import Form from "../../hoc/Form";
import TextField from "../../ui/TextField/TextField";
import UploadImage from "../../ui/UploadImage/UploadImage";
import styles from './ProfileForm.module.scss';
import userlogo from '../../assets/user-logo.svg';
import { onSaveUser } from "../../firebase/auth";

const ProfileForm = ({ onSuccess }) => {
    const onSubmit = formProps => {
        formProps.onSuccess = onSuccess;
        onSaveUser(formProps);
    }
    return (
        <div className="p-md-5 p-4 min-vh-100 d-flex flex-column">
            <div className="flex-1 d-flex flex-column gap-5 p-relative">
                <Link to='/' className="ms-auto">
                    <img alt="" src={logo} className="logo" />
                </Link>
                <Form
                    className='d-flex flex-column gap-4 mx-md-auto my-auto'
                    onSubmit={onSubmit}
                    footer={isLoading => (
                        <>
                            <div className="p-absolute start-0 top-0 mt-1 mt-md-2 mt-lg-3">
                                {isLoading ? <span className="loader tx-primary"></span> : <button className="btn-text">Save</button>}
                            </div>
                        </>
                    )}
                >
                    <UploadImage name='profilePicture' icon={<img alt="" src={userlogo} />} className={`${styles.uploadImage} mx-auto`} />
                    <TextField
                        label='Username'
                        name='username'
                        pattern="[a-zA-Z0-9]+$"
                        required={true}
                        helperText={<span className="ps-5">Shouldn't contain spaces and special characters. e.g., ubaidbadar333 </span>}
                    />
                    <TextField
                        label='Email'
                        name='email'
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                        required={true}
                        helperText='e.g., m.ubaidbadarbadar@gmail.com'
                    />
                </Form>
            </div>
        </div>
    )
}

export default ProfileForm;
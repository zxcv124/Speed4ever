import { useMemo, useState } from 'react';
import logo from '../../assets/fulllogo.png'
import PhoneForm from '../../components/LoginPageComponents/PhoneForm';
import OTPForm from '../../components/LoginPageComponents/OTPForm';
import BackButton from '../../BackButton/BackButton';

const LoginPage = () => {
    const [details, setDetails] = useState({});
    return (
        <div className={`vh-100 p-md-5 p-4 d-flex gap-4 flex-column`}>
            {useMemo(() => (
                <div className='d-flex ai-center'>
                    <BackButton />
                    <img src={logo} alt="" className='logo' />
                </div>
            ), [])}
            {details.status ? <OTPForm {...details} /> : <PhoneForm {...details} onSubmit={setDetails} />}
        </div>
    )
}

export default LoginPage;

import { useState } from "react";
import Countdown from 'react-countdown';
import { onLogin } from "../../supabase/auth";
import Checked from "../../icons/Checked";

const Main = ({ phoneNumber, onPhoneSubmit }) => {
    const [{ loading, sent, err }, setStatus] = useState({});

    const sendOTPAgainHandler = () => {
        setStatus({ loading: true });
        onLogin(phoneNumber)
            .then(confirmation => onPhoneSubmit({ confirmation, phoneNumber, status: true }))
            .catch(err => setStatus({ err }))

    }
    return err ? <span className="tx-danger">{err.message}</span> :
        loading ? <span className="loader"></span> : (
            <div className="d-flex">
                <button className="tx-primary btn-text" onClick={sendOTPAgainHandler}>Send Again {sent && <Checked className='w-1' />}</button>
            </div>
        )
}

const SendOTPAgain = props => {
    return (
        <Countdown date={Date.now() + 60000}>
            <Main {...props} />
        </Countdown>
    )
}

export default SendOTPAgain;

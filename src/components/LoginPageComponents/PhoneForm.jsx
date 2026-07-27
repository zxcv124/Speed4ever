import { useState } from 'react';
import { onGuestLogin, onLogin } from '../../supabase/auth';
import Form from '../../hoc/Form';
import TextField from '../../ui/TextField/TextField';

const PhoneForm = ({ onSubmit, phoneNumber }) => {
    const [guestStatus, setGuestStatus] = useState({});
    const isGuestEnabled = process.env.REACT_APP_ENABLE_GUEST_ACCESS !== 'false';

    const onPhoneSubmit = props => {
        const email = props.values.email;
        onLogin(email)
            .then(confirmation => {
                onSubmit({ confirmation, phoneNumber: email, status: true });
                props.onSuccess();
            })
            .catch(props.onFailure);
    }

    const onGuestSubmit = () => {
        if (guestStatus.isLoading) return;

        setGuestStatus({ isLoading: true });
        onGuestLogin()
            .then(() => setGuestStatus({}))
            .catch(err => setGuestStatus({ err }));
    }

    return (
        <Form
            onSubmit={onPhoneSubmit}
            className='flex-1 mt-lg-5 d-flex flex-column gap-inherit'
            footer={(isLoading, id) => (
                <button
                    id={id}
                    className='btn-primary mt-md-0 me-md-auto mt-auto'
                    loading={isLoading ? "loading" : ""}
                    disabled={isLoading || guestStatus.isLoading}

                >Send OTP</button>
            )}>
            <TextField
                defaultValue={phoneNumber}
                label='Email Address'
                name='email'
                type='email'
                inputMode='email'
                autoComplete='email'
                required={true}
                errorText='Enter a valid email address.'
                className='mx-auto w-100'
            />
            {isGuestEnabled && (
                <button
                    type='button'
                    className='btn-primary bg-secondary me-md-auto'
                    loading={guestStatus.isLoading ? "loading" : ""}
                    disabled={guestStatus.isLoading}
                    onClick={onGuestSubmit}
                >Continue as Guest</button>
            )}
            {guestStatus.err && <small className='tx-danger'>{guestStatus.err.message || guestStatus.err}</small>}
        </Form>
    )
}

export default PhoneForm;

import { onLogin } from '../../supabase/auth';
import Form from '../../hoc/Form';
import TextField from '../../ui/TextField/TextField';

const PhoneForm = ({ onSubmit, phoneNumber }) => {
    const onPhoneSubmit = props => {
        const email = props.values.email;
        onLogin(email)
            .then(confirmation => {
                onSubmit({ confirmation, phoneNumber: email, status: true });
                props.onSuccess();
            })
            .catch(props.onFailure);
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
                    disabled={isLoading}

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
        </Form>
    )
}

export default PhoneForm;

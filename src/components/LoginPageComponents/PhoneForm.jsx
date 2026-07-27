import { onLogin, resetRecaptcha } from '../../firebase/auth';
import Form from '../../hoc/Form';
import TextField from '../../ui/TextField/TextField';

const PhoneForm = ({ onSubmit, phoneNumber }) => {
    const onPhoneSubmit = props => {
        const phoneNumber = props.values.phoneNumber;
        onLogin(phoneNumber)
            .then(confirmation => {
                onSubmit({ confirmation, phoneNumber, status: true });
                props.onSuccess();
            })
            .catch(err => {
                resetRecaptcha().finally(() => props.onFailure(err));
            });
    }
    return (
        <Form
            onSubmit={onPhoneSubmit}
            isRecaptcha={true}
            id='sign-in-button'
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
                label='Phone Number'
                name='phoneNumber'
                type='tel'
                inputMode='tel'
                autoComplete='tel'
                required={true}
                pattern='^(\\+971|00971|0)?5[0-9]{8}$|^\\+[1-9][0-9]{7,14}$'
                errorText='Enter a valid UAE mobile number or international number with country code.'
                className='mx-auto w-100'
            />
        </Form>
    )
}

export default PhoneForm;

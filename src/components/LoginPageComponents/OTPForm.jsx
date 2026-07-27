import Form from '../../hoc/Form';
import TextField from '../../ui/TextField/TextField';

const OTPForm = ({ confirmation, phoneNumber }) => {
    const onOTPSubmit = props => {
        confirmation.confirm(props.values.otp)
            .catch(props.onFailure);
    }
    return (
        <Form
            onSubmit={onOTPSubmit}
            id='sign-in-button'
            className='flex-1 mt-lg-5 d-flex flex-column gap-inherit'
            footer={(isLoading, id) => (
                <button
                    id={id}
                    className='btn-primary mt-md-0 me-md-auto mt-auto'
                    loading={isLoading ? "loading" : ""}
                    disabled={isLoading}

                >Save OTP</button>
            )}>
            <TextField
                label='OTP'
                name='otp'
                className='mx-auto w-100'
            />
            <small>We have sent you 6 digits confirmation code on your mobile {phoneNumber}</small>
        </Form>
    )
}

export default OTPForm;
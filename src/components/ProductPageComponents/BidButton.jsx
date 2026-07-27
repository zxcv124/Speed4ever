import { useContext } from "react";
import { bidProduct } from "../../api/product";
import AuthContext from "../../context/AuthContext";
import Form from "../../hoc/Form";
import useDoc from "../../hooks/useDoc";
import TextField from "../../ui/TextField/TextField";

const BidButton = props => {
    const user = useContext(AuthContext).user;
    const [{ isLoading, data }, setStatus] = useDoc(`products/${props.id}/bids/${user.displayName}`);

    const onSubmit = ({ values, onSuccess, onFailure }) => {
        bidProduct(user.accessToken, user.displayName, values.price, props.id)
            .then(res => {
                setStatus({ data: {...data, price: values.price} });
                onSuccess('You have successfully bid!');
            })
            .catch(onFailure);
    }

    const minPrice = (data?.price || props.price) + 1;

    return !isLoading && (
        <Form onSubmit={onSubmit} className='d-grid gap-1' footer={isLoading => (
            <div className='d-flex gap-3' style={{ gridRow: '1/2' }}>
                <TextField
                    required
                    min={minPrice}
                    defaultValue={minPrice}
                    name='price'
                    className='flex-1'
                    type='number'
                    errorText={`Price must be greater than ${minPrice - 1}`}
                />
                <button disabled={isLoading} className="btn-primary mb-auto bg-dark tx-light">
                    {isLoading ? <span className="loader"></span> : 'Bid'}
                </button>
            </div>
        )}>
        </Form>
    )
}

export default BidButton;

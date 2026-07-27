import { useNavigate, useSearchParams } from 'react-router-dom';
import img1 from '../../assets/Group 858.png';
import { addDOC, setDOC } from '../../supabase/db';
import Form from '../../hoc/Form';
import Select from '../../ui/Select/Select';
import TextArea from '../../ui/TextArea/TextArea';
import TextField from '../../ui/TextField/TextField';
import styles from './SellPage.module.scss';

const SellPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const onSubmit = formData => {
        const { values, onFailure } = formData;
        values.status = 'Inactive';
        const id = searchParams.get('id');
        (id ? setDOC({ ...values, path: `products/${id}` }) : addDOC({ ...values, path: 'products' }))
            .then(doc => {
                values.id = doc?.id || id;
                navigate(`upload-images/${values.id}`)
            })
            .catch(onFailure)
    }
    return (
        <div className="p-lg-5 p-4 p-relative z-index-1">
            <Form onSubmit={onSubmit}
                className='d-grid gap-4'
                footer={isLoading => (
                    <div className='d-flex jc-between'>
                        <button className='btn-primary px-5 bg-dark tx-light' disabled={isLoading} loading={isLoading ? 'loading' : ''}>Post</button>
                        <button className='btn-primary px-5 bg-secondary' type='button' onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                )}
            >
                <div className={`d-flex jc-between gap-5 ${styles.main}`}>
                    <div className='flex-1 d-flex flex-column'>
                        <img alt='' src={img1} className={styles.logo} />
                    </div>
                    <div className='d-grid gap-4 mb-auto'>
                        <p className='m-0 bg-secondary text-center p-2 fw-mediam b-radius-2'>
                            <span className='py-1 d-block'>Auction Forum</span>
                        </p>
                        <TextField
                            required={true}
                            minLength={3}
                            label='Item name'
                            type='text'
                            name='title'
                            helperText='Min 3. characters long'
                            defaultValue={searchParams.get('title') || ''}
                        />
                        <TextField
                            label='Quantity'
                            min={1}
                            helperText='Min. 1'
                            required={true}
                            type='number'
                            name='qty'
                            defaultValue={searchParams.get('qty') || ''}
                        />
                        <TextField
                            label='Car model'
                            required={true}
                            name='model'
                            defaultValue={searchParams.get('model') || ''}
                        />
                        <TextField label='Price' required={true} type='number' name='price' min={1} defaultValue={searchParams.get('price') || ''} />
                        <Select
                            label='State'
                            name='state'
                            required={true}
                            defaultValue={searchParams.get('state') || ''}
                        >
                            <option value="Good as new">Good as new</option>
                            <option value='Used'>Used</option>
                            <option value="New">New</option>
                        </Select>
                        <Select
                            label='Shipping Cost'
                            name='shipping_cost'
                            defaultValue={searchParams.get('shipping_cost') || ''}
                        >
                            <option value="Free">Free</option>
                            <option value="On Seller">On Seller</option>
                            <option value="On Buyer">On Buyer</option>
                        </Select>
                        <Select
                            label='Shipping Method'
                            name='shipping_method'
                            defaultValue={searchParams.get('shipping_method') || ''}
                        >
                            <option value="Free">By Air</option>
                            <option value="On Seller">By Sea</option>
                            <option value="On Buyer">By Land</option>
                        </Select>
                        <Select
                            label='Location'
                            name='location'
                            defaultValue={searchParams.get('location') || ''}
                        >
                            <option value='UAE'>UAE</option>
                        </Select>
                        <TextField
                            label='Duratation'
                            name='duration'
                            type='number'
                            defaultValue={searchParams.get('duration') || ''}
                            required={true}
                            min={1}
                            max={30}
                        />
                    </div>
                </div>
                <TextArea label='Description' rows={5} className='my-4' name='description' defaultValue={searchParams.get('description') || ''} />
            </Form>
        </div>
    )
}

export default SellPage

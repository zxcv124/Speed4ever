import { useNavigate, useSearchParams } from 'react-router-dom';
import img1 from '../../assets/Group 858.png';
import { addDOC, setDOC } from '../../firebase/db';
import Form from '../../hoc/Form';
import Facebook from '../../icons/Facebook';
import Instagram from '../../icons/Instagram';
import SnapChat from '../../icons/SnapChat';
import Twitter from '../../icons/Twitter';
import WhatsApp from '../../icons/WhatsApp';
import TextArea from '../../ui/TextArea/TextArea';
import TextField from '../../ui/TextField/TextField';
import styles from './PostBlog.module.scss';

const PostBlogPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const onSubmit = formData => {
        const { values, onFailure } = formData;
        values.status = 'Inactive';
        const id = searchParams.get('id');
        (id ? setDOC({ ...values, path: `cars/${id}` }) : addDOC({ ...values, path: 'cars' }))
            .then(doc => {
                values.id = doc?.id || id;
                navigate(`upload-car-images/${values.id}`)
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
                            <span className='py-1 d-block'>My Blog </span>
                        </p>
                        <TextField
                            required={true}
                            minLength={3}
                            label='Owner'
                            type='text'
                            name='owned_by'
                            helperText='Min 3. characters long'
                            defaultValue={searchParams.get('owned_by') || ''}
                        />
                        <TextField
                            label='Model Year'
                            helperText='e.g., 2016'
                            required={true}
                            type='number'
                            name='model_year'
                            defaultValue={searchParams.get('model_year') || ''}
                        />
                        <TextField
                            label='Model'
                            required={true}
                            name='model'
                            defaultValue={searchParams.get('model') || ''}
                        />
                        <TextField
                            label='Kilometers'
                            required={true}
                            type='number'
                            name='kilometers'
                            min={0}
                            defaultValue={searchParams.get('kilometers') || ''}
                        />
                        <TextField
                            label='Color'
                            required={true}
                            type='text'
                            name='color'
                            defaultValue={searchParams.get('color') || ''}
                        />
                        <TextField
                            label='Country'
                            required={true}
                            type='text'
                            name='country'
                            defaultValue={searchParams.get('country') || ''}
                        />

                        <p className='bg-primary py-2 b-radius-2 px-4 text-center'>Contacts</p>
                    </div>
                </div>
                <div className='d-inherit gap-inherit'>
                    <div className='d-flex gap-3 ai-center'>
                        <label className='btn-icon bg-grey-darken-1 tx-light not-hover'><Facebook /></label>
                        <TextField name='facebook' type='text' className='flex-1' defaultValue={searchParams.get('facebook') || ''} placeholder="https://www.facebook.com/" />
                    </div>
                    <div className='d-flex gap-3 ai-center'>
                        <label className='btn-icon bg-grey-darken-1 tx-light not-hover'><Instagram /></label>
                        <TextField name='instagram' type='text' className='flex-1' defaultValue={searchParams.get('instagram') || ''} placeholder="https://www.instagram.com/" />
                    </div>
                    <div className='d-flex gap-3 ai-center'>
                        <label className='btn-icon bg-grey-darken-1 tx-light not-hover'><Twitter /></label>
                        <TextField name='twitter' type='text' className='flex-1'  defaultValue={searchParams.get('twitter') || ''} placeholder="https://www.twitter.com/" />
                    </div>
                    <div className='d-flex gap-3 ai-center'>
                        <label className='btn-icon bg-grey-darken-1 tx-light not-hover'><SnapChat /></label>
                        <TextField name='snapchat' type='text' className='flex-1'  defaultValue={searchParams.get('snapchat') || ''} placeholder="https://www.snapchat.com/" />
                    </div>
                    <div className='d-flex gap-3 ai-center'>
                        <label className='btn-icon bg-grey-darken-1 tx-light not-hover'><WhatsApp /></label>
                        <TextField name='whatsapp' type='text' className='flex-1'  defaultValue={searchParams.get('whatsapp') || ''} placeholder="+923476262068" />
                    </div>
                    <TextArea label='Description' rows={5} name='description' defaultValue={searchParams.get('description') || ''} />
                </div>
            </Form>
        </div>
    )
}

export default PostBlogPage;
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../../assets/Group 118.png'
import UploadImages from '../../components/UploadImages/UploadImages';
import { setDOC } from '../../firebase/db';
import useDoc from '../../hooks/useDoc';
import ArrowBack from '../../icons/ArrowBack';

const UploadCarImagePage = () => {
    const carId = useParams().carId;
    const navigate = useNavigate();

    const [{ isLoading, err, data }] = useDoc(`cars/${carId}`)

    const onSubmit = images => {
        setDOC({ path: `cars/${carId}`, images, status: 'Active' })
            .then(() => navigate(`/blog/${carId}`))
            .catch(err => console.log(err))
    }

    const onBack = () => {
        let to = -1;
        if (data && data.owner) {
            const item = { ...data };
            delete item.images;
            to = '/post-blog?';
            for (let key in item) to += `${key}=${item[key]}&`;
            to = to.replace(/\s/g, '+').slice(0, to.length - 1);
        }
        navigate(to, { replace: true });
    }

    return (
        <div className={`vh-100 p-md-5 p-4 d-flex gap-4 overflow-hidden flex-column`}>
            <div className='d-flex ai-center'>
                <button className='btn-icon no-spacing' onClick={onBack}><ArrowBack /></button>
                <img src={logo} alt="" className='logo' />
            </div>
            {err ? <h1 className='m-auto tx-danger'>{err}</h1> :
                isLoading ? <div className='tx-primary loader m-auto' role="status" aria-label="Loading car images"></div> :
                    data.owner ? <UploadImages onSubmit={onSubmit} {...data} /> : <h1 className='m-auto tx-danger'>404, Page not found!</h1>
            }
        </div>
    )
}

export default UploadCarImagePage;

import BackButton from "../../BackButton/BackButton";
import img1 from '../../assets/Group 118.png';
import styles from './BlogPage.module.scss';
import { useParams } from "react-router-dom";
import useDoc from "../../hooks/useDoc";
import CommentSection from "../../components/ProductPageComponents/CommentSection";
// import ProfileImage from "../../components/ProfileImage/ProfileImage";
import Facebook from '../../icons/Facebook';
import Instagram from '../../icons/Instagram';
import SnapChat from '../../icons/SnapChat';
import Twitter from '../../icons/Twitter';
import WhatsApp from '../../icons/WhatsApp';

const BlogPage = () => {
    const carId = useParams().blogId;
    const [{ data, isLoading, err }] = useDoc(`cars/${carId}`, true);
    return (
        <div className="p-lg-5 p-4 d-flex flex-column min-vh-100 p-relative z-index-1">
            <BackButton />
            {err ? <h1 className="tx-danger m-auto">{err}</h1> : isLoading ? <div className="loader m-auto" role="status" aria-label="Loading blog"></div> : (
                <div>
                    <div className={`pb-4 ${styles.main}`}>
                        <div className='d-flex jc-between gap-5'>
                            <div className='flex-1 d-flex jc-flex'>
                                <div className="text-center">
                                    <img alt='' src={img1} className={styles.logo} />
                                    <h2 className="m-0 fw-normal">{data.user.displayName}</h2>
                                    <div className="d-flex flex-column">
                                        <div className="mx-auto">
                                            <p className="m-0 px-5 opacity-0">Model Year</p>
                                            <p className="bg-primary b-radius-3 m-0">Model</p>
                                            <p className="my-3">{data.model}</p>
                                            <p className="bg-primary b-radius-3 m-0">Color</p>
                                            <p className="my-3">{data.color}</p>
                                            <p className="bg-primary b-radius-3 mt-0">Contacts</p>
                                            <div className="">
                                                <a href={data.facebook} target="_blank" rel="noreferrer" className="btn-icon bg-grey-darken-1 tx-light"><Facebook /></a>
                                                <a href={data.instagram} target="_blank" rel="noreferrer" className="btn-icon bg-grey-darken-1 mx-2 tx-light"><Instagram /></a>
                                                <a href={data.twitter} target="_blank" rel="noreferrer" className="btn-icon bg-grey-darken-1 tx-light"><Twitter /></a> <br />
                                                <a href={data.snapChat} target="_blank" rel="noreferrer" className="btn-icon bg-grey-darken-1 tx-light ms-2"><SnapChat /></a>
                                                <a href={data.snapChat} target="_blank" rel="noreferrer" className="btn-icon bg-grey-darken-1 tx-light"><WhatsApp /></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='d-grid gap-2 pt-5 mt-5 mb-auto text-center'>
                                <p className="m-0 bg-primary b-radius-3">Owner</p>
                                <p className="m-0">{data.owned_by}</p>
                                <p className="bg-primary b-radius-3 mt-2 mb-0 px-5">Model year</p>
                                <p className="m-0">{data.model_year}</p>
                                <p className="bg-primary b-radius-3 mt-2 mb-0">Kilometers</p>
                                <p className="m-0">{data.kilometers}</p>
                                <p className="bg-primary b-radius-3 mt-2 mb-0">Country</p>
                                <p className="m-0">{data.country}</p>
                                <p className="bg-primary b-radius-3 mt-2 mb-0">Discription</p>
                            </div>
                        </div>
                        <p className="mb-0 text-start">{data.description}</p>
                    </div>
                    <div className="my-4">
                        <div className="d-grid col-lg-4 col-md-3 col-sm-2 gap-3">
                            {data.images.map((img, index) => <img alt="" src={img} key={index} className="w-100" />)}
                        </div>
                    </div>
                    <CommentSection path='cars' productId={carId} />
                </div>
            )}

        </div>
    )
}

export default BlogPage;

import BackButton from "../../BackButton/BackButton";
import img1 from '../../assets/Group 858.png';
import styles from './ProductPage.module.scss';
import { Link, useParams } from "react-router-dom";
import useDoc from "../../hooks/useDoc";
import CommentSection from "../../components/ProductPageComponents/CommentSection";
import ProfileImage from "../../components/ProfileImage/ProfileImage";
import BidButton from "../../components/ProductPageComponents/BidButton";

const ProductPage = () => {
    const productId = useParams().productId;
    const [{ data, isLoading, err }] = useDoc(`products/${productId}`, true);
    return (
        <>
            <div className="p-lg-5 p-4 d-flex flex-column min-vh-100 p-relative z-index-1">
                <BackButton />
                {err ? <h1 className="tx-danger m-auto">{err}</h1> : isLoading ? <div className="loader m-auto" role="status" aria-label="Loading product"></div> : (
                    <div>
                        <div className={`pb-4 ${styles.main}`}>
                            <div className='d-flex jc-between gap-5'>
                                <div className='flex-1 d-flex jc-flex'>
                                    <div className="text-center">
                                        <Link to='/auction'>
                                        <img alt='' src={img1} className={styles.logo} />
                                        </Link>
                                        <p>Seller</p>
                                        <ProfileImage className='h2' username={data.user.displayName} />
                                    </div>
                                </div>
                                <div className='d-grid gap-2 mb-auto text-center'>
                                    <p className="m-0 bg-primary b-radius-3">Item name</p>
                                    <p className="m-0">{data.title}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">Quantity</p>
                                    <p className="m-0">{data.qty}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">Car model</p>
                                    <p className="m-0">{data.model}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">Price</p>
                                    <p className="m-0">{data.price}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">State</p>
                                    <p className="m-0">{data.state}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">Shipping Cost</p>
                                    <p className="m-0">{data.shipping_cost}</p>
                                    <p className="bg-primary b-radius-3 px-4 mt-2 mb-0">Shipping Method</p>
                                    <p className="m-0">{data.shipping_method}</p>
                                    <p className="bg-primary b-radius-3 mt-2 mb-0">Location</p>
                                    <p className="m-0">{data.location}</p>
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
                        {!data.owner && <BidButton {...data} />}
                        <CommentSection path='products' productId={productId} />
                    </div>
                )}

            </div>
        </>
    )
}

export default ProductPage;

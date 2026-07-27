import { Link } from "react-router-dom";
import getExpiryDay from "../../utils/getExpiryDay";
import ImageWrapper from "../ImageWrapper/ImageWrapper";
import styles from './ProductItem.module.scss';

const ProductItem = props => {
    return (
        <Link to={`/product/${props.id}`} className={`${styles.root} btn-hover gap-3 p-3 d-flex flex-column`}>
            <span className="d-flex jc-between text-center gap-5">
                <ImageWrapper src={props.images[0]} className={styles.img} />
                <span className="d-flex gap-2 flex-column">
                    <span className="border b-radius-3 py-1 px-3">{props.displayName}</span>
                    <span className="bg-primary b-radius-3 px-3 mt-2">Item name</span>
                    <span>{props.title}</span>
                    <span className="bg-primary px-3 b-radius-3">Quantity</span>
                    <span>{props.qty}</span>
                </span>
            </span>
            <span className="d-grid col-2 gap-3">
                <span className="border b-radius-3 py-1 px-2">Days Remaining: {getExpiryDay(props.date, props.duration)}</span>
                <span className="border b-radius-3 py-1 px-2">Price: {props.price}</span>
            </span>
        </Link>
    )
}

export default ProductItem;
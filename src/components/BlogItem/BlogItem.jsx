import { Link } from "react-router-dom";
import ImageWrapper from "../ImageWrapper/ImageWrapper";

const BlogItem = props => (
    <Link className="d-flex flex-column gap-3" to={`/blog/${props.id}`}>
        <ImageWrapper src={props.images[0]} className='b-radius-2 overflow-hidden' />
        <p className="m-0 tx-center fw-mediam text-center border b-radius-3 mx-auto py-2 px-3">{props.displayName}</p>
    </Link>
)

export default BlogItem;
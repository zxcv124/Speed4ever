import { Link } from "react-router-dom";
import BackButton from "../../BackButton/BackButton";
import Filters from "../../components/Filters/Filters";
import HashLink from "../../components/HashLink/HashLink";
import ProductItem from "../../components/ProductItem/ProductItem";
import useCollection from "../../hooks/useCollection";
import FilterIcon from "../../icons/FilterIcon";
import PlusIcon from "../../icons/PlusIcon";

const PostPage = () => {
    const { data, isLoading, err, isEmpty, getProducts } = useCollection({ path: 'products' });
    return (
        <>
        <Filters />
        <div className="p-lg-5 p-4 min-vh-100 d-flex gap-4 flex-column">
            <div className="d-flex ai-center">
                <BackButton />
                <Link to='/auction' className="btn-icon me-auto tx-primary"><PlusIcon /></Link>
                <HashLink hash='filters' className="btn-icon no-spacing me-0 tx-secondary"><FilterIcon /></HashLink>
            </div>
            {data.map(product => <ProductItem key={product.id} {...product} />)}
            {err && <h1 className="tx-danger m-auto">{err}</h1>}
            {!isEmpty && (
                <div className="mx-auto mt-auto">
                    {isLoading ? <div className="loader" role="status" aria-label="Loading auctions"></div> : <button onClick={getProducts} className="btn-primary bg-dark tx-light">Get More</button>}
                </div>
            )}
        </div>
        </>
    )
}

export default PostPage;

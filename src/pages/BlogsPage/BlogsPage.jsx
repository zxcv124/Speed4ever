import { Link } from "react-router-dom";
import BackButton from "../../BackButton/BackButton";
import BlogItem from "../../components/BlogItem/BlogItem";
import useCollection from "../../hooks/useCollection";

const BlogsPage = () => {
    const { data, isLoading, err, isEmpty, getProducts } = useCollection({ path: 'cars' });
    return (
        <div className="p-lg-5 p-4 min-vh-100 d-flex gap-4 flex-column">
            <div className="d-flex jc-between ai-center">
                <BackButton />
                <Link to='/post-blog' className="btn-text">Add new blog</Link>
            </div>
            <div className="d-grid col-xl-4 jc-center col-lg-3 col-sm-2 gap-xl-5 col-1">
                {data.map(car => <BlogItem key={car.id} {...car} />)}
            </div>
            {err && <h1 className="tx-danger m-auto">{err}</h1>}
            {!isEmpty && (
                <div className="mx-auto mt-auto">
                    {isLoading ? <div className="loader" role="status" aria-label="Loading blogs"></div> : <button onClick={getProducts} className="btn-primary bg-dark tx-light">Get More</button>}
                </div>
            )}
        </div>
    )
}

export default BlogsPage;

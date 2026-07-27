import { Link, useLocation } from "react-router-dom";

const HashLink = ({ children, hash = '', ...props }) => {
    const search = useLocation().search;
    return <Link to={{ hash, search: search }} {...props}>{children}</Link>;
}

export default HashLink;
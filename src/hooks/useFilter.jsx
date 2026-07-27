import { useSearchParams } from "react-router-dom";

const useFilter = (defaultInit = {}) => {
    const [searchParams, setFilter] = useSearchParams(defaultInit);
    const filter = {};

    for (let key of searchParams.keys()) {
        const value = searchParams.get(key);
        if (value && value !== '') filter[key] = value;
    }

    const onChange = params => setFilter({ ...filter, ...params });

    return [filter, onChange];
}

export default useFilter;
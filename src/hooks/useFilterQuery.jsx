import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const useFilterQuery = (cb) => {

    const [searchParams] = useSearchParams();

    const queryParams = useMemo(() => {
        const params = [];
        for (let key of searchParams.keys()) {
            const value = searchParams.get(key);
            if (value && value !== '') {
                const prop = key.replace('min_', '').replace('max_', '');
                const operator = key.includes('min') ? '>=' : key.includes('max') ? '<=' : '==';
                const queryValue = (key.includes('min') || key.includes('max')) ? +value : value;
                params.push({ prop, operator, value: queryValue });
            }
        }
        return params;
    }, [searchParams]);

    useEffect(() => {
        cb(queryParams);
    }, [cb, queryParams])

    return queryParams;
}

export default useFilterQuery;

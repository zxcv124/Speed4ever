import { useState } from "react";
import { queryCollection } from "../supabase/db";
import useFilterQuery from "./useFilterQuery";


const useCollection = ({ path, maxLimit = 10, sortBy = "date" }) => {

    const [{ isLoading = true, data = [], err, isEmpty = false }, setStatus] = useState({});

    const getProducts = queryParams => {

        if (!isLoading) setStatus(oldState => ({ ...oldState, isLoading: true }));

        queryCollection({
            path,
            maxLimit,
            sortBy,
            filters: queryParams || [],
            offset: queryParams ? 0 : data.length
        })
            .then(items => {
                const newData = queryParams ? [] : [...data];
                newData.push(...items);
                setStatus({ isLoading: false, data: newData, lastDoc: null, isEmpty: items.length < maxLimit });

            })
            .catch(err => setStatus(oldState => ({ ...oldState, err: err.message, isEmpty: true })))


    }

    useFilterQuery(getProducts);



    return { data, isLoading, err, isEmpty, getProducts };
}

export default useCollection;

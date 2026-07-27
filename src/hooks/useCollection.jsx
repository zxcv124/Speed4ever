import { useState } from "react";
import { getCollection } from "../firebase/db";
import { limit, getDocs, where, startAfter, orderBy, query } from 'firebase/firestore';
import useFilterQuery from "./useFilterQuery";


const useCollection = ({ path, maxLimit = 10, sortBy = "date" }) => {

    const [{ isLoading = true, data = [], err, lastDoc, isEmpty = false }, setStatus] = useState({});

    const getProducts = queryParams => {

        if (!isLoading) setStatus(oldState => ({ ...oldState, isLoading: true }));

        const parameters = [
            getCollection(path),
            limit(maxLimit),
            where('status', '==', "Active"),
            ...queryParams
        ]

        if(!queryParams || queryParams.length === 0) parameters.push(orderBy(sortBy, 'desc'));
        if (!queryParams && lastDoc) parameters.push(startAfter(lastDoc));


        getDocs(query(...parameters))
            .then(({ docs }) => {
                let lastDoc;
                const newData = queryParams ? [] : [...data];
                docs.forEach((doc, index) => {
                    const item = doc.data();
                    item.id = doc.id;
                    if (index === docs.length - 1) lastDoc = doc;
                    newData.push(item)
                })
                setStatus({ isLoading: false, data: newData, lastDoc, isEmpty: docs.length < maxLimit });

            })
            .catch(err => setStatus(oldState => ({ ...oldState, err: err.message, isEmpty: true })))


    }

    useFilterQuery(getProducts);



    return { data, isLoading, err, isEmpty, getProducts };
}

export default useCollection;
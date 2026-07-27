import axios from '../axios';

export const bidProduct = (token, username, price, productId) => axios.post('/bid-product', { username, price, productId }, {
    headers: {
        "Authorization": `Bearer ${token}`
    }
})

export const expireProduct = (token, username, productId) => axios.post('/expire-product', { username, productId }, {
    headers: {
        "Authorization": `Bearer ${token}`
    }
})
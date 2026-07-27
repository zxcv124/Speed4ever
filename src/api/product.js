import axios from '../axios';
import { expireLocalProduct, placeLocalBid } from '../supabase/db';

const isLocalGuestToken = token => String(token || '').startsWith('local-guest:');

export const bidProduct = (token, username, price, productId) => {
    if (isLocalGuestToken(token)) return placeLocalBid({ username, price, productId });

    return axios.post('/bid-product', { username, price, productId }, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

export const expireProduct = (token, username, productId) => {
    if (isLocalGuestToken(token)) return expireLocalProduct({ productId });

    return axios.post('/expire-product', { username, productId }, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

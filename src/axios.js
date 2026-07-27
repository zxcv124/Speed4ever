import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "https://us-central1-speed-4-ever.cloudfunctions.net/app";

export default axios;

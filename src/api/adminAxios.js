import axios from 'axios';

const adminApi = axios.create({
    baseURL: '/api', // Use relative path to hit the same origin (Next.js server)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the admin token
adminApi.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default adminApi;

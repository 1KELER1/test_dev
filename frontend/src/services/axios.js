import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/token/')) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token found');
                }

                // Make a new request to refresh the token
                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const { access } = response.data;
                    localStorage.setItem('accessToken', access);
                    
                    // Update the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    
                    // Retry the original request
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh token fails, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 
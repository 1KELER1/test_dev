import axios from "axios";
import { getRefreshToken } from "./endpoints/users";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  console.log('Making request to:', config.url);
  console.log('Current access token:', accessToken);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('Response error:', error.response?.status, error.config?.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Attempting to refresh token...');

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error('No refresh token found');
          throw new Error("No refresh token found");
        }

        const response = await getRefreshToken(refreshToken);
        console.log('Token refresh response:', response.status);
        
        if (response.status === 200) {
          const { access } = response.data;
          localStorage.setItem("accessToken", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          console.log('Token refreshed successfully, retrying request');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

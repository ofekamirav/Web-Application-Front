import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', 
});

axiosInstance.interceptors.response.use(
  (response) => response,
  
  async (error) => {
    const originalRequest = error.config;
    const { logout } = useAuthStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        localStorage.setItem('refreshToken', newRefreshToken);
        useAuthStore.setState({ accessToken: newAccessToken });

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('Unable to refresh token, logging out.', refreshError);
        logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

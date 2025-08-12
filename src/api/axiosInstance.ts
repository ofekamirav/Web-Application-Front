import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { apiRefresh } from './authService';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let waiters: Array<(t: string) => void> = [];

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true;

      const rt = localStorage.getItem('refreshToken');
      if (!rt) {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        if (isRefreshing) {
          return new Promise((resolve) => {
            waiters.push((token) => {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(original));
            });
          });
        }

        isRefreshing = true;
        const { accessToken, refreshToken } = await apiRefresh(rt);

        localStorage.setItem('refreshToken', refreshToken);
        useAuthStore.setState({ accessToken });
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        waiters.forEach((cb) => cb(accessToken));
        waiters = [];
        isRefreshing = false;

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch (e) {
        isRefreshing = false;
        waiters = [];
        await useAuthStore.getState().logout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

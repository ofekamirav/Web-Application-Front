import { create } from 'zustand';
import { apiLogin, apiRegister, apiLogout, apiRefresh } from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { axiosInstance } from '../api/axiosInstance';
import type { User } from '../interfaces/iUser';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  handleAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  login: async (email, password) => {
    const { user, accessToken, refreshToken } = await apiLogin(email, password);
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
  },

  register: async (formData: FormData) => {
    const { user, accessToken, refreshToken } = await apiRegister(formData);
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch (error) {
        console.error('Logout failed on server, clearing client session anyway.', error);
      }
    }
    localStorage.removeItem('refreshToken'); 
    delete axiosInstance.defaults.headers.common['Authorization'];
    set({ user: null, accessToken: null, isLoading: false });
  },

  handleAuthCallback: async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    const user = await apiGetCurrentUserProfile();
    set({ user, accessToken, isLoading: false });
  },

  initializeAuth: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await apiRefresh(refreshToken);

      localStorage.setItem('refreshToken', newRefreshToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const user = await apiGetCurrentUserProfile();

      set({ user, accessToken, isLoading: false });
    } catch {
      console.log('Initial refresh failed, user is logged out.');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

useAuthStore.getState().initializeAuth();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'refreshToken') {
      const hasToken = !!e.newValue;
      if (hasToken) {
        useAuthStore.getState().initializeAuth();
      } else {
        useAuthStore.getState().logout();
      }
    }
  });
}

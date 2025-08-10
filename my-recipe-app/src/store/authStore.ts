import { create } from 'zustand';
import { apiLogin, apiRegister, apiLogout, apiRefresh } from '../api/authService';
import { axiosInstance } from '../api/axiosInstance';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  provider?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
        console.error("Logout failed on server, clearing client session anyway.", error);
      }
    }
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    set({ user: null, accessToken: null, isLoading: false });
  },

  refreshSession: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }
    try {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = await apiRefresh(refreshToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      set({ user, accessToken: newAccessToken, isLoading: false });
    } catch (error) {
      console.error("Failed to refresh session, logging out.", error);
      get().logout();
    }
  },
setUser: (user: User | null) => {
    set({ user });
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },
}));

useAuthStore.getState().refreshSession();

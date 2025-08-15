// src/store/authStore.ts
import { create } from 'zustand';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefresh,
  apiGoogleSignin,
} from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { apiUploadFile } from '../api/fileService';
import type { User } from '../interfaces/iUser';
import { axiosInstance, attachAuthInterceptors } from '../api/axiosInstance';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    payload: { name: string; email: string; password: string },
    profilePictureFile?: File | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  googleSignin: (credential: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

let authEpoch = 0;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  login: async (email, password) => {
    const myEpoch = ++authEpoch;
    const { user, accessToken, refreshToken } = await apiLogin(email, password);
    if (authEpoch !== myEpoch) return;

    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    set({ user, accessToken, isLoading: false });
  },

  register: async ({ name, email, password }, profilePictureFile) => {
    const myEpoch = ++authEpoch;

    let profilePicture: string | undefined;
    if (profilePictureFile) {
      const { url } = await apiUploadFile(profilePictureFile, 'profile_pictures');
      profilePicture = url;
    }

    const { user, accessToken, refreshToken } = await apiRegister({
      name,
      email,
      password,
      profilePicture,
    });
    if (authEpoch !== myEpoch) return;

    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    set({ user, accessToken, isLoading: false });
  },

  logout: async () => {
    const myEpoch = ++authEpoch;

    const rt = localStorage.getItem('refreshToken');
    try {
      if (rt) await apiLogout(rt);
    } catch (e) {
      console.warn('Logout failed on server, clearing locally anyway.', e);
    } finally {
      if (authEpoch !== myEpoch) return;
      localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  googleSignin: async (credential) => {
    const myEpoch = ++authEpoch;
    const { user, accessToken, refreshToken } = await apiGoogleSignin(credential);
    if (authEpoch !== myEpoch) return;

    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    set({ user, accessToken, isLoading: false });
  },

  initializeAuth: async () => {
    const myEpoch = authEpoch;

    const rt = localStorage.getItem('refreshToken');
    if (!rt) {
      set({ isLoading: false });
      return;
    }

    try {
      const { accessToken, refreshToken: newRT } = await apiRefresh(rt);
      if (authEpoch !== myEpoch) return;

      localStorage.setItem('refreshToken', newRT);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const me = await apiGetCurrentUserProfile();
      if (authEpoch !== myEpoch) return;

      set({ user: me, accessToken, isLoading: false });
    } catch {
      if (authEpoch !== myEpoch) return;

      localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  updateUser: (updates) =>
    set((s) => ({
      user: s.user ? { ...s.user, ...updates } : null,
    })),
}));

attachAuthInterceptors({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setAccessToken: (t: string) => {
    useAuthStore.setState({ accessToken: t });
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  },
  setRefreshToken: (t: string) => localStorage.setItem('refreshToken', t),
  onLogout: () => useAuthStore.getState().logout(),
  refreshCall: (rt: string) => apiRefresh(rt),
});

useAuthStore.getState().initializeAuth();

// סנכרון טאבים
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'refreshToken') {
      const hasToken = !!e.newValue;
      if (hasToken) useAuthStore.getState().initializeAuth();
      else useAuthStore.getState().logout();
    }
  });
}

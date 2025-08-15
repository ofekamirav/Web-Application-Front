import { create } from 'zustand';
import { apiLogin, apiRegister, apiLogout, apiRefresh, apiGoogleSignin } from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { axiosInstance } from '../api/axiosInstance';
import { apiUploadFile } from '../api/fileService';
import type { User } from '../interfaces/iUser';

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

  register: async ({ name, email, password }, profilePictureFile) => {
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
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await apiLogout(refreshToken); } catch (e) { console.error('Logout failed on server, clearing client session anyway.', e); }
    }
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    set({ user: null, accessToken: null, isLoading: false });
  },

  googleSignin: async (credential) => {
    const { user, accessToken, refreshToken } = await apiGoogleSignin(credential);
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
  },

  initializeAuth: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) { set({ isLoading: false }); return; }
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

  updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
}));

useAuthStore.getState().initializeAuth();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'refreshToken') {
      const hasToken = !!e.newValue;
      if (hasToken) useAuthStore.getState().initializeAuth();
      else useAuthStore.getState().logout();
    }
  });
}

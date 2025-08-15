import { create } from 'zustand';
import { apiLogin, apiRegister, apiLogout, apiRefresh, apiGoogleSignin } from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { apiUploadFile } from '../api/fileService';
import type { User } from '../interfaces/iUser';
import { setAuthHeader } from '../api/axiosAuth';

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

    // אם היה בינתיים logout/login אחר — אל תדרוס state
    if (authEpoch !== myEpoch) return;

    localStorage.setItem('refreshToken', refreshToken);
    setAuthHeader(accessToken);

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
    setAuthHeader(accessToken);

    set({ user, accessToken, isLoading: false });
  },

  logout: async () => {
    const myEpoch = ++authEpoch;

    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await apiLogout(refreshToken);
    } catch (e) {
      console.warn('Server logout failed, clearing locally anyway.', e);
    } finally {
      if (authEpoch !== myEpoch) return;
      localStorage.removeItem('refreshToken');
      setAuthHeader(null);
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  googleSignin: async (credential) => {
    const myEpoch = ++authEpoch;

    const { user, accessToken, refreshToken } = await apiGoogleSignin(credential);
    if (authEpoch !== myEpoch) return;

    localStorage.setItem('refreshToken', refreshToken);
    setAuthHeader(accessToken);

    set({ user, accessToken, isLoading: false });
  },

  initializeAuth: async () => {
    const myEpoch = authEpoch;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await apiRefresh(refreshToken);
      if (authEpoch !== myEpoch) return;

      localStorage.setItem('refreshToken', newRefreshToken);
      setAuthHeader(accessToken);

      const me = await apiGetCurrentUserProfile();
      if (authEpoch !== myEpoch) return;

      set({ user: me, accessToken, isLoading: false });
    } catch {
      if (authEpoch !== myEpoch) return;

      localStorage.removeItem('refreshToken');
      setAuthHeader(null);
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));


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

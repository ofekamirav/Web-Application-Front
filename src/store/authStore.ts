import { create } from 'zustand';
import { apiGoogleSignin, apiLogin, apiLogout, apiRefresh, apiRegisterWithFile } from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { attachAuthInterceptors, axiosInstance } from '../api/axiosInstance';
import type { User } from '../interfaces/iUser';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean; 
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  googleSignin: (credential: string) => Promise<void>; 
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>; 
  updateUser: (updates: Partial<User>) => void;
  handleAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
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
  
  googleSignin: async (credential: string) => {
    const { user, accessToken, refreshToken } = await apiGoogleSignin(credential);
    localStorage.setItem('refreshToken', refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
  },

  register: async (formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const file = formData.get('profilePicture') as File | null;

    const { user, accessToken, refreshToken } = await apiRegisterWithFile(
      name, 
      email, 
      password, 
      file || undefined
    );
    
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      await get().logout();
    } else {
      console.warn('Refresh failed (probably network). Keeping anonymous state.');
      set({ isLoading: false });
    }
  }
},

  
  updateUser: (updates: Partial<User>) => {
      set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
      }));
  },
}));

declare global { interface Window { __AUTH_INT_ATTACHED__?: boolean } }

if (typeof window !== 'undefined' && !window.__AUTH_INT_ATTACHED__) {
  attachAuthInterceptors({
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setAccessToken: (t) => useAuthStore.setState({ accessToken: t }),
    setRefreshToken: (t) => localStorage.setItem('refreshToken', t),
    onLogout: () => useAuthStore.getState().logout(),
    refreshCall: (rt) => apiRefresh(rt),
  });
  window.__AUTH_INT_ATTACHED__ = true;
}


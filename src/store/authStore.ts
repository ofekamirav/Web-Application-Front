import { create } from 'zustand';
import { apiLogin, apiRegisterWithFile, apiLogout, apiRefresh, apiGoogleSignin } from '../api/authService';
import { apiGetCurrentUserProfile } from '../api/userService';
import { attachAuthInterceptors } from '../api/axiosInstance';
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
    set({ user, accessToken, isLoading: false });
  },

  googleSignin: async (credential) => {
    const { user, accessToken, refreshToken } = await apiGoogleSignin(credential);
    localStorage.setItem('refreshToken', refreshToken);
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
    set({ user: null, accessToken: null, isLoading: false });
  },
  
  handleAuthCallback: async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('refreshToken', refreshToken);
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
      
      set({ accessToken });
      
      const user = await apiGetCurrentUserProfile();
      set({ user, isLoading: false });
    } catch (err) {
      console.log("Initial refresh failed, logging out.", err);
      get().logout();
    }
  },
  
  updateUser: (updates: Partial<User>) => {
      set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
      }));
  },
}));

// --- Initialization and Interceptor Attachment ---

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
  
  useAuthStore.getState().initializeAuth();
}

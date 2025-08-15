declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
      GOOGLE_CLIENT_ID?: string;
    };
  }
}

export const API_BASE_URL =
  (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000';

export const GOOGLE_CLIENT_ID =
  (typeof window !== 'undefined' && window.__APP_CONFIG__?.GOOGLE_CLIENT_ID) ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '';

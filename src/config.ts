declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
      GOOGLE_CLIENT_ID?: string;
    };
  }
}

export const API_BASE_URL =
  window.__APP_CONFIG__?.API_BASE_URL ?? '';

export const GOOGLE_CLIENT_ID =
  window.__APP_CONFIG__?.GOOGLE_CLIENT_ID ?? '';

declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
      GOOGLE_CLIENT_ID?: string;
    };
  }
}
export {};

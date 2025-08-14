declare global {
    interface Window {
        __APP_CONFIG__?: {
            API_BASE_URL?: string;
            GOOGLE_CLIENT_ID?: string;
        };
    }
}

export const CONFIG = {
    API_BASE_URL:
        window.__APP_CONFIG__?.API_BASE_URL ??
        import.meta.env.VITE_API_BASE_URL ??
        'http://localhost:3000',
    GOOGLE_CLIENT_ID:
        window.__APP_CONFIG__?.GOOGLE_CLIENT_ID ??
        import.meta.env.VITE_GOOGLE_CLIENT_ID ??
        'https://node01.cs.colman.ac.il',
};

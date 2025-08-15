export const CONFIG = {
  API_BASE_URL:
    (window as any).__APP_CONFIG__?.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    window.location.origin,

  GOOGLE_CLIENT_ID:
    (window as any).__APP_CONFIG__?.GOOGLE_CLIENT_ID ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "",
} as const;

export type AppConfig = typeof CONFIG;

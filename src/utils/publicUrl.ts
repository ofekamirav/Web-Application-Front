declare global {
  interface Window {
    __APP_CONFIG__?: { API_BASE_URL?: string };
  }
}

function getApiBase() {
  const fromRuntime = window.__APP_CONFIG__?.API_BASE_URL; // /env.js
  const fromVite = import.meta.env.VITE_API_BASE_URL as string | undefined; 
  return (fromRuntime || fromVite || "").replace(/\/$/, "");
}

export function publicUrl(u?: string | null) {
  if (!u) return u ?? "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = getApiBase();
  const path = u.replace(/^\/+/, "").replace(/\\/g, "/"); 
  return base ? `${base}/${path}` : `/${path}`;
}

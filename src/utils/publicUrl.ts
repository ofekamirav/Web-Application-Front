// src/utils/publicUrl.ts
import { CONFIG } from "../config";

export const publicApiBaseUrl = () => CONFIG.API_BASE_URL;

export function publicUrl(u?: string | null) {
  if (!u) return u ?? "";
  if (/^https?:\/\//i.test(u)) return u;

  const base = (CONFIG.API_BASE_URL || "").replace(/\/$/, "");
  const path = u.replace(/^\/+/, "").replace(/\\/g, "/");

  return base ? `${base}/${path}` : `/${path}`;
}

import { API_BASE_URL } from '../config';

export function publicUrl(p?: string | null): string {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p; 
  const base = (API_BASE_URL || window.location.origin).replace(/\/$/, '');
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
}

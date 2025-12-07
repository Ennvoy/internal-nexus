import { Feature, User, PartnerLink } from '../types';

// Resolve API base URL:
// 1) use VITE_API_URL if present
// 2) if running on localhost:3000 (vite dev), default to http://localhost:4000
// 3) otherwise fall back to same-origin
const envApi = (import.meta as any)?.env?.VITE_API_URL;

// 判斷是不是在本機開發（Vite dev）
const isLocalDev =
  typeof window !== "undefined" &&
  window.location.origin.includes("localhost:3000");

// 如果是本機 → 優先用 env，沒有就用 http://localhost:4000
// 如果是正式環境 → 優先用 env，沒有就用你的 Render 後端網址
const computedBase = isLocalDev
  ? (envApi && envApi.trim()) || "http://localhost:4000"
  : (envApi && envApi.trim()) || "https://internal-nexus.onrender.com";

const API_BASE = computedBase.endsWith("/")
  ? computedBase.slice(0, -1)
  : computedBase;

// （可選）方便除錯：在 console 看 API_BASE
if (typeof window !== "undefined") {
  (window as any).__NEXUS_API_BASE__ = API_BASE;
  console.log("[Nexus] API_BASE =", API_BASE);
}


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // Response wasn't valid JSON — keep the text so we can show a useful error
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && (typeof data === 'object' ? data.error : data)) || res.statusText;
    throw new Error(message);
  }

  // For empty body (e.g., 204/304), return null so callers can safely default
  return (data === null ? (null as T) : (data as T));
}

export const featureApi = {
  list: async () => {
    const res = await request<Feature[] | null>('/api/features');
    const items = Array.isArray(res) ? res : [];
    return items.map(normalizeFeature);
  },
  create: async (payload: Partial<Feature>) => {
    const res = await request<Feature>('/api/features', { method: 'POST', body: JSON.stringify(payload) });
    return normalizeFeature(res);
  },
  update: async (id: string, payload: Partial<Feature>) => {
    const res = await request<Feature>(`/api/features/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    return normalizeFeature(res);
  },
  remove: (id: string) => request(`/api/features/${id}`, { method: 'DELETE' }),
  reorder: (ids: string[]) => request('/api/features/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
};

export const userApi = {
  list: async () => {
    const res = await request<User[] | null>('/api/users');
    return Array.isArray(res) ? res : [];
  },
  create: (payload: Partial<User> & { password?: string }) => request<User>('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<User> & { password?: string }) => request<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/api/users/${id}`, { method: 'DELETE' }),
  resetPassword: (id: string) => request(`/api/users/${id}/reset-password`, { method: 'POST' }),
};

export const linkApi = {
  list: async () => {
    const res = await request<PartnerLink[] | null>('/api/links');
    return Array.isArray(res) ? res : [];
  },
  create: (payload: Partial<PartnerLink>) => request<PartnerLink>('/api/links', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<PartnerLink>) => request<PartnerLink>(`/api/links/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/api/links/${id}`, { method: 'DELETE' }),
  reorder: (ids: string[]) => request('/api/links/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
};

export const configApi = {
  getFeatureCategories: async () => {
    const res = await request<string[] | null>('/api/config/feature-categories');
    return Array.isArray(res) ? res : [];
  },
  updateFeatureCategories: (items: string[]) =>
    request('/api/config/feature-categories', { method: 'PUT', body: JSON.stringify({ items }) }),
  getFeatureAudiences: async () => {
    const res = await request<string[] | null>('/api/config/feature-audiences');
    return Array.isArray(res) ? res : [];
  },
  updateFeatureAudiences: (items: string[]) =>
    request('/api/config/feature-audiences', { method: 'PUT', body: JSON.stringify({ items }) }),
  getLinkCategories: async () => {
    const res = await request<string[] | null>('/api/config/link-categories');
    return Array.isArray(res) ? res : [];
  },
  updateLinkCategories: (items: string[]) =>
    request('/api/config/link-categories', { method: 'PUT', body: JSON.stringify({ items }) }),
};

export const authApi = {
  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// Normalize server response to ensure array fields exist
function normalizeFeature(f: any): Feature {
  return {
    ...f,
    tags: Array.isArray(f?.tags) ? f.tags : [],
    targetAudience: Array.isArray(f?.targetAudience) ? f.targetAudience : [],
    updatedAt: f?.updatedAt || '',
  } as Feature;
}

import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Branch context: set per request (dev) or from auth later. */
let branchId: string | null = null;

export function setBranchId(id: string | null) {
  branchId = id;
}

export function getBranchId(): string | null {
  return branchId;
}

/** Callback to run when access token is refreshed (e.g. update auth state). */
let onRefreshSuccess: (() => void) | null = null;
export function setOnRefreshSuccess(cb: (() => void) | null) {
  onRefreshSuccess = cb;
}

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (branchId) {
    config.headers.set('X-Branch-Id', branchId);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }
    if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
      return Promise.reject(err);
    }
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = api
        .post('/auth/refresh')
        .then(() => {
          onRefreshSuccess?.();
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }
    await refreshPromise;
    originalRequest._retry = true;
    return api(originalRequest);
  },
);

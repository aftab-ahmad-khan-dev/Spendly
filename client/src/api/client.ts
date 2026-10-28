import axios, { AxiosInstance } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let tokenGetter: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    } catch {
      /* no-op */
    }
  }
  return config;
});

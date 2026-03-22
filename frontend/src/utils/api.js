import axios from 'axios';

const envBase = (import.meta.env.VITE_API_URL || '').trim();
const normalizedBase = envBase.replace(/\/$/, '');
const baseURL = normalizedBase
  ? (normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('fitmind_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest = /\/auth\/(login|signup)(\?.*)?$/i.test(requestUrl);
    const isRetryable = !status || status >= 500;

    if (isRetryable && !config.__retried) {
      config.__retried = true;
      await new Promise((resolve) => setTimeout(resolve, 600));
      return api(config);
    }

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('fitmind_user');
      if (window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

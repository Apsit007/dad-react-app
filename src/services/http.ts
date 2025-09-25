import axios from 'axios';

// Central Axios instance with baseURL and auth header injection
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach Authorization header from Redux store if present
http.interceptors.request.use(async (config) => {
  const { store } = await import('../store');
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;


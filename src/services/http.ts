import axios from 'axios';

// Central Axios instance with baseURL and auth header injection
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach Authorization header from localStorage if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;


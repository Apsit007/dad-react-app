import axios from 'axios';

// Central Axios instance with baseURL and auth header injection
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach Authorization header from localStorage if present
http.interceptors.request.use((config) => {
  // const token = localStorage.getItem('accessToken');
  const token = 'fzjZZ5UHX7wW2UK5p-ePfuw7iPme9tsuNjjAOIp80Rwv4EnA9dR.i0SGUgjFsVlBZu7qg-noccKrHDDs7TeaBgMHLzlwbT5.zFMFXI';
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;


import axios from 'axios';

const agropilotApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AGROPILOT_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

agropilotApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agropilot_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

agropilotApi.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error.response?.data?.detail || error.message || 'Request failed')
);

export default agropilotApi;

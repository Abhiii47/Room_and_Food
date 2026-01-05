import axios from 'axios';

// Use proxy in development (configured in package.json) or absolute URL from env
let baseURL = process.env.REACT_APP_API_URL || '/api';

// Auto-fix: If it's a full URL but missing /api suffix, append it
if (baseURL.startsWith('http') && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = `${baseURL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: baseURL
});

// Add the interceptor to include the token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
import axios from 'axios';

// Use proxy in development (configured in package.json) or absolute URL from env
const baseURL = process.env.REACT_APP_API_URL || '/api';

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
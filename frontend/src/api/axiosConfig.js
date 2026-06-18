import axios from 'axios';
import { getAuth } from '../store/auth/authStore.js';
import { getApiBaseUrl } from './apiBaseUrl.js';

const baseURL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default apiClient;

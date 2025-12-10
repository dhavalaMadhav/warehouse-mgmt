import axios from 'axios';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor (add auth token)
api.interceptors.request.use((config) => {
  const { user } = useStore.getState();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response Interceptor (retry + error toast)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Retry logic (max 3 attempts)
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    if (config.__retryCount < 3 && !response) {
      config.__retryCount += 1;
      await new Promise(resolve => setTimeout(resolve, 1000 * config.__retryCount));
      return api(config);
    }

    // Error toast
    const message = response?.data?.message || error.message || 'Network error';
    toast.error(`Error: ${message}`, { duration: 4000 });

    // Offline queue
    if (!navigator.onLine) {
      useStore.getState().addToOfflineQueue({
        method: config.method,
        url: config.url,
        data: config.data,
      });
      toast('Saved to offline queue', { icon: '📦' });
    }

    return Promise.reject(error);
  }
);

export default api;

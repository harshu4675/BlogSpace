import axios from 'axios';

// Get API URL - works for both dev and production
const getApiUrl = () => {
  // Check Vite env variable (set in Netlify)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Local development fallback
  return 'http://localhost:5000/api';
};

const API_BASE = getApiUrl();

// Debug log
console.log('🔗 API URL:', API_BASE);
console.log('🌍 Mode:', import.meta.env.MODE);

// Image URL helper
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // Already full URL (Cloudinary)
  }
  if (url.startsWith('/uploads/')) {
    // Local file - prepend backend URL
    const backendUrl = API_BASE.replace('/api', '');
    return `${backendUrl}${url}`;
  }
  return url;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 & token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Wake up Render server (free tier sleeps)
export const wakeUpServer = async () => {
  try {
    const healthUrl = API_BASE.replace('/api', '/health');
    const res = await fetch(healthUrl, { method: 'GET' });
    if (res.ok) {
      console.log('✅ Backend server is awake');
    }
  } catch (e) {
    console.log('⏳ Backend waking up...');
  }
};

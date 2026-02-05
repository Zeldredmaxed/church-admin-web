import axios from 'axios';

// OLD: const API_URL = 'http://localhost:3000';
// NEW: (Paste your Render URL, no trailing slash)
const API_URL = 'https://new-birth-api.onrender.com';
//https://new-birth-api.onrender.com

export { API_URL };

// Create robust axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically check localStorage.getItem('token')
// If it exists, add the header Authorization: Bearer <token>
api.interceptors.request.use(
  (config) => {
    // Only run in browser (not during SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Export the axios instance as api
export default api;
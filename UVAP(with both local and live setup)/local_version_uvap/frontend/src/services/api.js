import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1', // Default to Admin Service (Port 5001)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token and route to correct service
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dynamic Port Selection based on Role (if logged in)
    if (userInfo?.role === 'admin') {
      config.baseURL = 'http://localhost:5001/api/v1';
    } else if (userInfo?.role === 'faculty') {
      config.baseURL = 'http://localhost:5002/api/v1';
    } else if (userInfo?.role === 'student') {
      config.baseURL = 'http://localhost:5003/api/v1';
    }

    // Handle explicit prefixes (Gateway Logic)
    // If the request URL starts with /admin/, /faculty/, or /student/, route accordingly
    // Handle explicit prefixes (Gateway Logic)
    // If the request URL starts with /admin/, /faculty/, or /student/, route accordingly
    if (config.url.startsWith('/admin/')) {
        config.baseURL = 'http://localhost:5001/api/v1';
        // config.url = config.url.replace('/admin/', '/'); // Removed to match backend route
    } else if (config.url.startsWith('/faculty/')) {
        config.baseURL = 'http://localhost:5002/api/v1';
        // config.url = config.url.replace('/faculty/', '/'); // Removed to match backend route
    } else if (config.url.startsWith('/student/')) {
        config.baseURL = 'http://localhost:5003/api/v1';
        // config.url = config.url.replace('/student/', '/'); // Removed to match backend route
    } else if (config.url.startsWith('/payments/')) {
        config.baseURL = 'http://localhost:5005/api/v1';
        // Keep /payments/ prefix if the backend route expects it, or strip it if not.
        // Based on backend/payment-service/src/routes/paymentRoutes.js:
        // router.post('/generate-challan', ...) -> /api/v1/payments/generate-challan
        // So we should NOT strip /payments/ if the backend mounts it at /payments
        // Wait, server.js mounts at /api/v1/payments.
        // So if frontend calls /payments/generate-challan, and we set baseURL to .../api/v1
        // The final URL will be .../api/v1/payments/generate-challan.
        // So we don't need to strip it, just set the baseURL.
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors (Auto-Logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo'); // Updated key name to match AuthContext
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

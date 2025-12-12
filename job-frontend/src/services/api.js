import axios from 'axios';

/**
 * Axios Instance Configuration
 * Centralized API configuration với interceptors
 */

// Base URL từ environment variable hoặc default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ⭐ DANH SÁCH ENDPOINTS KHÔNG CẦN TOKEN (PUBLIC)
const PUBLIC_ENDPOINTS = [
  '/admin/login',
  '/auth/login',
  '/auth/register',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Create main axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Tự động thêm token vào header (EXCEPT public endpoints)
api.interceptors.request.use(
  (config) => {
    // ⭐ KIỂM TRA XEM CÓ PHẢI PUBLIC ENDPOINT KHÔNG
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // ⭐ CHỈ THÊM TOKEN NẾU KHÔNG PHẢI PUBLIC ENDPOINT
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!config.headers.Authorization,
        isPublic: isPublicEndpoint,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý response và errors
api.interceptors.response.use(
  (response) => {
    // Log response (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        success: response.data?.success,
      });
    }

    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        console.warn('⚠️ Unauthorized: Token invalid or expired');
        
        // Clear token
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        
        // Redirect to login (nếu không phải trang login)
        if (!window.location.pathname.includes('login')) {
          const isAdmin = window.location.pathname.includes('admin');
          window.location.href = isAdmin ? '/admin-login' : '/login';
        }
      }

      // 403 Forbidden - No permission
      if (status === 403) {
        console.warn('⚠️ Forbidden: You do not have permission');
      }

      // 404 Not Found
      if (status === 404) {
        console.warn('⚠️ Not Found:', error.config.url);
      }

      // 500 Server Error
      if (status >= 500) {
        console.error('❌ Server Error:', status);
      }

      // Log error details
      console.error('❌ API Error:', {
        status,
        message: data?.message || error.message,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No Response:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('❌ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ⭐ AXIOS INSTANCE RIÊNG CHO AUTH (KHÔNG BAO GIỜ CÓ TOKEN)
export const authAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API interceptor - Không bao giờ thêm token
authAPI.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Auth Request (no token):', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error('❌ Auth Request Error:', error);
    return Promise.reject(error);
  }
);

authAPI.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Auth Response:', {
        status: response.status,
        success: response.data?.success,
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ Auth Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper function để set token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    console.log('✅ Token đã được set');
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    console.log('🗑️ Token đã được xóa');
  }
};

// Helper function để xóa token
export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  console.log('🗑️ Tất cả token đã được xóa');
};

// Helper function để get current token
export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('adminToken');
};

// Helper function để check if logged in
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default api;
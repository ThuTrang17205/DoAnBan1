import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const PUBLIC_ENDPOINTS = [
  '/admin/login',
  '/auth/login',
  '/auth/register',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

  
    if (process.env.NODE_ENV === 'development') {
      console.log(' API Request:', {
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
    console.error(' Request Error:', error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(' API Response:', {
        url: response.config.url,
        status: response.status,
        success: response.data?.success,
      });
    }

    return response;
  },
  (error) => {
   
    if (error.response) {
      const { status, data } = error.response;

     
      if (status === 401) {
        console.warn(' Unauthorized: Token invalid or expired');
        
        
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        
       
        if (!window.location.pathname.includes('login')) {
          const isAdmin = window.location.pathname.includes('admin');
          window.location.href = isAdmin ? '/admin-login' : '/login';
        }
      }

     
      if (status === 403) {
        console.warn(' Forbidden: You do not have permission');
      }

      
      if (status === 404) {
        console.warn(' Not Found:', error.config.url);
      }

     
      if (status >= 500) {
        console.error(' Server Error:', status);
      }

     
      console.error(' API Error:', {
        status,
        message: data?.message || error.message,
        url: error.config?.url,
      });
    } else if (error.request) {
      
      console.error(' No Response:', error.request);
    } else {
     
      console.error(' Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);


export const authAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


authAPI.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(' Auth Request (no token):', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error(' Auth Request Error:', error);
    return Promise.reject(error);
  }
);

authAPI.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(' Auth Response:', {
        status: response.status,
        success: response.data?.success,
      });
    }
    return response;
  },
  (error) => {
    console.error(' Auth Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    console.log(' Token đã được set');
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    console.log(' Token đã được xóa');
  }
};


export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  console.log(' Tất cả token đã được xóa');
};


export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('adminToken');
};


export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default api;
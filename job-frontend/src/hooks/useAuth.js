import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    checkAuth();
  }, []);

 
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

     
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
     
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

 
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user: userData } = response.data;

     
      localStorage.setItem('token', token);
      
      
      setUser(userData);
      setIsLoggedIn(true);

      console.log(' Login successful:', userData);
      return { success: true, user: userData };

    } catch (err) {
      console.error(' Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

 
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const { token, user: newUser } = response.data;

      
      localStorage.setItem('token', token);
      setUser(newUser);
      setIsLoggedIn(true);

      console.log(' Register successful:', newUser);
      return { success: true, user: newUser };

    } catch (err) {
      console.error(' Register failed:', err);
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  
  const logout = useCallback(() => {

    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    
  
    setUser(null);
    setIsLoggedIn(false);
    setError(null);

    console.log(' Logout successful');
    
    
    navigate('/');
  }, [navigate]);

 
  const updateUser = useCallback(async (updatedData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);
      return { success: true, user: response.data.user };

    } catch (err) {
      console.error(' Update failed:', err);
      const errorMessage = err.response?.data?.message || 'Cập nhật thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

 
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { success: true, message: response.data.message };

    } catch (err) {
      console.error(' Change password failed:', err);
      const errorMessage = err.response?.data?.message || 'Đổi mật khẩu thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,                 
    isLoggedIn,           
    loading,              
    error,               
    login,                
    logout,               
    register,             
    updateUser,           
    changePassword,       
    checkAuth,            
    clearError            
  };
};

export default useAuth;
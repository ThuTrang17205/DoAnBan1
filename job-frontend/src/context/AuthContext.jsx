import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * AuthContext - Global authentication state management
 * 
 * Usage:
 * import { useAuth } from './context/AuthContext';
 * 
 * const { user, isLoggedIn, login, logout, register } = useAuth();
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend (optional)
      try {
        const response = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        // Token invalid, use cached user data
        if (userStr) {
          const cachedUser = JSON.parse(userStr);
          setUser(cachedUser);
          setIsLoggedIn(true);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user: userData } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsLoggedIn(true);

      console.log('✅ Login successful:', userData);
      return { success: true, user: userData };

    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const { token, user: newUser } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Update state
      setUser(newUser);
      setIsLoggedIn(true);

      console.log('✅ Register successful:', newUser);
      return { success: true, user: newUser };

    } catch (err) {
      console.error('❌ Register failed:', err);
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');

    // Clear state
    setUser(null);
    setIsLoggedIn(false);
    setError(null);

    console.log('✅ Logout successful');

    // Navigate to home
    navigate('/');
  };

  const updateUser = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedUser = response.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      return { success: true, user: updatedUser };

    } catch (err) {
      console.error('❌ Update failed:', err);
      const errorMessage = err.response?.data?.message || 'Cập nhật thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return { success: true, message: response.data.message };

    } catch (err) {
      console.error('❌ Change password failed:', err);
      const errorMessage = err.response?.data?.message || 'Đổi mật khẩu thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
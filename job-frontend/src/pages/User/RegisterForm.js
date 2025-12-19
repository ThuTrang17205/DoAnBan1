import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css';

function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || 
        !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      // Log the data being sent
      const requestData = {
        username: formData.fullName,  
        email: formData.email,
        password: formData.password,
        role: 'user'
      };
      
      console.log('Sending registration data:', requestData);

      const response = await axios.post(
  'http://localhost:5000/api/auth/register',  
  requestData,
  {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

      console.log('Đăng ký thành công:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      alert('Đăng ký thành công!');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      
      navigate('/');
    } catch (err) {
      console.error('Lỗi đăng ký đầy đủ:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      if (err.response) {
        setError(err.response.data.message || err.response.data.error || 'Email đã được sử dụng');
      } else if (err.request) {
        setError('Không nhận được phản hồi từ server');
      } else {
        setError('Không thể kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    console.log('Redirecting to Google register...');
    window.location.href = 'http://localhost:5000/api/auth/google/register';
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h2>Đăng Ký Tài Khoản Ứng Viên</h2>
          <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
            Tạo tài khoản để tìm kiếm việc làm phù hợp
          </p>
        </div>

        {error && (
          <div className="error-message">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form-wrapper">
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nhập lại mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">Hoặc</span>
        </div>

        <button 
          type="button" 
          className="google-button"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          {loading ? 'Đang xử lý...' : 'Đăng ký bằng tài khoản Google'}
        </button>

        <div className="login-link">
          <span className="login-text">Đã có tài khoản?</span>
          <button 
            type="button" 
            className="login-button"
            onClick={handleGoToLogin}
            disabled={loading}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
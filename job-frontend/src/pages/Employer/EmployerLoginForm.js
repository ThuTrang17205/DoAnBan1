import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EmployerLoginForm.css';

function EmployerLoginForm({ redirectToCheckout = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/employers/login', {
        email,
        password
      });

      console.log(' Đăng nhập thành công:', response.data);
      
      
      if (!response.data.token) {
        console.error(' Không có token trong response!');
        setError('Lỗi server: Không nhận được token');
        setLoading(false);
        return;
      }
      
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'employer');
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      
      console.log(' VERIFY LocalStorage:');
      console.log('  - token:', localStorage.getItem('token') ? 'EXISTS ' : 'MISSING ');
      console.log('  - userRole:', localStorage.getItem('userRole'));
      console.log('  - user:', localStorage.getItem('user') ? 'EXISTS ' : 'MISSING ');
      
      
      const savedRole = localStorage.getItem('userRole');
      if (savedRole !== 'employer') {
        console.error(' Role không đúng! Expected: employer, Got:', savedRole);
        setError('Lỗi: Không thể lưu role');
        setLoading(false);
        return;
      }

      console.log(' All checks passed! Redirecting...');
      
      
      setTimeout(() => {
        const redirectTarget = localStorage.getItem("redirectAfterLogin");

        
        if (redirectTarget === "payment") {
          console.log(" Redirecting to PAYMENT PAGE...");
          
          localStorage.removeItem("redirectAfterLogin");
          navigate('/payment');
        } 
        
        else if (redirectTarget === "checkout") {
          console.log(" Redirecting to CHECKOUT PAGE...");
          localStorage.removeItem("redirectAfterLogin");
          navigate('/employer-checkout');
        } 
        
        else {
          console.log(" Redirecting to EMPLOYER DASHBOARD...");
          navigate('/employer-dashboard');
        }
      }, 300);

      
    } catch (err) {
      console.error('❌ Lỗi đăng nhập:', err);
      if (err.response) {
        setError(err.response.data.message || 'Email hoặc mật khẩu không đúng');
      } else {
        setError('Không thể kết nối đến server');
      }
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigate('/employer-register');
  };

  const handleBackToHome = () => {
    navigate('/employer');
  };

  return (
    <div className="employer-login-container">
      <div className="employer-login-box">
        <div className="employer-login-header">
          <h2>Đăng nhập Nhà tuyển dụng</h2>
          <p>Quản lý tin tuyển dụng của bạn</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form className="employer-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="register-link">
            <span className="register-text">Chưa có tài khoản?</span>
            <button 
              type="button" 
              className="register-button"
              onClick={handleGoToRegister}
              disabled={loading}
            >
              Đăng ký ngay
            </button>
          </div>

          <div className="help-text">
            <p>Bạn là ứng viên? <a href="/login">Đăng nhập tại đây</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployerLoginForm;
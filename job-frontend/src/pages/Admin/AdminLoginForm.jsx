import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginForm.css';

function AdminLoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      console.log(' Already logged in as admin, redirecting...');
      navigate('/admin-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      console.log(' Sending login request...');
      
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log(' Response:', data);

      if (response.ok && data.success) {
        console.log(' Login successful!');

       
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', 'admin');
        if (data.admin) {
          localStorage.setItem('admin', JSON.stringify(data.admin));
        }

        console.log(' Saved to localStorage:', {
          token: '✓',
          userRole: localStorage.getItem('userRole'),
          adminToken: '✓'
        });

        setSuccess(' Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/admin-dashboard', { replace: true });
 
        }, 500);

      } else {
        setError(data.message || 'Đăng nhập thất bại!');
      }
      
    } catch (err) {
      console.error(' Login error:', err);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = () => {
    setFormData({
      username: 'admin',
      password: 'admin123'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        
        <div className="admin-login-header">
          <h1> Admin Login</h1>
          <p>Đăng nhập vào trang quản trị</p>
        </div>

       
        <button 
          type="button" 
          onClick={quickFill}
          className="quick-fill-btn"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            background: '#f7fafc',
            border: '2px dashed #cbd5e0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#4a5568',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#edf2f7';
            e.target.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f7fafc';
            e.target.style.borderColor = '#cbd5e0';
          }}
        >
           Điền nhanh 
        </button>

       
        {success && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '20px',
            background: '#c6f6d5',
            border: '2px solid #68d391',
            borderRadius: '8px',
            color: '#22543d',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>Thành Công</span>
            <span>{success}</span>
          </div>
        )}

       
        {error && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '20px',
            background: '#fed7d7',
            border: '2px solid #fc8181',
            borderRadius: '8px',
            color: '#c53030',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>Lỗi</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
         
          <div className="form-group">
            <label htmlFor="username"> Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

         
          <div className="form-group">
            <label htmlFor="password"> Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          
          <button 
            type="submit" 
            disabled={loading} 
            className="submit-btn"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Đang đăng nhập.
              </>
            ) : (
              ' Đăng nhập'
            )}
          </button>
        </form>

        
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#718096'
        }}>
          <p>
            Không phải admin? <a href="/" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Về trang chủ</a>
          </p>
        </div>

        
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#4a5568'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '13px', 
            fontWeight: '600',
            color: '#2d3748'
          }}>
            
          </h4>
          <pre style={{ 
            margin: 0, 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}>
          </pre>
        </div>
      </div>

     
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminLoginForm;
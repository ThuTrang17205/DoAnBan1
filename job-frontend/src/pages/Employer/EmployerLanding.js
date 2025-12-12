import React, { useState } from "react";
import axios from "axios";
import "./EmployerLanding.css";

function EmployerLanding() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const features = [
    {
      title: 'Đăng tin nhanh chóng',
      description: 'Đăng tin tuyển dụng chỉ trong 5 phút với giao diện đơn giản'
    },
    {
      title: 'Tìm kiếm thông minh',
      description: 'AI hỗ trợ tìm kiếm và gợi ý ứng viên phù hợp nhất'
    },
    {
      title: 'Quản lý hiệu quả',
      description: 'Hệ thống quản lý ứng viên và tin tuyển dụng toàn diện'
    },
    {
      title: 'Đề xuất thông minh',
      description: 'AI đề xuất ứng viên phù hợp với yêu cầu tuyển dụng'
    },
    {
      title: 'Tiếp cận ứng viên chất lượng',
      description: 'Hàng triệu ứng viên tiềm năng đang tìm kiếm cơ hội'
    },
    {
      title: 'Báo cáo chi tiết',
      description: 'Thống kê và phân tích hiệu quả tuyển dụng'
    }
  ];

  const packages = [
    {
      name: 'Gói Cơ bản',
      price: 'Miễn phí',
      priceValue: 0,
      features: [
        '1 tin tuyển dụng',
        'Hiển thị 30 ngày',
        'Xem CV ứng viên',
        'Hỗ trợ email'
      ],
      color: '#667eea'
    },
    {
      name: 'Gói Chuyên nghiệp',
      price: '2.990.000đ/tháng',
      priceValue: 2990000,
      features: [
        '10 tin tuyển dụng',
        'Hiển thị ưu tiên',
        'Tìm kiếm CV không giới hạn',
        'Hỗ trợ 24/7',
        'Báo cáo chi tiết'
      ],
      color: '#00b14f',
      popular: true
    },
    {
      name: 'Gói Doanh nghiệp',
      price: 'Liên hệ',
      priceValue: 0,
      features: [
        'Tin tuyển dụng không giới hạn',
        'Trang thương hiệu riêng',
        'Quản lý đa chi nhánh',
        'Tài khoản phụ',
        'Đào tạo và hỗ trợ riêng'
      ],
      color: '#764ba2'
    }
  ];

  
  const handleStartPackage = (pkg) => {
    localStorage.setItem('selectedPackage', JSON.stringify({
      name: pkg.name,
      price: pkg.price,
      priceValue: pkg.priceValue,
      features: pkg.features
    }));
    
    localStorage.setItem('redirectAfterLogin', 'payment');
    
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/payment';
    } else {
      setShowLoginForm(true);
    }
  };

  return (
    <div className="employer-page">
      {}
      <div className="employer-header">
        <div className="header-actions">
          {}
        </div>
      </div>

      {}
      <div className="employer-hero">
        <div className="employer-hero-content">
          <h1>
            Tìm kiếm nhân tài
            <br />
            <span className="gradient-text">Nhanh chóng & Hiệu quả</span>
          </h1>
          <p className="hero-subtitle">
            Kết nối với hàng triệu ứng viên chất lượng cao trên Job Portal
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Ứng viên</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Doanh nghiệp</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100K+</div>
              <div className="stat-label">Tin tuyển dụng</div>
            </div>
          </div>

          <div className="hero-actions">
            <button
              className="btn-employer-register"
              onClick={() => setShowRegisterForm(true)}
            >
              Đăng ký nhà tuyển dụng
            </button>
            <button
              className="btn-employer-login"
              onClick={() => setShowLoginForm(true)}
            >
              Đăng nhập
            </button>
          </div>
        </div>

        <div className="employer-hero-image">
          <img
            src="https://www.topcv.vn/v4/image/welcome/employer/img-employer-hero.png"
            alt="Employer Hero"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {}
      <div className="employer-features">
        <h2 className="section-title">Tại sao chọn Job Portal ?</h2>
        <p className="section-subtitle">Giải pháp tuyển dụng toàn diện cho doanh nghiệp</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="pricing-section">
        <h2 className="section-title">Bảng giá dịch vụ</h2>
        <p className="section-subtitle">Lựa chọn gói phù hợp với nhu cầu của bạn</p>

        <div className="pricing-grid">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`pricing-card ${pkg.popular ? 'popular' : ''}`}
            >
              {pkg.popular && <div className="popular-badge">Phổ biến nhất</div>}
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-price" style={{ color: pkg.color }}>
                {pkg.price}
              </div>
              <ul className="package-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="package-button"
                style={{ backgroundColor: pkg.color }}
                onClick={() => handleStartPackage(pkg)}
              >
                Bắt đầu ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Sẵn sàng tìm kiếm nhân tài?</h2>
          <p>Tham gia cùng hàng ngàn doanh nghiệp đang tin dùng Job Portal</p>
          <button
            className="cta-button"
            onClick={() => setShowRegisterForm(true)}
          >
            Đăng tin tuyển dụng ngay
          </button>
        </div>
      </div>

      {}
      {showLoginForm && (
        <div className="modal-overlay" onClick={() => setShowLoginForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowLoginForm(false)}
            >
              ✕
            </button>
            <EmployerLoginForm
              onClose={() => setShowLoginForm(false)}
              onSwitchToRegister={() => {
                setShowLoginForm(false);
                setShowRegisterForm(true);
              }}
            />
          </div>
        </div>
      )}

      {}
      {showRegisterForm && (
        <div className="modal-overlay" onClick={() => setShowRegisterForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowRegisterForm(false)}
            >
              ✕
            </button>
            <EmployerRegisterForm
              onClose={() => setShowRegisterForm(false)}
              onSwitchToLogin={() => {
                setShowRegisterForm(false);
                setShowLoginForm(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


function EmployerLoginForm({ onSwitchToRegister, onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/employers/login', {
        email: formData.email,
        password: formData.password
      });

      console.log(" Đăng nhập thành công:", response.data);

      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      
      const redirectTo = localStorage.getItem('redirectAfterLogin');
      
      if (redirectTo === 'payment') {
        
        localStorage.removeItem('redirectAfterLogin');
        
        window.location.href = '/payment';
      } else {
        
        window.location.href = '/employer-dashboard';
      }

    } catch (err) {
      console.error(" Lỗi đăng nhập:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-form-box">
      <h2>Đăng nhập nhà tuyển dụng</h2>
      <p className="form-subtitle">Quản lý tuyển dụng hiệu quả cùng Job Portal</p>

      {error && <div className="error-message"> {error}</div>}

      <form onSubmit={handleSubmit} className="employer-form">
        <div className="form-group">
          <label>Email doanh nghiệp <span className="required">*</span></label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="company@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="form-footer">
        <p>Chưa có tài khoản?{' '}
          <button type="button" onClick={onSwitchToRegister} className="link-button">
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}


function EmployerRegisterForm({ onSwitchToLogin, onClose }) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    companySize: "",
    industry: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

   
    if (!formData.companyName.trim() || !formData.email.trim() || 
        !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/employers/register', {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        companySize: formData.companySize,
        industry: formData.industry
      });

      console.log(" Đăng ký thành công:", response.data);

     
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      
      const redirectTo = localStorage.getItem('redirectAfterLogin');
      
      if (redirectTo === 'payment') {
       
        localStorage.removeItem('redirectAfterLogin');
        alert(" Đăng ký thành công!");
       
        window.location.href = '/payment';
      } else {
        alert(" Đăng ký thành công! Vui lòng chờ xác thực tài khoản.");
       
        window.location.href = '/employer-dashboard';
      }

    } catch (err) {
      console.error(" Lỗi đăng ký:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-form-box">
      <h2>Đăng ký nhà tuyển dụng</h2>
      <p className="form-subtitle">Bắt đầu tuyển dụng hiệu quả cùng Job Portal</p>

      {error && <div className="error-message"> {error}</div>}

      <form onSubmit={handleSubmit} className="employer-form">
        <div className="form-group">
          <label>Tên công ty <span className="required">*</span></label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Nhập tên công ty"
            autoComplete="organization"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Người liên hệ</label>
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            placeholder="Họ tên người phụ trách"
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Email doanh nghiệp <span className="required">*</span></label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="company@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="0912345678"
            autoComplete="tel"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Quy mô công ty</label>
          <select
            value={formData.companySize}
            onChange={(e) => setFormData({...formData, companySize: e.target.value})}
            autoComplete="off"
            disabled={loading}
          >
            <option value="">Chọn quy mô</option>
            <option value="1-50">1-50 nhân viên</option>
            <option value="51-200">51-200 nhân viên</option>
            <option value="201-500">201-500 nhân viên</option>
            <option value="501-1000">501-1000 nhân viên</option>
            <option value="1000+">Trên 1000 nhân viên</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ngành nghề</label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData({...formData, industry: e.target.value})}
            autoComplete="off"
            disabled={loading}
          >
            <option value="">Chọn ngành nghề</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</option>
            <option value="Marketing">Marketing</option>
            <option value="Kinh doanh">Kinh doanh</option>
            <option value="Sản xuất">Sản xuất</option>
            <option value="Dịch vụ">Dịch vụ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <div className="form-footer">
        <p>Đã có tài khoản?{' '}
          <button type="button" onClick={onSwitchToLogin} className="link-button">
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
}

export default EmployerLanding;
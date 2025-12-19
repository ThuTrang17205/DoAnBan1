import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';


import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  ArrowLeft, 
  Lock 
} from 'lucide-react';

export default function PaymentPage() {
  const navigate = useNavigate();
  
 
  const savedPackage = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
  
  const [selectedPackage] = useState({
    name: savedPackage.name || 'Gói Chuyên nghiệp',
    price: savedPackage.priceValue || 2990000,
    duration: 'tháng',
    features: savedPackage.features || [
      '10 tin tuyển dụng',
      'Hiển thị ưu tiên',
      'Tìm kiếm CV không giới hạn',
      'Hỗ trợ 24/7',
      'Báo cáo chi tiết'
    ]
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStatus, setPaymentStatus] = useState('form'); // 'form', 'processing', 'success'
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [orderId] = useState('DH' + Date.now());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.companyName || !formData.email || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        alert('Vui lòng điền đầy đủ thông tin thẻ!');
        return;
      }
    }

    setPaymentStatus('processing');

    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 Calling subscription API...');
      console.log('Package info:', selectedPackage);
      
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageName: selectedPackage.name,
          price: selectedPackage.price,
          duration: selectedPackage.duration,
          paymentMethod: paymentMethod,
          orderId: orderId,
          companyInfo: {
            companyName: formData.companyName,
            taxCode: formData.taxCode,
            email: formData.email,
            phone: formData.phone
          }
        })
      });

      const data = await response.json();
      console.log('📦 Subscription response:', data);

      if (response.ok && data.success) {
        // Cập nhật localStorage với thông tin subscription mới
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Cập nhật các thông tin subscription
          user.subscription_status = 'active';
          user.subscription_type = selectedPackage.name;
          user.package_type = data.subscription?.package_type || 'professional';
          user.posts_remaining = data.subscription?.posts_remaining || 10;
          user.subscription_end_date = data.subscription?.end_date;
          
          // Lưu lại vào localStorage
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('✅ User updated:', user);
        }

        // Delay để hiển thị animation
        setTimeout(() => {
          setPaymentStatus('success');
        }, 1500);
      } else {
        console.error('❌ Payment failed:', data);
        alert('❌ Lỗi thanh toán: ' + (data.message || 'Vui lòng thử lại'));
        setPaymentStatus('form');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại!');
      setPaymentStatus('form');
    }
  };

  const handleBackClick = () => {
    localStorage.removeItem('selectedPackage');
    localStorage.removeItem('redirectAfterLogin');
    navigate('/employer');
  };

  const handleStartUsing = () => {
    // Clear temporary data
    localStorage.removeItem('selectedPackage');
    localStorage.removeItem('redirectAfterLogin');
    
    // Navigate to dashboard
    navigate('/employer-dashboard');
    
    // Reload để cập nhật UI với subscription mới
    window.location.reload();
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="loading-overlay">
        <div className="loading-box">
          <div className="spinner"></div>
          <h3 className="loading-title">Đang xử lý thanh toán</h3>
          <p className="loading-text">Vui lòng không đóng trang này...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-page">
        <div className="success-page">
          <div className="success-box">
            <div className="success-header">
              <div className="success-icon">
                <CheckCircle2 />
              </div>
              <h1 className="success-title">Thanh toán thành công!</h1>
              <p className="success-subtitle">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi</p>
            </div>

            <div className="order-info">
              <div className="order-row">
                <span className="order-label">Mã đơn hàng</span>
                <span className="order-value">{orderId}</span>
              </div>
              <div className="order-row">
                <span className="order-label">Gói dịch vụ</span>
                <span className="order-value">{selectedPackage.name}</span>
              </div>
              <div className="order-row">
                <span className="order-label">Thời gian</span>
                <span className="order-value">
                  {new Date().toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="order-row">
                <span className="order-label">Phương thức</span>
                <span className="order-value">
                  {paymentMethod === 'card' && 'Thẻ tín dụng'}
                  {paymentMethod === 'bank' && 'Chuyển khoản'}
                  {paymentMethod === 'momo' && 'Ví MoMo'}
                </span>
              </div>
              <div className="order-row">
                <span className="order-label">Tổng thanh toán</span>
                <span className="order-value order-total">
                  {formatCurrency(selectedPackage.price * 1.1)}
                </span>
              </div>
            </div>

            <div className="email-notice">
              <h3>✉️ Thông tin đã được gửi đến email</h3>
              <p>
                Chúng tôi đã gửi thông tin đơn hàng và hướng dẫn sử dụng đến email: <strong>{formData.email}</strong>
              </p>
              <p>
                Gói dịch vụ của bạn đã được kích hoạt thành công!
              </p>
            </div>

            <div className="success-actions">
              <button onClick={handleStartUsing} className="btn-primary">
                Bắt đầu sử dụng ngay
              </button>
              <button onClick={() => window.print()} className="btn-secondary">
                In hóa đơn
              </button>
            </div>

            <div className="support-info">
              <p>
                Cần hỗ trợ? Liên hệ: <a href="tel:1900xxxx">1900 xxxx</a>
                {' hoặc '}
                <a href="mailto:support@jobportal.com">support@jobportal.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-header">
        <div className="payment-header-content">
          <h1 className="payment-title">Thanh toán</h1>
        </div>
      </div>

      <div className="payment-content">
        {/* Left Column - Form */}
        <div>
          {/* Payment Methods */}
          <div className="form-card">
            <h2>Phương thức thanh toán</h2>
            <div className="payment-methods">
              <div
                onClick={() => setPaymentMethod('card')}
                className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <CreditCard />
                <p>Thẻ tín dụng</p>
              </div>
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`payment-method ${paymentMethod === 'bank' ? 'active' : ''}`}
              >
                <Building2 />
                <p>Chuyển khoản</p>
              </div>
              <div
                onClick={() => setPaymentMethod('momo')}
                className={`payment-method ${paymentMethod === 'momo' ? 'active' : ''}`}
              >
                <Smartphone />
                <p>Ví MoMo</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="form-card">
            <h2>Thông tin công ty</h2>
            <div className="form-group">
              <label>Tên công ty <span className="required">*</span></label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập tên công ty"
              />
            </div>
            <div className="form-group">
              <label>Mã số thuế</label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập mã số thuế (nếu có)"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0123456789"
                />
              </div>
            </div>
          </div>

          {/* Card Info */}
          {paymentMethod === 'card' && (
            <div className="form-card">
              <h2>Thông tin thẻ</h2>
              <div className="form-group">
                <label>Số thẻ <span className="required">*</span></label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="form-group">
                <label>Tên chủ thẻ <span className="required">*</span></label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="NGUYEN VAN A"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày hết hạn <span className="required">*</span></label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV <span className="required">*</span></label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer */}
          {paymentMethod === 'bank' && (
            <div className="form-card">
              <h2>Thông tin chuyển khoản</h2>
              <div className="bank-info">
                <div className="bank-row">
                  <span className="bank-label">Ngân hàng:</span>
                  <span className="bank-value">MBBANK</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Số tài khoản:</span>
                  <span className="bank-value">1234567890</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Chủ tài khoản:</span>
                  <span className="bank-value">CÔNG TY JOB PORTAL</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Nội dung:</span>
                  <span className="bank-content">THANHTOAN {formData.email}</span>
                </div>
              </div>
              <p className="bank-note">
                * Vui lòng chuyển khoản với nội dung chính xác để hệ thống tự động xác nhận thanh toán
              </p>
            </div>
          )}

          {/* MoMo */}
          {paymentMethod === 'momo' && (
            <div className="form-card">
              <h2>Thanh toán qua MoMo</h2>
              <div className="momo-qr">
                <div className="qr-placeholder">
                  <p>QR Code MoMo</p>
                </div>
                <p>Quét mã QR để thanh toán</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '0.5rem' }}>
                  Hoặc mở ứng dụng MoMo và nhập số điện thoại: <strong>0987654321</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary">
          <div className="form-card">
            <h2>Thông tin đơn hàng</h2>
            
            <div className="package-badge">
              <div className="badge-label">Gói đã chọn</div>
              <div className="badge-name">{selectedPackage.name}</div>
              <div className="badge-price">
                {formatCurrency(selectedPackage.price)}
                <span className="badge-duration">/{selectedPackage.duration}</span>
              </div>
            </div>

            <ul className="feature-list">
              {selectedPackage.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <CheckCircle2 />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Tạm tính</span>
                <span>{formatCurrency(selectedPackage.price)}</span>
              </div>
              <div className="price-row">
                <span>VAT (10%)</span>
                <span>{formatCurrency(selectedPackage.price * 0.1)}</span>
              </div>
              <div className="price-row total">
                <span>Tổng cộng</span>
                <span className="total-amount">{formatCurrency(selectedPackage.price * 1.1)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} className="btn-primary">
              Xác nhận thanh toán
            </button>

            <div className="security-badge">
              <Lock />
              <span>Giao dịch được bảo mật an toàn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
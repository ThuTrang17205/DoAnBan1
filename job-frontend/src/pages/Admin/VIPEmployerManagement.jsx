import React, { useState, useEffect } from 'react';
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function VIPEmployerManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [vipEmployers, setVipEmployers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueStats, setRevenueStats] = useState({
    thisMonth: 52000000,
    lastMonth: 42300000,
    growth: 23
  });

 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchVIPData();
  }, []);

  const fetchVIPData = async () => {
    try {
      setLoading(true);
      setError(null);
      
     
      setPackages([
        { 
          id: 1, 
          name: 'Gói Cơ bản', 
          code: 'BASIC',
          price: 0,
          priceText: 'Miễn Phí',
          duration: 'Vĩnh viễn', 
          features: [
            '2 tin tuyển dụng',
            'Hiển thị 30 ngày',
            'Xem CV ứng viên',
            'Hỗ trợ email'
          ],
          active: 45,
          color: '#95a5a6'
        },
        { 
          id: 2, 
          name: 'Gói Chuyên nghiệp', 
          code: 'PRO',
          price: 2990000,
          priceText: '2,990,000₫',
          duration: '1 tháng', 
          features: [
            '10 tin tuyển dụng',
            'Hiển thị ưu tiên',
            'Tìm kiếm CV không giới hạn',
            'Hỗ trợ 24/7',
            'Báo cáo chi tiết'
          ],
          active: 18,
          popular: true,
          color: '#3498db'
        },
        { 
          id: 3, 
          name: 'Gói Doanh nghiệp', 
          code: 'ENTERPRISE',
          price: 9990000,
          priceText: '9,990,000₫',
          duration: '3 tháng', 
          features: [
            'Tin tuyển dụng không giới hạn',
            'Trang thương hiệu riêng',
            'Quản lý đa chi nhánh',
            'Tài khoản phụ',
            'Đào tạo và hỗ trợ riêng'
          ],
          active: 7,
          color: '#9b59b6'
        }
      ]);

      
      setVipEmployers([
        { 
          id: 1, 
          company: 'FPT Software',
          contactName: 'Nguyễn Văn A',
          email: 'nguyenvana@fpt.com',
          phone: '0901234567',
          packageCode: 'PRO',
          packageName: 'Gói Chuyên nghiệp',
          price: 2990000,
          startDate: '2024-12-01',
          endDate: '2025-01-01',
          jobLimit: 10,
          jobsPosted: 8,
          totalApplications: 156,
          status: 'active',
          registeredDate: '2024-12-01',
          autoRenew: true
        },
        { 
          id: 2, 
          company: 'Viettel Solutions',
          contactName: 'Trần Thị B',
          email: 'tranthib@viettel.com',
          phone: '0912345678',
          packageCode: 'ENTERPRISE',
          packageName: 'Gói Doanh nghiệp',
          price: 9990000,
          startDate: '2024-11-15',
          endDate: '2025-02-15',
          jobLimit: -1, 
          jobsPosted: 25,
          totalApplications: 487,
          status: 'active',
          registeredDate: '2024-11-15',
          autoRenew: false
        },
        { 
          id: 3, 
          company: 'VNG Corporation',
          contactName: 'Lê Văn C',
          email: 'levanc@vng.com',
          phone: '0923456789',
          packageCode: 'PRO',
          packageName: 'Gói Chuyên nghiệp',
          price: 2990000,
          startDate: '2024-11-20',
          endDate: '2024-12-20',
          jobLimit: 10,
          jobsPosted: 9,
          totalApplications: 234,
          status: 'expiring', 
          registeredDate: '2024-11-20',
          autoRenew: true
        },
        { 
          id: 4, 
          company: 'Tiki Corporation',
          contactName: 'Phạm Thị D',
          email: 'phamthid@tiki.vn',
          phone: '0934567890',
          packageCode: 'BASIC',
          packageName: 'Gói Cơ bản',
          price: 0,
          startDate: '2024-01-01',
          endDate: null, 
          jobLimit: 2,
          jobsPosted: 2,
          totalApplications: 45,
          status: 'active',
          registeredDate: '2024-01-01',
          autoRenew: false
        }
      ]);

    } catch (error) {
      console.error('Error fetching VIP data:', error);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  
  const filteredEmployers = vipEmployers.filter(emp => {
    const matchSearch = emp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPackage = selectedPackage === 'all' || emp.packageCode === selectedPackage;
    const matchStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    
    return matchSearch && matchPackage && matchStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#27ae60';
      case 'expiring': return '#f39c12';
      case 'expired': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return '✓ Đang hoạt động';
      case 'expiring': return '⚠ Sắp hết hạn';
      case 'expired': return '✗ Đã hết hạn';
      default: return 'Không xác định';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Vĩnh viễn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpgradePackage = (employer) => {
    alert(`Nâng cấp gói cho ${employer.company}`);
  };

  const handleExtendPackage = (employer) => {
    alert(`Gia hạn gói cho ${employer.company}`);
  };

  const handleViewDetails = (employer) => {
    alert(`Xem chi tiết ${employer.company}\n\nThông tin:\n- Gói: ${employer.packageName}\n- Đăng ký: ${formatDate(employer.registeredDate)}\n- Tin đã đăng: ${employer.jobsPosted}/${employer.jobLimit === -1 ? '∞' : employer.jobLimit}\n- Ứng viên: ${employer.totalApplications}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p>Đang tải dữ liệu...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '20px' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
      
      {/* Error Banner */}
      {error && (
        <div style={{ 
          background: '#fee', 
          border: '2px solid #e74c3c', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#c0392b', fontSize: '14px' }}>❌ {error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ background: 'transparent', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#2c3e50' }}>👑 Quản lý Gói VIP</h1>
            <p style={{ margin: 0, color: '#7f8c8d' }}>Quản lý nhà tuyển dụng VIP và thống kê đăng ký</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => alert('Xuất báo cáo doanh thu')}
              style={{ padding: '12px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
               Báo cáo doanh thu
            </button>
            <button 
              onClick={() => alert('Tạo gói VIP mới')}
              style={{ padding: '12px 24px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
               Tạo gói mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '25px', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}> Doanh thu tháng này</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(revenueStats.thisMonth)}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            ↗ +{revenueStats.growth}% so với tháng trước
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '25px', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}> Tổng nhà tuyển dụng VIP</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {vipEmployers.length} công ty
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            {vipEmployers.filter(e => e.status === 'active').length} đang hoạt động
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '25px', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}> Tin tuyển dụng</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {vipEmployers.reduce((sum, emp) => sum + emp.jobsPosted, 0)} tin
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            Từ các nhà tuyển dụng VIP
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '25px', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}> Tổng ứng viên</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            {vipEmployers.reduce((sum, emp) => sum + emp.totalApplications, 0)}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            Từ các tin VIP
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '0', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #ecf0f1' }}>
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'packages', label: 'Gói VIP' },
            { id: 'employers', label: 'Nhà tuyển dụng' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '20px',
                background: activeTab === tab.id ? '#3498db' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#7f8c8d',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.3s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Package Distribution */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#2c3e50' }}> Phân bổ gói VIP</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{ 
                  padding: '20px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${pkg.color}`
                }}>
                  <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>{pkg.name}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>{pkg.active}</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                    {((pkg.active / vipEmployers.length) * 100).toFixed(1)}% tổng số
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Registrations */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#2c3e50' }}> Đăng ký gần đây</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Công ty</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Gói VIP</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Ngày đăng ký</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {vipEmployers
                    .sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate))
                    .slice(0, 5)
                    .map(emp => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#2c3e50' }}>🏢 {emp.company}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            background: '#e8f5e9', 
                            color: '#27ae60', 
                            borderRadius: '6px', 
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {emp.packageName}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#7f8c8d' }}>
                          {formatDate(emp.registeredDate)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#2c3e50', fontWeight: '600' }}>
                          {formatCurrency(emp.price)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {packages.map(pkg => (
            <div 
              key={pkg.id} 
              style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '30px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                border: pkg.popular ? '3px solid #3498db' : '2px solid #ecf0f1',
                position: 'relative',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {pkg.popular && (
                <div style={{ 
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#3498db',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ⭐ PHỔ BIẾN
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#2c3e50' }}>{pkg.name}</h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: pkg.color, margin: '15px 0' }}>
                  {pkg.priceText}
                </div>
                <div style={{ color: '#7f8c8d', fontSize: '14px' }}> {pkg.duration}</div>
              </div>
              
              <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '20px', marginBottom: '20px' }}>
                {pkg.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#2c3e50' }}>
                    <span style={{ color: '#27ae60', fontSize: '18px' }}>✓</span>
                    <span style={{ fontSize: '14px' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', padding: '15px', background: '#ecf0f1', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>Đang sử dụng</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>{pkg.active}</div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>nhà tuyển dụng</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => alert(`Chỉnh sửa gói ${pkg.name}`)}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#3498db', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}
                >
                   Sửa
                </button>
                <button 
                  onClick={() => alert(`Xem chi tiết gói ${pkg.name}\n\nSố lượng: ${pkg.active}\nDoanh thu: ${formatCurrency(pkg.price * pkg.active)}`)}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#27ae60', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}
                >
                   Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employers Tab */}
      {activeTab === 'employers' && (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{ 
            padding: '20px', 
            borderBottom: '2px solid #ecf0f1', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '15px' 
          }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#2c3e50' }}>
               Danh sách nhà tuyển dụng ({filteredEmployers.length})
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder=" Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '10px 15px', 
                  border: '2px solid #ecf0f1', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  minWidth: '200px' 
                }}
              />
              <select 
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                style={{ 
                  padding: '10px 15px', 
                  border: '2px solid #ecf0f1', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                <option value="all">Tất cả gói</option>
                {packages.map(pkg => (
                  <option key={pkg.code} value={pkg.code}>{pkg.name}</option>
                ))}
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ 
                  padding: '10px 15px', 
                  border: '2px solid #ecf0f1', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="expiring">Sắp hết hạn</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {[
                    'Công ty', 
                    'Liên hệ', 
                    'Gói VIP', 
                    'Ngày bắt đầu', 
                    'Ngày hết hạn',
                    'Còn lại',
                    'Tin đăng', 
                    'Ứng viên', 
                    'Trạng thái', 
                    'Hành động'
                  ].map(header => (
                    <th key={header} style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#2c3e50', 
                      borderBottom: '2px solid #ecf0f1' 
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployers.map(employer => {
                  const daysRemaining = getDaysRemaining(employer.endDate);
                  
                  return (
                    <tr 
                      key={employer.id} 
                      style={{ borderBottom: '1px solid #ecf0f1', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '15px', fontSize: '14px', color: '#2c3e50', fontWeight: '600' }}>
                        <div>{employer.company}</div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '13px', color: '#7f8c8d' }}>
                        <div>{employer.contactName}</div>
                        <div>{employer.email}</div>
                        <div>{employer.phone}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: '#e8f5e9', 
                          color: '#27ae60', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: '600' 
                        }}>
                          {employer.packageName}
                        </span>
                        <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                          {formatCurrency(employer.price)}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', color: '#7f8c8d' }}>
                        {formatDate(employer.startDate)}
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', color: '#7f8c8d' }}>
                        {formatDate(employer.endDate)}
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        {daysRemaining !== null ? (
                          <span style={{ 
                            color: daysRemaining < 7 ? '#e74c3c' : daysRemaining < 30 ? '#f39c12' : '#27ae60',
                            fontWeight: '600'
                          }}>
                            {daysRemaining} ngày
                          </span>
                        ) : (
                          <span style={{ color: '#27ae60', fontWeight: '600' }}>Vĩnh viễn</span>
                        )}
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', textAlign: 'center' }}>
                        <div style={{ color: '#2c3e50', fontWeight: '600' }}>
                          {employer.jobsPosted}/{employer.jobLimit === -1 ? '∞' : employer.jobLimit}
                        </div>
                        {employer.jobLimit !== -1 && (
                          <div style={{ width: '60px', height: '4px', background: '#ecf0f1', borderRadius: '2px', margin: '5px auto 0' }}>
                            <div style={{ 
                              width: `${(employer.jobsPosted / employer.jobLimit) * 100}%`, 
                              height: '100%', 
                              background: '#3498db', 
                              borderRadius: '2px' 
                            }}></div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px', color: '#2c3e50', fontWeight: '600', textAlign: 'center' }}>
                        {employer.totalApplications}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: getStatusColor(employer.status), 
                          color: 'white', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getStatusText(employer.status)}
                        </span>
                        {employer.autoRenew && (
                          <div style={{ fontSize: '11px', color: '#27ae60', marginTop: '5px' }}>
                             Tự động gia hạn
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button 
                            onClick={() => handleViewDetails(employer)}
                            style={{ 
                              padding: '6px 12px', 
                              background: '#3498db', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                             Chi tiết
                          </button>
                          <button 
                            onClick={() => handleUpgradePackage(employer)}
                            style={{ 
                              padding: '6px 12px', 
                              background: '#9b59b6', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                             Nâng cấp
                          </button>
                          {employer.status === 'expiring' && (
                            <button 
                              onClick={() => handleExtendPackage(employer)}
                              style={{ 
                                padding: '6px 12px', 
                                background: '#27ae60', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontSize: '12px', 
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >
                               Gia hạn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEmployers.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#95a5a6' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}></div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Không tìm thấy kết quả</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {filteredEmployers.length > 0 && (
            <div style={{ 
              padding: '20px', 
              borderTop: '2px solid #ecf0f1', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Hiển thị {filteredEmployers.length} kết quả
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1].map(page => (
                  <button 
                    key={page}
                    style={{ 
                      padding: '8px 12px', 
                      background: '#3498db',
                      color: 'white',
                      border: '2px solid #3498db', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VIPEmployerManagement;
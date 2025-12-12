import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    console.log('=== ADMIN DASHBOARD MOUNT ===');
    console.log('Token:', token ? 'EXISTS' : 'NULL');
    console.log('User Role:', userRole);

    if (!token) {
      console.log(' No token found, redirecting to login...');
      navigate('/admin-login');
      return;
    }

    if (userRole !== 'admin') {
      console.log(' Not admin role, redirecting to home...');
      navigate('/');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Bạn chưa đăng nhập! Đang chuyển hướng...');
        setLoading(false);
        setTimeout(() => navigate('/admin-login'), 2000);
        return;
      }

      console.log(' Đang gửi request với token:', token.substring(0, 20) + '...');

      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats',  {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(' Response status:', response.status);

      if (response.status === 403) {
        setError(' Bạn không có quyền truy cập! Chỉ admin mới xem được trang này.');
        setLoading(false);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');
        setTimeout(() => navigate('/admin-login'), 3000);
        return;
      }

      if (response.status === 401) {
        setError(' Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.');
        setLoading(false);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');
        setTimeout(() => navigate('/admin-login'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(' Nhận dữ liệu thành công:', data);
      
    
      const statsData = data.data || data;
      console.log(' Stats Data:', statsData);
      
      setStats(statsData);
      setError(null);
    } catch (error) {
      console.error(' Error fetching stats:', error);
      setError('Không thể kết nối server. Vui lòng kiểm tra backend có đang chạy không.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log(' Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('admin');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-wrapper">
          <h2> Có lỗi xảy ra</h2>
          <p style={{color: '#e74c3c', fontSize: '16px', marginBottom: '20px'}}>{error}</p>
          
          <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
            <button onClick={fetchDashboardStats} className="retry-btn">
               Thử lại
            </button>
            <button onClick={handleLogout} className="retry-btn" style={{background: '#3498db'}}>
              Đăng nhập lại
            </button>
          </div>

          <div style={{marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'left', maxWidth: '500px', margin: '30px auto 0'}}>
            <h4 style={{marginBottom: '10px', fontSize: '14px'}}> Debug Info:</h4>
            <pre style={{fontSize: '12px', color: '#666', whiteSpace: 'pre-wrap'}}>
              {`token: ${localStorage.getItem('token') ? ' Có' : ' Không'}
adminToken: ${localStorage.getItem('adminToken') ? ' Có' : ' Không'}
userRole: ${localStorage.getItem('userRole') || ' Không'}
Backend URL: http://localhost:5000/api/admin/stats`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="error-wrapper">
          <h2> Không có dữ liệu!</h2>
          <p>Server trả về dữ liệu rỗng</p>
          <button onClick={fetchDashboardStats} className="retry-btn">
             Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1> Admin Dashboard</h1>
          <p>Tổng quan hệ thống quản lý việc làm</p>
          <small style={{color: '#666', fontSize: '13px'}}>
            Đăng nhập với role: <strong>{localStorage.getItem('userRole')}</strong>
          </small>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            📅 {new Date().toLocaleDateString('vi-VN')}
          </button>
          <button className="btn-primary"> Xuất báo cáo</button>
          <button onClick={handleLogout} className="btn-secondary" style={{marginLeft: '10px'}}>
             Đăng xuất
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers?.toLocaleString() || 0}</div>
            <div className="stat-label">Tổng Users</div>
            <div className={`stat-change ${stats.usersGrowth >= 0 ? 'positive' : 'negative'}`}>
                {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth || 0 }% tháng này
                </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-content">
            <div className="stat-value">{stats.totalEmployers?.toLocaleString() || 0}</div>
            <div className="stat-label">Nhà tuyển dụng</div>
            <div className={`stat-change ${stats.usersGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth || 0 }% tháng này
                  </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-content">
            <div className="stat-value">{stats.totalJobs?.toLocaleString() || 0}</div>
            <div className="stat-label">Tin tuyển dụng</div>
            <div className={`stat-change ${stats.usersGrowth >= 0 ? 'positive' : 'negative'}`}>
                    {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth || 0 }% tháng này
                        </div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-content">
            <div className="stat-value">{stats.totalApplications?.toLocaleString() || 0}</div>
            <div className="stat-label">Đơn ứng tuyển</div>
           <div className={`stat-change ${stats.usersGrowth >= 0 ? 'positive' : 'negative'}`}>
              {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth || 0}% tháng này
                  </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
             Tổng quan
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
             Danh mục
          </button>
          <button 
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
             Mới nhất
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Top Categories */}
        {(activeTab === 'overview' || activeTab === 'categories') && stats.topCategories && stats.topCategories.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3> Top Danh mục việc làm</h3>
              <span className="badge">{stats.topCategories.length} danh mục</span>
            </div>
            <div className="card-body">
              {stats.topCategories.map((cat, idx) => (
                <div key={idx} className="category-item">
                  <div className="category-info">
                    <div className="category-rank">#{idx + 1}</div>
                    <div className="category-details">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-count">{cat.count} việc làm</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(cat.count / stats.topCategories[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        {(activeTab === 'overview' || activeTab === 'recent') && stats.recentJobs && stats.recentJobs.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3> Việc làm mới nhất</h3>
              <button className="btn-link">Xem tất cả →</button>
            </div>
            <div className="card-body">
              {stats.recentJobs.slice(0, 8).map((job, idx) => (
                <div key={idx} className="job-item">
                  <div className="job-details">
                    <div className="job-title">{job.title}</div>
                    <div className="job-meta">
                      <span>{job.company_name}</span>
                      <span>•</span>
                      <span>📍 {job.location}</span>
                    </div>
                  </div>
                  <div className="job-date">
                    {new Date(job.posted_at).toLocaleDateString('vi-VN')}
                  </div>
                  <span className={`status-badge ${job.status}`}>
                    {job.status === 'open' ? '' : '⏸'} {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      {activeTab === 'overview' && stats.jobsByMonth && stats.jobsByMonth.length > 0 && (
        <div className="card full-width">
          <div className="card-header">
            <h3> Thống kê theo tháng</h3>
            <select className="month-select">
              <option>6 tháng gần đây</option>
              <option>3 tháng gần đây</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <div className="bar-chart">
                {stats.jobsByMonth.map((item, idx) => (
                  <div key={idx} className="bar-item">
                    <div 
                      className="bar"
                      style={{
                        height: `${(item.count / Math.max(...stats.jobsByMonth.map(m => parseInt(m.count)))) * 200}px`
                      }}
                    >
                      <span className="bar-value">{item.count}</span>
                    </div>
                    <div className="bar-label">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn" onClick={() => navigate('/admin/jobs')}>
          <span>Thêm việc làm</span>
        </button>
        <button className="action-btn" onClick={() => navigate('/admin/users')}>
          <span>Quản lý users</span>
        </button>
        <button className="action-btn" onClick={() => navigate('/admin/applications')}>
          <span>Đơn ứng tuyển</span>
        </button>
        <button className="action-btn" onClick={() => navigate('/admin/settings')}>
          <span>Cài đặt</span>
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
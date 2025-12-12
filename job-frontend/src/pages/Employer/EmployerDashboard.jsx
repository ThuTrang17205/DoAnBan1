import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployerDashboard.css';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  
  useEffect(() => {
    if (location.state?.refresh) {
      console.log(' Refreshing dashboard after job creation...');
      fetchDashboardData();
      // Clear state sau khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  //  Fetch data khi mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/employer-login');
        return;
      }

      console.log(' Fetching dashboard data...');

      // Lấy thông tin từ localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }

      //  Lấy profile
      try {
        const profileResponse = await fetch('http://localhost:5000/api/employers/me/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.employer) {
            setUser(profileData.employer);
            setEmployer(profileData.employer.profile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      //  Lấy jobs với timestamp để bypass cache
      try {
        const timestamp = new Date().getTime();
        const jobsResponse = await fetch(`http://localhost:5000/api/employers/me/jobs?_t=${timestamp}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });

        console.log(' Jobs response status:', jobsResponse.status);

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          console.log(' Jobs data received:', jobsData);
          
          const jobsList = jobsData.jobs || jobsData.data || [];
          console.log(' Jobs list:', jobsList.length, 'jobs');
          setJobs(jobsList);

          //  Lấy applications
          try {
            const appsResponse = await fetch(`http://localhost:5000/api/employers/me/applications?_t=${timestamp}`, {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
              cache: 'no-store'
            });

            if (appsResponse.ok) {
              const appsData = await appsResponse.json();
              const appsList = appsData.applications || appsData.data || [];
              setApplications(appsList);
              calculateStats(jobsList, appsList);
            }
          } catch (error) {
            console.error('Error fetching applications:', error);
            calculateStats(jobsList, []);
          }
        } else {
          console.warn(' Failed to fetch jobs, status:', jobsResponse.status);
          setJobs([]);
          calculateStats([], []);
        }
      } catch (error) {
        console.error(' Error fetching jobs:', error);
        setJobs([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(' Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (jobsList, appsList) => {
    const totalJobs = jobsList.length;
    const activeJobs = jobsList.filter(j => j.status === 'open' || j.status === 'active').length;
    const totalApplications = appsList.length;
    const pendingApplications = appsList.filter(a => a.status === 'pending').length;
    const approvedApplications = appsList.filter(a => a.status === 'approved' || a.status === 'accepted').length;
    const rejectedApplications = appsList.filter(a => a.status === 'rejected').length;
    const totalViews = jobsList.reduce((sum, job) => sum + (job.views || 0), 0);

    setStats({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalViews
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/employer');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Job Portal - Nhà tuyển dụng</h1>
          <p className="company-name">
            {employer?.company || user?.company_name || user?.companyName || 'Công ty'}
          </p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-name">
              {user?.name || user?.contact_person || user?.contactPerson || 'Employer'}
            </div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            title="Tổng số tin tuyển dụng"
            value={stats.totalJobs}
            color="#2563eb"
            subtitle={`Đang tuyển: ${stats.activeJobs}`}
          />
          <StatCard
            title="Tin đang tuyển"
            value={stats.activeJobs}
            color="#10b981"
            subtitle={`${stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}% tổng số`}
          />
          <StatCard
            title="Tổng ứng viên"
            value={stats.totalApplications}
            color="#f59e0b"
            subtitle={`TB: ${stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}/tin`}
          />
          <StatCard
            title="Chờ xét duyệt"
            value={stats.pendingApplications}
            color="#8b5cf6"
            subtitle={`${stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}% tổng số`}
          />
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <div className="tabs-header">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
               Tổng quan
            </TabButton>
            <TabButton
              active={activeTab === 'statistics'}
              onClick={() => setActiveTab('statistics')}
            >
               Thống kê
            </TabButton>
            <TabButton
              active={activeTab === 'jobs'}
              onClick={() => setActiveTab('jobs')}
            >
               Công việc đã đăng
            </TabButton>
            <TabButton
              active={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
            >
               Thông tin công ty
            </TabButton>
          </div>

          <div className="tabs-content">
            {activeTab === 'overview' && (
              <OverviewTab jobs={jobs} stats={stats} navigate={navigate} />
            )}
            {activeTab === 'statistics' && (
              <StatisticsTab jobs={jobs} applications={applications} stats={stats} />
            )}
            {activeTab === 'jobs' && (
              <JobsTab jobs={jobs} onRefresh={fetchDashboardData} navigate={navigate} />
            )}
            {activeTab === 'company' && (
              <CompanyTab user={user} employer={employer} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ... (các component khác giữ nguyên)

function OverviewTab({ jobs, stats, navigate }) {
  const recentJobs = jobs.slice(0, 5);

  //   Dùng navigate với state để báo refresh
  const handleCreateJob = () => {
    navigate('/employer/jobs/create', { state: { from: 'dashboard' } });
  };

  return (
    <div className="overview-tab">
      <h2>Tổng quan hoạt động</h2>
      
      <div className="quick-stats">
        <h3> Thống kê nhanh</h3>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <span className="label">Tỷ lệ tin đang tuyển:</span>
            <strong className="value green">
              {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}%
            </strong>
          </div>
          <div className="quick-stat-item">
            <span className="label">TB ứng viên/tin:</span>
            <strong className="value orange">
              {stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}
            </strong>
          </div>
        </div>
      </div>

      <h3> Tin tuyển dụng gần đây</h3>
      {recentJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>Chưa có tin tuyển dụng nào</p>
          <button 
            className="btn-primary"
            onClick={handleCreateJob}
          >
            Đăng tin ngay
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {recentJobs.map(job => (
            <JobCard key={job.id} job={job} compact />
          ))}
        </div>
      )}
    </div>
  );
}

function JobsTab({ jobs, onRefresh, navigate }) {
  const [filter, setFilter] = useState('all');

  //  FIXED: Dùng navigate thay vì window.location.href
  const handleCreateJob = () => {
    navigate('/employer/jobs/create', { state: { from: 'dashboard' } });
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'open') return job.status === 'open' || job.status === 'active';
    return job.status === filter;
  });

  return (
    <div className="jobs-tab">
      <div className="jobs-header">
        <h2>Quản lý tin tuyển dụng</h2>
        <button 
          className="btn-primary"
          onClick={handleCreateJob}
        >
          + Đăng tin mới
        </button>
      </div>

      <div className="filter-buttons">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Tất cả ({jobs.length})
        </FilterButton>
        <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>
          Đang tuyển ({jobs.filter(j => j.status === 'open' || j.status === 'active').length})
        </FilterButton>
        <FilterButton active={filter === 'closed'} onClick={() => setFilter('closed')}>
          Đã đóng ({jobs.filter(j => j.status === 'closed').length})
        </FilterButton>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">Không có tin tuyển dụng nào</div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

// Các component còn lại giữ nguyên...
function StatCard({ icon, title, value, color, subtitle }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`tab-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function JobCard({ job, compact, onRefresh }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleViewApplications = () => {
    window.location.href = `/employer/applications/${job.id}`;
  };

  const handleEditJob = () => {
    window.location.href = `/employer/jobs/${job.id}/edit`;
  };

  const handleCloseJob = async () => {
  if (!window.confirm('Bạn có chắc muốn đóng tin tuyển dụng này?')) {
    return;
  }

  setIsClosing(true);
  try {
    const token = localStorage.getItem('token');
    //  THÊM /me vào URL
    const response = await fetch(`http://localhost:5000/api/employers/me/jobs/${job.id}/close`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert(' Đã đóng tin tuyển dụng thành công!');
      if (onRefresh) {
        onRefresh();
      }
    } else {
      const error = await response.json();
      alert(` Lỗi: ${error.message || 'Không thể đóng tin tuyển dụng'}`);
    }
  } catch (error) {
    console.error('Error closing job:', error);
    alert(' Có lỗi xảy ra khi đóng tin tuyển dụng');
  } finally {
    setIsClosing(false);
  }
};

const handleReopenJob = async () => {
  if (!window.confirm('Bạn có chắc muốn mở lại tin tuyển dụng này?')) {
    return;
  }

  setIsClosing(true);
  try {
    const token = localStorage.getItem('token');
    //  THÊM /me vào URL
    const response = await fetch(`http://localhost:5000/api/employers/me/jobs/${job.id}/reopen`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert(' Đã mở lại tin tuyển dụng thành công!');
      if (onRefresh) {
        onRefresh();
      }
    } else {
      const error = await response.json();
      alert(` Lỗi: ${error.message || 'Không thể mở lại tin tuyển dụng'}`);
    }
  } catch (error) {
    console.error('Error reopening job:', error);
    alert(' Có lỗi xảy ra khi mở lại tin tuyển dụng');
  } finally {
    setIsClosing(false);
  }
};
  const isOpen = job.status === 'open' || job.status === 'active';

  return (
    <div className="job-card">
      <div className="job-card-content">
        <div className="job-details">
          <h3>{job.title}</h3>
          <div className="job-meta">
            <span>📍 {job.location}</span>
            <span> {job.min_salary && job.max_salary ? `${job.min_salary}-${job.max_salary} ${job.currency || 'VND'}` : 'Thỏa thuận'}</span>
            <span> {job.applicationCount || job.application_count || 0} ứng viên</span>
          </div>
          {!compact && job.category && (
            <span className="job-category">{job.category}</span>
          )}
        </div>
        <div className="job-status">
          <span className={`status-badge ${isOpen ? 'active' : 'closed'}`}>
            {isOpen ? ' Đang tuyển' : ' Đã đóng'}
          </span>
        </div>
      </div>
      {!compact && (
        <div className="job-actions">
          <button 
            className="btn-primary-outline"
            onClick={handleViewApplications}
            title="Xem danh sách ứng viên"
          >
             Xem ứng viên ({job.applicationCount || job.application_count || 0})
          </button>
          <button 
            className="btn-secondary-outline"
            onClick={handleEditJob}
            title="Chỉnh sửa tin tuyển dụng"
          >
             Chỉnh sửa
          </button>
          {isOpen ? (
            <button 
              className="btn-danger-outline"
              onClick={handleCloseJob}
              disabled={isClosing}
              title="Đóng tin tuyển dụng"
            >
              {isClosing ? '⏳ Đang xử lý...' : ' Đóng tin'}
            </button>
          ) : (
            <button 
              className="btn-success-outline"
              onClick={handleReopenJob}
              disabled={isClosing}
              title="Mở lại tin tuyển dụng"
            >
              {isClosing ? '⏳ Đang xử lý...' : ' Mở lại'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`filter-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function StatisticsTab({ jobs, applications, stats }) {
  // Thống kê theo trạng thái ứng viên
  const applicationsByStatus = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  // Thống kê top 5 công việc có nhiều ứng viên nhất
  const jobsWithAppCount = jobs.map(job => ({
    ...job,
    appCount: applications.filter(a => a.job_id === job.id).length
  })).sort((a, b) => b.appCount - a.appCount).slice(0, 5);

  // Thống kê theo tháng (ví dụ: 6 tháng gần nhất)
  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return {
      month: `T${month}/${year}`,
      jobs: jobs.filter(j => {
        const jobDate = new Date(j.created_at || j.createdAt);
        return jobDate.getMonth() + 1 === month && jobDate.getFullYear() === year;
      }).length,
      applications: applications.filter(a => {
        const appDate = new Date(a.created_at || a.createdAt);
        return appDate.getMonth() + 1 === month && appDate.getFullYear() === year;
      }).length
    };
  }).reverse();

  return (
    <div className="statistics-tab">
      <h2>📈 Thống kê chi tiết</h2>

      {/* Tổng quan số liệu */}
      <div className="stats-section">
        <h3> Tổng quan</h3>
        <div className="stats-grid-small">
          <div className="stat-box">
            <div className="stat-number">{stats.totalJobs}</div>
            <div className="stat-label">Tổng tin tuyển dụng</div>
          </div>
          <div className="stat-box green">
            <div className="stat-number">{stats.activeJobs}</div>
            <div className="stat-label">Đang tuyển</div>
          </div>
          <div className="stat-box orange">
            <div className="stat-number">{stats.totalApplications}</div>
            <div className="stat-label">Tổng ứng viên</div>
          </div>
          <div className="stat-box purple">
            <div className="stat-number">{stats.totalViews}</div>
            <div className="stat-label">Lượt xem</div>
          </div>
        </div>
      </div>

      {/* Thống kê ứng viên theo trạng thái */}
      <div className="stats-section">
        <h3> Trạng thái ứng viên</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-header">
              <span>⏳ Chờ xét duyệt</span>
              <strong>{applicationsByStatus.pending} ứng viên</strong>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill purple"
                style={{ 
                  width: `${stats.totalApplications > 0 ? (applicationsByStatus.pending / stats.totalApplications * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span> Đã chấp nhận</span>
              <strong>{applicationsByStatus.approved} ứng viên</strong>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill green"
                style={{ 
                  width: `${stats.totalApplications > 0 ? (applicationsByStatus.approved / stats.totalApplications * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span> Đã từ chối</span>
              <strong>{applicationsByStatus.rejected} ứng viên</strong>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill red"
                style={{ 
                  width: `${stats.totalApplications > 0 ? (applicationsByStatus.rejected / stats.totalApplications * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top công việc hot */}
      <div className="stats-section">
        <h3> Top công việc được quan tâm</h3>
        {jobsWithAppCount.length === 0 ? (
          <div className="empty-state-small">Chưa có dữ liệu</div>
        ) : (
          <div className="top-jobs-list">
            {jobsWithAppCount.map((job, index) => (
              <div key={job.id} className="top-job-item">
                <div className="rank">#{index + 1}</div>
                <div className="job-info">
                  <div className="job-title">{job.title}</div>
                  <div className="job-location">📍 {job.location}</div>
                </div>
                <div className="job-stats">
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span className="stat-value">{job.appCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-value">{job.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Biểu đồ theo tháng */}
      <div className="stats-section">
        <h3>📅 Xu hướng 6 tháng gần đây</h3>
        <div className="monthly-chart">
          {monthlyStats.map((month, index) => (
            <div key={index} className="month-column">
              <div className="bars">
                <div 
                  className="bar blue"
                  style={{ height: `${month.jobs * 20}px` }}
                  title={`${month.jobs} tin tuyển dụng`}
                >
                  {month.jobs > 0 && <span>{month.jobs}</span>}
                </div>
                <div 
                  className="bar orange"
                  style={{ height: `${month.applications * 10}px` }}
                  title={`${month.applications} ứng viên`}
                >
                  {month.applications > 0 && <span>{month.applications}</span>}
                </div>
              </div>
              <div className="month-label">{month.month}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color blue"></span> Tin tuyển dụng
          </span>
          <span className="legend-item">
            <span className="legend-color orange"></span> Ứng viên
          </span>
        </div>
      </div>
    </div>
  );
}

function CompanyTab({ user, employer }) {
  return (
    <div className="company-tab">
      <h2>Thông tin công ty</h2>
      
      <div className="info-grid">
        <InfoField label="Tên công ty" value={employer?.company || user?.company_name || user?.companyName} />
        <InfoField label="Người liên hệ" value={user?.contact_person || user?.contactPerson} />
        <InfoField label="Email" value={user?.email} />
        <InfoField label="Số điện thoại" value={user?.phone} />
        <InfoField label="Quy mô" value={user?.company_size || user?.companySize} />
        <InfoField label="Ngành nghề" value={user?.industry} />
      </div>

      {employer?.description && (
        <div className="company-description">
          <h3>Mô tả công ty</h3>
          <div className="description-box">
            {employer.description}
          </div>
        </div>
      )}

      <button className="btn-primary"> Chỉnh sửa thông tin</button>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="info-field">
      <div className="info-label">{label}</div>
      <div className="info-value">{value || '-'}</div>
    </div>
  );
}
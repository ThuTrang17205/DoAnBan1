import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './EmployerStatistics.css';

const EmployerStatistics = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalViews: 0,
    avgApplicationsPerJob: 0
  });

  const [jobStats, setJobStats] = useState([]);
  const [applicationTrend, setApplicationTrend] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Lấy thống kê tổng quan
      const statsRes = await axios.get('http://localhost:5000/api/employer/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Lấy danh sách công việc
      const jobsRes = await axios.get('http://localhost:5000/api/employer/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      
      const appsRes = await axios.get('http://localhost:5000 /api/employers/me/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jobs = jobsRes.data.jobs || [];
      const applications = appsRes.data.applications || [];

      
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(a => a.status === 'pending').length;
      const approvedApplications = applications.filter(a => a.status === 'approved').length;
      const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
      const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalViews,
        avgApplicationsPerJob
      });

     
      const jobStatsData = jobs.map(job => ({
        name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
        applications: applications.filter(a => a.job_id === job.id).length,
        views: job.views || 0
      })).sort((a, b) => b.applications - a.applications).slice(0, 10);

      setJobStats(jobStatsData);

      
      const categoryMap = {};
      jobs.forEach(job => {
        const category = job.category || 'Khác';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category]++;
      });

      const categoryData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
      }));

      setCategoryStats(categoryData);

      
      const trendData = getLast30DaysTrend(applications);
      setApplicationTrend(trendData);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLast30DaysTrend = (applications) => {
    const today = new Date();
    const last30Days = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = applications.filter(app => {
        const appDate = new Date(app.created_at).toISOString().split('T')[0];
        return appDate === dateStr;
      }).length;

      last30Days.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        applications: count
      });
    }

    return last30Days;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="statistics-loading">
        <div className="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="employer-statistics">
      <div className="statistics-header">
        <h1> Thống kê & Báo cáo</h1>
        <button className="btn-refresh" onClick={fetchStatistics}>
           Làm mới
        </button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="stats-overview">
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Tổng số tin tuyển dụng</h3>
            <p className="stat-number">{stats.totalJobs}</p>
            <span className="stat-sub">Đang hoạt động: {stats.activeJobs}</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-content">
            <h3>Tin đang tuyển</h3>
            <p className="stat-number">{stats.activeJobs}</p>
            <span className="stat-sub">
              {stats.totalJobs > 0 ? ((stats.activeJobs / stats.totalJobs) * 100).toFixed(0) : 0}% tổng số
            </span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-content">
            <h3>Tổng ứng viên</h3>
            <p className="stat-number">{stats.totalApplications}</p>
            <span className="stat-sub">TB: {stats.avgApplicationsPerJob} ứng viên/tin</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-content">
            <h3>Chờ xét duyệt</h3>
            <p className="stat-number">{stats.pendingApplications}</p>
            <span className="stat-sub">
              {stats.totalApplications > 0 
                ? ((stats.pendingApplications / stats.totalApplications) * 100).toFixed(0) 
                : 0}% tổng số
            </span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <h3>Đã chấp nhận</h3>
            <p className="stat-number">{stats.approvedApplications}</p>
            <span className="stat-sub">Tỷ lệ: {stats.totalApplications > 0 ? ((stats.approvedApplications / stats.totalApplications) * 100).toFixed(0) : 0}%</span>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-content">
            <h3>Đã từ chối</h3>
            <p className="stat-number">{stats.rejectedApplications}</p>
            <span className="stat-sub">Tỷ lệ: {stats.totalApplications > 0 ? ((stats.rejectedApplications / stats.totalApplications) * 100).toFixed(0) : 0}%</span>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-content">
            <h3>Tổng lượt xem</h3>
            <p className="stat-number">{stats.totalViews}</p>
            <span className="stat-sub">TB: {stats.totalJobs > 0 ? (stats.totalViews / stats.totalJobs).toFixed(0) : 0} lượt/tin</span>
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-content">
            <h3>Hiệu suất</h3>
            <p className="stat-number">{stats.avgApplicationsPerJob}</p>
            <span className="stat-sub">Ứng viên trung bình/tin</span>
          </div>
        </div>
      </div>

      {/* Biểu đồ xu hướng ứng tuyển */}
      <div className="chart-section">
        <h2>📈 Xu hướng ứng tuyển (30 ngày gần nhất)</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Số lượng ứng tuyển"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="chart-section">
        <h2> Top 10 công việc có nhiều ứng viên nhất</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={jobStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#82ca9d" name="Số ứng viên" />
              <Bar dataKey="views" fill="#8884d8" name="Lượt xem" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      {categoryStats.length > 0 && (
        <div className="chart-section">
          <h2> Phân bố công việc theo danh mục</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bảng chi tiết */}
      <div className="stats-table-section">
        <h2> Chi tiết thống kê từng công việc</h2>
        <div className="stats-table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên công việc</th>
                <th>Số ứng viên</th>
                <th>Lượt xem</th>
                <th>Tỷ lệ chuyển đổi</th>
              </tr>
            </thead>
            <tbody>
              {jobStats.map((job, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{job.name}</td>
                  <td>
                    <span className="badge badge-primary">{job.applications}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{job.views}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {job.views > 0 ? ((job.applications / job.views) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="insights-section">
        <h2> Nhận xét & Đề xuất</h2>
        <div className="insights-grid">
          {stats.avgApplicationsPerJob < 5 && (
            <div className="insight-card warning">
              <div>
                <h4>Số lượng ứng viên thấp</h4>
                <p>Trung bình mỗi tin chỉ có {stats.avgApplicationsPerJob} ứng viên. Hãy cải thiện mô tả công việc và tăng mức lương để thu hút thêm ứng viên.</p>
              </div>
            </div>
          )}

          {stats.pendingApplications > stats.totalApplications * 0.5 && (
            <div className="insight-card info">
              <div>
                <h4>Nhiều hồ sơ chờ xét duyệt</h4>
                <p>Có {stats.pendingApplications} hồ sơ đang chờ. Hãy xem xét sớm để không bỏ lỡ ứng viên tiềm năng!</p>
              </div>
            </div>
          )}

          {stats.activeJobs === 0 && (
            <div className="insight-card danger">
              <div>
                <h4>Không có tin tuyển dụng hoạt động</h4>
                <p>Hiện tại bạn không có tin tuyển dụng nào đang hoạt động. Hãy đăng tin mới để tiếp tục tuyển dụng!</p>
              </div>
            </div>
          )}

          {stats.approvedApplications / stats.totalApplications > 0.7 && stats.totalApplications > 10 && (
            <div className="insight-card success">
              <div>
                <h4>Tỷ lệ chấp nhận cao</h4>
                <p>Tuyệt vời! Bạn đang chấp nhận {((stats.approvedApplications / stats.totalApplications) * 100).toFixed(0)}% ứng viên. Tiếp tục duy trì chất lượng tuyển dụng!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerStatistics;
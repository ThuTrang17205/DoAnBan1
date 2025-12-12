import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobApplications.css';

export default function JobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

  const fetchJobAndApplications = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log(' Token exists:', !!token);
    
    if (!token) {
      navigate('/employer-login');
      return;
    }

    console.log(' Fetching applications for job ID:', id);

    // Fetch job info
    const jobUrl = `http://localhost:5000/api/employers/me/jobs/${id}`;
    console.log(' Calling job API:', jobUrl);
    
    const jobResponse = await fetch(jobUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(' Job response status:', jobResponse.status);

    if (jobResponse.ok) {
      const jobData = await jobResponse.json();
      console.log(' Job data:', jobData);
      setJob(jobData.job);
    } else {
      const errorText = await jobResponse.text();
      console.error(' Job error:', errorText);
    }

    // Fetch applications for this job
    const appsUrl = `http://localhost:5000/api/employers/me/applications?jobId=${id}`;
    console.log(' Calling applications API:', appsUrl);
    
    const appsResponse = await fetch(appsUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(' Applications response status:', appsResponse.status);

    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log(' Applications data:', appsData);
      console.log(' Total applications:', appsData.applications?.length);
      console.log(' Applications array:', appsData.applications);
      setApplications(appsData.applications || []);
    } else {
      const errorText = await appsResponse.text();
      console.error('❌ Applications error:', errorText);
    }

    setLoading(false);
  } catch (error) {
    console.error(' Error fetching data:', error);
    setLoading(false);
  }
};

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(` Đã ${newStatus === 'approved' ? 'chấp nhận' : 'từ chối'} ứng viên`);
        fetchJobAndApplications();
      } else {
        alert(' Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(' Có lỗi xảy ra');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="job-applications-page">
      <header className="page-header">

        <div>
          <h1>Danh sách ứng viên</h1>
          {job && <p className="job-title">Tin tuyển dụng: {job.title}</p>}
        </div>
      </header>

      <div className="applications-container">
        {/* Filters */}
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({applications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Đã chấp nhận ({applications.filter(a => a.status === 'approved' || a.status === 'accepted').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Đã từ chối ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có ứng viên nào</p>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map(app => (
              <ApplicationCard 
                key={app.id} 
                application={app}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ application, onStatusChange }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '⏳ Chờ duyệt', class: 'pending' },
      approved: { text: ' Đã chấp nhận', class: 'approved' },
      accepted: { text: ' Đã chấp nhận', class: 'approved' },
      rejected: { text: ' Đã từ chối', class: 'rejected' }
    };
    return badges[status] || badges.pending;
  };

  const badge = getStatusBadge(application.status);

  return (
    <div className="application-card">
      <div className="app-header">
        <div className="candidate-info">
          <h3>{application.user_name || 'Ứng viên'}</h3>
          <p className="email"> {application.user_email}</p>
          {application.user_phone && <p className="phone">{application.user_phone}</p>}
        </div>
        <span className={`status-badge ${badge.class}`}>{badge.text}</span>
      </div>

      {application.cover_letter && (
        <div className="cover-letter">
          <h4>Thư xin việc:</h4>
          <p>{application.cover_letter}</p>
        </div>
      )}

      <div className="app-meta">
        <span>📅 Ứng tuyển: {new Date(application.created_at).toLocaleDateString('vi-VN')}</span>
      </div>

      {application.status === 'pending' && (
        <div className="app-actions">
          <button 
            className="btn-approve"
            onClick={() => onStatusChange(application.id, 'approved')}
          >
             Chấp nhận
          </button>
          <button 
            className="btn-reject"
            onClick={() => onStatusChange(application.id, 'rejected')}
          >
             Từ chối
          </button>
        </div>
      )}
    </div>
  );
}
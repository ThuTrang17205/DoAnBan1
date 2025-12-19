import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminJobs.css';

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      setApplication(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Không thể tải thông tin application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('Cập nhật trạng thái thành công!');
      fetchApplicationDetail(); 
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Lỗi khi cập nhật trạng thái!');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa application này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      alert('Xóa application thành công!');
      navigate('/admin/applications');
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Lỗi khi xóa application!');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Chờ xử lý', class: 'badge-pending' },
      reviewed: { text: 'Đã xem', class: 'badge-reviewed' },
      accepted: { text: 'Chấp nhận', class: 'badge-accepted' },
      rejected: { text: 'Từ chối', class: 'badge-rejected' }
    };
    const badge = badges[status] || { text: status, class: 'badge-default' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    if (!max) return `Từ ${parseInt(min).toLocaleString('vi-VN')} VNĐ`;
    if (!min) return `Đến ${parseInt(max).toLocaleString('vi-VN')} VNĐ`;
    return `${parseInt(min).toLocaleString('vi-VN')} - ${parseInt(max).toLocaleString('vi-VN')} VNĐ`;
  };

  if (loading) {
    return (
      <div className="admin-jobs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="admin-jobs-container">
        <div className="error-message">
          <h2> Lỗi</h2>
          <p>{error || 'Không tìm thấy application'}</p>
          <button onClick={() => navigate('/admin/applications')} className="btn-primary">
             Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">
      {}
      <div className="page-header">
        <div>
          <h1> Chi tiết Application #{id}</h1>
          <p>Thông tin đầy đủ về đơn ứng tuyển</p>
        </div>
      </div>

      
      <div className="detail-container">
        
        <div className="detail-card">
          <div className="card-header">
            <h2> Thông tin ứng tuyển</h2>
            {getStatusBadge(application.status)}
          </div>
          
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{application.id}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Ngày ứng tuyển:</span>
                <span className="info-value">
                  {new Date(application.ngay_ung_tuyen).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="info-item full-width">
                <span className="info-label">Trạng thái:</span>
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select-large"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="reviewed">Đã xem</option>
                  <option value="accepted">Chấp nhận</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        
        <div className="detail-card">
          <div className="card-header">
            <h2> Thông tin ứng viên</h2>
          </div>
          
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">ID User:</span>
                <span className="info-value">{application.user_id}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">{application.user_name || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Username:</span>
                <span className="info-value">{application.username || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">
                  <a href={`mailto:${application.user_email}`} className="link">
                    {application.user_email || '-'}
                  </a>
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Số điện thoại:</span>
                <span className="info-value">
                  {application.user_phone ? (
                    <a href={`tel:${application.user_phone}`} className="link">
                      {application.user_phone}
                    </a>
                  ) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2> Thông tin công việc</h2>
          </div>
          
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">ID Job:</span>
                <span className="info-value">{application.job_id}</span>
              </div>
              
              <div className="info-item full-width">
                <span className="info-label">Tiêu đề:</span>
                <span className="info-value font-bold">{application.job_title || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Công ty:</span>
                <span className="info-value">{application.company_name || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Địa điểm:</span>
                <span className="info-value">{application.location || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Hình thức:</span>
                <span className="info-value">{application.job_type || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Kinh nghiệm:</span>
                <span className="info-value">{application.experience || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Danh mục:</span>
                <span className="info-value">{application.category || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Mức lương:</span>
                <span className="info-value">
                  {formatSalary(application.min_salary, application.max_salary)}
                </span>
              </div>
              
              {application.description && (
                <div className="info-item full-width">
                  <span className="info-label">Mô tả công việc:</span>
                  <div className="info-value description-box">
                    {application.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

       
        <div className="detail-actions">
          <button
            className="btn-danger"
            onClick={handleDelete}
          >
             Xóa Application
          </button>
          
          <button
            className="btn-secondary"
            onClick={() => navigate(`/admin/users/${application.user_id}`)}
          >
             Xem hồ sơ ứng viên
          </button>
          
          <button
            className="btn-secondary"
            onClick={() => navigate(`/admin/jobs/${application.job_id}`)}
          >
             Xem chi tiết công việc
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetail;
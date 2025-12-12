import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminJobs.css';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Không thể tải danh sách applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${applicationId}/status`, {
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
      fetchApplications(); // Refresh list
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Lỗi khi cập nhật trạng thái!');
    }
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa application này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      alert('Xóa application thành công!');
      fetchApplications(); // Refresh list
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Lỗi khi xóa application!');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchApplications();
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

  if (loading && applications.length === 0) {
    return (
      <div className="admin-jobs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1> Quản lý Applications</h1>
          <p>Tổng số: {applications.length} đơn ứng tuyển</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder=" Tìm kiếm theo tên, email, công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Tìm kiếm</button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="reviewed">Đã xem</option>
          <option value="accepted">Chấp nhận</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>Lỗi {error}</p>
        </div>
      )}

      {/* Applications Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ứng viên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Công việc</th>
              <th>Công ty</th>
              <th>Địa điểm</th>
              <th>Trạng thái</th>
              <th>Ngày ứng tuyển</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                  Không có applications nào
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.user_name || '-'}</td>
                  <td>{app.user_email || '-'}</td>
                  <td>{app.user_phone || '-'}</td>
                  <td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.job_title || '-'}
                    </div>
                  </td>
                  <td>{app.company_name || '-'}</td>
                  <td>{app.location || '-'}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="reviewed">Đã xem</option>
                      <option value="accepted">Chấp nhận</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                  </td>
                  <td>{new Date(app.ngay_ung_tuyen).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                        title="Xem chi tiết"
                      >
                        Xem
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(app.id)}
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-page"
          >
            Trước
          </button>
          
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-page"
          >
            Sau 
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
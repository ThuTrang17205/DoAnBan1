import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  const jobsPerPage = 10;
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchJobs();
  }, []);

  
  useEffect(() => {
    let filtered = [...jobs];

    
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(job => job.category === filterCategory);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, jobs]);

  const fetchJobs = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    console.log(' Fetching ALL jobs...');
    
    let allJobs = [];
    let currentPage = 1;
    let hasMore = true;
    
    
    while (hasMore) {
      console.log(` Fetching page ${currentPage}...`);
      
      const response = await fetch(`http://localhost:5000/api/jobs?limit=100&page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(` Response status:`, response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      const jobsList = data.data || [];
      
      console.log(` Page ${currentPage}: ${jobsList.length} jobs`);
      
      if (jobsList.length > 0) {
        allJobs = [...allJobs, ...jobsList];
        currentPage++;
        
       
        const totalPages = data.pagination?.totalPages || 0;
        hasMore = currentPage <= totalPages;
      } else {
        hasMore = false;
      }
    }
    
    console.log(' Total loaded:', allJobs.length, 'jobs');
    
    setJobs(allJobs);
    setFilteredJobs(allJobs);
    
  } catch (err) {
    console.error(' Error fetching jobs:', err);
    setError('Không thể tải danh sách công việc: ' + err.message);
  } finally {
    setLoading(false);
  }
};
  const handleDeleteJob = async (jobId) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken'); 
    
    const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete job');
    }

    alert(' Đã xóa công việc thành công!');
    fetchJobs();
    setShowDeleteModal(false);
    setJobToDelete(null);
  } catch (err) {
    console.error('Error deleting job:', err);
    alert(' Không thể xóa công việc: ' + err.message);
  }
};

const handleUpdateStatus = async (jobId, newStatus) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken'); 
    
    const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update status');
    }

    alert(` Đã chuyển trạng thái sang "${newStatus}"!`);
    fetchJobs();
  } catch (err) {
    console.error('Error updating status:', err);
    alert(' Không thể cập nhật trạng thái: ' + err.message);
  }
};

const handleBulkDelete = async () => {
  if (!window.confirm(`Bạn có chắc muốn xóa ${selectedJobs.length} công việc đã chọn?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken'); 
    
    await Promise.all(
      selectedJobs.map(jobId =>
        fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      )
    );

    alert(` Đã xóa ${selectedJobs.length} công việc!`);
    setSelectedJobs([]);
    fetchJobs();
  } catch (err) {
    console.error('Error bulk deleting:', err);
    alert(' Có lỗi khi xóa công việc: ' + err.message);
  }
};

  const toggleSelectJob = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === currentJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(currentJobs.map(job => job.id));
    }
  };

  
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  
  const categories = [...new Set(jobs.map(job => job.category).filter(Boolean))];

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

  if (error) {
    return (
      <div className="admin-jobs-container">
        <div className="error-message">
          <h2> Lỗi</h2>
          <p>{error}</p>
          <button onClick={fetchJobs} className="btn-retry"> Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">
      {}
      <div className="page-header">
        <div>
          <h1> Quản lý Công việc</h1>
          <p>Tổng số: {filteredJobs.length} công việc</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/jobs/create')}
        >
           Thêm công việc mới
        </button>
      </div>

      {}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder=" Tìm kiếm theo tên, công ty, địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="closed">Đã đóng</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {selectedJobs.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn-danger"
            >
               Xóa {selectedJobs.length} đã chọn
            </button>
          )}
        </div>
      </div>

      
      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedJobs.length === currentJobs.length && currentJobs.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Công ty</th>
              <th>Địa điểm</th>
              <th>Danh mục</th>
              <th>Lương</th>
              <th>Trạng thái</th>
              <th>Ngày đăng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                  <div>
                    <p style={{ fontSize: '48px', margin: 0 }}>📭</p>
                    <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
                      Không tìm thấy công việc nào
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleSelectJob(job.id)}
                    />
                  </td>
                  <td>#{job.id}</td>
                  <td>
                    <div className="job-title-cell">
                      <strong>{job.title}</strong>
                      {job.job_type && (
                        <span className="job-type-badge">{job.job_type}</span>
                      )}
                    </div>
                  </td>
                  <td>{job.company_name || job.company || '-'}</td>
                  <td>{job.location || '-'}</td>
                  <td>
                    <span className="category-badge">{job.category || '-'}</span>
                  </td>
                  <td>{job.salary || '-'}</td>
                  <td>
                    <select
                      value={job.status || 'open'}
                      onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                      className={`status-select status-${job.status || 'open'}`}
                    >
                      <option value="open">Đang mở</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </td>
                  <td>
                    {job.posted_at
                      ? new Date(job.posted_at).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        title="Xem chi tiết"
                      >
                        Xem
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                        title="Chỉnh sửa"
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          setJobToDelete(job);
                          setShowDeleteModal(true);
                        }}
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

      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
             Trước
          </button>

          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau 
          </button>
        </div>
      )}

      
      {showDeleteModal && jobToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2> Xác nhận xóa</h2>
            <p>Bạn có chắc muốn xóa công việc:</p>
            <p style={{ fontWeight: 'bold', margin: '10px 0' }}>
              "{jobToDelete.title}" tại {jobToDelete.company_name}?
            </p>
            <p style={{ color: '#e74c3c', fontSize: '14px' }}>
              Hành động này không thể hoàn tác!
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteJob(jobToDelete.id)}
                className="btn-confirm-delete"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
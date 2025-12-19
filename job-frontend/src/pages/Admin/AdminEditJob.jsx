import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminJobs.css';

const AdminEditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: '',
    experience: '',
    category: '',
    min_salary: '',
    max_salary: '',
    description: '',
    status: 'open'
  });

  // Fetch job data
  useEffect(() => {
    fetchJobData();
  }, [id]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }

      const data = await response.json();
      const job = data.data || data;
      
      setFormData({
        title: job.title || '',
        company_name: job.company_name || '',
        location: job.location || '',
        job_type: job.job_type || '',
        experience: job.experience || '',
        category: job.category || '',
        min_salary: job.min_salary || '',
        max_salary: job.max_salary || '',
        description: job.description || '',
        status: job.status || 'open'
      });
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    const response = await fetch(`http://localhost:5000/api/admin/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Failed to update job');
    }

    const data = await response.json();
    console.log('Job updated:', data);
    
    alert('Cập nhật công việc thành công!');
    
    navigate('/admin/jobs');
    
  } catch (error) {
    console.error('Error updating job:', error);
    alert('Lỗi khi cập nhật công việc!');
    setError('Không thể cập nhật công việc. Vui lòng thử lại.');
  }
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

  if (error) {
    return (
      <div className="admin-jobs-container">
        <div className="error-message">
          <h2> Lỗi</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/admin/jobs')} className="btn-primary">
             Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">

      <div className="page-header">
        <div>
          <h1> Chỉnh sửa Công việc {id}</h1>
          <p>Cập nhật thông tin công việc</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="edit-job-form">
          <div className="form-grid">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Tiêu đề công việc *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="VD: Senior Backend Developer"
              />
            </div>

            {/* Company Name */}
            <div className="form-group">
              <label htmlFor="company_name">Tên công ty *</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="VD: FPT Software"
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Địa điểm *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="VD: Hà Nội"
              />
            </div>

            {/* Job Type */}
            <div className="form-group">
              <label htmlFor="job_type">Hình thức làm việc *</label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn hình thức --</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience">Kinh nghiệm *</label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn kinh nghiệm --</option>
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Danh mục *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="VD: IT, Marketing, Kế toán..."
              />
            </div>

            {/* Min Salary */}
            <div className="form-group">
              <label htmlFor="min_salary">Lương tối thiểu (VNĐ)</label>
              <input
                type="number"
                id="min_salary"
                name="min_salary"
                value={formData.min_salary}
                onChange={handleChange}
                placeholder="VD: 10000000"
              />
            </div>

            {/* Max Salary */}
            <div className="form-group">
              <label htmlFor="max_salary">Lương tối đa (VNĐ)</label>
              <input
                type="number"
                id="max_salary"
                name="max_salary"
                value={formData.max_salary}
                onChange={handleChange}
                placeholder="VD: 20000000"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Trạng thái *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="open">Đang mở</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description">Mô tả công việc *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="10"
              placeholder="Nhập mô tả chi tiết về công việc..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/admin/jobs')}
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
               Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditJob;
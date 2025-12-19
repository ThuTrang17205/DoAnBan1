import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateJob.css';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]); 
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid-level',
    min_salary: '',
    max_salary: '',
    currency: 'VND',
    description: '',
    requirements: '',
    benefits: '',
    deadline: '',
    positions: 1
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  try {
    setLoadingCategories(true);
    const response = await axios.get('http://localhost:5000/api/categories');
    
    console.log('Full response:', response.data);
    console.log('Type of categories:', typeof response.data.categories);
    console.log('Is array?', Array.isArray(response.data.categories));
    
    let categoriesData = [];
    
    if (response.data.categories && Array.isArray(response.data.categories)) {
      categoriesData = response.data.categories;
    } else if (Array.isArray(response.data)) {
      categoriesData = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      categoriesData = response.data.data;
    }
    
    console.log('Final categories:', categoriesData);
    setCategories(categoriesData);
    setLoadingCategories(false); 
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    setCategories([]); 
    setLoadingCategories(false);
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
    
    if (!formData.title || formData.title.trim().length < 5) {
      alert(' Tiêu đề công việc phải có ít nhất 5 ký tự!');
      return;
    }
    
    if (!formData.category) {
      alert(' Vui lòng chọn danh mục!');
      return;
    }
    
    if (!formData.location || formData.location.trim().length < 2) {
      alert(' Địa điểm phải có ít nhất 2 ký tự!');
      return;
    }
    
    if (!formData.description || formData.description.trim().length < 50) {
      alert(' Mô tả công việc phải có ít nhất 50 ký tự!');
      return;
    }
    
    if (!formData.requirements || formData.requirements.trim().length < 20) {
      alert(' Yêu cầu ứng viên phải có ít nhất 20 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
     
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const companyName = user.company_name || user.companyName || user.company || 'Công ty chưa cập nhật';

      console.log(' User info:', user);
      console.log(' Company name:', companyName);
      
      //  Tạo object jobData với đầy đủ thông tin
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        benefits: formData.benefits?.trim() || null,
        location: formData.location.trim(),
        job_type: formData.job_type,       
        experience_level: formData.experience_level, 
        category: formData.category,
        company_name: companyName, 
        min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
        currency: formData.currency,
        positions: parseInt(formData.positions) || 1,
        deadline: formData.deadline || null,
      };


    
      if (formData.min_salary) jobData.minSalary = parseInt(formData.min_salary);
      if (formData.max_salary) jobData.maxSalary = parseInt(formData.max_salary);
      if (formData.currency) jobData.currency = formData.currency;
      if (formData.benefits && formData.benefits.trim()) jobData.benefits = formData.benefits.trim();
      if (formData.deadline) jobData.deadline = formData.deadline;

      console.log(' Sending job data:', jobData);

      const response = await axios.post(
        'http://localhost:5000/api/employers/me/jobs',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(' Response:', response.data);

      if (response.data.success) {
        alert(' Đăng tin tuyển dụng thành công!');
        navigate('/employer-dashboard');
      }
    } catch (error) {
      console.error(' Error creating job:', error);
      console.error(' Error response:', error.response?.data);
      
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, msg]) => `- ${msg}`)
          .join('\n');
        alert(`Lỗi :\n\n${errorMessages}`);
      } else {
        alert(' Lỗi: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="create-job-container">
        {/* Header */}
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/employer-dashboard')}
          >
            ← Quay lại
          </button>
          <div>
            <h1> Đăng tin tuyển dụng mới</h1>
            <p className="subtitle">Điền thông tin chi tiết để tìm ứng viên phù hợp</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-job-form">
          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h2> Thông tin cơ bản</h2>
            
            <div className="form-group">
              <label htmlFor="title">
                Tiêu đề công việc <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Nhân viên Marketing"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  Danh mục <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {}
                  {loadingCategories ? (
                    <option disabled>⏳ Đang tải danh mục...</option>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option disabled> Không có danh mục</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Địa điểm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="VD: Hà Nội"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job_type">Loại hình công việc</label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experience_level">Cấp độ kinh nghiệm</label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                >
                  <option value="internship">Thực tập sinh</option>
                  <option value="entry-level">Mới tốt nghiệp</option>
                  <option value="mid-level">Trung cấp (2-5 năm)</option>
                  <option value="senior">Cao cấp (5+ năm)</option>
                  <option value="manager">Quản lý</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="positions">Số lượng tuyển</label>
                <input
                  type="number"
                  id="positions"
                  name="positions"
                  value={formData.positions}
                  onChange={handleChange}
                  min="1"
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Hạn nộp hồ sơ</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Mức lương */}
          <div className="form-section">
            <h2> Mức lương</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min_salary">Lương tối thiểu</label>
                <input
                  type="number"
                  id="min_salary"
                  name="min_salary"
                  value={formData.min_salary}
                  onChange={handleChange}
                  placeholder="VD: 10000000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="max_salary">Lương tối đa</label>
                <input
                  type="number"
                  id="max_salary"
                  name="max_salary"
                  value={formData.max_salary}
                  onChange={handleChange}
                  placeholder="VD: 15000000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Đơn vị</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="salary-preview">
              {formData.min_salary && formData.max_salary ? (
                <span>
                   Mức lương: {parseInt(formData.min_salary).toLocaleString()} - {parseInt(formData.max_salary).toLocaleString()} {formData.currency}
                </span>
              ) : (
                <span className="text-muted">Hoặc để trống nếu thỏa thuận</span>
              )}
            </div>
          </div>

          {/* Mô tả công việc */}
          <div className="form-section">
            <h2> Mô tả công việc</h2>
            
            <div className="form-group">
              <label htmlFor="description">
                Mô tả chi tiết <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Mô tả chi tiết về công việc, trách nhiệm chính..."
                required
              />
              <span className="char-count">{formData.description.length} ký tự</span>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">
                Yêu cầu ứng viên <span className="required">*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="6"
                placeholder="Các yêu cầu về kỹ năng, bằng cấp, kinh nghiệm..."
                required
              />
              <span className="char-count">{formData.requirements.length} ký tự</span>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Quyền lợi</label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows="5"
                placeholder="Các quyền lợi: bảo hiểm, thưởng, đào tạo..."
              />
              <span className="char-count">{formData.benefits.length} ký tự</span>
            </div>
          </div>

          {/* Preview */}
          <div className="form-section preview-section">
            <h2> Xem trước</h2>
            <div className="job-preview">
              <h3>{formData.title || 'Tiêu đề công việc'}</h3>
              <div className="preview-meta">
                <span>📍 {formData.location || 'Địa điểm'}</span>
                <span> {formData.job_type || 'Loại hình'}</span>
                <span> {formData.experience_level || 'Cấp độ'}</span>
                {formData.min_salary && formData.max_salary && (
                  <span> {parseInt(formData.min_salary).toLocaleString()} - {parseInt(formData.max_salary).toLocaleString()} {formData.currency}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/employer-dashboard')}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Đang đăng...
                </>
              ) : (
                <>
                   Đăng tin tuyển dụng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
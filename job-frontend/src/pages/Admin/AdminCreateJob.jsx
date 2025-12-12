import React, { useState } from 'react';

const CreateJob = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    company_name: '',
    location: '',
    min_salary: '',
    max_salary: '',
    currency: 'VND',
    salary: '',
    category: '',
    job_type: '',
    experience: '',
    description: '',
    requirements: '',
    benefits: '',
    url: '',
    original_url: '',
    source: '',
    deadline: '',
    status: 'open'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const jobData = { ...formData };
      
      if (jobData.min_salary) jobData.min_salary = parseFloat(jobData.min_salary);
      if (jobData.max_salary) jobData.max_salary = parseFloat(jobData.max_salary);
      
      Object.keys(jobData).forEach(key => {
        if (jobData[key] === '' || jobData[key] === null) {
          delete jobData[key];
        }
      });

      const response = await fetch('http://localhost:5000/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin/jobs';
      }, 1500);
    } catch (error) {
      console.error('Error creating job:', error);
      alert(' Lỗi khi tạo công việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div style={styles.container}>
      {success && (
        <div style={styles.successAlert}>
           Tạo công việc thành công! Đang chuyển hướng...
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Thêm Công Việc Mới</h1>
        <button onClick={handleBack} style={styles.backBtn}>
          ← Quay lại
        </button>
      </div>

      <div style={styles.formContainer}>
        <div style={styles.grid}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Tiêu đề công việc <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: Frontend Developer"
            />
          </div>

          {/* Company */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Công ty <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: FPT Software"
            />
          </div>

          {/* Company Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên công ty (hiển thị)</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: FPT Software Vietnam"
            />
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Địa điểm <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: Hà Nội"
            />
          </div>

          {/* Category */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Chọn danh mục</option>
              <option value="IT">Công nghệ thông tin</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Kinh doanh</option>
              <option value="Finance">Tài chính</option>
              <option value="HR">Nhân sự</option>
              <option value="Design">Thiết kế</option>
              <option value="Engineering">Kỹ thuật</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          {/* Job Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Loại công việc</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Chọn loại</option>
              <option value="Full-time">Toàn thời gian</option>
              <option value="Part-time">Bán thời gian</option>
              <option value="Contract">Hợp đồng</option>
              <option value="Internship">Thực tập</option>
              <option value="Remote">Từ xa</option>
            </select>
          </div>

          {/* Experience */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Kinh nghiệm</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 1-3 năm"
            />
          </div>

          {/* Min Salary */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Lương tối thiểu</label>
            <input
              type="number"
              name="min_salary"
              value={formData.min_salary}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 15000000"
              step="0.01"
            />
          </div>

          {/* Max Salary */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Lương tối đa</label>
            <input
              type="number"
              name="max_salary"
              value={formData.max_salary}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 25000000"
              step="0.01"
            />
          </div>

          {/* Currency */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Đơn vị tiền tệ</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Salary Text */}
          <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
            <label style={styles.label}>Mô tả lương (văn bản)</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 15-25 triệu VND"
            />
          </div>

          {/* Description */}
          <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
            <label style={styles.label}>Mô tả công việc</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              rows="5"
              placeholder="Nhập mô tả chi tiết về công việc..."
            />
          </div>

          {/* Requirements */}
          <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
            <label style={styles.label}>Yêu cầu</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              style={styles.textarea}
              rows="5"
              placeholder="Nhập các yêu cầu của công việc..."
            />
          </div>

          {/* Benefits */}
          <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
            <label style={styles.label}>Quyền lợi</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              style={styles.textarea}
              rows="5"
              placeholder="Nhập các quyền lợi của ứng viên..."
            />
          </div>

          {/* URL */}
          <div style={styles.formGroup}>
            <label style={styles.label}>URL công việc</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://example.com/job"
            />
          </div>

          {/* Original URL */}
          <div style={styles.formGroup}>
            <label style={styles.label}>URL gốc</label>
            <input
              type="url"
              name="original_url"
              value={formData.original_url}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://example.com/original"
            />
          </div>

          {/* Source */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nguồn</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: LinkedIn, CareerViet"
            />
          </div>

          {/* Deadline */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Hạn nộp</label>
            <input
              type="text"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 31/12/2025"
            />
          </div>

          {/* Status */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="open">Đang tuyển</option>
              <option value="closed">Đã đóng</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={styles.btnGroup}>
          <button 
            onClick={handleSubmit}
            style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
            disabled={loading}
          >
            {loading ? ' Đang tạo...' : ' Tạo công việc'}
          </button>
          <button 
            onClick={handleBack}
            style={{...styles.cancelBtn, opacity: loading ? 0.6 : 1}}
            disabled={loading}
          >
             Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  successAlert: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#333',
    margin: 0
  },
  backBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#555',
    fontSize: '0.9rem'
  },
  required: {
    color: '#e53e3e'
  },
  input: {
    padding: '0.7rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '0.7rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  textarea: {
    padding: '0.7rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  btnGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  submitBtn: {
    padding: '0.8rem 2rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  cancelBtn: {
    padding: '0.8rem 2rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};

export default CreateJob;
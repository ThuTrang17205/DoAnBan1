import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CategoriesSection.css";

// ==================== CATEGORIES SECTION ====================
export function CategoriesSection() {
  const navigate = useNavigate();

  const categories = [
    { 
      name: "Công nghệ thông tin", 
      
      slug: "cong-nghe-thong-tin" 
    },
    { 
      name: "Kinh doanh - Bán hàng", 
      
      slug: "kinh-doanh-ban-hang" 
    },
    { 
      name: "Marketing - Truyền thông", 
      
      slug: "marketing-truyen-thong" 
    },
    { 
      name: "Kế toán - Tài chính - Ngân hàng",  
       
      slug: "ke-toan-tai-chinh" 
    },
    { 
      name: "Bất động sản", 
      
      slug: "bat-dong-san" 
    },
    { 
      name: "Thiết kế - Đồ hoạ", 
       
      slug: "thiet-ke-do-hoa" 
    }
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="section-title">Ngành nghề nổi bật</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.slug}
              className="category-card"
              onClick={() => navigate(`/category/${cat.slug}`)}
            >
              <span className="category-icon">{cat.icon}</span>
              <h3 className="category-name">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CATEGORY JOBS PAGE ====================
export function CategoryJobsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  // ✅ SỬA: Đồng bộ tên category với backend
  const categoryNames = {
    "cong-nghe-thong-tin": "Công nghệ thông tin",
    "ke-toan-tai-chinh": "Kế toán - Tài chính - Ngân hàng",  // ✅ Thêm "- Ngân hàng"
    "kinh-doanh-ban-hang": "Kinh doanh - Bán hàng",
    "marketing-truyen-thong": "Marketing - Truyền thông",
    "nhan-su-hanh-chinh": "Nhân sự - Hành chính",
    "thiet-ke-do-hoa": "Thiết kế - Đồ hoạ",
    "ky-thuat-xay-dung": "Kỹ thuật - Xây dựng",
    "giao-duc-dao-tao": "Giáo dục - Đào tạo",
    "bat-dong-san": "Bất động sản",
    "lao-dong-pho-thong": "Lao động phổ thông",
    "nha-hang-khach-san": "Nhà hàng - Khách sạn",
    "dich-vu-khach-hang": "Dịch vụ - Khách hàng",
    "quan-ly-cap-cao": "Quản lý / Cấp cao",
    "khac": "Khác"
  };

  const displayCategoryName = categoryNames[category] || category;

  useEffect(() => {
    fetchJobsByCategory();
  }, [category]);

  const fetchJobsByCategory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/jobs/category/${displayCategoryName}`);
      setJobs(response.data);
      setCurrentPage(0);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs by category:", err);
      setError("Không thể tải công việc theo ngành nghề");
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading">Đang tải việc làm...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="category-jobs-page">
      {/* Header */}
      <div className="category-header">
        <div className="header-content">
          <h1 className="category-title">{displayCategoryName}</h1>
          <p className="jobs-count">
            Tìm thấy <strong>{jobs.length}</strong> công việc
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="category-jobs-container">
        {currentJobs.length === 0 ? (
          <div className="no-jobs">
            <p>Chưa có công việc nào trong ngành này</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {currentJobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                </div>

                <div className="job-card-body">
                  <div className="job-info-item">
                    <span className="icon">📍</span>
                    <span className="info-text">{job.location || "Không xác định"}</span>
                  </div>
                  
                  {job.min_salary && job.max_salary && (
                    <div className="job-info-item">
                      <span className="icon">💰</span>
                      <span className="info-text">
                        {(job.min_salary / 1000000).toFixed(0)} - {(job.max_salary / 1000000).toFixed(0)} triệu {job.currency}
                      </span>
                    </div>
                  )}
                </div>

                <div className="job-card-footer">
                  <span className="category-badge">{job.category}</span>
                  <span className="view-detail">Xem chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
            >
              ‹ Trước
            </button>
            
            <div className="pagination-info">
              Trang {currentPage + 1} / {totalPages}
            </div>
            
            <button
              className="pagination-btn"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Sau ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
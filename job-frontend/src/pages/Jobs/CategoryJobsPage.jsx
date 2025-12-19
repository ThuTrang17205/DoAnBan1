import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CategoryJobsPage.css";

export function CategoriesSection() {
  const navigate = useNavigate();

  const categories = [
    { 
      name: "IT - Phần mềm", 
      slug: "cong-nghe-thong-tin",
      count: 1250,
      color: '#667eea'
    },
    { 
      name: "Marketing",  
      slug: "marketing-truyen-thong",
      count: 890,
      color: '#f093fb'
    },
    { 
      name: "Kinh doanh", 
      slug: "kinh-doanh-ban-hang",
      count: 756,
      color: '#4facfe'
    },
    { 
      name: "Thiết kế",
      slug: "thiet-ke-do-hoa",
      count: 543,
      color: '#fa709a'
    },
    { 
      name: "Tài chính",
      slug: "ke-toan-tai-chinh",
      count: 432,
      color: '#30cfd0'
    },
    { 
      name: "Nhân sự",
      slug: "nhan-su-hanh-chinh",
      count: 321,
      color: '#a8edea'
    },
    { 
      name: "Giáo dục", 
      slug: "giao-duc-dao-tao",
      count: 298,
      color: '#fbc2eb'
    },
    { 
      name: "Y tế",
      slug: "y-te",
      count: 267,
      color: '#92fe9d'
    }
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="section-title">Khám phá theo ngành nghề</h2>
        <p className="section-subtitle">Tìm công việc phù hợp với chuyên môn của bạn</p>
        
        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.slug}
              className="category-card"
              onClick={() => navigate(`/category/${cat.slug}`)}
              style={{ '--category-color': cat.color }}
            >
              {/* TÊN NGÀNH */}
              <div className="category-info">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-count">{cat.count} việc làm</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-action">
          <button
            className="btn-view-all"
            onClick={() => navigate('/jobs')}
          >
            Xem tất cả ngành nghề
          </button>
        </div>
      </div>
    </section>
  );
}



export function CategoryJobsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const categoryNames = {
    "cong-nghe-thong-tin": "Công nghệ thông tin",
    "ke-toan-tai-chinh": "Kế toán - Tài chính - Ngân hàng",
    "marketing-truyen-thong": "Marketing - Truyền thông",
    "kinh-doanh-ban-hang": "Kinh doanh - Bán hàng",
    "ky-thuat-xay-dung": "Kỹ thuật - Xây dựng",
    "dich-vu-khach-hang": "Dịch vụ - Khách hàng",
    "nhan-su-hanh-chinh": "Nhân sự - Hành chính",
    "thiet-ke-do-hoa": "Thiết kế - Đồ hoạ",
    "giao-duc-dao-tao": "Giáo dục - Đào tạo",
    "bat-dong-san": "Bất động sản",
    "lao-dong-pho-thong": "Lao động phổ thông",
    "nha-hang-khach-san": "Nhà hàng - Khách sạn",
    "quan-ly-cap-cao": "Quản lý / Cấp cao",
    "khac": "Khác"
  };

  const displayCategoryName = categoryNames[category] || category;

  useEffect(() => {
    fetchJobsByCategory();
  }, [category, currentPage]);

  const fetchJobsByCategory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/jobs/category/${category}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      console.log(" Category response:", response.data);
      
      const jobsData = response.data.jobs || [];
      const total = response.data.total || 0;
      
      setJobs(jobsData);
      setTotalJobs(total);
      setError(null);
    } catch (err) {
      console.error(" Error fetching jobs by category:", err);
      setError("Không thể tải công việc theo ngành nghề");
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const totalPages = Math.ceil(totalJobs / itemsPerPage);

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
    return (
      <div className="category-jobs-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải việc làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-jobs-page">
        <div className="error">
          <p> {error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-jobs-page">
     
      <div className="category-header">
        <div className="header-content">
          <h1 className="category-title">{displayCategoryName}</h1>
          <p className="jobs-count">
            Tìm thấy <strong>{totalJobs}</strong> công việc
          </p>
        </div>
      </div>

     
      <div className="category-jobs-container">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <div className="no-jobs-icon">📭</div>
            <h3>Chưa có công việc nào trong ngành này</h3>
            <p>Hãy thử tìm kiếm ở các ngành nghề khác</p>
            <button onClick={() => navigate('/')} className="back-home-btn">
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company_name || job.company}</p>
                </div>

                <div className="job-card-body">
                  <div className="job-info-item">
                    <span className="icon">📍</span>
                    <span className="info-text">{job.location || "Không xác định"}</span>
                  </div>
                  
                  {job.min_salary && job.max_salary && (
                    <div className="job-info-item">
                      <span className="info-text">
                        {(job.min_salary / 1000000).toFixed(0)} - {(job.max_salary / 1000000).toFixed(0)} triệu {job.currency}
                      </span>
                    </div>
                  )}
                  
                  {(!job.min_salary || !job.max_salary) && (
                    <div className="job-info-item">
                      <span className="info-text">Thương lượng</span>
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
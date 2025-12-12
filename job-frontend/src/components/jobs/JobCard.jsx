import React from 'react';
import { Link } from 'react-router-dom';
import './JobCard.css';

const JobCard = ({ job }) => {
  if (!job) return null;

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <p className="company-name">{job.company_name}</p>
      </div>

      <p className="job-location">📍 {job.location || "Không rõ địa điểm"}</p>

      {job.salary && (
        <p className="job-salary">💰 {job.salary}</p>
      )}

      <div className="job-meta">
        <span className="job-type">{job.job_type || "Full-time"}</span>
        <span className="job-category">{job.category}</span>
      </div>

      <Link to={`/jobs/${job.id}`} className="view-detail-btn">
        Xem chi tiết →
      </Link>
    </div>
  );
};

export default JobCard;

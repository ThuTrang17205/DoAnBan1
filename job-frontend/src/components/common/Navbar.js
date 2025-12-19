import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './Navbar.css';

function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  
  const mobileMenuRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const cvDropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target)) {
        setJobsDropdownOpen(false);
      }
      if (cvDropdownRef.current && !cvDropdownRef.current.contains(event.target)) {
        setCvDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 
  useEffect(() => {
    setMobileMenuOpen(false);
    setJobsDropdownOpen(false);
    setCvDropdownOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-topcv">
      <div className="navbar-container">
        {}
        <div 
          className="navbar-logo" 
          onClick={() => handleNavigation("/")}
        >
          <h1>Job Potal</h1>
        </div>

        {}
        <div className="navbar-nav">
          {}
          <div className="nav-dropdown" ref={jobsDropdownRef}>
            <button 
              className={`nav-link-item ${location.pathname === "/" ? "active" : ""}`}
              onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
            >
              Việc làm
              <span className="dropdown-arrow">{jobsDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {jobsDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation("/")}>Tìm việc làm</button>
                <button onClick={() => handleNavigation("/jobs?q=IT")}>Việc làm IT</button>
                <button onClick={() => handleNavigation("/jobs?q=+Marketing+")}>Việc làm Marketing</button>
                <button onClick={() => handleNavigation("/jobs?q=Kinh+doanh")}>Việc làm Kinh doanh</button>
                <button onClick={() => handleNavigation("/jobs")}>Tất cả việc làm</button>
              </div>
            )}
          </div>

          {}
          <div className="nav-dropdown" ref={cvDropdownRef}>
            <button 
              className={`nav-link-item ${location.pathname === "/create-cv" ? "active" : ""}`}
              onClick={() => setCvDropdownOpen(!cvDropdownOpen)}
            >
              Tạo CV
              <span className="dropdown-arrow">{cvDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {cvDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation("/create-cv")}>Tạo CV mới</button>
                <button onClick={() => handleNavigation("/cv-templates")}>Mẫu CV</button>
                <button onClick={() => handleNavigation("/cover-letter")}>Cover Letter</button>
                <button onClick={() => handleNavigation("/guidewritring-cv")}>Hướng dẫn viết CV</button>
              </div>
            )}
          </div>
        </div>

        {}
        <div style={{ flex: 1 }}></div>

        {}
        <button 
          className="nav-link-item employer-link"
          onClick={() => handleNavigation('/employer')}
        >
          Đăng tuyển & tìm hồ sơ
        </button>

        {}
        <div className="navbar-actions">
          {!isLoggedIn ? (
            <>
              <button
                className="btn-login"
                onClick={() => handleNavigation("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="btn-register"
                onClick={() => handleNavigation("/register")}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-profile"
                onClick={() => handleNavigation("/profile")}
              >
                <img 
                  className="user-avatar" 
                  src="https://www.topcv.vn/images/avatar-default.jpg" 
                  alt="Avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://www.topcv.vn/images/avatar-default.jpg';
                  }}
                />
                <span>Tài khoản</span>
              </button>
              <button 
                className="btn-logout" 
                onClick={() => {
                  onLogout();
                  handleNavigation("/");
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>

        {}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {}
      {mobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <button 
            className={`mobile-menu-item ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => handleNavigation("/")}
          >
            Việc làm
          </button>
          <button 
            className={`mobile-menu-item ${location.pathname === "/create-cv" ? "active" : ""}`}
            onClick={() => handleNavigation("/create-cv")}
          >
            Tạo CV
          </button>
          <button 
            className="mobile-menu-item employer-link-mobile"
            onClick={() => handleNavigation('/employer')}
          >
            Đăng tuyển & tìm hồ sơ
          </button>
          
          <div className="mobile-menu-divider"></div>
          
          {!isLoggedIn ? (
            <>
              <button
                className="mobile-menu-item"
                onClick={() => handleNavigation("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="mobile-menu-item"
                onClick={() => handleNavigation("/register")}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              <button
                className={`mobile-menu-item ${location.pathname === "/profile" ? "active" : ""}`}
                onClick={() => handleNavigation("/profile")}
              >
                Tài khoản
              </button>
              <button
                className="mobile-menu-item"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
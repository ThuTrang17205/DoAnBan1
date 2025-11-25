import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { CategoriesSection, CategoryJobsPage } from "./CategoriesSection";
import ToolsSection from "./ToolsSection";
import TrendingJobsSection from "./components/TrendingJobsSection";
import CVBuilder from "./components/CVBuilder";
import UserProfile from "./components/UserProfile";
import JobDetailPage from "./components/JobDetailPage";
import JobListPage from "./components/JobListPage";
import EmployerLanding from "./components/EmployerLanding";
import EmployerLoginForm from "./components/EmployerLoginForm";
import EmployerRegisterForm from "./components/EmployerRegisterForm";

function AppContent() {
  const [jobs, setJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý login/register success
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loginSuccess = searchParams.get('login');
    const registerSuccess = searchParams.get('register');
    
    const token = localStorage.getItem('token');
    
    console.log('🔍 App mounted - Checking auth state:', {
      hasTokenInStorage: !!token,
      loginSuccess,
      registerSuccess,
      currentURL: window.location.href
    });

    if (token) {
      console.log('✅ Token found in localStorage');
      setIsLoggedIn(true);
      
      if (loginSuccess === 'success') {
        console.log('🎉 Login successful!');
        alert('🎉 Đăng nhập thành công!');
        window.history.replaceState({}, document.title, '/');
      }
      if (registerSuccess === 'success') {
        console.log('🎉 Register successful!');
        alert('🎉 Đăng ký thành công!');
        window.history.replaceState({}, document.title, '/');
      }
    } else {
      console.log('ℹ️ No token in localStorage');
      setIsLoggedIn(false);
    }
  }, [location]);

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/jobs");
      if (Array.isArray(res.data)) setJobs(res.data);
      else if (Array.isArray(res.data.jobs)) setJobs(res.data.jobs);
      else setJobs([]);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate('/');
    console.log('✅ Logged out successfully');
  };

  const handleLoginSuccess = () => {
    console.log('✅ Login success handler called');
    setIsLoggedIn(true);
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        {/* ==================== CANDIDATE ROUTES ==================== */}
        
        {/* Trang chủ */}
        <Route
          path="/"
          element={
            <>
              <JobListPage showHero={true} />
              <TrendingJobsSection jobs={jobs} />
              <CategoriesSection />
              <ToolsSection />
            </>
          }
        />

        {/* Category page */}
        <Route path="/category/:category" element={<CategoryJobsPage />} />
        
        {/* Chi tiết job */}
        <Route path="/job/:id" element={<JobDetailPage />} />

        {/* Candidate Authentication */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm onLogin={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <RegisterForm />
          }
        />

        {/* Candidate Profile & CV */}
        <Route path="/create-cv" element={<CVBuilder />} />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <UserProfile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ==================== EMPLOYER ROUTES ==================== */}
        
        {/* Employer Landing Page */}
        <Route path="/employer" element={<EmployerLanding />} />
        
        {/* Employer Login */}
        <Route path="/employer-login" element={<EmployerLoginForm />} />
        
        {/* Employer Register */}
        <Route path="/employer-register" element={<EmployerRegisterForm />} />

        {/* ==================== 404 NOT FOUND ==================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// 404 Component
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 16px 0', color: '#667eea' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px 0', color: '#2d3748' }}>
        Trang không tồn tại
      </h2>
      <p style={{ color: '#718096', marginBottom: '32px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Về trang chủ
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
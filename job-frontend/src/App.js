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
import EmployerDashboard from "./components/EmployerDashboard";

function AppContent() {
  const [jobs, setJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ FIX: KIỂM TRA TOKEN KHI MOUNT VÀ KHI LOCATION THAY ĐỔI
  useEffect(() => {
    const token = localStorage.getItem('token');
    const shouldBeLoggedIn = !!token;
    
    console.log('🔍 Checking auth state:', {
      hasToken: shouldBeLoggedIn,
      currentPath: location.pathname,
      currentIsLoggedIn: isLoggedIn
    });

    // ⭐ CHỈ UPDATE STATE NẾU KHÁC BIỆT - Tránh infinite loop
    if (shouldBeLoggedIn !== isLoggedIn) {
      console.log(`🔄 Updating isLoggedIn from ${isLoggedIn} to ${shouldBeLoggedIn}`);
      setIsLoggedIn(shouldBeLoggedIn);
    }
  }, [location.pathname]); // ✅ Bỏ isLoggedIn khỏi dependency array

  // Xử lý thông báo login/register success
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loginSuccess = searchParams.get('login');
    const registerSuccess = searchParams.get('register');
    
    if (loginSuccess === 'success') {
      console.log('✅ Login successful!');
      alert('Đăng nhập thành công!');
      window.history.replaceState({}, document.title, '/');
      // Force re-check auth
      const token = localStorage.getItem('token');
      if (token) setIsLoggedIn(true);
    }
    
    if (registerSuccess === 'success') {
      console.log('✅ Register successful!');
      alert('✅ Đăng ký thành công!');
      window.history.replaceState({}, document.title, '/');
      // Force re-check auth
      const token = localStorage.getItem('token');
      if (token) setIsLoggedIn(true);
    }
  }, [location]); // ✅ Dependency on location để trigger khi URL thay đổi

  // Fetch jobs - chỉ chạy 1 lần khi mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/jobs");
      if (Array.isArray(res.data)) {
        setJobs(res.data);
      } else if (Array.isArray(res.data.jobs)) {
        setJobs(res.data.jobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      setError("Không thể tải dữ liệu công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate('/');
    console.log('✅ Logged out successfully');
  };

  const handleLoginSuccess = () => {
    console.log('✅ Login success handler called');
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      console.log('✅ isLoggedIn set to true');
      // Navigate sau khi set state
      setTimeout(() => navigate('/'), 100);
    }
  };

  // 🔍 DEBUG: Log state khi render (có thể bỏ sau khi fix xong)
  useEffect(() => {
    console.log('🎨 App rendered with isLoggedIn:', isLoggedIn);
  }, [isLoggedIn]);

  // Danh sách routes không hiển thị Navbar
  const hideNavbarRoutes = ['/employer-dashboard', '/employer-login', '/employer-register'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <Routes>
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

        {/* Trang Nhà tuyển dụng */}
        <Route path="/employer" element={<EmployerLanding />} />
        <Route path="/employer-register" element={<EmployerRegisterForm />} />
        <Route path="/employer-login" element={<EmployerLoginForm />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />

        {/* Route category */}
        <Route path="/category/:category" element={<CategoryJobsPage />} />

        {/* Chi tiết job */}
        <Route path="/job/:id" element={<JobDetailPage />} />

        {/* Authentication Routes */}
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
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterForm onRegisterSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Other routes */}
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
      </Routes>
    </>
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
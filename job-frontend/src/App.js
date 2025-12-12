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

// ==================== COMMON COMPONENTS ====================
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// ==================== CONTEXTS ====================
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';

// ==================== AUTH COMPONENTS ====================
import LoginForm from "./pages/User/LoginForm.js";
import RegisterForm from "./pages/User/RegisterForm.js";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// ==================== PAGES - HOME ====================
import HomePage from "./pages/Home/HomePage";

// ==================== PAGES - JOBS ====================
import { CategoriesSection, CategoryJobsPage } from "./pages/Jobs/CategoryJobsPage";
import JobDetailPage from "./pages/Jobs/JobDetailPage";
import JobListPage from "./pages/Jobs/JobListPage";



// ==================== PAGES - TOOLS ====================
import ToolsSection from "./pages/Tools/ToolsSection";

// ==================== COMPONENTS - JOBS ====================
import TrendingJobsSection from "./components/jobs/TrendingJobsSection";

// ==================== COMPONENTS - CV ====================
import CVBuilder from "./components/CV/CVBuilder";
import CVTemplatesPage from "./components/CV/CVTemplatesPage";
import CoverLetter from "./components/CV/CoverLetter";
import CVwritingGuide from "./components/CV/CVwritingGuide";

// ==================== COMPONENTS - PROFILE ====================
import UserProfile from "./pages/User/UserProfile.jsx";
import SavedJobs from "./components/profile/SavedJobs";

// ==================== PAGES - EMPLOYER ====================
import EmployerLanding from "./pages/Employer/EmployerLanding";
import EmployerLoginForm from "./pages/Employer/EmployerLoginForm";
import EmployerRegisterForm from "./pages/Employer/EmployerRegisterForm";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import CreateJob from "./pages/Employer/CreateJob";

import EmployerApplications from "./pages/Employer/EmployerApplications";
import ApplicationDetail from "./pages/Employer/ApplicationDetail";
import EmployerStatistics from "./pages/Employer/EmployerStatistics";
import PaymentPage from "./pages/Employer/PaymentPage";



// ==================== PAGES - ADMIN ====================
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLoginForm from "./pages/Admin/AdminLoginForm";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminEmployers from "./pages/Admin/AdminEmployers";
import AdminJobs from "./pages/Admin/AdminJobs";
import AdminApplications from "./pages/Admin/AdminApplications";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminReports from "./pages/Admin/AdminReports";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminEditJob from "./pages/Admin/AdminEditJob";
import AdminApplicationDetail from './pages/Admin/AdminApplicationDetail';
import AdminCreateJob from './pages/Admin/AdminCreateJob.jsx';

// ==================== PAGES - APPLICATIONS ====================
import ApplicationSubmit from "./pages/Applications/ApplicationSubmit";
import ApplicationSuccess from "./pages/Applications/ApplicationSuccess";

// ==================== PAGES - CATEGORIES ====================
import CategoriesPage from "./pages/Categories/CategoriesPage";
import CategoryDetail from "./pages/Categories/CategoryDetail";

// ==================== PAGES - ABOUT ====================
import AboutPage from "./pages/About/AboutPage";
import ContactPage from "./pages/About/ContactPage";
import FAQPage from "./pages/About/FAQPage";
import PrivacyPolicy from "./pages/About/PrivacyPolicy";
import TermsOfService from "./pages/About/TermsOfService";

// ==================== LAYOUTS ====================
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployerLayout from './layouts/EmployerLayout';
import UserLayout from './layouts/UserLayout';

// ==================== PROTECTED ROUTE COMPONENT ====================
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  
  // ĐỌC role từ user object
  let userRole = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userRole = user?.role;
    }
  } catch (e) {
    console.error('❌ Lỗi parse user:', e);
  }
  
  // Nếu không có role trong user object, thử lấy từ userRole key
  if (!userRole) {
    userRole = localStorage.getItem('userRole');
  }
  
  console.log('═══════════════════════════════════════');
  console.log('🔒 ProtectedRoute Check');
  console.log('  📍 Path:', location.pathname);
  console.log('  🎫 Token:', token ? 'EXISTS' : 'MISSING');
  console.log('  🎫 AdminToken:', adminToken ? 'EXISTS' : 'MISSING');
  console.log('  👤 UserRole:', userRole || '❌ MISSING');
  console.log('  🎯 RequiredRole:', requiredRole || 'NONE');
  
  // Check 1: Có token không?
  const hasAuth = !!(token || adminToken);
  if (!hasAuth) {
    console.log('  ❌ RESULT: NO TOKEN - Redirecting to login');
    console.log('═══════════════════════════════════════');
    
    if (requiredRole === 'admin') {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    if (requiredRole === 'employer') {
      return <Navigate to="/employer-login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check 2: Role có match không?
  if (requiredRole) {
    if (!userRole) {
      console.log('  ❌ RESULT: NO ROLE in localStorage');
      console.log('  🔄 Redirecting to home');
      console.log('═══════════════════════════════════════');
      return <Navigate to="/" replace />;
    }
    
    if (userRole !== requiredRole) {
      console.log('  ❌ RESULT: ROLE MISMATCH');
      console.log('    - Expected:', requiredRole);
      console.log('    - Got:', userRole);
      console.log('  🔄 Redirecting to home');
      console.log('═══════════════════════════════════════');
      return <Navigate to="/" replace />;
    }
    
    console.log('  ✅ RESULT: ROLE MATCH');
    console.log('    - Required:', requiredRole);
    console.log('    - Actual:', userRole);
  }
  
  console.log('  ✅ ACCESS GRANTED');
  console.log('═══════════════════════════════════════');
  return children;
};

function AppContent() {
  const [jobs, setJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ==================== CHECK AUTH ON MOUNT ====================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    let role = localStorage.getItem('userRole');
    
    // Thử lấy role từ user object nếu không có userRole key
    if (!role) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          role = user?.role;
          // Lưu lại vào userRole để dùng sau
          if (role) {
            localStorage.setItem('userRole', role);
          }
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Auto-set role nếu có admin data
    if (!role && adminToken) {
      const admin = localStorage.getItem('admin');
      if (admin) {
        try {
          const adminData = JSON.parse(admin);
          if (adminData.role === 'admin') {
            role = 'admin';
            localStorage.setItem('userRole', 'admin');
          }
        } catch (e) {
          console.error('Error parsing admin data:', e);
        }
      }
    }
    
    const hasAuth = !!(token || adminToken);
    
    // CHỈ UPDATE STATE KHI CÓ THAY ĐỔI
    if (isLoggedIn !== hasAuth) {
      console.log('🔐 Auth State Changed:', { 
        token: !!token, 
        adminToken: !!adminToken,
        role,
        path: location.pathname 
      });
      setIsLoggedIn(hasAuth);
    }
    if (userRole !== role) {
      setUserRole(role);
    }
  }, []); // CHỈ CHẠY 1 LẦN KHI MOUNT

  // ==================== HANDLE GOOGLE OAUTH ====================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      alert('Đăng nhập thất bại! Vui lòng thử lại.');
      window.history.replaceState({}, document.title, '/login');
      navigate('/login');
      return;
    }

    if (token) {
      console.log('✅ Google OAuth token received');
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'user');
      setIsLoggedIn(true);
      setUserRole('user');
      window.history.replaceState({}, document.title, '/');
      alert('🎉 Đăng nhập thành công!');
      window.location.href = '/';
    }
  }, [navigate]);

  // ==================== FETCH JOBS ====================
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
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOGOUT ====================
  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  // ==================== LOGIN SUCCESS ====================
  const handleLoginSuccess = (role = 'user') => {
    console.log('🎯 Login success, updating state...');
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      localStorage.setItem('userRole', role);
    }
  };

  return (
    <Routes>
      {/* ==================== MAIN LAYOUT ROUTES ==================== */}
      <Route element={<MainLayout isLoggedIn={isLoggedIn} onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage />} />
        
        {/* JOB ROUTES */}
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        
        {/* CATEGORY ROUTES */}
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:category" element={<CategoryJobsPage />} />
        <Route path="/category/:id/detail" element={<CategoryDetail />} />
        
        {/* TOOLS & CV */}
        <Route path="/tools" element={<ToolsSection />} />
        <Route path="/create-cv" element={<CVBuilder />} />
        <Route path="/cv-templates" element={<CVTemplatesPage />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/guidewritring-cv" element={<CVwritingGuide />} />
        {/* AUTH ROUTES */}
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* ABOUT PAGES */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Route>

      {/* ==================== USER LAYOUT ROUTES ==================== */}
      <Route element={<UserLayout isLoggedIn={isLoggedIn} onLogout={handleLogout} />}>
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="user">
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/saved-jobs"
          element={
            <ProtectedRoute requiredRole="user">
              <SavedJobs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ==================== EMPLOYER LAYOUT ROUTES ==================== */}
      <Route element={<EmployerLayout />}>
        <Route path="/employer" element={<EmployerLanding />} />
        <Route path="/employer-login" element={<EmployerLoginForm />} />
        <Route path="/employer-register" element={<EmployerRegisterForm />} />
        
        {/* Employer Protected Routes */}
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/create"
          element={
            <ProtectedRoute requiredRole="employer">
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applications/:id"
          element={
            <ProtectedRoute requiredRole="employer">
              <ApplicationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/statistics"
          element={
            <ProtectedRoute requiredRole="employer">
              <EmployerStatistics />
            </ProtectedRoute>
          }
        />
      </Route>
<Route
  path="/payment"
  element={
    <ProtectedRoute requiredRole="employer">
      <PaymentPage />
    </ProtectedRoute>
  }
/>
      
      {/* ==================== ADMIN LAYOUT ROUTES ==================== */}
      <Route element={<AdminLayout />}>
        <Route path="/admin-login" element={<AdminLoginForm />} />
        
        {/* Admin Protected Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employers"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEmployers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminCreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/:id/edit"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApplicationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ==================== 404 NOT FOUND ==================== */}
      <Route path="*" element={
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '72px', margin: '0', color: '#333' }}>404</h1>
          <p style={{ fontSize: '24px', color: '#666', marginBottom: '30px' }}>
            Trang không tồn tại
          </p>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '12px 40px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Về trang chủ
          </button>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <AppContent />
        </JobProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
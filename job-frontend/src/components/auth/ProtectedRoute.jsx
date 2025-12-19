import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import LoadingSpinner from 'components/common/LoadingSpinner';
function ProtectedRoute({ 
  children, 
  requiredRole = null,
  redirectTo = '/login',
  loadingComponent = null,
  fallbackComponent = null,
  checkAuth = null
}) {
  const location = useLocation();
  
 
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;


  if (checkAuth) {
    const authResult = checkAuth();
    if (!authResult.isAuthenticated) {
      return (
        <Navigate 
          to={redirectTo} 
          state={{ from: location }} 
          replace 
        />
      );
    }
  }

 
  if (!token) {
    console.log(' No token found, redirecting to login');
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  
  if (requiredRole) {
    if (!user || user.role !== requiredRole) {
      console.log(` Required role: ${requiredRole}, User role: ${user?.role}`);
      
 
      if (fallbackComponent) {
        return fallbackComponent;
      }
      
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location, requiredRole }} 
          replace 
        />
      );
    }
  }

 
  return children;
}


export function AdminRoute({ children, ...props }) {
  return (
    <ProtectedRoute 
      requiredRole="admin" 
      redirectTo="/admin-login"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}


export function EmployerRoute({ children, ...props }) {
  return (
    <ProtectedRoute 
      requiredRole="employer" 
      redirectTo="/employer-login"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}


export function UserRoute({ children, ...props }) {
  return (
    <ProtectedRoute 
      requiredRole="user" 
      redirectTo="/login"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}


export function GuestRoute({ children, redirectTo = '/' }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (token) {
    console.log(' Already logged in, redirecting to home');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}


export function RoleBasedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/unauthorized',
  fallback = null
}) {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    console.log(` Access denied. Allowed roles: ${allowedRoles.join(', ')}, User role: ${user?.role}`);
    
    if (fallback) {
      return fallback;
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location, allowedRoles }} 
        replace 
      />
    );
  }

  return children;
}


export function ConditionalRoute({ 
  children, 
  condition, 
  redirectTo = '/',
  fallback = null
}) {
  const location = useLocation();

  if (!condition) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
}


export function LoadingRoute({ 
  children, 
  isLoading, 
  loadingComponent = <LoadingSpinner fullScreen text="Đang xác thực..." />
}) {
  if (isLoading) {
    return loadingComponent;
  }

  return children;
}


export function UnauthorizedPage() {
  const location = useLocation();
  const requiredRole = location.state?.requiredRole;
  const allowedRoles = location.state?.allowedRoles;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        maxWidth: '500px',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
        <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '16px' }}>
          Truy cập bị từ chối
        </h1>
        <p style={{ fontSize: '16px', color: '#7f8c8d', marginBottom: '24px' }}>
          Bạn không có quyền truy cập trang này.
          {requiredRole && (
            <span style={{ display: 'block', marginTop: '8px', fontWeight: 600 }}>
              Yêu cầu: {requiredRole}
            </span>
          )}
          {allowedRoles && (
            <span style={{ display: 'block', marginTop: '8px', fontWeight: 600 }}>
              Yêu cầu một trong: {allowedRoles.join(', ')}
            </span>
          )}
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginRight: '12px'
          }}
        >
          ← Quay lại
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: '#ecf0f1',
            color: '#2c3e50',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
           Trang chủ
        </button>
      </div>
    </div>
  );
}

export default ProtectedRoute;
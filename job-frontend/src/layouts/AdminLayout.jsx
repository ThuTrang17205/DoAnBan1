import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  
  
  const isLoginPage = location.pathname === '/admin-login';
  
  
  const adminToken = localStorage.getItem('adminToken');
  const isDashboard = location.pathname === '/admin-dashboard';

 
  if (isDashboard && !adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <>
      {}
      {!isLoginPage && (
        <div style={{ 
          padding: '15px 30px', 
          backgroundColor: '#343a40', 
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}> Admin Panel</h2>
          </div>
        </div>
      )}
      
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;
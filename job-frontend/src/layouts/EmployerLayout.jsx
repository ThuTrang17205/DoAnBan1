import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const EmployerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Kiểm tra xem có phải trang login/register không
  const isAuthPage = ['/employer-login', '/employer-register', '/employer'].includes(location.pathname);
  
  // ⭐ SỬA: Dùng 'token' thay vì 'employerToken'
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const isEmployerLoggedIn = token && userRole === 'employer';

  // ⭐ BỎ LOGIC REDIRECT - Để ProtectedRoute trong App.js xử lý
  // if (isDashboard && !employerToken) {
  //   return <Navigate to="/employer-login" replace />;
  // }

  // Hàm logout
  const handleLogout = () => {
    console.log('🚪 Employer logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/employer-login';
  };

  return (
    <>
      {/* Hiển thị header cho employer (trừ auth pages) */}
      {!isAuthPage && (
        <div style={{ 
          padding: '15px 30px', 
          backgroundColor: '#2c3e50', 
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h2 style={{ margin: 0 }}>Employer Portal</h2>
            
            {/* Navigation Menu */}
            {isEmployerLoggedIn && (
              <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>     
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                >
                  Đăng xuất
                </button>
              </nav>
            )}
          </div>
        </div>
      )}
      
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default EmployerLayout;
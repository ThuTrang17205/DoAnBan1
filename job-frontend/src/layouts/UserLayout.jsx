import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

function UserLayout({ isLoggedIn, onLogout }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Navbar ở trên cùng */}
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      
      {/* Main content - Chiếm hết không gian còn lại */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}>
        <Outlet />
      </main>
      
      {/* Footer ở dưới cùng */}
      <Footer />
    </div>
  );
}

export default UserLayout;
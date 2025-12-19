import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ isLoggedIn, onLogout }) => {
  const location = useLocation();
  
  
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />}
      <main>
        <Outlet />
      </main>
      {shouldShowNavbar && <Footer />}
    </>
  );
};

export default MainLayout;
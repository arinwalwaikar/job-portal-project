import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Persistent Top Navigation Bar */}
      <Navbar />
      
      {/* Dynamic Main Body Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Persistent Bottom Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;

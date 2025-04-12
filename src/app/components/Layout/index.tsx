'use client';

import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="pt-[130px] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout; 
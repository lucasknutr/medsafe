'use client';

import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Navbar />
      <Sidebar />
      <main style={{ paddingTop: '130px', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  );
};

export default Layout; 
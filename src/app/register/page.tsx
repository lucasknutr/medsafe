'use client';

import React from 'react';
import RegisterForm from '@/app/components/RegisterForm'; 
import Navbar from '@/app/components/Navbar'; 
// teste

export default function RegisterPage() {
  return (
    <>
      <Navbar /> 
      {/* Adjusted to pt-40 for navbar, pb-8 for bottom padding */}
      <div className="min-h-screen pt-40 pb-8">
        <RegisterForm /> 
        {/* <div>Register Page Test - No Form</div> */}
      </div>
    </>
  );
}
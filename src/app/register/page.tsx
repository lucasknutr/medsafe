'use client';

import React, { Suspense } from 'react';
import RegisterForm from '@/app/components/RegisterForm'; 
import Navbar from '@/app/components/Navbar'; 
// teste

export default function RegisterPage() {
  return (
    <>
      <Navbar /> 
      {/* Adjusted to pt-40 for navbar, pb-8 for bottom padding */}
      <div className="min-h-screen pt-40 pb-8">
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Carregando formulário...</p></div>}>
          <RegisterForm /> 
        </Suspense>
        {/* <div>Register Page Test - No Form</div> */}
      </div>
    </>
  );
}
'use client';

import RegisterForm from '@/app/components/RegisterForm';
import Navbar from '@/app/components/Navbar'; 

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      {/* Adjusted to pt-40 for navbar, pb-8 for bottom padding */}
      <div className="min-h-screen pt-40 pb-8">
        <RegisterForm />
      </div>
    </>
  );
}
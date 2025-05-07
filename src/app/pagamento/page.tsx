"use client";
export const dynamic = "force-dynamic";
import PaymentForm from "@/app/components/PaymentForm";
import { Suspense } from "react";
import Navbar from '@/app/components/Navbar'; 

export default function PagamentoPage() {
  return (
    <>
      <Navbar />
      {/* Adjusted to pt-40 for navbar, pb-8 for bottom padding */}
      <div className="min-h-screen pt-40 pb-8">
        <Suspense fallback={<div>Carregando pagamento...</div>}>
          <PaymentForm />
        </Suspense>
      </div>
    </>
  );
}

"use client";
export const dynamic = "force-dynamic";
import PaymentForm from "@/app/components/PaymentForm";
import { Suspense } from "react";
import Navbar from '@/app/components/Navbar'; 

export default function PagamentoPage() {
  return (
    <div className="min-h-screen py-8">
      <Navbar />
      <Suspense fallback={<div>Carregando pagamento...</div>}>
        <PaymentForm />
      </Suspense>
    </div>
  );
}

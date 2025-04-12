'use client'
import { Suspense } from 'react';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

export default function Home() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </Layout>
  );
}

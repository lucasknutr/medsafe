'use client'
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Sidebar/>
      <div style={{ paddingTop: '130px' }}></div>
      <Dashboard/>
    </>
  );
}

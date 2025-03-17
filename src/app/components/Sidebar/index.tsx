'use client';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 h-48 w-12 bg-black bg-opacity-50 flex flex-col justify-center items-center space-y-4 rounded-l-lg gap-8">
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-blue-500 transition-colors"
      >
        <FaFacebook size={35} />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-pink-500 transition-colors"
      >
        <FaInstagram size={35} />
      </a>
    </div>
  );
}
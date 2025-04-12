/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Remove the turbo option since it's causing issues
  },
};

module.exports = nextConfig; 
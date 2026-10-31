import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites() {
    const backend = new URL(process.env.BACKEND_URL ?? 'http://localhost:5047');
    return Promise.resolve([
      { source: '/api/:path*', destination: `${backend.origin}/api/:path*` },
    ]);
  },
};

export default nextConfig;

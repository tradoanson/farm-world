import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/farm-world',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from 'next';

const isPages = process.env.FARM_WORLD_STATIC_EXPORT === 'true';
const nextConfig: NextConfig = {
  ...(isPages ? { output: 'export' as const, basePath: '/farm-world', trailingSlash: true } : {}),
  images: { unoptimized: true },
};
export default nextConfig;

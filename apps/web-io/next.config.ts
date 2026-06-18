import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-transformation/shared', '@ai-transformation/content'],
};

export default nextConfig;

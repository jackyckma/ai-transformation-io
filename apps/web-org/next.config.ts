import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-transformation/shared', '@ai-transformation/chat-ui'],
};

export default nextConfig;

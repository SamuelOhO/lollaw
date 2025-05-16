/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // punycode 경고 숨기기
    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];
    return config;
  },
  experimental: {
    // 동적 렌더링 허용
    serverActions: true,
  },
};

module.exports = nextConfig;

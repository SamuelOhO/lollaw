/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: false
  },
  webpack: (config, { isServer }) => {
    // punycode 경고 숨기기
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    return config;
  }
};

module.exports = nextConfig; 
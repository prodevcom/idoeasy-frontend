/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    quietDeps: true,
  },
  transpilePackages: ['@idoeasy/contracts'],
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;

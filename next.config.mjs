import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    quietDeps: true,
  },
  transpilePackages: ['@entech/contracts'],
  experimental: {
    externalDir: true,
  },
};

export default withNextIntl(nextConfig);

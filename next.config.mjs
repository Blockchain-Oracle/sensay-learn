/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@abstract-foundation/agw-client', 'cheerio'],
  images: {
    domains: [
      'sensay-learn-uploads.s3.amazonaws.com',
      process.env.CLOUDFRONT_DOMAIN,
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  webpack: (config) => {
    // Properly handle JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: '/api/ai/:path*',
      },
    ]
  },
}

export default nextConfig

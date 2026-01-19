const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // TODO: Replace with your specific S3 bucket domain
      // Example: 'your-bucket-name.s3.us-east-1.amazonaws.com'
      // {
      //   protocol: 'https',
      //   hostname: 'your-bucket-name.s3.amazonaws.com',
      // },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  typescript: {
    // Only ignore build errors in development
    ignoreBuildErrors: isDev,
  },
  eslint: {
    // Only ignore during builds in development
    ignoreDuringBuilds: isDev,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            // In development, Next.js requires unsafe-eval for hot reloading
            // In production, we use stricter CSP
            value: isDev
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: ws: wss:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig

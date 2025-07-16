require('ts-node/register')
const { env } = require('./src/lib/env')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables for authentication
  env: {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      '@tiptap/react',
      '@tiptap/starter-kit'
    ]
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
            tiptap: {
              test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
              name: 'tiptap',
              chunks: 'all',
              priority: 20,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 15,
            },
            icons: {
              test: /[\\/]node_modules[\\/](@heroicons|lucide-react)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 10,
            }
          }
        }
      };
    }

    // Externalize heavy server-only dependencies
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
        'mammoth': 'commonjs mammoth',
        'pdf-parse': 'commonjs pdf-parse',
        'mupdf': 'commonjs mupdf'
      });
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for security, caching, and CORS
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        // CORS headers for API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300'
          }
        ]
      }
    ];
  },

  // Auth callback rewrites
  async rewrites() {
    return [
      {
        source: '/auth/callback',
        destination: '/api/auth/callback',
      },
    ]
  },

  // Compression
  compress: true,

  // Bundle analyzer (conditional)
  ...(env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analyzer-report.html'
          })
        );
      }
      return config;
    }
  }),

  // Output optimization
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,

  // Static optimization
  trailingSlash: false,
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
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
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300'
          }
        ]
      }
    ];
  },

  // Compression
  compress: true,

  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
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
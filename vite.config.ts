import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Generate sourcemaps for error tracking (but not in prod by default)
        sourcemap: !isProd,

        // Minification - use esbuild (default, faster, no extra dependency)
        minify: 'esbuild',

        // Chunk splitting for better caching
        rollupOptions: {
          output: {
            manualChunks: {
              // React core
              'vendor-react': ['react', 'react-dom'],

              // Animation library (large)
              'vendor-motion': ['framer-motion'],

              // AI SDK
              'vendor-ai': ['@google/genai'],

              // i18n
              'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],

              // PDF generation
              'vendor-pdf': ['jspdf'],

              // Error tracking
              'vendor-sentry': ['@sentry/react'],
            },

            // Asset file naming
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name?.split('.') || [];
              const ext = info[info.length - 1] ?? '';
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return 'assets/images/[name]-[hash][extname]';
              }
              if (/woff2?|eot|ttf|otf/i.test(ext)) {
                return 'assets/fonts/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },

            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
          },
        },

        // Chunk size warnings
        chunkSizeWarningLimit: 500,

        // Target modern browsers
        target: 'es2022',
      },

      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'framer-motion',
          '@google/genai',
          'i18next',
          'react-i18next',
        ],
      },
    };
});

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
        sourcemap: !isProd,

        minify: 'esbuild',

        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-motion': ['framer-motion'],
              'vendor-ai': ['@google/genai'],
              'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
              'vendor-pdf': ['jspdf'],
              'vendor-sentry': ['@sentry/react'],
            },

            // Asset naming
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

        chunkSizeWarningLimit: 500,

        target: 'es2022',
      },

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

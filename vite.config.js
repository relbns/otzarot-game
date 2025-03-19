// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true, // to allow access from other devices on the network
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    // Configure chunk size optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
  // Enable/disable performance-heavy optimizations
  // during development/debugging
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
});
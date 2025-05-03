// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Use environment variable for base path if provided, otherwise use default
const base = process.env.VITE_BASE_PATH || '/otzarot-game/';

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    // Add any additional environment variables you want to expose
    __APP_ENV__: JSON.stringify(process.env.VITE_APP_ENV || 'development'),
    __PR_NUMBER__: JSON.stringify(process.env.VITE_PR_NUMBER || ''),
    __COMMIT_SHA__: JSON.stringify(process.env.VITE_COMMIT_SHA || ''),
  },
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
    host: true,
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
});

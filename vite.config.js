// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Get the repository name for GitHub Pages base path
// For example, if your repo is username/otzarot-game, the base should be '/otzarot-game/'
// If deploying to a custom domain or user page (username.github.io), use '/'
const base = process.env.NODE_ENV === 'production' ? '/otzarot-game/' : '/';

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
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
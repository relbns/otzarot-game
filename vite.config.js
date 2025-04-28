import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Get the repository name for GitHub Pages base path
// For example, if your repo is username/otzarot-game, the base should be '/otzarot-game/'
// Priority: VITE_BASE_PATH env var > production default > development default
const base = process.env.VITE_BASE_PATH || 
             (process.env.NODE_ENV === 'production' ? '/otzarot-game/' : '/');

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
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
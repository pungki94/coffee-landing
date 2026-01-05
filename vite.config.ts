import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/coffee-landing/',
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        const distDir = path.resolve(process.cwd(), 'dist');
        const indexHtml = path.resolve(distDir, 'index.html');
        const notFoundHtml = path.resolve(distDir, '404.html');
        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
          console.log('Copied index.html to 404.html for GitHub Pages SPA support');
        }
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

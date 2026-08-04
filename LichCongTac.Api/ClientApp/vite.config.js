import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:59608'

export default defineConfig({
  base: '/campha/',
  publicDir: 'public',
  plugins: [
    tailwindcss(),
    react(),
    legacy({
      targets: ['defaults', 'safari >= 12', 'ios >= 12'],
      modernTargets: ['safari >= 15', 'ios >= 15', 'chrome >= 87', 'edge >= 88', 'firefox >= 78'],
      polyfills: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/api': backendTarget,
      '/notificationHub': {
        target: backendTarget,
        ws: true,
      },
      '/Uploads': backendTarget,
      '/assets': backendTarget,
      '/partials': backendTarget,
      '/sw.js': backendTarget,
    },
  },
  build: {
    target: 'es2020',
    outDir: '../wwwroot',
    emptyOutDir: false,
    assetsDir: 'vite-assets',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
    },
  },
})

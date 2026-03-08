// /frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // usar rutas relativas para despliegues en GitHub Pages
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxyear llamadas a /wp-json hacia el backend para evitar CORS en desarrollo
      '/wp-json': {
        target: 'https://hcfarma.com.ar',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
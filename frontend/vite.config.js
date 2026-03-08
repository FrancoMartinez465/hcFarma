// /frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxyear llamadas a /wp-json hacia el backend para evitar CORS en desarrollo
      '/wp-json': {
        target: 'https://api.hcfarma.com.ar', // <--- ¡Acá está el cambio clave!
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
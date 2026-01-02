// /frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // <--- CAMBIA ESTO (quita 'hcFarma')
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
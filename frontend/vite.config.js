// /frontend/vite.config.js
export default defineConfig({
  base: '/', // Cambiado de '/hcFarma/' a '/'
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
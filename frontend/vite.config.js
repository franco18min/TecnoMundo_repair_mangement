import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración básica para CloudPanel hosting
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true
  },
  
  // Base path para producción
  base: '/'
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- AÑADIMOS DE NUEVO LA CONFIGURACIÓN DEL PROXY ---
  server: {
    proxy: {
      // Cualquier petición que empiece con '/api' será redirigida
      '/api': {
        target: 'http://127.0.0.1:8001', // La dirección de tu backend
        changeOrigin: true, // Necesario para que el proxy funcione correctamente
      },
    }
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sync-favicon-to-public',
      apply: 'serve',
      configureServer() {
        try {
          const src = path.resolve(__dirname, '..', 'photo', 'favicon.png')
          const pub = path.resolve(__dirname, 'public')
          const dstPng = path.resolve(pub, 'favicon.png')
          const dstIco = path.resolve(pub, 'favicon.ico')
          if (fs.existsSync(src)) {
            fs.mkdirSync(pub, { recursive: true })
            const buf = fs.readFileSync(src)
            fs.writeFileSync(dstPng, buf)
            fs.writeFileSync(dstIco, buf)
          }
        } catch {}
      }
    },
    {
      name: 'sync-favicon-for-build',
      apply: 'build',
      buildStart() {
        try {
          const src = path.resolve(__dirname, '..', 'photo', 'favicon.png')
          const pub = path.resolve(__dirname, 'public')
          const dstPng = path.resolve(pub, 'favicon.png')
          const dstIco = path.resolve(pub, 'favicon.ico')
          if (fs.existsSync(src)) {
            fs.mkdirSync(pub, { recursive: true })
            const buf = fs.readFileSync(src)
            fs.writeFileSync(dstPng, buf)
            fs.writeFileSync(dstIco, buf)
          }
        } catch {}
      }
    }
  ],
  
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

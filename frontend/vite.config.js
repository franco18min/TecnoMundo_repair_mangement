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
          const srcLogo = path.resolve(__dirname, '..', 'photo', 'logo.png')
          const dstLogo = path.resolve(pub, 'logo.png')
          if (fs.existsSync(srcLogo)) {
            fs.writeFileSync(dstLogo, fs.readFileSync(srcLogo))
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
          const srcLogo = path.resolve(__dirname, '..', 'photo', 'logo.png')
          const dstLogo = path.resolve(pub, 'logo.png')
          if (fs.existsSync(srcLogo)) {
            fs.writeFileSync(dstLogo, fs.readFileSync(srcLogo))
          }
        } catch {}
      }
    }
  ],
  
  // Configuración básica para CloudPanel hosting
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1024
  },
  
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9001',
        changeOrigin: true
      }
    }
  },
  
  // Base path para producción
  base: '/'
})

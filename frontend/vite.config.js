import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// Copy the pdfjs worker into public/ at build time so it is served
// as a static asset at /pdf.worker.min.mjs. This is the only reliable
// way to load the worker in Vite without a CDN or version mismatch.
function copyPdfjsWorker() {
  return {
    name: 'copy-pdfjs-worker',
    buildStart() {
      try {
        const src = resolve(
          __dirname,
          'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
        )
        mkdirSync(resolve(__dirname, 'public'), { recursive: true })
        copyFileSync(src, resolve(__dirname, 'public/pdf.worker.min.mjs'))
        console.log('[vite] pdfjs worker copied to public/')
      } catch (e) {
        console.warn('[vite] could not copy pdfjs worker:', e.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyPdfjsWorker()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios:  ['axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

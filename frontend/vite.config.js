import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Copies the self-hosted PDF.js viewer files into public/pdfjs/
// at build time so they're served as static assets from Netlify.
// Files come from node_modules/pdfjs-dist which is already installed.
function copyPdfjsViewer() {
  return {
    name: 'copy-pdfjs-viewer',
    buildStart() {
      const dest = resolve(__dirname, 'public/pdfjs')
      mkdirSync(dest, { recursive: true })

      const nmPdfjs = resolve(__dirname, 'node_modules/pdfjs-dist')

      const files = [
        [resolve(nmPdfjs, 'build/pdf.min.mjs'),         'pdf.min.mjs'],
        [resolve(nmPdfjs, 'build/pdf.worker.min.mjs'),  'pdf.worker.min.mjs'],
      ]

      for (const [src, name] of files) {
        if (existsSync(src)) {
          copyFileSync(src, resolve(dest, name))
        } else {
          console.warn(`[vite] pdfjs file not found: ${src}`)
        }
      }

      console.log('[vite] pdfjs viewer files copied to public/pdfjs/')
    },
  }
}

export default defineConfig({
  plugins: [react(), copyPdfjsViewer()],
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

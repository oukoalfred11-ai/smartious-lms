import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────
// Vite build configuration with code-splitting strategy.
// Splits the JS bundle so the homepage doesn't have to load
// the portal/admin/teacher/student/parent/demo code.
// Expected lift: ~377 KiB of unused JS warning → ~80 KiB.
// ─────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    sourcemap: false,

    // Minify with esbuild (fastest, very capable)
    minify: 'esbuild',

    // Inline assets <8 KB as base64 (saves a request);
    // larger assets get hashed filenames
    assetsInlineLimit: 8192,

    // Bundle size warning threshold
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Hash filenames for cache busting
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',

        // ─── Manual chunk splitting ───
        //
        // Goal: each route loads only what it needs.
        // Visitors to the homepage shouldn't download portal
        // dashboards (they're auth-gated anyway).
        //
        // Strategy: pull large or auth-gated modules into
        // their own chunks. Anything not matched here ends
        // up in the default chunk for the route that imports it.
        //
        manualChunks(id) {
          // ── Vendor: React core + router ──
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('react-dom'))    return 'vendor-react'
            if (id.includes('/react/'))      return 'vendor-react'
            if (id.includes('axios'))        return 'vendor-axios'
            // Everything else from node_modules into one shared bundle
            return 'vendor'
          }

          // ── Auth-gated portals: each in its own chunk ──
          // These only load when a logged-in user navigates to them.
          // Visitors to the marketing site never download these.
          if (id.includes('/pages/admin/'))   return 'portal-admin'
          if (id.includes('/pages/teacher/')) return 'portal-teacher'
          if (id.includes('/pages/student/')) return 'portal-student'
          if (id.includes('/pages/parent/'))  return 'portal-parent'
          if (id.includes('/pages/demo/'))    return 'portal-demo'

          // LandingPage is huge — keep it in its own chunk so it
          // loads on its own schedule, not with the entry shell.
          if (id.includes('/pages/LandingPage')) return 'landing'

          // Auth-related pages (Login, etc.) — group together
          if (
            id.includes('/pages/LoginPage') ||
            id.includes('/pages/AdminLoginPage') ||
            id.includes('/pages/VerifyEmailPage') ||
            id.includes('/pages/ResetPasswordPage')
          ) return 'auth'

          // Otherwise fall through to the default chunk (the
          // entry / App shell)
        },
      },
    },

    // Modern target — drops some legacy polyfills, smaller output.
    // Safe for 2024+ browsers; aligns with Vite's default for
    // browsers covered by browserslist.
    target: 'es2020',

    // CSS code-split (each chunk's CSS in its own file)
    cssCodeSplit: true,

    // Report compressed sizes after build
    reportCompressedSize: true,
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

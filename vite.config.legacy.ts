 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Legacy build configuration
// Run with: npm run build:legacy
export default defineConfig({
  plugins: [
    react({
      // Don't add nonces to scripts for CSP compatibility
      cspConfig: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-legacy',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.legacy.tsx'),
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  server: {
    headers: {
      // COOP and COEP headers for OAuth popup support
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
})

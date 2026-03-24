import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Legacy v1.0 Build Configuration
// This configuration builds the legacy single-user version
// Run with: npm run build:legacy

export default defineConfig({
  plugins: [
    react({
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
        main: path.resolve(__dirname, 'index.legacy.html'),
      },
      output: {
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/index-[hash].js',
        assetFileNames: 'assets/index-[hash].[ext]',
      },
    },
  },
  server: {
    headers: {
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

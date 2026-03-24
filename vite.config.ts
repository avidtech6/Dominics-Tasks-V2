import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
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
    rollupOptions: {
      output: {
        // Add content hash to filenames for cache busting
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/index-[hash].js',
        assetFileNames: 'assets/index-[hash].[ext]',
      },
    },
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

// Legacy build configuration
// Run with: npm run build:legacy
import { mergeConfig } from 'vite'
import baseConfig from './vite.config'

const legacyConfig = mergeConfig(baseConfig, {
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
})

export const legacyBuildConfig = legacyConfig

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
    // Vite automatically handles SPA routing in dev mode
  },
  preview: {
    port: 5173
    // Vite automatically handles SPA routing in preview mode
  },
  build: {
    // Ensure proper build output
    outDir: 'dist',
    assetsDir: 'assets'
  }
})


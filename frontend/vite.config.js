import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Uncommon port: 41882 to avoid conflicts
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 41882,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Giống trong README.md
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Proxy tới backend Spring Boot
        changeOrigin: true,
      }
    }
  }
})




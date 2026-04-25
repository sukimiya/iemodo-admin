import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/uc': { target: 'http://localhost:8080', changeOrigin: true },
      '/tenant': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tenant/, ''),
      },
      '/oc': { target: 'http://localhost:8080', changeOrigin: true },
      '/pc': { target: 'http://localhost:8080', changeOrigin: true },
      '/inv': { target: 'http://localhost:8080', changeOrigin: true },
      '/notify': { target: 'http://localhost:8080', changeOrigin: true },
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})

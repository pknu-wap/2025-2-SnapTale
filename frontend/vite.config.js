import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis', // 또는 'window'
  },
  optimizeDeps: {
    include: ['sockjs-client'],
  },
  plugins: [react()],
  define: {
    'global': {},
  },
})

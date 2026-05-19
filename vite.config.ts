import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getManualChunkName } from './src/utils/manualChunks'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunkName,
      },
    },
  },
})

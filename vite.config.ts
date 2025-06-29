import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'path'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['plotly.js', 'react-plotly.js']
  }
})
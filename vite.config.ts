import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // Alias para QGSXUI instalado desde GIT
      // El paquete @gisbrick/qgsx-ui se instala desde https://github.com/gisbrick/QGSXUI.git#V1.0.2
      '@qgsxui': path.resolve(__dirname, 'node_modules/@gisbrick/qgsx-ui/src'),
      'qgsxui': path.resolve(__dirname, 'node_modules/@gisbrick/qgsx-ui/src'),
    },
  },
  server: {
    proxy: {
      // Proxy para API en desarrollo (evita problemas de CORS)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

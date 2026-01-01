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
      // El paquete se instaló como "intro-storybook-react-template" desde https://github.com/gisbrick/QGSXUI.git#V1.0.2
      '@qgsxui': path.resolve(__dirname, 'node_modules/intro-storybook-react-template/src'),
      'qgsxui': path.resolve(__dirname, 'node_modules/intro-storybook-react-template/src'),
    },
  },
})

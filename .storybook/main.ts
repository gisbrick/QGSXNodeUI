import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    // Alias para QGSXUI instalado desde GIT
    // El paquete @gisbrick/qgsx-ui se instala desde https://github.com/gisbrick/QGSXUI.git#V1.0.2
    // Usamos path.resolve con process.cwd() que Storybook puede manejar mejor
    const qgsxuiPath = path.resolve(process.cwd(), 'node_modules/@gisbrick/qgsx-ui/src');
    return mergeConfig(config, {
      resolve: {
        alias: {
          ...config.resolve?.alias,
          '@qgsxui': qgsxuiPath,
          'qgsxui': qgsxuiPath,
        },
      },
      server: {
        ...config.server,
        proxy: {
          // Proxy para API en Storybook (evita problemas de CORS)
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
            ws: false, // Deshabilitar WebSocket proxy si no es necesario
          },
        },
      },
    });
  },
};
export default config;

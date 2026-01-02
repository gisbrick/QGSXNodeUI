import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
// Inicializar i18n para Storybook
import i18n from '../src/i18n';
import type { ReactRenderer } from '@storybook/react';

// Importar estilos CSS de QGSXUI
// Font Awesome (requerido por componentes QGSXUI para iconos)
import '@fortawesome/fontawesome-free/css/all.css';
// Font GIS (requerido por componentes QGS de QGSXUI para iconos GIS)
import 'font-gis/css/font-gis.css';
// Estilos principales de QGSXUI (estilos base)
import '@qgsxui/index.css';
// Sistema de diseño UI (variables CSS para componentes UI)
import '@qgsxui/components/UI/ui.css';
// Tema de QGSXUI (variables CSS adicionales del tema)
import '@qgsxui/themes/theme.css';

// Inicializar Leaflet automáticamente (carga scripts y CSS desde /public/leaflet/)
// IMPORTANTE: Los archivos de Leaflet deben estar en /public/leaflet/
// Esto se encarga automáticamente de cargar Leaflet y sus plugins
import '@qgsxui/leaflet-init.js';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story: any, context: any) => {
      const lang = context.args?.lang || context.globals?.lang || 'es';
      
      // Componente wrapper que reacciona a cambios de idioma
      const LanguageWrapper = () => {
        React.useEffect(() => {
          if (lang && i18n.language !== lang) {
            i18n.changeLanguage(lang);
          }
        }, [lang]);
        
        return React.createElement(Story);
      };
      
      return React.createElement(LanguageWrapper);
    },
  ],
  globalTypes: {
    lang: {
      description: 'Idioma de la interfaz',
      defaultValue: 'es',
      toolbar: {
        title: 'Idioma',
        icon: 'globe',
        items: [
          { value: 'es', title: 'Español' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;

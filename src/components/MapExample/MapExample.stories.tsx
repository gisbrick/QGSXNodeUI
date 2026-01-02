import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import MapExample from "./MapExample";
import QgisConfigProvider from "@qgsxui/components/QGS/QgisConfigProvider";

/**
 * Componente de ejemplo que muestra solo un mapa QGIS
 * 
 * Este story demuestra cómo usar el componente MapExample para mostrar
 * un mapa QGIS de forma simple.
 */

const meta = {
  title: "Examples/MapExample",
  component: MapExample,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente de ejemplo que muestra únicamente un mapa QGIS usando QGSXUI.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Props del QgisConfigProvider
    qgsUrl: {
      control: 'text',
      description: 'URL del servicio QGIS Server',
      table: {
        category: 'QgisConfigProvider'
      }
    },
    qgsProjectPath: {
      control: 'text',
      description: 'Ruta del proyecto QGIS',
      table: {
        category: 'QgisConfigProvider'
      }
    },
    language: {
      control: 'select',
      options: ['en', 'es'],
      description: 'Idioma de la interfaz',
      table: {
        category: 'QgisConfigProvider'
      }
    },
    token: {
      control: 'text',
      description: 'Token opcional para autenticación',
      table: {
        category: 'QgisConfigProvider'
      }
    },
    // Props del componente
    height: {
      control: 'number',
      description: 'Alto del mapa',
      table: {
        category: 'Map'
      }
    },
    width: {
      control: 'text',
      description: 'Ancho del mapa',
      table: {
        category: 'Map'
      }
    },
    showControls: {
      control: 'boolean',
      description: 'Mostrar controles del mapa',
      table: {
        category: 'Map'
      }
    },
  },
  decorators: [
    (Story, context) => {
      const { qgsUrl, qgsProjectPath, language, token, ...componentArgs } = context.args;
      return (
        <QgisConfigProvider
          qgsUrl={qgsUrl}
          qgsProjectPath={qgsProjectPath}
          language={language}
          token={token}
        >
          <Story {...context} />
        </QgisConfigProvider>
      );
    }
  ]
} satisfies Meta<typeof MapExample>;

export default meta;
type Story = StoryObj<typeof MapExample>;

/**
 * Ejemplo básico con valores por defecto
 */
export const Default: Story = {
  args: {
    // Props del QgisConfigProvider
    qgsUrl: 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe',
    qgsProjectPath: 'C:/trabajos/gisbrick/QGIS/demo01.qgz',
    language: 'es',
    token: null,
    // Props del componente
    height: 600,
    width: '100%',
    showControls: true,
  },
};

/**
 * Ejemplo con altura personalizada
 */
export const CustomHeight: Story = {
  args: {
    qgsUrl: 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe',
    qgsProjectPath: 'C:/trabajos/gisbrick/QGIS/demo01.qgz',
    language: 'es',
    token: null,
    height: 800,
    width: '100%',
    showControls: true,
  },
};

/**
 * Ejemplo sin controles
 */
export const WithoutControls: Story = {
  args: {
    qgsUrl: 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe',
    qgsProjectPath: 'C:/trabajos/gisbrick/QGIS/demo01.qgz',
    language: 'es',
    token: null,
    height: 600,
    width: '100%',
    showControls: false,
  },
};


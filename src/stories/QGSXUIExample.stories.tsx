import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Map from "@qgsxui/components/QGS/Map/Map";
import TableInfiniteScroll from "@qgsxui/components/QGS/Table/TableInfiniteScroll";
import QgisConfigProvider from "@qgsxui/components/QGS/QgisConfigProvider";

/**
 * Ejemplo de story usando componentes de QGSXUI
 * 
 * Este es un ejemplo de cómo importar y usar componentes de QGSXUI
 * desde QGSXNodeUI usando el alias @qgsxui configurado.
 * 
 * Para usar componentes de QGSXUI en tus stories:
 * 1. Importa usando el alias @qgsxui o qgsxui
 * 2. Asegúrate de que los estilos CSS necesarios estén importados si es necesario
 * 3. Envuelve los componentes QGS (Map, Table) con QgisConfigProvider
 * 4. Usa los componentes normalmente como cualquier otro componente React
 */

const meta = {
  title: "Examples/QGSXUI Integration",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Este es un ejemplo de cómo integrar componentes de QGSXUI (Map y Table) en QGSXNodeUI usando Storybook. Usa los mismos parámetros que los stories de ejemplo de QGSXUI.",
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
    // Props del Map
    mapHeight: {
      control: 'number',
      description: 'Alto del mapa',
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
    // Props del TableInfiniteScroll
    layerName: {
      control: 'text',
      description: 'ID de la capa QGIS para la tabla',
      table: {
        category: 'Table'
      }
    },
    chunkSize: {
      control: 'number',
      description: 'Tamaño del chunk para infinite scroll',
      table: {
        category: 'Table'
      }
    },
    tableHeight: {
      control: 'number',
      description: 'Alto de la tabla',
      table: {
        category: 'Table'
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Ejemplo básico de uso de componentes QGSXUI
 */
export const IntegrationExample: Story = {
  args: {
    // Props del QgisConfigProvider (mismos valores que en los stories de QGSXUI)
    qgsUrl: 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe',
    qgsProjectPath: 'C:/trabajos/gisbrick/QGIS/demo01.qgz',
    language: 'es',
    token: null,
    // Props del Map (mismos valores que en Map.stories.jsx)
    mapHeight: 400,
    showControls: true,
    // Props del TableInfiniteScroll (mismos valores que en Table.stories.jsx)
    layerName: 'tabla',
    chunkSize: 40,
    tableHeight: 360,
  },
  render: (args) => {
    const { qgsUrl, qgsProjectPath, language, token, mapHeight, showControls, layerName, chunkSize, tableHeight } = args;
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        padding: '20px',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: '1 1 50%', minHeight: 0 }}>
          <h3 style={{ marginBottom: '10px' }}>Mapa QGIS</h3>
          <Map
            height={mapHeight}
            showControls={showControls}
          />
        </div>
        
        <div style={{ flex: '1 1 50%', minHeight: 0 }}>
          <h3 style={{ marginBottom: '10px' }}>Tabla con Infinite Scroll</h3>
          <TableInfiniteScroll
            layerName={layerName}
            chunkSize={chunkSize}
            height={tableHeight}
          />
        </div>
      </div>
    );
  },
};

/**
 * Ejemplo con layout horizontal (mapa y tabla lado a lado)
 */
export const HorizontalLayout: Story = {
  args: {
    qgsUrl: 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe',
    qgsProjectPath: 'C:/trabajos/gisbrick/QGIS/demo01.qgz',
    language: 'es',
    token: null,
    mapHeight: 600,
    showControls: true,
    layerName: 'tabla',
    chunkSize: 40,
    tableHeight: 600,
  },
  render: (args) => {
    const { qgsUrl, qgsProjectPath, language, token, mapHeight, showControls, layerName, chunkSize, tableHeight } = args;
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '20px', 
        padding: '20px',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: '1 1 50%', minWidth: 0 }}>
          <h3 style={{ marginBottom: '10px' }}>Mapa QGIS</h3>
          <Map
            height={mapHeight}
            showControls={showControls}
          />
        </div>
        
        <div style={{ flex: '1 1 50%', minWidth: 0 }}>
          <h3 style={{ marginBottom: '10px' }}>Tabla con Infinite Scroll</h3>
          <TableInfiniteScroll
            layerName={layerName}
            chunkSize={chunkSize}
            height={tableHeight}
          />
        </div>
      </div>
    );
  },
};


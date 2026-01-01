/**
 * Componente Content
 * Renderiza diferentes tipos de contenido basado en componentes QGSXUI
 */

import React from 'react';
import { Map, Table } from '@qgsxui/components/QGS';
import { QgsChart } from '@qgsxui/components/QGS';
import { createLogger } from '../../utils/logger';

const log = createLogger('Content');

export interface ContentProps {
  /** Tipo de contenido: 'Map', 'Table', 'Chart', 'HTML', etc. */
  contentType: string;
  /** Configuración del contenido (varía según el tipo) */
  config: any;
  /** Token de autenticación */
  token?: string;
  /** Idioma */
  lang?: string;
}

/**
 * Componente Content
 * Renderiza el contenido apropiado según el tipo
 */
export const Content: React.FC<ContentProps> = ({
  contentType,
  config,
  token,
  lang = 'es',
}) => {
  log.info(`Renderizando contenido tipo: ${contentType}`, config);

  switch (contentType) {
    case 'Map':
      return (
        <Map
          qgisProject={config.qgsProject}
          config={config.qgisConfig}
        />
      );

    case 'Table':
      return (
        <Table
          qgisProject={config.qgsProject}
          layerName={config.layerName}
          config={config.tableConfig}
        />
      );

    case 'Chart':
      return (
        <QgsChart
          type={config.chartType || 'bar'}
          data={config.data}
          config={config.chartConfig}
        />
      );

    case 'HTML':
      return (
        <div
          dangerouslySetInnerHTML={{ __html: config.html }}
          style={{ padding: '20px' }}
        />
      );

    default:
      return (
        <div style={{ padding: '20px', color: '#999' }}>
          Tipo de contenido no soportado: {contentType}
        </div>
      );
  }
};

export default Content;


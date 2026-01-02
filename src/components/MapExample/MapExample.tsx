/**
 * Componente de ejemplo que muestra solo un mapa QGIS
 * 
 * Este componente demuestra cómo usar el componente Map de QGSXUI
 * de forma simple, mostrando únicamente el mapa sin otros elementos.
 */

import React from 'react';
import Map from '@qgsxui/components/QGS/Map/Map';

export interface MapExampleProps {
  /** URL del servicio QGIS Server */
  qgsUrl: string;
  /** Ruta del proyecto QGIS (.qgs o .qgz) */
  qgsProjectPath: string;
  /** Alto del mapa */
  height?: number | string;
  /** Ancho del mapa */
  width?: number | string;
  /** Mostrar controles del mapa */
  showControls?: boolean;
  /** Token de autenticación opcional */
  token?: string;
  /** Idioma */
  language?: string;
}

/**
 * Componente que muestra un mapa QGIS usando QGSXUI
 */
export const MapExample: React.FC<MapExampleProps> = ({
  qgsUrl,
  qgsProjectPath,
  height = 600,
  width = '100%',
  showControls = true,
  token,
  language = 'es',
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Map
        height={height}
        width={width}
        showControls={showControls}
      />
    </div>
  );
};

export default MapExample;


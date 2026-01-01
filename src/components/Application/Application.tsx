/**
 * Componente Application
 * Representa una aplicación con menú de vistas/contenidos
 * Basado en componentes QGSXUI
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@qgsxui/components/UI';
import { Modal } from '@qgsxui/components/UI';
import { useTranslation } from 'react-i18next';
import { createLogger } from '../../utils/logger';

const log = createLogger('Application');

export interface ApplicationConfigItem {
  type: 'PARENT' | 'LEAF';
  key: string;
  title: string;
  permission?: string;
  children?: ApplicationConfigItem[];
  component?: string;
  qgsProject?: string;
  [key: string]: any;
}

export interface ApplicationProps {
  /** Token de autenticación */
  token?: string;
  /** ID de la aplicación */
  idApp: number;
  /** Nombre de la aplicación */
  appName: string;
  /** Descripción */
  description?: string;
  /** Thumbnail (URL o base64) */
  thumbnail?: string;
  /** Configuración JSON con estructura de menús y vistas */
  config: ApplicationConfigItem[];
  /** Idioma */
  lang?: string;
  /** Callback cuando se selecciona un contenido */
  onContentSelect?: (content: ApplicationConfigItem) => void;
  /** URL base de la API */
  apiBaseUrl?: string;
}

/**
 * Componente Application
 * Muestra una aplicación con menú de navegación de vistas/contenidos
 */
export const Application: React.FC<ApplicationProps> = ({
  token,
  idApp,
  appName,
  description,
  thumbnail,
  config,
  lang = 'es',
  onContentSelect,
  apiBaseUrl = 'http://localhost:3001/api/v1',
}) => {
  const { t } = useTranslation();
  const [selectedContent, setSelectedContent] = useState<ApplicationConfigItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    log.info(`Application ${idApp} cargada`, { appName, config });
    
    // Seleccionar primer contenido LEAF por defecto
    const firstLeaf = findFirstLeaf(config);
    if (firstLeaf && onContentSelect) {
      setSelectedContent(firstLeaf);
      onContentSelect(firstLeaf);
    }
  }, [config, idApp, appName, onContentSelect]);

  /**
   * Encuentra el primer elemento LEAF en la configuración
   */
  const findFirstLeaf = (items: ApplicationConfigItem[]): ApplicationConfigItem | null => {
    for (const item of items) {
      if (item.type === 'LEAF') {
        return item;
      }
      if (item.type === 'PARENT' && item.children) {
        const leaf = findFirstLeaf(item.children);
        if (leaf) return leaf;
      }
    }
    return null;
  };

  /**
   * Maneja el clic en un elemento del menú
   */
  const handleItemClick = (item: ApplicationConfigItem) => {
    if (item.type === 'LEAF') {
      setSelectedContent(item);
      if (onContentSelect) {
        onContentSelect(item);
      }
    } else if (item.type === 'PARENT') {
      // Toggle expanded
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.key)) {
        newExpanded.delete(item.key);
      } else {
        newExpanded.add(item.key);
      }
      setExpandedItems(newExpanded);
    }
  };

  /**
   * Renderiza un elemento del menú
   */
  const renderMenuItem = (item: ApplicationConfigItem, level: number = 0): React.ReactNode => {
    const isExpanded = expandedItems.has(item.key);
    const isSelected = selectedContent?.key === item.key;
    const indent = level * 20;

    return (
      <div key={item.key} style={{ marginLeft: `${indent}px` }}>
        <Button
          onClick={() => handleItemClick(item)}
          style={{
            width: '100%',
            textAlign: 'left',
            backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          {item.type === 'PARENT' && (isExpanded ? '▼' : '▶')} {item.title}
        </Button>
        {item.type === 'PARENT' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Menú lateral */}
      <div style={{
        width: '250px',
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        overflowY: 'auto',
        padding: '16px',
      }}>
        <h2 style={{ marginTop: 0 }}>{appName}</h2>
        {description && <p style={{ fontSize: '0.9em', color: '#666' }}>{description}</p>}
        
        <div style={{ marginTop: '20px' }}>
          {config.map(item => renderMenuItem(item))}
        </div>
      </div>

      {/* Área de contenido */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selectedContent ? (
          <div>
            <h3>{selectedContent.title}</h3>
            <p>Contenido seleccionado: {selectedContent.key}</p>
            {selectedContent.component && <p>Componente: {selectedContent.component}</p>}
            {selectedContent.qgsProject && <p>Proyecto QGIS: {selectedContent.qgsProject}</p>}
          </div>
        ) : (
          <div>
            <p>{t('ui.common.select', 'Seleccione un contenido del menú')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Application;


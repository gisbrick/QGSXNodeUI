/**
 * Componente ApplicationList
 * Lista las aplicaciones disponibles
 */

import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '@qgsxui/components/UI';
import { useTranslation } from 'react-i18next';
import { createLogger } from '../../utils/logger';

const log = createLogger('ApplicationList');

export interface Application {
  id_app: number;
  app_name: string;
  description?: string;
  thumbnail?: string;
  idUnt: {
    idUnt: number;
    unitName: string;
  };
  lang?: string;
}

export interface ApplicationListProps {
  /** Token de autenticación */
  token?: string;
  /** Idioma */
  lang?: string;
  /** URL base de la API */
  apiBaseUrl?: string;
  /** Callback cuando se selecciona una aplicación */
  onApplicationSelect?: (app: Application) => void;
}

/**
 * Componente ApplicationList
 * Muestra una lista de aplicaciones disponibles
 */
export const ApplicationList: React.FC<ApplicationListProps> = ({
  token,
  lang = 'es',
  apiBaseUrl = 'http://localhost:3001/api/v1',
  onApplicationSelect,
}) => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [token, lang]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseUrl}/app/list/${lang}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setApplications(data);
      log.info(`Aplicaciones cargadas: ${data.length}`);
    } catch (err: any) {
      log.error('Error cargando aplicaciones:', err);
      setError(err.message || 'Error al cargar aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationClick = (app: Application) => {
    if (onApplicationSelect) {
      onApplicationSelect(app);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <p>Error: {error}</p>
        <Button onClick={loadApplications}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('ui.common.applications', 'Aplicaciones')}</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px',
      }}>
        {applications.map((app) => (
          <div
            key={app.id_app}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => handleApplicationClick(app)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {app.thumbnail && (
              <img
                src={app.thumbnail}
                alt={app.app_name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}
              />
            )}
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{app.app_name}</h3>
            {app.description && (
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                {app.description}
              </p>
            )}
            <p style={{ fontSize: '0.8em', color: '#999' }}>
              {app.idUnt.unitName}
            </p>
          </div>
        ))}
      </div>
      {applications.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          No hay aplicaciones disponibles
        </p>
      )}
    </div>
  );
};

export default ApplicationList;


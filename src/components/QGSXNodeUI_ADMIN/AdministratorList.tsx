/**
 * Componente para listar administradores existentes
 * Requiere permisos de administrador
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminGuard } from './AdminGuard';
import Button from '@qgsxui/components/UI/Button/Button';
import Message from '@qgsxui/components/UI/Message/Message';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import ConfirmDialog from '@qgsxui/components/UI/ConfirmDialog/ConfirmDialog';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface Administrator {
  username: string;
  created_at: string;
  created_by: string | null;
}

export interface AdministratorListProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente para listar y gestionar administradores
 */
export const AdministratorList: React.FC<AdministratorListProps> = ({
  token,
  lang = 'es',
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; username: string | null }>({
    open: false,
    username: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token) {
      loadAdministrators();
    }
  }, [token]);

  const loadAdministrators = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_ENDPOINTS.administrators.list(), {
        method: 'GET',
        token,
      });
      setAdministrators(data || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (username: string) => {
    // Verificar si es el superadministrador (hardcoded como 'admin' por defecto)
    const superadminUser = 'admin';
    if (username === superadminUser) {
      setError(t('admin.administratorList.cannotRemoveSuperadmin'));
      return;
    }
    setDeleteConfirm({ open: true, username });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.username) return;

    setDeleting(true);
    try {
      await apiRequest(API_ENDPOINTS.administrators.remove(deleteConfirm.username), {
        method: 'DELETE',
        token,
      });

      setAdministrators(prev => prev.filter(a => a.username !== deleteConfirm.username));
      setDeleteConfirm({ open: false, username: null });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.administratorList.removeError'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminGuard token={token}>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{t('admin.administratorList.title')}</h2>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Message type="error" onClose={() => setError(null)}>{error}</Message>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
            <span style={{ marginLeft: '1rem' }}>{t('admin.administratorList.loading')}</span>
          </div>
        ) : administrators.length === 0 ? (
          <Message type="info">{t('admin.administratorList.noAdministrators')}</Message>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.administratorList.username')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.administratorList.createdBy')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.administratorList.createdAt')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                    {t('admin.administratorList.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {administrators.map((admin) => (
                  <tr key={admin.username} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{admin.username}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {admin.created_by || t('ui.common.empty')}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{formatDate(admin.created_at)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <Button
                        className="ui-button--ghost"
                        onClick={() => handleDelete(admin.username)}
                        disabled={admin.username === 'admin'}
                        size="small"
                      >
                        <i className="fas fa-trash" style={{ marginRight: '0.5rem' }} />
                        {t('admin.administratorList.remove')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDialog
          open={deleteConfirm.open}
          title={t('admin.administratorList.remove')}
          message={t('admin.administratorList.removeConfirm')}
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, username: null })}
          loading={deleting}
          lang={lang}
        />
      </div>
    </AdminGuard>
  );
};

export default AdministratorList;


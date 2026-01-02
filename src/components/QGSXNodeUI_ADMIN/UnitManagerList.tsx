/**
 * Componente para listar gestores de una unidad con acciones
 * Requiere permisos de administrador
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminGuard } from './AdminGuard';
import Button from '@qgsxui/components/UI/Button/Button';
import Message from '@qgsxui/components/UI/Message/Message';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import Select from '@qgsxui/components/UI/Select/Select';
import FormRow from '@qgsxui/components/UI/FormRow/FormRow';
import ConfirmDialog from '@qgsxui/components/UI/ConfirmDialog/ConfirmDialog';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface Unit {
  id_unt: number;
  unit_name: string;
}

export interface UnitManager {
  username: string;
  created_at: string;
  created_by: string | null;
}

export interface UnitManagerListProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente para listar y gestionar gestores de una unidad
 */
export const UnitManagerList: React.FC<UnitManagerListProps> = ({
  token,
  lang = 'es',
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [managers, setManagers] = useState<UnitManager[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; username: string | null }>({
    open: false,
    username: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token) {
      loadUnits();
    }
  }, [token]);

  useEffect(() => {
    if (selectedUnitId && token) {
      loadManagers(parseInt(selectedUnitId));
    } else {
      setManagers([]);
    }
  }, [selectedUnitId, token]);

  const loadUnits = async () => {
    setLoadingUnits(true);
    setError(null);
    try {
      const data = await apiRequest(API_ENDPOINTS.units.list(), {
        method: 'GET',
        token,
      });
      setUnits(data || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando unidades');
    } finally {
      setLoadingUnits(false);
    }
  };

  const loadManagers = async (unitId: number) => {
    setLoadingManagers(true);
    setError(null);
    try {
      const data = await apiRequest(API_ENDPOINTS.unitManagers.listByUnitId(unitId), {
        method: 'GET',
        token,
      });
      setManagers(data.managers || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando gestores');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleDelete = (username: string) => {
    setDeleteConfirm({ open: true, username });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.username || !selectedUnitId) return;

    setDeleting(true);
    try {
      await apiRequest(
        API_ENDPOINTS.unitManagers.remove(parseInt(selectedUnitId), deleteConfirm.username),
        {
          method: 'DELETE',
          token,
        }
      );

      await loadManagers(parseInt(selectedUnitId));
      setDeleteConfirm({ open: false, username: null });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitManager.removeError'));
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

  const unitOptions = units.map(unit => ({
    value: unit.id_unt.toString(),
    label: unit.unit_name,
  }));

  return (
    <AdminGuard token={token}>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{t('admin.unitManager.listTitle')}</h2>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Message type="error" onClose={() => setError(null)}>{error}</Message>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <FormRow label={t('admin.unitManager.unit')}>
            {loadingUnits ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Spinner />
                <span>{t('admin.unitManager.loadingUnits')}</span>
              </div>
            ) : (
              <Select
                options={unitOptions}
                value={selectedUnitId}
                onChange={(value) => setSelectedUnitId(String(value))}
                placeholder={t('admin.unitManager.unitPlaceholder')}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            )}
          </FormRow>
        </div>

        {selectedUnitId && (
          <>
            {loadingManagers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Spinner />
                <span style={{ marginLeft: '1rem' }}>{t('admin.unitManager.loadingUnits')}</span>
              </div>
            ) : managers.length === 0 ? (
              <Message type="info">{t('admin.unitManager.noManagers')}</Message>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                        {t('admin.unitManager.username')}
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                        {t('admin.unitManager.createdBy')}
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                        {t('admin.unitManager.createdAt')}
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                        {t('admin.administratorList.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager) => (
                      <tr key={manager.username} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem' }}>{manager.username}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {manager.created_by || t('ui.common.empty')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{formatDate(manager.created_at)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <Button
                            className="ui-button--ghost"
                            onClick={() => handleDelete(manager.username)}
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
          </>
        )}

        <ConfirmDialog
          open={deleteConfirm.open}
          title={t('admin.unitManager.remove')}
          message={t('admin.unitManager.removeConfirm')}
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

export default UnitManagerList;


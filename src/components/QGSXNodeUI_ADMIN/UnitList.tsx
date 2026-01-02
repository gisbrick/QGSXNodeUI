/**
 * Componente para listar unidades con acciones de editar y eliminar
 * Requiere permisos de administrador
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminGuard } from './AdminGuard';
import TextControl from '@qgsxui/components/UI_QGS_Form/TextControl/TextControl';
import Button from '@qgsxui/components/UI/Button/Button';
import Modal from '@qgsxui/components/UI/Modal/Modal';
import Message from '@qgsxui/components/UI/Message/Message';
import FormRow from '@qgsxui/components/UI/FormRow/FormRow';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import ConfirmDialog from '@qgsxui/components/UI/ConfirmDialog/ConfirmDialog';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface Unit {
  id_unt: number;
  unit_name: string;
  description?: string;
  path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitListProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente para listar y gestionar unidades
 */
export const UnitList: React.FC<UnitListProps> = ({
  token,
  lang = 'es',
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; unit: Unit | null }>({
    open: false,
    unit: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; unitId: number | null }>({
    open: false,
    unitId: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [unitName, setUnitName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');

  useEffect(() => {
    if (token) {
      loadUnits();
    }
  }, [token]);

  const loadUnits = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setUnitName(unit.unit_name);
    setDescription(unit.description || '');
    setPath(unit.path || '');
    setEditModal({ open: true, unit });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.unit || !unitName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await apiRequest(API_ENDPOINTS.units.update(editModal.unit.id_unt), {
        method: 'PUT',
        token,
        body: JSON.stringify({
          unit_name: unitName.trim(),
          description: description.trim() || null,
          path: path.trim() || null,
        }),
      });

      await loadUnits();
      setEditModal({ open: false, unit: null });
      setUnitName('');
      setDescription('');
      setPath('');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitList.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (unitId: number) => {
    setDeleteConfirm({ open: true, unitId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.unitId) return;

    setDeleting(true);
    try {
      await apiRequest(API_ENDPOINTS.units.remove(deleteConfirm.unitId), {
        method: 'DELETE',
        token,
      });

      await loadUnits();
      setDeleteConfirm({ open: false, unitId: null });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitList.removeError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminGuard token={token}>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{t('admin.unitList.title')}</h2>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Message type="error" onClose={() => setError(null)}>{error}</Message>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
            <span style={{ marginLeft: '1rem' }}>{t('admin.unitList.loading')}</span>
          </div>
        ) : units.length === 0 ? (
          <Message type="info">{t('admin.unitList.noUnits')}</Message>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.unitList.unitName')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.unitList.description')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                    {t('admin.unitList.path')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                    {t('admin.unitList.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id_unt} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{unit.unit_name}</td>
                    <td style={{ padding: '0.75rem' }}>{unit.description || t('ui.common.empty')}</td>
                    <td style={{ padding: '0.75rem' }}>{unit.path || t('ui.common.empty')}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button
                        className="ui-button--ghost"
                        onClick={() => handleEdit(unit)}
                        size="small"
                      >
                        <i className="fas fa-edit" style={{ marginRight: '0.5rem' }} />
                        {t('admin.unitList.edit')}
                      </Button>
                      <Button
                        className="ui-button--ghost"
                        onClick={() => handleDelete(unit.id_unt)}
                        size="small"
                      >
                        <i className="fas fa-trash" style={{ marginRight: '0.5rem' }} />
                        {t('admin.unitList.remove')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de edición */}
        <Modal
          isOpen={editModal.open}
          onClose={() => {
            setEditModal({ open: false, unit: null });
            setUnitName('');
            setDescription('');
            setPath('');
            setError(null);
          }}
          title={t('admin.unitList.editTitle')}
          size="medium"
          lang={lang}
        >
          <form onSubmit={handleSave}>
            {error && (
              <div style={{ marginBottom: '1rem' }}>
                <Message type="error">{error}</Message>
              </div>
            )}

            <FormRow label={t('admin.unit.unitName')}>
              <TextControl
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder={t('admin.unit.unitNamePlaceholder')}
                required
                disabled={saving}
                className=""
                lang={lang}
              />
            </FormRow>

            <FormRow label={t('admin.unit.description')}>
              <TextControl
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('admin.unit.descriptionPlaceholder')}
                disabled={saving}
                className=""
                lang={lang}
              />
            </FormRow>

            <FormRow label={t('admin.unit.path')}>
              <TextControl
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder={t('admin.unit.pathPlaceholder')}
                disabled={saving}
                className=""
                lang={lang}
              />
            </FormRow>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button
                type="button"
                className="ui-button--secondary"
                onClick={() => {
                  setEditModal({ open: false, unit: null });
                  setUnitName('');
                  setDescription('');
                  setPath('');
                }}
                disabled={saving}
              >
                {t('ui.common.cancel')}
              </Button>
              <Button
                type="submit"
                className="ui-button--primary"
                disabled={saving || !unitName.trim()}
              >
                {saving ? t('ui.common.saving') : t('ui.common.save')}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={deleteConfirm.open}
          title={t('admin.unitList.remove')}
          message={t('admin.unitList.removeConfirm')}
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, unitId: null })}
          loading={deleting}
          lang={lang}
        />
      </div>
    </AdminGuard>
  );
};

export default UnitList;


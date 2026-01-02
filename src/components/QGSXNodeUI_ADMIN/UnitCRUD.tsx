/**
 * Componente CRUD unificado para unidades
 * Combina crear, listar, editar y eliminar en un solo componente
 * Requiere permisos de administrador
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { AdminGuard } from './AdminGuard';
import TextControl from '@qgsxui/components/UI_QGS_Form/TextControl/TextControl';
import Button from '@qgsxui/components/UI/Button/Button';
import Modal from '@qgsxui/components/UI/Modal/Modal';
import Message from '@qgsxui/components/UI/Message/Message';
import FormRow from '@qgsxui/components/UI/FormRow/FormRow';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import ConfirmDialog from '@qgsxui/components/UI/ConfirmDialog/ConfirmDialog';
import SearchInput from '@qgsxui/components/UI/SearchInput/SearchInput';
import Pagination from '@qgsxui/components/UI/Pagination/Pagination';
import UnsavedChangesDialog from '@qgsxui/components/UI/UnsavedChangesDialog/UnsavedChangesDialog';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface Unit {
  id_unt: number;
  unit_name: string;
  description?: string;
  path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitCRUDProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente CRUD unificado para unidades
 */
export const UnitCRUD: React.FC<UnitCRUDProps> = ({
  token,
  lang = 'es',
  onRefresh,
}) => {
  // Usar useTranslation - se suscribe automáticamente a cambios de idioma
  const { t, i18n: i18nInstance } = useTranslation();
  
  // Cambiar idioma cuando cambia el prop lang
  useEffect(() => {
    if (lang && i18nInstance.language !== lang) {
      i18nInstance.changeLanguage(lang);
    }
  }, [lang, i18nInstance]);
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Estado para modal de creación/edición
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [initialUnitName, setInitialUnitName] = useState('');
  const [initialDescription, setInitialDescription] = useState('');
  const [initialPath, setInitialPath] = useState('');
  
  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; unitId: number | null }>({
    open: false,
    unitId: null,
  });
  const [deleting, setDeleting] = useState(false);

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
      setError(err.message || t('admin.unitList.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Detectar si hay cambios pendientes (solo cuando el modal está abierto)
  const hasUnsavedChanges = useMemo(() => {
    if (!modalOpen) return false;
    return (
      unitName.trim() !== initialUnitName.trim() ||
      description.trim() !== initialDescription.trim() ||
      path.trim() !== initialPath.trim()
    );
  }, [unitName, description, path, initialUnitName, initialDescription, initialPath, modalOpen]);

  // Manejar el cierre de la modal con verificación de cambios
  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      setModalOpen(false);
      setEditingUnit(null);
      setUnitName('');
      setDescription('');
      setPath('');
      setInitialUnitName('');
      setInitialDescription('');
      setInitialPath('');
      setError(null);
      setSuccess(null);
    }
  };

  // Guardar desde el diálogo de cambios sin guardar
  const handleUnsavedSave = async () => {
    setShowUnsavedDialog(false);
    if (unitName.trim()) {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSave(formEvent);
      if (!error) {
        setPendingClose(false);
        setModalOpen(false);
        setEditingUnit(null);
        setUnitName('');
        setDescription('');
        setPath('');
        setInitialUnitName('');
        setInitialDescription('');
        setInitialPath('');
      }
    }
  };

  // Salir sin guardar desde el diálogo de cambios sin guardar
  const handleUnsavedExit = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
    setModalOpen(false);
    setEditingUnit(null);
    setUnitName('');
    setDescription('');
    setPath('');
    setInitialUnitName('');
    setInitialDescription('');
    setInitialPath('');
    setError(null);
    setSuccess(null);
  };

  const handleCreate = () => {
    setEditingUnit(null);
    setUnitName('');
    setDescription('');
    setPath('');
    setInitialUnitName('');
    setInitialDescription('');
    setInitialPath('');
    setError(null);
    setModalOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.unit_name);
    setDescription(unit.description || '');
    setPath(unit.path || '');
    setInitialUnitName(unit.unit_name);
    setInitialDescription(unit.description || '');
    setInitialPath(unit.path || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unitName.trim()) {
      setError(t('admin.unit.unitNameRequired'));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUnit) {
        // Actualizar
        await apiRequest(API_ENDPOINTS.units.update(editingUnit.id_unt), {
          method: 'PUT',
          token,
          body: JSON.stringify({
            unit_name: unitName.trim(),
            description: description.trim() || null,
            path: path.trim() || null,
          }),
        });
      } else {
        // Crear
        await apiRequest(API_ENDPOINTS.units.create(), {
          method: 'POST',
          token,
          body: JSON.stringify({
            unit_name: unitName.trim(),
            description: description.trim() || null,
            path: path.trim() || null,
          }),
        });
      }

      setModalOpen(false);
      setUnitName('');
      setDescription('');
      setPath('');
      setEditingUnit(null);
      setInitialUnitName('');
      setInitialDescription('');
      setInitialPath('');
      await loadUnits();
      
      setSuccess(editingUnit ? t('admin.unitList.updateSuccess') : t('admin.unit.createSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || (editingUnit ? t('admin.unitList.updateError') : t('admin.unit.createError')));
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
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(API_ENDPOINTS.units.remove(deleteConfirm.unitId), {
        method: 'DELETE',
        token,
      });

      await loadUnits();
      setDeleteConfirm({ open: false, unitId: null });
      
      setSuccess(t('admin.unitList.removeSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitList.removeError'));
    } finally {
      setDeleting(false);
    }
  };

  // Filtrar unidades según el término de búsqueda
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) {
      return units;
    }
    const search = searchTerm.toLowerCase();
    return units.filter(unit => 
      unit.unit_name.toLowerCase().includes(search) ||
      (unit.description && unit.description.toLowerCase().includes(search)) ||
      (unit.path && unit.path.toLowerCase().includes(search))
    );
  }, [units, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredUnits.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminGuard token={token}>
      <div style={{ padding: '1.5rem' }}>
        {/* Header con título, búsqueda y botón de añadir */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center', 
          marginBottom: '1.5rem',
          justifyContent: 'space-between'
        }}>
          {/* Título y búsqueda juntos a la izquierda */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flex: '1 1 auto',
            flexWrap: 'wrap'
          }}>
            <h2 style={{ margin: 0 }}>{t('admin.unitList.title')}</h2>
            
            {/* Input de búsqueda - solo se muestra si hay datos */}
            {!loading && units.length > 0 && (
              <div style={{ minWidth: '200px', maxWidth: '400px' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('ui.common.search')}
                  size="small"
                />
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleCreate} 
            className="ui-button--primary"
            style={{ flex: '0 0 auto' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '0.5rem' }} />
            {t('admin.unit.createButton')}
          </Button>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Message type="error" onClose={() => setError(null)}>{error}</Message>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '1rem' }}>
            <Message type="success" onClose={() => setSuccess(null)}>{success}</Message>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
            <span style={{ marginLeft: '1rem' }}>{t('admin.unitList.loading')}</span>
          </div>
        ) : units.length === 0 ? (
          <Message type="info">{t('admin.unitList.noUnits')}</Message>
        ) : filteredUnits.length === 0 ? (
          <Message type="info">{t('ui.common.noResults')}</Message>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.unitList.actions')}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.unitList.unitName')}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.unitList.description')}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.unitList.path')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUnits.map((unit) => (
                    <tr key={unit.id_unt} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <Button
                          className="ui-button--ghost"
                          onClick={() => handleEdit(unit)}
                          size="small"
                          title={t('admin.unitList.edit')}
                        >
                          <i className="fas fa-edit" />
                        </Button>
                        <Button
                          className="ui-button--ghost"
                          onClick={() => handleDelete(unit.id_unt)}
                          size="small"
                          title={t('admin.unitList.remove')}
                        >
                          <i className="fas fa-trash" />
                        </Button>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{unit.unit_name}</td>
                      <td style={{ padding: '0.75rem' }}>{unit.description || t('ui.common.empty')}</td>
                      <td style={{ padding: '0.75rem' }}>{unit.path || t('ui.common.empty')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showFirstLast={true}
                  showNumbers={true}
                  maxVisiblePages={5}
                  size="medium"
                  lang={lang}
                />
              </div>
            )}
          </>
        )}

        {/* Modal de creación/edición */}
        <Modal
          isOpen={modalOpen}
          onClose={handleModalClose}
          title={editingUnit ? t('admin.unitList.editTitle') : t('admin.unit.title')}
          size="medium"
          lang={lang}
        >
          <form onSubmit={handleSave}>
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
                onClick={handleModalClose}
                disabled={saving}
                icon={<i className="fas fa-xmark" />}
              >
                {t('ui.common.cancel')}
              </Button>
              <Button
                type="submit"
                className="ui-button--primary"
                disabled={saving || !unitName.trim()}
                icon={<i className="fas fa-floppy-disk" />}
              >
                {saving ? t('ui.common.saving') : t('ui.common.save')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Diálogo de confirmación de eliminación */}
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

        {/* Diálogo de cambios sin guardar */}
        <UnsavedChangesDialog
          open={showUnsavedDialog}
          onSave={handleUnsavedSave}
          onExit={handleUnsavedExit}
          lang={lang}
          loading={saving}
        />
      </div>
    </AdminGuard>
  );
};

export default UnitCRUD;


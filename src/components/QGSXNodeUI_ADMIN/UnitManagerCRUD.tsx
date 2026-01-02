/**
 * Componente CRUD unificado para gestores de unidades
 * Combina crear, listar y eliminar en un solo componente
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
import Select from '@qgsxui/components/UI/Select/Select';
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
}

export interface UnitManager {
  username: string;
  created_at: string;
  created_by: string | null;
}

export interface UnitManagerCRUDProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente CRUD unificado para gestores de unidades
 */
export const UnitManagerCRUD: React.FC<UnitManagerCRUDProps> = ({
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
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [managers, setManagers] = useState<UnitManager[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Estado para modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');
  const [initialSelectedUnitId, setInitialSelectedUnitId] = useState<string>('');
  
  // Estado para confirmación de eliminación
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
      setError(err.message || t('admin.unitManager.loadUnitsError'));
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
      setError(err.message || t('admin.unitManager.loadManagersError'));
    } finally {
      setLoadingManagers(false);
    }
  };

  // Detectar si hay cambios pendientes (solo cuando el modal está abierto)
  const hasUnsavedChanges = useMemo(() => {
    if (!createModalOpen) return false;
    return (
      username.trim() !== initialUsername.trim() ||
      selectedUnitId !== initialSelectedUnitId
    );
  }, [username, selectedUnitId, initialUsername, initialSelectedUnitId, createModalOpen]);

  // Manejar el cierre de la modal con verificación de cambios
  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      setCreateModalOpen(false);
      setUsername('');
      setInitialUsername('');
      setInitialSelectedUnitId('');
      setError(null);
      setSuccess(null);
    }
  };

  // Guardar desde el diálogo de cambios sin guardar
  const handleUnsavedSave = async () => {
    setShowUnsavedDialog(false);
    if (selectedUnitId && username.trim()) {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleCreate(formEvent);
      if (!error) {
        setPendingClose(false);
        setCreateModalOpen(false);
        setUsername('');
        setInitialUsername('');
        setInitialSelectedUnitId('');
      }
    }
  };

  // Salir sin guardar desde el diálogo de cambios sin guardar
  const handleUnsavedExit = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
    setCreateModalOpen(false);
    setUsername('');
    setInitialUsername('');
    setInitialSelectedUnitId('');
    setError(null);
    setSuccess(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUnitId) {
      setError(t('admin.unitManager.unitRequired'));
      return;
    }

    if (!username.trim()) {
      setError(t('admin.unitManager.usernameRequired'));
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(API_ENDPOINTS.unitManagers.create(), {
        method: 'POST',
        token,
        body: JSON.stringify({
          idUnit: parseInt(selectedUnitId),
          username: username.trim(),
        }),
      });

      setUsername('');
      setInitialUsername('');
      setInitialSelectedUnitId('');
      setCreateModalOpen(false);
      await loadManagers(parseInt(selectedUnitId));
      
      setSuccess(t('admin.unitManager.createSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitManager.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (username: string) => {
    setDeleteConfirm({ open: true, username });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.username || !selectedUnitId) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);
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
      
      setSuccess(t('admin.unitManager.removeSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.unitManager.removeError'));
    } finally {
      setDeleting(false);
    }
  };

  // Filtrar gestores según el término de búsqueda
  const filteredManagers = useMemo(() => {
    if (!searchTerm.trim()) {
      return managers;
    }
    const search = searchTerm.toLowerCase();
    return managers.filter(manager => 
      manager.username.toLowerCase().includes(search) ||
      (manager.created_by && manager.created_by.toLowerCase().includes(search))
    );
  }, [managers, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredManagers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedManagers = filteredManagers.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda o la unidad seleccionada
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUnitId]);

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
            <h2 style={{ margin: 0 }}>{t('admin.unitManager.listTitle')}</h2>
            
            {/* Input de búsqueda - solo se muestra si hay datos y hay unidad seleccionada */}
            {selectedUnitId && !loadingManagers && managers.length > 0 && (
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
            onClick={() => {
              setCreateModalOpen(true);
              setInitialUsername('');
              setInitialSelectedUnitId(selectedUnitId);
            }} 
            className="ui-button--primary"
            disabled={!selectedUnitId}
            title={!selectedUnitId ? t('admin.unitManager.selectUnitFirst') : ''}
            style={{ flex: '0 0 auto' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '0.5rem' }} />
            {t('admin.unitManager.createButton')}
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

        <div style={{ marginBottom: '1.5rem' }}>
          <FormRow label={t('admin.unitManager.unit')}>
            {loadingUnits ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Spinner />
                <span>{t('admin.unitManager.loadingUnits')}</span>
              </div>
            ) : (
              <div style={{ width: 'fit-content', maxWidth: '300px' }}>
                <Select
                  options={unitOptions}
                  value={selectedUnitId}
                  onChange={(value) => {
                    setSelectedUnitId(String(value));
                  }}
                  placeholder={t('admin.unitManager.unitPlaceholder')}
                  size="medium"
                  className=""
                />
              </div>
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
            ) : filteredManagers.length === 0 ? (
              <Message type="info">{t('ui.common.noResults')}</Message>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          {t('admin.administratorList.actions')}
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          {t('admin.unitManager.username')}
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          {t('admin.unitManager.createdBy')}
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          {t('admin.unitManager.createdAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedManagers.map((manager) => (
                        <tr key={manager.username} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <Button
                              className="ui-button--ghost"
                              onClick={() => handleDelete(manager.username)}
                              size="small"
                              title={t('admin.administratorList.remove')}
                            >
                              <i className="fas fa-trash" />
                            </Button>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{manager.username}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {manager.created_by || t('ui.common.empty')}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{formatDate(manager.created_at)}</td>
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
          </>
        )}

        {/* Modal de creación */}
        <Modal
          isOpen={createModalOpen}
          onClose={handleModalClose}
          title={t('admin.unitManager.title')}
          size="medium"
          lang={lang}
        >
          <form onSubmit={handleCreate}>
            <FormRow label={t('admin.unitManager.unit')}>
              <Select
                options={unitOptions}
                value={selectedUnitId}
                onChange={(value) => {
                  const newValue = String(value);
                  setSelectedUnitId(newValue);
                  // Si es la primera vez que se selecciona en el modal, guardar como inicial
                  if (!initialSelectedUnitId && createModalOpen) {
                    setInitialSelectedUnitId(newValue);
                  }
                }}
                placeholder={t('admin.unitManager.unitPlaceholder')}
                disabled={creating}
                size="medium"
                className=""
              />
            </FormRow>

            <FormRow label={t('admin.unitManager.username')}>
              <TextControl
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('admin.unitManager.usernamePlaceholder')}
                required
                disabled={creating}
                className=""
                lang={lang}
              />
            </FormRow>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button
                type="button"
                className="ui-button--secondary"
                onClick={handleModalClose}
                disabled={creating}
                icon={<i className="fas fa-xmark" />}
              >
                {t('ui.common.cancel')}
              </Button>
              <Button
                type="submit"
                className="ui-button--primary"
                disabled={creating || !selectedUnitId || !username.trim()}
                icon={<i className="fas fa-floppy-disk" />}
              >
                {creating ? t('ui.common.saving') : t('ui.common.save')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Diálogo de confirmación de eliminación */}
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

export default UnitManagerCRUD;


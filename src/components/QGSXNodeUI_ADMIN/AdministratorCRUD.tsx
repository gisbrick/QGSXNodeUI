/**
 * Componente CRUD unificado para administradores
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
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import ConfirmDialog from '@qgsxui/components/UI/ConfirmDialog/ConfirmDialog';
import SearchInput from '@qgsxui/components/UI/SearchInput/SearchInput';
import Pagination from '@qgsxui/components/UI/Pagination/Pagination';
import UnsavedChangesDialog from '@qgsxui/components/UI/UnsavedChangesDialog/UnsavedChangesDialog';
import { API_ENDPOINTS, apiRequest } from '../../config/api';
import config from '../../config/app';

export interface Administrator {
  username: string;
  created_at: string;
  created_by: string | null;
}

export interface AdministratorCRUDProps {
  token: string | null | undefined;
  lang?: string;
  onRefresh?: () => void;
}

/**
 * Componente CRUD unificado para administradores
 */
export const AdministratorCRUD: React.FC<AdministratorCRUDProps> = ({
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
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
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
  
  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; username: string | null }>({
    open: false,
    username: null,
  });
  const [deleting, setDeleting] = useState(false);

  const superadminUser = config.APP_CONFIG?.superadminUser || 'admin';

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
      setError(err.message || t('admin.administratorList.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Detectar si hay cambios pendientes (solo cuando el modal está abierto)
  const hasUnsavedChanges = useMemo(() => {
    if (!createModalOpen) return false;
    return username.trim() !== initialUsername.trim();
  }, [username, initialUsername, createModalOpen]);

  // Manejar el cierre de la modal con verificación de cambios
  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      setCreateModalOpen(false);
      setUsername('');
      setInitialUsername('');
      setError(null);
      setSuccess(null);
    }
  };

  // Guardar desde el diálogo de cambios sin guardar
  const handleUnsavedSave = async () => {
    setShowUnsavedDialog(false);
    if (username.trim()) {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleCreate(formEvent);
      if (!error) {
        setPendingClose(false);
        setCreateModalOpen(false);
        setUsername('');
        setInitialUsername('');
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
    setError(null);
    setSuccess(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError(t('admin.administrator.usernameRequired'));
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest(API_ENDPOINTS.administrators.create(), {
        method: 'POST',
        token,
        body: JSON.stringify({ username: username.trim() }),
      });

      setUsername('');
      setInitialUsername('');
      setCreateModalOpen(false);
      await loadAdministrators();
      
      setSuccess(t('admin.administrator.createSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.administrator.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (username: string) => {
    if (username === superadminUser) {
      setError(t('admin.administratorList.cannotRemoveSuperadmin'));
      return;
    }
    setDeleteConfirm({ open: true, username });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.username) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(API_ENDPOINTS.administrators.remove(deleteConfirm.username), {
        method: 'DELETE',
        token,
      });

      await loadAdministrators();
      setDeleteConfirm({ open: false, username: null });
      
      setSuccess(t('admin.administratorList.removeSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || t('admin.administratorList.removeError'));
    } finally {
      setDeleting(false);
    }
  };

  // Filtrar administradores según el término de búsqueda
  const filteredAdministrators = useMemo(() => {
    if (!searchTerm.trim()) {
      return administrators;
    }
    const search = searchTerm.toLowerCase();
    return administrators.filter(admin => 
      admin.username.toLowerCase().includes(search) ||
      (admin.created_by && admin.created_by.toLowerCase().includes(search))
    );
  }, [administrators, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredAdministrators.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAdministrators = filteredAdministrators.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            <h2 style={{ margin: 0 }}>{t('admin.administratorList.title')}</h2>
            
            {/* Input de búsqueda - solo se muestra si hay datos */}
            {!loading && administrators.length > 0 && (
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
            }} 
            className="ui-button--primary"
            style={{ flex: '0 0 auto' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '0.5rem' }} />
            {t('admin.administrator.createButton')}
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
            <span style={{ marginLeft: '1rem' }}>{t('admin.administratorList.loading')}</span>
          </div>
        ) : administrators.length === 0 ? (
          <Message type="info">{t('admin.administratorList.noAdministrators')}</Message>
        ) : filteredAdministrators.length === 0 ? (
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
                      {t('admin.administratorList.username')}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.administratorList.createdBy')}
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {t('admin.administratorList.createdAt')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdministrators.map((admin) => (
                    <tr key={admin.username} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <Button
                          className="ui-button--ghost"
                          onClick={() => handleDelete(admin.username)}
                          disabled={admin.username === superadminUser}
                          size="small"
                          title={admin.username === superadminUser ? t('admin.administratorList.cannotRemoveSuperadmin') : t('admin.administratorList.remove')}
                        >
                          <i className="fas fa-trash" />
                        </Button>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {admin.username}
                        {admin.username === superadminUser && (
                          <span style={{ fontSize: '0.8em', color: 'var(--color-primary)', marginLeft: '0.5rem' }}>
                            ({t('admin.administratorList.superadmin')})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {admin.created_by || t('ui.common.empty')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{formatDate(admin.created_at)}</td>
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

        {/* Modal de creación */}
        <Modal
          isOpen={createModalOpen}
          onClose={handleModalClose}
          title={t('admin.administrator.title')}
          size="medium"
          lang={lang}
        >
          <form onSubmit={handleCreate}>
            <FormRow label={t('admin.administrator.username')}>
              <TextControl
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('admin.administrator.usernamePlaceholder')}
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
                disabled={creating || !username.trim()}
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
          title={t('admin.administratorList.remove')}
          message={t('admin.administratorList.removeConfirm')}
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, username: null })}
          loading={deleting}
          lang={lang}
        />

        {/* Diálogo de cambios sin guardar */}
        <UnsavedChangesDialog
          open={showUnsavedDialog}
          onSave={handleUnsavedSave}
          onExit={handleUnsavedExit}
          lang={lang}
          loading={creating}
        />
      </div>
    </AdminGuard>
  );
};

export default AdministratorCRUD;


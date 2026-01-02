/**
 * Componente para crear administradores
 * Requiere permisos de administrador
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminGuard } from './AdminGuard';
import TextControl from '@qgsxui/components/UI_QGS_Form/TextControl/TextControl';
import Button from '@qgsxui/components/UI/Button/Button';
import Modal from '@qgsxui/components/UI/Modal/Modal';
import Message from '@qgsxui/components/UI/Message/Message';
import FormRow from '@qgsxui/components/UI/FormRow/FormRow';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface CreateAdministratorProps {
  token: string | null | undefined;
  lang?: string;
  onSuccess?: () => void;
}

/**
 * Componente para crear un nuevo administrador
 */
export const CreateAdministrator: React.FC<CreateAdministratorProps> = ({
  token,
  lang = 'es',
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError(t('admin.administrator.usernameRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiRequest(API_ENDPOINTS.administrators.create(), {
        method: 'POST',
        token,
        body: JSON.stringify({ username: username.trim() }),
      });

      setSuccess(true);
      setUsername('');
      
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('admin.administrator.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setUsername('');
    setError(null);
    setSuccess(false);
  };

  return (
    <AdminGuard token={token}>
      <div>
        <Button onClick={() => setIsOpen(true)} className="ui-button--primary">
          {t('admin.administrator.createButton')}
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={t('admin.administrator.title')}
          size="medium"
          lang={lang}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ marginBottom: '1rem' }}>
                <Message type="error">{error}</Message>
              </div>
            )}

            {success && (
              <div style={{ marginBottom: '1rem' }}>
                <Message type="success">{t('admin.administrator.createSuccess')}</Message>
              </div>
            )}

            <FormRow label={t('admin.administrator.username')}>
              <TextControl
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('admin.administrator.usernamePlaceholder')}
                required
                disabled={loading}
                className=""
                lang={lang}
              />
            </FormRow>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button
                type="button"
                className="ui-button--secondary"
                onClick={handleClose}
                disabled={loading}
              >
                {t('ui.common.cancel')}
              </Button>
              <Button
                type="submit"
                className="ui-button--primary"
                disabled={loading || !username.trim()}
              >
                {loading ? t('ui.common.saving') : t('ui.common.save')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminGuard>
  );
};

export default CreateAdministrator;


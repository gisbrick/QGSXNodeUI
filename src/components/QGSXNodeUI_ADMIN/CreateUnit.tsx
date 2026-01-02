/**
 * Componente para crear unidades
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

export interface CreateUnitProps {
  token: string | null | undefined;
  lang?: string;
  onSuccess?: () => void;
}

/**
 * Componente para crear una nueva unidad
 */
export const CreateUnit: React.FC<CreateUnitProps> = ({
  token,
  lang = 'es',
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unitName.trim()) {
      setError(t('admin.unit.unitNameRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiRequest(API_ENDPOINTS.units.create(), {
        method: 'POST',
        token,
        body: JSON.stringify({
          unit_name: unitName.trim(),
          description: description.trim() || null,
          path: path.trim() || null,
        }),
      });

      setSuccess(true);
      setUnitName('');
      setDescription('');
      setPath('');
      
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('admin.unit.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setUnitName('');
    setDescription('');
    setPath('');
    setError(null);
    setSuccess(false);
  };

  return (
    <AdminGuard token={token}>
      <div>
        <Button onClick={() => setIsOpen(true)} className="ui-button--primary">
          {t('admin.unit.createButton')}
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={t('admin.unit.title')}
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
                <Message type="success">{t('admin.unit.createSuccess')}</Message>
              </div>
            )}

            <FormRow label={t('admin.unit.unitName')}>
              <TextControl
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder={t('admin.unit.unitNamePlaceholder')}
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading || !unitName.trim()}
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

export default CreateUnit;


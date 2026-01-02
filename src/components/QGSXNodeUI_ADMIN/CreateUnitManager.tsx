/**
 * Componente para asignar gestores a unidades
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
import Select from '@qgsxui/components/UI/Select/Select';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

export interface Unit {
  id_unt: number;
  unit_name: string;
  description?: string;
  path?: string;
}

export interface CreateUnitManagerProps {
  token: string | null | undefined;
  lang?: string;
  onSuccess?: () => void;
}

/**
 * Componente para asignar un gestor a una unidad
 */
export const CreateUnitManager: React.FC<CreateUnitManagerProps> = ({
  token,
  lang = 'es',
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      loadUnits();
    }
  }, [isOpen, token]);

  const loadUnits = async () => {
    setLoadingUnits(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUnitId) {
      setError(t('admin.unitManager.unitRequired'));
      return;
    }

    if (!username.trim()) {
      setError(t('admin.unitManager.usernameRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiRequest(API_ENDPOINTS.unitManagers.create(), {
        method: 'POST',
        token,
        body: JSON.stringify({
          idUnit: parseInt(selectedUnitId),
          username: username.trim(),
        }),
      });

      setSuccess(true);
      setSelectedUnitId('');
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
      setError(err.message || t('admin.unitManager.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedUnitId('');
    setUsername('');
    setError(null);
    setSuccess(false);
  };

  const unitOptions = units.map(unit => ({
    value: unit.id_unt.toString(),
    label: unit.unit_name,
  }));

  return (
    <AdminGuard token={token}>
      <div>
        <Button onClick={() => setIsOpen(true)} className="ui-button--primary">
          {t('admin.unitManager.createButton')}
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={t('admin.unitManager.title')}
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
                <Message type="success">{t('admin.unitManager.createSuccess')}</Message>
              </div>
            )}

            {loadingUnits ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Spinner />
                <span style={{ marginLeft: '1rem' }}>{t('admin.unitManager.loadingUnits')}</span>
              </div>
            ) : (
              <>
                <FormRow label={t('admin.unitManager.unit')}>
                  <Select
                    options={unitOptions}
                    value={selectedUnitId}
                    onChange={(value) => setSelectedUnitId(String(value))}
                    placeholder={t('admin.unitManager.unitPlaceholder')}
                    disabled={loading}
                  />
                </FormRow>

                <FormRow label={t('admin.unitManager.username')}>
                  <TextControl
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('admin.unitManager.usernamePlaceholder')}
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
                    disabled={loading || !selectedUnitId || !username.trim()}
                  >
                    {loading ? t('ui.common.saving') : t('ui.common.save')}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Modal>
      </div>
    </AdminGuard>
  );
};

export default CreateUnitManager;


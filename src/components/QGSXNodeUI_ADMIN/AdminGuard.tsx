/**
 * Componente guard que valida permisos de administrador
 * Muestra un mensaje de error si el usuario no tiene permisos
 */

import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useTranslation } from 'react-i18next';
import Spinner from '@qgsxui/components/UI/Spinner/Spinner';
import Message from '@qgsxui/components/UI/Message/Message';

export interface AdminGuardProps {
  token: string | null | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que protege contenido solo accesible para administradores
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ token, children, fallback }) => {
  const { t } = useTranslation();
  const { isAdmin, loading, error } = useAdminAuth(token);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Message type="error" title={t('admin.error.title')}>
        {error}
      </Message>
    );
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Message type="warning" title={t('admin.error.noPermission')}>
        {t('admin.error.noPermissionMessage')}
      </Message>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;


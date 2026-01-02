/**
 * Hook para validar permisos de administrador
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS, apiRequest } from '../config/api';

export interface AdminAuthState {
  isAdmin: boolean | null; // null = cargando, true/false = resultado
  loading: boolean;
  error: string | null;
}

/**
 * Hook que valida si el usuario actual es administrador
 * @param token - Token de autenticación
 * @returns Estado de autenticación de administrador
 */
export function useAdminAuth(token: string | null | undefined): AdminAuthState {
  const { t } = useTranslation();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setState({
        isAdmin: false,
        loading: false,
        error: null,
      });
      return;
    }

    // Verificar si es administrador consultando el endpoint de administradores
    // Si el usuario puede listar administradores, es administrador
    const checkAdmin = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Intentar listar administradores (solo admins pueden hacerlo)
        await apiRequest(API_ENDPOINTS.administrators.list(), {
          method: 'GET',
          token,
        });

        setState({
          isAdmin: true,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        // Si el error es 403, no es administrador
        // Si es otro error, podría ser un problema de conexión
        const isForbidden = error.message?.includes('403') || error.message?.includes('permisos');
        
        setState({
          isAdmin: false,
          loading: false,
          error: isForbidden ? null : error.message || t('admin.error.checkPermissionsError'),
        });
      }
    };

    checkAdmin();
  }, [token]);

  return state;
}


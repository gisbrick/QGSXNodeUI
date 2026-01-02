/**
 * Configuración de API para QGSXNodeUI
 * 
 * En desarrollo, si se usa Vite dev server, el proxy manejará las peticiones
 * En Storybook o producción, se usa la URL completa
 */

// Detectar el entorno
const isStorybook = typeof window !== 'undefined' && 
  (window.location?.port === '6006' || window.location?.hostname.includes('storybook'));
const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_API_BASE_URL;

// URL base de la API
// Estrategia: usar proxy en desarrollo (Vite y Storybook) para evitar CORS
// En producción, usar URL completa configurada
const getApiBaseUrl = () => {
  // Si hay una URL configurada explícitamente, usarla (tiene prioridad)
  if (envUrl) {
    return envUrl;
  }
  
  // En desarrollo (Vite o Storybook), usar ruta relativa para aprovechar el proxy
  // El proxy está configurado en vite.config.ts y .storybook/main.ts
  if (isDev || isStorybook) {
    return '/api/v1';
  }
  
  // En producción, usar URL completa (debe configurarse en VITE_API_BASE_URL)
  return 'http://localhost:3001/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Administradores
  administrators: {
    list: () => `${API_BASE_URL}/admin`,
    check: (username) => `${API_BASE_URL}/admin/check/${username}`,
    create: () => `${API_BASE_URL}/admin`,
    remove: (username) => `${API_BASE_URL}/admin/${username}`,
  },
  // Unidades
  units: {
    list: () => `${API_BASE_URL}/unit`,
    getById: (id) => `${API_BASE_URL}/unit/${id}`,
    create: () => `${API_BASE_URL}/unit`,
    update: (id) => `${API_BASE_URL}/unit/${id}`,
    remove: (id) => `${API_BASE_URL}/unit/${id}`,
  },
  // Gestores de unidades
  unitManagers: {
    listByUsername: (username) => `${API_BASE_URL}/unit-manager/user/${username}`,
    listByUnitId: (idUnit) => `${API_BASE_URL}/unit-manager/unit/${idUnit}`,
    check: (idUnit, username) => `${API_BASE_URL}/unit-manager/check/${idUnit}/${username}`,
    create: () => `${API_BASE_URL}/unit-manager`,
    remove: (idUnit, username) => `${API_BASE_URL}/unit-manager/${idUnit}/${username}`,
  },
  // Roles de usuarios
  userRoles: {
    listByUsername: (username) => `${API_BASE_URL}/user-role/user/${username}`,
    check: (username, idRole) => `${API_BASE_URL}/user-role/check/${username}/${idRole}`,
    create: () => `${API_BASE_URL}/user-role`,
    remove: (username, idRole) => `${API_BASE_URL}/user-role/${username}/${idRole}`,
  },
};

/**
 * Realiza una petición a la API con autenticación
 */
export async function apiRequest(endpoint, options = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Configuración para CORS
  // Si usamos proxy (ruta relativa), no necesitamos credentials ni mode cors
  // Si usamos URL completa, necesitamos configuración CORS completa
  const useProxy = endpoint.startsWith('/api');
  
  const fetchConfig = {
    ...fetchOptions,
    headers,
    // Solo incluir credentials y mode cors si NO usamos proxy
    ...(!useProxy && {
      credentials: 'include',
      mode: 'cors',
    }),
  };

  const response = await fetch(endpoint, fetchConfig);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `Error ${response.status}` }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // Si la respuesta es 204 (No Content), retornar null
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export default {
  API_ENDPOINTS,
  apiRequest,
};


/**
 * Configuración centralizada de la aplicación QGSXNodeUI
 * 
 * Centraliza todas las configuraciones relacionadas con feature flags,
 * y otros parámetros de la aplicación.
 */

/**
 * Feature flags para controlar comportamientos experimentales o de debug
 */
export const FEATURE_FLAGS = {
  // Activar logs detallados para debugging
  ENABLE_DEBUG_LOGS: true,
};

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
  superadminUser: 'admin',
};

export default {
  FEATURE_FLAGS,
  APP_CONFIG,
};


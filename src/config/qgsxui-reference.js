/**
 * Configuración de referencia a QGSXUI
 * 
 * Este archivo centraliza la configuración de cómo se referencia QGSXUI.
 * Actualmente se usa una referencia local al directorio, pero en el futuro
 * se cambiará a un paquete desde GIT.
 * 
 * Para cambiar a paquete desde GIT:
 * 1. Instalar el paquete: yarn add @gisbrick/qgsxui (o el nombre que se use)
 * 2. Cambiar USE_LOCAL_REFERENCE a false
 * 3. Actualizar el alias en vite.config.ts y tsconfig.app.json si es necesario
 */

/**
 * Configuración de referencia
 */
export const QGSXUI_CONFIG = {
  // Si es true, usa referencia local al directorio
  // Si es false, usa el paquete instalado desde npm/GIT
  USE_LOCAL_REFERENCE: true,
  
  // Ruta local relativa (solo usado si USE_LOCAL_REFERENCE es true)
  LOCAL_PATH: '../QGSXUI/src',
  
  // Nombre del paquete npm (solo usado si USE_LOCAL_REFERENCE es false)
  // TODO: Actualizar cuando se publique el paquete
  PACKAGE_NAME: '@gisbrick/qgsxui',
};

/**
 * Obtiene la ruta/base para importar QGSXUI
 * @returns {string} Ruta o nombre del paquete
 */
export function getQgsxuiImportPath() {
  if (QGSXUI_CONFIG.USE_LOCAL_REFERENCE) {
    // Usar alias configurado en vite/tsconfig
    return '@qgsxui';
  } else {
    return QGSXUI_CONFIG.PACKAGE_NAME;
  }
}

export default QGSXUI_CONFIG;


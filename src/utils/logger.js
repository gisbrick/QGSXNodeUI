/**
 * Logger configurable para el proyecto
 * 
 * Proporciona logging estructurado con niveles y control mediante feature flags.
 * Permite activar/desactivar logs según el entorno y necesidades de debugging.
 */

import { FEATURE_FLAGS } from '../config/app.js';

/**
 * Niveles de log disponibles
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Nivel de log actual (se puede cambiar dinámicamente)
 * Por defecto solo muestra WARN y ERROR para evitar saturar la consola
 * y colapsos del navegador. Los logs DEBUG solo se activan explícitamente.
 */
let currentLogLevel = FEATURE_FLAGS.ENABLE_DEBUG_LOGS 
  ? LOG_LEVELS.DEBUG 
  : LOG_LEVELS.WARN;

/**
 * Prefijos para cada nivel de log
 */
const LOG_PREFIXES = {
  [LOG_LEVELS.ERROR]: '❌',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.DEBUG]: '🔍',
};

/**
 * Colores para cada nivel de log (en navegador)
 */
const LOG_COLORS = {
  [LOG_LEVELS.ERROR]: '#d32f2f',
  [LOG_LEVELS.WARN]: '#ed6c02',
  [LOG_LEVELS.INFO]: '#0288d1',
  [LOG_LEVELS.DEBUG]: '#757575',
};

/**
 * Logger principal
 */
class Logger {
  constructor(namespace = '') {
    this.namespace = namespace;
  }

  /**
   * Crear un logger con namespace
   * 
   * @param {string} namespace - Namespace para el logger (p. ej., 'StorybookComponent', 'Component')
   * @returns {Logger} - Instancia del logger
   */
  static create(namespace) {
    return new Logger(namespace);
  }

  /**
   * Formatear mensaje con namespace y timestamp
   * 
   * @param {string} level - Nivel de log
   * @param {string} message - Mensaje
   * @param {object} data - Datos adicionales
   * @returns {string} - Mensaje formateado
   */
  formatMessage(level, message, data = null) {
    const prefix = LOG_PREFIXES[level] || '';
    const namespace = this.namespace ? `[${this.namespace}]` : '';
    const timestamp = new Date().toISOString();
    
    return `${prefix} ${namespace} ${message}`;
  }

  /**
   * Log con nivel específico
   * 
   * @param {number} level - Nivel de log
   * @param {string} message - Mensaje
   * @param {object} data - Datos adicionales
   */
  log(level, message, data = null) {
    if (level > currentLogLevel) {
      return; // No loguear si está por encima del nivel actual
    }

    const formattedMessage = this.formatMessage(level, message, data);
    const color = LOG_COLORS[level];

    // Usar console con colores en navegador
    if (typeof window !== 'undefined' && window.console) {
      const logMethod = level === LOG_LEVELS.ERROR ? console.error :
                       level === LOG_LEVELS.WARN ? console.warn :
                       level === LOG_LEVELS.DEBUG ? console.debug :
                       console.log;

      if (data !== null) {
        logMethod(`%c${formattedMessage}`, `color: ${color}`, data);
      } else {
        logMethod(`%c${formattedMessage}`, `color: ${color}`);
      }
    } else {
      // Fallback para Node.js
      const logMethod = level === LOG_LEVELS.ERROR ? console.error :
                       level === LOG_LEVELS.WARN ? console.warn :
                       console.log;
      
      if (data !== null) {
        logMethod(formattedMessage, data);
      } else {
        logMethod(formattedMessage);
      }
    }
  }

  /**
   * Log de error
   */
  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  /**
   * Log de advertencia
   */
  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Log de información
   */
  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Log de debug
   */
  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }
}

/**
 * Configurar nivel de log
 * 
 * @param {number} level - Nuevo nivel de log
 */
export function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * Obtener nivel de log actual
 * 
 * @returns {number} - Nivel de log actual
 */
export function getLogLevel() {
  return currentLogLevel;
}

/**
 * Crear logger con namespace
 * 
 * @param {string} namespace - Namespace para el logger
 * @returns {Logger} - Instancia del logger
 */
export function createLogger(namespace) {
  return Logger.create(namespace);
}

/**
 * Logger por defecto (sin namespace)
 */
export const logger = new Logger();

export default logger;


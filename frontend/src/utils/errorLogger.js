/**
 * Sistema de logging de errores para el frontend
 * Captura errores y los envía al backend para análisis
 */

const ERROR_CATEGORIES = {
  REACT: 'react',
  API: 'api',
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  NAVIGATION: 'navigation',
  EXTERNAL_SERVICE: 'external_service',
  USER_ACTION: 'user_action'
};

const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorLogger {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    this.errors = [];
    this.maxLocalErrors = 50; // Máximo de errores en memoria
    
    // Configurar captura global de errores
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    // Capturar errores JavaScript no manejados
    window.addEventListener('error', (event) => {
      this.logError({
        error: new Error(event.message),
        category: ERROR_CATEGORIES.REACT,
        severity: ERROR_SEVERITY.HIGH,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Capturar promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        error: new Error(event.reason),
        category: ERROR_CATEGORIES.API,
        severity: ERROR_SEVERITY.HIGH,
        context: {
          reason: event.reason,
          promise: event.promise
        }
      });
    });
  }

  /**
   * Registra un error de forma estructurada
   * @param {Object} options - Opciones del error
   * @param {Error} options.error - El error capturado
   * @param {string} options.category - Categoría del error
   * @param {string} options.severity - Severidad del error
   * @param {Object} options.context - Contexto adicional
   * @param {string} options.userId - ID del usuario (si está disponible)
   * @param {string} options.component - Componente donde ocurrió el error
   */
  logError({
    error,
    category = ERROR_CATEGORIES.REACT,
    severity = ERROR_SEVERITY.MEDIUM,
    context = {},
    userId = null,
    component = null
  }) {
    const errorData = {
      timestamp: new Date().toISOString(),
      errorId: `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      severity,
      errorType: error.name || 'Error',
      errorMessage: error.message || 'Error desconocido',
      stack: error.stack,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: Date.now()
      },
      userId,
      component,
      environment: import.meta.env.MODE || 'development'
    };

    // Guardar en memoria local
    this.addToLocalStorage(errorData);

    // Enviar al backend (sin bloquear la UI)
    this.sendToBackend(errorData).catch(backendError => {
      console.warn('No se pudo enviar error al backend:', backendError);
    });

    // Log en consola para desarrollo
    if (import.meta.env.MODE === 'development') {
      console.group(`🚨 Error [${severity.toUpperCase()}] - ${category}`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Component:', component);
      console.groupEnd();
    }
  }

  /**
   * Registra un evento importante del frontend
   */
  logEvent({
    eventType,
    message,
    context = {},
    userId = null,
    component = null
  }) {
    const eventData = {
      timestamp: new Date().toISOString(),
      eventId: `frontend_event_${Date.now()}`,
      type: 'event',
      eventType,
      message,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      userId,
      component,
      environment: import.meta.env.MODE || 'development'
    };

    // Enviar al backend
    this.sendEventToBackend(eventData).catch(error => {
      console.warn('No se pudo enviar evento al backend:', error);
    });
  }

  /**
   * Guarda errores en localStorage para persistencia local
   */
  addToLocalStorage(errorData) {
    try {
      this.errors.push(errorData);
      
      // Mantener solo los últimos errores
      if (this.errors.length > this.maxLocalErrors) {
        this.errors = this.errors.slice(-this.maxLocalErrors);
      }

      localStorage.setItem('technomundo_errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('No se pudo guardar error en localStorage:', e);
    }
  }

  /**
   * Envía error al backend
   */
  async sendToBackend(errorData) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/errors/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Guardar en archivo local si falla el envío
      this.saveToLocalFile(errorData);
      throw error;
    }
  }

  /**
   * Envía evento al backend
   */
  async sendEventToBackend(eventData) {
    try {
      await fetch(`${this.apiUrl}/api/v1/errors/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.warn('Error enviando evento al backend:', error);
    }
  }

  /**
   * Guarda error en archivo local como fallback
   */
  saveToLocalFile(errorData) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `frontend_errors_${today}.json`;
      
      // Obtener errores existentes del día
      const existingErrors = JSON.parse(localStorage.getItem(filename) || '[]');
      existingErrors.push(errorData);
      
      localStorage.setItem(filename, JSON.stringify(existingErrors, null, 2));
    } catch (e) {
      console.warn('No se pudo guardar error en archivo local:', e);
    }
  }

  /**
   * Obtiene errores almacenados localmente
   */
  getLocalErrors() {
    try {
      return JSON.parse(localStorage.getItem('technomundo_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Limpia errores locales
   */
  clearLocalErrors() {
    localStorage.removeItem('technomundo_errors');
    this.errors = [];
  }

  /**
   * Obtiene estadísticas de errores locales
   */
  getErrorStats() {
    const errors = this.getLocalErrors();
    const stats = {
      total: errors.length,
      byCategory: {},
      bySeverity: {},
      recent: errors.slice(-10)
    };

    errors.forEach(error => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Instancia global del logger
export const errorLogger = new ErrorLogger();

// Exportar constantes para uso en componentes
export { ERROR_CATEGORIES, ERROR_SEVERITY };

// Helper para logging rápido
export const logError = (error, options = {}) => {
  errorLogger.logError({ error, ...options });
};

export const logEvent = (eventType, message, options = {}) => {
  errorLogger.logEvent({ eventType, message, ...options });
};
// frontend/src/utils/statusTranslations.js

/**
 * Función centralizada para traducir estados de orden del inglés al español
 * Basada en los valores de la base de datos y patrones existentes en el proyecto
 */

export const STATUS_TRANSLATIONS = {
  // Estados en inglés (como vienen de la BD) -> Estados en español
  'Pending': 'Pendiente',
  'In Process': 'En proceso', 
  'Completed': 'Completado',
  'Cancelled': 'Cancelado',
  'Delivered': 'Entregado',
  'Waiting for parts': 'Esperando repuesto',
  
  // Variaciones adicionales que podrían existir
  'In progress': 'En proceso',
  'Canceled': 'Cancelado',
  'Waiting for Parts': 'Esperando repuesto',
  'waiting for parts': 'Esperando repuesto'
};

/**
 * Traduce un estado de orden del inglés al español
 * @param {string} status - Estado en inglés
 * @returns {string} Estado traducido al español
 */
export const translateOrderStatus = (status) => {
  if (!status) return 'Sin estado';
  
  // Buscar traducción exacta
  const translation = STATUS_TRANSLATIONS[status];
  if (translation) return translation;
  
  // Buscar traducción case-insensitive
  const statusLower = status.toLowerCase();
  const foundKey = Object.keys(STATUS_TRANSLATIONS).find(
    key => key.toLowerCase() === statusLower
  );
  
  if (foundKey) return STATUS_TRANSLATIONS[foundKey];
  
  // Si no se encuentra traducción, devolver el estado original
  console.warn(`Estado no encontrado para traducir: "${status}"`);
  return status;
};

/**
 * Obtiene todos los estados disponibles en español
 * @returns {Array} Array de estados en español
 */
export const getAvailableStatusesInSpanish = () => {
  return Object.values(STATUS_TRANSLATIONS);
};

/**
 * Obtiene todos los estados disponibles en inglés
 * @returns {Array} Array de estados en inglés
 */
export const getAvailableStatusesInEnglish = () => {
  return Object.keys(STATUS_TRANSLATIONS);
};

/**
 * Verifica si un estado es válido
 * @param {string} status - Estado a verificar
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {boolean} True si el estado es válido
 */
export const isValidStatus = (status, language = 'en') => {
  if (!status) return false;
  
  if (language === 'es') {
    return Object.values(STATUS_TRANSLATIONS).includes(status);
  }
  
  return Object.keys(STATUS_TRANSLATIONS).includes(status);
};
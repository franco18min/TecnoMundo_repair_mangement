// frontend/src/config/api.js

// Configuración centralizada de la API
export const API_CONFIG = {
  // URL base de la API desde variables de entorno
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001',
  
  // URL completa de la API v1
  API_V1_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'}/api/v1`,
  
  // Configuración del entorno
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Configuración de WebSocket
  WS_URL: import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + '/ws'
    : 'ws://127.0.0.1:8001/ws',
};

// Función helper para obtener headers de autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn("No se encontró token de acceso en localStorage.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Función helper para obtener headers de autenticación sin Content-Type (para FormData)
export const getAuthHeadersWithoutContentType = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn("No se encontró token de acceso en localStorage.");
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Función helper para verificar si estamos en producción
export const isProduction = () => API_CONFIG.ENVIRONMENT === 'production';

// Función helper para logging condicional
export const apiLog = (message, ...args) => {
  if (!isProduction()) {
    console.log(`[API] ${message}`, ...args);
  }
};

export default API_CONFIG;
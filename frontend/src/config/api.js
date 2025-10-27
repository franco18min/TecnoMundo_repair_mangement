// frontend/src/config/api.js

// Configuración centralizada de la API con endurecimiento para producción
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const BASE_URL_ENV = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_DEV_BASE_URL = 'http://127.0.0.1:8001';

// Determinar BASE_URL según entorno, evitando fallback inseguro en producción
let BASE_URL;
if (ENVIRONMENT === 'production') {
  if (BASE_URL_ENV && BASE_URL_ENV.startsWith('https://')) {
    BASE_URL = BASE_URL_ENV;
  } else {
    console.error('[Config] VITE_API_BASE_URL no está definido o no es HTTPS en producción. Configure frontend/.env.production correctamente.');
    // Intentar un valor razonable por defecto en producción (ajuste si su dominio difiere)
    BASE_URL = BASE_URL_ENV || 'https://api.tecnoapp.ar';
  }
} else {
  BASE_URL = BASE_URL_ENV || DEFAULT_DEV_BASE_URL;
}

const API_V1_URL = `${BASE_URL}/api/v1`;

// Construir URL de WebSocket en función de BASE_URL
let WS_URL;
if (BASE_URL.startsWith('https://')) {
  WS_URL = BASE_URL.replace('https://', 'wss://') + '/ws';
} else if (BASE_URL.startsWith('http://')) {
  WS_URL = BASE_URL.replace('http://', 'ws://') + '/ws';
} else {
  WS_URL = BASE_URL_ENV
    ? BASE_URL_ENV.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws'
    : 'ws://127.0.0.1:8001/ws';
}

// Configuración exportada
export const API_CONFIG = {
  BASE_URL,
  API_V1_URL,
  ENVIRONMENT,
  WS_URL,
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
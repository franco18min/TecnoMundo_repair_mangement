// frontend/src/config/api.js

// Configuración centralizada de la API con endurecimiento para producción
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const BASE_URL_ENV = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_DEV_BASE_URL = 'http://127.0.0.1:9001';

// Determinar BASE_URL según entorno, evitando fallback inseguro en producción
let BASE_URL;

// Detección automática de entorno de producción por dominio (Safety Net)
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname.includes('tecnoapp.ar') || window.location.hostname.includes('tecnoapp.site'));

if (ENVIRONMENT === 'production' || isProductionDomain) {
  if (BASE_URL_ENV && BASE_URL_ENV.startsWith('https://')) {
    BASE_URL = BASE_URL_ENV;
  } else {
    // Si estamos en producción (por ENV o dominio) pero no hay variable definida o no es HTTPS
    if (!BASE_URL_ENV) {
        console.warn('[Config] Detectado entorno producción pero VITE_API_BASE_URL no está definido. Usando default.');
    }
    // Intentar un valor razonable por defecto en producción (ajuste si su dominio difiere)
    BASE_URL = BASE_URL_ENV || 'https://api.tecnoapp.ar';
  }
} else {
  BASE_URL = BASE_URL_ENV || DEFAULT_DEV_BASE_URL;
}

const API_V1_URL = ENVIRONMENT === 'production' ? `${BASE_URL}/api/v1` : '/api/v1';

// Construir URL de WebSocket en función de BASE_URL (ruta del backend: /api/v1/notifications/ws)
let WS_URL;
const WS_PATH = '/api/v1/notifications/ws';
if (BASE_URL.startsWith('https://')) {
  WS_URL = BASE_URL.replace('https://', 'wss://') + WS_PATH;
} else if (BASE_URL.startsWith('http://')) {
  WS_URL = BASE_URL.replace('http://', 'ws://') + WS_PATH;
} else {
  WS_URL = BASE_URL_ENV
    ? BASE_URL_ENV.replace('https://', 'wss://').replace('http://', 'ws://') + WS_PATH
    : `ws://127.0.0.1:9001${WS_PATH}`;
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

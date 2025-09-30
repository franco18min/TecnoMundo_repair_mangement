// frontend/src/api/deviceTypeApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

// --- INICIO DE LA CORRECCIÓN ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn("No se encontró token de acceso en localStorage.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
// --- FIN DE LA CORRECCIÓN ---

/**
 * Obtiene todos los tipos de dispositivos desde el backend.
 */
export const fetchDeviceTypes = async () => {
  try {
    // --- INICIO DE LA CORRECCIÓN ---
    const response = await fetch(`${API_BASE_URL}/api/v1/device-types/`, {
        headers: getAuthHeaders()
    });
    // --- FIN DE LA CORRECCIÓN ---
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("No se pudieron obtener los tipos de dispositivo:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};
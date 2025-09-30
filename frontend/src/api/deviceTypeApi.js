// frontend/src/api/deviceTypeApi.js
import { API_CONFIG, getAuthHeaders } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

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
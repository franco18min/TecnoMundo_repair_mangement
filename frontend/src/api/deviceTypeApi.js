// frontend/src/api/deviceTypeApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Obtiene todos los tipos de dispositivos desde el backend.
 */
export const fetchDeviceTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/device-types/`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("No se pudieron obtener los tipos de dispositivo:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};
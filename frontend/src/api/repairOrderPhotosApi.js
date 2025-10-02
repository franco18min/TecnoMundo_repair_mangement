// frontend/src/api/repairOrderPhotosApi.js
import { API_CONFIG, getAuthHeaders } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Subir una nueva foto para una orden de reparación
 */
export const uploadRepairOrderPhoto = async (orderId, file, note = '') => {
  try {
    const formData = new FormData();
    formData.append('order_id', String(orderId)); // Asegurar que sea string para FormData
    formData.append('file', file);
    if (note) {
      formData.append('note', note);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/repair-order-photos/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // No incluir Content-Type para FormData, el navegador lo establecerá automáticamente
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error detallado del servidor:', errorData);
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al subir foto:', error);
    throw error;
  }
};

/**
 * Obtener todas las fotos de una orden de reparación
 */
export const getRepairOrderPhotos = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-order-photos/order/${orderId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al obtener las fotos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener fotos:', error);
    throw error;
  }
};

/**
 * Actualizar la nota de una foto
 */
export const updateRepairOrderPhoto = async (photoId, note) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-order-photos/${photoId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar la foto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar foto:', error);
    throw error;
  }
};

/**
 * Eliminar una foto
 */
export const deleteRepairOrderPhoto = async (photoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-order-photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al eliminar la foto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar foto:', error);
    throw error;
  }
};
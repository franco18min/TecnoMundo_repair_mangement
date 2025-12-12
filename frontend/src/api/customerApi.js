// frontend/src/api/customerApi.js
import { API_CONFIG, getAuthHeaders } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const getCustomers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/customers/`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de clientes.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        throw error; // Lanzamos el error para que el componente que llama lo maneje
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/customers/${customerId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(customerData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo actualizar el cliente.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        throw error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/customers/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(customerData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo crear el cliente.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error al crear el cliente:", error);
        throw error;
    }
};

export const searchClients = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }
  
  // En producción, nos aseguramos de usar la URL base correcta
  const baseUrl = API_CONFIG.ENVIRONMENT === 'production' 
    ? (API_CONFIG.BASE_URL.startsWith('http') ? API_CONFIG.BASE_URL : `https://${API_CONFIG.BASE_URL}`)
    : API_CONFIG.BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/api/v1/customers/search?q=${encodeURIComponent(query)}`, {
        // La búsqueda puede o no requerir autenticación, la añadimos por seguridad
        headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.warn(`[searchClients] Error HTTP: ${response.status}`);
      // En producción, si falla la búsqueda, devolvemos array vacío para no romper la UI
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error("[searchClients] Error de conexión o parsing:", error);
    return [];
  }
};
// frontend/src/api/customerApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // En un futuro, podríamos redirigir al login si no hay token.
        // Por ahora, el backend lo manejará con un 401.
        console.warn("No se encontró token de acceso en localStorage.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

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
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/customers/search?q=${encodeURIComponent(query)}`, {
        // La búsqueda puede o no requerir autenticación, la añadimos por seguridad
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("No se pudieron buscar los clientes:", error);
    return [];
  }
};
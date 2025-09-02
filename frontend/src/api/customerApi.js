// frontend/src/api/customerApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Busca clientes en el backend según un término de búsqueda.
 */
export const searchClients = async (query) => {
  if (!query || query.length < 3) {
    return []; // No buscar si la consulta es muy corta
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/customers/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("No se pudieron buscar los clientes:", error);
    return [];
  }
};
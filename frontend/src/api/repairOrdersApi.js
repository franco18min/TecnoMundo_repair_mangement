// frontend/src/api/repairOrdersApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

// --- INICIO DE LA MODIFICACIÓN ---
// Función auxiliar para obtener las cabeceras de autenticación.
// Esto nos evita repetir código y asegura que todas las peticiones estén protegidas.
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
// --- FIN DE LA MODIFICACIÓN ---


/**
 * Obtiene todas las órdenes de reparación del backend.
 */
export const fetchRepairOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, {
        // Nota: Esta petición podría ser pública o protegida. Si la protegemos en el futuro,
        // solo tendríamos que añadir: headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();

    // Mapeamos los datos del backend a la estructura que necesita el frontend
    return data.map(order => ({
      id: order.id,
      customer: { name: `${order.customer.first_name} ${order.customer.last_name}` },
      device: {
        type: order.device_type ? order.device_type.type_name : 'Desconocido',
        model: order.device_model
      },
      status: order.status ? order.status.status_name : 'Desconocido',
      assignedTechnician: { name: order.technician?.username || 'No asignado' },
      dateReceived: order.created_at,
      parts_used: order.parts_used || 'N/A',
    }));

  } catch (error) {
    console.error("No se pudieron obtener las órdenes de reparación:", error);
    return [];
  }
};


/**
 * Envía los datos de una nueva orden de reparación al backend para crearla.
 */
export const createRepairOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, {
      method: 'POST',
      headers: getAuthHeaders(), // Usamos la función auxiliar
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("No se pudo crear la orden de reparación:", error);
    throw error;
  }
};


/**
 * Obtiene los detalles completos de una única orden de reparación.
 */
export const fetchRepairOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
        headers: getAuthHeaders() // Protegemos también esta ruta
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`No se pudo obtener la orden ${orderId}:`, error);
    throw error;
  }
};


/**
 * Asigna un técnico a una orden y la cambia a "En Proceso".
 */
export const takeRepairOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/take`, {
      method: 'PATCH',
      headers: getAuthHeaders(), // Usamos la función auxiliar
      // Ya no enviamos el body, el backend sabe quién es el técnico por el token
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`No se pudo tomar la orden ${orderId}:`, error);
    throw error;
  }
};


/**
 * Actualiza los datos de una orden de reparación existente.
 */
export const updateRepairOrder = async (orderId, orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
            method: 'PUT',
            headers: getAuthHeaders(), // Usamos la función auxiliar
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`No se pudo actualizar la orden ${orderId}:`, error);
        throw error;
    }
};
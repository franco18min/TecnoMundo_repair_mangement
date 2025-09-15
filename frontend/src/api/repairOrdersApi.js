// frontend/src/api/repairOrdersApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

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

export const fetchRepairOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, { headers: getAuthHeaders() });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    // El mapeo de datos que tenías aquí es específico para la tabla,
    // es mejor que el backend devuelva siempre el objeto completo y el frontend lo adapte donde lo necesite.
    return data;
  } catch (error) {
    console.error("No se pudieron obtener las órdenes de reparación:", error);
    return [];
  }
};

export const createRepairOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
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

export const fetchRepairOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
        headers: getAuthHeaders()
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

export const takeRepairOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/take`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
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

// --- FUNCIÓN RENOMBRADA Y MODIFICADA ---
// Usada por el TÉCNICO para enviar su diagnóstico y completar la orden.
export const completeRepairOrder = async (orderId, orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/complete`, { // Apunta al nuevo endpoint
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`No se pudo completar la orden ${orderId}:`, error);
        throw error;
    }
};

// --- NUEVA FUNCIÓN ---
// Usada por ADMIN/RECEPCIONISTA para modificar detalles sin cambiar el estado.
export const updateOrderDetails = async (orderId, orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/details`, { // Apunta al nuevo endpoint
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`No se pudieron actualizar los detalles de la orden ${orderId}:`, error);
        throw error;
    }
};


export const deleteRepairOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Error HTTP: ${response.status}` }));
      throw new Error(errorData.detail);
    }
    return true;
  } catch (error) {
    console.error(`No se pudo eliminar la orden ${orderId}:`, error);
    throw error;
  }
};

export const reopenRepairOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/reopen`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`No se pudo reabrir la orden ${orderId}:`, error);
    throw error;
  }
};
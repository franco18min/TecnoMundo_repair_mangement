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
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
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

export const updateRepairOrder = async (orderId, orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
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
        console.error(`No se pudo actualizar la orden ${orderId}:`, error);
        throw error;
    }
};

// --- INICIO DE LA MODIFICACIÓN ---
export const deleteRepairOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    // Una respuesta 204 (No Content) también indica éxito (response.ok será true)
    if (!response.ok) {
      // Si hay un error, intentamos leer el JSON. Si no, lanzamos un error genérico.
      const errorData = await response.json().catch(() => ({ detail: `Error HTTP: ${response.status}` }));
      throw new Error(errorData.detail);
    }

    // Si la operación fue exitosa (ej. 204), no hay cuerpo JSON que leer.
    // Simplemente retornamos un valor de éxito.
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
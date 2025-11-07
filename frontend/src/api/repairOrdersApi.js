// frontend/src/api/repairOrdersApi.js
import { API_CONFIG, getAuthHeaders } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

// 1. Creamos una función de mapeo reutilizable
export const mapOrderData = (order) => {
    // Asegurar que branch_id se actualice dinámicamente aunque la relación branch esté en caché/obsoleta
    const branchId = order.branch_id ?? order.branch?.id;
    const normalizedBranch = (order.branch && order.branch.id === branchId)
        ? { id: order.branch.id, branch_name: order.branch.branch_name }
        : { id: branchId };

    return {
        id: order.id,
        branch_id: branchId,
        branch: normalizedBranch,
        customer: {
            name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim()
        },
        device: {
            type: order.device_type?.type_name || 'Desconocido',
            model: order.device_model
        },
        status: order.status?.status_name || 'Desconocido',
        assignedTechnician: { name: order.technician?.username || 'No asignado' },
        dateReceived: order.created_at,
        // Campos adicionales para la tabla
        date: order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : 'N/A',
        cost: order.total_cost || 0,
        technician: order.technician?.username || 'No asignado',
        parts_used: order.parts_used || 'N/A',
    };
};


export const fetchRepairOrders = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, { headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.map(mapOrderData); // Usamos la función de mapeo
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

export const getOrdersByCustomerId = async (customerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/customers/${customerId}/orders`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudieron obtener las órdenes del cliente.');
        }
        const data = await response.json();
        return data.map(mapOrderData); // Usamos la función de mapeo también aquí
    } catch (error) {
        console.error(`Error al obtener órdenes para el cliente ${customerId}:`, error);
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

// --- INICIO DE LA NUEVA FUNCIONALIDAD ---
export const deliverRepairOrder = async (orderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/deliver`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al entregar la orden:", error);
        throw error;
    }
};

export const transferRepairOrder = async (orderId, targetBranchId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/transfer`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                target_branch_id: targetBranchId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al transferir la orden:", error);
        throw error;
    }
};

// Función para actualizar solo campos de diagnóstico
export const updateOrderDiagnosis = async (orderId, diagnosisData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/${orderId}/diagnosis`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(diagnosisData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al actualizar diagnóstico:", error);
        throw error;
    }
};

// --- FIN DE LA NUEVA FUNCIONALIDAD ---

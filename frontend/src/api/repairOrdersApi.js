// frontend/src/api/repairOrdersApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Obtiene todas las órdenes de reparación del backend.
 */
export const fetchRepairOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`);
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
      // --- CAMPO AÑADIDO PARA EL FILTRO ---
      // Aseguramos que siempre tenga un valor para evitar errores en el filtro.
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
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // Se usará en el futuro
      },
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
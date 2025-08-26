const API_BASE_URL = '';

/**
 * Obtiene todas las órdenes de reparación del backend y las transforma
 * para que coincidan con la estructura que esperan los componentes del frontend.
 */
export const fetchRepairOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();

    // Mapeamos los datos del backend a la estructura que necesita el componente OrderCard
    return data.map(order => ({
      id: order.id,
      customer: { name: `${order.customer.first_name} ${order.customer.last_name}` },
      device: { type: order.device_type, model: order.device_model },
      status: order.status,
      assignedTechnician: { name: order.technician?.username || 'No asignado' },
      dateReceived: order.created_at,
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("No se pudo crear la orden de reparación:", error);
    throw error;
  }
};
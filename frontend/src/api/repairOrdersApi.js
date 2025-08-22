const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const fetchRepairOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/repair-orders/`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();

    return data.map(order => ({
      id: order.order_id_str,
      customer: { name: order.customer_name },
      device: { type: order.device_type, model: order.device_model },
      issue: order.issue_description,
      status: order.status,
      assignedTechnician: { name: order.technician_name, avatarUrl: order.technician_avatar_url },
      dateReceived: order.date_received,
    }));

  } catch (error) {
    console.error("No se pudieron obtener las órdenes de reparación:", error);
    return [];
  }
};
// frontend/src/api/orderApi.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// Función para obtener headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Función de mapeo para datos de orden del cliente
const mapClientOrderData = (order) => ({
  id: order.id,
  customer: {
    first_name: order.customer?.first_name || '',
    last_name: order.customer?.last_name || '',
    dni: order.customer?.dni || '',
    phone: order.customer?.phone || '',
    email: order.customer?.email || ''
  },
  status: {
    id: order.status?.id || null,
    status_name: order.status?.status_name || 'Sin estado'
  },
  device_type: {
    type_name: order.device_type?.type_name || 'Desconocido'
  },
  device_model: order.device_model || 'No especificado',
  device_brand: order.device_brand || 'No especificado',
  problem_description: order.problem_description || '',
  diagnosis: order.diagnosis || '',
  technician_diagnosis: order.technician_diagnosis || '',
  technician: {
    username: order.technician?.username || 'No asignado',
    first_name: order.technician?.first_name || '',
    last_name: order.technician?.last_name || ''
  },
  branch: {
    branch_name: order.branch?.branch_name || 'Sucursal principal',
    address: order.branch?.address || '',
    phone: order.branch?.phone || ''
  },
  total_cost: order.total_cost || 0,
  deposit: order.deposit || 0,
  balance: order.balance || 0,
  parts_used: order.parts_used || '',
  created_at: order.created_at,
  updated_at: order.updated_at,
  estimated_completion_date: order.estimated_completion_date,
  delivery_date: order.delivery_date
});

// Función para buscar orden por DNI o número de orden (pública)
export const getOrderByClientQuery = async (query) => {
  try {
    // Usar MCP PostgREST para consultar la base de datos
    const response = await fetch(`${API_BASE_URL}/api/v1/client-orders/client-search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontró ninguna orden con ese DNI o número de orden.');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return mapClientOrderData(data);
  } catch (error) {
    console.error('Error al buscar orden del cliente:', error);
    throw error;
  }
};

// Función para obtener detalles completos de una orden (pública)
export const getOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/client-orders/client/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Orden no encontrada.');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return mapClientOrderData(data);
  } catch (error) {
    console.error('Error al obtener detalles de la orden:', error);
    throw error;
  }
};

// Función para suscribirse a notificaciones por email
export const subscribeToOrderNotifications = async (orderId, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al suscribirse a notificaciones:', error);
    throw error;
  }
};

// Función para desuscribirse de notificaciones por email
export const unsubscribeFromOrderNotifications = async (orderId, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al desuscribirse de notificaciones:', error);
    throw error;
  }
};

// Función para obtener fotos de una orden
export const getOrderPhotos = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/client-orders/${orderId}/photos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener fotos de la orden:', error);
    throw error;
  }
};
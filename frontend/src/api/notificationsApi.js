const API_BASE_URL = 'http://127.0.0.1:8001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error("No se encontró token de acceso.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const fetchNotifications = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('No se pudo obtener el historial de notificaciones.');
    }
    return await response.json();
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('No se pudo marcar la notificación como leída.');
    }
    return await response.json();
};
import { API_CONFIG, getAuthHeaders } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

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
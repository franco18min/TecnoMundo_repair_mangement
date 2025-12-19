// frontend/src/api/apiClient.js
import { API_CONFIG } from '../config/api.js';

const API_BASE_URL = API_CONFIG.API_V1_URL;

const getApiClient = (getAccessToken, logout) => {
    return async (endpoint, options = {}) => {
        const token = getAccessToken();
        // La validación del token ahora es más robusta.
        // Si no hay token, el logout se maneja en el llamador o al fallar la petición.

        const { body, ...customConfig } = options;
        const config = {
            method: body ? 'POST' : 'GET',
            ...customConfig,
            headers: {
                'Content-Type': 'application/json',
                // Solo añade el header de Auth si existe el token
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...customConfig.headers,
            },
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const requestId = response.headers.get('X-Request-Id');

            if (response.status === 401 && logout) {
                // Llamar logout con mensaje de sesión caducada
                logout('Sesión caducada. Por favor, inicie sesión nuevamente.');

                // Redirigir al login
                window.location.href = '/login';

                throw new Error('Sesión caducada. Por favor, inicie sesión de nuevo.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || errorData.detail || `Error en la solicitud: ${response.status}`;
                const error = new Error(message);
                error.status = response.status;
                error.code = errorData.code;
                error.details = errorData.details;
                error.requestId = requestId;
                throw error;
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error("Error en apiClient:", error);
            throw error;
        }
    };
};

export default getApiClient;
// frontend/src/api/apiClient.js
const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';

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

            if (response.status === 401 && logout) {
                // Si la petición falla por autenticación y tenemos la función logout, la llamamos.
                logout();
                throw new Error('Sesión expirada. Por favor, inicie sesión de nuevo.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.detail || `Error en la solicitud: ${response.status}`);
                error.status = response.status;
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
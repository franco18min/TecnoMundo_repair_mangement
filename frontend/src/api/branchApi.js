  // frontend/src/api/branchApi.js

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

export const fetchBranches = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/branches/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de sucursales.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener sucursales:", error);
        return [];
    }
};
// frontend/src/api/errorsApi.js

import { API_CONFIG } from '../config/api.js';

const API_BASE_URL = API_CONFIG.API_V1_URL;

/**
 * Reporta un error al sistema backend
 * @param {Object} errorData - Datos del error a reportar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const reportError = async (errorData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/errors/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorData)
        });

        if (!response.ok) {
            throw new Error(`Error al reportar: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al reportar error al backend:', error);
        // En caso de fallo, intentar guardar localmente
        try {
            const localErrors = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
            localErrors.push({
                ...errorData,
                reportedAt: new Date().toISOString(),
                status: 'pending'
            });
            localStorage.setItem('pendingErrors', JSON.stringify(localErrors));
            console.log('Error guardado localmente para reintento posterior');
        } catch (localError) {
            console.error('Error al guardar error localmente:', localError);
        }
        throw error;
    }
};

/**
 * Obtiene estadísticas de errores
 * @returns {Promise<Object>} - Estadísticas de errores
 */
export const getErrorStatistics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/errors/statistics`);
        
        if (!response.ok) {
            throw new Error(`Error al obtener estadísticas: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener estadísticas de errores:', error);
        throw error;
    }
};

/**
 * Obtiene errores recientes
 * @param {number} limit - Número máximo de errores a obtener
 * @returns {Promise<Array>} - Lista de errores recientes
 */
export const getRecentErrors = async (limit = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/errors/recent?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Error al obtener errores recientes: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener errores recientes:', error);
        throw error;
    }
};

/**
 * Verifica el estado del sistema de errores
 * @returns {Promise<Object>} - Estado del sistema
 */
export const checkErrorSystemHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/errors/health`);
        
        if (!response.ok) {
            throw new Error(`Error al verificar estado: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al verificar estado del sistema:', error);
        throw error;
    }
};

/**
 * Intenta reenviar errores pendientes guardados localmente
 */
export const retryPendingErrors = async () => {
    try {
        const pendingErrors = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
        
        if (pendingErrors.length === 0) {
            return { success: true, processed: 0 };
        }

        let successCount = 0;
        const failedErrors = [];

        for (const errorData of pendingErrors) {
            try {
                await reportError(errorData);
                successCount++;
            } catch (error) {
                failedErrors.push(errorData);
            }
        }

        // Actualizar localStorage solo con errores que fallaron
        localStorage.setItem('pendingErrors', JSON.stringify(failedErrors));

        return {
            success: true,
            processed: successCount,
            failed: failedErrors.length,
            total: pendingErrors.length
        };
    } catch (error) {
        console.error('Error al reintentar errores pendientes:', error);
        return { success: false, error: error.message };
    }
};
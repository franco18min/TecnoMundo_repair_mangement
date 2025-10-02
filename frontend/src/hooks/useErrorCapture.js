// frontend/src/hooks/useErrorCapture.js

import { useEffect } from 'react';
import { reportError } from '../api/errorsApi';

export const useErrorCapture = () => {
    useEffect(() => {
        // Capturar errores globales de JavaScript
        const handleGlobalError = (event) => {
            const errorData = {
                timestamp: new Date().toISOString(),
                errorId: `global-js-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: 'frontend',
                severity: 'error',
                errorType: event.error?.name || 'JavaScript Error',
                errorMessage: event.error?.message || event.message || 'Error desconocido',
                stack: event.error?.stack || 'No stack trace available',
                context: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    capturedAt: new Date().toISOString()
                },
                userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'anonymous',
                component: 'Global JavaScript',
                environment: import.meta.env.MODE || 'development'
            };

            reportError(errorData).catch(reportingError => {
                console.error('Error al reportar error global:', reportingError);
            });

            console.log('Error global capturado y reportado:', errorData.errorId);
        };

        // Capturar promesas rechazadas no manejadas
        const handleUnhandledRejection = (event) => {
            const errorData = {
                timestamp: new Date().toISOString(),
                errorId: `unhandled-promise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: 'frontend',
                severity: 'error',
                errorType: 'Unhandled Promise Rejection',
                errorMessage: event.reason?.message || event.reason || 'Promesa rechazada no manejada',
                stack: event.reason?.stack || 'No stack trace available',
                context: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    reason: typeof event.reason === 'object' ? JSON.stringify(event.reason) : event.reason,
                    capturedAt: new Date().toISOString()
                },
                userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'anonymous',
                component: 'Promise Handler',
                environment: import.meta.env.MODE || 'development'
            };

            reportError(errorData).catch(reportingError => {
                console.error('Error al reportar promesa rechazada:', reportingError);
            });

            console.log('Promesa rechazada capturada y reportada:', errorData.errorId);
        };

        // Registrar los event listeners
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup function
        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    // Función para reportar errores manualmente
    const reportManualError = async (error, context = {}) => {
        try {
            const errorData = {
                timestamp: new Date().toISOString(),
                errorId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: 'frontend',
                severity: context.severity || 'error',
                errorType: error.name || 'Manual Error',
                errorMessage: error.message || 'Error reportado manualmente',
                stack: error.stack || 'No stack trace available',
                context: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    capturedAt: new Date().toISOString(),
                    ...context
                },
                userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'anonymous',
                component: context.component || 'Manual Report',
                environment: import.meta.env.MODE || 'development'
            };

            await reportError(errorData);
            console.log('Error manual reportado:', errorData.errorId);
            return errorData.errorId;
        } catch (reportingError) {
            console.error('Error al reportar error manual:', reportingError);
            throw reportingError;
        }
    };

    return { reportManualError };
};
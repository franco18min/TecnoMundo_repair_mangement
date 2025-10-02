// frontend/src/components/shared/ErrorBoundary.jsx

import React from 'react';
import { reportError } from '../../api/errorsApi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para mostrar la UI de error
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Captura el error y lo reporta automáticamente
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Reportar el error automáticamente
        this.reportErrorToSystem(error, errorInfo);
    }

    async reportErrorToSystem(error, errorInfo) {
        try {
            const errorData = {
                errorId: `react-boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: 'frontend',
                severity: 'error',
                errorType: error.name || 'React Error',
                errorMessage: error.message || 'Error desconocido',
                stack: error.stack || 'No stack trace available',
                context: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    componentStack: errorInfo.componentStack,
                    timestamp: new Date().toISOString()
                },
                userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'anonymous',
                component: this.props.componentName || 'Unknown Component',
                environment: import.meta.env.MODE || 'development'
            };

            await reportError(errorData);
            console.log('Error reportado automáticamente al sistema:', errorData.errorId);
        } catch (reportingError) {
            console.error('Error al reportar el error al sistema:', reportingError);
        }
    }

    render() {
        if (this.state.hasError) {
            // UI de error personalizada
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Oops! Algo salió mal
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Ha ocurrido un error inesperado. El error ha sido reportado automáticamente y nuestro equipo está trabajando para solucionarlo.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Recargar página
                                </button>
                            </div>
                            {import.meta.env.MODE === 'development' && (
                                <details className="mt-4 text-left">
                                    <summary className="text-sm text-gray-600 cursor-pointer">
                                        Detalles del error (solo en desarrollo)
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                        {this.state.error && this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
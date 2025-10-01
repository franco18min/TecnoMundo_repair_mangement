import React from 'react';
import { errorLogger, ERROR_CATEGORIES, ERROR_SEVERITY } from '../utils/errorLogger';

/**
 * Error Boundary para capturar errores de React automáticamente
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generar ID único para el error
    const errorId = `react_error_${Date.now()}`;
    
    // Log del error usando nuestro sistema
    errorLogger.logError({
      error,
      category: ERROR_CATEGORIES.REACT,
      severity: ERROR_SEVERITY.HIGH,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.name || 'Unknown',
        props: this.props.context || {}
      },
      component: this.props.name || 'ErrorBoundary'
    });

    // Actualizar state con información del error
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log adicional para desarrollo
    if (import.meta.env.MODE === 'development') {
      console.group('🚨 Error Boundary Triggered');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    // Log del intento de recuperación
    errorLogger.logEvent({
      eventType: 'error_recovery_attempt',
      message: 'Usuario intentó recuperarse de un error',
      context: {
        errorId: this.state.errorId,
        errorBoundary: this.props.name || 'Unknown'
      }
    });

    // Resetear el estado
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReload = () => {
    // Log del reload
    errorLogger.logEvent({
      eventType: 'page_reload_after_error',
      message: 'Usuario recargó la página después de un error',
      context: {
        errorId: this.state.errorId,
        errorBoundary: this.props.name || 'Unknown'
      }
    });

    // Recargar la página
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI personalizada de error
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // UI por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                ¡Oops! Algo salió mal
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
              {this.state.errorId && (
                <p className="mt-1 text-xs text-gray-500">
                  ID del error: {this.state.errorId}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Intentar de nuevo
              </button>
              
              <button
                onClick={this.handleReload}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Recargar página
              </button>
            </div>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-red-50 rounded-md">
                <summary className="text-sm font-medium text-red-800 cursor-pointer">
                  Detalles del error (solo en desarrollo)
                </summary>
                <div className="mt-2 text-xs text-red-700">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  <p><strong>Stack:</strong></p>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <p><strong>Component Stack:</strong></p>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * HOC para envolver componentes con Error Boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook para manejo de errores en componentes funcionales
 */
export const useErrorHandler = (componentName) => {
  const handleError = React.useCallback((error, context = {}) => {
    errorLogger.logError({
      error,
      category: ERROR_CATEGORIES.REACT,
      severity: ERROR_SEVERITY.MEDIUM,
      context,
      component: componentName
    });
  }, [componentName]);

  const handleAsyncError = React.useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, { ...context, async: true });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};
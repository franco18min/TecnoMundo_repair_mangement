// frontend/src/App.jsx

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './context/AuthContext';
import { useErrorCapture } from './hooks/useErrorCapture';
import ErrorBoundary from './components/shared/ErrorBoundary';

function App() {
  const { isLoggedIn, logout } = useAuth();
  
  // Activar captura automática de errores
  useErrorCapture();

  return (
    <ErrorBoundary componentName="App">
      <AnimatePresence mode="wait">
        {isLoggedIn ? (
          <ErrorBoundary componentName="DashboardPage">
            <DashboardPage key="dashboard" onLogout={logout} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary componentName="LoginPage">
            <LoginPage key="login" />
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
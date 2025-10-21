// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import ClientOrderStatusPage from './pages/ClientOrderStatusPage';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <ErrorBoundary>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Ruta pública para consulta de clientes */}
            <Route 
              path="/client/order/:orderId" 
              element={<ClientOrderStatusPage />} 
            />
            
            {/* Ruta de login */}
            <Route 
              path="/login" 
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage key="login" />
                )
              } 
            />
            
            {/* Ruta del dashboard (protegida) */}
            <Route 
              path="/dashboard" 
              element={
                isLoggedIn ? (
                  <DashboardPage key="dashboard" onLogout={logout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Redirección por defecto */}
            <Route 
              path="/" 
              element={
                <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
              } 
            />
            
            {/* Ruta 404 - redirige al login */}
            <Route 
              path="*" 
              element={<Navigate to="/login" replace />} 
            />
          </Routes>
        </AnimatePresence>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
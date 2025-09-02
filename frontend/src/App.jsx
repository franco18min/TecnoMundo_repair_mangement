// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token en localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
  };

  // No renderizar nada hasta que se verifique el token
  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Cargando...</p></div>;
  }

  return (
    <AnimatePresence mode="wait">
      {isLoggedIn ? (
        <DashboardPage key="dashboard" onLogout={handleLogout} />
      ) : (
        <LoginPage key="login" onLogin={handleLogin} />
      )}
    </AnimatePresence>
  );
}

export default App;
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Este es el componente principal que decide qué página mostrar.
function App() {
  // Estado para simular si el usuario ha iniciado sesión.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Función para simular el inicio de sesión.
  // En un futuro, aquí llamarías a tu API de autenticación.
  const handleLogin = () => {
    console.log("Simulando inicio de sesión...");
    setIsLoggedIn(true);
  };

  // Función para simular el cierre de sesión.
  const handleLogout = () => {
    console.log("Simulando cierre de sesión...");
    setIsLoggedIn(false);
  };

  return (
    // AnimatePresence hace que la transición entre páginas sea suave.
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
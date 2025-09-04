// frontend/src/App.jsx

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {isLoggedIn ? (
        <DashboardPage key="dashboard" onLogout={logout} />
      ) : (
        <LoginPage key="login" />
      )}
    </AnimatePresence>
  );
}

export default App;
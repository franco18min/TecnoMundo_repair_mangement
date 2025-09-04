// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { Loader } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Token inválido o expirado, cerrando sesión.", error);
        apiLogout();
        setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    await validateToken(); // Vuelve a validar para obtener los datos del usuario
    return data;
  };

  const logout = () => {
    apiLogout();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoggedIn: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
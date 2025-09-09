import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { fetchNotifications, markNotificationAsRead as apiMarkAsRead } from '../api/notificationsApi';
import { Loader } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const websocketRef = useRef(null);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        // Cargar notificaciones iniciales
        const initialNotifications = await fetchNotifications();
        setNotifications(initialNotifications);
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

  // --- LÓGICA DE WEBSOCKETS ---
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('accessToken');
      // Aseguramos que la URL del WebSocket sea la correcta (ws://)
      const wsUrl = `ws://127.0.0.1:8001/api/v1/notifications/ws?token=${token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log("WebSocket conectado.");
      };

      websocketRef.current.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications(prev => [newNotification, ...prev]);
        // Aquí se podría disparar el pop-up "Toast"
      };

      websocketRef.current.onclose = () => {
        console.log("WebSocket desconectado.");
      };

      websocketRef.current.onerror = (error) => {
        console.error("Error en WebSocket:", error);
      };

      // Limpieza al desmontar el componente o al cambiar de usuario
      return () => {
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      };
    }
  }, [currentUser]);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    await validateToken();
    return data;
  };

  const logout = () => {
    if (websocketRef.current) {
        websocketRef.current.close();
    }
    apiLogout();
    setCurrentUser(null);
    setNotifications([]);
  };

  const markAsRead = async (notificationId) => {
    try {
        await apiMarkAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
    } catch (error) {
        console.error("Error al marcar como leída:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const value = {
    currentUser,
    login,
    logout,
    isLoggedIn: !!currentUser,
    notifications,
    markAsRead
  };

  return (
    <AuthContext.Provider value={value}>
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
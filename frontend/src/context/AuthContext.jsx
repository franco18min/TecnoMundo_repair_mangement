import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { fetchRepairOrders } from '../api/repairOrdersApi';
import { fetchNotifications, markNotificationAsRead as apiMarkAsRead } from '../api/notificationsApi';
import { Loader } from 'lucide-react';
// Ya no necesitamos useToast aquí

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const websocketRef = useRef(null);

  const mapOrderData = (order) => ({
      id: order.id,
      customer: { name: `${order.customer.first_name} ${order.customer.last_name}` },
      device: { type: order.device_type?.type_name || 'Desconocido', model: order.device_model },
      status: order.status?.status_name || 'Desconocido',
      assignedTechnician: { name: order.technician?.username || 'No asignado' },
      dateReceived: order.created_at,
      parts_used: order.parts_used || 'N/A',
  });

  const loadInitialData = useCallback(async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      const [initialOrders, initialNotifications] = await Promise.all([ fetchRepairOrders(), fetchNotifications() ]);
      setOrders(initialOrders);
      setNotifications(initialNotifications);
  }, []);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try { await loadInitialData(); }
      catch (error) {
        console.error("Token inválido o expirado.", error);
        apiLogout();
        setCurrentUser(null);
        throw new Error("La sesión no es válida o ha expirado. Por favor, inicie sesión de nuevo.");
      }
    }
    setIsLoading(false);
  }, [loadInitialData]);

  useEffect(() => {
    validateToken().catch(() => {
      console.log("Token inicial inválido, sesión limpiada.");
    });
  }, [validateToken]);

  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('accessToken');
      const wsUrl = `ws://127.0.0.1:8001/api/v1/notifications/ws?token=${token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => console.log("WebSocket conectado.");
      websocketRef.current.onclose = () => console.log("WebSocket desconectado.");
      websocketRef.current.onerror = (error) => console.error("Error en WebSocket:", error);

      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.event) {
            case 'ORDER_CREATED':
                setOrders(prev => [mapOrderData(data.payload), ...prev].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived)));
                // Se elimina la llamada a showToast
                break;
            case 'ORDER_UPDATED':
                setOrders(prev => prev.map(o => o.id === data.payload.id ? mapOrderData(data.payload) : o));
                // Se elimina la llamada a showToast
                break;
            case 'ORDER_DELETED':
                setOrders(prev => prev.filter(o => o.id !== data.payload.id));
                // Se elimina la llamada a showToast
                break;
            case 'NEW_NOTIFICATION':
                setNotifications(prev => [data.payload, ...prev]);
                break;
            default:
                console.warn("Evento de WebSocket desconocido:", data);
                break;
        }
      };

      return () => websocketRef.current?.close();
    }
  }, [currentUser]);

  const login = async (username, password) => {
    await apiLogin(username, password);
    await validateToken();
  };

  const logout = () => {
    websocketRef.current?.close();
    apiLogout();
    setCurrentUser(null);
    setNotifications([]);
    setOrders([]);
  };

  const markAsRead = async (notificationId) => {
    try {
        await apiMarkAsRead(notificationId);
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (error) { console.error("Error al marcar como leída:", error); }
  };

  if (isLoading) { return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={48} /></div>; }

  const value = { currentUser, login, logout, isLoggedIn: !!currentUser, orders, notifications, markAsRead };

  return ( <AuthContext.Provider value={value}>{children}</AuthContext.Provider> );
};

export const useAuth = () => useContext(AuthContext);
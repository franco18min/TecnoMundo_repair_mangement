import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { fetchRepairOrders, mapOrderData } from '../api/repairOrdersApi';
import { fetchNotifications, markNotificationAsRead as apiMarkAsRead } from '../api/notificationsApi';
import { API_CONFIG } from '../config/api.js';
// --- INICIO DE LA MODIFICACIÓN ---
import { fetchBranches as apiFetchBranches } from '../api/branchApi';
import { Loader } from 'lucide-react';
import { initializeUserApi } from '../api/userApi';
import { initializeRolesApi } from '../api/rolesApi';
import { initializeBranchApi } from '../api/branchApi';
// --- FIN DE LA MODIFICACIÓN ---

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const websocketRef = useRef(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('all');

    // --- INICIO DE LA MODIFICACIÓN ---
    const getAccessToken = useCallback(() => localStorage.getItem('accessToken'), []);

    const logout = useCallback(() => {
        websocketRef.current?.close();
        apiLogout();
        setCurrentUser(null);
        setNotifications([]);
        setOrders([]);
        setBranches([]);
        setSelectedBranchId('all'); // Reseteo corregido
    }, []);

    useEffect(() => {
        initializeUserApi(getAccessToken, logout);
        initializeRolesApi(getAccessToken, logout);
        initializeBranchApi(getAccessToken, logout);
    }, [getAccessToken, logout]);
    // --- FIN DE LA MODIFICACIÓN ---

    const loadInitialData = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUser(user);

            const [initialOrders, initialNotifications, allBranches] = await Promise.all([
                fetchRepairOrders(),
                fetchNotifications(),
                apiFetchBranches()
            ]);

            setOrders(initialOrders);
            setNotifications(initialNotifications);
            setBranches(allBranches);

            if (user.role?.role_name !== 'Administrator' && user.branch) {
                setSelectedBranchId(user.branch.id);
            }
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }, []);

    const validateToken = useCallback(async () => {
        const token = getAccessToken();
        if (token) {
            try { await loadInitialData(); }
            catch (error) {
                console.error("Token inválido o expirado.", error);
                logout(); // Se llama a la función de logout centralizada
            }
        }
        setIsLoading(false);
    }, [loadInitialData, getAccessToken, logout]);

    useEffect(() => {
        validateToken();
    }, [validateToken]);

    useEffect(() => {
        if (currentUser) {
            const token = getAccessToken();
            const wsUrl = `${API_CONFIG.BASE_URL.replace('http', 'ws').replace('https', 'wss')}/api/v1/notifications/ws?token=${token}`;
            
            // Cerrar conexión existente si existe
            if (websocketRef.current) {
                websocketRef.current.close();
            }
            
            websocketRef.current = new WebSocket(wsUrl);

            websocketRef.current.onopen = () => console.log("WebSocket conectado.");
            websocketRef.current.onclose = (event) => {
                // Solo mostrar mensaje si no es un cierre intencional
                if (event.code !== 1000) {
                    console.log("WebSocket desconectado inesperadamente. Código:", event.code);
                }
            };
            websocketRef.current.onerror = (error) => console.error("Error en WebSocket:", error);

            websocketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.event) {
                    case 'ORDER_CREATED':
                        setOrders(prev => [mapOrderData(data.payload), ...prev].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived)));
                        break;
                    case 'ORDER_UPDATED':
                        setOrders(prev => prev.map(o => o.id === data.payload.id ? mapOrderData(data.payload) : o));
                        break;
                    case 'ORDER_DELETED':
                        setOrders(prev => prev.filter(o => o.id !== data.payload.id));
                        break;
                    case 'NEW_NOTIFICATION':
                        setNotifications(prev => [data.payload, ...prev]);
                        break;
                    default:
                        console.warn("Evento de WebSocket desconocido:", data);
                        break;
                }
            };

            return () => {
                if (websocketRef.current) {
                    websocketRef.current.close(1000, 'Component unmounting');
                }
            };
        }
    }, [currentUser]); // Removida dependencia getAccessToken que causaba reconexiones

    const login = async (username, password) => {
        await apiLogin(username, password);
        await validateToken();
    };

    const markAsRead = async (notificationId) => {
        try {
            await apiMarkAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        } catch (error) { console.error("Error al marcar como leída:", error); }
    };

    const filteredOrders = useMemo(() => {
        if (selectedBranchId === 'all') {
            return orders;
        }
        return orders.filter(order => order.branch_id === selectedBranchId);
    }, [orders, selectedBranchId]);

    if (isLoading) { return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={48} /></div>; }

    const value = {
        currentUser,
        login,
        logout,
        isLoggedIn: !!currentUser,
        orders,
        notifications,
        markAsRead,
        branches,
        selectedBranchId,
        setSelectedBranchId,
        filteredOrders
    };

    return ( <AuthContext.Provider value={value}>{children}</AuthContext.Provider> );
};

export const useAuth = () => useContext(AuthContext);
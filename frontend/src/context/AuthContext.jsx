// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { fetchRepairOrders } from '../api/repairOrdersApi';
import { fetchNotifications, markNotificationAsRead as apiMarkAsRead } from '../api/notificationsApi';
import { fetchBranches } from '../api/branchApi'; // <-- 1. Importamos la nueva función de API
import { Loader } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const websocketRef = useRef(null);

    // --- INICIO DE LA MODIFICACIÓN: Estados para sucursales ---
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('all'); // 'all' para administradores
    // --- FIN DE LA MODIFICACIÓN ---

    const mapOrderData = useCallback((order) => ({
        id: order.id,
        branch_id: order.branch?.id, // Guardamos el ID de la sucursal en la orden
        customer: { name: `${order.customer.first_name} ${order.customer.last_name}` },
        device: {
            type: order.device_type?.type_name || 'Desconocido',
            model: order.device_model
        },
        status: order.status?.status_name || 'Desconocido',
        assignedTechnician: { name: order.technician?.username || 'No asignado' },
        dateReceived: order.created_at,
        parts_used: order.parts_used || 'N/A',
    }), []);

    const loadInitialData = useCallback(async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // --- INICIO DE LA MODIFICACIÓN: Cargar sucursales y establecer la sucursal por defecto ---
        const [initialOrders, initialNotifications, allBranches] = await Promise.all([
            fetchRepairOrders(),
            fetchNotifications(),
            fetchBranches()
        ]);

        setOrders(initialOrders.map(mapOrderData));
        setNotifications(initialNotifications);
        setBranches(allBranches);

        // Si el usuario no es admin, su sucursal seleccionada por defecto es la suya.
        if (user.role?.role_name !== 'Administrator' && user.branch) {
            setSelectedBranchId(user.branch.id);
        }
        // --- FIN DE LA MODIFICACIÓN ---

    }, [mapOrderData]);

    const validateToken = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try { await loadInitialData(); }
            catch (error) {
                console.error("Token inválido o expirado.", error);
                apiLogout();
                setCurrentUser(null);
            }
        }
        setIsLoading(false);
    }, [loadInitialData]);

    useEffect(() => {
        validateToken();
    }, [validateToken]);

    // --- Lógica de WebSocket (sin cambios por ahora) ---
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

            return () => websocketRef.current?.close();
        }
    }, [currentUser, mapOrderData]);

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
        setBranches([]); // Limpiamos las sucursales al cerrar sesión
    };

    const markAsRead = async (notificationId) => {
        try {
            await apiMarkAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        } catch (error) { console.error("Error al marcar como leída:", error); }
    };

    // --- INICIO DE LA MODIFICACIÓN: Órdenes filtradas ---
    // Este `memo` recalculará las órdenes a mostrar CADA VEZ que cambie la lista de órdenes o la sucursal seleccionada.
    const filteredOrders = useMemo(() => {
        if (selectedBranchId === 'all') {
            return orders; // El admin ve todo
        }
        return orders.filter(order => order.branch_id === selectedBranchId);
    }, [orders, selectedBranchId]);
    // --- FIN DE LA MODIFICACIÓN ---

    if (isLoading) { return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={48} /></div>; }

    const value = {
        currentUser,
        login,
        logout,
        isLoggedIn: !!currentUser,
        orders,
        notifications,
        markAsRead,
        // --- INICIO DE LA MODIFICACIÓN: Exponemos los nuevos estados y funciones ---
        branches,
        selectedBranchId,
        setSelectedBranchId,
        filteredOrders // ¡Exponemos las órdenes ya filtradas!
        // --- FIN DE LA MODIFICACIÓN ---
    };

    return ( <AuthContext.Provider value={value}>{children}</AuthContext.Provider> );
};

export const useAuth = () => useContext(AuthContext);
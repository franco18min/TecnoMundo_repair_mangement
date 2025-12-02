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
import { initializeRecordsApi } from '../api/recordsApi';
// --- FIN DE LA MODIFICACIÓN ---

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const websocketRef = useRef(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // --- INICIO DE LA MODIFICACIÓN ---
    const getAccessToken = useCallback(() => localStorage.getItem('accessToken'), []);

    const logout = useCallback(() => {
        websocketRef.current?.close();
        apiLogout();
        setCurrentUser(null);
        setNotifications([]);
        setOrders([]);
        setBranches([]);
        setSelectedBranchId(null);
    }, []);

    useEffect(() => {
        initializeUserApi(getAccessToken, logout);
        initializeRolesApi(getAccessToken, logout);
        initializeBranchApi(getAccessToken, logout);
        initializeRecordsApi(getAccessToken, logout);
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

            if (user?.branch?.id) {
                setSelectedBranchId(user.branch.id);
            } else if (allBranches && allBranches.length > 0) {
                setSelectedBranchId(allBranches[0].id);
            }
        } catch (error) {
            // Suprimir logs de consola en producción/desarrollo
        }
    }, []);

    const validateToken = useCallback(async () => {
        const token = getAccessToken();
        if (token) {
            try { await loadInitialData(); }
            catch (error) {
                logout();
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
            const wsUrlWithToken = `${API_CONFIG.WS_URL}?token=${token}`;
            
            // Cerrar conexión existente si existe
            if (websocketRef.current) {
                websocketRef.current.close();
            }
            
            websocketRef.current = new WebSocket(wsUrlWithToken);

            websocketRef.current.onopen = () => {};
            websocketRef.current.onclose = (event) => {};
            websocketRef.current.onerror = () => {};

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
        } catch (error) { }
    };

    const filteredOrders = useMemo(() => {
        if (selectedBranchId == null) {
            return [];
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

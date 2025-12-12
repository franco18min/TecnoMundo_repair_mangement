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
        let isMounted = true;
        let reconnectTimeout = null;

        const connect = () => {
            if (!currentUser) return;
            const token = getAccessToken();
            if (!token) return;

            // Avoid opening multiple connections if already connected or connecting
            if (websocketRef.current && (websocketRef.current.readyState === WebSocket.OPEN || websocketRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            const wsUrlWithToken = `${API_CONFIG.WS_URL}?token=${token}`;
            console.log('Initiating WebSocket connection...');
            
            const ws = new WebSocket(wsUrlWithToken);
            websocketRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.onclose = (event) => {
                console.log(`WebSocket Disconnected (Code: ${event.code}). Reconnecting in 3s...`);
                if (isMounted) {
                    reconnectTimeout = setTimeout(connect, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.close(); // Force close to trigger onclose logic if it hangs
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.event) {
                        case 'ORDER_CREATED':
                            setOrders(prev => {
                                const newOrder = mapOrderData(data.payload);
                                // Prevent duplicates
                                if (prev.find(o => o.id === newOrder.id)) return prev;
                                return [newOrder, ...prev].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));
                            });
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
                } catch (e) {
                    console.error('Error processing WS message:', e);
                }
            };
        };

        if (currentUser) {
            connect();
        }

        return () => {
            isMounted = false;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (websocketRef.current) {
                websocketRef.current.onclose = null;
                websocketRef.current.close(1000, 'Component unmounting');
            }
        };
    }, [currentUser, getAccessToken]);

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
        // If "Todas las Sucursales" is selected (assuming ID 0 or null represents that) or if we want to show everything by default when no specific branch is selected
        // However, based on the user request "ver todas las ordenes de todas las sucursales", we should probably allow a "View All" option or just return all orders if selectedBranchId is null/special value.
        
        // Current logic:
        if (selectedBranchId === 'all') {
             return orders;
        }

        if (selectedBranchId == null) {
             // If no branch is selected, show all orders? Or show none?
             // User request: "todos los usuarios ... puedan ver todas las ordenes de todas las sucursales"
             // Let's assume we want to show all orders if no specific branch is forced, OR we need to make sure the UI allows selecting "All".
             // For now, let's return ALL orders if selectedBranchId is null, to be safe with the "see everything" requirement.
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

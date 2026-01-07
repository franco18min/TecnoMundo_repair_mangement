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

    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(15); // Producción: 15 órdenes por página

    // --- INICIO DE LA MODIFICACIÓN ---
    const getAccessToken = useCallback(() => localStorage.getItem('accessToken'), []);

    const logout = useCallback((message = null) => {
        websocketRef.current?.close();
        apiLogout();
        setCurrentUser(null);
        setNotifications([]);
        setOrders([]);
        setBranches([]);
        setSelectedBranchId(null);

        // Guardar mensaje en sessionStorage para mostrarlo en login
        if (message) {
            sessionStorage.setItem('sessionExpiredMessage', message);
        }
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

            const [ordersData, initialNotifications, allBranches] = await Promise.all([
                fetchRepairOrders(1, pageSize), // Cargar primera página
                fetchNotifications(),
                apiFetchBranches()
            ]);

            // ordersData ahora es: { orders, total, page, pageSize, totalPages }
            setOrders(ordersData.orders);
            setTotalOrders(ordersData.total);
            setCurrentPage(ordersData.page);
            setTotalPages(ordersData.totalPages);

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
    }, [pageSize]);

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
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 10;

        // Función para calcular delay de reconexión con backoff exponencial
        const getReconnectDelay = (attempt) => {
            return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 segundos
        };

        const connect = () => {
            if (!currentUser) return;
            const token = getAccessToken();
            if (!token) return;

            // Evitar múltiples conexiones simultáneas
            if (websocketRef.current) {
                const state = websocketRef.current.readyState;
                if (state === WebSocket.OPEN ||
                    state === WebSocket.CONNECTING ||
                    state === WebSocket.CLOSING) {
                    return;
                }
            }

            const wsUrlWithToken = `${API_CONFIG.WS_URL}?token=${token}`;

            const ws = new WebSocket(wsUrlWithToken);
            websocketRef.current = ws;

            ws.onopen = () => {
                reconnectAttempts = 0; // Reset intentos en conexión exitosa
            };

            ws.onclose = (event) => {

                // Si el código es 1008 (Policy Violation), probablemente el token expiró
                if (event.code === 1008) {
                    console.warn('Session expired - redirecting to login');
                    logout('Sesión caducada. Por favor, inicie sesión nuevamente.');
                    window.location.href = '/login';
                    return;
                }

                // Reconexión con backoff exponencial
                if (isMounted && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const delay = getReconnectDelay(reconnectAttempts);
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
                    reconnectAttempts++;
                    reconnectTimeout = setTimeout(connect, delay);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.error('Max reconnection attempts reached');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.close(); // Forzar cierre para activar lógica de onclose
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Responder a PING del servidor con PONG
                    if (data.event === 'PING') {
                        ws.send(JSON.stringify({ event: 'PONG' }));
                        return;
                    }

                    switch (data.event) {
                        case 'ORDER_CREATED':
                            setOrders(prev => {
                                const newOrder = mapOrderData(data.payload);
                                // Prevenir duplicados
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

        // Manejo de visibilidad de página
        const handleVisibilityChange = () => {
            if (!document.hidden && websocketRef.current) {
                if (websocketRef.current.readyState !== WebSocket.OPEN) {
                    console.log('Page visible, checking connection...');
                    connect();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (websocketRef.current) {
                websocketRef.current.onclose = null;
                websocketRef.current.close(1000, 'Component unmounting');
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentUser, getAccessToken, logout]);

    // Sistema de timeout: Solo Expiración Absoluta (4 horas)
    useEffect(() => {
        if (!currentUser) return;

        const ABSOLUTE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas
        const WARNING_TIME = 5 * 60 * 1000; // Advertencia 5 min antes

        let absoluteTimer = null;
        let warningShown = false;

        // Función para hacer logout por timeout
        const handleTimeout = (reason) => {
            console.warn(`Session timeout: ${reason}`);
            logout('Sesión caducada. Por favor, inicie sesión nuevamente.');
            window.location.href = '/login';
        };

        // Timer absoluto (desde login, no se reinicia)
        const loginTime = parseInt(localStorage.getItem('loginTime') || Date.now());
        const timeElapsed = Date.now() - loginTime;
        const absoluteTimeRemaining = ABSOLUTE_TIMEOUT - timeElapsed;

        if (absoluteTimeRemaining <= 0) {
            // Ya expiró
            handleTimeout('absolute timeout');
            return;
        }

        absoluteTimer = setTimeout(() => {
            handleTimeout('absolute timeout (4 hours)');
        }, absoluteTimeRemaining);

        // Verificación periódica (cada minuto) para detectar expiración absoluta
        const checkInterval = setInterval(() => {
            const sessionExpiration = parseInt(localStorage.getItem('sessionExpiration'));
            const now = Date.now();
            const timeRemaining = sessionExpiration - now;

            // Verificar si ya expiró
            if (timeRemaining <= 0) {
                clearInterval(checkInterval);
                handleTimeout('absolute timeout (verification)');
                return;
            }

            // Mostrar advertencia 5 minutos antes (solo una vez)
            if (timeRemaining <= WARNING_TIME && !warningShown) {
                warningShown = true;
                console.warn(`Session will expire in ${Math.floor(timeRemaining / 60000)} minutes`);
            }
        }, 60000); // Verificar cada minuto

        // Cleanup
        return () => {
            if (absoluteTimer) clearTimeout(absoluteTimer);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [currentUser, logout]);

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

    // Función para cambiar de página - DEBE estar antes del return condicional
    const fetchOrdersPage = useCallback(async (page, filters = {}) => {
        try {
            const ordersData = await fetchRepairOrders(page, pageSize, filters);
            setOrders(ordersData.orders);
            setTotalOrders(ordersData.total);
            setCurrentPage(ordersData.page);
            setTotalPages(ordersData.totalPages);
        } catch (error) {
            console.error("Error al cargar página de órdenes:", error);
        }
    }, [pageSize]);

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
        filteredOrders,
        // Paginación
        currentPage,
        totalOrders,
        totalPages,
        pageSize,
        fetchOrdersPage
    };

    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

export const useAuth = () => useContext(AuthContext);

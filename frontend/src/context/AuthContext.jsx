import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../api/authApi';
import { fetchNotifications, markNotificationAsRead as apiMarkAsRead } from '../api/notificationsApi';
import { API_CONFIG } from '../config/api.js';
import { fetchBranches as apiFetchBranches } from '../api/branchApi';
import { Loader } from 'lucide-react';
import { initializeUserApi } from '../api/userApi';
import { initializeRolesApi } from '../api/rolesApi';
import { initializeBranchApi } from '../api/branchApi';
import { initializeRecordsApi } from '../api/recordsApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const websocketRef = useRef(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Estas funciones deben ser estables (no cambiar en cada render)
    const getAccessToken = useCallback(() => localStorage.getItem('accessToken'), []);

    const logout = useCallback((message = null) => {
        websocketRef.current?.close();
        apiLogout();
        setCurrentUser(null);
        setNotifications([]);
        setBranches([]);
        setSelectedBranchId(null);

        // Guardar mensaje en sessionStorage para mostrarlo en login
        if (message && typeof message === 'string') {
            sessionStorage.setItem('sessionExpiredMessage', message);
        }
    }, []); // ✅ Sin dependencias - función estable

    // Inicializar APIs solo UNA VEZ al montar el componente
    useEffect(() => {
        initializeUserApi(getAccessToken, logout);
        initializeRolesApi(getAccessToken, logout);
        initializeBranchApi(getAccessToken, logout);
        initializeRecordsApi(getAccessToken, logout);
    }, []);
    // --- FIN DE LA MODIFICACIÓN ---

    const loadInitialData = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUser(user);

            const [initialNotifications, allBranches] = await Promise.all([
                fetchNotifications(),
                apiFetchBranches()
            ]);

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
    }, [loadInitialData]);

    // Validar token solo UNA VEZ al montar
    useEffect(() => {
        validateToken();
    }, []);

    useEffect(() => {

        let isMounted = true;
        let reconnectTimeout = null;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 10;
        let intentionalDisconnect = false; // Flag para distinguir cleanup real de Strict Mode

        // Función para calcular delay de reconexión con backoff exponencial
        const getReconnectDelay = (attempt) => {
            return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 segundos
        };

        const connect = () => {
            if (!currentUser) {
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                return;
            }

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
                reconnectAttempts = 0;
            };

            ws.onclose = (event) => {
                // Si fue cierre intencional (logout real), no reconectar
                if (intentionalDisconnect) {
                    return;
                }

                // Si el código es 1008 (Policy Violation), probablemente el token expiró
                if (event.code === 1008) {
                    const logout = localStorage.getItem('logout');
                    if (logout) {
                        sessionStorage.setItem('sessionExpiredMessage', 'Sesión caducada. Por favor, inicie sesión nuevamente.');
                    }
                    window.location.href = '/login';
                    return;
                }

                // Reconexión con backoff exponencial
                if (isMounted && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const delay = getReconnectDelay(reconnectAttempts);
                    reconnectAttempts++;
                    reconnectTimeout = setTimeout(connect, delay);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.error('WebSocket: Max reconnection attempts reached');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.close();
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
                        case 'ORDER_UPDATED':
                        case 'ORDER_DELETED':
                            // Emitir evento personalizado para que los componentes se actualicen
                            window.dispatchEvent(new CustomEvent('orderUpdate', {
                                detail: { event: data.event, order: data.payload }
                            }));
                            break;
                        case 'NEW_NOTIFICATION':
                            setNotifications(prev => [data.payload, ...prev]);
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    console.error('Error processing WebSocket message:', e);
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
                    connect();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            intentionalDisconnect = true;

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            if (websocketRef.current) {
                const state = websocketRef.current.readyState;
                if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
                    websocketRef.current.close(1000, 'Component unmounting');
                }
            }

            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentUser]);

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



    if (isLoading) { return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={48} /></div>; }

    const value = {
        currentUser,
        login,
        logout,
        isLoggedIn: !!currentUser,
        notifications,
        markAsRead,
        branches,
        selectedBranchId,
        setSelectedBranchId
    };

    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

export const useAuth = () => useContext(AuthContext);

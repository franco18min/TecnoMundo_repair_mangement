// frontend/src/components/dashboard/DashboardHome.jsx

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader, Filter } from 'lucide-react';
import { OrderCard } from '../orders/OrderCard';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { fetchRepairOrders } from '../../api/repairOrdersApi';

// Variantes compartidas para animación, replicando las usadas en Gestión de Órdenes
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export function DashboardHome({ onNewOrderClick, onViewOrderClick }) {
    const { currentUser, selectedBranchId } = useAuth();
    const { canCreateOrders } = usePermissions('create');
    const [statusFilter, setStatusFilter] = useState('All');
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Detectar móvil
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Función para cargar órdenes recientes (con useCallback para dependencias correctas)
    const loadRecentOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            // Construir filtros incluyendo sucursal y estado
            const filters = {};
            if (selectedBranchId) {
                filters.branch_id = selectedBranchId;
            }
            // Aplicar filtro de estado en el servidor para obtener más resultados relevantes
            if (statusFilter !== 'All') {
                if (statusFilter === 'Pending') filters.status = 'Pending';
                if (statusFilter === 'Waiting') filters.status = 'Waiting for parts';
                if (statusFilter === 'In Process') filters.status = 'In Process';
                if (statusFilter === 'Completed') filters.status = 'Completed';
                if (statusFilter === 'Delivered') filters.status = 'Delivered';
            }

            const response = await fetchRepairOrders(1, 6, filters);
            setRecentOrders(response.items || []);
        } catch (error) {
            console.error('Error loading recent orders:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBranchId, statusFilter]);

    // Cargar órdenes inicial y escuchar eventos WebSocket
    useEffect(() => {
        loadRecentOrders();

        const handleOrderUpdate = () => loadRecentOrders();
        window.addEventListener('orderUpdate', handleOrderUpdate);
        return () => window.removeEventListener('orderUpdate', handleOrderUpdate);
    }, []);

    // Recargar cuando cambia la sucursal seleccionada
    useEffect(() => {
        loadRecentOrders();
    }, [selectedBranchId]);

    // Recargar cuando cambia el filtro de estado
    useEffect(() => {
        loadRecentOrders();
    }, [statusFilter]);

    // En móvil, filtrar solo órdenes sin tomar y las del usuario actual
    const mobileFilteredOrders = useMemo(() => {
        if (!isMobile) return recentOrders;
        return recentOrders.filter(order => {
            const assignedName = order?.assignedTechnician?.name ?? order?.technician ?? 'No asignado';
            return assignedName === 'No asignado' || assignedName === currentUser?.username;
        });
    }, [recentOrders, isMobile, currentUser]);

    // Aplicar filtros de móvil (solo client-side para órdenes sin tomar)
    const displayOrders = useMemo(() => {
        let base = isMobile ? mobileFilteredOrders : recentOrders;
        // El filtro de estado ya se aplicó en el servidor
        return base.slice(0, 6);
    }, [recentOrders, mobileFilteredOrders, isMobile]);

    return (
        <>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div>
                    <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        Órdenes Recientes
                    </motion.h1>
                    <motion.p className="text-gray-500 mt-1" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        Hola {currentUser?.username}, bienvenido de nuevo.
                    </motion.p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filtro para todos los roles */}
                    <div className="flex flex-wrap bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'All' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setStatusFilter('Pending')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'Pending' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setStatusFilter('Waiting')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'Waiting' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            En Espera
                        </button>
                        <button
                            onClick={() => setStatusFilter('In Process')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'In Process' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            En Proceso
                        </button>
                        <button
                            onClick={() => setStatusFilter('Completed')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'Completed' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Completadas
                        </button>
                        <button
                            onClick={() => setStatusFilter('Delivered')}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${statusFilter === 'Delivered' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Entregadas
                        </button>
                    </div>

                    {canCreateOrders && (
                        <motion.button
                            onClick={onNewOrderClick}
                            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <PlusCircle size={20} />
                            <span className="hidden sm:inline">Nueva orden</span>
                        </motion.button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="animate-spin text-indigo-600" size={48} />
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence>
                        {displayOrders.length > 0 ? (
                            displayOrders.map(order =>
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={() => onViewOrderClick(order.id)}
                                />
                            )
                        ) : (
                            <motion.div
                                className="md:col-span-3 text-center text-gray-500 p-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="font-semibold">No hay órdenes recientes para mostrar.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </>
    );
}
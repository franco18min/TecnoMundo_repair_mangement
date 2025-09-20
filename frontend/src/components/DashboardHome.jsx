// frontend/src/components/DashboardHome.jsx

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export function DashboardHome({ onNewOrderClick, onViewOrderClick }) {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Usamos 'filteredOrders' en lugar de 'orders'
    const { currentUser, filteredOrders } = useAuth();
    // --- FIN DE LA MODIFICACIÓN ---
    const { canCreateOrders } = usePermissions('create'); // El modo es 'create' para este permiso

    const recentOrders = useMemo(() => {
        // La lógica de cortar las 6 más recientes ahora se aplica a la lista ya filtrada
        return (filteredOrders || []).slice(0, 6);
    }, [filteredOrders]);

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        Órdenes Recientes
                    </motion.h1>
                    <motion.p className="text-gray-500 mt-1" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        Hola {currentUser?.username}, bienvenido de nuevo.
                    </motion.p>
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
                        <span className="hidden sm:inline">Crear Nueva Orden</span>
                    </motion.button>
                )}
            </div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
            >
                <AnimatePresence>
                    {recentOrders.length > 0 ? (
                        recentOrders.map(order =>
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
        </>
    );
}
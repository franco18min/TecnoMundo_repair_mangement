import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { fetchRepairOrders } from '../api/repairOrdersApi';
import { useAuth } from '../context/AuthContext'; // 1. Importar useAuth
import { usePermissions } from '../hooks/usePermissions'; // 2. Importar usePermissions

export function DashboardHome({ onNewOrderClick, onViewOrderClick }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth(); // 3. Obtener usuario actual
  const { canCreateOrders } = usePermissions(); // 4. Obtener permisos

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const fetchedOrders = await fetchRepairOrders();
        setOrders(fetchedOrders.slice(0, 6));
      } catch (error) {
        console.error("Error al cargar las órdenes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Órdenes Recientes
          </motion.h1>
          {/* 5. Mensaje de bienvenida dinámico */}
          <motion.p className="text-gray-500 mt-1" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            Hola {currentUser?.username}, bienvenido de nuevo.
          </motion.p>
        </div>

        {/* 6. Botón de crear orden condicional */}
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

      {isLoading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
        >
          {orders.map(order =>
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onViewOrderClick(order.id)}
            />
          )}
        </motion.div>
      )}
    </>
  );
}
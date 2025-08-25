import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { OrderCard } from '../components/OrderCard'; // Importamos la nueva tarjeta
import { fetchRepairOrders } from '../api/repairOrdersApi';

export function DashboardPage({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const fetchedOrders = await fetchRepairOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error al cargar las órdenes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.h1
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Órdenes Recientes
        </motion.h1>
        <motion.p
          className="text-gray-500 mt-1 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Hola Admin, bienvenido de nuevo.
        </motion.p>

        {isLoading ? (
          <p>Cargando órdenes...</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </motion.div>
        )}
      </main>
    </div>
  );
}
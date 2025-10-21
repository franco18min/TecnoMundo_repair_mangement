// frontend/src/components/clients/ClientOrdersModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, FolderKanban } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getOrdersByCustomerId } from '../../api/repairOrdersApi';
import { OrderListItem } from '../orders/OrderListItem';

export function ClientOrdersModal({ isOpen, onClose, client, onOrderSelect }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && client) {
            const fetchOrders = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const fetchedOrders = await getOrdersByCustomerId(client.id);
                    setOrders(fetchedOrders);
                } catch (err) {
                    setError(err.message || 'Error al cargar las órdenes del cliente.');
                    showToast(err.message || 'Error al cargar órdenes', 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrders();
        } else if (!isOpen) {
            setOrders([]);
            setIsLoading(true);
            setError('');
        }
    }, [isOpen, client, showToast]);

    const modalVariants = {
        hidden: { opacity: 0, y: "100vh" },
        visible: { opacity: 1, y: "0", transition: { type: "spring", damping: 20, stiffness: 100 } },
        exit: { opacity: 0, y: "100vh" },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-3/4 flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white">Órdenes de {client?.first_name} {client?.last_name}</h2>
                            <motion.button 
                                onClick={onClose} 
                                className="text-indigo-100 hover:text-white p-1 rounded-full"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <X size={24} />
                            </motion.button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            {isLoading && (
                                <div className="flex justify-center items-center h-full">
                                    <Loader className="animate-spin text-indigo-600" size={48} />
                                </div>
                            )}
                            {error && <p className="text-center text-red-500">{error}</p>}
                            {!isLoading && !error && (
                                <motion.div
                                    className="space-y-4"
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: { staggerChildren: 0.1 }
                                        }
                                    }}
                                >
                                    {orders.length > 0 ? (
                                        orders.map(order => (
                                            <motion.div key={order.id} variants={itemVariants}>
                                                <OrderListItem
                                                    order={order}
                                                    onClick={() => onOrderSelect(order.id)}
                                                />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8 flex flex-col items-center justify-center h-full">
                                            <FolderKanban size={48} className="mb-4 text-gray-400" />
                                            <p>Este cliente no tiene órdenes registradas.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <motion.button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Cerrar
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
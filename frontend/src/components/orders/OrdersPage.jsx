// frontend/src/components/orders/OrdersPage.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Wrench, CheckCircle, AlertTriangle, Clock, RotateCcw, Truck, XCircle, Archive, Eye } from 'lucide-react';
import { deleteRepairOrder } from '../../api/repairOrdersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../shared/ConfirmationModal';
// NUEVO: Vista móvil con tarjetas
import { OrderCard } from './OrderCard.jsx';

const statusConfig = {
    'Pending': { text: 'Pendiente', badge: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} className="text-red-600" /> },
    'In Process': { text: 'En Proceso', badge: 'bg-yellow-100 text-yellow-800', icon: <Wrench size={14} className="text-yellow-600" /> },
    'Completed': { text: 'Completado', badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="text-green-600" /> },
    'Cancelled': { text: 'Cancelado', badge: 'bg-gray-200 text-gray-800', icon: <XCircle size={14} className="text-gray-600" /> },
    'Delivered': { text: 'Entregado', badge: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} className="text-indigo-600" /> },
    'Waiting for parts': { text: 'Esperando Repuesto', badge: 'bg-blue-100 text-blue-800', icon: <Clock size={14} className="text-blue-600" /> },
    'Default': { text: 'Desconocido', badge: 'bg-gray-100 text-gray-800', icon: <Archive size={14} className="text-gray-600" /> }
};

// Variantes de animación mejoradas
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
        opacity: 1, 
        x: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    },
    exit: { 
        opacity: 0, 
        x: 100,
        transition: {
            duration: 0.2
        }
    }
};

const FilterInput = ({ label, name, value, onChange }) => (
    <motion.div variants={itemVariants}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
    </motion.div>
);

const FilterSelect = ({ label, name, value, onChange, options, className = '' }) => (
    <motion.div variants={itemVariants}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${className}`}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.text}
                </option>
            ))}
        </select>
    </motion.div>
);

export function OrdersPage({ onNewOrderClick, onViewOrderClick }) {
    // Usamos 'filteredOrders' en lugar de 'orders'. La variable ahora se llama 'ordersToDisplay' para mayor claridad.
    const { filteredOrders: ordersToDisplay, currentUser } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const initialFilters = {
        id: '',
        client: '',
        device_type: 'Todos',
        status: 'Todos',
        technician: 'Todos',
        parts_used: ''
    };
    const [filters, setFilters] = useState(initialFilters);
    const permissions = usePermissions();

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
        setIsLoading(true);
        try {
            await deleteRepairOrder(orderToDelete.id);
            showToast('Orden eliminada con éxito', 'success');
        } catch (error) {
            console.error("Error al eliminar la orden:", error);
            showToast(error.message || 'No se pudo eliminar la orden', 'error');
        } finally {
            setOrderToDelete(null);
            setIsLoading(false);
        }
    };

    // Los filtros ahora operan sobre la lista de órdenes ya filtrada por sucursal.
    const uniqueTechnicians = useMemo(() => ['Todos', ...new Set((ordersToDisplay || []).map(order => order.assignedTechnician.name))], [ordersToDisplay]);
    const uniqueDeviceTypes = useMemo(() => ['Todos', ...new Set((ordersToDisplay || []).map(order => order.device.type))], [ordersToDisplay]);
    const uniqueStatusesOptions = useMemo(() => {
        const statuses = [...new Set((ordersToDisplay || []).map(order => order.status))];
        const options = statuses.map(status => ({
            value: status,
            text: statusConfig[status]?.text || status
        }));
        return [{ value: 'Todos', text: 'Todos' }, ...options];
    }, [ordersToDisplay]);

    const filteredAndSortedOrders = useMemo(() => {
        return (ordersToDisplay || []).filter(order => {
            const filterId = filters.id.trim();
            const filterClient = filters.client.trim().toLowerCase();
            const filterParts = filters.parts_used.trim().toLowerCase();
            const orderStatus = order.status;

            if (filterId && order.id.toString() !== filterId) return false;
            if (filterClient && !order.customer.name.toLowerCase().includes(filterClient)) return false;
            if (filters.device_type !== 'Todos' && order.device.type !== filters.device_type) return false;
            if (filters.status !== 'Todos' && orderStatus !== filters.status) return false;
            if (filters.technician !== 'Todos' && order.assignedTechnician.name !== filters.technician) return false;
            if (filterParts && !order.parts_used.toLowerCase().includes(filterParts)) return false;
            return true;
        });
    }, [ordersToDisplay, filters]);

    // NUEVO: Órdenes del usuario actual (para móvil)
    const myOrders = useMemo(() => {
        return (filteredAndSortedOrders || []).filter(order => {
            const techUsername = typeof order.technician === 'string'
                ? order.technician
                : order.technician?.username;
            const techId = typeof order.technician === 'object' ? order.technician?.id : undefined;
            return (
                techUsername === currentUser?.username ||
                (techId && currentUser?.id && techId === currentUser.id)
            );
        });
    }, [filteredAndSortedOrders, currentUser]);

    // NUEVO: Órdenes sin tomar (unassigned)
    const unassignedOrders = useMemo(() => {
        return (filteredAndSortedOrders || []).filter(order => {
            const assignedName = order?.assignedTechnician?.name ?? order?.technician ?? 'No asignado';
            return !assignedName || assignedName === 'No asignado';
        });
    }, [filteredAndSortedOrders]);

    // NUEVO: Lista para móvil: solo sin tomar + mis órdenes (sin duplicados)
    const mobileOrders = useMemo(() => {
        const map = new Map();
        [...unassignedOrders, ...myOrders].forEach(o => map.set(o.id, o));
        return Array.from(map.values());
    }, [unassignedOrders, myOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => setFilters(initialFilters);

    const selectedStatusClass = useMemo(() => {
        if (filters.status === 'Todos' || !statusConfig[filters.status]) { return 'bg-gray-50'; }
        return statusConfig[filters.status].badge;
    }, [filters.status]);

    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header con botón de nueva orden */}
            <motion.div 
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-gray-800">Órdenes de Reparación</h1>
                <motion.button
                    onClick={onNewOrderClick}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <PlusCircle size={20} />
                    <span>Nueva Orden</span>
                </motion.button>
            </motion.div>

            {/* Filtros */}
            <motion.div 
                className="hidden md:block bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end"
                    variants={containerVariants}
                >
                    <motion.div className="xl:col-span-1" variants={itemVariants}>
                        <FilterInput name="id" label="ID Orden" value={filters.id} onChange={handleFilterChange} />
                    </motion.div>
                    <motion.div className="xl:col-span-2" variants={itemVariants}>
                        <FilterInput name="client" label="Cliente" value={filters.client} onChange={handleFilterChange} />
                    </motion.div>
                    <motion.div className="xl:col-span-1" variants={itemVariants}>
                        <FilterSelect name="device_type" label="Tipo Disp." value={filters.device_type} onChange={handleFilterChange} options={uniqueDeviceTypes.map(d => ({value: d, text: d}))} />
                    </motion.div>
                    <motion.div className="xl:col-span-1" variants={itemVariants}>
                        <FilterSelect name="status" label="Estado" value={filters.status} onChange={handleFilterChange} options={uniqueStatusesOptions} className={selectedStatusClass} />
                    </motion.div>
                    <motion.div className="xl:col-span-1" variants={itemVariants}>
                        <FilterSelect name="technician" label="Técnico" value={filters.technician} onChange={handleFilterChange} options={uniqueTechnicians.map(t => ({value: t, text: t}))} />
                    </motion.div>
                    <motion.div className="xl:col-span-1" variants={itemVariants}>
                        <FilterInput name="parts_used" label="Repuesto" value={filters.parts_used} onChange={handleFilterChange} />
                    </motion.div>
                    <motion.button 
                        onClick={clearFilters} 
                        className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 h-10 transition-colors duration-200"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RotateCcw size={16} /> Limpiar
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Lista móvil (tarjetas) órdenes sin tomar y mis órdenes */}
            <div className="md:hidden space-y-3">
                {mobileOrders.map((order) => (
                    <div key={order.id} className="relative">
                        {permissions.canDeleteOrders && (
                            <button
                                className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                title="Eliminar orden"
                                aria-label="Eliminar orden"
                                onClick={(e) => { e.stopPropagation(); setOrderToDelete(order); }}
                            >
                                <Trash2 className="text-red-600" size={18} />
                            </button>
                        )}
                        <OrderCard order={order} onClick={() => onViewOrderClick(order.id)} />
                    </div>
                ))}

                {mobileOrders.length === 0 && (
                    <motion.div 
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Archive className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin órdenes para mostrar</h3>
                        <p className="mt-1 text-sm text-gray-500">En móvil solo se muestran órdenes sin tomar y las que tú hayas tomado.</p>
                    </motion.div>
                )}
            </div>

            {/* Tabla de órdenes (solo en pantallas medianas y grandes) */}
            <motion.div 
                className="hidden md:block bg-white rounded-lg shadow-md overflow-x-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                            {filteredAndSortedOrders.map((order, index) => {
                                const status = statusConfig[order.status] || statusConfig['Default'];
                                return (
                                    <motion.tr
                                        key={order.id}
                                        variants={tableRowVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        layout
                                        custom={index}
                                        className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer?.name || 'Cliente no especificado'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.device_type?.type_name || 'N/A'} {order.device_model || ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>
                                                {status.icon}
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.technician || 'No asignado'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.cost}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    onClick={() => onViewOrderClick(order.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Ver orden"
                                                >
                                                    <Eye size={16} />
                                                </motion.button>
                                                {permissions.canDeleteOrders && (
                                                    <motion.button
                                                        onClick={() => setOrderToDelete(order)}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Eliminar orden"
                                                    >
                                                        <Trash2 size={16} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>

                {/* Estado vacío */}
                {filteredAndSortedOrders.length === 0 && (
                    <motion.div 
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Archive className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva orden de reparación.</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Modal de confirmación */}
            <ConfirmationModal
                isOpen={!!orderToDelete}
                title="Eliminar Orden"
                message={orderToDelete ? `¿Estás seguro de que quieres eliminar la orden #${orderToDelete.id}? Esta acción no se puede deshacer.` : ""}
                onConfirm={handleConfirmDelete}
                onClose={() => setOrderToDelete(null)}
                isLoading={isLoading}
            />
        </motion.div>
    );
}
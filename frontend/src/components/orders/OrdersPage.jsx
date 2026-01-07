import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Wrench, CheckCircle, AlertTriangle, Clock, RotateCcw, Truck, XCircle, Archive, Eye, Search, MapPin, Printer, ChevronDown } from 'lucide-react';
import { deleteRepairOrder, fetchRepairOrderById } from '../../api/repairOrdersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { OrderCard } from './OrderCard.jsx';
import { OrderPrinter } from './tickets/OrderPrinter';
import { Pagination } from '../shared/Pagination';


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
    // --- MODIFICADO: Añadir datos de paginación ---
    const {
        orders,
        currentUser,
        currentPage,
        totalOrders,
        totalPages,
        pageSize,
        fetchOrdersPage
    } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [printMenu, setPrintMenu] = useState({ isOpen: false, orderId: null, position: { x: 0, y: 0 } });
    const printerRef = useRef();

    const initialFilters = {
        id: '',
        client: '',
        device_type: 'Todos',
        status: 'Todos',
        model: '',
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
            // Recargar la página actual después de eliminar
            await fetchOrdersPage(currentPage);
        } catch (error) {
            console.error("Error al eliminar la orden:", error);
            showToast(error.message || 'No se pudo eliminar la orden', 'error');
        } finally {
            setOrderToDelete(null);
            setIsLoading(false);
        }
    };

    const handlePrintClick = (e, orderId) => {
        e.stopPropagation();
        // Si ya está abierto para esta orden, lo cerramos
        if (printMenu.isOpen && printMenu.orderId === orderId) {
            setPrintMenu({ ...printMenu, isOpen: false });
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setPrintMenu({
            isOpen: true,
            orderId,
            position: {
                x: rect.left,
                y: rect.bottom + 5
            }
        });
    };

    const closePrintMenu = () => setPrintMenu({ ...printMenu, isOpen: false });

    const handlePrintOption = async (order, option) => {
        closePrintMenu();
        try {
            // Fetch complete order data with all fields needed for printing
            const completeOrder = await fetchRepairOrderById(order.id);

            if (printerRef.current) {
                if (option === 'all') {
                    printerRef.current.triggerPrint(completeOrder, { client: true, workshop: true });
                }
                if (option === 'single') {
                    printerRef.current.triggerPrint(completeOrder, { client: true, workshop: false });
                }
            }
        } catch (error) {
            console.error('Error fetching order for printing:', error);
            showToast('Error al cargar los datos de la orden para imprimir', 'error');
        }
    };

    // Handler para cambio de página
    const handlePageChange = async (newPage) => {
        setIsLoading(true);
        await fetchOrdersPage(newPage);
        setIsLoading(false);
    };

    // Los filtros ahora operan sobre la lista de órdenes de la página actual
    const uniqueDeviceTypes = useMemo(() => ['Todos', ...new Set((orders || []).map(order => order.device.type))], [orders]);
    const uniqueStatusesOptions = useMemo(() => {
        const statuses = [...new Set((orders || []).map(order => order.status))];
        const options = statuses.map(status => ({
            value: status,
            text: statusConfig[status]?.text || status
        }));
        return [{ value: 'Todos', text: 'Todos' }, ...options];
    }, [orders]);

    const filteredAndSortedOrders = useMemo(() => {
        return (orders || []).filter(order => {
            const filterId = filters.id.trim();
            const filterClient = filters.client.trim().toLowerCase();
            const filterParts = filters.parts_used.trim().toLowerCase();
            const filterModel = filters.model.trim().toLowerCase();
            const orderStatus = order.status;

            if (filterId && order.id.toString() !== filterId) return false;
            if (filterClient && !order.customer.name.toLowerCase().includes(filterClient)) return false;
            if (filters.device_type !== 'Todos' && order.device.type !== filters.device_type) return false;
            if (filters.status !== 'Todos' && orderStatus !== filters.status) return false;
            if (filterModel && !order.device.model?.toLowerCase().includes(filterModel)) return false;
            if (filterParts && !order.parts_used.toLowerCase().includes(filterParts)) return false;
            return true;
        });
    }, [orders, filters]);

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
            <OrderPrinter ref={printerRef} />

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

            <motion.div
                className="hidden md:block bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Número de orden</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="id"
                                value={filters.id}
                                onChange={handleFilterChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Buscar por N° de orden"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <FilterInput name="client" label="Cliente" value={filters.client} onChange={handleFilterChange} />
                    </div>
                    <div className="w-48">
                        <FilterSelect name="device_type" label="Tipo Disp." value={filters.device_type} onChange={handleFilterChange} options={uniqueDeviceTypes.map(d => ({ value: d, text: d }))} />
                    </div>
                    <div className="flex-1">
                        <FilterInput name="model" label="Modelo" value={filters.model} onChange={handleFilterChange} />
                    </div>
                    <div className="w-48">
                        <FilterSelect name="status" label="Estado" value={filters.status} onChange={handleFilterChange} options={uniqueStatusesOptions} className={selectedStatusClass} />
                    </div>
                    <div className="flex-1">
                        <FilterInput name="parts_used" label="Repuesto" value={filters.parts_used} onChange={handleFilterChange} />
                    </div>
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                        title="Limpiar filtros"
                    >
                        Limpiar
                    </button>
                </div>
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
                className="hidden md:block bg-white rounded-lg shadow-md overflow-x-auto min-h-[400px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24">Acciones</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th> */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repuesto</th>
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
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white z-10">
                                            <div className="flex items-center gap-2 relative">
                                                <motion.button
                                                    onClick={() => onViewOrderClick(order.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Ver orden"
                                                >
                                                    <Eye size={18} />
                                                </motion.button>

                                                {/* Print Button with Dropdown */}
                                                <div className="relative">
                                                    <motion.button
                                                        onClick={(e) => handlePrintClick(e, order.id)}
                                                        className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${printMenu.orderId === order.id && printMenu.isOpen ? 'text-gray-900' : ''}`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Imprimir"
                                                    >
                                                        <Printer size={18} />
                                                    </motion.button>
                                                </div>

                                                {permissions.canDeleteOrders && (
                                                    <motion.button
                                                        onClick={() => setOrderToDelete(order)}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Eliminar orden"
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{order.id}</td>
                                        {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]" title={order.branch?.branch_name || 'N/A'}>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span className="truncate">{order.branch?.branch_name || 'N/A'}</span>
                                            </div>
                                        </td> */}
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[150px]" title={order.customer?.name || 'Cliente no especificado'}>
                                            {order.customer?.name || 'Cliente no especificado'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[120px]" title={order.device?.type || 'N/A'}>
                                            {order.device?.type || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[120px]" title={order.device?.model || ''}>
                                            {order.device?.model || ''}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>
                                                {status.icon}
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${order.cost}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[150px]" title={order.parts_used || 'N/A'}>
                                            {order.parts_used || 'N/A'}
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

                {/* Paginación */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalOrders}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />
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

            {/* Menú de Impresión Flotante (Portal-like) */}
            <AnimatePresence>
                {printMenu.isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={closePrintMenu} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.1 }}
                            className="fixed z-50 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden w-48"
                            style={{
                                top: printMenu.position.y,
                                left: printMenu.position.x
                            }}
                        >
                            <button
                                onClick={() => handlePrintOption(orders.find(o => o.id === printMenu.orderId), 'all')}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Printer size={16} />
                                Imprimir Todo (2 Copias)
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                                onClick={() => handlePrintOption(orders.find(o => o.id === printMenu.orderId), 'single')}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Printer size={16} />
                                Imprimir 1 Ticket
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// frontend/src/components/OrdersPage.jsx

// --- INICIO DE LA CORRECCIÓN ---
// Se combinaron las dos importaciones de 'react' en una sola línea correcta.
import React, { useState, useMemo, useEffect } from 'react';
// --- FIN DE LA CORRECCIÓN ---
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Wrench, CheckCircle, AlertTriangle, Clock, RotateCcw, Truck, XCircle, Archive } from 'lucide-react';
import { fetchRepairOrders } from '../api/repairOrdersApi';

// Objeto de Estilos y Traducciones Centralizado
const statusConfig = {
    'Pending': { text: 'Pendiente', badge: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} className="text-red-600" /> },
    'In Process': { text: 'En Proceso', badge: 'bg-yellow-100 text-yellow-800', icon: <Wrench size={14} className="text-yellow-600" /> },
    'Completed': { text: 'Completado', badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="text-green-600" /> },
    'Cancelled': { text: 'Cancelado', badge: 'bg-gray-200 text-gray-800', icon: <XCircle size={14} className="text-gray-600" /> },
    'Delivered': { text: 'Entregado', badge: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} className="text-indigo-600" /> },
    'Waiting for parts': { text: 'Esperando Repuesto', badge: 'bg-blue-100 text-blue-800', icon: <Clock size={14} className="text-blue-600" /> },
    'Default': { text: 'Desconocido', badge: 'bg-gray-100 text-gray-800', icon: <Archive size={14} className="text-gray-600" /> }
};

const FilterInput = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
    </div>
);

const FilterSelect = ({ label, name, value, onChange, options, className = '' }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${className}`}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.text}
                </option>
            ))}
        </select>
    </div>
);

export function OrdersPage({ onNewOrderClick }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const initialFilters = {
        id: '',
        client: '',
        device_type: 'Todos',
        status: 'Todos',
        technician: 'Todos',
        parts_used: ''
    };
    const [filters, setFilters] = useState(initialFilters);

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

    const uniqueTechnicians = useMemo(() => ['Todos', ...new Set(orders.map(order => order.assignedTechnician.name))], [orders]);
    const uniqueDeviceTypes = useMemo(() => ['Todos', ...new Set(orders.map(order => order.device.type))], [orders]);

    const uniqueStatusesOptions = useMemo(() => {
        const statuses = [...new Set(orders.map(order => order.status))];
        const options = statuses.map(status => ({
            value: status,
            text: statusConfig[status]?.text || status
        }));
        return [{ value: 'Todos', text: 'Todos' }, ...options];
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
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
    }, [orders, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => setFilters(initialFilters);

    const selectedStatusClass = useMemo(() => {
        if (filters.status === 'Todos' || !statusConfig[filters.status]) {
            return 'bg-gray-50';
        }
        return statusConfig[filters.status].badge;
    }, [filters.status]);

    return (
    <>
      <div className="flex justify-between items-center mb-6">
        <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Gestión de Órdenes
        </motion.h1>
        <motion.button onClick={onNewOrderClick} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <PlusCircle size={20} />
          <span>Crear Nueva Orden</span>
        </motion.button>
      </div>

      <motion.div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
            <div className="xl:col-span-1"><FilterInput name="id" label="N° Orden" value={filters.id} onChange={handleFilterChange} /></div>
            <div className="xl:col-span-2"><FilterInput name="client" label="Cliente" value={filters.client} onChange={handleFilterChange} /></div>
            <div className="xl:col-span-1"><FilterSelect name="device_type" label="Tipo Disp." value={filters.device_type} onChange={handleFilterChange} options={uniqueDeviceTypes.map(d => ({value: d, text: d}))} /></div>
            <div className="xl:col-span-1"><FilterSelect name="status" label="Estado" value={filters.status} onChange={handleFilterChange} options={uniqueStatusesOptions} className={selectedStatusClass} /></div>
            <div className="xl:col-span-1"><FilterSelect name="technician" label="Técnico" value={filters.technician} onChange={handleFilterChange} options={uniqueTechnicians.map(t => ({value: t, text: t}))} /></div>
            <div className="xl:col-span-1"><FilterInput name="parts_used" label="Repuesto" value={filters.parts_used} onChange={handleFilterChange} /></div>
            <button onClick={clearFilters} className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 h-10">
                <RotateCcw size={16} /> Limpiar
            </button>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-lg shadow-md overflow-x-auto" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Cliente</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Dispositivo</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Repuesto</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Estado</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Técnico</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
            {isLoading ? (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Cargando órdenes...</td></tr>
            ) : filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const currentStatus = statusConfig[order.status] || statusConfig['Default'];
              return (
                <motion.tr key={order.id} className="border-b border-gray-200 hover:bg-indigo-50/50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                  <td className="p-4 font-mono text-sm text-indigo-600">{order.id}</td>
                  <td className="p-4 text-sm text-gray-800">{order.customer.name}</td>
                  <td className="p-4 text-sm text-gray-600">{`${order.device.type} ${order.device.model}`}</td>
                  <td className="p-4 text-sm text-gray-600">{order.parts_used}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${currentStatus.badge}`}>
                      {currentStatus.icon} {currentStatus.text}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{order.assignedTechnician.name}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-indigo-600"><Edit size={18} /></button>
                        <button className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan="7" className="text-center p-8 text-gray-500">
                        <p className="font-semibold">No se encontraron órdenes</p>
                        <p className="text-sm">Intenta ajustar tus filtros de búsqueda.</p>
                    </td>
                </motion.tr>
            )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </>
  );
}
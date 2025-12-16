import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ListOrdered, UserCircle2, Building2, Calendar, Loader, RotateCcw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { getUsers } from '../../api/userApi';
import { fetchRecords } from '../../api/recordsApi';

const EVENT_TYPES = [
    { value: '', label: 'Todos' },
    { value: 'Creación de orden', label: 'Creación de orden' },
    { value: 'Cambio de estado', label: 'Cambio de estado' },
    { value: 'Transferencia de orden', label: 'Transferencia de orden' },
];

const TYPE_LABELS = {
    'Order creation': 'Creación de orden',
    'Order_status_change': 'Cambio de estado',
    'Order transfer': 'Transferencia de orden',
};

export function RecordsPage({ onViewOrderClick }) {
    const { branches } = useAuth();
    const permissions = usePermissions();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ type: '', user_id: '', branch_id: '', order_id: '' });

    const branchOptions = useMemo(() => [{ id: '', branch_name: 'Todas' }, ...branches], [branches]);

    useEffect(() => {
        (async () => {
            try {
                const allUsers = await getUsers('all');
                setUsers(allUsers);
            } catch (e) { }
        })();
    }, []);

    const loadRecords = async () => {
        setIsLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.user_id) params.user_id = filters.user_id;
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.order_id) params.order_id = filters.order_id;
            const data = await fetchRecords(params);
            setRecords(data);
        } catch (e) {
            setError('No se pudieron cargar los registros.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadRecords(); }, []);
    useEffect(() => {
        const t = setTimeout(() => { loadRecords(); }, 300);
        return () => clearTimeout(t);
    }, [filters]);

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const handleApplyFilters = () => loadRecords();

    if (!permissions.canViewRecords) return <div className="p-6">No autorizado.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Registros</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-4">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Número de orden</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filters.order_id}
                                onChange={(e) => handleFilterChange('order_id', e.target.value)}
                                placeholder="Buscar por N° de orden"
                            />
                        </div>
                    </div>
                    <div className="w-48">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                        <select className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm h-10" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
                            {EVENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="w-48">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                        <select className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm h-10" value={filters.user_id} onChange={(e) => handleFilterChange('user_id', e.target.value)}>
                            <option value="">Todos</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </select>
                    </div>
                    <div className="w-48">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sucursal</label>
                        <select className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm h-10" value={filters.branch_id} onChange={(e) => handleFilterChange('branch_id', e.target.value)}>
                            {branchOptions.map(b => <option key={b.id || 'all'} value={b.id || ''}>{b.branch_name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => setFilters({ type: '', user_id: '', branch_id: '', order_id: '' })}
                        className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                        title="Limpiar filtros"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {isLoading && <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-600" size={32} /></div>}
                {error && <p className="text-center text-red-500 p-4">{error}</p>}
                {!isLoading && !error && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {records.map(r => (
                                    <motion.tr 
                                        key={r.id} 
                                        layout 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        onClick={() => r.order_id && onViewOrderClick && onViewOrderClick(r.order_id)}
                                        className={r.order_id ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(r.created_at))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className="font-medium text-gray-900">{TYPE_LABELS[r.event_type] || r.event_type}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{r.order_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{(users.find(u => u.id === r.actor_user_id)?.username) || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{(users.find(u => u.id === r.actor_user_id)?.branch?.branch_name) || r.origin_branch_id || r.target_branch_id || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{r.description || ''}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

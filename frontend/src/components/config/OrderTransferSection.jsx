import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Search, Building2, Package, AlertTriangle, CheckCircle, Clock, Wrench, XCircle, Truck, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { transferRepairOrder, fetchRepairOrders } from '../../api/repairOrdersApi';
import { TransferAnimation } from './TransferAnimation';
import ChecklistQuestionsSection from './ChecklistQuestionsSection';

const statusConfig = {
    'Pending': { text: 'Pendiente', badge: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} className="text-red-600" /> },
    'In Process': { text: 'En Proceso', badge: 'bg-yellow-100 text-yellow-800', icon: <Wrench size={14} className="text-yellow-600" /> },
    'Completed': { text: 'Completado', badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="text-green-600" /> },
    'Cancelled': { text: 'Cancelado', badge: 'bg-gray-200 text-gray-800', icon: <XCircle size={14} className="text-gray-600" /> },
    'Delivered': { text: 'Entregado', badge: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} className="text-indigo-600" /> },
    'Waiting for parts': { text: 'Esperando Repuesto', badge: 'bg-blue-100 text-blue-800', icon: <Clock size={14} className="text-blue-600" /> },
};

export const OrderTransferSection = () => {
    const { branches, currentUser } = useAuth();
    const { showToast } = useToast();
    const role = (currentUser?.role?.role_name || '').toLowerCase();
    const isReceptionist = ['receptionist', 'recepcionist', 'recepcionista'].includes(role);

    const [activeTab, setActiveTab] = useState('transfer');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const transferTimerRef = useRef(null);

    // Estado para órdenes
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Cargar órdenes
    const loadOrders = async () => {
        setIsLoadingOrders(true);
        try {
            // Cargar todas las órdenes disponibles (sin filtros de paginación estricta)
            const response = await fetchRepairOrders(1, 100); // Cargar las primeras 100 órdenes
            setOrders(response.items || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Error al cargar órdenes', 'error');
        } finally {
            setIsLoadingOrders(false);
        }
    };

    // Cargar órdenes al montar y escuchar eventos WebSocket
    useEffect(() => {
        loadOrders();

        const handleOrderUpdate = () => loadOrders();
        window.addEventListener('orderUpdate', handleOrderUpdate);
        return () => window.removeEventListener('orderUpdate', handleOrderUpdate);
    }, []);

    // Resetear sucursal seleccionada cuando cambie la orden
    useEffect(() => {
        setSelectedBranch('');
    }, [selectedOrder]);



    // Filtrar órdenes que se pueden transferir (completadas, pendientes, en proceso)
    const transferableOrders = useMemo(() => {
        if (!orders) {
            return [];
        }

        return orders.filter(order => {
            // Si es recepcionista, solo puede transferir órdenes de su propia sucursal
            if (isReceptionist && currentUser?.branch?.id) {
                if (String(order.branch_id) !== String(currentUser.branch.id)) {
                    return false;
                }
            }

            const status = order.status; // En mapOrderData, status es directamente el string
            const isTransferable = status !== 'Delivered' && status !== 'Cancelled';

            const matchesSearch = searchTerm === '' ||
                order.id.toString().includes(searchTerm) ||
                order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.device?.model?.toLowerCase().includes(searchTerm.toLowerCase());

            return isTransferable && matchesSearch;
        });
    }, [orders, searchTerm]);

    // Obtener sucursales disponibles para transferir (excluyendo la sucursal actual de la orden)
    const availableBranches = useMemo(() => {
        if (!branches || branches.length === 0) {
            return [];
        }

        // Si no hay orden seleccionada, mostrar todas las sucursales
        if (!selectedOrder) {
            return branches;
        }

        // Excluir la sucursal actual de la orden seleccionada
        return branches.filter(branch => {
            const branchId = String(branch.id);
            const orderBranchId = String(selectedOrder.branch_id);
            return branchId !== orderBranchId;
        });
    }, [branches, selectedOrder]);



    const handleTransferOrder = async () => {
        if (!selectedOrder || !selectedBranch) {
            showToast('Por favor selecciona una orden y una sucursal destino', 'error');
            return;
        }

        // Validar que no se esté transfiriendo a la misma sucursal
        if (String(selectedOrder.branch_id) === String(selectedBranch)) {
            showToast('No se puede transferir una orden a la misma sucursal donde ya se encuentra', 'error');
            return;
        }

        setShowAnimation(true);

        // Pequeño delay para mostrar el estado inicial, controlado para evitar condiciones de carrera
        if (transferTimerRef.current) {
            clearTimeout(transferTimerRef.current);
        }
        transferTimerRef.current = setTimeout(() => {
            setIsTransferring(true);
            transferTimerRef.current = null;
        }, 300);

        try {
            await transferRepairOrder(selectedOrder.id, parseInt(selectedBranch));
            // La animación manejará la finalización a través del callback onCompleted
        } catch (error) {
            console.error('Error al transferir orden:', error);
            showToast(error.message || 'Error al transferir la orden', 'error');
            setShowAnimation(false);
        } finally {
            // Evitar que un timeout atrasado vuelva a poner isTransferring en true
            if (transferTimerRef.current) {
                clearTimeout(transferTimerRef.current);
                transferTimerRef.current = null;
            }
            setIsTransferring(false);
        }
    };

    const getOrderBranchName = (order) => {
        // Si tenemos tanto branch_id como branch.id, y coinciden, usar branch.branch_name
        const mappedBranchId = order?.branch_id != null ? String(order.branch_id) : null;
        const relatedBranchId = order?.branch?.id != null ? String(order.branch.id) : null;

        if (mappedBranchId && relatedBranchId && mappedBranchId === relatedBranchId && order.branch?.branch_name) {
            return order.branch.branch_name;
        }

        // En otros casos (relación desactualizada o ausente), buscar en la lista global de sucursales
        const branch = branches?.find(b => String(b.id) === mappedBranchId);
        return branch?.branch_name || 'Sucursal desconocida';
    };

    const getTargetBranchName = () => {
        const branch = branches?.find(b => b.id === parseInt(selectedBranch));
        return branch?.branch_name || 'Sucursal destino';
    };



    const tabs = [
        {
            id: 'transfer',
            name: 'Traslado de Órdenes',
            icon: <ArrowRightLeft className="h-5 w-5" />
        },
        // Solo mostrar tab de checklist si NO es recepcionista
        ...(!isReceptionist ? [{
            id: 'checklist',
            name: 'Preguntas del Checklist',
            icon: <ClipboardList className="h-5 w-5" />
        }] : [])
    ];

    return (
        <div className="space-y-6">
            {/* Header con tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido del tab activo */}
            {activeTab === 'transfer' && (
                <>
                    {/* Animación de transferencia */}
                    <AnimatePresence>
                        {showAnimation && selectedOrder && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex justify-center mb-6"
                            >
                                <TransferAnimation
                                    status={isTransferring ? 'transferring' : (showAnimation ? 'completed' : 'idle')}
                                    fromBranch={getOrderBranchName(selectedOrder)}
                                    toBranch={getTargetBranchName()}
                                    onCompleted={() => {
                                        showToast(`Orden #${selectedOrder.id} transferida exitosamente`, 'success');
                                        setSelectedOrder(null);
                                        setSelectedBranch('');
                                        setShowAnimation(false);
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showAnimation && !isTransferring && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Panel de selección de orden */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Seleccionar Orden</h3>

                                {/* Buscador */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID, modelo o cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Lista de órdenes */}
                                <div
                                    className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide px-2 py-2"
                                    style={{
                                        scrollbarWidth: 'none', /* Firefox */
                                        msOverflowStyle: 'none' /* IE and Edge */
                                    }}
                                >
                                    {transferableOrders.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes disponibles para transferir'}
                                        </p>
                                    ) : (
                                        transferableOrders.map((order) => (
                                            <motion.div
                                                key={order.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedOrder?.id === order.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-gray-800">#{order.id}</span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[order.status]?.badge || 'bg-gray-100 text-gray-800'}`}>
                                                                {statusConfig[order.status]?.text || order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{order.device?.type || 'N/A'} {order.device?.model || ''}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {order.customer?.name || 'Cliente no especificado'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">{getOrderBranchName(order)}</p>
                                                        {order.assignedTechnician && (
                                                            <p className="text-xs text-gray-400">
                                                                Técnico: {order.assignedTechnician.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Panel de configuración de transferencia */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Configurar Transferencia</h3>

                                {selectedOrder ? (
                                    <div className="space-y-4">
                                        {/* Información de la orden seleccionada */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-800 mb-2">Orden Seleccionada</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="font-medium">ID:</span> #{selectedOrder.id}</p>
                                                <p><span className="font-medium">Dispositivo:</span> {selectedOrder.device?.type || 'N/A'} {selectedOrder.device?.model || ''}</p>
                                                <p><span className="font-medium">Cliente:</span> {selectedOrder.customer?.name || 'Cliente no especificado'}</p>
                                                <p><span className="font-medium">Estado:</span> {statusConfig[selectedOrder.status]?.text}</p>
                                                <p><span className="font-medium">Sucursal actual:</span> {getOrderBranchName(selectedOrder)}</p>
                                                {selectedOrder.assignedTechnician && (
                                                    <p><span className="font-medium">Técnico:</span> {selectedOrder.assignedTechnician.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Advertencia para órdenes en proceso */}
                                        {selectedOrder.status?.status_name === 'In Process' && (
                                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-yellow-800">Advertencia</p>
                                                        <p className="text-sm text-yellow-700">
                                                            Esta orden está en proceso. Al transferirla, se desasignará del técnico actual
                                                            y cambiará a estado "Pendiente" en la sucursal destino.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Selector de sucursal destino */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sucursal Destino
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                <select
                                                    value={selectedBranch}
                                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar sucursal...</option>
                                                    {availableBranches.map((branch) => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.branch_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Botón de transferencia */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleTransferOrder}
                                            disabled={!selectedBranch || isTransferring}
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${!selectedBranch || isTransferring
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                        >
                                            {isTransferring ? 'Transfiriendo...' : 'Transferir Orden'}
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Selecciona una orden para configurar la transferencia</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {/* Tab de Preguntas del Checklist */}
            {activeTab === 'checklist' && (
                <ChecklistQuestionsSection />
            )}
        </div>
    );
};
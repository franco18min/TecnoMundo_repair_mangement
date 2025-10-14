import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Edit, Loader, Building2, Eye, Settings, Ticket, Edit3, AlertCircle, Palette, User, Wrench } from 'lucide-react';
import { fetchBranches } from '../../api/branchApi';
import { useToast } from '../../context/ToastContext';
import { TicketStyleModal } from './TicketStyleModal';
import { TicketBodyModal } from './TicketBodyModal';
import { TicketBodyStyleModal } from './TicketBodyStyleModal';

export const TicketConfigSection = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTicketStyleModalOpen, setIsTicketStyleModalOpen] = useState(false);
    const [isGlobalHeaderStyleModalOpen, setIsGlobalHeaderStyleModalOpen] = useState(false);
    const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);
    const [isBodyStyleModalOpen, setIsBodyStyleModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [bodyTicketType, setBodyTicketType] = useState('client');
    const [bodyStyleTicketType, setBodyStyleTicketType] = useState('client');
    const [isGlobalBodyModal, setIsGlobalBodyModal] = useState(false);
    const [isGlobalBodyStyleModal, setIsGlobalBodyStyleModal] = useState(false);
    const [styleTicketType, setStyleTicketType] = useState('client');
    const [globalHeaderStyleTicketType, setGlobalHeaderStyleTicketType] = useState('client');
    const { showToast } = useToast();

    const loadBranches = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchBranches();
            setBranches(data);
        } catch (err) {
            setError('Error al cargar las sucursales');
            console.error('Error loading branches:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const handleOpenTicketStyleModal = (branch, ticketType) => {
        setSelectedBranch(branch);
        setStyleTicketType(ticketType);
        setIsTicketStyleModalOpen(true);
    };

    const handleCloseTicketStyleModal = () => {
        setIsTicketStyleModalOpen(false);
        setSelectedBranch(null);
        setStyleTicketType('client');
    };

    const handleOpenBodyModal = (ticketType) => {
        setBodyTicketType(ticketType);
        setIsBodyModalOpen(true);
        setIsGlobalBodyModal(false);
    };

    const handleCloseBodyModal = () => {
        setIsBodyModalOpen(false);
        setBodyTicketType('client');
        setIsGlobalBodyModal(false);
    };

    const handleOpenBodyStyleModal = (ticketType) => {
        setBodyStyleTicketType(ticketType);
        setIsBodyStyleModalOpen(true);
        setIsGlobalBodyStyleModal(false);
    };

    const handleCloseBodyStyleModal = () => {
        setIsBodyStyleModalOpen(false);
        setBodyStyleTicketType('client');
        setIsGlobalBodyStyleModal(false);
    };

    // Funciones específicas para modales globales
    const handleOpenGlobalBodyModal = (ticketType) => {
        setBodyTicketType(ticketType);
        setIsBodyModalOpen(true);
        setIsGlobalBodyModal(true);
    };

    const handleOpenGlobalBodyStyleModal = (ticketType) => {
        setBodyStyleTicketType(ticketType);
        setIsBodyStyleModalOpen(true);
        setIsGlobalBodyStyleModal(true);
    };

    const handleOpenGlobalHeaderStyleModal = (ticketType) => {
        setGlobalHeaderStyleTicketType(ticketType);
        setIsGlobalHeaderStyleModalOpen(true);
    };

    const handleCloseGlobalHeaderStyleModal = () => {
        setIsGlobalHeaderStyleModalOpen(false);
        setGlobalHeaderStyleTicketType('client');
    };

    const handleSaveTicketStyle = (styleConfig) => {
        // En una implementación real, esto se guardaría en la API
        console.log('Estilo de ticket guardado:', styleConfig);
    };

    const getIconComponent = (iconName) => {
        const iconMap = {
            'Building': Building2,
            'Building2': Building2,
            'Store': Building2,
            'MapPin': Building2,
            'Home': Building2,
            'Globe': Building2
        };
        const IconComponent = iconMap[iconName] || Building2;
        return <IconComponent size={16} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader size={32} className="animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Cargando configuración de tickets...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <AlertCircle size={32} className="text-red-500" />
                <span className="ml-3 text-red-600">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Configuración Global de Cuerpo de Tickets */}
            <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Ticket size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Contenido de Tickets (Global)
                            </h3>
                            <p className="text-sm text-gray-600">
                                Edita el contenido del cuerpo de los tickets (aplica a todas las sucursales)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Ticket de Cliente
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Contenido que verán los clientes
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalBodyModal('client')}
                                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit size={16} />
                                        <span className="text-sm">Editar Contenido</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Ticket de Taller
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Contenido interno para técnicos
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalBodyModal('workshop')}
                                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit size={16} />
                                        <span className="text-sm">Editar Contenido</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Configuración de Estilo de Cuerpo de Tickets (Global) */}
            <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Edit3 size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Estilo de Cuerpo de Tickets (Global)
                            </h3>
                            <p className="text-sm text-gray-600">
                                Configura los estilos de fuente y formato del cuerpo de los tickets (aplica a todas las sucursales)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Estilo Ticket de Cliente
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Estilos para tickets que verán los clientes
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalBodyStyleModal('client')}
                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit3 size={16} />
                                        <span className="text-sm">Configurar Estilos</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Estilo Ticket de Taller
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Estilos para tickets internos del taller
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalBodyStyleModal('workshop')}
                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit3 size={16} />
                                        <span className="text-sm">Configurar Estilos</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Configuración de Estilo de Cabeceras (Global) */}
            <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Settings size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Estilo de Cabeceras (Global)
                            </h3>
                            <p className="text-sm text-gray-600">
                                Configura los estilos de cabecera para todos los tickets (aplica a todas las sucursales)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Estilo Cabecera de Cliente
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Estilos para cabeceras de tickets que verán los clientes
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalHeaderStyleModal('client')}
                                        className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Settings size={16} />
                                        <span className="text-sm">Configurar Estilos</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">
                                        Estilo Cabecera de Taller
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Estilos para cabeceras de tickets internos del taller
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        onClick={() => handleOpenGlobalHeaderStyleModal('workshop')}
                                        className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Settings size={16} />
                                        <span className="text-sm">Configurar Estilos</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Modales */}
            <TicketStyleModal
                isOpen={isTicketStyleModalOpen}
                onClose={handleCloseTicketStyleModal}
                branch={selectedBranch}
                ticketType={styleTicketType}
                onSave={handleSaveTicketStyle}
            />

            <TicketBodyModal
                isOpen={isBodyModalOpen}
                onClose={handleCloseBodyModal}
                ticketType={bodyTicketType}
                branch={isGlobalBodyModal ? null : (branches.length > 0 ? branches[0] : null)}
                onSave={(content) => {
                    showToast('Configuración de ticket actualizada', 'success');
                }}
            />

            <TicketBodyStyleModal
                isOpen={isBodyStyleModalOpen}
                onClose={handleCloseBodyStyleModal}
                ticketType={bodyStyleTicketType}
                branch={isGlobalBodyStyleModal ? null : (branches.length > 0 ? branches[0] : null)}
                onSave={(styleConfig) => {
                    showToast('Estilos de cuerpo actualizados', 'success');
                }}
            />

            <TicketStyleModal
                isOpen={isGlobalHeaderStyleModalOpen}
                onClose={handleCloseGlobalHeaderStyleModal}
                branch={null} // null indica modo global
                ticketType={globalHeaderStyleTicketType}
                onSave={(styleConfig) => {
                    showToast('Estilos de cabecera globales actualizados', 'success');
                }}
            />
        </div>
    );
};

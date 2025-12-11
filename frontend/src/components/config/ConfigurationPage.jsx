import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BranchConfigSection } from './BranchConfigSection';
import { UserConfigSection } from './UserConfigSection';
import { OrderTransferSection } from './OrderTransferSection';
import { TicketConfigSection } from './TicketConfigSection';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 font-medium text-sm rounded-md transition-colors
            ${isActive
                ? 'text-indigo-700 bg-indigo-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
    >
        {label}
    </button>
);

export const ConfigurationPage = () => {
    const { currentUser } = useAuth();
    const role = (currentUser?.role?.role_name || '').toLowerCase();
    const isReceptionist = ['receptionist', 'recepcionist', 'recepcionista'].includes(role);
    
    // Si es recepcionista, la pestaña por defecto debe ser 'orders'.
    // Si es admin, puede ser 'users'.
    const [activeTab, setActiveTab] = useState(isReceptionist ? 'orders' : 'users'); 

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración</h1>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200">
                    <nav className="flex space-x-2" aria-label="Tabs">
                        {!isReceptionist && (
                            <>
                                <TabButton
                                    label="Usuarios"
                                    isActive={activeTab === 'users'}
                                    onClick={() => setActiveTab('users')}
                                />
                                <TabButton
                                    label="Sucursales"
                                    isActive={activeTab === 'branches'}
                                    onClick={() => setActiveTab('branches')}
                                />
                            </>
                        )}
                        <TabButton
                            label="Órdenes"
                            isActive={activeTab === 'orders'}
                            onClick={() => setActiveTab('orders')}
                        />
                        {!isReceptionist && (
                            <TabButton
                                label="Tickets"
                                isActive={activeTab === 'tickets'}
                                onClick={() => setActiveTab('tickets')}
                            />
                        )}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && !isReceptionist && (
                        <UserConfigSection />
                    )}
                    {activeTab === 'branches' && !isReceptionist && (
                        <BranchConfigSection />
                    )}
                    {activeTab === 'orders' && (
                        <OrderTransferSection />
                    )}
                    {activeTab === 'tickets' && !isReceptionist && (
                        <TicketConfigSection />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
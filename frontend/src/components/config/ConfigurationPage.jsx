import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BranchConfigSection } from './BranchConfigSection';
import { UserConfigSection } from './UserConfigSection';

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
    const [activeTab, setActiveTab] = useState('users'); // 'users' o 'branches'

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
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <UserConfigSection />
                    )}
                    {activeTab === 'branches' && (
                        <BranchConfigSection />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
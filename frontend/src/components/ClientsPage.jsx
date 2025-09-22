// frontend/src/components/ClientsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Loader } from 'lucide-react';
import { getCustomers } from '../api/customerApi';
import { useToast } from '../context/ToastContext';
import { ClientCard } from './ClientCard';
import { ClientModal } from './ClientModal';

export function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        const loadClients = async () => {
            setIsLoading(true);
            try {
                const fetchedClients = await getCustomers();
                setClients(fetchedClients);
            } catch (err) {
                setError('No se pudo cargar la lista de clientes.');
                showToast('Error al cargar clientes', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadClients();
    }, [showToast]);

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setIsModalOpen(false);
    };

    const handleClientUpdated = (updatedClient) => {
        setClients(prevClients =>
            prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
        );
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowercasedTerm = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.first_name.toLowerCase().includes(lowercasedTerm) ||
            client.last_name.toLowerCase().includes(lowercasedTerm) ||
            client.dni.includes(lowercasedTerm)
        );
    }, [clients, searchTerm]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    Gestión de Clientes
                </motion.h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-xs bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <motion.button className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <UserPlus size={20} />
                        <span>Nuevo Cliente</span>
                    </motion.button>
                </div>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-600" size={48} /></div>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!isLoading && !error && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    layout
                >
                    <AnimatePresence>
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <ClientCard key={client.id} client={client} onEdit={handleEditClient} />
                            ))
                        ) : (
                            <p className="text-gray-500 md:col-span-4 text-center">No se encontraron clientes.</p>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <ClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={selectedClient}
                onClientUpdated={handleClientUpdated}
            />
        </>
    );
}
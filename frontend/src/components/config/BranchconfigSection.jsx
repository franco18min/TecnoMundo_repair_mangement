import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Loader, Building2, Phone, Mail } from 'lucide-react';
import { fetchBranches } from '../../api/branchApi';
import { useToast } from '../../context/ToastContext';
import { BranchModal } from './BranchModal';

export const BranchConfigSection = () => {
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const { showToast } = useToast();

    const loadBranches = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedBranches = await fetchBranches();
            setBranches(fetchedBranches);
        } catch (err) {
            setError('No se pudo cargar la lista de sucursales.');
            showToast('Error al cargar sucursales', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const handleOpenModal = (branch = null) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedBranch(null);
        setIsModalOpen(false);
    };

    const handleSave = (savedBranch, mode) => {
        if (mode === 'create') {
            setBranches(prev => [savedBranch, ...prev]);
        } else {
            setBranches(prev => prev.map(b => b.id === savedBranch.id ? savedBranch : b));
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Sucursales</h2>
                <motion.button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <PlusCircle size={20} />
                    <span>Nueva Sucursal</span>
                </motion.button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {isLoading && <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-600" size={32} /></div>}
                {error && <p className="text-center text-red-500 p-4">{error}</p>}
                {!isLoading && !error && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Editar</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {branches.map(branch => (
                                    <motion.tr
                                        key={branch.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Building2 size={16} className="text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-900">{branch.branch_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {branch.company_name || 'No especificado'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {branch.address || 'No especificado'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            <div className="space-y-1">
                                                {branch.phone && (
                                                    <div className="flex items-center text-sm">
                                                        <Phone size={12} className="text-gray-400 mr-1" />
                                                        {branch.phone}
                                                    </div>
                                                )}
                                                {branch.email && (
                                                    <div className="flex items-center text-sm">
                                                        <Mail size={12} className="text-gray-400 mr-1" />
                                                        {branch.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleOpenModal(branch)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
                 {!isLoading && branches.length === 0 && (
                    <div className="text-center text-gray-500 p-8">
                        <Building2 size={40} className="mx-auto text-gray-400 mb-2" />
                        No hay sucursales registradas.
                    </div>
                )}
            </div>

            <BranchModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                branch={selectedBranch}
                onSave={handleSave}
            />
        </>
    );
};
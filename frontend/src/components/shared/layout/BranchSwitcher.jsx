// frontend/src/components/layout/BranchSwitcher.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext'; // RUTA CORREGIDA
import { Building, Globe, ChevronDown } from 'lucide-react';

export function BranchSwitcher() {
    const { currentUser, branches, selectedBranchId, setSelectedBranchId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Verificaciones después de todos los hooks
    const isAdmin = currentUser?.role?.role_name === 'Administrator';
    
    // No mostrar el switcher si no es admin o si no hay sucursales cargadas.
    if (!isAdmin || branches.length === 0) {
        return null;
    }

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(branchId === 'all' ? 'all' : Number(branchId));
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectedBranch = selectedBranchId === 'all' 
        ? { branch_name: 'Todas las Sucursales', icon: Globe }
        : branches.find(b => b.id === selectedBranchId) || { branch_name: 'Seleccionar...', icon: Building };

    const dropdownOptions = [
        { id: 'all', branch_name: 'Todas las Sucursales', icon: Globe },
        ...branches
    ];

    return (
        <motion.div 
            ref={dropdownRef}
            className="px-3 py-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <motion.label 
                className="block text-xs font-medium text-gray-600 mb-1 cursor-pointer"
                animate={{ 
                    color: isOpen ? "#4f46e5" : "#6b7280"
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={toggleDropdown}
            >
                Sucursal ({dropdownOptions.length})
            </motion.label>
            
            <div className="relative">
                <motion.div 
                    whileHover={{ y: -1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 35 }}
                >
                    {/* Botón principal del dropdown */}
                    <motion.button
                        onClick={toggleDropdown}
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-150 cursor-pointer hover:border-gray-300 hover:shadow-sm text-left"
                        animate={{
                            borderColor: isOpen ? "#4f46e5" : "#e5e7eb",
                            boxShadow: isOpen ? "0 0 0 1px #4f46e5" : "none"
                        }}
                        transition={{ duration: 0.15 }}
                    >
                        {selectedBranch.branch_name}
                    </motion.button>

                    {/* Icono izquierdo */}
                    <motion.div 
                        className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"
                        animate={{ 
                            color: isOpen ? "#4f46e5" : "#9ca3af"
                        }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <motion.div
                            key={selectedBranchId}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 600, damping: 35 }}
                        >
                            {selectedBranchId === 'all' ? 
                                <Globe size={15} className="text-current" /> : 
                                <Building size={15} className="text-current" />
                            }
                        </motion.div>
                    </motion.div>

                    {/* Flecha derecha */}
                    <motion.div 
                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10"
                        animate={{ 
                            rotate: isOpen ? 180 : 0,
                            color: isOpen ? "#4f46e5" : "#9ca3af"
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ChevronDown size={14} className="text-current" />
                    </motion.div>
                </motion.div>

                {/* Lista desplegable - Posicionada de forma absoluta para superponerse */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] overflow-hidden"
                            style={{ 
                                position: 'absolute',
                                top: '100%',
                                left: '12px',
                                right: '12px',
                                marginTop: '4px'
                            }}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ 
                                duration: 0.2, 
                                ease: "easeOut",
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }}
                        >
                            <motion.div
                                className="max-h-60 overflow-y-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.15 }}
                            >
                                {dropdownOptions.map((option, index) => {
                                    const isSelected = option.id === selectedBranchId || 
                                                    (option.id !== 'all' && option.id === selectedBranchId);
                                    const IconComponent = option.id === 'all' ? Globe : Building;
                                    
                                    return (
                                        <motion.button
                                            key={option.id}
                                            onClick={() => handleBranchSelect(option.id)}
                                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 ${
                                                isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                                            }`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ 
                                                delay: index * 0.05,
                                                duration: 0.15,
                                                ease: "easeOut"
                                            }}
                                            whileHover={{ 
                                                backgroundColor: isSelected ? "#eef2ff" : "#f9fafb",
                                                x: 2
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <IconComponent 
                                                size={14} 
                                                className={isSelected ? "text-indigo-600" : "text-gray-400"} 
                                            />
                                            <span>{option.branch_name}</span>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Indicador de sucursal seleccionada */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mt-1 text-xs text-indigo-600 font-medium"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        {selectedBranch.branch_name}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
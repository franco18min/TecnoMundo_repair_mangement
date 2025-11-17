// frontend/src/components/layout/BranchSwitcher.jsx

import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext'; // RUTA CORREGIDA
import { Building, ChevronDown } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { SidebarContext } from './Sidebar';

export function BranchSwitcher() {
    const { currentUser, branches, selectedBranchId, setSelectedBranchId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const { expanded } = useContext(SidebarContext);
    const { canSwitchBranch } = usePermissions();
    
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

    // No mostrar el switcher si no tiene permiso o si no hay sucursales cargadas.
    if (!canSwitchBranch || branches.length === 0) {
        return null;
    }

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(Number(branchId));
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            
            // Calcular posición y ancho del dropdown
            let dropdownLeft = rect.left;
            let dropdownWidth = expanded ? rect.width : 200; // Ancho fijo cuando está contraído
            
            // Si el sidebar está contraído, ajustar posición para que no se corte
            if (!expanded) {
                // Posicionar el dropdown a la derecha del botón
                dropdownLeft = rect.right + 8;
                
                // Verificar si se sale de la pantalla por la derecha
                if (dropdownLeft + dropdownWidth > window.innerWidth) {
                    dropdownLeft = rect.left - dropdownWidth - 8; // Posicionar a la izquierda
                }
            }
            
            setDropdownPosition({
                top: rect.bottom + 4,
                left: dropdownLeft,
                width: dropdownWidth
            });
        }
        setIsOpen(!isOpen);
    };

    const selectedBranch = branches.find(b => b.id === selectedBranchId) || { branch_name: 'Seleccionar...', icon: Building };

    const dropdownOptions = [...branches];

    return (
        <motion.div 
            ref={dropdownRef}
            className="px-3 py-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <motion.label 
                className="block text-xs font-medium text-gray-600 mb-1 cursor-pointer overflow-hidden"
                animate={{ 
                    color: isOpen ? "#4f46e5" : "#6b7280",
                    opacity: expanded ? 1 : 0,
                    height: expanded ? "auto" : 0,
                    marginBottom: expanded ? 4 : 0
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
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
                        ref={buttonRef}
                        onClick={toggleDropdown}
                        className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-150 cursor-pointer hover:border-gray-300 hover:shadow-sm ${expanded ? 'pl-9 pr-8 text-left' : 'px-2 text-center flex items-center justify-center'}`}
                        animate={{
                            borderColor: isOpen ? "#4f46e5" : "#e5e7eb",
                            boxShadow: isOpen ? "0 0 0 1px #4f46e5" : "none"
                        }}
                        transition={{ duration: 0.15 }}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-label="Selector de sucursal"
                    >
                        {expanded ? (
                            selectedBranch.branch_name
                        ) : (
                            <motion.div
                                key={selectedBranchId}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 600, damping: 35 }}
                                className="flex items-center justify-center"
                            >
                                <Building size={16} className={isOpen ? "text-indigo-600" : "text-gray-600"} />
                            </motion.div>
                        )}
                    </motion.button>

                    {/* Icono izquierdo - Solo visible cuando está expandido */}
                    <motion.div 
                        className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10 pl-3"
                        animate={{ 
                            color: isOpen ? "#4f46e5" : "#9ca3af",
                            opacity: expanded ? 1 : 0
                        }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <motion.div
                            key={selectedBranchId}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 600, damping: 35 }}
                        >
                            <Building size={15} className="text-current" />
                        </motion.div>
                    </motion.div>

                    {/* Flecha derecha - Solo visible cuando está expandido */}
                    <motion.div 
                        className="absolute inset-y-0 right-0 flex items-center pointer-events-none z-10 pr-3"
                        animate={{ 
                            rotate: isOpen ? 180 : 0,
                            color: isOpen ? "#4f46e5" : "#9ca3af",
                            opacity: expanded ? 1 : 0
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ChevronDown size={14} className="text-current" />
                    </motion.div>
                </motion.div>

                {/* Lista desplegable - Position fixed para no afectar el layout */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                            style={{ 
                                position: 'fixed',
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                zIndex: 999999
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
                            role="listbox"
                            aria-label="Lista de sucursales"
                        >
                            <motion.div
                                className="max-h-60 overflow-y-auto scrollbar-hide"
                                style={{ 
                                    scrollbarWidth: 'none', /* Firefox */
                                    msOverflowStyle: 'none' /* IE and Edge */
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.15 }}
                            >
                                {dropdownOptions.map((option, index) => {
                                    const isSelected = option.id === selectedBranchId;
                                    const IconComponent = Building;
                                    
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
                                            role="option"
                                            aria-selected={isSelected}
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

            {/* Eliminado el indicador debajo para evitar empujar el menú y aparecer detrás del dropdown */}
        </motion.div>
    );
}

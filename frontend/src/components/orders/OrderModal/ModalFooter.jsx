// frontend/src/components/OrderModal/ModalFooter.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, RotateCcw, Printer, Edit, CheckCircle, Wrench, Truck, Eye, ChevronDown } from 'lucide-react';

export function ModalFooter({
    mode, permissions, onClose, isSubmitting, error,
    setIsTakeConfirmModalOpen, setIsReopenConfirmOpen,
    setIsDeliverConfirmModalOpen,
    handlePrint,
    setMode
}) {
    const [showPrintMenu, setShowPrintMenu] = useState(false);

    const handleModifyClick = () => {
        setMode(mode === 'view' ? 'edit' : 'view');
    };

    const handlePrintOption = (option) => {
        setShowPrintMenu(false);
        if (option === 'all') handlePrint({ client: true, workshop: true });
        if (option === 'single') handlePrint({ client: true, workshop: false });
    };

    return (
        <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 flex-wrap mt-auto">
            {/* Lado Izquierdo: Error e Imprimir */}
            <div className="flex items-center gap-2 sm:gap-4">
                {error && <p className="text-red-500 text-sm self-center">{error}</p>}

                {permissions.canPrintOrder && (mode === 'view' || mode === 'edit') && (
                    <div className="relative">
                        <motion.button 
                            type="button" 
                            onClick={() => setShowPrintMenu(!showPrintMenu)} 
                            className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700" 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                        >
                            <Printer size={18} /> Imprimir <ChevronDown size={14} />
                        </motion.button>
                        
                        <AnimatePresence>
                            {showPrintMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                                >
                                    <button 
                                        onClick={() => handlePrintOption('all')}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
                                    >
                                        Imprimir Todo (2 Copias)
                                    </button>
                                    <button 
                                        onClick={() => handlePrintOption('single')}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
                                    >
                                        Imprimir 1 Ticket
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Lado Derecho: Botones de Acción */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                {/* Botón "Tomar Orden" */}
                {permissions.canTakeOrder && (
                    <motion.button type="button" onClick={() => setIsTakeConfirmModalOpen(true)} disabled={isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><Wrench size={16} className="mr-2"/> Tomar Orden</>}
                    </motion.button>
                )}

                {/* Botón "Modificar Orden" / "Ver Orden" */}
                {(permissions.canModifyOrder || permissions.canModifyForDiagnosis) && (
                    <motion.button type="button" onClick={handleModifyClick} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {mode === 'view' ? (
                            <><Edit size={16} className="mr-2"/> {permissions.canModifyForDiagnosis && !permissions.canModifyOrder ? 'Editar Diagnóstico' : 'Modificar Orden'}</>
                        ) : (
                            <><Eye size={16} className="mr-2"/> Atrás</>
                        )}
                    </motion.button>
                )}

                {/* Botón "Completar Orden" */}
                {permissions.canCompleteOrder && mode === 'view' && (
                     <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={16} className="mr-2"/>Completar Orden</>}
                    </motion.button>
                )}

                {/* Botón "Guardar Orden" y "Guardar Cambios" */}
                {(mode === 'create' || mode === 'edit') && (
                    <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : (mode === 'create' ? 'Guardar Orden' : 'Guardar Cambios')}
                    </motion.button>
                )}

                {/* Botón "Reabrir Orden" */}
                {permissions.canReopenOrder && (
                    <motion.button type="button" onClick={() => setIsReopenConfirmOpen(true)} disabled={isSubmitting} className="bg-yellow-500 text-black font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-yellow-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><RotateCcw size={16} className="mr-2"/> Reabrir Orden</>}
                    </motion.button>
                )}

                {permissions.canDeliverOrder && (
                    <motion.button type="button" onClick={() => setIsDeliverConfirmModalOpen(true)} disabled={isSubmitting} className="bg-teal-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-teal-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><Truck size={16} className="mr-2"/>Confirmar Entrega</>}
                    </motion.button>
                )}

                <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {mode === 'view' && permissions.isReadOnly ? 'Cerrar' : 'Cancelar'}
                </motion.button>
            </div>
        </div>
    );
}
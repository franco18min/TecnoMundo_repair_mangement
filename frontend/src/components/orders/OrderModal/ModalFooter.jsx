// frontend/src/components/OrderModal/ModalFooter.jsx

import React from 'react';
import { motion } from 'framer-motion';
// --- INICIO DE LA NUEVA FUNCIONALIDAD ---
import { Loader, RotateCcw, Printer, Edit, CheckCircle, Wrench, Truck, Eye } from 'lucide-react';
// --- FIN DE LA NUEVA FUNCIONALIDAD ---

export function ModalFooter({
    mode, permissions, onClose, isSubmitting, error,
    setIsTakeConfirmModalOpen, setIsReopenConfirmOpen,
    // --- INICIO DE LA NUEVA FUNCIONALIDAD ---
    setIsDeliverConfirmModalOpen,
    // --- FIN DE LA NUEVA FUNCIONALIDAD ---
    handlePrint,
    setMode
}) {
    const handleModifyClick = () => {
        setMode(mode === 'view' ? 'edit' : 'view');
    };

    return (
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center gap-3 mt-auto">
            {/* Lado Izquierdo: Error e Imprimir */}
            <div className="flex items-center gap-4">
                {error && <p className="text-red-500 text-sm self-center">{error}</p>}

                {permissions.canPrintOrder && (mode === 'view' || mode === 'edit') && (
                    <motion.button type="button" onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Printer size={18} /> Imprimir
                    </motion.button>
                )}
            </div>

            {/* Lado Derecho: Botones de Acción */}
            <div className="flex items-center gap-3">
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

                {/* --- INICIO DE LA NUEVA FUNCIONALIDAD --- */}
                {permissions.canDeliverOrder && (
                    <motion.button type="button" onClick={() => setIsDeliverConfirmModalOpen(true)} disabled={isSubmitting} className="bg-teal-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-teal-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><Truck size={16} className="mr-2"/>Confirmar Entrega</>}
                    </motion.button>
                )}
                {/* --- FIN DE LA NUEVA FUNCIONALIDAD --- */}

                <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {mode === 'view' && permissions.isReadOnly ? 'Cerrar' : 'Cancelar'}
                </motion.button>
            </div>
        </div>
    );
}
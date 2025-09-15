// frontend/src/components/OrderModal/ModalFooter.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Loader, RotateCcw, Printer, Edit } from 'lucide-react'; // Añadir iconos

export function ModalFooter({
    mode, permissions, onClose, isSubmitting, error,
    setIsTakeConfirmModalOpen, setIsReopenConfirmOpen,
    // --- NUEVAS PROPS ---
    handlePrint, // Función para imprimir la orden actual
    setMode      // Función para cambiar el modo del modal (ej: a 'edit')
}) {
    const handleModifyClick = () => {
        setMode('edit'); // Cambiamos el modal al modo de edición
    };

    return (
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center gap-3 mt-auto">
            {/* Lado Izquierdo: Error y Botón de Imprimir */}
            <div className="flex items-center gap-4">
                {error && <p className="text-red-500 text-sm self-center">{error}</p>}

                {/* Botón de Imprimir para órdenes existentes (visible en modo vista y edición) */}
                {permissions.canPrintOrder && (mode === 'view' || mode === 'edit') && (
                    <motion.button type="button" onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Printer size={18} /> Imprimir
                    </motion.button>
                )}
            </div>

            {/* Lado Derecho: Botones de Acción */}
            <div className="flex items-center gap-3">
                {/* Botón para habilitar la modificación (solo en modo 'view') */}
                {mode === 'view' && permissions.canModify && (
                    <motion.button type="button" onClick={handleModifyClick} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Edit size={16} className="mr-2"/> Modificar
                    </motion.button>
                )}

                {permissions.canTakeOrder && (
                    <motion.button type="button" onClick={() => setIsTakeConfirmModalOpen(true)} disabled={isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Tomar Orden'}
                    </motion.button>
                )}

                {/* Botón de Guardar/Crear (ahora aparece en modo 'create' y 'edit') */}
                {(mode === 'create' || mode === 'edit') && (
                    <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : (mode === 'create' ? 'Guardar Orden' : 'Guardar Cambios')}
                    </motion.button>
                )}

                {/* Botón de Actualizar para el diagnóstico del técnico */}
                {permissions.canEditDiagnosisPanel && !permissions.canModify && (
                     <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Actualizar Orden'}
                    </motion.button>
                )}

                {permissions.canReopenOrder && (
                    <motion.button type="button" onClick={() => setIsReopenConfirmOpen(true)} disabled={isSubmitting} className="bg-yellow-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-yellow-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><RotateCcw size={16} className="mr-2"/> Reabrir Orden</>}
                    </motion.button>
                )}

                <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {permissions.isReadOnly && mode !== 'edit' ? 'Cerrar' : 'Cancelar'}
                </motion.button>
            </div>
        </div>
    );
}
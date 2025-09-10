// frontend/src/components/OrderModal/ModalFooter.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Loader, RotateCcw } from 'lucide-react';

export function ModalFooter({ mode, permissions, onClose, isSubmitting, error, setIsTakeConfirmModalOpen, setIsReopenConfirmOpen }) {
    return (
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
            {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}

            {permissions.canTakeOrder && (
                <motion.button
                    type="button"
                    onClick={() => setIsTakeConfirmModalOpen(true)}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Tomar Orden'}
                </motion.button>
            )}

            {mode === 'create' && (
                <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Guardar Orden'}
                </motion.button>
            )}

            {permissions.canEditDiagnosisPanel && (
                <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Actualizar Orden'}
                </motion.button>
            )}

            {permissions.canReopenOrder && (
                <motion.button
                    type="button"
                    onClick={() => setIsReopenConfirmOpen(true)}
                    disabled={isSubmitting}
                    className="bg-yellow-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-yellow-300 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isSubmitting ? <Loader size={20} className="animate-spin" /> : <><RotateCcw size={16} className="mr-2"/> Reabrir Orden</>}
                </motion.button>
            )}

            <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {permissions.isReadOnly ? 'Cerrar' : 'Cancelar'}
            </motion.button>
        </div>
    );
}
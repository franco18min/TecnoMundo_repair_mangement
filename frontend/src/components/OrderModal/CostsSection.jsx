import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField } from './shared';

export function CostsSection({ mode, permissions, formData, handleFormChange }) {
    if (mode === 'create') {
        return (
            <section>
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Costos y Pagos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Costo Total Estimado" name="total_cost" value={formData.total_cost} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                    <FormField label="Depósito Inicial" name="deposit" value={formData.deposit} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                    <AnimatePresence>
                        {(Number(formData.deposit) || 0) > 0 && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <DisplayField label="Saldo a Pagar" value={formData.balance} isCurrency={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        );
    }
    return null; // En modo 'view', los costos se muestran dentro de DiagnosisSection
}
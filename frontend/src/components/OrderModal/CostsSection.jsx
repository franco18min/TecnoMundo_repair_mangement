import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField } from './shared';

export function CostsSection({ mode, permissions, formData, handleFormChange }) {
    const costFields = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permissions.canEditCosts ? (
                <>
                    <FormField label="Costo Total" name="total_cost" value={formData.total_cost} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                    <FormField label="Depósito" name="deposit" value={formData.deposit} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                </>
            ) : (
                <>
                    <DisplayField label="Costo Total" value={formData.total_cost} isCurrency={true} />
                    <DisplayField label="Depósito" value={formData.deposit} isCurrency={true} />
                </>
            )}

            <AnimatePresence>
                {(Number(formData.deposit) > 0 || !permissions.canEditCosts) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DisplayField label="Saldo" value={formData.balance} isCurrency={true} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <section>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Costos y Pagos</h3>
            {costFields}
        </section>
    );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createBranch, updateBranch } from '../../api/branchApi';

// Replicando el FormField de ClientModal para consistencia visual
const FormField = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input {...props} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);

export function BranchModal({ isOpen, onClose, branch, onSave }) {
    const [branchName, setBranchName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const isEditing = Boolean(branch);

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setBranchName(branch.branch_name || '');
            } else {
                setBranchName(''); // Reset for creation
            }
            setError(''); // Clear previous errors when modal opens
        }
    }, [branch, isEditing, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const branchData = { branch_name: branchName };
            if (isEditing) {
                const updatedBranch = await updateBranch(branch.id, branchData);
                onSave(updatedBranch, 'edit');
                showToast('Sucursal actualizada con éxito', 'success');
            } else {
                const newBranch = await createBranch(branchData);
                onSave(newBranch, 'create');
                showToast('Sucursal creada con éxito', 'success');
            }
            onClose();
        } catch (err) {
            const errorMessage = err.message || 'Ocurrió un error inesperado.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                >
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <form id="branch-form" onSubmit={handleSubmit} className="p-6">
                        <FormField
                            icon={<Building2 size={20}/>}
                            name="branch_name"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            placeholder="Nombre de la sucursal"
                            required
                        />
                    </form>
                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                        <motion.button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Cancelar
                        </motion.button>
                        <motion.button type="submit" form="branch-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isSubmitting ? <Loader size={20} className="animate-spin" /> : (isEditing ? 'Guardar Cambios' : 'Crear Sucursal')}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
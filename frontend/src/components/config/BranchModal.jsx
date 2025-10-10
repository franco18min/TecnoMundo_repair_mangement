import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Phone, Mail, Loader } from 'lucide-react';
import { FormField } from '../shared/FormField';
import { useToast } from '../../context/ToastContext';
import { createBranch, updateBranch } from '../../api/branchApi';

export function BranchModal({ isOpen, onClose, branch, onSave }) {
    const [branchName, setBranchName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const isEditing = Boolean(branch);

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setBranchName(branch.branch_name || '');
                setCompanyName(branch.company_name || '');
                setAddress(branch.address || '');
                setPhone(branch.phone || '');
                setEmail(branch.email || '');
            } else {
                setBranchName(''); // Reset for creation
                setCompanyName('');
                setAddress('');
                setPhone('');
                setEmail('');
            }
            setError(''); // Clear previous errors when modal opens
        }
    }, [branch, isEditing, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const branchData = { 
                branch_name: branchName,
                company_name: companyName,
                address: address,
                phone: phone,
                email: email
            };
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                >
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
                        <motion.button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <X size={24} />
                        </motion.button>
                    </div>
                    <form id="branch-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Información Básica</h3>
                            <FormField
                                icon={<Building2 size={20}/>}
                                name="branch_name"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                placeholder="Nombre de la sucursal"
                                required
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Información para Tickets</h3>
                            <div className="space-y-3">
                                <FormField
                                    icon={<Building2 size={20}/>}
                                    name="company_name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Nombre de la empresa (ej: TECNO MUNDO)"
                                />
                                <FormField
                                    icon={<MapPin size={20}/>}
                                    name="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Dirección del local (ej: OTERO 280)"
                                />
                                <FormField
                                    icon={<Phone size={20}/>}
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Número de teléfono (ej: 3884087444)"
                                />
                                <FormField
                                    icon={<Mail size={20}/>}
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico (ej: info@tecnomundo.com)"
                                    type="email"
                                />
                            </div>
                        </div>
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
            )}
        </AnimatePresence>
    );
}
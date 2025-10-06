// frontend/src/components/ClientModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, User, Phone, Fingerprint } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { updateCustomer, createCustomer } from '../../api/customerApi'; // Importar createCustomer
import { FormField } from '../shared/FormField';

export function ClientModal({ isOpen, onClose, client, mode, onClientUpdated, onClientAdded }) {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone_number: '', dni: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        // Si estamos en modo edición, cargamos los datos del cliente.
        if (mode === 'edit' && client) {
            setFormData({
                first_name: client.first_name || '',
                last_name: client.last_name || '',
                phone_number: client.phone_number || '',
                dni: client.dni || '',
            });
        } else {
            // Si estamos en modo creación, reseteamos el formulario.
            setFormData({ first_name: '', last_name: '', phone_number: '', dni: '' });
        }
    }, [client, mode, isOpen]); // Añadimos isOpen para que se resetee cada vez que se abre

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (mode === 'edit') {
                const updatedClient = await updateCustomer(client.id, formData);
                onClientUpdated(updatedClient);
                showToast('Cliente actualizado con éxito', 'success');
            } else {
                const newClient = await createCustomer(formData);
                onClientAdded(newClient);
                showToast('Cliente creado con éxito', 'success');
            }
            onClose();
        } catch (err) {
            const errorMessage = err.message || (mode === 'edit' ? 'No se pudo actualizar el cliente.' : 'No se pudo crear el cliente.');
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
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        initial={{ scale: 0.9, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                    <div className="p-6 border-b flex justify-between items-center">
                        {/* El título ahora es dinámico */}
                        <h2 className="text-2xl font-bold text-gray-800">{mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
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
                    {/* El 'id' del formulario es importante para que el botón de submit funcione desde el footer */}
                    <form id="client-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                        <FormField icon={<User size={20}/>} name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombre" required />
                        <FormField icon={<User size={20}/>} name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellido" required />
                        <FormField icon={<Phone size={20}/>} name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Teléfono" required />
                        <FormField icon={<Fingerprint size={20}/>} name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI" required />
                    </form>
                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                        <motion.button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Cancelar
                        </motion.button>
                        {/* El texto del botón ahora es dinámico */}
                        <motion.button type="submit" form="client-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isSubmitting ? <Loader size={20} className="animate-spin" /> : (mode === 'edit' ? 'Guardar Cambios' : 'Crear Cliente')}
                        </motion.button>
                    </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
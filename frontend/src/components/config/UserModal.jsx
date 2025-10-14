import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Shield, Building2, Eye, EyeOff, Briefcase } from 'lucide-react';
import { createUser, updateUser } from '../../api/userApi';
import { getRoles } from '../../api/rolesApi';
import { fetchBranches } from '../../api/branchApi';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../shared/FormField';

// Variantes de animación
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
        opacity: 1, 
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};



const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <motion.div 
        className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-4 py-3"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
    >
        <span className="font-medium text-gray-700">{label}</span>
        <motion.button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.span 
                className={`inline-block w-4 h-4 transform bg-white rounded-full`}
                animate={{ x: enabled ? 20 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </motion.button>
    </motion.div>
);

export function UserModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', role_id: '', branch_id: '', is_active: true,
    });
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();
    const isEditing = Boolean(user);

    useEffect(() => {
        if (isOpen) {
            const loadModalData = async () => {
                try {
                    const [rolesData, branchesData] = await Promise.all([getRoles(), fetchBranches()]);
                    setRoles(rolesData);
                    setBranches(branchesData);
                } catch (err) {
                    showToast('Error al cargar datos para el formulario', 'error');
                }
            };
            loadModalData();

            if (isEditing) {
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    password: '', // No precargar por seguridad
                    role_id: user.role.id || '',
                    branch_id: user.branch.id || '',
                    is_active: user.is_active,
                });
            } else {
                setFormData({ username: '', email: '', password: '', role_id: '', branch_id: '', is_active: true });
            }
            setError('');
        }
    }, [user, isEditing, isOpen, showToast]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const dataToSend = { ...formData };
        if (isEditing && !dataToSend.password) {
            delete dataToSend.password;
        }

        try {
            if (isEditing) {
                const updatedUser = await updateUser(user.id, dataToSend);
                onSave(updatedUser, 'edit');
                showToast('Usuario actualizado con éxito', 'success');
            } else {
                const newUser = await createUser(dataToSend);
                onSave(newUser, 'create');
                showToast('Usuario creado con éxito', 'success');
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
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                    initial={{ scale: 0.9, y: -20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <motion.div 
                        className="p-6 border-b flex justify-between items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <motion.button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <X size={24} />
                        </motion.button>
                    </motion.div>
                    
                    <motion.form 
                        id="user-form" 
                        onSubmit={handleSubmit} 
                        className="p-6 space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        <FormField 
                            icon={<User size={20}/>} 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            placeholder="Nombre de usuario" 
                            required 
                        />
                        <FormField 
                            icon={<Mail size={20}/>} 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="Email" 
                            required 
                        />
                        <FormField 
                            icon={<Lock size={20}/>} 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Contraseña'} 
                            required={!isEditing} 
                        />
                        <FormField 
                            as="select" 
                            icon={<Briefcase size={20}/>} 
                            name="role_id" 
                            value={formData.role_id} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.role_name}</option>
                            ))}
                        </FormField>
                        <FormField 
                            as="select" 
                            icon={<Building2 size={20}/>} 
                            name="branch_id" 
                            value={formData.branch_id} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione una sucursal</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                            ))}
                        </FormField>
                        {isEditing && (
                            <ToggleSwitch 
                                label="Usuario Activo" 
                                enabled={formData.is_active} 
                                setEnabled={(value) => setFormData(p => ({ ...p, is_active: value }))} 
                            />
                        )}
                    </motion.form>
                    
                    <motion.div 
                        className="p-6 border-t bg-gray-50 flex justify-end gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <AnimatePresence>
                            {error && (
                                <motion.p 
                                    className="text-red-500 text-sm mr-auto self-center"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <motion.button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors duration-200" 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancelar
                        </motion.button>
                        <motion.button 
                            type="submit" 
                            form="user-form" 
                            disabled={isSubmitting} 
                            className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center transition-colors duration-200" 
                            whileHover={{ scale: isSubmitting ? 1 : 1.05 }} 
                            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                        >
                            <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Loader size={20} className="animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key="text"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
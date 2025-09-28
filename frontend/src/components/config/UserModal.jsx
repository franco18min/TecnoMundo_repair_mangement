import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, User, Mail, Lock, Briefcase, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createUser, updateUser } from '../../api/userApi';
import { getRoles } from '../../api/rolesApi';
import { fetchBranches } from '../../api/branchApi';

// Replicando y extendiendo los campos de formulario de ClientModal
const FormField = ({ icon, as = 'input', children, ...props }) => {
    const Component = as;
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
            <Component {...props} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {children}
            </Component>
        </div>
    );
};

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
        <span className="font-medium text-gray-700">{label}</span>
        <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                    initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                >
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <form id="user-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                        <FormField icon={<User size={20}/>} name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" required />
                        <FormField icon={<Mail size={20}/>} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                        <FormField icon={<Lock size={20}/>} name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Contraseña'} required={!isEditing} />
                        <FormField as="select" icon={<Briefcase size={20}/>} name="role_id" value={formData.role_id} onChange={handleChange} required>
                            <option value="">Seleccione un rol</option>
                            {roles.map(role => <option key={role.id} value={role.id}>{role.role_name}</option>)}
                        </FormField>
                        <FormField as="select" icon={<Building2 size={20}/>} name="branch_id" value={formData.branch_id} onChange={handleChange} required>
                            <option value="">Seleccione una sucursal</option>
                            {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.branch_name}</option>)}
                        </FormField>
                        {isEditing && (
                            <ToggleSwitch label="Usuario Activo" enabled={formData.is_active} setEnabled={(value) => setFormData(p => ({ ...p, is_active: value }))} />
                        )}
                    </form>
                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                        <motion.button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Cancelar
                        </motion.button>
                        <motion.button type="submit" form="user-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isSubmitting ? <Loader size={20} className="animate-spin" /> : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
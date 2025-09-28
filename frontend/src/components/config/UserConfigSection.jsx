import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, ToggleLeft, ToggleRight, Loader, UserX, UserCheck, Users } from 'lucide-react';
import { getUsers, updateUser } from '../../api/userApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { UserModal } from './UserModal';
import { ConfirmationModal } from '../shared/ConfirmationModal';

export const UserConfigSection = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirm, setConfirm] = useState({ isOpen: false });
    const { showToast } = useToast();
    const { currentUser } = useAuth();

    // --- INICIO DE LA CORRECCIÓN ---
    const loadUsers = useCallback(async () => {
        // Si no hay usuario (ej. al cerrar sesión), no hacer nada.
        if (!currentUser) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers(filter);
            // Excluir al usuario actual de la lista para evitar que se desactive a sí mismo
            setUsers(fetchedUsers.filter(u => u.id !== currentUser.id));
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios.');
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, filter, currentUser]); // Depender del objeto currentUser completo

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);
    // --- FIN DE LA CORRECCIÓN ---

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };

    const handleSave = (savedUser, mode) => {
        if (mode === 'create') {
            setUsers(prev => [savedUser, ...prev]);
        } else {
            setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        }
        // Recargar si el filtro podría ocultar el cambio
        if (filter !== 'all') loadUsers();
    };

    const handleToggleStatus = (user) => {
        const action = user.is_active ? 'desactivar' : 'activar';
        setConfirm({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario`,
            message: `¿Estás seguro de que quieres ${action} a ${user.username}?`,
            onConfirm: () => performToggle(user)
        });
    };

    const performToggle = async (user) => {
        try {
            const updatedUser = await updateUser(user.id, { is_active: !user.is_active });
            handleSave(updatedUser, 'edit');
            showToast(`Usuario ${user.username} ${updatedUser.is_active ? 'activado' : 'desactivado'}`, 'success');
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado del usuario', 'error');
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center p-1 bg-gray-100 rounded-lg">
                        {['all', 'active', 'inactive'].map(status => (
                            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                {{'all': 'Todos', 'active': 'Activos', 'inactive': 'Inactivos'}[status]}
                            </button>
                        ))}
                    </div>
                    <motion.button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <PlusCircle size={20} />
                        <span>Nuevo Usuario</span>
                    </motion.button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {isLoading && <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-600" size={32} /></div>}
                {error && <p className="text-center text-red-500 p-4">{error}</p>}
                {!isLoading && !error && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{user.username}</div><div className="text-gray-500">{user.email}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.role.role_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.branch.branch_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                                        <button onClick={() => handleToggleStatus(user)} title={user.is_active ? 'Desactivar' : 'Activar'} className={`p-2 rounded-md transition-colors ${user.is_active ? 'text-gray-500 hover:bg-yellow-100 hover:text-yellow-700' : 'text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                                            {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </button>
                                        <button onClick={() => handleOpenModal(user)} title="Editar" className="p-2 rounded-md text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {!isLoading && users.length === 0 && (
                    <div className="text-center text-gray-500 p-8"><Users size={40} className="mx-auto text-gray-400 mb-2" />No hay usuarios para mostrar.</div>
                )}
            </div>

            <UserModal isOpen={isModalOpen} onClose={handleCloseModal} user={selectedUser} onSave={handleSave} />
            <ConfirmationModal isOpen={confirm.isOpen} title={confirm.title} message={confirm.message} onConfirm={() => { setConfirm({ isOpen: false }); confirm.onConfirm(); }} onCancel={() => setConfirm({ isOpen: false })} />
        </>
    );
};
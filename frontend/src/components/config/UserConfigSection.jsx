import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, ToggleLeft, ToggleRight, Loader, UserX, UserCheck, Users } from 'lucide-react';
import { getUsers, updateUser } from '../../api/userApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { UserModal } from './UserModal';
import { ConfirmationModal } from '../shared/ConfirmationModal';

// Variantes de animación para la tabla
const tableVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    },
    exit: { 
        opacity: 0, 
        x: -100,
        transition: {
            duration: 0.2
        }
    }
};

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
};

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

    const loadUsers = useCallback(async () => {
        if (!currentUser) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers(filter);
            setUsers(fetchedUsers.filter(u => u.id !== currentUser.id));
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios.');
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, filter, currentUser]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h2>
                <motion.button 
                    onClick={() => handleOpenModal(null)} 
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <PlusCircle size={20} />
                    <span>Nuevo Usuario</span>
                </motion.button>
            </div>

            <motion.div 
                className="flex gap-2 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                {[
                    { key: 'all', label: 'Todos', icon: Users },
                    { key: 'active', label: 'Activos', icon: UserCheck },
                    { key: 'inactive', label: 'Inactivos', icon: UserX }
                ].map(({ key, label, icon: Icon }) => (
                    <motion.button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                            filter === key 
                                ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <Icon size={16} />
                        {label}
                    </motion.button>
                ))}
            </motion.div>

            <motion.div 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div 
                            className="flex justify-center p-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Loader className="animate-spin text-indigo-600" size={32} />
                        </motion.div>
                    )}
                    {error && (
                        <motion.p 
                            className="text-center text-red-500 p-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {error}
                        </motion.p>
                    )}
                    {!isLoading && !error && (
                        <motion.table 
                            className="w-full text-sm"
                            variants={tableVariants}
                            initial="hidden"
                            animate="show"
                        >
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
                                <AnimatePresence>
                                    {users.map(user => (
                                        <motion.tr 
                                            key={user.id}
                                            variants={rowVariants}
                                            layout
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                <div className="text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.role?.role_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.branch?.branch_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                                        user.is_active 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {user.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </motion.button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <motion.button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Edit size={16} />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </motion.table>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <UserModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        user={selectedUser}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirm.isOpen && (
                    <ConfirmationModal
                        isOpen={confirm.isOpen}
                        title={confirm.title}
                        message={confirm.message}
                        onConfirm={() => {
                            confirm.onConfirm();
                            setConfirm({ isOpen: false });
                        }}
                        onClose={() => setConfirm({ isOpen: false })}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
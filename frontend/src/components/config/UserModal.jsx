import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Eye, EyeOff } from 'lucide-react';

const UserModal = ({ isOpen, onClose, user, onSave, roles = [], branches = [], defaultBranchId }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: undefined,
    branch_id: undefined
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role_id: user.role?.id ?? roles[0]?.id,
        branch_id: user.branch?.id ?? defaultBranchId ?? branches[0]?.id
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role_id: roles[0]?.id,
        branch_id: defaultBranchId ?? branches[0]?.id
      });
    }
  }, [user, isOpen, roles, branches, defaultBranchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = {
      ...formData,
      [name]: name === 'role_id' || name === 'branch_id' ? Number(value) : value
    };
    if (name === 'password') {
      const pwd = value || '';
      let err = '';
      if (!(isEditing && pwd === '')) {
        if (pwd.length < 8) err = 'La contraseña debe tener al menos 8 caracteres';
        else if (!/[A-Za-z]/.test(pwd)) err = 'La contraseña debe contener al menos una letra';
        else if (!/\d/.test(pwd)) err = 'La contraseña debe contener al menos un número';
      }
      setPasswordError(err);
    }
    setFormData(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!isEditing && passwordError) || (isEditing && formData.password && passwordError)) return;
    onSave(formData);
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </motion.div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {isEditing && '(dejar vacío para mantener actual)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Rol
                </label>
                <select
                  name="role_id"
                  value={formData.role_id ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled>Seleccionar rol</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.role_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal
                </label>
                <select
                  name="branch_id"
                  value={formData.branch_id ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled>Seleccionar sucursal</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.branch_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className={`px-4 py-2 rounded-lg transition-colors ${passwordError && !isEditing ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  disabled={passwordError && !isEditing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;

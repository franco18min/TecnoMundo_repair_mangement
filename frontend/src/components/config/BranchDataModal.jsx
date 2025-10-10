import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Phone, Mail, Save, Loader, Store, Home, Globe } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function BranchDataModal({ isOpen, onClose, branch, onSave }) {
    const [branchData, setBranchData] = useState({
        branch_name: '',
        company_name: '',
        address: '',
        phone: '',
        email: '',
        icon: 'Building2'
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && branch) {
            setBranchData({
                branch_name: branch.branch_name || '',
                company_name: branch.company_name || 'TECNO MUNDO',
                address: branch.address || '',
                phone: branch.phone || '',
                email: branch.email || '',
                icon: branch.icon || 'Building2'
            });
            setError('');
        }
    }, [branch, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validaciones básicas
            if (!branchData.branch_name.trim()) {
                throw new Error('El nombre de la sucursal es obligatorio');
            }

            // En una implementación real, esto iría a la API
            const updatedBranch = { ...branch, ...branchData };
            onSave(updatedBranch);
            showToast('Datos de sucursal actualizados con éxito', 'success');
            onClose();
        } catch (err) {
            const errorMessage = err.message || 'Ocurrió un error inesperado.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateBranchData = (key, value) => {
        setBranchData(prev => ({ ...prev, [key]: value }));
    };

    const iconOptions = [
        { value: 'Building2', label: 'Edificio' },
        { value: 'Store', label: 'Tienda' },
        { value: 'Home', label: 'Casa' },
        { value: 'MapPin', label: 'Ubicación' },
        { value: 'Globe', label: 'Global' }
    ];

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
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Configurar Datos de Sucursal
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Edita la información básica de la sucursal
                                </p>
                            </div>
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

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Nombre de la empresa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Building2 size={16} className="inline mr-2" />
                                    Nombre de la Empresa
                                </label>
                                <input
                                    type="text"
                                    value={branchData.company_name}
                                    onChange={(e) => updateBranchData('company_name', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: TECNO MUNDO"
                                />
                            </div>

                            {/* Nombre de la sucursal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Store size={16} className="inline mr-2" />
                                    Nombre de la Sucursal *
                                </label>
                                <input
                                    type="text"
                                    value={branchData.branch_name}
                                    onChange={(e) => updateBranchData('branch_name', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: Sucursal Principal"
                                    required
                                />
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin size={16} className="inline mr-2" />
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={branchData.address}
                                    onChange={(e) => updateBranchData('address', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: Av. Principal 123, Ciudad"
                                />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone size={16} className="inline mr-2" />
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={branchData.phone}
                                    onChange={(e) => updateBranchData('phone', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: +1 234 567 8900"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail size={16} className="inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={branchData.email}
                                    onChange={(e) => updateBranchData('email', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: contacto@tecnomundo.com"
                                />
                            </div>

                            {/* Icono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icono de la Sucursal
                                </label>
                                <select
                                    value={branchData.icon}
                                    onChange={(e) => updateBranchData('icon', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {iconOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vista previa de datos */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Vista previa de datos:</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div><strong>Empresa:</strong> {branchData.company_name || 'No especificado'}</div>
                                    <div><strong>Sucursal:</strong> {branchData.branch_name || 'No especificado'}</div>
                                    <div><strong>Dirección:</strong> {branchData.address || 'No especificado'}</div>
                                    <div><strong>Teléfono:</strong> {branchData.phone || 'No especificado'}</div>
                                    <div><strong>Email:</strong> {branchData.email || 'No especificado'}</div>
                                    <div><strong>Icono:</strong> {iconOptions.find(opt => opt.value === branchData.icon)?.label || 'Edificio'}</div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                            <motion.button 
                                type="button" 
                                onClick={onClose} 
                                className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button 
                                type="submit" 
                                onClick={handleSubmit}
                                disabled={isSubmitting} 
                                className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2" 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Guardar Datos
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
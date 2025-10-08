import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField, TextAreaField } from './shared';
import { KeyRound, Lock, Package, Store } from 'lucide-react';
import PatternLock from '../../shared/PatternLock'; // RUTA CORREGIDA

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
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

const buttonVariants = {
    inactive: { 
        scale: 1,
        backgroundColor: "rgba(0, 0, 0, 0)"
    },
    active: { 
        scale: 1.02,
        backgroundColor: "#4f46e5",
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
};

export function EquipmentSection({ permissions, formData, handleFormChange, deviceTypes, sparePartStatus, setSparePartStatus, unlockMethod, setUnlockMethod, handlePatternChange, isPatternValue, fullOrderData }) {
    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h3 
                className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4"
                variants={itemVariants}
            >
                Datos del Equipo y Falla
            </motion.h3>
            
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={containerVariants}
            >
                {/* Campos de Equipo */}
                <motion.div variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <FormField 
                            as="select" 
                            label="Tipo de Dispositivo" 
                            id="device_type_id" 
                            name="device_type_id" 
                            value={formData.device_type_id} 
                            onChange={handleFormChange} 
                            required
                        >
                            <option value="">Seleccione un tipo</option>
                            {deviceTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.type_name}</option>
                            ))}
                        </FormField>
                    ) : (
                        <DisplayField 
                            label="Tipo de Dispositivo" 
                            value={deviceTypes.find(type => type.id === formData.device_type_id)?.type_name || 'No especificado'} 
                        />
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <FormField 
                            label="Modelo" 
                            name="device_model" 
                            value={formData.device_model} 
                            onChange={handleFormChange} 
                            required 
                        />
                    ) : (
                        <DisplayField label="Modelo" value={formData.device_model} />
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <FormField 
                            label="Número de Serie" 
                            name="serial_number" 
                            value={formData.serial_number} 
                            onChange={handleFormChange} 
                        />
                    ) : (
                        <DisplayField label="Número de Serie" value={formData.serial_number} />
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <FormField 
                            label="Accesorios" 
                            name="accesories" 
                            value={formData.accesories} 
                            onChange={handleFormChange} 
                        />
                    ) : (
                        <DisplayField label="Accesorios" value={formData.accesories} />
                    )}
                </motion.div>

                {/* Campos de Falla y Observaciones */}
                <motion.div className="md:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <TextAreaField 
                            label="Descripción del Problema" 
                            name="problem_description" 
                            value={formData.problem_description} 
                            onChange={handleFormChange} 
                            required 
                        />
                    ) : (
                        <DisplayField 
                            label="Descripción del Problema" 
                            value={formData.problem_description} 
                            fullWidth={true} 
                        />
                    )}
                </motion.div>

                <motion.div className="md:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <TextAreaField 
                            label="Observaciones" 
                            name="observations" 
                            value={formData.observations} 
                            onChange={handleFormChange} 
                        />
                    ) : (
                        <DisplayField 
                            label="Observaciones" 
                            value={formData.observations} 
                            fullWidth={true} 
                        />
                    )}
                </motion.div>

                {/* --- SECCIÓN DE REPUESTOS UNIFICADA --- */}
                <motion.div className="md:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <div className="flex items-center justify-between gap-4 py-2">
                            <label className="text-sm font-medium text-gray-700">Origen del Repuesto</label>
                            <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-xs">
                                <motion.button 
                                    type="button" 
                                    onClick={() => setSparePartStatus('local')} 
                                    className={`w-1/2 p-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
                                        sparePartStatus === 'local' 
                                            ? 'bg-indigo-600 text-white shadow' 
                                            : 'text-gray-600'
                                    }`}
                                    variants={buttonVariants}
                                    animate={sparePartStatus === 'local' ? 'active' : 'inactive'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Store size={16}/>En Stock
                                </motion.button>
                                <motion.button 
                                    type="button" 
                                    onClick={() => setSparePartStatus('pedido')} 
                                    className={`w-1/2 p-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
                                        sparePartStatus === 'pedido' 
                                            ? 'bg-indigo-600 text-white shadow' 
                                            : 'text-gray-600'
                                    }`}
                                    variants={buttonVariants}
                                    animate={sparePartStatus === 'pedido' ? 'active' : 'inactive'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Package size={16}/>Pedido
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between py-2">
                            <label className="block text-sm font-medium text-gray-500">Estado del Repuesto</label>
                            <div className="flex bg-gray-100/70 rounded-lg p-1 h-[42px] border border-gray-200 w-full max-w-xs">
                                <div className={`w-1/2 text-sm rounded-md font-semibold flex items-center justify-center gap-2 ${
                                    fullOrderData?.status?.status_name !== 'Waiting for parts' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-500'
                                }`}>
                                    <Store size={16}/>En Stock
                                </div>
                                <div className={`w-1/2 text-sm rounded-md font-semibold flex items-center justify-center gap-2 ${
                                    fullOrderData?.status?.status_name === 'Waiting for parts' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-500'
                                }`}>
                                    <Package size={16}/>Pedido
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.div className="md:col-span-2" variants={itemVariants}>
                    {permissions.canEditPartsUsed ? (
                        <TextAreaField 
                            label="Repuestos Utilizados" 
                            name="parts_used" 
                            value={formData.parts_used} 
                            onChange={handleFormChange} 
                        />
                    ) : (
                        <DisplayField 
                            label="Repuestos Utilizados" 
                            value={formData.parts_used} 
                            fullWidth={true}
                        />
                    )}
                </motion.div>

                {/* --- SECCIÓN DE DESBLOQUEO --- */}
                <motion.div className="md:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Desbloqueo</label>
                            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                                <motion.button 
                                    type="button" 
                                    onClick={() => setUnlockMethod('password')} 
                                    className={`w-1/2 p-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
                                        unlockMethod === 'password' 
                                            ? 'bg-indigo-600 text-white shadow' 
                                            : 'text-gray-600'
                                    }`}
                                    variants={buttonVariants}
                                    animate={unlockMethod === 'password' ? 'active' : 'inactive'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <KeyRound size={16}/>Contraseña
                                </motion.button>
                                <motion.button 
                                    type="button" 
                                    onClick={() => setUnlockMethod('pattern')} 
                                    className={`w-1/2 p-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
                                        unlockMethod === 'pattern' 
                                            ? 'bg-indigo-600 text-white shadow' 
                                            : 'text-gray-600'
                                    }`}
                                    variants={buttonVariants}
                                    animate={unlockMethod === 'pattern' ? 'active' : 'inactive'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Lock size={16}/>Patrón
                                </motion.button>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {unlockMethod === 'password' ? (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <FormField 
                                            label="Contraseña de Desbloqueo" 
                                            name="password_or_pattern" 
                                            value={formData.password_or_pattern} 
                                            onChange={handleFormChange} 
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pattern"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full"
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Patrón de Desbloqueo</label>
                                        <div className="flex justify-start">
                                            <PatternLock 
                                                onPatternChange={handlePatternChange} 
                                                initialPattern={isPatternValue ? formData.password_or_pattern : ''} 
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        isPatternValue ? (
                            <motion.div 
                                className="w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="block text-sm font-medium text-gray-500 mb-1">Patrón de Desbloqueo</label>
                                <div className="flex justify-start">
                                    <PatternLock displayPattern={formData.password_or_pattern} readOnly={true} />
                                </div>
                            </motion.div>
                        ) : (
                            <DisplayField 
                                label="Contraseña de Desbloqueo" 
                                value={formData.password_or_pattern} 
                                fullWidth={true} 
                            />
                        )
                    )}
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
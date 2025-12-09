import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField, TextAreaField } from './shared';
import { KeyRound, Lock, Package, Store, X, Check } from 'lucide-react';
import { SegmentedControl } from '../../shared/SegmentedControl';
import PatternLock from '../PatternLock'; // RUTA ACTUALIZADA: ahora en carpeta orders

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

// Modal interno para dibujar patrón
const PatternModal = ({ isOpen, onClose, onConfirm, initialPattern, readOnly = false }) => {
    const [currentPattern, setCurrentPattern] = useState(initialPattern || '');

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
            >
                <div className="w-full flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{readOnly ? 'Patrón de Desbloqueo' : 'Dibujar Patrón'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <PatternLock
                        onPatternComplete={setCurrentPattern}
                        initialPattern={initialPattern}
                        displayPattern={readOnly ? initialPattern : null}
                        readOnly={readOnly}
                    />
                </div>

                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        {readOnly ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={() => onConfirm(currentPattern)}
                            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                        >
                            <Check size={18} />
                            Guardar
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export function EquipmentSection({ permissions, formData, handleFormChange, deviceTypes, sparePartStatus, setSparePartStatus, unlockMethod, setUnlockMethod, handlePatternChange, isPatternValue, fullOrderData }) {
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
    const [isPatternModalReadOnly, setIsPatternModalReadOnly] = useState(false);

    const handleOpenPatternModal = (readOnly) => {
        setIsPatternModalReadOnly(readOnly);
        setIsPatternModalOpen(true);
    };

    const handleConfirmPattern = (pattern) => {
        handlePatternChange(pattern);
        setIsPatternModalOpen(false);
    };

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h3
                className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-3"
                variants={itemVariants}
            >
                Datos del Equipo y Falla
            </motion.h3>

            {/* Modal de Patrón */}
            <AnimatePresence>
                {isPatternModalOpen && (
                    <PatternModal
                        isOpen={isPatternModalOpen}
                        onClose={() => setIsPatternModalOpen(false)}
                        onConfirm={handleConfirmPattern}
                        initialPattern={isPatternValue ? formData.password_or_pattern : ''}
                        readOnly={isPatternModalReadOnly}
                    />
                )}
            </AnimatePresence>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3"
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

                {/* Repuestos Utilizados junto a Accesorios */}
                <motion.div className="xl:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-700">Repuestos Utilizados</label>
                                <SegmentedControl
                                    value={sparePartStatus}
                                    onChange={setSparePartStatus}
                                    options={[
                                        { value: 'local', label: (<span className="flex items-center gap-1.5"><Store size={16} />En Stock</span>) },
                                        { value: 'pedido', label: (<span className="flex items-center gap-1.5"><Package size={16} />Pedido</span>) }
                                    ]}
                                    size="xs"
                                    className="h-4"
                                />
                            </div>
                            <input
                                type="text"
                                name="parts_used"
                                value={formData.parts_used}
                                onChange={handleFormChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-500">Repuestos Utilizados</label>
                                <SegmentedControl
                                    value={(fullOrderData?.status?.status_name === 'Waiting for parts') ? 'pedido' : 'local'}
                                    onChange={() => { }}
                                    options={[
                                        { value: 'local', label: (<span className="flex items-center gap-1.5"><Store size={16} />En Stock</span>) },
                                        { value: 'pedido', label: (<span className="flex items-center gap-1.5"><Package size={16} />Pedido</span>) }
                                    ]}
                                    size="xs"
                                    className="opacity-90 pointer-events-none"
                                />
                            </div>
                            <p className="w-full bg-gray-100/70 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 min-h-[42px] whitespace-nowrap overflow-x-auto">
                                {formData.parts_used ? formData.parts_used : 'N/A'}
                            </p>
                        </>
                    )}
                </motion.div>

                {/* Campos de Falla y Observaciones */}
                <motion.div className="xl:col-span-3" variants={itemVariants}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                            {permissions.canEditInitialDetails ? (
                                <TextAreaField
                                    label="Descripción del Problema"
                                    name="problem_description"
                                    value={formData.problem_description}
                                    onChange={handleFormChange}
                                    required
                                    rows={3}
                                />
                            ) : (
                                <DisplayField
                                    label="Descripción del Problema"
                                    value={formData.problem_description}
                                />
                            )}
                        </div>
                        <div>
                            {permissions.canEditInitialDetails ? (
                                <TextAreaField
                                    label="Observaciones"
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleFormChange}
                                    rows={3}
                                />
                            ) : (
                                <DisplayField
                                    label="Observaciones"
                                    value={formData.observations}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>



                {/* --- SECCIÓN DE DESBLOQUEO --- */}
                <motion.div className="xl:col-span-3" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-700">Método de Desbloqueo</label>
                                <SegmentedControl
                                    value={unlockMethod}
                                    onChange={setUnlockMethod}
                                    options={[
                                        { value: 'password', label: (<span className="flex items-center gap-1.5"><KeyRound size={16} />Contraseña</span>) },
                                        { value: 'pattern', label: (<span className="flex items-center gap-1.5"><Lock size={16} />Patrón</span>) }
                                    ]}
                                    size="xs"
                                    className="h-4"
                                />
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
                                        <input
                                            type="text"
                                            name="password_or_pattern"
                                            value={formData.password_or_pattern}
                                            onChange={handleFormChange}
                                            placeholder="Contraseña"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pattern"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full flex flex-col gap-3"
                                    >
                                        {isPatternValue ? (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenPatternModal(false)}
                                                className="w-full py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Check size={18} />
                                                Patrón Guardado (Click para modificar)
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenPatternModal(false)}
                                                className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Lock size={18} />
                                                Dibujar Patrón
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-500">Método de Desbloqueo</label>
                                <SegmentedControl
                                    value={isPatternValue ? 'pattern' : 'password'}
                                    onChange={() => { }}
                                    options={[
                                        { value: 'password', label: (<span className="flex items-center gap-1.5"><KeyRound size={16} />Contraseña</span>) },
                                        { value: 'pattern', label: (<span className="flex items-center gap-1.5"><Lock size={16} />Patrón</span>) }
                                    ]}
                                    size="xs"
                                    className="opacity-90 pointer-events-none h-4"
                                />
                            </div>
                            {isPatternValue ? (
                                <motion.div
                                    className="w-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleOpenPatternModal(true)}
                                        className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Lock size={18} />
                                        Ver Patrón de Desbloqueo
                                    </button>
                                </motion.div>
                            ) : (
                                <p className="w-full bg-gray-100/70 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 min-h-[42px] flex items-center">
                                    {formData.password_or_pattern || 'N/A'}
                                </p>
                            )}
                        </>
                    )}
                </motion.div>
            </motion.div>
        </motion.section>
    );
}

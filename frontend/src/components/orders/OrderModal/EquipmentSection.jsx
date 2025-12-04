import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField, TextAreaField } from './shared';
import { KeyRound, Lock, Package, Store } from 'lucide-react';
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

export function EquipmentSection({ permissions, formData, handleFormChange, deviceTypes, sparePartStatus, setSparePartStatus, unlockMethod, setUnlockMethod, handlePatternChange, isPatternValue, fullOrderData }) {
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

                {/* --- SECCIÓN DE REPUESTOS UNIFICADA --- */}
                <motion.div className="xl:col-span-2" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <div className="flex items-center justify-between gap-4 py-2">
                            <label className="text-sm font-medium text-gray-700">Origen del Repuesto</label>
                            <SegmentedControl
                                value={sparePartStatus}
                                onChange={setSparePartStatus}
                                options={[
                                    { value: 'local', label: (<span className="flex items-center gap-1.5"><Store size={16}/>En Stock</span>) },
                                    { value: 'pedido', label: (<span className="flex items-center gap-1.5"><Package size={16}/>Pedido</span>) }
                                ]}
                                size="sm"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-4 py-2">
                            <label className="block text-sm font-medium text-gray-500">Estado del Repuesto</label>
                            <SegmentedControl
                                value={(fullOrderData?.status?.status_name === 'Waiting for parts') ? 'pedido' : 'local'}
                                onChange={() => {}}
                                options={[
                                    { value: 'local', label: (<span className="flex items-center gap-1.5"><Store size={16}/>En Stock</span>) },
                                    { value: 'pedido', label: (<span className="flex items-center gap-1.5"><Package size={16}/>Pedido</span>) }
                                ]}
                                size="sm"
                                className="opacity-90 pointer-events-none"
                            />
                        </div>
                    )}
                </motion.div>

                <motion.div className="xl:col-span-3" variants={itemVariants}>
                    {permissions.canEditPartsUsed ? (
                        <TextAreaField 
                            label="Repuestos Utilizados" 
                            name="parts_used" 
                            value={formData.parts_used} 
                            onChange={handleFormChange} 
                            rows={2}
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
                <motion.div className="xl:col-span-3" variants={itemVariants}>
                    {permissions.canEditInitialDetails ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Desbloqueo</label>
                            <SegmentedControl
                                value={unlockMethod}
                                onChange={setUnlockMethod}
                                options={[
                                    { value: 'password', label: (<span className="flex items-center gap-1.5"><KeyRound size={16}/>Contraseña</span>) },
                                    { value: 'pattern', label: (<span className="flex items-center gap-1.5"><Lock size={16}/>Patrón</span>) }
                                ]}
                                className="mb-4"
                                size="sm"
                            />
                            
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
                                        <div className="flex justify-center">
                                            <PatternLock 
                                                onPatternComplete={handlePatternChange} 
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
                                <div className="flex justify-center">
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

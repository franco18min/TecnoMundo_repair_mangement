// frontend/src/components/OrderModal.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, ThumbsUp, ThumbsDown } from 'lucide-react';
import { searchClients } from '../api/customerApi';
import { fetchDeviceTypes } from '../api/deviceTypeApi';
import { createRepairOrder, fetchRepairOrderById, takeRepairOrder, updateRepairOrder } from '../api/repairOrdersApi';
import { ConfirmationModal } from './ConfirmationModal';

// --- COMPONENTES AUXILIARES ---
const DisplayField = ({ label, value, fullWidth = false }) => (
  value ? (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <p className="w-full bg-gray-100/70 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 min-h-[42px] whitespace-pre-wrap">{value}</p>
    </div>
  ) : null
);

const FormField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);

const TextAreaField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} {...props} rows="3" className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);

const PREDEFINED_QUESTIONS = [
    "¿El equipo enciende?",
    "¿La pantalla está rota?",
    "¿El equipo tiene daños por líquido?",
    "¿Se entrega con cargador?",
    "¿Se conoce la contraseña de desbloqueo?",
];

// --- COMPONENTE PRINCIPAL DEL MODAL ---
export function OrderModal({ isOpen, onClose, orderId, currentUser }) {

    const initialFormData = useMemo(() => ({
        dni: '', first_name: '', last_name: '', phone_number: '',
        device_type_id: '', device_model: '', serial_number: '', accesories: '',
        problem_description: '', observations: '', parts_used: '',
        technician_diagnosis: '', repair_notes: '',
        password_or_pattern: '', total_cost: '', deposit: '',
    }), []);

    const [formData, setFormData] = useState(initialFormData);
    const [fullOrderData, setFullOrderData] = useState(null);
    const [checklistItems, setChecklistItems] = useState([]);

    const [mode, setMode] = useState('create');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isTakeConfirmModalOpen, setIsTakeConfirmModalOpen] = useState(false);
    const [isUpdateConfirmModalOpen, setIsUpdateConfirmModalOpen] = useState(false);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [clientType, setClientType] = useState('nuevo');
    const [clientSearch, setClientSearch] = useState('');
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [sparePartStatus, setSparePartStatus] = useState('local');

    const isReadOnly = useMemo(() => mode === 'view' && currentUser.role?.role_name === 'Receptionist', [mode, currentUser]);
    const isTechEditMode = useMemo(() => mode === 'view' && currentUser.role?.role_name === 'Technical', [mode, currentUser]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!isOpen) return;

            setIsLoading(true);
            setError('');
            setFormData(initialFormData);
            setFullOrderData(null);
            setChecklistItems([]);
            setClientType('nuevo');
            setClientSearch('');
            setSelectedClientId(null);

            try {
                const types = await fetchDeviceTypes();
                setDeviceTypes(types);

                if (orderId) {
                    setMode('view');
                    const orderData = await fetchRepairOrderById(orderId);
                    setFullOrderData(orderData);

                    setFormData({
                        dni: orderData.customer.dni || '',
                        first_name: orderData.customer.first_name || '',
                        last_name: orderData.customer.last_name || '',
                        phone_number: orderData.customer.phone_number || '',
                        device_type_id: orderData.device_type?.id || '',
                        device_model: orderData.device_model || '',
                        serial_number: orderData.serial_number || '',
                        accesories: orderData.accesories || '',
                        problem_description: orderData.problem_description || '',
                        observations: orderData.observations || '',
                        password_or_pattern: orderData.password_or_pattern || '',
                        parts_used: orderData.parts_used || '',
                        technician_diagnosis: orderData.technician_diagnosis || '',
                        repair_notes: orderData.repair_notes || '',
                        total_cost: orderData.total_cost || '',
                        deposit: orderData.deposit || '',
                    });
                    setChecklistItems(orderData.device_conditions || []);
                } else {
                    setMode('create');
                }
            } catch (err) {
                setError("No se pudieron cargar los datos necesarios.");
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [isOpen, orderId, initialFormData]);

    useEffect(() => {
        const fetchClients = async () => {
            if (clientSearch.length < 3) {
                setClientSearchResults([]);
                return;
            }
            const results = await searchClients(clientSearch);
            setClientSearchResults(results);
        };
        const debounce = setTimeout(fetchClients, 300);
        return () => clearTimeout(debounce);
    }, [clientSearch]);

    const handleClientSelect = (client) => {
        setFormData(prev => ({ ...prev, first_name: client.first_name, last_name: client.last_name, phone_number: client.phone_number, dni: client.dni }));
        setSelectedClientId(client.id);
        setClientSearch(`${client.first_name} ${client.last_name}`);
        setClientSearchResults([]);
        setIsClientSearchFocused(false);
    };

    const handleFormChange = (e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));

    const handleChecklistChange = (index, field, value) => {
        const updatedItems = [...checklistItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setChecklistItems(updatedItems);
    };

    const handleAddQuestion = (e) => {
        const question = e.target.value;
        if (question && !checklistItems.find(item => item.check_description === question)) {
            setChecklistItems([...checklistItems, { check_description: question, client_answer: null }]);
        }
        e.target.value = '';
    };

    const handleRemoveQuestion = (questionToRemove) => {
        setChecklistItems(checklistItems.filter(item => item.check_description !== questionToRemove));
    };

    const handleTakeOrder = async () => {
        if (!orderId) return;
        setIsTakeConfirmModalOpen(false);
        setIsSubmitting(true);
        setError('');
        try {
            await takeRepairOrder(orderId, currentUser.id);
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo tomar la orden.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmUpdate = async () => {
        if (!orderId) return;
        setIsUpdateConfirmModalOpen(false);
        setIsSubmitting(true);
        setError('');

        const payload = {
            technician_diagnosis: formData.technician_diagnosis,
            repair_notes: formData.repair_notes,
            parts_used: formData.parts_used,
            total_cost: parseFloat(formData.total_cost) || 0,
            deposit: parseFloat(formData.deposit) || 0,
            checklist: checklistItems.map(item => ({
                check_description: item.check_description,
                client_answer: item.client_answer,
                technician_finding: item.technician_finding,
                technician_notes: item.technician_notes,
            })),
        };

        try {
            await updateRepairOrder(orderId, payload);
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo actualizar la orden.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'create') {
            setIsSubmitting(true);
            setError('');
            const payload = {
                customer: clientType === 'nuevo' ? { first_name: formData.first_name, last_name: formData.last_name, phone_number: formData.phone_number, dni: formData.dni } : null,
                customer_id: clientType === 'registrado' ? selectedClientId : null,
                device_type_id: parseInt(formData.device_type_id),
                device_model: formData.device_model,
                serial_number: formData.serial_number,
                problem_description: formData.problem_description,
                accesories: formData.accesories,
                observations: formData.observations,
                password_or_pattern: formData.password_or_pattern,
                is_spare_part_ordered: sparePartStatus === 'pedido',
                checklist: checklistItems.filter(item => item.client_answer !== null),
            };
            try {
                await createRepairOrder(payload);
                onClose(true);
            } catch (err) {
                setError(err.message || "No se pudo crear la orden.");
            } finally {
                 setIsSubmitting(false);
            }
        } else if (isTechEditMode) {
            setIsUpdateConfirmModalOpen(true);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {mode === 'create' ? 'Crear Nueva Orden' : `Detalles de la Orden #${orderId}`}
                        </h2>
                        <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center p-8">
                            <Loader className="animate-spin text-indigo-600" size={48} />
                        </div>
                    ) : (
                        <>
                            <form id="order-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">

                                <section>
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos del Cliente</h3>
                                    {mode === 'create' ? (
                                        <>
                                            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                                                <button type="button" onClick={() => setClientType('nuevo')} className={`w-1/2 p-2 rounded-md font-semibold ${clientType === 'nuevo' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Cliente Nuevo</button>
                                                <button type="button" onClick={() => setClientType('registrado')} className={`w-1/2 p-2 rounded-md font-semibold ${clientType === 'registrado' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Cliente Registrado</button>
                                            </div>
                                            {clientType === 'registrado' && (
                                                <div className="relative">
                                                    <FormField label="Buscar Cliente" id="client_search" type="text" placeholder="Buscar por Nombre, Apellido o DNI..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} onFocus={() => setIsClientSearchFocused(true)} onBlur={() => setTimeout(() => setIsClientSearchFocused(false), 200)} autoComplete="off" />
                                                    {isClientSearchFocused && clientSearchResults.length > 0 && (
                                                        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg"><AnimatePresence>{clientSearchResults.map(c => ( <motion.li key={c.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => handleClientSelect(c)}>{c.first_name} {c.last_name} ({c.dni})</motion.li> ))}</AnimatePresence></ul>
                                                    )}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <FormField label="DNI" name="dni" type="text" value={formData.dni} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                                <FormField label="Nombre" name="first_name" type="text" value={formData.first_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                                <FormField label="Apellido" name="last_name" type="text" value={formData.last_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                                <FormField label="Teléfono" name="phone_number" type="tel" value={formData.phone_number} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DisplayField label="DNI" value={formData.dni} />
                                            <DisplayField label="Nombre" value={formData.first_name} />
                                            <DisplayField label="Apellido" value={formData.last_name} />
                                            <DisplayField label="Teléfono" value={formData.phone_number} />
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos del Equipo y Falla</h3>
                                    {mode === 'create' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="device_type_id" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Dispositivo</label>
                                                <select id="device_type_id" name="device_type_id" value={formData.device_type_id} onChange={handleFormChange} className="w-full bg-gray-50 border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                                                    <option value="">Seleccione un tipo</option>
                                                    {deviceTypes.map(type => (<option key={type.id} value={type.id}>{type.type_name}</option>))}
                                                </select>
                                            </div>
                                            <FormField label="Modelo" name="device_model" value={formData.device_model} onChange={handleFormChange} required />
                                            <FormField label="Número de Serie" name="serial_number" value={formData.serial_number} onChange={handleFormChange} />
                                            <FormField label="Accesorios" name="accesories" value={formData.accesories} onChange={handleFormChange} />
                                            <div className="md:col-span-2"><TextAreaField label="Descripción del Problema" name="problem_description" value={formData.problem_description} onChange={handleFormChange} required /></div>
                                            <div className="md:col-span-2"><TextAreaField label="Observaciones" name="observations" value={formData.observations} onChange={handleFormChange} /></div>
                                            <div className="md:col-span-2"><FormField label="Contraseña / Patrón" name="password_or_pattern" value={formData.password_or_pattern} onChange={handleFormChange} /></div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Origen del Repuesto</label>
                                                <div className="flex bg-gray-100 rounded-lg p-1 h-[42px]">
                                                    <button type="button" onClick={() => setSparePartStatus('local')} className={`w-1/2 text-sm rounded-md font-semibold ${sparePartStatus === 'local' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>En Stock</button>
                                                    <button type="button" onClick={() => setSparePartStatus('pedido')} className={`w-1/2 text-sm rounded-md font-semibold ${sparePartStatus === 'pedido' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Para Pedir</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DisplayField label="Tipo de Dispositivo" value={deviceTypes.find(d => d.id === formData.device_type_id)?.type_name} />
                                            <DisplayField label="Modelo" value={formData.device_model} />
                                            <DisplayField label="Número de Serie" value={formData.serial_number} />
                                            <DisplayField label="Accesorios" value={formData.accesories} />
                                            <DisplayField label="Descripción del Problema" value={formData.problem_description} fullWidth={true} />
                                            <DisplayField label="Observaciones" value={formData.observations} fullWidth={true} />
                                            <DisplayField label="Contraseña / Patrón" value={formData.password_or_pattern} fullWidth={true} />
                                        </div>
                                    )}
                                </section>

                                {(isTechEditMode || (isReadOnly && fullOrderData?.technician_diagnosis)) && (
                                    <section>
                                        <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Diagnóstico Técnico</h3>
                                        <div className="space-y-4">
                                            {isTechEditMode ? (
                                                <>
                                                    <TextAreaField label="Diagnóstico del Técnico" name="technician_diagnosis" value={formData.technician_diagnosis} onChange={handleFormChange} />
                                                    <TextAreaField label="Notas de Reparación" name="repair_notes" value={formData.repair_notes} onChange={handleFormChange} />
                                                    <FormField label="Repuestos Utilizados" name="parts_used" value={formData.parts_used} onChange={handleFormChange} />
                                                </>
                                            ) : (
                                                <>
                                                    <DisplayField label="Diagnóstico del Técnico" value={formData.technician_diagnosis} fullWidth={true}/>
                                                    <DisplayField label="Notas de Reparación" value={formData.repair_notes} fullWidth={true}/>
                                                    <DisplayField label="Repuestos Utilizados" value={formData.parts_used} fullWidth={true}/>
                                                </>
                                            )}
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Checklist de Recepción</h3>
                                    {mode === 'create' && (
                                        <select onChange={handleAddQuestion} className="w-full bg-gray-50 border rounded-lg py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Añadir pregunta predeterminada...</option>
                                            {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                    )}
                                    <div className="space-y-3">
                                        {checklistItems.length > 0 ? checklistItems.map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-sm font-medium text-gray-800">{item.check_description}</p>
                                                    {mode === 'create' && <button type="button" onClick={() => handleRemoveQuestion(item.check_description)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-sm font-semibold text-gray-600 w-20'>Cliente:</span>
                                                        {mode === 'create' ? (
                                                            <>
                                                                <button type="button" onClick={() => handleChecklistChange(index, 'client_answer', true)} className={`p-1.5 rounded-full ${item.client_answer === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}><ThumbsUp size={16} /></button>
                                                                <button type="button" onClick={() => handleChecklistChange(index, 'client_answer', false)} className={`p-1.5 rounded-full ${item.client_answer === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}><ThumbsDown size={16} /></button>
                                                            </>
                                                        ) : (
                                                            item.client_answer === true ? <ThumbsUp size={18} className="text-green-500" /> : <ThumbsDown size={18} className="text-red-500" />
                                                        )}
                                                    </div>

                                                    {isTechEditMode && (
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                                            <button type="button" onClick={() => handleChecklistChange(index, 'technician_finding', true)} className={`p-1.5 rounded-full ${item.technician_finding === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}><ThumbsUp size={16} /></button>
                                                            <button type="button" onClick={() => handleChecklistChange(index, 'technician_finding', false)} className={`p-1.5 rounded-full ${item.technician_finding === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}><ThumbsDown size={16} /></button>
                                                            <input type="text" placeholder="Notas..." value={item.technician_notes || ''} onChange={(e) => handleChecklistChange(index, 'technician_notes', e.target.value)} className="text-sm border-b focus:outline-none focus:border-indigo-500 flex-1 ml-2 bg-transparent" />
                                                        </div>
                                                    )}

                                                    {isReadOnly && item.technician_finding !== null && (
                                                         <div className='flex items-center gap-2'>
                                                            <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                                            {item.technician_finding === true ? <ThumbsUp size={18} className="text-green-500" /> : item.technician_finding === false ? <ThumbsDown size={18} className="text-red-500" /> : <span className="text-xs text-gray-400">Sin revisar</span>}
                                                            {item.technician_notes && <p className="text-xs text-gray-500 ml-2 pl-2 border-l">| {item.technician_notes}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : <p className="text-sm text-gray-400 text-center py-4">No se registraron ítems en el checklist.</p>}
                                    </div>
                                </section>
                            </form>
                            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
                                {error && <p className="text-red-500 text-sm mr-auto self-center animate-pulse">{error}</p>}

                                {isTechEditMode && fullOrderData && !fullOrderData.technician && (
                                    <motion.button type="button" onClick={() => setIsTakeConfirmModalOpen(true)} disabled={isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Tomar Orden'}
                                    </motion.button>
                                )}

                                {(mode === 'create' || (isTechEditMode && fullOrderData?.technician)) && (
                                     <motion.button type="submit" form="order-form" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : (mode === 'create' ? 'Guardar Orden' : 'Actualizar Orden')}
                                    </motion.button>
                                )}

                                <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>

            <ConfirmationModal
                isOpen={isTakeConfirmModalOpen}
                onClose={() => setIsTakeConfirmModalOpen(false)}
                onConfirm={handleTakeOrder}
                title="Confirmar Acción"
                message="¿Estás seguro de que quieres tomar esta orden? Se te asignará como técnico y el estado cambiará a 'En Proceso'."
                confirmText="Sí, tomar orden"
            />

            <ConfirmationModal
                isOpen={isUpdateConfirmModalOpen}
                onClose={() => setIsUpdateConfirmModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                title="Finalizar Reparación"
                message="¿Estás seguro de que quieres actualizar esta orden? Al hacerlo, la marcarás como 'Completada' y no podrás revertir esta acción."
                confirmText="Sí, completar orden"
            />
        </>
    );
}
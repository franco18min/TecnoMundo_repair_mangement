import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Wrench } from 'lucide-react';

// --- INICIO DE LA NUEVA FUNCIONALIDAD ---
import {
    createRepairOrder, fetchRepairOrderById, takeRepairOrder, reopenRepairOrder, completeRepairOrder, updateOrderDetails, deliverRepairOrder, updateOrderDiagnosis
} from '../../../api/repairOrdersApi';
// --- FIN DE LA NUEVA FUNCIONALIDAD ---
import { searchClients } from '../../../api/customerApi';
import { fetchDeviceTypes } from '../../../api/deviceTypeApi';

import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../context/ToastContext';

import { ClientSection } from './ClientSection';
import { EquipmentSection } from './EquipmentSection';
import { CostsSection } from './CostsSection';
import { DiagnosisSection } from './DiagnosisSection';
import { ChecklistSection } from './ChecklistSection';
import { ChecklistModal } from './ChecklistModal';
import { ModalFooter } from './ModalFooter';
import { OrderPrinter } from '../tickets/OrderPrinter';
import { TechPanelDrawer } from './TechPanelDrawer';


export function OrderModal({ isOpen, onClose, orderId, currentUser }) {
    const initialFormData = useMemo(() => ({
        dni: '', first_name: '', last_name: '', phone_number: '', device_type_id: '', device_model: '',
        serial_number: '', accesories: '', problem_description: '', observations: '', parts_used: '',
        technician_diagnosis: '', repair_notes: '', password_or_pattern: '', total_cost: '', deposit: '', balance: 0,
    }), []);

    const [formData, setFormData] = useState(initialFormData);
    const [fullOrderData, setFullOrderData] = useState(null);
    const [checklistItems, setChecklistItems] = useState([]);
    const [unlockMethod, setUnlockMethod] = useState('password');
    const [mode, setMode] = useState(orderId ? 'view' : 'create');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isTakeConfirmModalOpen, setIsTakeConfirmModalOpen] = useState(false);
    const [isUpdateConfirmModalOpen, setIsUpdateConfirmModalOpen] = useState(false);
    const [isReopenConfirmOpen, setIsReopenConfirmOpen] = useState(false);
    // --- INICIO DE LA NUEVA FUNCIONALIDAD ---
    const [isDeliverConfirmModalOpen, setIsDeliverConfirmModalOpen] = useState(false);
    // --- FIN DE LA NUEVA FUNCIONALIDAD ---
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [clientType, setClientType] = useState('nuevo');
    const [clientSearch, setClientSearch] = useState('');
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [sparePartStatus, setSparePartStatus] = useState('local');
    const printerRef = useRef();
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [isTechPanelOpen, setIsTechPanelOpen] = useState(false);

    const permissions = usePermissions(mode, fullOrderData, currentUser);
    const { showToast } = useToast();

    useEffect(() => {
        const loadInitialData = async () => {
            if (!isOpen) return;
            setIsLoading(true); setError(''); setFormData(initialFormData); setFullOrderData(null); setChecklistItems([]);
            setClientType('nuevo'); setClientSearch(''); setSelectedClientId(null); setUnlockMethod('password'); setMode(orderId ? 'view' : 'create'); setSparePartStatus('local'); setIsTechPanelOpen(false);
            try {
                const types = await fetchDeviceTypes();
                setDeviceTypes(types);
                if (orderId) {
                    const orderData = await fetchRepairOrderById(orderId);
                    setFullOrderData(orderData);
                    setFormData({
                        dni: orderData.customer?.dni || '', first_name: orderData.customer?.first_name || '', last_name: orderData.customer?.last_name || '',
                        phone_number: orderData.customer?.phone_number || '', device_type_id: orderData.device_type?.id || '', device_model: orderData.device_model || '',
                        serial_number: orderData.serial_number || '', accesories: orderData.accesories || '', problem_description: orderData.problem_description || '',
                        observations: orderData.observations || '', password_or_pattern: orderData.password_or_pattern || '', parts_used: orderData.parts_used || '',
                        technician_diagnosis: orderData.technician_diagnosis || '', repair_notes: orderData.repair_notes || '',
                        total_cost: orderData.total_cost ?? '', deposit: orderData.deposit ?? '', balance: orderData.balance ?? 0,
                    });
                    setChecklistItems(orderData.device_conditions || []);
                    // Seleccionar automáticamente el método de desbloqueo según el valor almacenado
                    const isPattern = !!orderData.password_or_pattern && orderData.password_or_pattern.includes('-');
                    setUnlockMethod(isPattern ? 'pattern' : 'password');
                }
            } catch (err) { setError("No se pudieron cargar los datos necesarios."); } finally { setIsLoading(false); }
        };
        loadInitialData();
    }, [isOpen, orderId, initialFormData]);

    useEffect(() => {
        const fetchClients = async () => {
            if (clientSearch.length < 3) { setClientSearchResults([]); return; }
            const results = await searchClients(clientSearch);
            setClientSearchResults(results);
        };
        const debounce = setTimeout(fetchClients, 300);
        return () => clearTimeout(debounce);
    }, [clientSearch]);

    useEffect(() => {
        const cost = Number(formData.total_cost) || 0;
        const deposit = Number(formData.deposit) || 0;
        setFormData(prev => ({ ...prev, balance: cost - deposit }));
    }, [formData.total_cost, formData.deposit]);

    const handleClientSelect = (client) => {
        setFormData(prev => ({ ...prev, first_name: client.first_name, last_name: client.last_name, phone_number: client.phone_number, dni: client.dni }));
        setSelectedClientId(client.id); setClientSearch(`${client.first_name} ${client.last_name}`); setClientSearchResults([]); setIsClientSearchFocused(false);
    };

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePatternChange = useCallback((pattern) => { setFormData(prev => ({ ...prev, password_or_pattern: pattern })); }, []);
    const handleChecklistChange = (index, field, value) => { const updatedItems = [...checklistItems]; updatedItems[index] = { ...updatedItems[index], [field]: value }; setChecklistItems(updatedItems); };
    const handleAddQuestion = (e) => {
        const question = e.target.value;
        if (question && !checklistItems.find(item => item.check_description === question)) { setChecklistItems([{ check_description: question, client_answer: null }, ...checklistItems]); }
        e.target.value = '';
    };
    const handleRemoveQuestion = (questionToRemove) => setChecklistItems(checklistItems.filter(item => item.check_description !== questionToRemove));

    // Función para cargar preguntas predeterminadas
    const handleLoadDefaultQuestions = (defaultQuestions) => {
        if (defaultQuestions && defaultQuestions.length > 0) {
            const newChecklistItems = defaultQuestions.map(question => ({
                check_description: question.question,
                client_answer: null,
                technician_finding: null,
                technician_notes: null
            }));

            // Evitar duplicados - solo agregar preguntas que no existan ya
            const existingQuestions = checklistItems.map(item => item.check_description);
            const uniqueNewItems = newChecklistItems.filter(
                newItem => !existingQuestions.includes(newItem.check_description)
            );

            if (uniqueNewItems.length > 0) {
                setChecklistItems([...checklistItems, ...uniqueNewItems]);
                showToast(`${uniqueNewItems.length} preguntas predeterminadas cargadas`, 'success');
            } else {
                showToast('Las preguntas predeterminadas ya están cargadas', 'info');
            }
        }
    };

    const handleTakeOrder = async () => {
        if (!orderId) return;
        setIsTakeConfirmModalOpen(false);
        setIsSubmitting(true);
        setError('');
        try {
            await takeRepairOrder(orderId);
            showToast('Orden tomada con éxito', 'success');
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo tomar la orden.");
            showToast(err.message || "No se pudo tomar la orden", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReopenOrder = async () => {
        if (!orderId) return;
        setIsReopenConfirmOpen(false);
        setIsSubmitting(true);
        setError('');
        try {
            await reopenRepairOrder(orderId);
            showToast('Orden reabierta con éxito', 'success');
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo reabrir la orden.");
            showToast(err.message || "No se pudo reabrir la orden", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- INICIO DE LA NUEVA FUNCIONALIDAD ---
    const handleDeliverOrder = async () => {
        if (!orderId) return;
        setIsDeliverConfirmModalOpen(false);
        setIsSubmitting(true);
        setError('');
        try {
            await deliverRepairOrder(orderId);
            showToast('¡Orden entregada correctamente!', 'success');
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo entregar la orden.");
            showToast(err.message || "No se pudo entregar la orden.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- FIN DE LA NUEVA FUNCIONALIDAD ---

    const handleConfirmUpdate = async () => {
        if (!orderId) return;
        setIsUpdateConfirmModalOpen(false);
        setIsSubmitting(true);
        setError('');

        const payload = {
            technician_diagnosis: formData.technician_diagnosis,
            repair_notes: formData.repair_notes,
            parts_used: formData.parts_used,
            total_cost: Number(formData.total_cost) || 0,
            deposit: Number(formData.deposit) || 0,
            is_spare_part_ordered: sparePartStatus === 'pedido',
            checklist: checklistItems.map(item => ({
                check_description: item.check_description,
                client_answer: item.client_answer,
                technician_finding: item.technician_finding,
                technician_notes: item.technician_notes,
            })),
        };

        try {
            await completeRepairOrder(orderId, payload);
            showToast('Orden completada con éxito', 'success');
            onClose(true);
        } catch (err) {
            setError(err.message || "No se pudo actualizar la orden.");
            showToast(err.message || "No se pudo actualizar la orden", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const payload = {
            customer: clientType === 'nuevo' ? { first_name: formData.first_name, last_name: formData.last_name, phone_number: formData.phone_number, dni: formData.dni } : null,
            customer_id: clientType === 'registrado' ? selectedClientId : null,
            device_type_id: parseInt(formData.device_type_id), device_model: formData.device_model, serial_number: formData.serial_number,
            problem_description: formData.problem_description, accesories: formData.accesories, observations: formData.observations,
            password_or_pattern: formData.password_or_pattern, total_cost: Number(formData.total_cost) || 0, deposit: Number(formData.deposit) || 0,
            parts_used: formData.parts_used,
            technician_diagnosis: formData.technician_diagnosis,
            repair_notes: formData.repair_notes,
            is_spare_part_ordered: sparePartStatus === 'pedido',
            checklist: checklistItems.filter(item => item.client_answer !== null),
        };

        if (mode === 'create') {
            setIsSubmitting(true);
            try {
                const newOrder = await createRepairOrder(payload);
                showToast('Orden creada con éxito', 'success');
                printerRef.current?.triggerPrint(newOrder);
                onClose(true);
            } catch (err) {
                setError(err.message || "No se pudo crear la orden.");
                showToast(err.message || "No se pudo crear la orden", 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
        else if (mode === 'edit') {
            setIsSubmitting(true);
            try {
                // Si es técnico y solo puede editar diagnóstico, usar endpoint específico
                if (permissions.canModifyForDiagnosis && !permissions.canModifyOrder) {
                    // Técnico: solo enviar campos de diagnóstico
                    const diagnosisPayload = {
                        technician_diagnosis: formData.technician_diagnosis,
                        repair_notes: formData.repair_notes
                    };
                    await updateOrderDiagnosis(orderId, diagnosisPayload);
                } else {
                    // Admin/Recepcionista: usar endpoint completo
                    await updateOrderDetails(orderId, payload);
                }
                showToast('Orden modificada con éxito', 'success');
                onClose(true);
            } catch (err) {
                setError(err.message || "No se pudo modificar la orden.");
                showToast(err.message || "No se pudo modificar la orden", 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
        else if (mode === 'view' && permissions.canCompleteOrder) {
            // Abrir confirmación para completar la orden
            setIsUpdateConfirmModalOpen(true);
            setIsSubmitting(false);
        } else {
            // No hay acción válida en este modo
            setIsSubmitting(false);
        }
    };

    const handleDirectPrint = (config = { client: true, workshop: true }) => {
        if (fullOrderData) {
            printerRef.current?.triggerPrint(fullOrderData, config);
        }
    };

    const isPatternValue = formData.password_or_pattern && formData.password_or_pattern.includes('-');

    // Logs de debugging fuera del JSX

    return (
        <>
            <OrderPrinter ref={printerRef} />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}

                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-[96vw] sm:max-w-[1200px] h-[96vh] flex flex-col relative overflow-hidden"
                            initial={{ scale: 0.9, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-white z-10">
                                <AnimatePresence mode="wait">
                                    <motion.h2 key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xl sm:text-2xl font-bold text-gray-800">
                                        {mode === 'create' ? 'Crear Nueva Orden' : (mode === 'edit' ? `Modificando Orden #${orderId}` : `Detalles de la Orden #${orderId}`)}
                                    </motion.h2>
                                </AnimatePresence>
                                <div className="flex items-center gap-2">
                                    {mode !== 'create' && (
                                        <motion.button
                                            type="button"
                                            onClick={() => setIsTechPanelOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Wrench size={16} />
                                            <span className="hidden sm:inline">Panel Técnico</span>
                                        </motion.button>
                                    )}
                                    <motion.button
                                        onClick={() => onClose(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <X size={24} />
                                    </motion.button>
                                </div>
                            </div>
                            {isLoading ? (<div className="flex-1 flex justify-center items-center p-6 sm:p-8"><Loader className="animate-spin text-indigo-600" size={48} /></div>) : (
                                <>
                                    <form id="order-form" onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <ClientSection permissions={permissions} formData={formData} handleFormChange={handleFormChange} clientType={clientType} setClientType={setClientType} clientSearch={clientSearch} setClientSearch={setClientSearch} clientSearchResults={clientSearchResults} isClientSearchFocused={isClientSearchFocused} setIsClientSearchFocused={setIsClientSearchFocused} handleClientSelect={handleClientSelect} />
                                                <CostsSection mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange} />
                                                <div className="bg-white border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-indigo-700">Checklist de Recepción</h3>
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => setIsChecklistOpen(true)}
                                                            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Abrir Checklist
                                                        </motion.button>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">Ítems: {checklistItems.length}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <EquipmentSection mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange} deviceTypes={deviceTypes} sparePartStatus={sparePartStatus} setSparePartStatus={setSparePartStatus} unlockMethod={unlockMethod} setUnlockMethod={setUnlockMethod} handlePatternChange={handlePatternChange} isPatternValue={isPatternValue} fullOrderData={fullOrderData} />
                                            </div>
                                        </div>
                                    </form>

                                    {/* Tech Panel Drawer */}
                                    <TechPanelDrawer
                                        isOpen={isTechPanelOpen}
                                        onClose={() => setIsTechPanelOpen(false)}
                                    >
                                        <DiagnosisSection mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange} orderId={orderId} />
                                    </TechPanelDrawer>

                                    <ModalFooter
                                        mode={mode}
                                        permissions={permissions}
                                        onClose={onClose}
                                        isSubmitting={isSubmitting}
                                        error={error}
                                        setIsTakeConfirmModalOpen={setIsTakeConfirmModalOpen}
                                        setIsReopenConfirmOpen={setIsReopenConfirmOpen}
                                        // --- INICIO DE LA NUEVA FUNCIONALIDAD ---
                                        setIsDeliverConfirmModalOpen={setIsDeliverConfirmModalOpen}
                                        // --- FIN DE LA NUEVA FUNCIONALIDAD ---
                                        handlePrint={handleDirectPrint}
                                        setMode={setMode}
                                        currentUser={currentUser}
                                    />

                                    {/* Floating Tech Panel Button removed */}


                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal isOpen={isTakeConfirmModalOpen} onClose={() => setIsTakeConfirmModalOpen(false)} onConfirm={handleTakeOrder} title="Confirmar Acción" message="¿Estás seguro de que quieres tomar esta orden? Se te asignará como técnico y el estado cambiará a 'En Proceso'." confirmText="Sí, tomar orden" />
            <ConfirmationModal isOpen={isUpdateConfirmModalOpen} onClose={() => setIsUpdateConfirmModalOpen(false)} onConfirm={handleConfirmUpdate} title="Completar Orden" message={`¿Confirmas que deseas completar la orden #${orderId}? Revisa el diagnóstico, repuestos y costos antes de confirmar.`} confirmText="Sí, completar" />
            <ConfirmationModal isOpen={isReopenConfirmOpen} onClose={() => setIsReopenConfirmOpen(false)} onConfirm={handleReopenOrder} title="Confirmar Reapertura" message={`¿Estás seguro de que quieres reabrir la orden #${orderId} y pasarla al estado 'En Proceso'?`} confirmText="Sí, Reabrir" />
            {/* --- INICIO DE LA NUEVA FUNCIONALIDAD --- */}
            <ConfirmationModal isOpen={isDeliverConfirmModalOpen} onClose={() => setIsDeliverConfirmModalOpen(false)} onConfirm={handleDeliverOrder} title="Confirmar Entrega" message={`¿Confirmas que has entregado el equipo asociado a la orden #${orderId} al cliente?`} confirmText="Sí, Entregar" />
            {/* --- FIN DE LA NUEVA FUNCIONALIDAD --- */}
            <ChecklistModal
                isOpen={isChecklistOpen}
                onClose={() => setIsChecklistOpen(false)}
                permissions={permissions}
                checklistItems={checklistItems}
                handleAddQuestion={handleAddQuestion}
                handleRemoveQuestion={handleRemoveQuestion}
                handleChecklistChange={handleChecklistChange}
                onLoadDefaultQuestions={handleLoadDefaultQuestions}
            />
        </>
    );
}

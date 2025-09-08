import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';

import { searchClients } from '../../api/customerApi';
import { fetchDeviceTypes } from '../../api/deviceTypeApi';
import { createRepairOrder, fetchRepairOrderById, takeRepairOrder, updateRepairOrder } from '../../api/repairOrdersApi';

import { ConfirmationModal } from '../ConfirmationModal';
import { usePermissions } from '../../hooks/usePermissions';

import { ClientSection } from './ClientSection';
import { EquipmentSection } from './EquipmentSection';
import { CostsSection } from './CostsSection';
import { DiagnosisSection } from './DiagnosisSection';
import { ChecklistSection } from './ChecklistSection';
import { ModalFooter } from './ModalFooter';

export function OrderModal({ isOpen, onClose, orderId }) {

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
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [clientType, setClientType] = useState('nuevo');
    const [clientSearch, setClientSearch] = useState('');
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [sparePartStatus, setSparePartStatus] = useState('local');

    const permissions = usePermissions(mode, fullOrderData);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!isOpen) return;
            setIsLoading(true); setError(''); setFormData(initialFormData); setFullOrderData(null); setChecklistItems([]);
            setClientType('nuevo'); setClientSearch(''); setSelectedClientId(null); setUnlockMethod('password'); setMode(orderId ? 'view' : 'create'); setSparePartStatus('local');
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

    const handleFormChange = (e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    const handlePatternChange = useCallback((pattern) => { setFormData(prev => ({ ...prev, password_or_pattern: pattern })); }, []);
    const handleChecklistChange = (index, field, value) => { const updatedItems = [...checklistItems]; updatedItems[index] = { ...updatedItems[index], [field]: value }; setChecklistItems(updatedItems); };
    const handleAddQuestion = (e) => {
        const question = e.target.value;
        if (question && !checklistItems.find(item => item.check_description === question)) { setChecklistItems([...checklistItems, { check_description: question, client_answer: null }]); }
        e.target.value = '';
    };
    const handleRemoveQuestion = (questionToRemove) => setChecklistItems(checklistItems.filter(item => item.check_description !== questionToRemove));
    const handleTakeOrder = async () => {
        if (!orderId) return;
        setIsTakeConfirmModalOpen(false); setIsSubmitting(true); setError('');
        try { await takeRepairOrder(orderId); onClose(true); }
        catch (err) { setError(err.message || "No se pudo tomar la orden."); }
        finally { setIsSubmitting(false); }
    };
    const handleConfirmUpdate = async () => {
        if (!orderId) return;
        setIsUpdateConfirmModalOpen(false); setIsSubmitting(true); setError('');
        const payload = {
            technician_diagnosis: formData.technician_diagnosis, repair_notes: formData.repair_notes, parts_used: formData.parts_used,
            total_cost: Number(formData.total_cost) || 0, deposit: Number(formData.deposit) || 0,
            checklist: checklistItems.map(item => ({ check_description: item.check_description, client_answer: item.client_answer, technician_finding: item.technician_finding, technician_notes: item.technician_notes })),
        };
        try { await updateRepairOrder(orderId, payload); onClose(true); }
        catch (err) { setError(err.message || "No se pudo actualizar la orden."); }
        finally { setIsSubmitting(false); }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'create') {
            setIsSubmitting(true); setError('');
            const payload = {
                customer: clientType === 'nuevo' ? { first_name: formData.first_name, last_name: formData.last_name, phone_number: formData.phone_number, dni: formData.dni } : null,
                customer_id: clientType === 'registrado' ? selectedClientId : null,
                device_type_id: parseInt(formData.device_type_id), device_model: formData.device_model, serial_number: formData.serial_number,
                problem_description: formData.problem_description, accesories: formData.accesories, observations: formData.observations,
                password_or_pattern: formData.password_or_pattern, total_cost: Number(formData.total_cost) || 0, deposit: Number(formData.deposit) || 0,
                parts_used: formData.parts_used,
                is_spare_part_ordered: sparePartStatus === 'pedido',
                checklist: checklistItems.filter(item => item.client_answer !== null),
            };
            try { await createRepairOrder(payload); onClose(true); }
            catch (err) { setError(err.message || "No se pudo crear la orden."); }
            finally { setIsSubmitting(false); }
        } else if (permissions.canEditDiagnosisPanel) { setIsUpdateConfirmModalOpen(true); }
    };

    const isPatternValue = formData.password_or_pattern && formData.password_or_pattern.includes('-');
    if (!isOpen) return null;

    return (
        <>
            <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <AnimatePresence mode="wait"><motion.h2 key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-2xl font-bold text-gray-800">{mode === 'create' ? 'Crear Nueva Orden' : `Detalles de la Orden #${orderId}`}</motion.h2></AnimatePresence>
                        <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    {isLoading ? (<div className="flex-1 flex justify-center items-center p-8"><Loader className="animate-spin text-indigo-600" size={48} /></div>) : (
                        <>
                            <form id="order-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">
                                <ClientSection
                                    permissions={permissions} formData={formData} handleFormChange={handleFormChange}
                                    clientType={clientType} setClientType={setClientType} clientSearch={clientSearch}
                                    setClientSearch={setClientSearch} clientSearchResults={clientSearchResults}
                                    isClientSearchFocused={isClientSearchFocused} setIsClientSearchFocused={setIsClientSearchFocused}
                                    handleClientSelect={handleClientSelect}
                                />
                                <EquipmentSection
                                    mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange}
                                    deviceTypes={deviceTypes} sparePartStatus={sparePartStatus} setSparePartStatus={setSparePartStatus}
                                    unlockMethod={unlockMethod} setUnlockMethod={setUnlockMethod} handlePatternChange={handlePatternChange}
                                    isPatternValue={isPatternValue}
                                />
                                <CostsSection mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange} />
                                <DiagnosisSection mode={mode} permissions={permissions} formData={formData} handleFormChange={handleFormChange} />
                                <ChecklistSection
                                    mode={mode} permissions={permissions} checklistItems={checklistItems} handleAddQuestion={handleAddQuestion}
                                    handleRemoveQuestion={handleRemoveQuestion} handleChecklistChange={handleChecklistChange}
                                />
                            </form>
                            <ModalFooter
                                mode={mode} permissions={permissions} onClose={onClose}
                                isSubmitting={isSubmitting} error={error}
                            />
                        </>
                    )}
                </motion.div>
            </motion.div>
            <ConfirmationModal isOpen={isTakeConfirmModalOpen} onClose={() => setIsTakeConfirmModalOpen(false)} onConfirm={handleTakeOrder} title="Confirmar Acción" message="¿Estás seguro de que quieres tomar esta orden? Se te asignará como técnico y el estado cambiará a 'En Proceso'." confirmText="Sí, tomar orden" />
            <ConfirmationModal isOpen={isUpdateConfirmModalOpen} onClose={() => setIsUpdateConfirmModalOpen(false)} onConfirm={handleConfirmUpdate} title="Actualizar Orden" message="¿Estás seguro de que quieres guardar los cambios en esta orden? Revisa el diagnóstico y los repuestos utilizados antes de confirmar." confirmText="Sí, actualizar orden" />
        </>
    );
}
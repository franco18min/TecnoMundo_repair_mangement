import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField } from './shared';
import { searchClients } from '../../../api/customerApi';

export function ClientSection({ permissions, formData, handleFormChange, clientType, setClientType, clientSearch, setClientSearch, clientSearchResults, isClientSearchFocused, setIsClientSearchFocused, handleClientSelect }) {
    const handleAutoLookup = async (field, value) => {
        const q = String(value || '').trim();
        if (q.length < 3 && (field === 'first_name' || field === 'last_name')) return;
        if (q.length < 4 && (field === 'dni' || field === 'phone_number')) return;
        const results = await searchClients(q);
        const norm = (s) => String(s || '').trim().toLowerCase();
        let match = null;
        if (field === 'dni') match = results.find(c => norm(c.dni) === norm(q));
        else if (field === 'phone_number') match = results.find(c => norm(c.phone_number) === norm(q));
        else if (field === 'first_name') match = results.find(c => norm(c.first_name) === norm(q));
        else if (field === 'last_name') match = results.find(c => norm(c.last_name) === norm(q));
        if (!match) match = results[0];
        if (match) { setClientType('registrado'); handleClientSelect(match); } else { setClientType('nuevo'); }
    };

    const lookupTimer = useRef(null);
    const scheduleLookup = (field, value) => {
        if (lookupTimer.current) clearTimeout(lookupTimer.current);
        lookupTimer.current = setTimeout(() => handleAutoLookup(field, value), 300);
    };
    return (
        <section>
            <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Datos del Cliente</h3>
            {permissions.canEditInitialDetails ? (
                <AnimatePresence mode="wait">
                    <motion.div key={clientType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                            <FormField label="Nombre" name="first_name" type="text" value={formData.first_name} onChange={(e) => { handleFormChange(e); scheduleLookup('first_name', e.target.value); }} required={clientType === 'nuevo'} />
                            <FormField label="Apellido" name="last_name" type="text" value={formData.last_name} onChange={(e) => { handleFormChange(e); scheduleLookup('last_name', e.target.value); }} required={clientType === 'nuevo'} />
                            <FormField label="Teléfono" name="phone_number" type="tel" value={formData.phone_number} onChange={(e) => { handleFormChange(e); scheduleLookup('phone_number', e.target.value); }} required={clientType === 'nuevo'} />
                            <FormField label="DNI" name="dni" type="text" value={formData.dni} onChange={(e) => { handleFormChange(e); scheduleLookup('dni', e.target.value); }} required={clientType === 'nuevo'} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <DisplayField label="Nombre" value={formData.first_name} />
                    <DisplayField label="Apellido" value={formData.last_name} />
                    <DisplayField label="Teléfono" value={formData.phone_number} />
                    <DisplayField label="DNI" value={formData.dni} />
                </div>
            )}
        </section>
    );
}

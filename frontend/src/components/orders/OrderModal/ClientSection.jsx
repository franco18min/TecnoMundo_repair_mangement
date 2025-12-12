import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField } from './shared';
import { searchClients } from '../../../api/customerApi';
import { Users, UserPlus } from 'lucide-react';

export function ClientSection({ permissions, formData, handleFormChange, clientType, setClientType, clientSearch, setClientSearch, clientSearchResults, isClientSearchFocused, setIsClientSearchFocused, handleClientSelect }) {
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [showMatchSelection, setShowMatchSelection] = useState(false);

    const handleAutoLookup = async (field, value) => {
        const q = String(value || '').trim();
        if (q.length < 3 && (field === 'first_name' || field === 'last_name')) return;
        if (q.length < 4 && (field === 'dni' || field === 'phone_number')) return;
        
        try {
            const results = await searchClients(q);
            if (results && results.length > 0) {
                setPotentialMatches(results);
                setShowMatchSelection(true);
            } else {
                setShowMatchSelection(false);
                setPotentialMatches([]);
                setClientType('nuevo');
            }
        } catch (error) {
            console.error("Error searching clients", error);
        }
    };

    const handleConfirmNewClient = () => {
        setShowMatchSelection(false);
        setClientType('nuevo');
        setPotentialMatches([]);
    };

    const handleSelectExisting = (client) => {
        setClientType('registrado');
        handleClientSelect(client);
        setShowMatchSelection(false);
        setPotentialMatches([]);
    };

    const lookupTimer = useRef(null);
    const scheduleLookup = (field, value) => {
        if (clientType === 'registrado') return; // Don't lookup if already selected/registered to avoid loops
        if (lookupTimer.current) clearTimeout(lookupTimer.current);
        lookupTimer.current = setTimeout(() => handleAutoLookup(field, value), 500); // Increased debounce slightly
    };

    return (
        <section>
            <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Datos del Cliente</h3>
            {permissions.canEditInitialDetails ? (
                <>
                    <AnimatePresence>
                        {showMatchSelection && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 overflow-hidden"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                                        <Users size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-amber-900 mb-1">
                                            ¿Es un cliente nuevo?
                                        </h4>
                                        <p className="text-sm text-amber-700 mb-3">
                                            Hemos encontrado {potentialMatches.length} cliente{potentialMatches.length !== 1 ? 's' : ''} similar{potentialMatches.length !== 1 ? 'es' : ''} en la base de datos.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={handleConfirmNewClient}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                <UserPlus size={16} />
                                                Sí, es cliente nuevo
                                            </button>
                                        </div>

                                        <div className="bg-white rounded-md border border-amber-100 shadow-sm max-h-48 overflow-y-auto">
                                            <p className="text-xs font-semibold text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-100">
                                                O seleccione uno existente:
                                            </p>
                                            <div className="divide-y divide-gray-100">
                                                {potentialMatches.map(client => (
                                                    <button
                                                        key={client.id}
                                                        type="button"
                                                        onClick={() => handleSelectExisting(client)}
                                                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors flex flex-col group"
                                                    >
                                                        <span className="font-medium text-gray-800 group-hover:text-indigo-700">
                                                            {client.first_name} {client.last_name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            DNI: {client.dni} • Tel: {client.phone_number}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                </>
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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisplayField, FormField } from './shared';

export function ClientSection({ permissions, formData, handleFormChange, clientType, setClientType, clientSearch, setClientSearch, clientSearchResults, isClientSearchFocused, setIsClientSearchFocused, handleClientSelect }) {
    return (
        <section>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos del Cliente</h3>
            {permissions.canEditInitialDetails ? (
                <AnimatePresence mode="wait">
                    <motion.div key={clientType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                            <button type="button" onClick={() => setClientType('nuevo')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-200 ${clientType === 'nuevo' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600'}`}>Cliente Nuevo</button>
                            <button type="button" onClick={() => setClientType('registrado')} className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-200 ${clientType === 'registrado' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600'}`}>Cliente Registrado</button>
                        </div>
                        {clientType === 'registrado' && (
                            <div className="relative">
                                <FormField label="Buscar Cliente" id="client_search" type="text" placeholder="Buscar por Nombre, Apellido o DNI..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} onFocus={() => setIsClientSearchFocused(true)} onBlur={() => setTimeout(() => setIsClientSearchFocused(false), 200)} autoComplete="off" />
                                {isClientSearchFocused && clientSearchResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        <AnimatePresence>
                                            {clientSearchResults.map(c => ( <motion.li key={c.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => handleClientSelect(c)}>{c.first_name} {c.last_name} ({c.dni})</motion.li> ))}
                                        </AnimatePresence>
                                    </ul>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField label="DNI" name="dni" type="text" value={formData.dni} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                            <FormField label="Nombre" name="first_name" type="text" value={formData.first_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                            <FormField label="Apellido" name="last_name" type="text" value={formData.last_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                            <FormField label="Teléfono" name="phone_number" type="tel" value={formData.phone_number} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="DNI" value={formData.dni} />
                    <DisplayField label="Nombre" value={formData.first_name} />
                    <DisplayField label="Apellido" value={formData.last_name} />
                    <DisplayField label="Teléfono" value={formData.phone_number} />
                </div>
            )}
        </section>
    );
}
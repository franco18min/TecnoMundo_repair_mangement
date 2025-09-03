// frontend/src/components/NewOrderModal.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, GitCommit, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { searchClients } from '../api/customerApi';
import { fetchDeviceTypes } from '../api/deviceTypeApi';
import { createRepairOrder } from '../api/repairOrdersApi';

const PREDEFINED_QUESTIONS = [
    "¿El equipo enciende?",
    "¿La pantalla está rota?",
    "¿El equipo tiene daños por líquido?",
    "¿Se entrega con cargador?",
    "¿Se conoce la contraseña de desbloqueo?",
];

const FormField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);

const TextAreaField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} {...props} rows="2" className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);

const PatternLock = ({ onPatternComplete }) => {
    const svgRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [lines, setLines] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPos, setCurrentPos] = useState(null);
    const pointCoordinates = useMemo(() => [
        { x: 50, y: 50 }, { x: 150, y: 50 }, { x: 250, y: 50 },
        { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 150 },
        { x: 50, y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 },
    ], []);

    const getCoordsFromEvent = (e) => {
        const svg = svgRef.current;
        if (!svg) return null;
        const rect = svg.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    const getPointFromCoords = (coords) => {
        if (!coords) return null;
        for (let i = 0; i < pointCoordinates.length; i++) {
            const p = pointCoordinates[i];
            const distance = Math.sqrt(Math.pow(p.x - coords.x, 2) + Math.pow(p.y - coords.y, 2));
            if (distance < 25) return i;
        }
        return null;
    };

    const handleInteractionStart = (e) => {
        e.preventDefault();
        resetPattern();
        setIsDrawing(true);
        const pointIndex = getPointFromCoords(getCoordsFromEvent(e));
        if (pointIndex !== null) setPoints([pointIndex]);
    };

    const handleInteractionMove = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoordsFromEvent(e);
        setCurrentPos(coords);
        const pointIndex = getPointFromCoords(coords);
        if (pointIndex !== null && !points.includes(pointIndex)) {
            const lastPoint = points[points.length - 1];
            setLines([...lines, { from: lastPoint, to: pointIndex }]);
            setPoints([...points, pointIndex]);
        }
    };

    const handleInteractionEnd = (e) => {
        e.preventDefault();
        if (isDrawing) {
            setIsDrawing(false);
            setCurrentPos(null);
            onPatternComplete(points);
        }
    };

    const resetPattern = () => {
        setPoints([]);
        setLines([]);
        onPatternComplete([]);
    }

    return (
        <div className="flex flex-col items-center">
            <svg ref={svgRef} width="300" height="300" className="bg-gray-100 rounded-lg cursor-pointer touch-none"
                onMouseDown={handleInteractionStart} onMouseMove={handleInteractionMove} onMouseUp={handleInteractionEnd} onMouseLeave={handleInteractionEnd}
                onTouchStart={handleInteractionStart} onTouchMove={handleInteractionMove} onTouchEnd={handleInteractionEnd}>
                {lines.map((line, i) => (<line key={`line-${i}`} x1={pointCoordinates[line.from].x} y1={pointCoordinates[line.from].y} x2={pointCoordinates[line.to].x} y2={pointCoordinates[line.to].y} stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />))}
                {isDrawing && points.length > 0 && currentPos && (<line x1={pointCoordinates[points[points.length - 1]].x} y1={pointCoordinates[points[points.length - 1]].y} x2={currentPos.x} y2={currentPos.y} stroke="#a5b4fc" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" />)}
                {pointCoordinates.map((p, i) => {
                    const isSelected = points.includes(i);
                    return (<g key={`point-${i}`}><circle cx={p.x} cy={p.y} r="25" fill="transparent" /><circle cx={p.x} cy={p.y} r={isSelected ? "12" : "8"} fill={isSelected ? "#6366f1" : "#cbd5e1"} className="transition-all" /></g>);
                })}
            </svg>
            <motion.button type="button" onClick={resetPattern} className="flex items-center gap-2 mt-4 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <RotateCcw size={16} /> Reiniciar Patrón
            </motion.button>
        </div>
    );
};


export function NewOrderModal({ isOpen, onClose }) {
    const initialFormData = {
        dni: '', first_name: '', last_name: '', phone_number: '',
        device_type_id: '', device_model: '', serial_number: '', accesories: '',
        problem_description: '', observations: '', parts_used: '', password_text: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [clientType, setClientType] = useState('nuevo');
    const [clientSearch, setClientSearch] = useState('');
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [error, setError] = useState('');
    const [sparePartStatus, setSparePartStatus] = useState('local');
    const [totalCost, setTotalCost] = useState('');
    const [deposit, setDeposit] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [hasPattern, setHasPattern] = useState(false);
    const [pattern, setPattern] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);

    const balance = useMemo(() => (parseFloat(totalCost) || 0) - (parseFloat(deposit) || 0), [totalCost, deposit]);

    useEffect(() => {
        const loadData = async () => {
            if (isOpen) {
                setDeviceTypes(await fetchDeviceTypes());
            }
        };
        loadData();
    }, [isOpen]);

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

    const handleFormChange = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
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

    const handleStatusChange = (questionToUpdate, newStatus) => {
        setChecklistItems(checklistItems.map(item =>
            item.check_description === questionToUpdate ? { ...item, client_answer: newStatus } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let unlock_info = [];
        if (hasPassword && formData.password_text) unlock_info.push(`PASS:${formData.password_text}`);
        if (hasPattern && pattern.length > 0) unlock_info.push(`PATTERN:${pattern.join('-')}`);

        // --- INICIO DE LA CORRECCIÓN ---
        // La lógica ahora depende únicamente del estado del botón 'sparePartStatus'.
        // Si es 'pedido', se enviará true. Si es 'local', se enviará false.
        const payload = {
            customer: clientType === 'nuevo' ? { first_name: formData.first_name, last_name: formData.last_name, phone_number: formData.phone_number, dni: formData.dni } : null,
            customer_id: clientType === 'registrado' ? selectedClientId : null,
            device_type_id: parseInt(formData.device_type_id),
            device_model: formData.device_model,
            serial_number: formData.serial_number,
            problem_description: formData.problem_description,
            accesories: formData.accesories,
            observations: formData.observations,
            parts_used: formData.parts_used,
            total_cost: parseFloat(totalCost) || 0,
            deposit: parseFloat(deposit) || 0,
            balance: balance,
            password_or_pattern: unlock_info.join('; ') || null,
            is_spare_part_ordered: sparePartStatus === 'pedido', // <-- ¡AQUÍ ESTÁ EL CAMBIO!
            checklist: checklistItems.filter(item => item.client_answer !== null),
        };
        // --- FIN DE LA CORRECCIÓN ---

        try {
            await createRepairOrder(payload);
            onClose(true); // Pasamos true para indicar que se creó exitosamente y refrescar la lista
        } catch (err) {
            setError(err.message || 'No se pudo crear la orden.');
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Orden de Reparación</h2>
                    <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form id="new-order-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">
                    {/* ... El resto del JSX del formulario se mantiene igual ... */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos del Cliente</h3>
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                            <button type="button" onClick={() => { setClientType('nuevo'); setFormData(initialFormData); setSelectedClientId(null); setClientSearch(''); }} className={`w-1/2 p-2 rounded-md font-semibold ${clientType === 'nuevo' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Cliente Nuevo</button>
                            <button type="button" onClick={() => { setClientType('registrado'); setFormData(initialFormData); setSelectedClientId(null); setClientSearch(''); }} className={`w-1/2 p-2 rounded-md font-semibold ${clientType === 'registrado' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Cliente Registrado</button>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={clientType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {clientType === 'registrado' && (
                                    <div className="relative">
                                        <FormField label="Buscar Cliente (Nombre, Apellido o DNI)" id="client_search" type="text" placeholder="Escriba para buscar..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} onFocus={() => setIsClientSearchFocused(true)} onBlur={() => setTimeout(() => setIsClientSearchFocused(false), 200)} autoComplete="off" />
                                        <AnimatePresence>
                                        {isClientSearchFocused && clientSearchResults.length > 0 && (
                                            <motion.ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                {clientSearchResults.map(c => ( <li key={c.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => handleClientSelect(c)}>{c.first_name} {c.last_name} ({c.dni})</li> ))}
                                            </motion.ul>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <FormField label="DNI" name="dni" type="text" placeholder="Ej: 40123456" value={formData.dni} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                    <FormField label="Nombre" name="first_name" type="text" placeholder="Ej: Juan" value={formData.first_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                    <FormField label="Apellido" name="last_name" type="text" placeholder="Ej: Pérez" value={formData.last_name} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                    <FormField label="Número de Teléfono" name="phone_number" type="tel" placeholder="Ej: 3884123456" value={formData.phone_number} onChange={handleFormChange} disabled={clientType === 'registrado'} required={clientType === 'nuevo'} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos del Equipo y Orden</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                            <div>
                                <label htmlFor="device_type_id" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Dispositivo</label>
                                <select id="device_type_id" name="device_type_id" value={formData.device_type_id} onChange={handleFormChange} className="w-full bg-gray-50 border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                                    <option value="">Seleccione un tipo</option>
                                    {deviceTypes.map(type => (<option key={type.id} value={type.id}>{type.type_name}</option>))}
                                </select>
                            </div>
                            <FormField label="Modelo" name="device_model" id="device_model" type="text" placeholder="Ej: Samsung S23" value={formData.device_model} onChange={handleFormChange} required />
                            <FormField label="Número de Serie" name="serial_number" id="serial_number" type="text" placeholder="Ej: SN123456789" value={formData.serial_number} onChange={handleFormChange} />
                            <FormField label="Accesorios" name="accesories" id="accesories" type="text" placeholder="Ej: Cargador, funda" value={formData.accesories} onChange={handleFormChange} />
                            <div className="md:col-span-2"><TextAreaField label="Descripción del Problema" name="problem_description" id="problem_description" placeholder="El cliente indica que..." value={formData.problem_description} onChange={handleFormChange} required /></div>
                            <div className="md:col-span-2"><TextAreaField label="Observaciones" name="observations" id="observations" placeholder="Detalles adicionales..." value={formData.observations} onChange={handleFormChange} /></div>
                            <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                <div className="col-span-2"><FormField label="Repuestos Utilizados" name="parts_used" id="parts_used" type="text" placeholder="Ej: Pantalla OLED" value={formData.parts_used} onChange={handleFormChange} /></div>
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                                    <div className="flex bg-gray-100 rounded-lg p-1 h-[42px]">
                                        <button type="button" onClick={() => setSparePartStatus('local')} className={`w-1/2 text-xs rounded-md font-semibold ${sparePartStatus === 'local' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Del Local</button>
                                        <button type="button" onClick={() => setSparePartStatus('pedido')} className={`w-1/2 text-xs rounded-md font-semibold ${sparePartStatus === 'pedido' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Para Pedir</button>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-3 gap-4 items-end bg-gray-50 p-3 rounded-lg">
                                <FormField label="Costo Total ($)" id="total_cost" type="number" placeholder="0.00" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
                                <FormField label="Seña ($)" id="deposit" type="number" placeholder="0.00" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                                <AnimatePresence>
                                    {(totalCost || deposit) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Saldo a Pagar ($)</label>
                                        <div className="w-full bg-white border rounded-lg py-2 px-3 font-semibold text-gray-800">{balance.toFixed(2)}</div>
                                    </motion.div>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Código de Desbloqueo</h3>
                        <div className="flex gap-4 mb-4">
                            <button type="button" onClick={() => setHasPassword(!hasPassword)} className={`flex items-center gap-2 py-2 px-4 rounded-lg font-semibold ${hasPassword ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}><Lock size={16}/> Contraseña</button>
                            <button type="button" onClick={() => setHasPattern(!hasPattern)} className={`flex items-center gap-2 py-2 px-4 rounded-lg font-semibold ${hasPattern ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}><GitCommit size={16}/> Patrón</button>
                        </div>
                        <AnimatePresence>
                            {hasPassword && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}> <FormField label="Contraseña/PIN" name="password_text" id="password_text" type="text" placeholder="Ingrese el código" value={formData.password_text} onChange={handleFormChange}/> </motion.div>}
                            {hasPattern && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4"> <label className="block text-sm font-medium text-gray-700 mb-2">Dibujar Patrón</label> <PatternLock onPatternComplete={setPattern} /> </motion.div>}
                        </AnimatePresence>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Checklist de Recepción</h3>
                        <select onChange={handleAddQuestion} className="w-full bg-gray-50 border rounded-lg py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Seleccionar pregunta predeterminada...</option>
                            {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <div className="space-y-2">
                            <AnimatePresence>
                            {checklistItems.map(item => (
                                <motion.div key={item.check_description} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                                    <span className="text-sm text-gray-800">{item.check_description}</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => handleStatusChange(item.check_description, true)} className={`p-1.5 rounded-full ${item.client_answer === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-green-200'}`}><ThumbsUp size={16} /></button>
                                        <button type="button" onClick={() => handleStatusChange(item.check_description, false)} className={`p-1.5 rounded-full ${item.client_answer === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-red-200'}`}><ThumbsDown size={16} /></button>
                                        <button type="button" onClick={() => handleRemoveQuestion(item.check_description)} className="text-gray-400 hover:text-red-500 ml-2"><X size={18} /></button>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                    </section>
                </form>
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
                    {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
                    <motion.button type="button" onClick={() => onClose(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancelar</motion.button>
                    <motion.button type="submit" form="new-order-form" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Guardar Orden</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
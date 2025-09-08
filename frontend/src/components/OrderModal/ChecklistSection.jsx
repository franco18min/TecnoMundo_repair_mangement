import React from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

const PREDEFINED_QUESTIONS = [
    "¿El equipo enciende?",
    "¿La pantalla está rota?",
    "¿El equipo tiene daños por líquido?",
    "¿Se entrega con cargador?",
    "¿Se conoce la contraseña de desbloqueo?",
];

export function ChecklistSection({ mode, permissions, checklistItems, handleAddQuestion, handleRemoveQuestion, handleChecklistChange }) {
    return (
        <section>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Checklist de Recepción</h3>
            {permissions.canEditInitialDetails && (
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
                            {permissions.canEditInitialDetails && <button type="button" onClick={() => handleRemoveQuestion(item.check_description)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold text-gray-600 w-20'>Cliente:</span>
                                {permissions.canEditInitialDetails ? (
                                    <>
                                        <button type="button" onClick={() => handleChecklistChange(index, 'client_answer', true)} className={`p-1.5 rounded-full ${item.client_answer === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}><ThumbsUp size={16} /></button>
                                        <button type="button" onClick={() => handleChecklistChange(index, 'client_answer', false)} className={`p-1.5 rounded-full ${item.client_answer === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}><ThumbsDown size={16} /></button>
                                    </>
                                ) : (
                                    item.client_answer === true ? <ThumbsUp size={18} className="text-green-500" /> : <ThumbsDown size={18} className="text-red-500" />
                                )}
                            </div>

                            {permissions.canInteractWithTechnicianChecklist ? (
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                    <button type="button" onClick={() => handleChecklistChange(index, 'technician_finding', true)} className={`p-1.5 rounded-full ${item.technician_finding === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}><ThumbsUp size={16} /></button>
                                    <button type="button" onClick={() => handleChecklistChange(index, 'technician_finding', false)} className={`p-1.5 rounded-full ${item.technician_finding === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}><ThumbsDown size={16} /></button>
                                    <input type="text" placeholder="Notas..." value={item.technician_notes || ''} onChange={(e) => handleChecklistChange(index, 'technician_notes', e.target.value)} className="text-sm border-b focus:outline-none focus:border-indigo-500 flex-1 ml-2 bg-transparent" />
                                </div>
                            ) : (
                                item.technician_finding !== null &&
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
    );
}
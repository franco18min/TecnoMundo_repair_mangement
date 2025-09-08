import React from 'react';
import { DisplayField, FormField, TextAreaField } from './shared';

export function DiagnosisSection({ mode, permissions, formData, handleFormChange }) {
    if (mode === 'create') return null; // Esta sección no aparece al crear

    return (
        <section>
            <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Diagnóstico y Reparación</h3>
            <div className="space-y-4">
                {permissions.canEditDiagnosisPanel ? (
                    <>
                        <TextAreaField label="Diagnóstico del Técnico" name="technician_diagnosis" value={formData.technician_diagnosis} onChange={handleFormChange} />
                        <TextAreaField label="Notas de Reparación" name="repair_notes" value={formData.repair_notes} onChange={handleFormChange} />
                        <TextAreaField label="Repuestos Utilizados" name="parts_used" value={formData.parts_used} onChange={handleFormChange} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                            <FormField label="Costo Total" name="total_cost" value={formData.total_cost} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                            <FormField label="Depósito" name="deposit" value={formData.deposit} onChange={handleFormChange} type="number" step="0.01" isCurrency={true} />
                            <DisplayField label="Saldo" value={formData.balance} isCurrency={true} />
                        </div>
                    </>
                ) : (
                    <>
                        <DisplayField label="Diagnóstico del Técnico" value={formData.technician_diagnosis} fullWidth={true}/>
                        <DisplayField label="Notas de Reparación" value={formData.repair_notes} fullWidth={true}/>
                        <DisplayField label="Repuestos Utilizados" value={formData.parts_used} fullWidth={true}/>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                            <DisplayField label="Costo Total" value={formData.total_cost} isCurrency={true} />
                            <DisplayField label="Depósito" value={formData.deposit} isCurrency={true} />
                            <DisplayField label="Saldo" value={formData.balance} isCurrency={true} />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
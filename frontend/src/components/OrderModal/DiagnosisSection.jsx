import React from 'react';
import { DisplayField, TextAreaField } from './shared';

export function DiagnosisSection({ mode, permissions, formData, handleFormChange }) {
    if (mode === 'create') return null;

    return (
        <section>
            <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Diagnóstico y Reparación</h3>
            <div className="space-y-4">
                {permissions.canEditDiagnosisPanel ? (
                    <>
                        <TextAreaField label="Diagnóstico del Técnico" name="technician_diagnosis" value={formData.technician_diagnosis} onChange={handleFormChange} />
                        <TextAreaField label="Notas de Reparación" name="repair_notes" value={formData.repair_notes} onChange={handleFormChange} />
                    </>
                ) : (
                    <>
                        <DisplayField label="Diagnóstico del Técnico" value={formData.technician_diagnosis} fullWidth={true}/>
                        <DisplayField label="Notas de Reparación" value={formData.repair_notes} fullWidth={true}/>
                    </>
                )}
            </div>
        </section>
    );
}
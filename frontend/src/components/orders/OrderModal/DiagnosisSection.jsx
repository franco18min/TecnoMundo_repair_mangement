import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DisplayField, TextAreaField } from './shared';
import { PhotoBoard } from './PhotoBoard/index.js';
import { 
    getRepairOrderPhotos, 
    uploadRepairOrderPhoto, 
    updateRepairOrderPhoto, 
    deleteRepairOrderPhoto 
} from '../../../api/repairOrderPhotosApi';
import { updateOrderDiagnosis } from '../../../api/repairOrdersApi';

// Variantes de animación
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

export function DiagnosisSection({ mode, permissions, formData, handleFormChange, orderId }) {
    const [photos, setPhotos] = useState([]);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState(null);

    if (mode === 'create') return null;

    // Cargar fotos cuando se abre el modal
    useEffect(() => {
        if (orderId) {
            loadPhotos();
        }
    }, [orderId]);

    const loadPhotos = async () => {
        if (!orderId) return;
        
        setIsLoadingPhotos(true);
        try {
            const photosData = await getRepairOrderPhotos(orderId);
            setPhotos(photosData);
        } catch (error) {
            console.error('Error al cargar fotos:', error);
        } finally {
            setIsLoadingPhotos(false);
        }
    };

    const handleAddPhoto = async (file, note = '') => {
        console.log('🔍 DiagnosisSection - handleAddPhoto called');
        console.log('🔍 orderId:', orderId, 'type:', typeof orderId);
        console.log('🔍 file:', file.name, file.size, file.type);
        console.log('🔍 note:', note);
        
        try {
            const newPhoto = await uploadRepairOrderPhoto(orderId, file, note);
            console.log('✅ Photo uploaded successfully:', newPhoto);
            setPhotos(prev => [...prev, newPhoto]);
            
            return newPhoto; // Retornar la foto para que PhotoBoard pueda manejarla
        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            throw error; // Re-lanzar el error para que PhotoBoard pueda manejarlo
        }
    };

    const handleUpdatePhoto = async (photoId, note) => {
        try {
            await updateRepairOrderPhoto(photoId, note);
            setPhotos(prev => prev.map(photo => 
                photo.id === photoId ? { ...photo, note } : photo
            ));
        } catch (error) {
            console.error('Error al actualizar foto:', error);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            await deleteRepairOrderPhoto(photoId);
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        } catch (error) {
            console.error('Error al eliminar foto:', error);
        }
    };

    const handleUpdatePhotoAnnotations = async (photoId, annotations) => {
        // Actualizar el estado local inmediatamente después del guardado exitoso
        setPhotos(prev => prev.map(photo => 
            photo.id === photoId ? { 
                ...photo, 
                markers: annotations.markers || [],
                drawings: annotations.drawings || []
            } : photo
        ));
    };

    // Función para guardar automáticamente los campos de diagnóstico
    const saveDiagnosisData = useCallback(async (diagnosisData) => {
        if (!orderId || isSavingDiagnosis) return;
        
        setIsSavingDiagnosis(true);
        try {
            await updateOrderDiagnosis(orderId, diagnosisData);
            console.log('✅ Diagnóstico guardado automáticamente');
        } catch (error) {
            console.error('❌ Error al guardar diagnóstico:', error);
        } finally {
            setIsSavingDiagnosis(false);
        }
    }, [orderId, isSavingDiagnosis]);

    // Función para manejar cambios en los campos de diagnóstico con debounce
    const handleDiagnosisChange = useCallback((name, value) => {
        // Actualizar el formData inmediatamente para la UI
        handleFormChange({ target: { name, value } });
        
        // Limpiar timeout anterior
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Configurar nuevo timeout para guardar después de 2 segundos
        const newTimeout = setTimeout(() => {
            const diagnosisData = {};
            diagnosisData[name] = value;
            saveDiagnosisData(diagnosisData);
        }, 2000);
        
        setSaveTimeout(newTimeout);
    }, [handleFormChange, saveTimeout, saveDiagnosisData]);

    // Limpiar timeout al desmontar el componente
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
        };
    }, [saveTimeout]);

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h3 
                className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4"
                variants={itemVariants}
            >
                Diagnóstico y Reparación
            </motion.h3>
            
            <motion.div 
                className="space-y-6"
                variants={itemVariants}
            >
                {/* Campos de texto existentes */}
                <div className="space-y-4">
                    {permissions.canEditDiagnosisPanel ? (
                        <>
                            <div className="relative">
                                <TextAreaField 
                                    label="Diagnóstico del Técnico" 
                                    name="technician_diagnosis" 
                                    value={formData.technician_diagnosis} 
                                    onChange={(e) => handleDiagnosisChange('technician_diagnosis', e.target.value)} 
                                />
                                {isSavingDiagnosis && (
                                    <div className="absolute top-2 right-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                        Guardando...
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <TextAreaField 
                                    label="Notas de Reparación" 
                                    name="repair_notes" 
                                    value={formData.repair_notes} 
                                    onChange={(e) => handleDiagnosisChange('repair_notes', e.target.value)} 
                                />
                                {isSavingDiagnosis && (
                                    <div className="absolute top-2 right-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                        Guardando...
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <DisplayField label="Diagnóstico del Técnico" value={formData.technician_diagnosis} fullWidth={true}/>
                            <DisplayField label="Notas de Reparación" value={formData.repair_notes} fullWidth={true}/>
                        </>
                    )}
                </div>

                {/* PhotoBoard */}
                <div className="mt-6">
                    {isLoadingPhotos ? (
                        <div className="flex justify-center items-center h-40 bg-gray-100 rounded-lg">
                            <div className="text-gray-500">Cargando fotos...</div>
                        </div>
                    ) : (
                        <PhotoBoard
                            photos={photos}
                            onAddPhoto={handleAddPhoto}
                            onUpdatePhoto={handleUpdatePhoto}
                            onDeletePhoto={handleDeletePhoto}
                            onUpdatePhotoAnnotations={handleUpdatePhotoAnnotations}
                            canEdit={permissions.canAddPhotos}
                        />
                    )}
                </div>
            </motion.div>
        </motion.section>
    );
}
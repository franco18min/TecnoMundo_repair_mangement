import React, { useState, useEffect } from 'react';
import { DisplayField, TextAreaField } from './shared';
import { PhotoBoard } from './PhotoBoard';
import { 
    getRepairOrderPhotos, 
    uploadRepairOrderPhoto, 
    updateRepairOrderPhoto, 
    deleteRepairOrderPhoto 
} from '../../../api/repairOrderPhotosApi';

export function DiagnosisSection({ mode, permissions, formData, handleFormChange, orderId }) {
    const [photos, setPhotos] = useState([]);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

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

    const handleAddPhoto = async (file) => {
        if (!orderId) return;

        try {
            const newPhoto = await uploadRepairOrderPhoto(orderId, file, '');
            setPhotos(prev => [...prev, newPhoto]);
            // Aquí podrías mostrar un toast de éxito
        } catch (error) {
            console.error('Error al subir foto:', error);
            // Re-lanzar el error para que PhotoBoard pueda manejarlo
            throw new Error(error.message || 'Error al subir la foto. Inténtalo de nuevo.');
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

    return (
        <section>
            <h3 className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">Diagnóstico y Reparación</h3>
            <div className="space-y-6">
                {/* Campos de texto existentes */}
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
                            canEdit={permissions.canAddPhotos}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
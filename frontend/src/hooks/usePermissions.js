// frontend/src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = (mode, order = null) => {
    const { currentUser } = useAuth();

    const permissions = useMemo(() => {
        if (!currentUser) return { isReadOnly: true };

        const role = currentUser.role?.role_name;
        const isAdmin = role === 'Administrator';
        const isReceptionist = role === 'Receptionist';
        const isTechnician = role === 'Technical';

        // --- Permisos Generales Basados en Rol ---
        const canCreateOrders = isAdmin || isReceptionist;
        const canEditCosts = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin; // Solo Admin puede editar repuestos usados (según lógica original)
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist; // Nuevo permiso para imprimir

        // --- MODO CREACIÓN (Lógica original restaurada) ---
        if (mode === 'create') {
            return {
                canCreateOrder: canCreateOrders,
                canEditInitialDetails: canCreateOrders,
                canEditCosts: canCreateOrders,
                canEditDiagnosisPanel: false,
                canEditPartsUsed: canEditPartsUsed, // Mantenemos la lógica original
                canDeleteOrders: canDeleteOrders,
                isReadOnly: !canCreateOrders,
                // Añadimos los nuevos permisos para consistencia, aunque no apliquen aquí
                canTakeOrder: false,
                canReopenOrder: false,
                canPrintOrder: false,
                canModify: false, // Añadimos 'canModify'
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder };

        // --- MODO VISTA/EDICIÓN (Lógica Original + Nuevos Permisos) ---
        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';
        const isCompleted = order.status?.status_name === 'Completed';

        // Variable para la nueva regla de modificación de Admin/Recepcionista
        const canAdminOrRecepModify = (isAdmin || isReceptionist);

        return {
            // Lógica de edición restaurada y extendida
            canEditInitialDetails: canAdminOrRecepModify, // Admin/Recep pueden modificar siempre
            canEditDiagnosisPanel: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,

            // Lógica para tomar órdenes extendida
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending, // Admin y Técnico pueden tomar órdenes

            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && isCompleted,

            // Nuevo permiso de impresión
            canPrintOrder: canPrintOrder,

            // Nuevo permiso general de modificación
            canModify: canAdminOrRecepModify,

            // La vista es de solo lectura si un usuario no tiene permisos de modificación general
            // Y TAMPOCO es el técnico asignado a una orden en proceso.
            isReadOnly: !canAdminOrRecepModify && !(isTechnician && isMyOrder && isInProcess),
        };

    }, [currentUser, mode, order]);

    return permissions;
};
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

        // --- Permisos Generales Basados en Rol (Lógica Original y Correcta) ---
        const canCreateOrders = isAdmin || isReceptionist;
        const canEditCosts = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;

        // --- MODO CREACIÓN ---
        if (mode === 'create') {
            return {
                // --- INICIO DE LA CORRECIÓN ---
                canCreateOrders: canCreateOrders, // Corregido de 'canCreateOrder' a 'canCreateOrders'
                // --- FIN DE LA CORRECIÓN ---
                canEditInitialDetails: canCreateOrders,
                canEditCosts: canCreateOrders,
                canEditDiagnosisPanel: false,
                canEditPartsUsed: canEditPartsUsed,
                canDeleteOrders: canDeleteOrders,
                isReadOnly: !canCreateOrders,
                canTakeOrder: false,
                canReopenOrder: false,
                canPrintOrder: false,
                canModify: false,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder };

        // --- MODO VISTA/EDICIÓN (Lógica Original y Correcta) ---
        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';
        const isCompleted = order.status?.status_name === 'Completed';

        const canAdminOrRecepModify = (isAdmin || isReceptionist);

        return {
            // Lógica de edición restaurada
            canEditInitialDetails: canAdminOrRecepModify,
            canEditDiagnosisPanel: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,

            // Lógica de acciones restaurada
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && isCompleted,
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,

            // Lógica de solo lectura restaurada
            isReadOnly: !canAdminOrRecepModify && !(isTechnician && isMyOrder && isInProcess),
        };

    }, [currentUser, mode, order]);

    return permissions;
};
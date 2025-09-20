// frontend/src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = (mode, order = null) => {
    // CORRECCIÓN: Obtenemos currentUser desde el contexto para evitar el breaking change.
    const { currentUser } = useAuth();

    const permissions = useMemo(() => {
        if (!currentUser) return { isReadOnly: true };

        const role = currentUser.role?.role_name;
        const isAdmin = role === 'Administrator';
        const isReceptionist = role === 'Receptionist';
        const isTechnician = role === 'Technical';

        // --- Permisos Generales Restaurados ---
        const canCreateOrders = isAdmin || isReceptionist;
        const canEditCosts = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin; // RESTAURADO: Solo Admin puede editar repuestos.
        const canDeleteOrders = isAdmin;  // RESTAURADO: Solo Admin puede eliminar.
        const canPrintOrder = isAdmin || isReceptionist;

        if (mode === 'create') {
            return {
                canCreateOrder: canCreateOrders,
                canEditInitialDetails: canCreateOrders,
                canEditCosts: canCreateOrders,
                canEditPartsUsed: canEditPartsUsed,
                canDeleteOrders: canDeleteOrders,
                isReadOnly: !canCreateOrders,
                canPrintOrder: false,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder };

        // --- Estados de la Orden ---
        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';
        const isCompleted = order.status?.status_name === 'Completed';

        // CORRECCIÓN: Lógica de modificación restaurada para Admin y Recepcionista.
        const canAdminOrRecepModify = isAdmin || isReceptionist;

        // --- Lógica de Botones Específicos (NUEVO Y SEGURO) ---
        const canTake = (isAdmin || isTechnician) && isUnassigned && isPending;
        const canModify = isAdmin && mode === 'view'; // Solo Admin puede entrar en modo edición.
        const canReopen = (isAdmin || isReceptionist) && isCompleted;
        const canComplete = (isAdmin || (isTechnician && isMyOrder)) && isInProcess;

        return {
            // Lógica de edición de campos restaurada y corregida
            canEditInitialDetails: canAdminOrRecepModify,
            canEditDiagnosisPanel: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,

            // Permisos de Acciones (Botones)
            canTakeOrder: canTake,
            canModifyOrder: canModify,
            canReopenOrder: canReopen,
            canCompleteOrder: canComplete,
            canDeleteOrders: canDeleteOrders,
            canPrintOrder: canPrintOrder,

            // Lógica isReadOnly restaurada
            isReadOnly: !canAdminOrRecepModify && !(isTechnician && isMyOrder && isInProcess),
        };

    }, [currentUser, mode, order]);

    return permissions;
};
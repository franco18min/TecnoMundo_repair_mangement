// frontend/src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = (mode, order = null) => {
    const { currentUser } = useAuth();

    const permissions = useMemo(() => {
        if (!currentUser) {
            return {
                canCreateOrders: false,
                canEditInitialDetails: false,
                canEditDiagnosisPanel: false,
                canInteractWithTechnicianChecklist: false,
                canPerformAdminActions: false,
                canTakeOrder: false,
                isReadOnly: true,
            };
        }

        const role = currentUser.role?.role_name;
        const isAdmin = role === 'Administrator';
        const isReceptionist = role === 'Receptionist';
        const isTechnician = role === 'Technical';

        const canCreateOrders = isAdmin || isReceptionist;

        // Si estamos en modo creación, los permisos son sencillos
        if (mode === 'create') {
            return {
                canCreateOrders,
                canEditInitialDetails: canCreateOrders,
                canEditDiagnosisPanel: false,
                canInteractWithTechnicianChecklist: false,
                canPerformAdminActions: false,
                canTakeOrder: false,
                isReadOnly: false,
            };
        }

        // Si no hay orden, solo devolvemos permisos generales
        if (!order) {
            return { canCreateOrders };
        }

        // Permisos específicos de una orden existente
        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';

        // Un recepcionista puede editar una orden solo si está pendiente
        const canEditInitialDetails = (isAdmin || isReceptionist) && isPending;
        const canEditDiagnosisPanel = (isAdmin) || (isTechnician && isMyOrder && isInProcess);
        const canInteractWithTechnicianChecklist = (isAdmin) || (isTechnician && isMyOrder && isInProcess);
        const canPerformAdminActions = isAdmin;
        const canTakeOrder = isTechnician && isUnassigned && isPending;

        return {
            canCreateOrders,
            canEditInitialDetails,
            canEditDiagnosisPanel,
            canInteractWithTechnicianChecklist,
            canPerformAdminActions,
            canTakeOrder,
            isReadOnly: !canEditInitialDetails && !canEditDiagnosisPanel,
        };
    }, [currentUser, mode, order]);

    return permissions;
};
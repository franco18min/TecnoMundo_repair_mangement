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

        // --- INICIO DE LA MODIFICACIÓN ---
        // Nuevo permiso para la sección de clientes
        const canViewClients = isAdmin || isReceptionist;
        // --- FIN DE LA MODIFICACIÓN ---

        const canCreateOrders = isAdmin || isReceptionist;
        const canEditCosts = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;

        // El hook puede ser llamado sin un modo específico, solo para obtener permisos generales
        if (!mode) {
            return { canViewClients, canCreateOrders };
        }

        if (mode === 'create') {
            return {
                canCreateOrders: canCreateOrders,
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
                canViewClients: canViewClients,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder, canViewClients };

        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';
        const isCompleted = order.status?.status_name === 'Completed';

        const canAdminOrRecepModify = (isAdmin || isReceptionist);

        return {
            canEditInitialDetails: canAdminOrRecepModify,
            canEditDiagnosisPanel: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && isCompleted,
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,
            isReadOnly: !canAdminOrRecepModify && !(isTechnician && isMyOrder && isInProcess),
            canViewClients: canViewClients,
        };

    }, [currentUser, mode, order]);

    return permissions;
};
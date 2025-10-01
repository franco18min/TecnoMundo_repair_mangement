// frontend/src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = (mode, order = null) => {
    const { currentUser } = useAuth();

    const permissions = useMemo(() => {
        if (!currentUser) return { isReadOnly: true, canAccessConfig: false };

        const role = currentUser.role?.role_name;
        const isAdmin = role === 'Administrator';
        const isReceptionist = role === 'Receptionist';
        const isTechnician = role === 'Technical';

        const canAccessConfig = isAdmin;

        const canCreateOrders = isAdmin || isReceptionist;
        const canViewClients = isAdmin || isReceptionist;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canEditCosts = isAdmin || isReceptionist;

        if (!mode) {
            return { canCreateOrders, canViewClients, canDeleteOrders, canAccessConfig };
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
                canAccessConfig: canAccessConfig,
                canDeliverOrder: false, // No se puede entregar en modo creación
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder, canViewClients, canAccessConfig };

        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const status = order.status?.status_name;
        const isPending = ['Pending', 'Waiting for parts'].includes(status);
        const isInProcess = status === 'In Process';
        const isCompleted = status === 'Completed';
        const isDelivered = status === 'Delivered';

        const canAdminOrRecepModify = (isAdmin || isReceptionist);
        const canComplete = (isAdmin || (isTechnician && isMyOrder)) && isInProcess;

        // --- INICIO DE LA NUEVA FUNCIONALIDAD ---
        const canDeliverOrder = (isAdmin || isReceptionist) && isCompleted;
        // --- FIN DE LA NUEVA FUNCIONALIDAD ---

        // Lógica de modificación: Admin/Recepcionista pueden modificar órdenes Pending o In Process
        const canModifyOrder = (isAdmin || isReceptionist) && (isPending || isInProcess);

        return {
            canEditInitialDetails: canAdminOrRecepModify,
            canEditDiagnosisPanel: canComplete,
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && (isCompleted || isDelivered),
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,
            canModifyOrder: canModifyOrder, // <-- Permiso añadido para el botón "Modificar Orden"
            canCompleteOrder: canComplete,
            isReadOnly: !canModifyOrder && !canComplete,
            canViewClients: canViewClients,
            canAccessConfig: canAccessConfig,
            canDeliverOrder: canDeliverOrder, // <-- Permiso añadido
        };
    }, [currentUser, mode, order]);

    return permissions;
};
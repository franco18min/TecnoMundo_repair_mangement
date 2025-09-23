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

        const canCreateOrders = isAdmin || isReceptionist;
        const canViewClients = isAdmin || isReceptionist;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canEditCosts = isAdmin || isReceptionist;

        if (!mode) {
            return { canCreateOrders, canViewClients, canDeleteOrders };
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
        const status = order.status?.status_name;
        const isPending = ['Pending', 'Waiting for parts'].includes(status);
        const isInProcess = status === 'In Process';
        const isCompleted = status === 'Completed';

        const canAdminOrRecepModify = (isAdmin || isReceptionist);

        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Se define una única variable para la lógica de "Completar Orden".
        const canComplete = (isAdmin || (isTechnician && isMyOrder)) && isInProcess;

        return {
            // Lógica de edición de la versión estable
            canEditInitialDetails: canAdminOrRecepModify,
            // 2. Ambos permisos (el que controla el formulario y el que controla el botón) usan la misma lógica.
            canEditDiagnosisPanel: canComplete,
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,

            // Lógica de acciones de la versión estable
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && isCompleted,
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,
            // 3. Se añade y exporta el permiso que el ModalFooter necesita.
            canCompleteOrder: canComplete,

            // Lógica de solo lectura de la versión estable
            isReadOnly: !canAdminOrRecepModify && !(isTechnician && isMyOrder && isInProcess),
            canViewClients: canViewClients,
        };
        // --- FIN DE LA CORRECCIÓN ---

    }, [currentUser, mode, order]);

    return permissions;
};
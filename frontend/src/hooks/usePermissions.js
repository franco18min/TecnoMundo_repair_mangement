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
        const canEditCosts = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canDeleteOrders = isAdmin;

        if (mode === 'create') {
            return {
                canCreateOrder: canCreateOrders,
                canEditInitialDetails: canCreateOrders,
                canEditCosts: canCreateOrders,
                canEditDiagnosisPanel: false,
                canEditPartsUsed: canEditPartsUsed,
                canDeleteOrders: canDeleteOrders,
                isReadOnly: !canCreateOrders,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders };

        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';
        // --- INICIO DE LA MODIFICACIÓN ---
        const isCompleted = order.status?.status_name === 'Completed';

        return {
            canEditInitialDetails: (isAdmin || isReceptionist) && isPending,
            canEditDiagnosisPanel: (isAdmin || (isTechnician && isMyOrder)) && isInProcess, // No se puede editar si está completada
            canInteractWithTechnicianChecklist: (isAdmin || (isTechnician && isMyOrder)) && isInProcess,
            canTakeOrder: isTechnician && isUnassigned && isPending,
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && isCompleted, // Nuevo permiso
            isReadOnly: !( (isAdmin || isReceptionist) && isPending ) && !( (isAdmin || (isTechnician && isMyOrder)) && isInProcess ) && !( (isAdmin || isReceptionist) && isCompleted ),
        };
        // --- FIN DE LA MODIFICACIÓN ---
    }, [currentUser, mode, order]);

    return permissions;
};
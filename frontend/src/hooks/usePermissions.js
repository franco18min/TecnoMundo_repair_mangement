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

        // Lógica para el modo CREACIÓN
        if (mode === 'create') {
            const canCreate = isAdmin || isReceptionist;
            return {
                canCreateOrder: canCreate,
                canEditInitialDetails: canCreate,
                canEditDiagnosisPanel: false, // No se puede diagnosticar al crear
                isReadOnly: !canCreate,
            };
        }

        if (!order) return { canCreateOrders: isAdmin || isReceptionist };

        // Lógica para modos VISTA/EDICIÓN
        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';

        return {
            canEditInitialDetails: (isAdmin || isReceptionist) && isPending,
            canEditDiagnosisPanel: (isAdmin) || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: (isAdmin) || (isTechnician && isMyOrder && isInProcess),
            canTakeOrder: isTechnician && isUnassigned && isPending,
            isReadOnly: !( (isAdmin || isReceptionist) && isPending ) && !( (isAdmin || (isTechnician && isMyOrder)) && isInProcess ),
        };
    }, [currentUser, mode, order]);

    return permissions;
};
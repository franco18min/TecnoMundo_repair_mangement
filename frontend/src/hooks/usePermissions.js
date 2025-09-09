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
        // --- INICIO DE LA MODIFICACIÓN ---
        const canEditPartsUsed = isAdmin; // Solo el admin puede editar este campo

        if (mode === 'create') {
            return {
                canCreateOrder: canCreateOrders,
                canEditInitialDetails: canCreateOrders,
                canEditCosts: canCreateOrders,
                canEditDiagnosisPanel: false,
                canEditPartsUsed: canEditPartsUsed, // Aplicamos el permiso en creación
                isReadOnly: !canCreateOrders,
            };
        }

        if (!order) return { canCreateOrders };

        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const isPending = ['Pending', 'Waiting for parts'].includes(order.status?.status_name);
        const isInProcess = order.status?.status_name === 'In Process';

        return {
            canEditInitialDetails: (isAdmin || isReceptionist) && isPending,
            canEditDiagnosisPanel: (isAdmin) || (isTechnician && isMyOrder && isInProcess),
            canInteractWithTechnicianChecklist: (isAdmin) || (isTechnician && isMyOrder && isInProcess),
            canTakeOrder: isTechnician && isUnassigned && isPending,
            canEditCosts: canEditCosts,
            canEditPartsUsed: canEditPartsUsed, // Aplicamos el permiso en vista/edición
            isReadOnly: !( (isAdmin || isReceptionist) && isPending ) && !( (isAdmin || (isTechnician && isMyOrder)) && isInProcess ),
        };
        // --- FIN DE LA MODIFICACIÓN ---
    }, [currentUser, mode, order]);

    return permissions;
};
// frontend/src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = (mode, order = null) => {
    const { currentUser } = useAuth();

    const permissions = useMemo(() => {
        if (!currentUser) return { isReadOnly: true, canAccessConfig: false };

        const role = currentUser.role?.role_name;
        const raw = (role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isAdmin = ['administrator', 'administrador', 'admin'].includes(raw);
        const isReceptionist = ['receptionist', 'recepcionist', 'recepcionista'].includes(raw);
        const isTechnician = ['technical', 'technician', 'tecnico'].includes(raw);

        const canAccessConfig = isAdmin || isReceptionist;
        const canSwitchBranch = isAdmin || isReceptionist || isTechnician;
        const canViewRecords = isAdmin || isReceptionist || isTechnician;

        const canCreateOrders = isAdmin || isReceptionist;
        const canViewClients = isAdmin || isReceptionist;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canEditCosts = isAdmin || isReceptionist;

        if (!mode) {
            return { canCreateOrders, canViewClients, canDeleteOrders, canAccessConfig, canSwitchBranch, canViewRecords };
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
                canViewRecords: canViewRecords,
                canDeliverOrder: false,
                canSwitchBranch: canSwitchBranch,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder, canViewClients, canAccessConfig, canSwitchBranch, canViewRecords };

        const isMyOrder = order.technician?.id === currentUser.id;
        const isUnassigned = !order.technician;
        const status = order.status?.status_name;
        const isPending = ['Pending', 'Waiting for parts'].includes(status);
        const isInProcess = status === 'In Process';
        const isCompleted = status === 'Completed';
        const isDelivered = status === 'Delivered';

        const canAdminOrRecepModify = (isAdmin || isReceptionist);
        const canComplete = (isAdmin || (isTechnician && isMyOrder)) && isInProcess;

        const canDeliverOrder = (isAdmin || isReceptionist) && isCompleted;

        const canAddPhotos = (mode === 'edit') && ((isAdmin || isReceptionist) || (isTechnician && isMyOrder && isInProcess));

        const canModifyOrder = (isAdmin || isReceptionist) && (isPending || isInProcess);

        const canModifyForDiagnosis = isTechnician && isMyOrder && isInProcess;

        const canEditInitialDetails = canModifyOrder && mode === 'edit';

        const canEditDiagnosisPanel = (mode === 'edit') && (canModifyOrder || canModifyForDiagnosis);

        const canEditCostsInMode = canEditCosts && canModifyOrder && mode === 'edit';
        const canEditPartsUsedInMode = canEditPartsUsed && canModifyOrder && mode === 'edit';

        return {
            canEditInitialDetails: canEditInitialDetails,
            canEditDiagnosisPanel: canEditDiagnosisPanel,
            canAddPhotos: canAddPhotos,
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCostsInMode,
            canEditPartsUsed: canEditPartsUsedInMode,
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && (isCompleted || isDelivered),
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,
            canModifyOrder: canModifyOrder,
            canModifyForDiagnosis: canModifyForDiagnosis,
            canCompleteOrder: canComplete,
            isReadOnly: !canModifyOrder && !canComplete && !canModifyForDiagnosis,
            canViewClients: canViewClients,
            canAccessConfig: canAccessConfig,
            canViewRecords: canViewRecords,
            canDeliverOrder: canDeliverOrder,
            canSwitchBranch: canSwitchBranch,
        };
    }, [currentUser, mode, order]);

    return permissions;
};

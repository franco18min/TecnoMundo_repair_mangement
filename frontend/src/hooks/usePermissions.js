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

        const canAccessConfig = isAdmin;
        const canSwitchBranch = isAdmin || isReceptionist || isTechnician;

        const canCreateOrders = isAdmin || isReceptionist;
        const canViewClients = isAdmin || isReceptionist;
        const canDeleteOrders = isAdmin;
        const canPrintOrder = isAdmin || isReceptionist;
        const canEditPartsUsed = isAdmin;
        const canEditCosts = isAdmin || isReceptionist;

        if (!mode) {
            return { canCreateOrders, canViewClients, canDeleteOrders, canAccessConfig, canSwitchBranch };
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
                canSwitchBranch: canSwitchBranch,
            };
        }

        if (!order) return { canCreateOrders, canDeleteOrders, canPrintOrder, canViewClients, canAccessConfig, canSwitchBranch };

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

        // Permiso específico para agregar fotos: técnicos solo en órdenes asignadas en estado 'In Process'
        // También debe considerar el modo del modal
        const canAddPhotos = (mode === 'edit') && ((isAdmin || isReceptionist) || (isTechnician && isMyOrder && isInProcess));

        // Lógica de modificación: Admin/Recepcionista pueden modificar órdenes Pending o In Process
        const canModifyOrder = (isAdmin || isReceptionist) && (isPending || isInProcess);

        // NUEVA FUNCIONALIDAD: Técnicos pueden modificar solo para editar diagnóstico
        const canModifyForDiagnosis = isTechnician && isMyOrder && isInProcess;

        // canEditInitialDetails debe considerar tanto el rol como el modo del modal
        const canEditInitialDetails = canModifyOrder && mode === 'edit'; // Solo admin/recepcionista en modo edit

        // canEditDiagnosisPanel: Admin/Recepcionista en modo edit O técnicos asignados en modo edit
        const canEditDiagnosisPanel = (mode === 'edit') && (canModifyOrder || canModifyForDiagnosis);

        // canEditCosts y canEditPartsUsed: Solo admin/recepcionista en modo edit
        const canEditCostsInMode = canEditCosts && canModifyOrder && mode === 'edit';
        const canEditPartsUsedInMode = canEditPartsUsed && canModifyOrder && mode === 'edit';

        return {
            canEditInitialDetails: canEditInitialDetails,
            canEditDiagnosisPanel: canEditDiagnosisPanel,
            canAddPhotos: canAddPhotos, // <-- Nuevo permiso específico para fotos
            canInteractWithTechnicianChecklist: canAdminOrRecepModify || (isTechnician && isMyOrder && isInProcess),
            canEditCosts: canEditCostsInMode,
            canEditPartsUsed: canEditPartsUsedInMode,
            canTakeOrder: (isAdmin || isTechnician) && isUnassigned && isPending,
            canDeleteOrders: canDeleteOrders,
            canReopenOrder: (isAdmin || isReceptionist) && (isCompleted || isDelivered),
            canPrintOrder: canPrintOrder,
            canModify: canAdminOrRecepModify,
            canModifyOrder: canModifyOrder, // <-- Permiso añadido para el botón "Modificar Orden"
            canModifyForDiagnosis: canModifyForDiagnosis, // <-- NUEVO: Permiso para técnicos editar diagnóstico
            canCompleteOrder: canComplete,
            isReadOnly: !canModifyOrder && !canComplete && !canModifyForDiagnosis,
            canViewClients: canViewClients,
            canAccessConfig: canAccessConfig,
            canDeliverOrder: canDeliverOrder, // <-- Permiso añadido
            canSwitchBranch: canSwitchBranch,
        };
    }, [currentUser, mode, order]);

    return permissions;
};

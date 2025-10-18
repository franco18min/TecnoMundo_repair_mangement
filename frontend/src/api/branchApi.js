import getApiClient from './apiClient';
let apiClient;

export const initializeBranchApi = (getAccessToken, logout) => {
    apiClient = getApiClient(getAccessToken, logout);
};

export const fetchBranches = () => apiClient('/branches/');
export const createBranch = (branchData) => apiClient('/branches/', { method: 'POST', body: branchData });
export const updateBranch = (branchId, branchData) => apiClient(`/branches/${branchId}`, { method: 'PUT', body: branchData });


// Nuevas funciones para configuración de tickets
export const getBranchTicketConfig = (branchId) => apiClient(`/branches/${branchId}/ticket-config`);
export const updateBranchTicketConfig = (branchId, ticketConfig) => apiClient(`/branches/${branchId}/ticket-config`, { method: 'PUT', body: ticketConfig });


import getApiClient from './apiClient';
let apiClient;

export const initializeBranchApi = (getAccessToken, logout) => {
    apiClient = getApiClient(getAccessToken, logout);
};

export const fetchBranches = () => apiClient('/branches/');
export const createBranch = (branchData) => apiClient('/branches/', { method: 'POST', body: branchData });
export const updateBranch = (branchId, branchData) => apiClient(`/branches/${branchId}`, { method: 'PUT', body: branchData });
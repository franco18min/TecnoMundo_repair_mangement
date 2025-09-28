import getApiClient from './apiClient';
let apiClient;

export const initializeRolesApi = (getAccessToken, logout) => {
    apiClient = getApiClient(getAccessToken, logout);
};

export const getRoles = () => apiClient('/roles/');
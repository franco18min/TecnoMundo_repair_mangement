import getApiClient from './apiClient';
let apiClient;

export const initializeUserApi = (getAccessToken, logout) => {
    apiClient = getApiClient(getAccessToken, logout);
};

export const getUsers = (status = 'all') => apiClient(`/users/?status=${status}`);
export const createUser = (userData) => apiClient('/users/', { method: 'POST', body: userData });
export const updateUser = (userId, userData) => apiClient(`/users/${userId}`, { method: 'PUT', body: userData });
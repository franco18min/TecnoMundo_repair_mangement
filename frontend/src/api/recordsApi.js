import getApiClient from './apiClient';
let apiClient;

export const initializeRecordsApi = (getAccessToken, logout) => {
    apiClient = getApiClient(getAccessToken, logout);
};

export const fetchRecords = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/records/?${query}`);
};

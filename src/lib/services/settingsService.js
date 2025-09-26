import API from '../services/api';
import { handleApiRequest } from '../utilities/fetch';

// Base URL for settingss API
const API_BASE_URL = '/api/app/settings';

// Fetch all settings for user.
export const fetchSettings = async ( {
    userId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/${ userId }`,
        stateSetter: stateSetter,
        successCallback: successCallback,
        // errorCallback: errorCallback,
    } );
};

// Save settings definitions.
export const saveSettings = async ( {
    userId,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/${ userId }`,
        data: data,
        // requiredFields: [ 'title' ], // Add any required fields for validation
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Create a new settings definition.
export const createSettings = async ( {
    userId,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/${ userId }`,
        data: data,
        // requiredFields: [ 'title' ], // Add any required fields for validation
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update user settings.
export const updateSettings = async ( {
    userId,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/${ userId }`,
        data: data,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Reset (Delete) a user's settings definition.
export const resetSettings = async ( {
    userId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/${ userId }`,
        // params: [ userId ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};


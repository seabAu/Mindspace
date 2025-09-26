// import API from "@/lib/services/api";
import API from '../services/api';
import { handleApiRequest } from '../utilities/fetch';

// Base URL for workspaces API
const API_BASE_URL = '/api/app/workspace';

// Fetch all workspaces
export const fetchWorkspaces = async ( {
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/`,
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single workspace by ID
export const fetchWorkspace = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/${ id }`,
        // requiredFields: [ 'id' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new workspace
export const createWorkspace = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/`,
        data: data,
        requiredFields: [ 'title' ], // Add any required fields for validation
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing workspace by ID
export const updateWorkspace = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/${ id }`,
        data: data,
        requiredFields: [ 'id', 'name' ], // Add required fields for validation
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a workspace by ID
export const deleteWorkspace = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/${ id }`,
        // requiredFields: [ 'id' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

/**
 * API endpoint for gathering comprehensive workspace statistics
 * Aggregates data from all workspace data types for dashboard display
 */

/**
 * Fetches comprehensive statistics for a specific workspace
 * @param {string} workspaceId - The workspace ID to get stats for
 * @returns {Object} Comprehensive workspace statistics
 */
export const getWorkspaceStats = async ( workspaceId ) => {
    try {
        const response = await API.get( `${ API_BASE_URL }/${ workspaceId }/stats` );
        return response.data;
    } catch ( error ) {
        console.error( "Error fetching workspace stats:", error );
        throw error;
    }
};

/**
 * Fetches statistics for all user workspaces
 * @returns {Array} Array of workspace statistics
 */
export const getAllWorkspacesStats = async () => {
    try {
        const response = await API.get( `${ API_BASE_URL }/stats` );
        return response.data;
    } catch ( error ) {
        console.error( "Error fetching all workspaces stats:", error );
        throw error;
    }
};

/**
 * Fetches recent activity across all data types for a workspace
 * @param {string} workspaceId - The workspace ID
 * @param {number} limit - Number of recent items to fetch
 * @returns {Object} Recent activity data
 */
export const getWorkspaceRecentActivity = async ( workspaceId, limit = 10 ) => {
    try {
        const response = await API.get( `${ API_BASE_URL }/${ workspaceId }/recent?limit=${ limit }` );
        return response.data;
    } catch ( error ) {
        console.error( "Error fetching workspace recent activity:", error );
        throw error;
    }
};

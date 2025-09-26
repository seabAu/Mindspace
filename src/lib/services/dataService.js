import { handleApiRequest } from '@/lib/utilities/fetch';

// Base URL for workspaces API
const API_BASE_URL = '/api/app/data';

// Fetch all data
export const fetchAllData = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single data point by ID
export const fetchData = async ( {
    id,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/${ id }`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new data point
export const createData = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/`,
        data: data,
        requiredFields: [ 'workspaceId', 'userId', 'dataKey' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Import bulk data from a file. 
export const importBulkData = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/import`,
        data: data,
        // requiredFields: [ 'workspaceId', 'userId', 'dataKey' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update bulk data points
export const updateBulkData = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/bulkupdate`,
        data: data,
        // requiredFields: [ 'workspaceId', 'userId', 'dataKey' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing data point by ID
export const updateData = async ( {
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
        requiredFields: [ '_id', 'workspaceId', 'dataKey' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a data point by ID
export const deleteData = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};


// Fetch a single data point by filter terms
export const fetchDataByFilter = async ( {
    filters,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/filter?${ Object.keys( filters ).map( ( k, i ) => ( [ k, filters?.[ k ] ].join( '=' ) ) ).join( '&' ) }`,
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};


// Fetch a single data point by date
export const fetchDataForDate = async ( {
    timeStamp,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/date`,
        params: { workspaceId, timeStamp },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};


// Fetch a single data point by date range
export const fetchDataForDateRange = async ( {
    startTime,
    endTime,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/range`,
        params: { workspaceId, startTime, endTime },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};


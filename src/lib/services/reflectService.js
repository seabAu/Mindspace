// Merged service file:
// - Original statsService endpoints preserved
// - New Habit endpoints added in the same style
// - Name: reflectService.js

import { handleApiRequest } from '@/lib/utilities/fetch';
import * as utils from 'akashatools';

// Base URLs
const API_BASE_URL = '/api/app/reflect';
// const STATS_API_BASE_URL = '/api/app/data';
// const HABIT_API_BASE_URL = '/api/app/habit';

/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// STATS API /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Fetch all data
export const fetchAllStatsApi = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/stats/`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single data point by ID
export const fetchStatsByIdApi = async ( {
    id,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/stats/${ id }`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new data point
export const createStatsApi = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/stats/`,
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
        url: `${ API_BASE_URL }/stats/import`,
        data: data,
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
        url: `${ API_BASE_URL }/stats/bulkupdate`,
        data: data,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing data point by ID
export const updateStatsApi = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/stats/${ id }`,
        data: data,
        requiredFields: [ '_id', 'workspaceId', 'dataKey' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a data point by ID
export const deleteStatsApi = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/stats/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Fetch a single data point by filter terms
export const fetchStatsByFilter = async ( {
    filters,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/stats/filter?${ Object.keys( filters )
            .map( ( k ) => [ k, filters?.[ k ] ].join( '=' ) )
            .join( '&' ) }`,
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single data point by date
export const fetchStatsForDate = async ( {
    timeStamp,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/stats/date`,
        params: { workspaceId, timeStamp },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single data point by date range
export const fetchStatsForDateRange = async ( {
    startTime,
    endTime,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/stats/range`,
        params: { workspaceId, startTime, endTime },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

/* =========================
   Habits (New API)
   ========================= */

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// HABITS API /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Fetch all habits
export const fetchAllHabits = async ( {
    workspaceId,
    userId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    const params = {};
    if ( workspaceId ) params.workspaceId = workspaceId;
    if ( userId ) params.userId = userId;

    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/habits/`,
        params,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Fetch a habit by ID
export const fetchHabitById = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/habits/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Create a new habit
export const createHabitApi = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/habits/`,
        data,
        requiredFields: [ 'workspaceId', 'userId', 'title', 'inputType' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing habit
export const updateHabitApi = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/habits/${ id }`,
        data,
        requiredFields: [ '_id', 'workspaceId', 'title' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a habit by ID
export const deleteHabitApi = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/habits/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Filter habits (optional)
export const fetchHabitsByFilter = async ( {
    filters,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    const query = Object.keys( filters || {} )
        .map( ( k ) => [ k, filters?.[ k ] ].join( '=' ) )
        .join( '&' );

    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/habits/?${ query }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Upsert a single activity entry for a habit on a date
export const updateHabitActivityApi = async ( {
    id,
    date,
    value = 0,
    notes = '',
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'patch',
        url: `${ API_BASE_URL }/habits/${ id }/activity`,
        data: { data: { date, value, notes } },
        requiredFields: [ 'date' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Upsert multiple activity entries (bulk)
export const updateHabitActivityBulkApi = async ( {
    id,
    activities = [],
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'patch',
        url: `${ API_BASE_URL }/habits/${ id }/activity/bulk`,
        data: { data: { activities } },
        requiredFields: [ 'activities' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};






/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// LOG API ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Fetch all logs
export const fetchLogs = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/log/`,
        params: { workspaceId },
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Fetch a specific log by ID
export const fetchLogById = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/log/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Add a new log
export const createLog = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    console.log( "reflectService.js :: createLog :: data = ", data );

    // Filter out any duplicate _id keys. 
    data = utils.ao.filterKeys( data, [ "_id" ] );
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/log/`,
        data: data,
        requiredFields: [ 'workspaceId', 'userId' ], // Add required fields based on your schema
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing log
export const updateLog = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/log/${ id }`,
        data: data,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a log
export const deleteLog = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/log/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};
// export default reflectService;

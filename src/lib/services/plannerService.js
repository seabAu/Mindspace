import axios from 'axios';
import * as utils from 'akashatools';
import {
    handleApiRequest,
    handleError,
    handleSuccess,
} from '../utilities/fetch';
const API_BASE_URL = '/api/app/planner'; // Base URL for planner API
// const API = axios.create( {
//     baseURL: API_BASE_URL,
//     headers: {
//         "x-auth-token": localStorage.getItem( "mindspace-app-token" ),
//         "Content-type": "application/json",
//         "Access-Control-Allow-Origin": "*"
//     }
// } );

/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// PLANNERS /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Fetch all planners
export const fetchPlanners = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/planner/`,
        params: { workspaceId },
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Fetch a specific planner by ID
export const fetchPlannerById = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/planner/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Add a new planner
export const createPlanner = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    console.log( "plannerService.js :: createPlanner :: data = ", data );

    // Filter out any duplicate _id keys. 
    data = utils.ao.filterKeys( data, [ "_id" ] );
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/planner/`,
        data: data,
        requiredFields: [ 'workspaceId', 'userId' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing planner
export const updatePlanner = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/planner/${ id }`,
        data: data,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a planner
export const deletePlanner = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !id ) throw new Error( 'id is required' );

    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/planner/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// EVENTS //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Create a new event
export const createEvent = async ( {
    workspaceId,
    data,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'post',
        // url: `${ API_BASE_URL }/event`,
        url: `${ API_BASE_URL }/event/`,
        data: { ...data, workspaceId },
        params: { workspaceId },
        requiredFields: [ 'workspaceId', 'title', 'start', 'end' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const fetchEvents = async ( {
    workspaceId,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/event/`,
        params: { workspaceId },
        // requiredFields: [ "workspaceId" ]
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const fetchEventsInDateRange = async ( {
    workspaceId,
    startDate,
    endDate,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    // Make sure workspace Id is set.
    if ( !workspaceId ) {
        errorCallback( 'Workspace ID is required' );
        return null;
    }

    if ( !startDate || !endDate ) {
        errorCallback( 'A valid start and end date(s) are required.' );
        return null;
    }

    return handleApiRequest( {
        // url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }&startDate=${ startDate }&endDate=${ endDate }`,
        url: `${ API_BASE_URL }/event/range`,
        params: { workspaceId, startDate, endDate },
        data: { workspaceId, startDate, endDate },
        requiredFields: [ 'workspaceId', 'startDate', 'endDate' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const fetchEvent = async ( {
    workspaceId,
    eventId,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/event/${ eventId }`,
        params: { workspaceId, eventId },
        requiredFields: [ 'workspaceId', 'eventId' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const updateEvent = async ( {
    workspaceId,
    eventId,
    data,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/event/${ eventId }`,
        params: { workspaceId },
        data: data,
        requiredFields: [ '_id' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const deleteEvent = async ( {
    id,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/event/${ id }`,
        // params: { workspaceId },
        data: { id },
        requiredFields: [ 'eventId' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// CALENDARS /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// Fetch all calendars for a workspace
export const fetchCalendars = async ( {
    workspaceId,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/calendar/`,
        params: { workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch all events for a specific calendar
export const fetchEventsForCalendar = async ( {
    id,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/event/calendar/${ id }`,
        params: { id },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch all calendars with their events for a workspace
export const fetchCalendarsWithEvents = async ( {
    workspaceId,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        // url: `${ API_BASE_URL }/?workspaceId=${ workspaceId }`,
        url: `${ API_BASE_URL }/`,
        params: { workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Add or remove an event from a calendar
export const toggleCalendarEvent = async ( {
    calendarId,
    eventId,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/event/toggle/${ eventId }`,
        data: { calendarId, eventId },
        requiredFields: [ 'calendarId', 'eventId' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new calendar
export const createCalendar = async ( {
    data,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/calendar/`,
        data: data,
        requiredFields: [ 'workspaceId', 'title' ],
        successCallback: ( data ) => {
            toast( {
                title: 'Calendar Created',
                description: `Successfully created calendar \"${ data?.title }\"`,
            } );
            handleSuccess( { data, stateSetter, doToast: true } );
        },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const fetchCalendar = async ( {
    workspaceId,
    id,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/calendar/${ id }`,
        params: { workspaceId, id },
        requiredFields: [ 'workspaceId', 'id' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const updateCalendar = async ( {
    data,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/calendar/${ data?._id }`,
        data: data,
        requiredFields: [ '_id' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

export const deleteCalendar = async ( {
    id,
    stateSetter,
    successCallback,
    errorCallback,
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/calendar/${ id }`,
        data: { id },
        requiredFields: [ 'id' ],
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

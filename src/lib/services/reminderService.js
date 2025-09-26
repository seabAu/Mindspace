// Service file for handling API endpoint calls to the data and stats functionality.
import { handleApiRequest } from '@/lib/utilities/fetch';

// Base URL for stats API
const API_BASE_URL = '/api/app/alert';

// Fetch all data
export const fetchReminders = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/remind/`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single data point by ID
export const fetchReminderById = async ( {
    id,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/remind/${ id }`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new data point
export const createReminder = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/remind/`,
        data: data,
        requiredFields: [ 'workspaceId', 'userId', 'title', 'startDate' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing data point by ID
export const updateReminder = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/remind/${ id }`,
        data: data,
        requiredFields: [ '_id', 'workspaceId', 'title' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a data point by ID
export const deleteReminder = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/remind/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};



/////////////////// NOTIFICATION FUNCTIONS ///////////////////


// Trigger a new notification
export const createNotificationByReminderId = async ( {
    id,
    triggerDate,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/notify/trigger/${ id }`,
        // params: { id: id },
        data: { triggerDate: triggerDate },
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Fetch all notifications created from a specific reminder id
export const fetchNotificationsOfReminderId = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/notify/all/${ id }`,
        // params: { id: id },
        data: { triggerDate: triggerDate },
        stateSetter,
        successCallback,
        errorCallback,
    } );
};


// Fetch all data
export const fetchNotifications = async ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/notify/`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Fetch a single notification by ID
export const fetchNotificationById = async ( {
    id,
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/notify/${ id }`,
        params: { workspaceId: workspaceId },
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback,
    } );
};

// Create a new notification
export const createNotification = async ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/notify/`,
        data: data,
        requiredFields: [ 'userId', 'workspaceId', 'reminderId' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Update an existing notification by ID
export const updateNotification = async ( {
    id,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/notify/${ id }`,
        data: data,
        // requiredFields: [ '_id', 'workspaceId', 'userId', 'title', 'startDate' ],
        stateSetter,
        successCallback,
        errorCallback,
    } );
};

// Delete a notification by ID
export const deleteNotification = async ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/notify/${ id }`,
        stateSetter,
        successCallback,
        errorCallback,
    } );
};



// Generic meta-functions for use throughout the app
import { useCallback, useEffect, useReducer, useState } from 'react';
import API from '../services/api';
import axios from 'axios';
import { ToastAction } from '@/components/ui/toast';
import { toast } from 'sonner';
import * as utils from 'akashatools';
import useError from '../hooks/useError';
import { mapObj2Obj } from '../utilities/obj';
import { formatDateTime } from '../utilities/time';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/Calendar/DatePicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormGenerator from '@/components/Form/FormGenerator';
import { Delete, Edit, FileQuestion, FolderOpen, Plus } from 'lucide-react';
import { handleApiRequest } from '../utilities/fetch';

const API_BASE_URL = '/api/app'; // Base URL for notes API

// Service file API request functions
export const fetchAllDocuments = ( {
    endpoint,
    params,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ endpoint }`,
        params: params,
        successCallback: successCallback,
        errorCallback: errorCallback
    } );
};

export const fetchDocumentById = ( {
    endpoint,
    id,
    requiredFields,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ endpoint }/${ id }`,
        requiredFields,
        stateSetter,
        successCallback,
        errorCallback
    } );
};

export const fetchDocumentsByFilter = ( {
    endpoint,
    data,
    requiredFields,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ endpoint }`,
        data,
        requiredFields,
        stateSetter,
        successCallback,
        errorCallback
    } );
};

export const createDocument = ( {
    endpoint,
    data,
    requiredFields,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ endpoint }`,
        data,
        requiredFields,
        stateSetter,
        successCallback,
        errorCallback
    } );
};

export const updateDocument = ( {
    id,
    data,
    endpoint,
    requiredFields,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ endpoint }/${ id }`,
        data,
        requiredFields,
        stateSetter,
        successCallback,
        errorCallback
    } );
};

export const deleteDocument = ( {
    id,
    endpoint,
    stateSetter,
    successCallback,
    errorCallback
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ endpoint }/${ id }`,
        stateSetter: stateSetter,
        successCallback: successCallback,
        errorCallback: errorCallback
    } );
}

/* 
export {
    handleChange,
    handleCreateStart,
    handleCreateSubmit,
    handleEditStart,
    handleEditSubmit,
    handleDeleteStart,
    handleDeleteSubmit,
    handleFetchDocuments,
    handleToggleActive,
    handleFetchAllDocuments,
    fetchDocumentsByFilter,
    handleFetchDocumentById,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument,
};
*/




/*  import { useState, useCallback } from 'react';
    import axios from 'axios';

    // Custom hook for planner API operations
    const usePlannerApi = (baseUrl) => {
        const [plannerData, setPlannerData] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);

        // Helper function to safely make API calls
        const safeApiCall = useCallback(async (apiCall) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiCall();
                setIsLoading(false);
                return response.data;
            } catch (err) {
                setIsLoading(false);
                setError(err.response?.data?.message || 'An unexpected error occurred.');
                throw err;
            }
        }, []);

        // Fetch all planner data
        const fetchPlannerData = useCallback(async () => {
            return safeApiCall(async () => {
                const response = await axios.get(`${baseUrl}/planner`);
                setPlannerData(response.data.data);
                return response;
            });
        }, [baseUrl, safeApiCall]);

        // Add a new task
        const addTask = useCallback(async (taskData) => {
            if (!taskData || typeof taskData !== 'object') {
                throw new Error('Invalid task data provided.');
            }
            return safeApiCall(async () => {
                return axios.post(`${baseUrl}/planner`, taskData);
            });
        }, [baseUrl, safeApiCall]);

        // Get a task by ID
        const getTaskById = useCallback(async (taskId) => {
            if (!taskId) {
                throw new Error('Task ID is required.');
            }
            return safeApiCall(async () => {
                return axios.get(`${baseUrl}/planner/${taskId}`);
            });
        }, [baseUrl, safeApiCall]);

        // Update a task by ID
        const updateTaskById = useCallback(async (taskId, updates) => {
            if (!taskId) {
                throw new Error('Task ID is required.');
            }
            if (!updates || typeof updates !== 'object') {
                throw new Error('Updates must be a valid object.');
            }
            return safeApiCall(async () => {
                return axios.put(`${baseUrl}/planner/${taskId}`, updates);
            });
        }, [baseUrl, safeApiCall]);

        // Delete a task by ID
        const deleteTaskById = useCallback(async (taskId) => {
            if (!taskId) {
                throw new Error('Task ID is required.');
            }
            return safeApiCall(async () => {
                return axios.delete(`${baseUrl}/planner/${taskId}`);
            });
        }, [baseUrl, safeApiCall]);

        // Clear completed tasks
        const clearCompletedTasks = useCallback(async () => {
            return safeApiCall(async () => {
                return axios.delete(`${baseUrl}/planner/completed`);
            });
        }, [baseUrl, safeApiCall]);

        // Mark a task as completed
        const markTaskAsCompleted = useCallback(async (taskId) => {
            if (!taskId) {
                throw new Error('Task ID is required.');
            }
            return safeApiCall(async () => {
                return axios.put(`${baseUrl}/planner/${taskId}/completed`);
            });
        }, [baseUrl, safeApiCall]);

        // Reorder tasks
        const reorderTasks = useCallback(async (orderData) => {
            if (!orderData || !Array.isArray(orderData)) {
                throw new Error('Order data must be a valid array.');
            }
            return safeApiCall(async () => {
                return axios.post(`${baseUrl}/planner/reorder`, { order: orderData });
            });
        }, [baseUrl, safeApiCall]);

        return {
            plannerData,
            isLoading,
            error,
            fetchPlannerData,
            addTask,
            getTaskById,
            updateTaskById,
            deleteTaskById,
            clearCompletedTasks,
            markTaskAsCompleted,
            reorderTasks,
        };
    };

    export default usePlannerApi;
*/

/*  const useTask = ( workspaceId ) => {
        const [ tasks, setTasks ] = useState( [] );
        const [ error, setError ] = useState( null );
        const [ loading, setLoading ] = useState( false );

        const handleError = ( err ) => {
            let errMsg;
            if ( utils.val.isString( err ) ) {
                // Given a basic string.
                errMsg = err;
            }
            else if ( utils.val.isAO( err ) ) {
                // Given an object or array.
                errMsg = err?.response?.data?.message;
            }
            setError( errMsg || 'An unexpected error occurred' );
            setLoading( false );
            console.error( "useTask :: API Error: ", errMsg );
            if ( errMsg ) throw new Error( errMsg );
        };

        // Helper function to validate inputs
        const validateInputs = ( inputs, requiredFields ) => {
            for ( const field of requiredFields ) {
                if ( !inputs[ field ] ) throw new Error( `${ field } is required` );
            }
        };

        useEffect( () => {
            // Handle showing errors. 
            if ( error ) {
                toast( "API Error", {
                    description: error,
                    action: (
                        <ToastAction altText="OK">
                            { `OK` }
                        </ToastAction>
                    ),
                } );
                setError( null );
            }
        }, [ error ] );

        const fetchTasks = async ( workspaceId ) => {
            try {
                const response = await API.get( `${ API_BASE_URL }/todo/?workspaceId=${ workspaceId }`, {
                    data: { workspaceId },
                } );
                setTasks( response.data.data );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const fetchTasksByDateRange = async ( workspaceId, startDate, endDate ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            if ( !startDate || !endDate ) {
                handleError( 'A valid start and end date(s) are required.' );
                return null;
            }

            try {
                const response = await API.get( `${ API_BASE_URL }/range/?workspaceId=${ workspaceId }&startDate=${ startDate }&endDate=${ endDate }`, {
                    data: { workspaceId, startDate, endDate },
                } );
                setTasks( response.data.data );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const fetchTasksByDueDate = async ( workspaceId, dueDate ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            if ( !dueDate ) {
                handleError( 'A valid due date is required.' );
                return null;
            }

            try {
                const response = await API.get( `${ API_BASE_URL }/todo/due/?workspaceId=${ workspaceId }&dueDate=${ dueDate }`, {
                    data: { workspaceId, dueDate },
                } );
                setTasks( response.data.data );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const fetchRecurringTasks = async ( workspaceId ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            try {
                const response = await API.get( `${ API_BASE_URL }/todo/recurring/?workspaceId=${ workspaceId }`, {
                    data: { workspaceId, dueDate },
                } );
                setTasks( response.data.data );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const fetchTasksByFilter = async ( workspaceId, category = '', title = '' ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            if ( !category || !title ) {
                handleError( 'Valid categories and a valid title are required.' );
                return null;
            }

            try {
                const response = await API.get( `${ API_BASE_URL }/todo/filter/?workspaceId=${ workspaceId }&category=${ category }&title=${ title }`, {
                    data: { workspaceId, category, title },
                } );
                setTasks( response.data.data );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const getAllTasks = async ( workspaceId ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            try {
                setLoading( true );
                const response = await API.get( `${ API_BASE_URL }/todo/?workspaceId=${ workspaceId }`, { params: { workspaceId } } );
                setLoading( false );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        // Update task function
        const updateTask = async ( workspaceId, taskData ) => {
            let taskId;
            if ( taskData && utils.val.isObject( taskData ) ) {
                if ( taskData.hasOwnProperty( '_id' ) ) {
                    taskId = taskData._id;
                }
            }

            if ( !taskId ) {
                // throw new Error( "Task ID is required to update a task." );
                handleError( "Task ID is required to update a task." );
            }

            try {
                setLoading( true );
                const response = await API.put( `/todo/${ taskId }`, taskData );
                setLoading( false );
                return response.data.data; // Assuming the API returns the updated task here
            } catch ( err ) {
                handleError( err );
                setLoading( false );
                return null;
            }
        };

        const fetchTask = async ( workspaceId, taskId ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                // throw new Error( 'Workspace ID is required' );
                return null;
            }

            if ( !taskId ) {
                handleError( 'TaskId is required' );
                return null;
            }

            try {
                setLoading( true );
                const response = await API.get( `${ API_BASE_URL }/todo/?workspaceId=${ workspaceId }&taskId=${ taskId }` );
                setLoading( false );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const createTask = async ( taskData, workspaceId ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            try {
                setLoading( true );
                const response = await API.post( `${ API_BASE_URL }/todo/`, { ...taskData, workspaceId } );
                setLoading( false );
                toast( {
                    title: "You submitted the following values:",
                    description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                            <code className="text-white">
                                { JSON.stringify( response?.data?.data, null, 2 ) }
                            </code>
                        </pre>
                    ),
                } );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        const deleteTask = async ( taskId, workspaceId ) => {
            if ( !workspaceId ) {
                handleError( 'Workspace ID is required' );
                return null;
            }

            if ( !taskId ) {
                handleError( 'Task ID is required' );
                return null;
            }

            try {
                setLoading( true );
                const response = await API.delete( `${ API_BASE_URL }/todo/${ taskId }`, {
                    data: { workspaceId },
                } );
                setLoading( false );
                return response.data.data;
            } catch ( err ) {
                handleError( err );
                return null;
            }
        };

        return {
            tasks,
            loading,
            error,
            fetchTasks,
            fetchTasksByDateRange,
            fetchTasksByDueDate,
            fetchTasksByFilter,
            fetchRecurringTasks,
            getAllTasks,
            createTask, // Create new task
            fetchTask, // Fetch 1 task by ID.
            deleteTask, // Delete task by ID
            updateTask, // Update task by ID
        };
    };
*/


/*  // Service functions
    const plannerService = {
       // Events
       createEvent: async ( workspaceId, data ) =>
           handleApiRequest( {
               method: "post",
               url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }`,
               data: { ...data, workspaceId },
               params: { workspaceId },
               requiredFields: [ "workspaceId", "title", "start", "end" ]
           } ),

       fetchEvents: async ( workspaceId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }`,
               params: { workspaceId },
               requiredFields: [ "workspaceId" ]
           } ),

       fetchEventsInDateRange: async ( workspaceId, startDate, endDate ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }&startDate=${ startDate }&endDate=${ endDate }`,
               data: { workspaceId, startDate, endDate },
               requiredFields: [ "workspaceId", "startDate", "endDate" ]
           } ),

       fetchEvent: async ( workspaceId, eventId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/event/`,
               params: { workspaceId, eventId },
               requiredFields: [ "workspaceId", "eventId" ]
           } ),

       updateEvent: async ( workspaceId, eventId, data ) =>
           handleApiRequest( {
               method: "put",
               url: `${ API_BASE_URL }/event/${ data._id }`,
               params: { workspaceId },
               data: data,
               requiredFields: [ "_id" ]
           } ),

       deleteEvent: async ( workspaceId, eventId ) =>
           handleApiRequest( {
               method: "delete",
               url: `${ API_BASE_URL }/event/${ eventId }`,
               params: { workspaceId },
               data: { eventId, workspaceId },
               requiredFields: [ "workspaceId", "eventId" ]
           } ),

       // Calendars
       fetchCalendars: async ( workspaceId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/calendar/`,
               params: { workspaceId },
               requiredFields: [ "workspaceId" ]
           } ),

       fetchEventsForCalendar: async ( calendarId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/event/calendar/${ calendarId }`,
               params: { calendarId },
               requiredFields: [ "calendarId" ]
           } ),

       fetchCalendarsWithEvents: async ( workspaceId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/`,
               params: { workspaceId },
               requiredFields: [ "workspaceId" ]
           } ),

       toggleCalendarEvent: async ( calendarId, eventId ) =>
           handleApiRequest( {
               method: "post",
               url: `${ API_BASE_URL }/event/toggle/${ eventId }`,
               data: { calendarId, eventId },
               requiredFields: [ "calendarId", "eventId" ]
           } ),

       createCalendar: async ( workspaceId, data ) =>
           handleApiRequest( {
               method: "post",
               url: `${ API_BASE_URL }/calendar/`,
               data: { ...data, workspaceId },
               requiredFields: [ "workspaceId" ]
           } ),

       fetchCalendar: async ( workspaceId, calendarId ) =>
           handleApiRequest( {
               url: `${ API_BASE_URL }/calendar/${ calendarId }`,
               params: { workspaceId, calendarId },
               requiredFields: [ "workspaceId", "calendarId" ]
           } ),

       updateCalendar: async ( calendarData ) =>
           handleApiRequest( {
               method: "put",
               url: `${ API_BASE_URL }/calendar/${ calendarData._id }`,
               data: calendarData,
               requiredFields: [ "_id" ]
           } ),

       deleteCalendar: async ( calendarId ) =>
           handleApiRequest( {
               method: "delete",
               url: `${ API_BASE_URL }/calendar/${ calendarId }`,
               data: { calendarId },
               requiredFields: [ "calendarId" ]
           } )
    }; 
*/

/*  // const handleError = ( err ) => {
    //     setError( err.response?.data?.message || 'An unexpected error occurred' );
    //     setLoading( false );
    //     console.error( err );
    // };
   

    // Helper function to validate inputs
    const validateInputs = ( inputs, requiredFields ) => {
        for ( const field of requiredFields ) {
            if ( !inputs[ field ] ) throw new Error( `${ field } is required` );
        }
    };

    const handleError = ( err ) => {
        let errMsg;
        if ( utils.val.isString( err ) ) {
            // Given a basic string.
            errMsg = err;
        }
        else if ( utils.val.isAO( err ) ) {
            // Given an object or array.
            errMsg = err?.response?.data?.message;
        }
        setError( errMsg || 'An unexpected error occurred' );
        setLoading( false );
        console.error( "usePlanner :: API Error: ", errMsg );
        if ( errMsg ) throw new Error( errMsg );
    };

    const handleApiRequest = async ( {
        method = "get",
        url,
        data = {},
        params = {},
        requiredFields = [],
        successCallback,
        stateSetter,
    } ) => {
        try {
            if ( requiredFields.length ) validateInputs( data, requiredFields );

            setLoading( true );
            const response = await API[ method ]( url, { data, params } );
            setLoading( false );

            if ( stateSetter ) stateSetter( response.data.data );
            if ( successCallback ) successCallback( response.data.data );

            return response.data.data;
        } catch ( err ) {
            handleError( err );
            return null;
        }
    };

    useEffect( () => {
        // Handle showing errors. 
        if ( error ) {
            toast( "API Error", {
                description: error,
                action: (
                    <ToastAction altText="OK">
                        { `OK` }
                    </ToastAction>
                ),
            } );
            setError( null );
        }
    }, [ error ] );

    // Create a new event
    const createEvent = async ( workspaceId, data ) => {
        return handleApiRequest( {
            method: "post",
            // url: `${ API_BASE_URL }/event`,
            url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }`,
            data: { ...data, workspaceId },
            params: { workspaceId },
            requiredFields: [ "workspaceId", "title", "start", "end" ],
        } );
    };

    // const createEvent = async ( workspaceId, data ) => {
    //     return handleApiRequest( {
    //         method: "post",
    //         url: `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }`,
    //         params: { workspaceId },
    //         data: { ...data, workspaceId },
    //         requiredFields: [ "workspaceId" ],
    //         successCallback: ( data ) => {
    //             toast( {
    //                 title: "Task Created",
    //                 // description: (
    //                 //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //                 //         <code className="text-white">
    //                 //             { JSON.stringify( data, null, 2 ) }
    //                 //         </code>
    //                 //     </pre>
    //                 // ),
    //             } );
    //         },
    //     } );
    // };

    const fetchEvents = async ( workspaceId ) => {
        // Make sure workspace Id is set.
        if ( !workspaceId ) {
            handleError( 'usePlanner :: fetchEvents :: Workspace ID is required' );
            return null;
        }

        // validateInputs( workspaceId, [ 'workspaceId' ] );

        try {
            setLoading( true );
            const response = await API.get( `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }` );

            // if ( response?.data?.data ) {
            if ( response?.status === 200 ) {
                // Successful call.
                const data = response?.data?.data;
                setEvents( data );
                setError( null );
                setLoading( false );
                return data;
            }
            else {
                // There was an error on the backend.
                handleError( `usePlanner :: FetchEvents :: There was an API error: ${ response?.data?.message }` );
                setLoading( false );
                return null;
            }
        } catch ( err ) {
            let errmsg = err?.response?.data?.message;
            handleError( errmsg || 'Error fetching events' );
            return null;
        } finally {
            setError( null );
            setLoading( false );
        }
    };

    const fetchEventsInDateRange = async ( workspaceId, startDate, endDate ) => {
        // Make sure workspace Id is set.
        if ( !workspaceId ) {
            handleError( 'Workspace ID is required' );
            return null;
        }

        if ( !startDate || !endDate ) {
            handleError( 'A valid start and end date(s) are required.' );
            return null;
        }

        try {
            setLoading( true );
            const response = await API.get( `${ API_BASE_URL }/event/?workspaceId=${ workspaceId }&startDate=${ startDate }&endDate=${ endDate }`, {
                data: { workspaceId, startDate, endDate },
            } );

            // if ( response?.data?.data ) {
            if ( response?.status === 200 ) {
                // Successful call.
                const data = response?.data?.data;
                setEvents( data );
                setError( null );
                setLoading( false );
                return data;
            }
            else {
                // There was an error on the backend.
                handleError( `usePlanner :: FetchEvents :: There was an API error: ${ response?.data?.message }` );
                setLoading( false );
                return null;
            }
        } catch ( err ) {
            let errmsg = err?.response?.data?.message;
            handleError( errmsg || 'Error fetching events' );
            return null;
        } finally {
            setError( null );
            setLoading( false );
        }
    };

    const fetchEvent = async ( workspaceId, eventId ) => {
        return handleApiRequest( {
            url: `${ API_BASE_URL }/event/`,
            params: { workspaceId, eventId },
            requiredFields: [ "workspaceId", "eventId" ],
        } );
    };

    const updateEvent = async ( workspaceId, eventId, data ) => {
        return handleApiRequest( {
            method: "put",
            url: `${ API_BASE_URL }/event/${ data?._id }`,
            params: { workspaceId },
            data: data,
            requiredFields: [ "_id" ],
        } );
    };

    const deleteEvent = async ( workspaceId, eventId ) => {
        return handleApiRequest( {
            method: "delete",
            url: `${ API_BASE_URL }/event/${ eventId }`,
            params: { workspaceId },
            data: { eventId, workspaceId },
            requiredFields: [ "workspaceId", "eventId" ],
        } );
    };

    // Fetch all calendars for a workspace
    const fetchCalendars = async ( workspaceId ) => {
        return handleApiRequest( {
            url: `${ API_BASE_URL }/calendar/`,
            params: { workspaceId },
            stateSetter: setCalendars,
        } );
    };

    // Fetch all events for a specific calendar
    const fetchEventsForCalendar = async ( calendarId ) => {
        return handleApiRequest( {
            url: `${ API_BASE_URL }/event/calendar/${ calendarId }`,
            params: { calendarId },
            stateSetter: setEvents,
        } );
    };

    // Fetch all calendars with their events for a workspace
    const fetchCalendarsWithEvents = async ( workspaceId ) => {
        return handleApiRequest( {
            // url: `${ API_BASE_URL }/?workspaceId=${ workspaceId }`,
            url: `${ API_BASE_URL }/`,
            params: { workspaceId },
            stateSetter: setCalendars,
        } );
    };

    // Add or remove an event from a calendar
    const toggleCalendarEvent = async ( calendarId, eventId ) => {
        return handleApiRequest( {
            method: "post",
            url: `${ API_BASE_URL }/event/toggle/${ eventId }`,
            data: { calendarId, eventId },
            requiredFields: [ "calendarId", "eventId" ],
        } );
    };

    // Create a new calendar
    const createCalendar = async ( workspaceId, data ) => {
        return handleApiRequest( {
            method: "post",
            url: `${ API_BASE_URL }/calendar/`,
            data: { ...data, workspaceId },
            requiredFields: [ "workspaceId" ],
            successCallback: ( data ) => {
                toast( {
                    title: "Calendar Created",
                    description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                            <code className="text-white">
                                { JSON.stringify( data, null, 2 ) }
                            </code>
                        </pre>
                    ),
                } );
            },
        } );
    };

    const fetchCalendar = async ( workspaceId, calendarId ) => {
        return handleApiRequest( {
            url: `${ API_BASE_URL }/calendar/${ calendarId }`,
            params: { workspaceId, calendarId },
            requiredFields: [ "workspaceId", "calendarId" ],
        } );
    };

    const updateCalendar = async ( calendarData ) => {
        return handleApiRequest( {
            method: "put",
            url: `${ API_BASE_URL }/calendar/${ calendarData._id }`,
            data: calendarData,
            requiredFields: [ "_id" ],
        } );
    };

    const deleteCalendar = async ( calendarId ) => {
        return handleApiRequest( {
            method: "delete",
            url: `${ API_BASE_URL }/calendar/${ calendarId }`,
            data: { calendarId },
            requiredFields: [ "calendarId" ],
        } );
    };

    return {
        events,
        calendars,
        error,
        loading,

        fetchEvents,
        fetchEventsInDateRange,
        createEvent,
        fetchEvent,
        updateEvent,
        deleteEvent,

        fetchCalendars,
        fetchEventsForCalendar,
        fetchCalendarsWithEvents,
        toggleCalendarEvent,
        createCalendar,
        fetchCalendar,
        updateCalendar,
        deleteCalendar,
    };
*/



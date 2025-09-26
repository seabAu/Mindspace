import { toast } from 'sonner';
import API from '../services/api';
import { ToastAction } from '@/components/ui/toast';
import * as utils from 'akashatools';
import { handleApiRequest, handleError, handleSuccess } from '../utilities/fetch';
const API_BASE_URL = '/api/app/task';

export const taskSuccessCallbackFn = ( data, message, handleError = () => { } ) => {
    toast( {
        title: 'Task Created',
        description: message ? message : 'Task operation successful',
        // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //     <code className="text-white">{ JSON.stringify( data, null, 2 ) }</code>
        // </pre>
    } );
};

/////////////////////////////////////////////////////////////////////////////
//////////////////////////// TODO ITEM FUNCTIONS ////////////////////////////
/////////////////////////////////////////////////////////////////////////////

export const fetchTasks = ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/todo/`,
        params: { workspaceId },
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchTasksByDateRange = ( {
    workspaceId,
    startDate,
    endDate,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/todo/range/`,
        params: { workspaceId, startDate, endDate },
        requiredFields: [ 'workspaceId', 'startDate', 'endDate' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchTasksByDueDate = ( {
    workspaceId,
    dueDate,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/todo/due/`,
        params: { workspaceId, dueDate },
        // requiredFields: [ 'workspaceId', 'dueDate' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchRecurringTasks = ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/todo/recurring/`,
        params: { workspaceId },
        // requiredFields: [ 'workspaceId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchTasksByFilter = ( {
    workspaceId,
    category = '',
    title = '',
    filters = {},
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/todo/filter/`,
        params: { workspaceId, category, title },
        data: { filters },
        requiredFields: [ 'categories', 'title' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const createTask = ( {
    workspaceId,
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/todo/`,
        data: { ...data, workspaceId },
        requiredFields: [ 'workspaceId' ],
        errorCallback,
        stateSetter,
        successCallback,
        // successCallback: ( data, handleError = () => { } ) => {
        //     toast( {
        //         title: 'Task Created',
        //         description: 'Task created!',
        //         // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //         //     <code className="text-white">{ JSON.stringify( data, null, 2 ) }</code>
        //         // </pre>
        //     } );
        // },
    } );
};

export const fetchTask = ( {
    taskId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/todo/${ taskId }`,
        params: { taskId },
        requiredFields: [ 'taskId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const updateTask = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/todo/${ data?._id }`,
        data: data,
        // requiredFields: [ '_id' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

// Bulk update endpoint.
export const updateTasks = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/todo/bulkupdate`,
        data: data,
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

// Bulk reordering endpoint.
export const reorderTasks = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/todo/reorder`,
        data: data,
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const deleteTask = ( {
    taskId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/todo/${ taskId }`,
        // data: { workspaceId },
        // requiredFields: [ '_id', 'taskId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

// Clear completed tasks
export const clearCompletedTasks = ( {
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/todo/completed`,
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

// Mark a task as completed
export const markTaskAsCompleted = ( {
    taskId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    if ( !taskId ) {
        errorCallback( 'Task ID is required.' );
    }
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/todo/${ taskId }/completed`,
        successCallback,
        errorCallback,
        stateSetter,
    } );
};








/////////////////////////////////////////////////////////////////////////////
//////////////////////////// TODO LIST FUNCTIONS ////////////////////////////
/////////////////////////////////////////////////////////////////////////////




export const fetchTodoList = ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/list/${ id }`,
        // params: { todoListId },
        // requiredFields: [ 'todoListId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchTodoLists = ( {
    workspaceId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/list/`,
        params: { workspaceId },
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const createTodoList = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/list/`,
        data: data,
        requiredFields: [ 'workspaceId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const updateTodoList = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/list/${ data?._id }`,
        data: data,
        // requiredFields: [ '_id' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const deleteTodoList = ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/list/${ id }`,
        // data: { workspaceId },
        // requiredFields: [ '_id', 'taskId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};





/////////////////////////////////////////////////////////////////////////////
///////////////////////// TODO LIST GROUP FUNCTIONS /////////////////////////
/////////////////////////////////////////////////////////////////////////////



export const fetchTodoListGroup = ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        url: `${ API_BASE_URL }/group/${ id }`,
        params: { id },
        // requiredFields: [ 'todoListId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const fetchTodoListGroups = ( {
    workspaceId,
    todoListId,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/group/`,
        params: { workspaceId: workspaceId, todoListId: todoListId },
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const createTodoListGroup = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/group/`,
        data: { ...data },
        requiredFields: [ 'workspaceId', 'todoListId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const updateTodoListGroup = ( {
    data,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/group/${ data?._id }`,
        data: data,
        // requiredFields: [ '_id' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};

export const deleteTodoListGroup = ( {
    id,
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/group/${ id }`,
        // data: { workspaceId },
        // requiredFields: [ '_id', 'taskId' ],
        successCallback,
        errorCallback,
        stateSetter,
    } );
};



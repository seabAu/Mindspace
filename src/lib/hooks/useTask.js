import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
import * as utils from 'akashatools';

import {
    taskSuccessCallbackFn,
    fetchTasks,
    fetchTasksByDateRange,
    fetchTasksByDueDate,
    fetchRecurringTasks,
    fetchTasksByFilter,
    createTask,
    fetchTask,
    updateTask,
    updateTasks,
    reorderTasks,
    deleteTask,
    clearCompletedTasks,
    markTaskAsCompleted,
    fetchTodoList,
    fetchTodoLists,
    createTodoList,
    updateTodoList,
    deleteTodoList,
    fetchTodoListGroup,
    fetchTodoListGroups,
    createTodoListGroup,
    updateTodoListGroup,
    deleteTodoListGroup,
} from './../services/taskService.js';
import useTasksStore from '@/store/task.store.js';
import useGlobalStore from '@/store/global.store.js';
import useError from './useError.js';
import FormGenerator from '@/components/Form/FormGenerator.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Check, Delete, Edit, FileQuestion, FolderOpen, Plus, X } from 'lucide-react';
import { buildSelect, handleSchema2InitialData, initializeFormModel, validateSubmittedData } from '../utilities/input.js';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import DatePicker from '@/components/Calendar/DatePicker.jsx';
import { formatDateTime, isValidDate } from '@/lib/utilities/time.js';
import { DATE_PICKER_OPTIONS } from '@/lib/config/constants.js';
import {
    DIALOG_TYPE_CLOSE_ICONS,
    DIALOG_TYPE_CLOSE_NAMES,
    DIALOG_TYPE_DESCRIPTIONS,
    DIALOG_TYPE_ICONS,
    DIALOG_TYPE_NAMES,
    DIALOG_TYPES,
    TODO_DIFFICULTY_OPTIONS,
    TODO_PRIORITY_OPTIONS,
    TODO_STATUS_OPTIONS,
    TYPE_DIALOG_CONFIG,
} from '@/lib/config/config.js';
import { twMerge } from 'tailwind-merge';
import { addDays, differenceInHours } from 'date-fns';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import { index } from 'd3';

// const API = axios.create( {
//     baseURL: API_BASE_URL,
//     headers: {
//         'x-auth-token': localStorage.getItem( `mindspace-app-token` ), // token,
//         'Content-type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//     },
// } );

const useTask = ( useSuccessToast = false ) => {
    // const [ tasks, setTasks ] = useState( [] );
    // const [ error, setError ] = useState( null );
    // const [ loading, setLoadingTasks ] = useState( false );

    const {
        debug,
        user, setUser,
        workspaceId, setWorkspaceId,
        schemas, getSchema, fetchSchemas,
        data, setData, getData, reloadData,
    } = useGlobalStore();

    const {
        // State Data Variables
        activeListId, setActiveListId,
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData,
        todoLists, setTodoLists,
        createTodoList: createTodoListState,
        addTodoList: addTodoListState,
        deleteTodoList: deleteTodoListState,
        customGroups, setCustomGroups,
        groups, setGroups,
        buildTodoListGroups,
        selectedTask, setSelectedTask,
        allowedGroupByFields, setAllowedGroupByFields,
        groupByField, setGroupByField,
        columns, setColumns,
        columnOrder, setColumnOrder, columnsToColumnOrder,
        groupByFieldMode, setGroupByFieldMode,
        createGroup, addGroup, updateGroup, deleteGroup, reorderGroups,
        notesOpen, setNotesOpen, notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        filters, setFilters,
        getTaskById,


        // Functions
        addTask: addTaskState,
        updateTask: updateTaskState,
        deleteTask: deleteTaskState,
        fetchTasks: fetchTasksState,

        // State indicator variables
        loading: loadingTasks, setLoading: setLoadingTasks,
        error: errorTasks, setError: setErrorTasks,
    } = useTasksStore();

    const {
        error,
        setError,
        loading,
        setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError( useSuccessToast );

    // const [ filters, setFilters ] = useState( {} );
    const [ taskList, setTaskList ] = useState( [] );
    const [ taskColumns, setTaskColumns ] = useState( [] );
    const [ dialogOpen, setDialogOpen ] = useState( false );
    const [ dialogData, setDialogData ] = useState( null ); // To hold the updated fields
    const [ dialogInitialData, setDialogInitialData ] = useState( null ); // null | { an existing item's data }
    const [ dialogDataType, setDialogDataType ] = useState( "none" ); // "" | "ADD" | "EDIT"
    const [ dialogType, setDialogType ] = useState( "none" ); // "" | "ADD" | "EDIT"
    const [ dialogSchema, setDialogSchema ] = useState( null );

    const [ dataModel, setFormDataModel ] = useState( [] );
    const [ confirmed, setConfirmed ] = useState( false ); // A basic TRUE / FALSe flag for handling asking to confirm when deleting an entry.

    const [ taskSchema, setTaskSchema ] = useState( null );
    const [ taskListGroupSchema, setTaskListGroupSchema ] = useState( null );
    const [ taskListSchema, setTaskListSchema ] = useState( null );
    const [ goalSchema, setGoalSchema ] = useState( null );

    // const [ notesOpen, setNotesOpen ] = useState( false );
    // const [ notesContent, setNotesContent ] = useState( false );
    // const [ isDrawerOpen, setIsDrawerOpen ] = useState( false );
    // const [ visibleColumns, setVisibleColumns ] = useState( [] );
    const [ sort, setSort ] = useState( 1 );

    const columnConfig = [
        // { field: "index", inputType: "number", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },
        // { field: "actions", inputType: "empty", hidden: false, classNames: ``, width: `48`, data: null, showtitle: true, },
        // { field: "completed", inputType: "checkbox", hidden: true, classNames: ``, width: `48`, data: null, showtitle: false, },
        { field: "title", inputType: "text", hidden: false, classNames: ``, width: `60`, data: null, showtitle: true, },
        { field: "inTrash", inputType: "switch", hidden: true, classNames: ``, width: `48`, data: null, showtitle: true, },
        { field: "isPinned", inputType: "switch", hidden: true, classNames: ``, width: `48`, data: null, showtitle: true, },

        { field: "timestampDue", inputType: "date", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },

        { field: "completeness", inputType: "slider", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },
        { field: "difficulty", inputType: "select", hidden: false, classNames: ``, width: `100`, data: null, showtitle: true, },
        { field: "priority", inputType: "select", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },
        { field: "status", inputType: "select", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },
        { field: "categories", inputType: "badgearray", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },

        { field: "userId", inputType: "selectId", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },
        // { field: "workspaceId", inputType: "selectId", hidden: false, classNames: ``, width: `80`, data: null,},
        { field: "description", inputType: "textarea", hidden: true, classNames: `!w-full !min-w-full !max-w-full col-span-full `, width: `400`, data: null, showtitle: true, },
        { field: "todoListId", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "Task/TodoList", showtitle: true, },
        { field: "subtaskIds", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "Task", showtitle: true, },
        { field: "parentTaskId", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "Task", showtitle: true, },
        { field: "todoListGroupId", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "Task/Group", showtitle: true, },
        // { field: "fileIds", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "File", showtitle: true, },
        // { field: "parentFolderId", inputType: "selectId", hidden: true, classNames: ``, width: `80`, data: "Folder", showtitle: true, },

        { field: "prerequisites", inputType: "text", hidden: true, classNames: ``, width: `80`, data: null, showtitle: true, },
        { field: "data", inputType: "textarea", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },
        // { field: "notes", inputType: "sheet", hidden: false, classNames: ``, width: `400`, data: null, showtitle: true, },
        { field: "settings", inputType: "text", hidden: false, classNames: ``, width: `80`, data: null, showtitle: true, },

        { field: "timestampStarted", inputType: "date", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },
        { field: "timestampEstimated", inputType: "date", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },
        { field: "timestampCompleted", inputType: "date", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },

        { field: "isRecurring", inputType: "switch", hidden: false, classNames: ``, width: `24`, data: null, showtitle: true, },
        { field: "recurrenceRules", inputType: "text", hidden: false, classNames: ``, width: `120`, data: null, showtitle: true, },
        { field: "reminder", inputType: "switch", hidden: false, classNames: ``, width: `24`, data: null, showtitle: true, },
    ];

    const getColumnWidth = ( column ) => {
        let columnName = column?.field ?? String( column );
        let columnWidth = column?.width;
        if ( columnWidth ) return Number( columnWidth );
        else if ( columnConfig.find( ( col ) => ( col?.field === columnName ) ) ) {
            // Find the width in the overall columnconfig. 
            let col = columnConfig.find( ( col ) => ( col?.field === columnName ) );
            if ( col && col?.hasOwnProperty( 'field' ) && col?.hasOwnProperty( 'width' ) ) {
                return Number( col?.width );
            }
            else {
                return 100;
            }
        }
        else {
            switch ( columnName ) {
                case "title":
                    return 300;
                case "description":
                    return 250;
                case "isPinned":
                case "completed":
                    return 80;
                case "status":
                case "priority":
                case "difficulty":
                    return 100;
                case "timestampDue":
                case "timestampStarted":
                case "timestampEstimated":
                case "timestampCompleted":
                case "createdDate":
                case "updatedDate":
                    return 120;
                default:
                    return 100;
            }
        };
    };

    const handleSyncData = async () => {
        // Forced re-sync of all data.
        const tasks = await handleFetchTasks();
        const taskLists = await handleFetchTodoLists();
        const taskListGroups = await handleFetchTodoListGroups();
    };

    // Fetch data schema on component mount
    const handleGetSchemas = async () => {
        console.log( "useTask :: handleGetSchemas :: fetched schemas: ", schemas );
        if ( schemas && utils.val.isObject( schemas ) ) {
            setTaskSchema( getSchemaForDataType( 'task' ) );
            setTaskListSchema( getSchemaForDataType( 'todoList' ) );
            setTaskListGroupSchema( getSchemaForDataType( 'todoListGroup' ) );
            setGoalSchema( getSchemaForDataType( 'goal' ) );
        }
    };

    const getSchemaForDataType = ( type ) => {
        console.log( "useTask :: getSchemaForDataType :: type = ", type, " :: ", "schemas = ", schemas );
        switch ( type ) {
            case 'task':
                return ( schemas?.app?.task?.task );
            case 'todoList':
                return ( schemas?.app?.task?.todoList );
            case 'todoListGroup':
                return ( schemas?.app?.task?.todoListGroup );
            case 'goal':
                return ( schemas?.app?.task?.goal );
            default:
                return schemas?.app?.task;
        }
    };

    const handleFetchTasks = useCallback( async () => {
        setLoadingTasks( true );
        const result = await fetchTasks( {
            workspaceId,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );
        console.log( "useTask.js :: Fetching tasks :: result = ", result, " :: ", "workspaceId = '", workspaceId, "'" );
        // setTasksData( result );
        // setTaskList( result );
        // return result;

        setLoadingTasks( false );
        if ( utils.val.isDefined( result ) ) {
            setTasksData( result );
            return result;
        }
        else {
            return null;
        }
    }, [ workspaceId, activeListId, fetchTasks, setTasksData ] );

    const handleFetchTodoLists = useCallback( async () => {
        setLoadingTasks( true );
        const result = await fetchTodoLists( {
            workspaceId,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );
        console.log( "useTask.js :: Fetching todo lists :: result = ", result, " :: ", "workspaceId = '", workspaceId, "'" );
        // setTodoLists( result );
        // setLoadingTasks( false );
        // return result;
        if ( utils.val.isDefined( result ) ) {
            if ( !activeListId && utils.val.isValidArray( result ) ) {
                setActiveListId( result?.[ 0 ]?._id );
            }
            setTodoLists( result );
            return result;
        }
        else {
            return null;
        }
    }, [ activeListId, fetchTodoLists, setTodoLists ] );

    const handleFetchTodoListGroups = useCallback( async () => {
        setLoadingTasks( true );
        let listId = activeListId;
        if ( !utils.val.isDefined( listId ) ) listId = null;
        console.log( "useTask.js :: handleFetchTodoListGroups :: Fetching todo list groups :: before :: workspaceId = '", workspaceId, "'", " :: ", "activeListId = ", activeListId, " :: ", "listId = ", listId );

        const result = await fetchTodoListGroups( {
            workspaceId: workspaceId,
            todoListId: activeListId,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );
        console.log( "useTask.js :: handleFetchTodoListGroups :: Fetching todo list groups :: result = ", result, " :: ", "workspaceId = '", workspaceId, "'", " :: ", "activeListId = ", activeListId, " :: ", "listId = ", listId );
        setLoadingTasks( false );
        if ( utils.val.isDefined( result ) ) {
            // setGroups( result );
            setCustomGroups( result );
            return result;
        }
        else {
            return null;
        }
    }, [ activeListId, fetchTodoListGroups, setCustomGroups ] );

    const handleClone = async ( data ) => {
        console.log( "Task :: handleClone called :: Cloning task: ", data );
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            // onFinish( data );
            let newTask = await createTask( {
                workspaceId,
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            console.log( "Task :: handleClone result = ", newTask );
            if ( newTask ) {
                // Result not null, successful.
                // Insert into list.
                setTasksData( { ...tasksData, newTask } );
                // handleCancel();
            }
        }
    };

    // API ENDPOINTS // 
    const handleToggleComplete = async ( taskData ) => {
        if ( utils.val.isObject( taskData ) ) {
            if ( utils.ao.hasAll( taskData, [ '_id', 'workspaceId', 'completed' ] ) ) {
                // Has the required properties.
                let _id = taskData._id;
                let workspaceId = taskData?.workspaceId;
                let completed = taskData?.completed;
                // toggleTaskCompletion( _id, !completed );
                let data = {
                    ...taskData,
                    completed: !completed,
                };

                // Send date off to the updateTask function.
                let result = await updateTask( {
                    data,
                    errorCallback: handleErrorCallback,
                    successCallback: handleSuccessCallback,
                } );
                return result;
            }
        }
    };

    const handleDeleteTask = async ( data ) => {
        console.log( "Task :: handleDeleteTask :: Deleting task: ", data );
        if ( window.confirm( 'Are you sure?' ) ) {
            try {
                if ( utils.ao.has( data, '_id' ) ) {
                    let id = data?._id;
                    let result = await deleteTask( {
                        taskId: id,
                        errorCallback: handleErrorCallback,
                        successCallback: handleSuccessCallback,
                    } );
                    return result;
                }
            } catch ( error ) {
                handleErrorCallback( 'Error deleting Task:', error );
            }
        }
    };

    const handleDeleteStart = async ( id, data, setData ) => {
        // Deletes object with _id "id" in data and sets the new Data on successful confirm and send.
        console.log( 'useTask.js :: handleDeleteStart :: Asking user if want to delete document: ', data );
        if ( window.confirm( 'Are you sure you want to delete this file?' ) ) { return handleDeleteSubmit( id, data, setData ); }
        else { handleCancel(); }
    };

    const handleDeleteSubmit = async ( id, data, setData, dataType = 'task' ) => {
        console.log( 'useTask.js :: handleDeleteSubmit :: Deleting document: ', data, ' of type: ', dataType );
        try {
            if ( utils.ao.hasAll( data, [ '_id', 'parentId' ] ) ) {
                // let id = data?._id;
                let result = await deleteTask( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                } );
                if ( result === null ) {
                    // let deleteItem = data?.find( ( item ) => item._id === id );
                    setData( data?.filter( ( item ) => item?._id && item?._id !== id ) );
                    // setData( ( prev ) => prev.filter( ( item ) => item?._id !== id ) );
                }
            }
        } catch ( error ) {
            handleErrorCallback( 'Error deleting document:', data, " :: error = ", error );
        } finally {
            // Cleanup afterward.
            handleCancel();
        }
    };

    const handleCreateTask = async ( data ) => {
        // Submit create-task data.
        console.log( 'Tasks :: handleCreateTask :: data = ', data );
        if ( data && utils.val.isObject( data ) ) {
            // Validate the inputs first, then send it off.
            let validatedData = validateSubmittedData( data, getSchema( 'task' ), false, true );
            console.log( 'Tasks :: handleCreateTask :: data = ', data, " :: ", 'validatedData = ', validatedData );
            let result = await createTask( {
                workspaceId: workspaceId,
                data: validatedData, //?.filter( ( d ) => d ),
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            console.log( 'Tasks :: handleCreateTask :: after :: result = ', result );

            return result;
        }
    };

    const initializeNewTask = ( initialData ) => {
        // TODO :: Replace this with a schema and input.js initializeFromSchema call to generate initial data. 
        // if ( tilsu )

        if ( utils.val.isDefined( taskSchema ) && utils.val.isObject( taskSchema ) ) {
            let initialValues = handleSchema2InitialData( { schema: getSchema( 'task' ), refData: getData() } );

            initialValues = {
                ...initialValues,
                userId: user?.id,
                workspaceId: workspaceId ?? activeWorkspace?._id,
            };
            console.log( "useTask :: initializeNewTask :: initial Data = ", initialValues, " :: ", "schema used = ", getSchema( 'task' ) );
            return initialValues;
        }
        else {
            // Prebuilt fallback
            return {
                index: -1,
                // todoList: "",
                // todoListGroupId: "",
                // prerequisites: [ [] ],
                userId: user?.id,
                workspaceId: workspaceId ?? activeWorkspace?._id,
                subtaskIds: null,
                title: "title",
                description: "description",
                categories: [ "tasks" ],
                data: "",
                notes: [ "" ],
                difficulty: "none",
                priority: "none",
                status: "incomplete",
                completeness: 0,
                timestampDue: new Date( Date.now() ).toISOString(),
                timestampStarted: new Date( Date.now() ).toISOString(),
                timestampEstimated: new Date( Date.now() ).toISOString(),
                timestampCompleted: new Date( Date.now() ).toISOString(),
                createdAt: new Date( Date.now() ).toISOString(),
                updatedAt: new Date( Date.now() ).toISOString(),
                settings: [ { "setting": "settingKey", "value": "settingValue" } ],
                isPinned: true,
                isRecurring: true,
                recurrenceRules: "",
                reminder: false,
                completed: false,
                inTrash: false,
                ...initialData
            };
        }
    };

    const handleCreateStart = ( initialData, dataType = 'task' ) => {
        console.log( "useTask :: handleCreateStart called :: ", "initialData = ", initialData );
        let data = initializeNewTask( initialData );
        if ( initialData ) { setDialogData( { ...data, ...initialData } ); }
        else { setDialogData( data ); }

        setDialogSchema( getSchema( dataType ) );
        setDialogDataType( dataType );
        setDialogOpen( true );
        setDialogType( "add" );

        console.log( 'useTask.js :: handleCreateStart :: initialData = ', initialData, " :: ", "data = ", data, getSchema( dataType ), schemas );
    };

    const handleCreateSubmit2 = async ( data, dataType = 'task' ) => {
        // Submit create-task data.
        console.log( 'Tasks :: handleCreateSubmit :: data = ', data );
        if ( data && utils.val.isObject( data ) ) {
            // Valid input, hopefully.
            let userId = user ? user?.id : null;
            if ( userId === null ) {
                handleErrorCallback( 'useTask :: Error creating task: UserID is required. ' );
                return null;
            }
            if ( workspaceId === null ) {
                handleErrorCallback( 'useTask :: Error creating task: WorkspaceId is required. ' );
                return null;
            }

            let submitData = {
                ...data,
                userId: userId,
                workspaceId: workspaceId,
            };

            console.log( 'Tasks :: handleCreateSubmit :: submitData = ', submitData );

            let result = await handleCreateTask( submitData );

            console.log( 'Tasks :: handleCreateSubmit :: after :: result = ', result );

            if ( result !== null ) {
                // addTaskState( result );
                // setTasksData( ( prev ) => ( [ ...prev, result ] ) );
                setTasksData( [ ...( utils.val.isValidArray( tasksData, true ) ? tasksData : [] ), result ] );
                handleCancel();
                return result;
            }
            else {
                // Null result; error occurred. Don't cancel. Instead, reopen the modal. 
                setIsCreating( true );
                return null;
            }
        }
    };

    const handleCreateSubmit = async ( data, dataType = "event", isCloned = false ) => {
        // Send data to server, and push results (if valid) to the local events list.
        let res;
        let typeSchema = getSchema( dataType );
        let validatedData = validateSubmittedData( data, typeSchema, isCloned );

        console.log( "usePlanner :: handleCreateSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "isCloned = ", isCloned, " :: ", "typeSchema = ", typeSchema, " :: ", "validatedData = ", validatedData );


        switch ( dataType ) {
            case 'task':
                res = await handleCreateTask( validatedData );
                // if ( utils.val.isDefined( res ) ) { setTasksData( [ ...tasksData, res ] ); }
                break;
            case 'todoList':
                res = await handleCreateTodoList( validatedData );
                // if ( utils.val.isDefined( res ) ) { setTodoLists( [ ...todoLists, res ] ); }
                break;
            case 'todoListGroup':
                res = await handleCreateTaskGroup( validatedData );
                // if ( utils.val.isDefined( res ) ) { setGroups( [ ...groups, res ] ); }
                break;
            case 'goal':
                // res = await goal( validatedData );
                break;
            default:
                res = null;
                break;
        }

        if ( res ) {
            console.log( "usePlanner :: handleCreateSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return res;
        }
        else {
            console.log( "usePlanner :: handleCreateSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return null;
        }
        // handleCancel();
    };

    const handleUpdateTask = async ( data ) => {
        if ( data && utils.val.isObject( data ) ) {
            // Valid input, hopefully.
            console.log( "useTask :: handleUpdateTask :: before :: ", "data = ", data );
            let result = await updateTask( {
                workspaceId,
                data: data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            console.log( "useTask :: handleUpdateTask :: after :: ", "result = ", result );
            if ( utils.val.isDefined( result ) ) {
                setTasksData( tasksData?.map( ( task ) => ( task?._id === result?._id ? result : task ) ) );
                // handleCancel();
                return result;
            }
            else {
                return null;
            }
        };
    };

    const handleEditStart = ( data, dataType = 'task' ) => {
        if ( utils.val.isObject( data ) ) {
            setDialogData( data );
            setDialogDataType( dataType );
            setDialogInitialData( data );
            setDialogSchema( getSchema( dataType ) );
            setDialogOpen( prev => true );
            setDialogType( "edit" );
            setDialogDataType( dataType );

            console.log( 'useTask.js :: handleEditStart :: data = ', data );
        }
    };

    const handleEditSubmit = async ( data = {}, dataType = 'task' ) => {
        console.log( "useTask :: handleEditSubmit :: workspaceId = ", workspaceId, " :: ", "data = ", data );
        if ( data && utils.val.isObject( data ) ) {
            // Valid input, hopefully.
            let submitData = {
                ...data,
                userId: user?.id,
                workspaceId: data?.workspaceId,
            };
            handleUpdateTask( submitData );
            handleCancel();
        };
    };


    const handleCreateTaskGroup = async ( data ) => {
        // Submit create-task data.
        // let result = await handleCreateTaskGroup( newColumn );
        console.log( 'Tasks :: handleCreateTaskGroup :: data = ', data );
        if ( data && utils.val.isObject( data ) ) {
            // Validate the inputs first, then send it off.
            let newColumn = createGroup( data );
            let validatedData = validateSubmittedData( newColumn, getSchema( 'todolistGroup' ), false, true );
            console.log( 'useTask :: handleCreateTaskGroup :: validatedData = ', validatedData );
            let result = await createTodoListGroup( {
                data: newColumn, /* validatedData, */
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => {
                    if ( utils.val.isDefined( data ) ) addGroup( data );
                }
            } );
            console.log( 'Tasks :: handleCreateTaskGroup :: after :: result = ', result );

            return result;
        }
    };

    const handleUpdateTaskGroup = async ( data ) => {
        if ( data && utils.val.isObject( data ) ) {
            // Valid input, hopefully.
            console.log( "useTask :: handleUpdateTaskGroup :: before :: ", "data = ", data );
            let result = await updateTodoListGroup( {
                data: data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => {
                    const updatedCustomGroups = customGroups?.map( ( group ) => ( group?._id === data?._id ? data : group ) );
                    // updateGroup( result?._id ?? data?._id, result );
                    setCustomGroups( updatedCustomGroups );
                    setColumnOrder( columnsToColumnOrder( updatedCustomGroups ) );
                }
            } );
            console.log( "useTask :: handleUpdateTaskGroup :: after :: ", "result = ", result );
            if ( result ) {
                // setCustomGroups( customGroups?.map( ( group ) => ( group?._id === data?._id ? result : group ) ) );
                // handleCancel();
                updateGroup( result?._id ?? data?._id, result );
                return result;
            }
            else {
                return null;
            }
        };
    };

    const handleDeleteTaskGroup = async ( id, askConfirm = true ) => {
        console.log( "Task :: handleDeleteTaskGroup :: Deleting task: ", data );
        if ( askConfirm ) {
            if ( window.confirm( 'Are you sure you want to delete this task group?' ) ) {
                try {
                    let result = await deleteTodoListGroup( {
                        id: id,
                        errorCallback: handleErrorCallback,
                        successCallback: handleSuccessCallback,
                        stateSetter: ( result ) => { if ( result ) deleteGroup( id ); },
                    } );
                } catch ( error ) {
                    handleErrorCallback( 'handleDeleteTaskGroup :: Error deleting Task:', error );
                }
            }
        }
        else {
            let result = await deleteTodoListGroup( {
                id: id,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( result ) => { if ( result ) deleteGroup( id ); },
            } );
        }
    };

    const handleCreateTodoList = async ( data ) => {
        // Submit create-todo list data.
        let newData;
        let userId = user ? user?.id : null;
        if ( data && utils.val.isObject( data ) ) {
            newData = createTodoListState( {
                userId: userId,
                workspaceId: workspaceId,
                ...data,
            } );
        }
        else {
            newData = createTodoListState( {
                userId: userId,
                workspaceId: workspaceId,
            } );
        }
        // Validate the inputs first, then send it off.
        // newData = createTodoList( data );
        console.log( 'Tasks :: handleCreateTodoList :: data = ', data, " :: ", "newData = ", newData );
        let validatedData = validateSubmittedData( newData, getSchema( 'todolist' ), false, true );
        console.log( 'useTask :: handleCreateTodoList :: validatedData = ', validatedData, " :: ", "schema = ", taskListSchema, getSchema( 'todolist' ) );
        let result = await createTodoList( {
            data: newData,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
            stateSetter: ( data ) => {
                if ( utils.val.isDefined( data ) ) addTodoListState( data );
            }
        } );
        console.log( 'Tasks :: handleCreateTodoList :: after :: result = ', result );

        return result;
    };

    const handleUpdateTodoList = async ( data ) => {
        if ( data && utils.val.isObject( data ) ) {
            // Valid input, hopefully.
            console.log( "useTask :: handleUpdateTodoList :: before :: ", "data = ", data );
            let result = await updateTodoList( {
                data: data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => {
                    const updated = todoLists?.map( ( item ) => ( item?._id === data?._id ? data : group ) );
                    setColumnOrder( columnsToColumnOrder( updatedCustomGroups ) );
                }
            } );
            console.log( "useTask :: handleUpdateTodoList :: after :: ", "result = ", result );
            if ( result ) {
                return result;
            }
            else {
                return null;
            }
        };
    };

    const handleDeleteTodoList = async ( id, askConfirm = true ) => {
        console.log( "Task :: handleDeleteTodoList :: Deleting todo list: ", data );
        if ( askConfirm ) {
            if ( window.confirm( 'Are you sure you want to delete this todo list?' ) ) {
                try {
                    let result = await deleteTodoList( {
                        id: id,
                        errorCallback: handleErrorCallback,
                        successCallback: handleSuccessCallback,
                        stateSetter: ( result ) => { if ( result ) deleteTodoListState( id ); },
                    } );
                } catch ( error ) {
                    handleErrorCallback( 'handleDeleteTodoList :: Error deleting todo list:', error );
                }

                return result;
            }
        }
        else {
            try {
                let result = await deleteTodoList( {
                    id: id,
                    errorCallback: handleErrorCallback,
                    successCallback: handleSuccessCallback,
                    stateSetter: ( result ) => { if ( result ) deleteTodoListState( id ); },
                } );
            } catch ( error ) {
                handleErrorCallback( 'handleDeleteTodoList :: Error deleting todo list:', error );
            }

            return result;
        }
    };


    const handleCancel = () => {
        console.log( "UseTask :: handleCancel called" );
        setDialogOpen( false );
        setDialogData( null );
        setDialogDataType( null );
        setDialogSchema( null );
        setDialogInitialData( null );
        setDialogType( 'none' );
        setConfirmed( false );
    };

    const handleChange = ( field, value, data, setData ) => {
        console.log( "useTask :: handleChange :: args: [", field, value, data, setData, "]" );
        if ( data && setData ) setData( { ...data, [ field ]: value } );
        else setDialogData( { ...dialogData, [ field ]: value } );
    };

    const handleSubmitRouting = ( data, handleSubmitCallback, dataType = 'task', promptType = 'add' ) => {
        // if ( onSubmit ) { onSubmit( dialogData ); }
        // onClose();

        console.log( "UseTask :: handleSubmitRouting called :: ", data, dataType, promptType );
        if ( handleSubmitCallback ) handleSubmitCallback( data );
        else {
            if ( promptType === 'add' ) handleCreateSubmit( data );
            else if ( promptType === 'edit' ) handleEditSubmit( data );
            else if ( promptType === 'delete' ) handleDeleteTask( data );
            else if ( promptType === 'view' ) handleCancel();
        }
    };

    /* const handleInitializeTaskGroups = () => {
        const groupedTasks = tasksData.map( ( task, index ) => {
            let group = customGroups?.[ Math.floor( Math.random() * customGroups?.length ) ];
            return {
                ...task,
                index: index,
                order: index,
                todoListIndex: index,
                todoListId: group?.todoListId,
                todoListGroupIndex: index,
                todoListGroupId: group?._id,
            };
        } );
        console.log( "useTask :: handleInitializeTaskGroups :: groupedTasks = ", groupedTasks );
        handleBulkUpdateTasks( groupedTasks );
    }; */

    const handleBulkUpdateTasks = async ( bulkData, doSave = true ) => {
        if ( bulkData && utils.val.isValidArray( bulkData, true ) ) {
            console.log( "useTask :: handleBulkUpdateTasks :: bulkData = ", bulkData );
            let result = await updateTasks( {
                workspaceId,
                data: bulkData,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );

            // if ( result ) { setTasksData( ( prev ) => result ); }
            if ( result && doSave === true ) {
                setTasksData(
                    tasksData?.map( ( t, i ) => {
                        // let find = utils.ao.findOne( tasksData, "_id", t?._id, "_id", false, true );
                        let resultFind = utils.ao.objectFindByKey( result, "_id", t?._id );
                        if ( resultFind ) { return resultFind; }
                        else { return t; }
                    } )
                );
            }
        };
    };

    const handleReorderTaskList = ( fromIndex, toIndex, commit = false ) => {
        let updatedTasks = [ ...tasksData ];
        let [ movedTask ] = updatedTasks.splice( fromIndex, 1 );

        // TODO :: Run through the updatedTasks list and update the index of all items. 
        movedTask.index = toIndex;
        updatedTasks.splice( toIndex, 0, movedTask );
        setTasksData( updatedTasks );
        // Optionally, call an API to persist the updated order
        if ( commit ) {
            if ( utils.val.isValidArray( tasksData, true ) ) {
                // Re-number all tasks in their current (updated) order.
                let reorderedTasks = tasksData.map( ( t, index ) => {
                    let task = { ...t, index: index };
                    // Call the API. 
                    // TODO :: A more efficient way would be to send a bulk update consisting 
                    // entirely of task IDs and their new indexes. 
                    handleUpdateTask( task );
                    return task;
                } );

                handleBulkUpdateTasks( reorderedTasks );
            }
        };
    };

    const handleBulkReorderTasks = async ( tasks, commit = false, reorder = true ) => {
        // let [ movedTask ] = updatedTasks.splice( fromIndex, 1 );

        // // TODO :: Run through the updatedTasks list and update the index of all items. 
        // movedTask.index = toIndex;
        // updatedTasks.splice( toIndex, 0, movedTask );
        // setTasksData( updatedTasks );
        // Optionally, call an API to persist the updated order
        console.log( "useTask", " :: ", "handleBulkReorderTasks called", " :: ", "tasks = ", tasks );
        // if ( commit ) {
        if ( utils.val.isValidArray( tasks, true ) ) {
            // Re-number all tasks in their current (updated) order.
            let updatedTasks = [ ...tasks ];
            const reorderedTasks = // await Promise.all(
                updatedTasks.map( ( t, index ) => {
                    // let task = { id: t?._id, index: index };
                    // If reorder is false, it's already been reordered and just needs to be passed along to the server. 
                    let task = { id: t?._id || t?.id, index: reorder === true ? index : t?.index || t?.order };
                    console.log( "useTask :: handleBulkReorderTasks :: tasks = ", tasks, " :: ", "t = ", t, " :: ", "index = ", index, " :: ", "reordered task = ", task );
                    return task;
                } );
            // );
            let result = await reorderTasks( {
                data: reorderedTasks,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                ...( commit === true ? { stateSetter: setTasksData } : {} )
            } );
            console.log( "useTask", " :: ", "handleBulkReorderTasks", " :: ", "updatedTasks = ", updatedTasks, " :: ", "reorderedTasks = ", reorderedTasks, " :: ", "result = ", result );

            if ( utils.val.isDefined( result ) && utils.val.isValidArray( result, true ) ) {
                if ( commit === true ) { setTasksData( result ); }
                return result;
            }
            else {
                console.error( `useTask :: handleBulkReorderTasks :: tasks = `, tasks, " :: ", "Error receiving reordered tasks. :: result = ", result );
                return null;
            }
        }
        // };
    };

    const handleBulkReorderTaskIds = async ( tasks, commit = false, reorder = true ) => {
        if ( utils.val.isValidArray( tasks, true ) ) {
            let updatedTasks = [ ...tasks ];
            let result = await reorderTasks( {
                data: updatedTasks,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                ...( commit === true ? {
                    stateSetter: ( data ) => {
                        console.log( "useTask", " :: ", "handleBulkReorderTaskIds", " :: ", "STATESETTER", "tasks = ", tasks, " :: ", "result data = ", data );
                        if ( utils.val.isDefined( data ) ) setTasksData( data );
                    }
                } : null )
            } );
            console.log( "useTask", " :: ", "handleBulkReorderTaskIds", " :: ", "tasks = ", tasks, " :: ", "updatedTasks = ", updatedTasks, " :: ", "result = ", result );

            if ( result && utils.val.isValidArray( result, true ) ) {
                // if ( commit === true ) { setTasksData( result ); }
                return result;
            }
            else {
                console.error( `useTask :: handleBulkReorderTaskIds :: tasks = `, tasks, " :: ", "Error receiving reordered tasks. :: result = ", result );
                return null;
            }
        }
    };

    const handleReorderTasks = async ( tasks, commit = false ) => {
        // let [ movedTask ] = updatedTasks.splice( fromIndex, 1 );

        // // TODO :: Run through the updatedTasks list and update the index of all items. 
        // movedTask.index = toIndex;
        // updatedTasks.splice( toIndex, 0, movedTask );
        // setTasksData( updatedTasks );
        // Optionally, call an API to persist the updated order
        // if ( commit ) {
        if ( utils.val.isValidArray( tasks, true ) ) {
            // Re-number all tasks in their current (updated) order.
            let updatedTasks = [ ...tasks ];
            const reorderedTasks = await Promise.all(
                updatedTasks.map( ( t, index ) => {
                    // updateTodo( t._id, { index: index } );
                    let task = { ...t, index: index };
                    if ( !commit ) {
                        // Use the single-fire update instead. 
                        handleUpdateTask( task );
                    }
                    console.log( "useTask :: handleReorderTasks :: tasks = ", tasks, " :: ", "t = ", t, " :: ", "reordered task = ", task );
                    return task;
                } )
            );
            // let reorderedTasks = tasksData.map( ( t, index ) => {
            //     // if ( toIndex === index ) {
            //     // At or above (below, visually) the toIndex number. Push all the rest down.
            //     let task = { ...t, index: index };
            //     // Call the API. 
            //     // TODO :: A more efficient way would be to send a bulk update consisting 
            //     // entirely of task IDs and their new indexes. 
            //     handleUpdateTask( task );
            //     return task;
            //     // }
            //     // else {
            //     // return t;
            //     // }
            // } );

            if ( commit ) handleBulkUpdateTasks( reorderedTasks );
        }
        // };
    };

    const taskFormEssentialSchema = {};

    const buildDialog = ( {
        initialData,
        data,
        setData, // For onchange
        refData,
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleUpdate,
        handleClose,
        dialogType = 'add',
        dataType = 'task', // Name of type of data being represented.
        dialogTrigger,
        debug = false,
    } ) => {
        // let refData = getData();
        console.log( "useTask :: buildDialog :: params = ", {
            initialData,
            data,
            setData,
            refData,
            dataSchema,
            dialogOpen,
            setDialogOpen,
            handleSubmit,
            handleChange,
            handleClose,
            dialogType,
            dataType,
            dialogTrigger,
            debug,
        } );


        return (
            <FormDialogWrapper
                debug={ debug }
                useOverlay={ true }
                initialData={ initialData }
                data={ data }
                // setData={ setData }
                refData={ refData }
                dataSchema={ dataSchema }
                dialogOpen={ dialogOpen }
                setDialogOpen={ setDialogOpen }
                handleSubmit={ handleSubmit }
                handleChange={ handleChange }
                handleUpdate={ handleUpdate }
                handleClose={ handleClose }
                dialogType={ dialogType }
                dataType={ dataType }
                dialogTrigger={ dialogTrigger }
                classNames={ '' }
                dialogClassNames={ '' }
                contentClassNames={ '' }
            />
        );
    };

    const handleOpenTaskNotes = ( t ) => {
        // Opens the notes and a summary in an aside / sheet view.
        if ( debug === true )
            console.log( "useTask :: handleOpenTaskNotes :: task = ", t, " :: ", "notesOpen = ", notesOpen );
        setNotesOpen( true );
        setNotesContent( { ...t } );
    };

    const handleGetPinnedTasks =
        useCallback(
            ( ts ) => {
                return ( utils.val.isValidArray( ts, true )
                    ? ( ts?.filter( ( t, i ) => ( t?.isPinned === true ) ) )
                    : ( [] )
                );
            }, [] );

    const handleGetTodayTasks =
        useCallback(
            ( ts ) => {
                return handleSort( utils.val.isValidArray( ts, true )
                    ? ( ts?.filter( ( v, i ) => {
                        if ( v && v?.hasOwnProperty( 'timestampDue' ) ) {
                            const diff = differenceInHours(
                                new Date( Date.now() ),
                                new Date( v?.timestampDue ),
                            );
                            // console.log( "handleGetTodayTasks :: t = ", v, " :: ", "difference = ", diff );
                            return ( diff <= 24 );
                        }
                        else { return false; }
                    } ) )
                    : ( [] ), sort );
            }, [ tasksData ] );

    const handleGetTasksDueBy =
        useCallback(
            ( ts, dueDate ) => {
                if ( debug === true ) console.log( "useTask :: handleGetTasksDueBy :: ts = ", ts, " :: ", "dueDate = ", dueDate );
                return utils.val.isValidArray( ts, true )
                    ? ( ts?.filter( ( v, i ) => (
                        ( v && v?.hasOwnProperty( 'timestampDue' ) )
                            ? ( new Date( v?.timestampDue ).getTime() < (
                                isValidDate( dueDate )
                                    ? new Date( dueDate ).getTime()
                                    : addDays( new Date( Date.now() ), 28 )
                            ) )
                            : ( false )
                    ) ) )
                    : ( [] );
            }, [ tasksData ] );

    const handleGetOverdueTasks =
        useCallback(
            ( ts ) => {
                if ( debug === true ) console.log( "useTask :: handleGetOverdueTasks :: ts = ", ts );
                return handleSort( utils.val.isValidArray( ts, true )
                    ? ( ts?.filter( ( v, i ) => (
                        ( v && v?.hasOwnProperty( 'timestampDue' ) )
                            ? ( new Date( isValidDate( v?.timestampDue ) ).getTime() < new Date( Date.now() ).getTime() )
                            : ( false )
                    ) ) )
                    : ( [] ), sort );
            }, [ tasksData ] );

    const handleSort =
        useCallback(
            ( items, dir = 1 ) => {
                return ( utils.val.isValidArray( items, true )
                    ? ( items?.sort( ( a, b ) => (
                        ( dir === 1 // Ascending
                            ? ( a?.index - b?.index )
                            : ( dir === -1 // Descending
                                ? ( b?.index - a?.index )
                                : ( dir === 0 ?? true )
                            )
                        )
                    ) ) )
                    : ( items ) );
            }
            , [ tasksData ] );


    const updateOrderFieldById = ( {
        sourceId,
        destinationIndex,
        dataArray
    } ) => {
        const newArray = dataArray.map( ( item ) => ( { ...item } ) );
        const sourceIndex = newArray.findIndex( ( item ) => item.id === sourceId );

        if ( sourceIndex === -1 ) {
            return newArray;
        }

        const sourceElement = newArray[ sourceIndex ];
        newArray.splice( sourceIndex, 1 );
        newArray.splice( destinationIndex, 0, sourceElement );
        newArray.forEach( ( item, index ) => {
            item.order = index + 1;
        } );

        return newArray;
    };


    const reorderItem = ( items, item ) => {
        const [ removed ] = items.splice( item?.initial.index, 1 );
        items.splice( item?.destination.index, 0, removed );
    };

    const reorder = ( list, initialIndex, destinationIndex, doRenumber = false ) => {
        const result = [ ...list ];
        const [ removed ] = result.splice( initialIndex, 1 );
        result.splice( destinationIndex, 0, removed );

        if ( doRenumber ) {
            let updatedTasks = result?.map( ( item, index ) => {
                if ( initialIndex >= destinationIndex ) {
                    // Item was moved up the list (to lower number).
                    // All items between the indexes should be incremented by 1.
                    if ( ( item?.index < initialIndex ) && ( item?.index >= destinationIndex ) ) {
                        return { ...item, index: item?.index + 1 };
                    }
                }
                else if ( initialIndex <= destinationIndex ) {
                    // Item was moved down the list (to higher number)
                    // All items between the indexes should be decremented by 1.
                    if ( ( item?.index > initialIndex ) && ( item?.index < destinationIndex ) ) {
                        return { ...item, index: item?.index - 1 };
                    }
                }
                return { ...item, index: index };
            } );
            return updatedTasks;
        }
        else {
            return result;
        }
    };

    const handleBeforeCapture = useCallback( ( before ) => {
        /*  export interface BeforeCapture {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleBeforeCapture", " :: ", "before = ", before, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleBeforeDragStart = useCallback( ( start ) => {
        /*  export interface DragStart {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleBeforeDragStart", " :: ", "start = ", start, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragStart = useCallback( ( start ) => {
        /*  onDragStart will get notified when a drag starts. This responder is optional and therefore does not need to be provided. It is highly recommended that you use this function to block updates to all <Draggable /> and <Droppable /> components during a drag. (See Block updates during a drag below)
    
                // While the return type is `mixed`, the return value is not used.
                type OnDragStartResponder = (
                    start: DragStart,
                    provided: ResponderProvided,
                ) => unknown;
    
                // supporting types
                interface DraggableRubric {
                    draggableId: DraggableId;
                    type: TypeId;
                    source: DraggableLocation;
                }
    
                interface DragStart extends DraggableRubric {
                    mode: MovementMode;
                }
    
                interface DraggableLocation {
                    droppableId: DroppableId;
                    // the position of the draggable within a droppable
                    index: number;
                }
    
                type Id = string;
                type DraggableId = Id;
                type DroppableId = Id;
                type TypeId = Id;
    
                type MovementMode = 'FLUID' | 'SNAP';
                
                start.draggableId: the id of the <Draggable /> that is now dragging
                start.type: the type of the <Draggable /> that is now dragging
                start.source: the location (droppableId and index) of where the dragging item has started within a <Droppable />.
                start.mode: either 'SNAP' or 'FLUID'. This is a little bit of information about the type of movement that will be performed during this drag. 'SNAP' mode is where items jump around between positions (such as with keyboard dragging) and 'FLUID' mode is where the item moves underneath a pointer (such as mouse dragging).
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleDragStart", " :: ", "start = ", start, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragUpdate = useCallback( ( update ) => {
        /*  export interface DragUpdate {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleDragUpdate", " :: ", "update = ", update, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragSimpleTaskEnd = useCallback( ( result, taskList, setTaskList ) => {
        // the only one that is required
        const { destination, source } = result;

        // Return if no destination.
        if ( !destination ) return;

        // Return if it hasn't moved at all. 
        if ( source.index === destination.index
            && source.droppableId === destination.droppableId
        ) { return; }

        // const reorderedTasks = [ ...taskList ];
        // const [ movedTask ] = reorderedTasks.splice( result.source.index, 1 );
        // reorderedTasks.splice( result.destination.index, 0, movedTask );

        // Find the task that was moved via its originating index.
        let updatedTasks = [ ...( utils.val.isValidArray( taskList, true ) ? taskList : [] ) ];
        let movedTask = updatedTasks?.[ source.index ];

        // Update the task's associated group name if it was moved outside of its group.
        if ( source.droppableId !== destination.droppableId ) {
            if ( movedTask ) {
                movedTask = {
                    ...movedTask,
                    todoListGroupId: destination.droppableId
                };
            }
            updatedTasks = updatedTasks?.map( ( task, index ) => (
                task?.index === source.index
                    ? ( movedTask )
                    : ( task ) )
            );
            onUpdateTask( movedTask );
        }

        let reorderedTasks = reorder( updatedTasks, source.index, destination.index, true );
        setTaskList( ( prevTasks ) => reorder( prevTasks, source.index, destination.index, true ) );
        // setTaskList( reorderedTasks );
        // setTasks( reorderedTasks );
        // if ( debug === true )
        console.log(
            "useTask.js",
            " :: ", "handleDragEnd",
            " :: ", "result = ", result,
            " :: ", "source = ", source,
            " :: ", "destination = ", destination,
            " :: ", "movedTask = ", movedTask,
            " :: ", "tasksData = ", tasksData,
            " :: ", "tasks list = ", taskList,
            " :: ", "reorderedTasks list = ", reorderedTasks,
        );
        handleBulkReorderTasks( reorderedTasks, true );
    }, [] );

    const handleReorder = ( list, initialIndex, destinationIndex, doRenumber = false ) => {
        const result = [ ...list ];
        const [ removed ] = result.splice( initialIndex, 1 );
        result.splice( destinationIndex, 0, removed );

        if ( doRenumber ) {
            let updatedTasks = result?.map( ( item, index ) => {
                if ( initialIndex >= destinationIndex ) {
                    // Item was moved up the list (to lower number).
                    // All items between the indexes should be incremented by 1.
                    if ( ( item?.index < initialIndex ) && ( item?.index >= destinationIndex ) ) {
                        return { ...item, index: item?.index + 1 };
                    }
                }
                else if ( initialIndex <= destinationIndex ) {
                    // Item was moved down the list (to higher number)
                    // All items between the indexes should be decremented by 1.
                    if ( ( item?.index > initialIndex ) && ( item?.index < destinationIndex ) ) {
                        return { ...item, index: item?.index - 1 };
                    }
                }
                return { ...item, index: index };
                // return { ...item };
            } );
            return updatedTasks;
        }
        else {
            return result;
        }
    };

    const handleDragGroupedTaskEnd = useCallback( ( result ) => {
        const { source, destination, type, draggableId } = result;

        // If there's no destination or the item was dropped in the same spot, do nothing
        if ( !destination || ( source.droppableId === destination.droppableId && source.index === destination.index ) ) {
            return;
        }

        console.log( "Kanban-view :: handleDragEnd :: result = ", result );

        // Handle column reordering
        if ( type === "group" ) {
            const reorderedColumns = Array.from( groups );
            const [ removed ] = reorderedColumns.splice( source.index, 1 );
            reorderedColumns.splice( destination.index, 0, removed );

            // Update indexes for all columns
            const updatedColumns = reorderedColumns.map( ( col, idx ) => ( {
                ...col,
                index: idx,
                order: idx,
            } ) );

            // Update the store
            setGroups( updatedColumns );
            reorderColumns( updatedColumns );
            return;
        } else if ( type === "task" ) {
            // Array to track all task updates for server sync
            const taskUpdates = [];

            // Handle task reordering
            const sourceColumn = groups?.find( ( col ) => col._id === source.droppableId );
            const destinationColumn = groups?.find( ( col ) => col._id === destination.droppableId );

            if ( !sourceColumn || !destinationColumn ) return;

            // Find the task being moved
            const taskToMove = getTaskById( draggableId );
            if ( !taskToMove ) return;


            // If moving between columns
            if ( source.droppableId !== destination.droppableId ) {
                // Update the task's group ID
                // Create a copy of the task with updated properties
                const updatedTask = { ...taskToMove };
                updatedTask.todoListGroupId = destination.droppableId;

                // Update the task's todoListGroupIndex to match the destination index
                updatedTask.todoListGroupIndex = destination.index;

                // Remove from source column's taskIds
                const updatedSourceTaskIds = sourceColumn.taskIds.filter( ( id ) => id !== draggableId );

                // Add to destination column's taskIds at the right position
                const updatedDestTaskIds = [ ...destinationColumn.taskIds ];
                updatedDestTaskIds.splice( destination.index, 0, draggableId );

                // Update both columns
                const updatedGroups = groups.map( ( group ) => {
                    if ( group._id === source.droppableId ) {
                        return { ...group, taskIds: updatedSourceTaskIds };
                    }
                    if ( group._id === destination.droppableId ) {
                        return { ...group, taskIds: updatedDestTaskIds };
                    }
                    return group;
                } );

                // Update the global index for the moved task
                updatedTask.index = tasksData.length + destination.index;

                // Reindex all tasks in the destination column
                const destTasks = updatedDestTaskIds.map( ( id ) => getTaskById( id ) ).filter( Boolean );

                // Update todoListGroupIndex for all tasks in the destination column
                const updatedDestTasks = destTasks.map( ( task, idx ) => {
                    if ( task._id === draggableId ) return updatedTask;

                    const updatedDestTask = {
                        ...task,
                        todoListGroupIndex: idx,
                    };

                    // Add to updates array
                    taskUpdates.push( {
                        id: updatedDestTask._id,
                        index: updatedDestTask.index,
                        todoListGroupIndex: updatedDestTask.todoListGroupIndex,
                    } );

                    return updatedDestTask;
                } );

                // Update the source column tasks' todoListGroupIndex values
                const sourceTasks = updatedSourceTaskIds.map( ( id ) => getTaskById( id ) ).filter( Boolean );

                const updatedSourceTasks = sourceTasks.map( ( task, idx ) => {
                    const updatedSourceTask = {
                        ...task,
                        todoListGroupIndex: idx,
                    };

                    // Add to updates array
                    taskUpdates.push( {
                        id: updatedSourceTask._id,
                        index: updatedSourceTask.index,
                        todoListGroupIndex: updatedSourceTask.todoListGroupIndex,
                    } );

                    return updatedSourceTask;
                } );

                // Update all tasks in the store
                const updatedTasksData = tasksData.map( ( task ) => {
                    if ( task._id === draggableId ) return updatedTask;

                    // Check if this task is in the source column
                    const sourceTaskUpdate = updatedSourceTasks.find( ( t ) => t._id === task._id );
                    if ( sourceTaskUpdate ) return sourceTaskUpdate;

                    // Check if this task is in the destination column
                    const destTaskUpdate = updatedDestTasks.find( ( t ) => t._id === task._id );
                    if ( destTaskUpdate ) return destTaskUpdate;

                    return task;
                } );

                // Update the store
                setTasksData( updatedTasksData );
                setGroups( updatedGroups );

                // Add the moved task to updates array
                taskUpdates.push( {
                    id: updatedTask._id,
                    index: updatedTask.index,
                    todoListGroupIndex: updatedTask.todoListGroupIndex,
                } );

                // Send updates to server (without waiting for response)
                handleBulkReorderTaskIds( taskUpdates, false, false );
                // handleBulkUpdateTasks( taskUpdates, false );
            }
            // If reordering within the same column
            else {
                // Reorder the taskIds array
                // Create a copy of the task with updated properties
                const updatedTask = { ...taskToMove };
                const columnTaskIds = Array.from( sourceColumn.taskIds );
                columnTaskIds.splice( source.index, 1 );
                columnTaskIds.splice( destination.index, 0, draggableId );

                // Update the column
                const updatedGroups = groups.map( ( group ) =>
                    group._id === source.droppableId ? { ...group, taskIds: columnTaskIds } : group,
                );

                // Get all tasks in this column
                const columnTasks = columnTaskIds.map( ( id ) => getTaskById( id ) ).filter( Boolean );

                // Update todoListGroupIndex for all tasks in the column
                const updatedColumnTasks = columnTasks.map( ( task, idx ) => {
                    const updatedColumnTask = {
                        ...task,
                        todoListGroupIndex: idx,
                    };

                    // Add to updates array
                    taskUpdates.push( {
                        id: updatedColumnTask._id,
                        index: updatedColumnTask.index,
                        todoListGroupIndex: updatedColumnTask.todoListGroupIndex,
                    } );

                    return updatedColumnTask;
                } );

                // Update all tasks in the store
                const updatedTasksData = tasksData.map( ( task ) => {
                    const columnTaskUpdate = updatedColumnTasks.find( ( t ) => t._id === task._id );
                    return columnTaskUpdate || task;
                } );

                console.log( "useTask :: handleDragEnd :: at end of function :: updatedTasksData = ", updatedTasksData, " :: ", "updatedGroups = ", updatedGroups );

                // Update the store
                setTasksData( updatedTasksData );
                setGroups( updatedGroups );

                // Send updates to server (without waiting for response)
                handleBulkReorderTasks( taskUpdates, false, false );
                // handleBulkReorderTaskIds( taskUpdates, false, false );
                // handleBulkUpdateTasks( updatedTasksData, false );
            }
        }
    }, [] );

    const handleFetchTodoData = useCallback(
        async () => {
            // Load data if not already loaded.
            await handleFetchTodoLists();

            if ( activeListId ) {
                await handleFetchTodoListGroups();
            }
            else {
                setActiveListId( utils.val.isValidArray( todoLists, true ) ? todoLists?.[ 0 ]?._id : null );
            }

            await handleFetchTasks();
        }
        , [ workspaceId, user ]
    );

    const handleClearTodoData = () => {
        setGoalsData( [] );
        setTasksData( [] );
        setTodoLists( [] );
        setCustomGroups( [] );
        setActiveListId( null );
    };


    const handleInitializeTodoData = useCallback(
        async () => {
            // Load data if not already loaded.
            if ( tasksData === null || !utils.val.isValidArray( tasksData, true ) ) {
                // Tasks
                handleFetchTasks();
            }
            if ( customGroups === null || !utils.val.isValidArray( customGroups, true ) ) {
                handleFetchTodoListGroups();
            }
            if ( todoLists === null || !utils.val.isValidArray( todoLists, true ) ) {
                handleFetchTodoLists();
            }

            if ( activeListId ) {
                handleFetchTodoListGroups();
            }
            else {
                // active list id is not selected, pick one at random. 
                if ( utils.val.isValidArray( todoLists, true ) ) {
                    setActiveListId(
                        todoLists?.[ 0 ]?._id
                    );
                }
            }
        }
        , [ workspaceId, user ]
    );

    return {
        // VARIABLES
        columnConfig, getColumnWidth,
        updateOrderFieldById,
        tasksData, setTasksData,
        initializeNewTask,
        // initialTaskData, setInitialTaskData,
        dialogInitialData, setDialogInitialData,
        DatePickerOptions: DATE_PICKER_OPTIONS,
        handleInitializeTodoData,
        handleFetchTodoData,
        handleClearTodoData,

        // HANDLER FUNCTIONS
        handleSyncData,
        handleFetchTasks,
        handleFetchTodoLists,
        handleFetchTodoListGroups,
        // handleInitializeTaskGroups,
        handleSort,
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTasksDueBy,
        handleGetTodayTasks,
        handleOpenTaskNotes,
        handleClone,
        // handleDelete,
        handleDeleteTask,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCreateTask,
        handleCreateSubmit,
        handleCreateStart,
        handleUpdateTask,
        handleEditStart,
        handleEditSubmit,
        handleCreateTodoList,
        handleUpdateTodoList,
        handleDeleteTodoList,
        handleCreateTaskGroup,
        handleUpdateTaskGroup,
        handleDeleteTaskGroup,
        handleCancel,
        handleToggleComplete,
        buildDialog,
        handleChange,
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleBulkReorderTaskIds,
        handleReorderTaskList,
        handleSubmitRouting,

        // Drag and drop logic / functionality
        reorderItem,
        reorder,
        handleBeforeCapture,
        handleBeforeDragStart,
        handleDragStart,
        handleDragUpdate,
        handleDragSimpleTaskEnd,
        handleReorder,
        handleDragGroupedTaskEnd,

        // GETTERS / SETTERS
        taskColumns, setTaskColumns,
        taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogSchema, setDialogSchema,
        notesOpen, setNotesOpen,
        notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        sort, setSort,
        filters, setFilters,

        // SCHEMA
        taskSchema, setTaskSchema,
        taskListSchema, setTaskListSchema,
        taskListGroupSchema, setTaskListGroupSchema,
        goalSchema, setGoalSchema,
        taskFormEssentialSchema,
        handleGetSchemas,
        getSchemaForDataType,
        loading, setLoading,
        error, setError,
        loadingTasks, setLoadingTasks,
        errorTasks, setErrorTasks,
        // tasks,
        // fetchTasks,
        // fetchTasksByDateRange,
        // fetchTasksByDueDate,
        // fetchRecurringTasks,
        // fetchTasksByFilter,
        // createTask,
        // fetchTask,
        // updateTask,
        // deleteTask,
    };
};

export default useTask;

/*  const buildTaskDialog = ( {
        data,
        setData, // For onchange
        refData,
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'add',
        dataType = 'task', // Name of type of data being represented.
        dialogTrigger,
        debug = false,
    } ) => {

        let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Task` }`;
        let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Task` }`;
        let allData = getData();
        if ( !refData ) refData = getData();

        if ( !utils.val.isDefined( data ) ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            if ( dialogType === 'add' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'edit' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'view' ) { data = dialogData ?? dialogInitialData; }
        }

        if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            dataSchema = getSchema( dataType );
        }

        if ( utils.ao.has( data, "workspaceId" ) && data?.workspaceId === null ) {
            data.workspaceId = workspaceId;
        }

        // if ( utils.ao.has( dataSchema, "userId" ) && !utils.val.isDefined( data?.userId ) ) {
        //     data.userId = user?._id;
        // }

        if ( debug === true )
            console.log(
                'useTask',
                '\n :: ', 'buildDialog',
                '\n :: ', 'debug = ', debug,
                '\n :: ', 'dialogOpen = ', dialogOpen,
                '\n :: ', 'dialogType = ', dialogType,
                '\n :: ', 'dataType = ', dataType,
                '\n :: ', 'data = ', data,
                '\n :: ', 'dataSchema = ', dataSchema,
                '\n :: ', 'setData = ', setData,
                '\n :: ', 'setDialogOpen = ', setDialogOpen,
                '\n :: ', 'handleSubmit = ', handleSubmit,
                '\n :: ', 'handleChange = ', handleChange,
                '\n :: ', 'handleClose = ', handleClose,
                '\n :: ', 'dialogTrigger = ', dialogTrigger,
            );
        return (
            <Dialog
                open={ dialogOpen }
                isOpen={ dialogOpen || !!data }
                onClose={ handleClose }
                title={ title }
                // onOpenChange={ () => { setDialogOpen( true ); } }
                // onOpenChange={ setDialogOpen }
                // onClose={ () => { setDialogOpen( false ); } }
                onOpenChange={ () => { setDialogOpen( !dialogOpen ); } }
                className={ `flex flex-col rounded-xl justify-start items-stretch relative !min-w-[60vw] !max-w-[60vw] !w-[60vw] ` }
            >
                <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />

                { dialogTrigger && ( <DialogTrigger asChild>
                    <Button
                        className={ `select-none` }
                        variant='outline'>
                        { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }{ `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                    </Button>
                </DialogTrigger> ) }

                <DialogContent
                    className={ twMerge(
                        // `absolute z-[1000] `,
                        `w-full min-w-[50vw] max-w-[50vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 425 }px] max-h-modal`,
                        `flex flex-col max-h-modal w-full sm:max-w-[${ 100 }%] max-h-modal rounded-xl overflow-y-auto`,
                        `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200`,
                        // `w-full min-w-[50vw] max-w-[50vw] h-[80vh] min-h-[80vh] flex flex-col overflow-hidden p-4`,
                        // `overflow-auto`,
                        `w-full !min-w-[60vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 525 }px] max-h-modal flex flex-col`,
                        `transition-all ease-in-out duration-200`,
                        `overflow-hidden`,
                    ) }
                >
                    <DialogHeader>
                        <DialogTitle>
                            { `${ title }` }
                        </DialogTitle>
                        <DialogDescription>
                            { `${ description }` }
                        </DialogDescription>
                    </DialogHeader>
                    { ( <>
                        { data && dataSchema && utils.val.isObject( dataSchema )
                            ? ( <div className={ `gap-2 py-2 px-2 flex justify-stretch items-start h-full w-full overflow-auto ` }>
                                <FormGenerator
                                    debug={ debug }
                                    data={ data }
                                    setData={ setData }
                                    refData={ allData }
                                    initialData={ data }
                                    schema={ dataSchema }
                                    customFields={ {
                                        "content": {
                                            dataType: "string",
                                            fieldType: "markdown"
                                        },
                                    } }
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        if ( data && Object.keys( data ).includes( name ) ) {
                                            if ( handleChange ) handleChange( name, value, data, setData );
                                            setData( { ...data, [ name ]: value } );
                                        }
                                    } }
                                    // onCancel={ () => handleCancel() }
                                    onSubmit={ ( data ) => handleSubmit( data ) }
                                    inputMaxWidth={ 32 }
                                    inputMaxHeight={ 32 }
                                    showFormModel={ true }
                                    showFormData={ true }
                                    showFormSchema={ true }
                                />
                            </div> )
                            : ( <div className="grid gap-2 py-2 px-2 w-full">
                                <div className="flex flex-col p-2 justify-center items-center mx-1 gap-2 w-full">
                                    <h2 className="text-xl font-bold mb-4"> { title }</h2>

                                    <Input
                                        type={ `text` }
                                        placeholder={ "Title" }
                                        defaultValue={ data?.title }
                                        onChange={ ( e ) => handleChange( "title", e.target.value ) }
                                        className={ `mb-2 w-full p-2` }
                                    />

                                    <Textarea
                                        placeholder="Description"
                                        defaultValue={ data?.description }
                                        onChange={ ( e ) => handleChange( "description", e.target.value ) }
                                        className={ `mb-2 p-2 w-full` }
                                    />

                                    { buildSelect( {
                                        placeholder: 'Priority',
                                        opts: TODO_PRIORITY_OPTIONS.map( ( val, i ) => ( { name: convertCamelCaseToSentenceCase( val ), value: val } ) ),
                                        value: data?.priority,
                                        initialData: data?.priority,
                                        key: 'priority',
                                        handleChange: handleChange,
                                        className: '',
                                        multiple: false,
                                    } ) }

                                    { buildSelect( {
                                        placeholder: 'Status',
                                        opts: TODO_STATUS_OPTIONS.map( ( val, i ) => ( { name: convertCamelCaseToSentenceCase( val ), value: val } ) ),
                                        value: data?.status,
                                        initialData: data?.status,
                                        key: 'status',
                                        handleChange: handleChange,
                                        className: '',
                                        multiple: false,
                                    } ) }

                                    { buildSelect( {
                                        placeholder: 'Difficulty',
                                        opts: TODO_DIFFICULTY_OPTIONS.map( ( val, i ) => ( { name: convertCamelCaseToSentenceCase( val ), value: val } ) ),
                                        value: data?.difficulty,
                                        initialData: data?.difficulty,
                                        key: 'difficulty',
                                        handleChange: handleChange,
                                        className: '',
                                        multiple: false,
                                    } ) }

                                    <div className="flex items-center space-x-2 w-full">
                                        <Checkbox
                                            id="isRecurring"
                                            checked={ data?.isRecurring?.on }
                                            onCheckedChange={ ( value ) => handleChange( "isRecurring", value ) }
                                            className={ `justify-start items-start` }
                                        >
                                            Recurring
                                        </Checkbox>
                                        <Label
                                            htmlFor="isRecurring"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Recurring
                                        </Label>
                                    </div>

                                    { data?.isRecurring
                                        && ( buildSelect( {
                                            placeholder: 'Recur Every',
                                            opts: [ '1D', '2D', '4D', '1W', '1M', '1Y' ].map( ( val, i ) => ( { name: convertCamelCaseToSentenceCase( val ), value: val } ) ),
                                            value: data?.recurringFreq,
                                            initialData: data?.recurringFreq,
                                            key: 'recurringFreq',
                                            handleChange: handleChange,
                                            className: '',
                                            multiple: false,
                                        } ) ) }

                                    <DatePicker
                                        className={ `mb-2 p-0 w-full` }
                                        usePopover={ true }
                                        useSelect={ true }
                                        selectKey={ '' }
                                        selectValue={ '' }
                                        selectOnChange={ ( k, v ) => { } }
                                        options={ DATE_PICKER_OPTIONS }
                                        events={ [] } // Array of existing events to show highlighted on the calendar. 
                                        selectedDate={ formatDateTime( data?.dueDate ) }
                                        setSelectedDate={ ( value ) => handleChange( "timestampDue", value ) }
                                        mode={ `single` }
                                        showOutsideDays={ true }
                                        footer={ <></> }
                                        // selected={ taskData?.dueDate }
                                        // date={ taskData?.dueDate }
                                        // setDate={ ( value ) => handleChange( "dueDate", value ) }
                                        placeholder={ "Due Date" }
                                    />

                                     <DatePickerWithPresets
                                        className={ `mb-2 p-0 w-full z-100` }
                                        date={ data?.timestampDue }
                                        setDate={ ( value ) => handleChange( "timestampDue", value ) }
                                        placeholder={ "Timestamp Due" }
                                        selected={ data?.timestampDue }
                                        options={ DATE_PICKER_OPTIONS }
                                    />

                                    <DatePickerWithPresets
                                        className={ `mb-2 p-0 w-full z-100` }
                                        date={ data?.timestampEstimated }
                                        setDate={ ( value ) => handleChange( "timestampEstimated", value ) }
                                        placeholder={ "Estimated Done-Date" }
                                        selected={ data?.timestampEstimated }
                                        options={ DATE_PICKER_OPTIONS }
                                    />

                                    </div>
                                    </div> ) }
                            </> ) }
        
                            { [ 'delete' ].includes( dialogType.toLowerCase() ) && (
                                <div className="flex justify-end w-full">
                                    <Button
                                        classes="admin-button bg-white px-10 py-2 text-primary"
                                        label={ `Cancel` }
                                        icon={ <X /> }
                                        onClick={ () => { handleCancel(); } }
                                    />
                                    <Button
                                        classes="admin-button px-10 py-2 bg-primary text-white"
                                        label={ `Confirm` }
                                        icon={ <Check /> }
                                        onClick={ () => {
                                            setConfirmed( true );
                                            setTimeout( () => {
                                                handleDeleteSubmit( data?._id, data, setData );
                                            }, 1000 );
                                        } }
                                    />
                                </div> ) }
                            <div className="flex flex-row gap-2 w-full justify-between items-stretch">
                                <DialogClose>
                                    <Button
                                        variant={ `destructive` }
                                        onClick={ () => {
                                            if ( handleClose ) handleClose();
                                            handleCancel();
                                        } }
                                    >
                                        <X />
                                        { `${ [ ...DIALOG_TYPE_CLOSE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                    </Button>
                                </DialogClose>
        
                                <DialogClose>
                                    <Button
                                        type='submit'
                                        disabled={ false }
                                        onClick={ () => {
                                            handleSubmitRouting( data, handleSubmit );
                                        } }
                                    >
                                        { [ ...DIALOG_TYPE_CLOSE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                        { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                    </Button>
                                </DialogClose>
                            </div>
                        </DialogContent>
        
                        <DialogFooter className='sm:justify-start'>
                        </DialogFooter>
                    </Dialog>
                );
            };
*/

/*  const buildTaskDialog2 = (
        data,
        setData, // For onchange
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        type = '',
        dialogType,
        dataType, // Name of type of data being represented.
    ) => {
        let title = `${ [ 'New', 'View', 'Edit', 'Delete', 'None' ][
            DIALOG_TYPES.indexOf( dialogType )
        ]
            } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let description = `${ [ 'Create New', 'View a', 'Edit a', 'Delete a', 'None' ][
            [ 'add', 'view', 'edit', 'delete', 'none' ].indexOf( dialogType )
        ]
            } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let allData = getData();
        return (
            <Dialog
                // isOpen={ logDialogOpen || !!selectedLog }
                onClose={ handleClose }
                title={ title }
                open={ dialogOpen }
                onOpenChange={ setDialogOpen }
                className={ `flex flex-col` }>
                <DialogTrigger asChild>
                    <Button
                        className={ `select-none` }
                        variant='outline'>
                        { type === 'add' ? <Plus /> : <Edit /> }
                    </Button>
                </DialogTrigger>

                <DialogContent className={ `flex flex-col sm:max-w-[${ 425 }px] max-h-modal overflow-y-auto` }>
                    <DialogHeader>
                        <DialogTitle>{ title }</DialogTitle>
                        <DialogDescription>{ description }</DialogDescription>
                    </DialogHeader>
                    <div className={ `flex flex-col gap-2` }>
                        <FormGenerator
                            schema={ dataSchema }
                            data={ data }
                            refData={ allData }
                            setData={ setData }
                            initialData={ selectedLog || null }
                            onSubmit={ ( data ) => handleSubmit( data ) }
                            onChange={ ( e ) => {
                                const { name, value } = e.target;
                                if ( data && Object.keys( data ).includes( name ) ) {
                                    handleChange( name, value, data, setData );
                                }
                            } }
                            inputMaxWidth={ 32 }
                            inputMaxHeight={ 32 }
                        />
                    </div>

                    <DialogFooter className='sm:justify-start'>
                        <DialogClose asChild>
                            <Button
                                type='submit'
                                onClick={ () => {
                                    handleSubmit( initialData );
                                } }>
                                { type === 'add' ? 'Create' : 'Save' }
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };
*/




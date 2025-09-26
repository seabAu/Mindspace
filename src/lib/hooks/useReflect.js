import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ToastAction } from '@/components/ui/toast';
import { toast } from 'sonner';
import * as utils from 'akashatools';

import {
    // Stats API endpoints
    fetchAllStatsApi,
    fetchStatsByIdApi,
    createStatsApi,
    importBulkData,
    updateBulkData,
    updateStatsApi,
    deleteStatsApi,
    fetchStatsByFilter,
    fetchStatsForDate,
    fetchStatsForDateRange,

    // Habits API endpoints
    fetchAllHabits,
    fetchHabitById,
    createHabitApi,
    updateHabitApi,
    deleteHabitApi,
    fetchHabitsByFilter,
    updateHabitActivityApi,
    updateHabitActivityBulkApi,

    // Log journal API endpoints
    createLog,
    updateLog,
    fetchLogById,
    fetchLogs,
    deleteLog,
} from '@/lib/services/reflectService';

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
import useError from '../hooks/useError';
import { mapObj2Obj } from '../utilities/obj';
import { daysBetween, formatDate, formatDateTime } from '../utilities/time';
import useGlobalStore from '@/store/global.store';
import useReflectStore from '@/store/reflect.store';
import { Button } from '@/components/ui/button';
import FormGenerator from '@/components/Form/FormGenerator';
import { twMerge } from 'tailwind-merge';
import { addDays, differenceInDays } from 'date-fns';
import { DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES, STATS_DATATABLE_COLUMNS } from '../config/config';
import { DAILY_POINTS, DATE_PICKER_OPTIONS, HABIT_DIFFICULTY_OPTIONS, STREAK_MILESTONES } from '../config/constants';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import { cleanDocument, isArrSafe } from '../utilities/data';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper';
import { validateSubmittedData } from '../utilities/input';

const API_BASE_URL = '/api/app/stats'; // Base URL for notes API
const useReflect = ( useSuccessToast = false ) => {
    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, setData,
        user,
        debug, setDebug,
    } = useGlobalStore();

    const {
        // Stats store data
        requestFetchStats, setRequestFetchStats,
        statsData, setStatsData,
        selectedDate, setSelectedDate,
        selectedEndDate, setSelectedEndDate,
        activePageTab, setActivePageTab,
        showSidebarCalendar, setShowSidebarCalendar,
        toggleShowSidebarCalendar,
        activeSidebarTab, setActiveSidebarTab,
        sidebarOpen, setSidebarOpen,
        handleDateSelect,
        clearDateSelection,
        toggleSidebar,
        addStat: addStatState,
        addStats: addStatsState,
        createStat: createStatState,
        updateStat: updateStatState,
        updateMany: updateManyStatsState,
        deleteStat: deleteStatState,
        deleteStats: deleteStatsState,
        insertStat: insertStatState,
        clearError: statsClearError,
        itemsPerPage, setStatsPerPage,
        getAllUniqueDataKeys,
        rearrangeStats,
        exportStats,
        fetchStats,
        importStats,
        getStatById,
        getStatsByType,
        getStatsByDateRange,
        isLoading: isStatsLoading, error: statsError, setError: setStatsError,

        // Habits store data
        habitsData, setHabitsData,
        selectedHabitsDate, setSelectedHabitsDate,
        visibleHabits, setVisibleHabits,
        activeTab, setActiveTab,
        toggleHabitVisibility,
        loadHabits,
        updateHabit,
        createHabit,
        updateHabitActivity,
        getActiveHabits,
        getVisibleHabits,
        getHabitsForDate,
        getActivityForDate,
        loading: isHabitsLoading, setLoading: setIsHabitsLoading,


        // Logs store data
        requestFetchLogs,
        setRequestFetchLogs,
        logsData, setLogsData,
        selectedLog, setSelectedLog,
        addLog: addLogData,
        updateLog: updateLogData,
        deleteLog: deleteLogData,
        sortLogs,
        getLogById,
        getLogByDate,

        selectedStat, setSelectedStat,
        selectedHabit, setSelectedHabit,

        notesOpen, setNotesOpen, notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
    } = useReflectStore();

    const {
        error, setError,
        loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError( useSuccessToast );

    // Modal state values
    const [ selectedData, setSelectedData ] = useState( null );
    const [ dialogType, setDialogType ] = useState( 'none' ); // NONE | VIEW | EDIT | ADD | DELETE | GOTO
    const [ dialogDataType, setDialogDataType ] = useState( 'stats' ); // 'stats' | 'journal' | 'insight'
    const [ dialogDataSchema, setDialogDataSchema ] = useState( null );
    const [ dialogData, setDialogData ] = useState( null );
    const [ dialogInitialData, setDialogInitialData ] = useState( null ); // For create-new log modal

    // Schemas
    const [ logSchema, setLogSchema ] = useState( null );
    const [ dataSchema, setDataSchema ] = useState( null );
    const [ statsSchema, setStatsSchema ] = useState( null );
    const [ habitsSchema, setHabitsSchema ] = useState( null );

    const initialLogData = {
        // "_id": "677d267f055593f39afa5663",
        "userId": "641d38a5258b42bbf65d329a",
        "workspaceId": "63f1e9128bcd5a42d28b4563",
        "plannerId": "676e88ee712d044ba692b3a7",
        "calendarId": "bcd5a9128b456342d2863f1e",
        "eventIds": [
            "b28b2d28cd5a4e9163f14563",
            "bcd5a28b2d284e1459163f63",
        ],
        // "date": function () { return new Date( Date.now() ); },
        // "title": function () {
        //     const date = formatDateForTitle( this.date || new Date( Date.now() ) );
        //     return `Daily Log - ${ date }`;
        // },
        "date": "2025-04-03T00:00:00.000Z",
        "title": "Daily Log - Placeholder",
        "summary": "If this appears, it means we are creating a new log entry, or the form generator failed to incorporate the selected log's data. Check the console logs for more information. ",
        "mood": "Fulfilled",
        "tags": [
            "default",
            "reflection",
            "planning"
        ],
        "achievements": [
            {
                "description": "Set 3 long-term goals",
                "completed": true,
                "_id": "677d2e1653c9fd18941bf8fa",
            },
            {
                "description": "Organized personal finances",
                "completed": false,
                "_id": "677d2e1653c9fd18941bf8fb",
            }
        ],
        "plansForTomorrow": "Complete the goal-setting worksheet.",
        "weather": {
            "temperature": 65,
            "condition": "Overcast"
        },
        "wellness": {
            "stepsTaken": 5400,
            "hoursSlept": 8,
            "waterIntake": 3
        },
        "challenges": [
            "A", "B", "C", "Row Row Fight The Power <3"
        ],
        "attachments": [],
        "createdAt": "2025-01-07T13:37:26.659Z",
        "updatedAt": "2025-01-07T13:37:26.659Z"
    };


    // Fetch data schema on component mount
    const handleGetSchemas = () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            setLogSchema( getSchema( 'log' ) );
            setDataSchema( getSchema( 'data' ) );
            setStatsSchema( getSchema( 'stats' ) );
            setHabitsSchema( getSchema( 'habits' ) );
            return schemas?.app?.reflect;
        }
        console.log( 'useReflect.js :: handleGetSchemas called.' );
    };

    const getSchemaForDataType = ( type ) => {
        // handleGetSchemas(); 
        // Make sure latest schemas are loaded.
        if ( schemas && utils.val.isObject( schemas ) && schemas?.app && schemas?.app?.planner ) {
            switch ( type ) {
                case 'data':
                case 'stats':
                    return ( schemas?.app?.reflect?.stats );
                case 'habits':
                    return ( schemas?.app?.reflect?.habits );
                case 'log':
                    return ( schemas?.app?.reflect?.log );
                case 'journal':
                    return ( schemas?.app?.reflect?.journal );
                case 'insights':
                    return ( schemas?.app?.reflect?.insights );
                default:
                    return null;
            }
        }
        else {
            console.log( 'useReflect.js :: getSchemaForDataType called :: error: type was invalid :: type = ', type );
        }
        console.log( 'useReflect.js :: getSchemaForDataType called.' );
    };

    const handleCancel = () => {
        console.log( "useReflect :: handleCancel called" );
        setDialogData( null );
        setDialogDataSchema( null );
        setDialogInitialData( null );
        setDialogType( 'none' );
        setDialogDataType( 'none' );
        setSelectedData( null );
    };

    const handleCreateStart = ( data, dataType = "log" ) => {
        const schema = getSchema( dataType );
        if ( schema ) {
            // Add essential fields we already have values for.
            if ( schema?.hasOwnProperty( 'organizerId' ) ) { data[ 'organizerId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'userId' ) ) { data[ 'userId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'workspaceId' ) ) { data[ 'workspaceId' ] = workspaceId; }
            if ( schema?.hasOwnProperty( 'habitId' ) ) {
                if ( utils.val.isValidArray( habitsData, true ) ) { data[ 'habitId' ] = habitsData?.[ 0 ]?._id; }
                else { data[ 'habitId' ] = null; }
            }
        }

        if ( data ) {
            setSelectedLog( data );
            setDialogDataType( dataType );
            setDialogDataSchema( schema );
            setDialogType( 'add' );
            setDialogInitialData( data );
            setDialogData( data );
            // setOpen( true );
            // setIsCreating( true );
            // setIsEditing( false );
            if ( debug === true )
                console.log(
                    'useReflect',
                    ' :: ', 'handleCreateStart',
                    ' :: ', '(initial) data = ', data,
                    ' :: ', 'dataType = ', dataType,
                    ' :: ', 'schemas = ', schemas,
                    ' :: ', 'schema = ', schema
                );
        }
    };

    const handleCreateSubmit = async ( data, dataType = "event", isCloned = false ) => {
        // Send data to server, and push results (if valid) to the local events list.
        let res;
        let typeSchema = getSchema( dataType );
        let validatedData = validateSubmittedData( data, typeSchema, isCloned );
        if ( debug === true )
            console.log( "useReflect :: handleCreateSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "isCloned = ", isCloned, " :: ", "typeSchema = ", typeSchema, " :: ", "validatedData = ", validatedData );

        switch ( dataType ) {
            case 'habit':
                res = await handleCreateHabit( validatedData );
                break;
            case 'stats':
                res = await handleCreateStats( validatedData );
                break;
            case 'log':
                res = await handleCreateLog( validatedData );
                break;
            case 'insights':
                // Not yet implemented.
                break;
            default:
                res = null;
                break;
        }

        if ( res ) {
            console.log( "useReflect :: handleCreateSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return res;
        }
        else {
            console.log( "useReflect :: handleCreateSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return null;
        }
        // handleCancel();
    };

    const handleEditStart = ( data, dataType = "event" ) => {
        if ( data ) {
            setSelectedLog( data );
            setDialogData( data );
            setDialogInitialData( data );
            if ( dataType === 'stat' ) setSelectedData( data );
            setDialogDataType( dataType );
            setDialogDataSchema( getSchema( dataType ) );
            setDialogType( 'edit' );
            console.log(
                'useReflect',
                ' :: ', 'handleEditStart',
                ' :: ', 'data = ', data,
                ' :: ', 'dataType = ', dataType,
            );
        }
    };

    const handleEditSubmit = async ( data, dataType = "event" ) => {
        // Send data to server, and push results (if valid) to the local events list.
        let typeSchema = getSchema( dataType );
        let validatedData = validateSubmittedData( data, typeSchema );

        let res;
        switch ( dataType ) {
            case 'stats':
                res = await handleUpdateStats( validatedData );
                break;
            case 'habit':
                res = await handleUpdateHabit( validatedData );
                break;
            case 'log':
                res = await handleUpdateLog( validatedData );
                break;
            case 'insights':
                // Not yet implemented.
                break;
            default:
                res = null;
                break;
        }

        if ( res ) {
            console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return res;
        }
        else {
            console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return null;
        }
        // handleCancel();
    };

    const handleCloneSubmit = async ( data, dataType = 'log' ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let res;
            switch ( dataType ) {
                case 'stats':
                    res = await createStatsApi( {
                        data,
                        successCallback: ( data ) => {
                            if ( data ) setStatsData( [ data, ...( isArrSafe( statsData ) ? statsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'habit':
                    res = await createHabitApi( {
                        data,
                        successCallback: ( data ) => {
                            if ( data ) setHabitsData( [ data, ...( isArrSafe( habitsData ) ? habitsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'log':
                case 'journal':
                    res = await createLog( {
                        data,
                        // successCallback: handleSuccessCallback,
                        successCallback: ( data ) => {
                            if ( data ) setLogsData( [ data, ...( isArrSafe( logsData ) ? logsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'insights':
                    // Not yet implemented.
                    break;
                default:
                    res = null;
                    break;
            }

            if ( res && utils.val.isObject( res ) ) {
                console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                // setData( data?.filter( ( item ) => item?._id !== id ) );
                return res;
            }
            else {
                console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                return null;
            }
        }
    };

    const handleDeleteSubmit = async ( id, data, setData, dataType = 'log' ) => {
        console.log( 'useReflect.js :: handleDeleteSubmit :: Deleting: ', id, data, setData );
        try {
            let res;
            switch ( dataType ) {
                case 'stats':
                    res = await deleteStatsApi( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'habit':
                    res = await deleteHabitApi( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'journal':
                case 'log':
                    res = await deleteLog( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'insights':
                    // Not yet implemented.
                    break;
                default:
                    res = null;
                    break;
            }

            if ( res ) {
                console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                setData( data?.filter( ( item ) => item?._id !== id ) );
                return res;
            }
            else {
                console.log( "useReflect :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                return null;
            }

        } catch ( error ) {
            console.error( 'Error deleting doc of type ', dataType, ': ', error );
        } finally {
            // Cleanup afterward.
            handleCancel();
        }
    };

    ////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Stats/Data hooks /////////////////////////
    ////////////////////////////////////////////////////////////////////////

    // Fetch a single data point by its ID
    const handleFetchStatsById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        let result = await fetchStatsByIdApi( {
            id,
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        if ( result ) return result;
        else return null;
    };

    // Fetch all stats data for a specific workspace
    const handleFetchAllStats = async () => {
        let result = await fetchAllStatsApi( {
            workspaceId,
            // stateSetter: setStatsData,
            successCallback: ( res ) => {
                console.log( 'useReflect :: handleFetchStats :: res = ', res ); let data = res?.data?.data;
                // Filter out any bad results. 
                let stats = data
                    .filter( ( item ) => ( item && utils.val.isDefined( item ) && utils.val.isDefined( item?.dataKey ) ) )
                    .sort( ( a, b ) => new Date( b?.timeStamp ).getTime() - new Date( a?.timeStamp ).getTime() );
                setStatsData( stats );
                return stats;
            },
            errorCallback: handleErrorCallback,
        } );

        if ( result ) {
            setStatsData( result );
        }
    };

    // Create a new stats data item.
    const handleCreateStats = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            // Use the data as a seed; send it to the zustand store to receive back a properly initialized new-stat item.
            let initializedData = createStatState( data );
            let result = await createStatsApi( {
                // data: postData,
                data: cleanDocument( {
                    ...initializedData || data,
                    workspaceId: workspaceId,
                    userId: user?.id,
                } ),
                stateSetter: ( data ) => {
                    if ( data && utils.val.isObject( data ) ) { addStatState( data ); }
                },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            // setStatsData( stats );
            handleCancel(); // Close modal and reset global variables. 
            if ( result ) return result;
            else return null;
        }
    };

    // Update an existing stats data point
    const handleUpdateStats = async ( id, data ) => {
        // let id = data?._id;
        console.log( 'useReflect :: handleUpdateStats :: data = ', data, " :: ", "id = ", id );
        if ( id ) {
            let result = await updateStatsApi( {
                id,
                data,
                stateSetter: ( result ) => { updateStatState( result?._id, result ); },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result ) ) {
                // setStatsData( await fetchAllStats() ); // Refresh stats
                // setStatsData( [
                //     ...statsData.filter( ( s ) => s?._id !== result?._id ),
                //     result,
                // ] );

                // setStatsData( stats );
                handleCancel();
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'useReflect :: handleUpdateStats :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'useReflect :: handleUpdateStats :: ERROR: id must be defined.' );
            return null;
        }
    };

    // Clone a log entry.
    const handleCloneStats = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let clonedStats = await createStatsApi( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => ( setStatsData( [ ...statsData, data ] ) ),
            } );

            if ( clonedStats ) {
                // Result not null, successful. Insert into list.
                // Update the cloned item with the full data from the server.
                handleCancel();
            }
        }
    };

    // Delete a specific stats data item, without a confirmation request. This is for deleting bulk selected items. 
    const handleDeleteStats = async ( id ) => {
        console.log( 'useReflect :: handleDeleteStats called :: id = ', id );
        if ( window.confirm( 'Are you sure you want to delete this?' ) ) {
            try {
                let result = await deleteStatsApi( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                    stateSetter: () => { deleteStatState( id ); },
                } );

                console.log( "useReflect.js :: handleDeleteStats returned a response :: id = ", id, " :: ", "result = ", result );
                if ( result ) {
                    // Success, remove from local list.
                    // setStatsData( [ ...statsData.filter( ( l ) => l?._id !== id ) ] );
                    return true;
                }
            } catch ( error ) {
                console.error( 'Error deleting stats:', error );
                return false;
            }
        }
    };

    const handleExport = useCallback( () => {
        // Create a blob and download it
        const dataStr = exportStats();
        const blob = new Blob( [ dataStr ], { type: "application/json" } );
        const url = URL.createObjectURL( blob );

        const a = document.createElement( "a" );
        a.href = url;
        a.download = "data-items.json";
        document.body.appendChild( a );
        a.click();
        document.body.removeChild( a );
        URL.revokeObjectURL( url );
    }, [ exportStats ] );

    const handleImportData = useCallback(
        async ( importData ) => {
            if ( utils.val.isValidArray( importStats, true ) ) {
                // We have an array of something. 
                let newStats = []; // Array to compile all valid imported items. 
                importStats.forEach( async ( item, index ) => {
                    // Process each item to prepare it to be sent in bulk to the server.
                    if ( utils.ao.hasAll( [ 'dataType', 'dataValue', 'dataKey' ] ) ) {
                        newStats.push( {
                            userId: user?.id,
                            workspaceId: workspaceId,
                            ...item,
                            timeStamp: new Date( item?.timeStamp ? item?.timeStamp : Date.now() ).getTime(),
                            startTime: new Date( item?.startTime ? item?.startTime : Date.now() ).getTime(),
                            endTime: new Date( item?.endTime ? item?.endTime : Date.now() ).getTime(),
                        } );
                    }
                } );

                let result = await importBulkData( {
                    data: newStats,
                    stateSetter: ( data ) => {
                        console.log( "useReflect.js :: importBulkData :: stateSetter on success :: data = ", data );
                        if ( utils.val.isValidArray( data, true ) ) {
                            addStatState( data );
                        }
                    },
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                } );

                if ( debug === true )
                    console.log( "useReflect.js :: handleImportData :: importData = ", importData, " :: ", "after :: result = ", result );
                if ( utils.val.isValidArray( result, true ) ) return result;
                else return null;
            }
        }, [ importStats ] );

    ////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Habits hooks /////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    // Fetch a single data point by its ID
    const handleFetchHabitById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        let result = await fetchAllHabits( {
            id,
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        if ( result ) return result;
        else return null;
    };

    // Fetch all habits data for a specific workspace
    const handleFetchAllHabits = async () => {
        console.log( 'useReflect :: handleFetchAllHabits called.' );
        let result = await fetchAllHabits( {
            workspaceId,
            successCallback: ( res ) => {
                console.log( 'useReflect :: handleFetchHabits :: res = ', res ); let data = res?.data?.data;
                // Filter out any bad results. 
                let habits = data
                    .filter( ( item ) => ( item && utils.val.isDefined( item ) ) )
                    .sort( ( a, b ) => new Date( b?.timeStamp ).getTime() - new Date( a?.timeStamp ).getTime() );
                setHabitsData( habits );
                return habitsData;
            },
            errorCallback: handleErrorCallback,
        } );

        // if ( result ) { setHabitsData( result ); }
    };

    // Create a new habits data item.
    const handleCreateHabit = async ( data ) => {
        console.log( 'useReflect :: handleCreateHabit called :: data = ', data );
        if ( utils.val.isObject( data ) ) {
            let result = await createHabitApi( {
                // data: postData,
                // data: cleanDocument( {
                //     ...data,
                //     workspaceId: workspaceId,
                //     userId: user?.id,
                // } ),
                data: {
                    ...data,
                    workspaceId: workspaceId,
                    userId: user?.id,
                },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
                stateSetter: ( data ) => {
                    if ( data && utils.val.isObject( data ) ) {
                        // addHabit( data );
                        setHabits( [ data, ...( utils.val.isValidArray( habitsData, true ) ? habitsData : [] ) ] );
                    }
                },
            } );
            handleCancel(); // Close modal and reset global variables. 
            if ( result ) return result;
            else return null;
        }
    };

    // Update an existing habits data point
    const handleUpdateHabit = async ( id, data ) => {
        console.log( 'useReflect :: handleUpdateHabit called :: data = ', data, " :: ", "id = ", id );
        if ( id ) {
            let result = await updateHabitApi( {
                id,
                data,
                stateSetter: ( result ) => { updateHabit( result?._id, result ); },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result ) ) {
                // setHabitsData( await fetchAllHabits() ); // Refresh habits
                // setHabitsData( [
                //     ...habitsData.filter( ( s ) => s?._id !== result?._id ),
                //     result,
                // ] );

                handleCancel();
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'useReflect :: handleUpdateHabits :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'useReflect :: handleUpdateHabits :: ERROR: id must be defined.' );
            return null;
        }
    };

    // Clone a habits entry.
    const handleCloneHabit = async ( data ) => {
        console.log( 'useReflect :: handleUpdateHabit called :: data = ', data, " :: ", "id = ", id );
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let validatedData = validateSubmittedData( data, getSchema( 'habit' ), true, true );

            let clonedHabits = await createHabitApi( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => ( setHabitsData( [ ...habitsData, data ] ) ),
            } );

            if ( clonedHabits ) {
                // Result not null, successful. Insert into list.
                // Update the cloned item with the full data from the server.
                handleCancel();
            }
        }
    };

    // Delete a specific habits data item, with a confirmation request preventing misclicks. 
    const handleDeleteHabitStart = async ( id ) => {
        console.log( 'useReflect :: handleDeleteHabitStart called :: id = ', id );
        if ( window.confirm( 'Are you sure you want to delete this habits?' ) ) {
            try {
                let result = await deleteHabitApi( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                    // stateSetter: () => { deleteHabit( id ); },
                } );
                if ( result ) {
                    // Success, remove from local list.
                    // setHabitsData( [ ...habitsData.filter( ( l ) => l?._id !== id ) ] );
                    // deleteHabit( id );
                    return true;
                }
            } catch ( error ) {
                console.error( 'Error deleting habits:', error );
            }
        }
    };

    // Delete a specific habits data item, without a confirmation request. This is for deleting bulk selected items. 
    const handleDeleteHabit = async ( id ) => {
        console.log( 'useReflect :: handleDeleteHabit called :: id = ', id );
        if ( window.confirm( 'Are you sure you want to delete this item?' ) ) {
            try {
                let result = await deleteHabitApi( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                    // stateSetter: () => { deleteHabit( id ); },
                    stateSetter: () => { setHabitsData( habitsData?.filter( ( h ) => ( h?._id !== id ) ) ); },
                } );
                if ( result ) {
                    // Success, remove from local list.
                    // deleteHabit( id );
                    return true;
                }
            } catch ( error ) {
                console.error( 'Error deleting habits:', error );
                return false;
            }
        }
    };


    /**
     * Calculate streak for a habit considering interval and difficulty
     */
    const calculateHabitStreak = ( habit ) => {
        const difficulty = HABIT_DIFFICULTY_OPTIONS.find( ( d ) => d.value === habit.difficulty ) || HABIT_DIFFICULTY_OPTIONS[ 1 ];
        const interval = habit.interval || 0;
        const intervalDays = interval === 0 ? 1 : interval;

        const sortedActivity = habit.activity
            .filter( ( a ) => {
                if ( habit.inputType === "custom" ) {
                    return a.notes && a.notes.trim() !== "";
                }
                return a.value > 0;
            } )
            .sort( ( a, b ) => new Date( a.date ) - new Date( b.date ) );

        if ( sortedActivity.length === 0 ) {
            return { current: 0, longest: 0, total: 0, lastActivity: null, missedIntervals: 0 };
        }

        const today = new Date();
        const lastActivityDate = new Date( sortedActivity[ sortedActivity.length - 1 ].date );

        // Calculate current streak
        let currentStreak = 0;
        const missedIntervals = 0;
        let totalMissedInCurrentStreak = 0;

        // Check if we're within grace period from today
        const daysSinceLastActivity = differenceInDays( today, lastActivityDate );
        const allowedGap = intervalDays * difficulty.graceMultiplier;

        if ( daysSinceLastActivity <= allowedGap ) {
            currentStreak = 1;

            // Count backwards through activities
            for ( let i = sortedActivity.length - 2; i >= 0; i-- ) {
                const currentDate = new Date( sortedActivity[ i + 1 ].date );
                const prevDate = new Date( sortedActivity[ i ].date );
                const daysBetween = differenceInDays( currentDate, prevDate );

                // Expected gap is the interval
                const expectedGap = intervalDays;
                const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

                if ( daysBetween <= maxAllowedGap ) {
                    currentStreak++;

                    // Count missed intervals in this gap
                    if ( daysBetween > expectedGap ) {
                        const missedInThisGap = Math.floor( ( daysBetween - expectedGap ) / intervalDays );
                        totalMissedInCurrentStreak += missedInThisGap;

                        // For "hero" difficulty, check if we've exceeded the limit
                        if ( difficulty.value === "hero" && totalMissedInCurrentStreak > difficulty.maxMissedIntervals ) {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak (similar logic but for all time)
        let longestStreak = 0;
        let tempStreak = 1;
        let tempMissed = 0;

        for ( let i = 1; i < sortedActivity.length; i++ ) {
            const currentDate = new Date( sortedActivity[ i ].date );
            const prevDate = new Date( sortedActivity[ i - 1 ].date );
            const daysBetween = differenceInDays( currentDate, prevDate );
            const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

            if ( daysBetween <= maxAllowedGap ) {
                tempStreak++;

                if ( daysBetween > intervalDays ) {
                    const missedInThisGap = Math.floor( ( daysBetween - intervalDays ) / intervalDays );
                    tempMissed += missedInThisGap;

                    if ( difficulty.value === "hero" && tempMissed > difficulty.maxMissedIntervals ) {
                        longestStreak = Math.max( longestStreak, tempStreak - 1 );
                        tempStreak = 1;
                        tempMissed = 0;
                    }
                }
            } else {
                longestStreak = Math.max( longestStreak, tempStreak );
                tempStreak = 1;
                tempMissed = 0;
            }
        }
        longestStreak = Math.max( longestStreak, tempStreak );

        return {
            current: currentStreak,
            longest: longestStreak,
            total: sortedActivity.length,
            lastActivity: lastActivityDate,
            missedIntervals: totalMissedInCurrentStreak,
            difficulty: difficulty.value,
            pointsMultiplier: difficulty.pointsMultiplier,
        };
    };

    /**
     * Award points for habit completion
     */
    const awardHabitCompletionPoints = ( habit, streakData ) => {
        const basePoints = DAILY_POINTS.HABIT_COMPLETION;
        const streakBonus = Math.floor( streakData.current / 7 ) * DAILY_POINTS.STREAK_BONUS_BASE;
        const difficultyMultiplier = streakData.pointsMultiplier || 1;

        const totalPoints = Math.floor( ( basePoints + streakBonus ) * difficultyMultiplier );

        awardPoints( totalPoints, `${ habit.title } completion (${ streakData.current } day streak)` );

        // Check for milestone achievements
        const milestone = STREAK_MILESTONES.find( ( m ) => m.days === streakData.current );
        if ( milestone ) {
            awardPoints( milestone.points, `Milestone: ${ milestone.name } for ${ habit.title }` );
        }

        return totalPoints;
    };

    /**
     * Award daily sign-in points
     */
    const awardDailySignIn = ( userData, saveUserData = () => { } ) => {
        if ( !userData || saveUserData ) {
            console.error( "Error in habits rewards system: Cannot reward daily sign in, user is not defined." );
            return;
        }
        // const userData = getUserData();
        const today = new Date().toDateString();

        if ( userData.habitTrackerData.lastSignIn !== today ) {
            userData.habitTrackerData.lastSignIn = today;
            userData.habitTrackerData.dailySignInStreak += 1;
            saveUserData( userData );

            const points = DAILY_POINTS.SIGN_IN + Math.floor( userData.habitTrackerData.dailySignInStreak / 7 ) * 5;
            awardPoints( points, `Daily sign-in (${ userData.habitTrackerData.dailySignInStreak } day streak)` );

            return points;
        }

        return 0;
    };

    const getNextMilestone = ( streak ) => {
        const milestones = [ 7, 14, 30, 60, 90, 180, 365, 500, 1000 ];
        return milestones.find( ( m ) => m > streak ) || milestones[ milestones.length - 1 ];
    };

    /**
     * Get streak level information
     */
    const getStreakLevel = ( streak, difficulty = "determined" ) => {
        const difficultyData = HABIT_DIFFICULTY_OPTIONS.find( ( d ) => d.value === difficulty ) || HABIT_DIFFICULTY_OPTIONS[ 1 ];

        if ( streak >= 365 ) return { level: "Legendary", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "👑" }</div>, color: "text-yellow-500" };
        if ( streak >= 180 ) return { level: "Master", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "🏆" }</div>, color: "text-purple-500" };
        if ( streak >= 90 ) return { level: "Expert", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "🥇" }</div>, color: "text-blue-500" };
        if ( streak >= 30 ) return { level: "Champion", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "🥈" }</div>, color: "text-green-500" };
        if ( streak >= 14 ) return { level: "Warrior", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "⚔️" }</div>, color: "text-orange-500" };
        if ( streak >= 7 ) return { level: "Fighter", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "💪" }</div>, color: "text-red-500" };
        return { level: "Beginner", icon: <div className={ `aspect-square size-auto p-0 items-center justify-center text-center` }>{ "🌱" }</div>, color: "text-gray-500" };
    };


    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// LOG FILES /////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////

    /*  const fetchLogs = useCallback( async () => {
            try {
                setLoading( true );
                const data = await getLogs( calendarId );
                setLogs( data );
                setError( null );
            } catch ( err ) {
                setError( 'Failed to fetch logs' );
                toast.error( 'Failed to fetch logs' );
            } finally {
                setLoading( false );
            }
        }, [ calendarId ] );
     
        useEffect( () => { fetchLogs(); }, [ fetchLogs ] );
    */

    // Fetch a single log by its ID
    const handleFetchLogById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        return await fetchLogById( {
            id,
            // null, // setLogsData,
            // () => { }, // SuccessCallback
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
            // stateSetter,
            // successCallback,
            // errorCallback,
        } );
    };

    // Fetch all logs for a specific workspace
    const handleFetchLogs = async () => {
        let result = await fetchLogs( {
            workspaceId,
            successCallback: ( res ) => {
                console.log( 'useReflect :: handleFetchLogs :: res = ', res );
                let data = res?.data?.data;
                let logs = data.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) );
                setLogsData( logs );
                return logs;
            },
            errorCallback: handleErrorCallback,
        } );

        console.log( 'useReflect :: handleFetchLogs :: result = ', result );        // let data = result.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) );
        // if ( result ) setLogsData( result );
        // return data;

        if ( result && utils.val.isObject( result ) ) {
            return result;
        }
        else {
            return null;
        }
    };

    // Create a new log
    const handleCreateLog = async ( data ) => {
        let postData = { ...data };

        console.log( 'useReflect :: handleCreateLog :: data = ', data );
        if ( !data?.hasOwnProperty( 'workspaceId' ) ) { postData.workspaceId = workspaceId; }
        if ( !data?.hasOwnProperty( 'userId' ) ) { postData.userId = user?.id; }

        let result = await createLog( {
            data: data,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'useReflect :: handleCreateLog :: result = ', result );

        if ( result && utils.val.isObject( result ) ) {
            let logsTemp = [ ...( Array.isArray( logsData ) ? logsData : [] ), result ];
            let logs = logsTemp.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) );
            setLogsData( logs );
            handleCancel(); // Close modal and reset global variables. 
            return logs;
        } else {
            return null;
        }
    };

    // Update an existing log
    const handleUpdateLog = async ( data ) => {
        let id = data?._id;
        if ( id ) {
            console.log( 'useReflect :: handleUpdateLog :: data = ', data, " :: ", "id = ", id );
            let result = await updateLog( {
                id,
                data,
                // StateSetter
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result ) ) {
                // setLogsData( await fetchPlannerData() ); // Refresh logs
                setLogsData(
                    logsData
                        ?.map( ( item, i ) => ( item?._id === result?._id ? result : item ) )
                        ?.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) )
                );

                handleCancel(); // Close modal and reset global variables. 
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'useReflect :: handleUpdateLog :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'useReflect :: handleUpdateLog :: ERROR: id must be defined.' );
            return null;
        }
    };

    // Clone a log entry.
    const handleCloneLog = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let cloned = await createLog( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                // stateSetter: ( data ) => ( setLogsData( [ ...logsData, data ] ) ),
            } );

            if ( cloned ) {
                // Result not null, successful. Insert into list.
                setLogsData( [ ...logsData, cloned ] );
                handleCancel();
            }
        }
    };

    // Delete a specific log
    const handleDeleteLog = async ( data ) => {
        if ( window.confirm( 'Are you sure you want to delete this log?' ) ) {
            try {
                if ( utils.ao.has( data, '_id' ) ) {
                    let id = data?._id;
                    let result = await deleteLog( {
                        id,
                        // null, // StateSetter
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    if ( result ) {
                        // Success, remove from local list.
                        setLogsData( [ ...logsData.filter( ( l ) => l?._id !== id ) ] );
                    }
                }
            } catch ( error ) {
                console.error( 'Error deleting log:', error );
            }
        }
    };

    const handleOpenLogNotes = ( log ) => {
        // Opens the notes and a summary in an aside / sheet view.
        if ( debug === true )
            console.log( "useReflect :: handleOpenLogNotes :: log = ", log, " :: ", "notesOpen = ", notesOpen );
        setNotesOpen( true );
        setNotesContent( { ...log } );
    };

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Generic Dialog Form /////////////////////////
    ////////////////////////////////////////////////////////////////////////

    const logFormEssentialSchema = {
        "title": { label: "Title", fieldType: "String", inputType: "text" },
        "date": { label: "Date", fieldType: "Date", inputType: "datetime-local" },
        "mood": { label: "Mood", fieldType: "String", inputType: "enum" },
        "description": { label: "Description", fieldType: "String", inputType: "text" },
        "summary": { label: "Summary", fieldType: "String", inputType: "text" },
        "content": { label: "Content", fieldType: "String", inputType: "wysiwyg" },
        "notes": { label: "Notes", fieldType: "String", inputType: "wysiwyg" },
        "achievements": { label: "Achievements", fieldType: "String", inputType: "text" },
        "plansForTomorrow": { label: "Plans For Tomorrow", fieldType: "String", inputType: "text" },
        "customMood": { label: "Mood (other)", fieldType: "String", inputType: "text" },
        "weather": { label: "Weather", fieldType: "Object", inputType: "object" },
        "wellness": {
            label: "Wellness", fieldType: "Object", type: {
                'stepsTaken': { type: 'Int32', default: 0, min: 0, max: 10000 }, // e.g., from fitness tracker
                'hoursSlept': { type: 'Number', default: 0, min: 0, max: 24 }, // Sleep duration
                'waterIntake': { type: 'Number', default: 0, min: 0, max: 5 }, // Water intake in liters
                'numOfTabs': { type: 'Number', default: 0, min: 0 }, // Num of tabs open at end of day; tracking
                'weight': { type: 'Number', default: 0.0, min: 0.0, max: 350.0 },
                'tookVitamins': { type: 'Boolean', default: false },
                'tookMeds': { type: 'Boolean', default: false },
                'effectIntensityOverall': { type: 'Int32', default: 0, min: 0, max: 10 }, // You know what :J
                'effects': [ {
                    type: {
                        'effectType': { type: 'String' },
                        'effectDuration': { type: 'Number' }, // Inferred if not given by the other 2 out of 3 numbers.
                        'effectStartTime': { type: 'Date', inputType: 'datetime-local' }, // Inferred if not given by the other 2 out of 3 numbers.
                        'effectEndTime': { type: 'Date', inputType: 'datetime-local' }, // Inferred if not given by the other 2 out of 3 numbers.
                        'effectIntensity': { type: 'Int32', min: 0, max: 10 },
                        'notes': { type: 'String' }, // TODO :: Temporary; replace later with custom sub-properties.
                    }
                } ],
            }
        },
        "challenges": { label: "Challenges", fieldType: "[String]", inputType: "text" },
        "gratitude": { label: "Attachments", fieldType: "[Object]", inputType: "array" },
        "timeBlocks": {
            label: "Time Blocks", fieldType: "[Object]", type: {
                'startTime': { type: 'Date', inputType: 'datetime-local' }, // Start of the time block
                'endTime': { type: 'Date', inputType: 'datetime-local' },   // End of the time block
                'activity': { type: 'String' }, // What was done during this block
                'intent': { type: 'String', default: "" },
                'focusRating': { type: 'Number', min: 0, max: 10 } // How focused the user felt
            }
        },
        "tags": { label: "Tags", fieldType: "[String]", inputType: "tags" },
        // "workspaceId": { label: "Workspace", fieldType: "ObjectId", inputType: "enum" },
        "calendarId": { label: "Calendar", fieldType: "ObjectId", inputType: "enum" },
        // "attachments": { label: "Attachments", fieldType: "[String]", inputType: "text" },
    };

    const statsFormEssentialSchema = {};
    const habitFormEssentialSchema = {};

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
        handleClose,
        dialogType = 'add',
        dataType = 'planner', // Name of type of data being represented.
        dialogTrigger,
        debug = false,
    } ) => {
        if ( debug === true )
            console.log(
                'useReflect :: buildDialog :: args = ',
                "\n :: ", "initialData = ", initialData,
                "\n :: ", "data = ", data,
                "\n :: ", "setData = ", setData,
                "\n :: ", "refData = ", refData,
                "\n :: ", "dataSchema = ", dataSchema,
                "\n :: ", "dialogOpen = ", dialogOpen,
                "\n :: ", "setDialogOpen = ", setDialogOpen,
                "\n :: ", "handleSubmit = ", handleSubmit,
                "\n :: ", "handleChange = ", handleChange,
                "\n :: ", "handleClose = ", handleClose,
                "\n :: ", "dialogType = ", dialogType,
                "\n :: ", "dataType = ", dataType,
                "\n :: ", "dialogTrigger = ", dialogTrigger,
                "\n :: ", "debug = ", debug,
                "\n :: ", "getSchema( dataType ) = ", getSchema( dataType ),
            );

        let simplifiedSchema = null;
        switch ( dataType ) {
            case 'stat':
                simplifiedSchema = statsFormEssentialSchema;
                break;
            case 'log':
                simplifiedSchema = logFormEssentialSchema;
                break;
            case 'habit':
                simplifiedSchema = habitFormEssentialSchema;
                break;
            case 'insights':
                // Not yet implemented.
                break;
            default:
                simplifiedSchema = null;
                break;
        }

        return (
            <FormDialogWrapper
                debug={ debug }
                useOverlay={ true }
                dataType={ dataType }
                initialData={ initialData }
                data={ data }
                setData={ setData }
                refData={ refData }
                dataSchema={ dataSchema }
                dialogOpen={ dialogOpen }
                setDialogOpen={ setDialogOpen }
                handleSubmit={ handleSubmit }
                handleChange={ handleChange }
                handleClose={ handleClose }
                dialogType={ dialogType }
                dialogTrigger={ dialogTrigger }
                classNames={ '' }
                dialogClassNames={ '' }
                contentClassNames={ '' }
                simplifiedDataSchema={ simplifiedSchema ?? null }
                useSimplifiedSchema={ simplifiedForm ?? true }
            />
        );
    };


    /* 
        const buildDialog = ( {
            data, setData, // For onChange
            refData,
            dataSchema,
            dialogOpen, setDialogOpen,
            handleSubmit,
            handleChange,
            handleClose,
            dialogType = 'add',
            dataType = 'stats', // Name of type of data being represented.   
            dialogTrigger,
            debug = false,
        } ) => {
            let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Stats` }`;
            let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Stats` }`;
    
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
    
            if ( debug === true )
                console.log( 'useReflect :: buildDialog :: args = ', "\n :: ", "data = ", data,
                    "\n :: ", "setData = ", setData, // For onchange
                    "\n :: ", "dataSchema = ", dataSchema,
                    "\n :: ", "dialogOpen = ", dialogOpen,
                    "\n :: ", "setDialogOpen = ", setDialogOpen,
                    "\n :: ", "handleSubmit = ", handleSubmit,
                    "\n :: ", "handleChange = ", handleChange,
                    "\n :: ", "handleClose = ", handleClose,
                    "\n :: ", "dialogType = ", dialogType,
                    "\n :: ", "dataType = ", dataType, // Name of type of data being represented.
                    "\n :: ", "getSchema( dataType ) = ", getSchema( dataType ),
                );
    
            if ( !refData ) refData = getData();
            return (
                <Dialog
                    title={ title }
                    open={ dialogOpen }
                    // isOpen={ dialogOpen || !!data }
                    onClose={ () => handleClose() }
                    onOpenChange={ () => { setDialogOpen( !dialogOpen ); } }
                    // onOpenChange={ setDialogOpen }
                    className={ `flex flex-col` }>
                    { dialogTrigger && ( <DialogTrigger asChild>
                        <Button
                            className={ `select-none` }
                            variant='outline'>
                            { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }{ `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                        </Button>
                    </DialogTrigger> ) }
                    <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />
                    <DialogContent
                        className={ twMerge(
                            `w-full min-w-[50vw] max-w-[50vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 425 }px] max-h-modal flex flex-col `,
                            `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 `
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
                        <div className={ `flex flex-col gap-2` }>
                            { data && dataSchema && utils.val.isObject( dataSchema ) && (
                                <FormGenerator
                                    debug={ debug }
                                    dataType={ dataType }
                                    data={ data }
                                    setData={ setData }
                                    initialData={ data ?? dialogInitialData }
                                    refData={ refData }
                                    schema={ dataSchema }
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        if ( data && Object.keys( data ).includes( name ) ) {
                                            if ( handleChange ) handleChange( name, value, data, setData );
                                            setStatsData( { ...data, [ name ]: value } );
                                        }
                                    } }
                                    onCancel={ () => handleCancel() }
                                    onSubmit={ ( data ) => handleSubmit( data ) }
                                    inputMaxWidth={ 32 }
                                    inputMaxHeight={ 32 }
                                    showFormModel={ true }
                                    showFormData={ true }
                                    showFormSchema={ true }
                                />
                            ) }
                        </div>
    
                        <DialogFooter className='sm:justify-start'>
                            <DialogClose>
                                <Button
                                    type='submit'
                                    onClick={ () => {
                                    } }>
                                    { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                    { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }; */

    const handleFetchReflectData = useCallback(
        async () => {
            if ( workspaceId ) {
                handleFetchAllHabits();
                handleFetchAllStats();
                handleFetchLogs();
            }
        }
        , [ workspaceId ]
    );

    const handleInitializeReflectData = useCallback(
        async () => {
            if ( workspaceId ) {
                // Fetch data for this section of the app if it is empty. 
                console.log( "usePlanner :: handleInitializePlannerData :: workspaceId = ", workspaceId, " -> Initializing all data. " );
                if ( !utils.val.isValidArray( logsData, true ) ) { handleFetchLogs(); }
                if ( !utils.val.isValidArray( statsData, true ) ) { handleFetchAllStats(); }
                if ( !utils.val.isValidArray( habitsData, true ) ) { handleFetchAllHabits(); }
            }
            else {
                // No workspace; clear all data. 
                console.log( "usePlanner :: handleInitializePlannerData :: no workspaceId -> Clearing all data. " );
                handleClearPlannerData();
            }
        }
        , [ user, workspaceId ]
    );

    const handleClearReflectData = () => {
        setLogsData( [] );
        setHabitsData( [] );
        setStatsData( [] );
    };

    return {
        // State variables
        handleClearReflectData,
        handleFetchReflectData,
        handleInitializeReflectData,
        initialLogData,
        dialogType, setDialogType,
        dialogData, setDialogData,
        logSchema, setLogSchema,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        habitsSchema, setHabitsSchema,
        dialogDataSchema, setDialogDataSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        // logDialogOpen, setLogDialogOpen,

        ///////////////////////////// Stats/Data hooks /////////////////////////////
        // Handler functions
        handleExport,
        handleImportData,
        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
        handleFetchStatsById,
        handleCloneStats,
        handleCreateStats,
        handleUpdateStats,
        handleDeleteStats,
        handleCancel,

        // Generic handler functions that branch off for each of the individual data types managed by this specific dashboard (reflect)
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleCloneSubmit,
        handleDeleteSubmit,

        // Config values
        columns: STATS_DATATABLE_COLUMNS,

        ///////////////////////////// Habits hooks /////////////////////////////
        handleFetchHabitById,
        handleFetchAllHabits,
        handleCreateHabit,
        handleUpdateHabit,
        handleCloneHabit,
        handleDeleteHabitStart,
        handleDeleteHabit,
        calculateHabitStreak,
        awardHabitCompletionPoints,
        awardDailySignIn,
        getStreakLevel,
        getNextMilestone,

        ///////////////////////////// Logs hooks /////////////////////////////
        handleFetchLogById,
        handleFetchLogs,
        handleCloneLog,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,


        ///////////////////////////// Reflect Form Related /////////////////////////////
        statsFormEssentialSchema,
        habitFormEssentialSchema,
        logFormEssentialSchema,

        // For opening the notes sidebar / drawer.
        handleOpenLogNotes,
    };
};

export default useReflect;

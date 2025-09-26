import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ToastAction } from '@/components/ui/toast';
import { toast } from 'sonner';
import * as utils from 'akashatools';

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
import useError from './useError';
import { daysBetween, formatDate, formatDateTime } from '../utilities/time';
import useGlobalStore from '@/store/global.store';
import useReminderStore from '@/store/reminder.store';
import { Button } from '@/components/ui/button';
import FormGenerator from '@/components/Form/FormGenerator';
import { twMerge } from 'tailwind-merge';
import { addDays, differenceInDays } from 'date-fns';
import { DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from '../config/config';
import { DATE_PICKER_OPTIONS } from '../config/constants';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import { cleanDocument } from '../utilities/data';
import {
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    fetchNotifications,
    fetchNotificationById,
    fetchNotificationsOfReminderId,
    createNotification,
    createNotificationByReminderId,
    updateNotification,
    deleteNotification,
    fetchReminderById,
} from '../services/reminderService';

import {
    BellRing,
    Blocks,
    Box,
    BoxesIcon,
    Calendar,
    CalendarCheck,
    CalendarCheck2,
    DatabaseBackup,
    File,
    Folder,
    Goal,
    House,
    ListCheck,
    ListChecks,
    LucideLaptopMinimalCheck,
    NotebookPen,
    PanelsTopLeft,
    PlusCircleIcon,
    RefreshCcw,
} from "lucide-react";
import useNotificationsStore from '@/store/notification.store';



const API_BASE_URL = '/api/app/stats'; // Base URL for notes API
const useMessage = ( useSuccessToast = false ) => {
    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, setData,
        user,
        debug, setDebug,
    } = useGlobalStore();

    const {
        reminderData, setReminderData,
        activeReminderData, setActiveReminderData,
        addReminder: addReminderState,
        createReminder: createReminderState,
        updateReminder: updateReminderState,
        deleteReminder: deleteReminderState,
        isLoading: isReminderLoading, error: reminderError,
        requestFetchReminders,
        setRequestFetchReminders,
        clearError,
        remindersPerPage, setRemindersPerPage,
        getAllUniqueDataKeys, setReminderToEdit,
        clearReminderToEdit, setReminderToClone,
        clearReminderToClone,
        getFilteredReminders,
        getActiveReminders,
        getInactiveReminders,
        addReminders,
        insertReminder,
        updateReminders,
        deleteReminders,
        fetchReminder,
        sortReminders,
        clearAllReminders,
        getReminderById,
        getRemindersByDateRange,
        getActiveReminderTypes,
        getActiveRemindersByType,
        getNotificationsByReminderId,
        getRemindersByType,
    } = useReminderStore();

    const notificationData = useNotificationsStore( ( state ) => state.notificationData );

    const {
        // notificationData, 
        setNotificationData,
        addNotification,
        createNotification: createNotificationState,
        updateNotification: updateNotificationState,
        updateNotifications: updateNotificationsState,
        deleteNotification: deleteNotificationState,
        deleteNotifications: deleteNotificationsState,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearDismissed,
        getUnreadNotifications,
        getVisibleNotifications,
    } = useNotificationsStore();


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
    const [ dialogDataType, setDialogDataType ] = useState( 'reminder' ); // 'reminder' | 'notification'
    const [ dialogDataSchema, setDialogDataSchema ] = useState( null );
    const [ dialogData, setDialogData ] = useState( null );
    const [ dialogInitialData, setDialogInitialData ] = useState( null ); // For create-new event modal

    // Schemas
    const [ reminderSchema, setReminderSchema ] = useState( null );
    const [ notificationSchema, setNotificationSchema ] = useState( null );

    // Define data table columns
    const columns = useMemo(
        () => [
            { value: "docId", header: "Doc ID", span: 2 },
            { value: "docType", header: "Doc Type", span: 1 },
            { value: "triggerDates", header: "Trigger Timestamps", span: 3 },
            { value: "rrules", header: "Recurrence Rules", span: 5 },
            { value: null, header: "Actions", span: 1, headerClassName: "text-right" },
        ],
        [],
    );


    // Fetch data schema on component mount
    const handleGetSchemas = () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            setReminderSchema( getSchema( 'reminder' ) );
            setNotificationSchema( getSchema( 'notification' ) );
            return schemas?.app?.notify;
        }
        console.log( 'useMessage.js :: handleGetSchemas called.' );
    };

    const getSchemaForDataType = ( type ) => {
        // Make sure latest schemas are loaded.
        if ( schemas && utils.val.isObject( schemas ) && schemas?.app && schemas?.app?.time ) {
            switch ( type ) {
                case 'remind':
                case 'reminder':
                    return ( getSchema( 'reminder' ) );
                case 'notify':
                case 'notification':
                    return ( getSchema( 'notification' ) );
                case 'recurrence':
                    return ( getSchema( 'recurrence' ) );
                default:
                    return null;
            }
        }
        else {
            console.log( 'useMessage.js :: getSchemaForDataType called :: error: type was invalid :: type = ', type );
        }
        console.log( 'useMessage.js :: getSchemaForDataType called.' );
    };

    const handleCancel = () => {
        console.log( "useMessage :: handleCancel called" );
        setDialogData( null );
        setDialogDataSchema( null );
        setDialogInitialData( null );
        setDialogType( 'none' );
        setDialogDataType( 'none' );
        setSelectedData( null );
    };

    // Fetch a single data point by its ID
    const handleFetchReminderById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        let result = await fetchReminderById( {
            id,
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        if ( result ) return result;
        else return null;
    };

    const getResultData = ( result ) => {
        if ( result && result?.hasOwnProperty( 'data' ) && result?.data?.hasOwnProperty( 'data' ) ) {
            let data = result?.data?.data;
            if ( data && utils.val.isValidArray( data, true ) ) {
                return data;
            }
        }
        return null;
    };

    // Fetch all reminder data for a specific workspace
    const handleFetchAllReminders = async () => {
        let result = await fetchReminders( {
            workspaceId,
            // stateSetter: setReminderData,
            // successCallback: ( res ) => {
            //     console.log( 'useMessage :: handleFetchAllReminders :: res = ', res );
            //     let data = res?.data?.data;
            //     // Filter out any bad results. 
            //     let reminders = data
            //         // .sort( ( a, b ) => new Date( b?.startDate ).getTime() - new Date( a?.startDate ).getTime() );
            //         .filter( ( item ) => ( item && utils.val.isDefined( item ) && utils.val.isDefined( item?.startDate ) ) );
            //     setReminderData( reminders );
            //     return reminders;
            // },
            successCallback: ( result ) => {
                console.log( 'useMessage :: handleFetchAllReminders :: res = ', res );
                let data = getResultData( result );
                if ( data ) setReminderData( data );
                return result;
            },
            errorCallback: handleErrorCallback,
        } );

        // if ( result ) {
        //     setReminderData( result );
        // }
        if ( result ) return result;
        else return null;
    };

    // Fetch all notifications data for a specific workspace
    const handleFetchAllNotifications = async () => {
        let result = await fetchNotifications( {
            workspaceId,
            errorCallback: handleErrorCallback,
            successCallback: ( result ) => {
                console.log( "useMessage :: handleFetchAllNotifications :: notifications fetched = ", result );
                if ( result && result?.hasOwnProperty( 'data' ) && result?.data?.hasOwnProperty( 'data' ) ) {
                    // let data = result?.data?.data;
                    let data = getResultData( result );
                    if ( data && utils.val.isValidArray( data ) ) {
                        setNotificationData( data );
                    }
                }
                return result;
            }
        } );

        console.log( "useMessage :: handleFetchAllNotifications :: notifications fetched = ", result );

        if ( result && utils.val.isValidArray( result, true ) ) {
            // setNotificationData( result );
            return result;
        }
        else {
            return null;
        }
    };

    // Create a new reminder data item.
    const handleCreateReminder = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            const newReminder = {
                ...data,
                workspaceId: workspaceId,
                userId: user?.id,
            };

            let result = await createReminder( {
                data: newReminder,
                // successCallback: handleSuccessCallback,
                successCallback: ( result ) => {
                    console.log( "useMessage :: handleFetchAllNotifications :: notifications fetched = ", result );
                    if ( result && result?.hasOwnProperty( 'data' ) && result?.data?.hasOwnProperty( 'data' ) ) {
                        // let data = result?.data?.data;
                        let data = getResultData( result );
                        if ( data && utils.val.isValidArray( data ) ) {
                            setNotificationData( data );
                        }
                    }
                    return result;
                },
                errorCallback: handleErrorCallback,
            } );

            console.log( "useMessage :: handleCreateReminder :: data = ", newReminder, " :: ", "result = ", result );
            // setReminderData( reminder );
            if ( result && utils.val.isObject( result ) ) {
                setReminderData( [ ...( utils.val.isValidArray( reminderData, true ) ? reminderData : [] ), result ] );
                handleCancel(); // Close modal and reset global variables. 
                return result;
            }
            else {
                return null;
            }
        }
    };

    // Update an existing reminder data point
    const handleUpdateReminder = async ( id, data ) => {
        // let id = data?._id;
        console.log( 'useMessage :: handleUpdateReminder :: data = ', data, " :: ", "id = ", id );
        if ( id ) {
            let result = await updateReminder( {
                id,
                data,
                stateSetter: ( result ) => { updateReminderState( result?._id, result ); },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result ) ) {
                // setReminderData( [
                //     ...reminderData.filter( ( s ) => s?._id !== result?._id ),
                //     result,
                // ] );
                handleCancel();
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'useMessage :: handleUpdateReminder :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'useMessage :: handleUpdateReminder :: ERROR: id must be defined.' );
            return null;
        }
    };

    // Clone a log entry.
    const handleCloneReminder = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;
            // setReminderData( [ { ...data, _id: "CLONE_ID_TEMP" }, ...statsData ] );

            let clonedReminder = await createReminder( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => ( setReminderData( [ ...statsData, data ] ) ),
            } );

            if ( clonedReminder ) {
                // Result not null, successful. Insert into list.
                // addItem( clonedReminder );
                // Update the cloned item with the full data from the server.
                handleCancel();
            }
        }
    };

    // Delete a specific reminder item, with a confirmation request preventing misclicks. 
    const handleDeleteReminderStart = async ( id ) => {
        if ( window.confirm( 'Are you sure you want to delete this stats?' ) ) {
            try {
                let result = await deleteReminder( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                    // stateSetter: () => { deleteReminder( id ); },
                } );
                if ( result ) {
                    // Success, remove from local list.
                    // setReminderData( [ ...statsData.filter( ( l ) => l?._id !== id ) ] );
                    // deleteReminder( id );
                    return true;
                }
            } catch ( error ) {
                console.error( 'Error deleting stats:', error );
            }
        }
    };

    // Delete a specific reminder item, without a confirmation request. This is for deleting bulk selected items. 
    const handleDeleteReminder = async ( id ) => {
        try {
            let result = await deleteReminder( {
                id,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
                stateSetter: () => { deleteReminder( id ); },
            } );
            if ( result ) {
                // Success, remove from local list.
                // deleteReminder( id );
                return true;
            }
        } catch ( error ) {
            console.error( 'Error deleting stats:', error );
            return false;
        }
    };

    const buildDialog = ( {
        data, setData, // For onChange
        refData,
        reminderSchema,
        dialogOpen, setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'add',
        dataType = 'reminder', // Name of type of data being represented.   
        dialogTrigger,
        debug = false,
    } ) => {
        let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Reminder` }`;
        let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Reminder` }`;

        if ( !utils.val.isDefined( data ) ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            if ( dialogType === 'add' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'edit' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'view' ) { data = dialogData ?? dialogInitialData; }
        }

        if ( !utils.val.isDefined( reminderSchema ) || Object.keys( reminderSchema ).length === 0 ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            reminderSchema = getSchema( dataType );
        }

        if ( debug === true )
            console.log( 'useMessage :: buildDialog :: args = ', "\n :: ", "data = ", data,
                "\n :: ", "setData = ", setData, // For onchange
                "\n :: ", "reminderSchema = ", reminderSchema,
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
                        { data && reminderSchema && utils.val.isObject( reminderSchema ) && (
                            <FormGenerator
                                debug={ debug }
                                data={ data }
                                setData={ setData }
                                initialData={ data ?? dialogInitialData }
                                refData={ refData }
                                schema={ reminderSchema }
                                onChange={ ( e ) => {
                                    const { name, value } = e.target;
                                    if ( data && Object.keys( data ).includes( name ) ) {
                                        if ( handleChange ) handleChange( name, value, data, setData );
                                        setReminderData( { ...data, [ name ]: value } );
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
    };










    // NOTIFICATIONS FUNCTIONS // 

    // Create a new notification when a reminder's recurrenceRules values line up with current date/time
    const handleCreateNotificationByReminderId = async ( id, date ) => {
        if ( id && date ) {
            let result = await createNotificationByReminderId( {
                id: id,
                triggerDate: date,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            console.log( 'useMessage :: notification functions :: handleCreateNotificationByReminderId :: result = ', result );
            if ( result ) {
                return result;
            }
            else {
                return null;
            }
        }
    };

    const handleFetchNotificationsByReminderId = async ( id ) => {
        // Tries to get all notifications created by a given reminder
        if ( id && date ) {
            let result = await fetchNotificationsOfReminderId( {
                id: id,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            console.log( 'useMessage :: notification functions :: handleFetchNotificationsByReminderId :: result = ', result );
            if ( result ) {
                return result;
            }
            else {
                return null;
            }
        }
    };



    // Create a new Notification data item.
    const handleCreateNotification = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let result = await createNotification( {
                data: {
                    ...data,
                    workspaceId: workspaceId,
                    userId: user?.id,
                },
                stateSetter: ( data ) => {
                    setNotificationData( [ ...( utils.val.isValidArray( notificationData, true ) ? notificationData : [] ), data ] );
                },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            // setNotificationData( result );

            console.log( 'useMessage :: notification functions :: handleCreateNotification :: result = ', result );
            if ( result && utils.val.isObject( result ) ) {
                handleCancel(); // Close modal and reset global variables. 
                return result;
            }
            else {
                return null;
            }
        }
    };

    // Update an existing Notification data point
    const handleUpdateNotification = async ( id, data ) => {
        // let id = data?._id;
        console.log( 'useNotification :: handleUpdateNotification :: data = ', data, " :: ", "id = ", id );
        if ( id ) {
            let result = await updateNotification( {
                id,
                data,
                stateSetter: ( result ) => {
                    setNotificationData( notificationData?.map( ( n, i ) => ( n?._id === data?._id ? result : n ) ) );
                },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result ) ) {
                handleCancel();
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'useNotification :: handleUpdateNotification :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'useNotification :: handleUpdateNotification :: ERROR: id must be defined.' );
            return null;
        }
    };

    const handleTrashNotification = async ( id ) => {
        let result = await handleUpdateNotification( { id, data: { inTrash: true } } );
        console.error( 'useNotification :: handleTrashNotification :: ERROR: Something went wrong, the server returned no result.' );
        return result;
    };

    const handleRecoverNotification = async ( id ) => {
        let result = await handleUpdateNotification( { id, data: { inTrash: false } } );
        console.error( 'useNotification :: handleRecoverNotification :: ERROR: Something went wrong, the server returned no result.' );
        return result;
    };

    // Clone a notification entry.
    const handleCloneNotification = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;
            setNotificationData( [ { ...data, _id: "CLONE_ID_TEMP" }, ...( utils.val.isValidArray( notificationData, true ) ? notificationData : [] ) ] );

            let clonedNotification = await createNotification( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                stateSetter: ( data ) => ( setNotificationData( [ ...( utils.val.isValidArray( notificationData, true ) ? notificationData : [] ), data ] ) ),
            } );

            if ( clonedNotification ) {
                // Result not null, successful. Insert into list.
                handleCancel();
            }
        }
    };

    // Delete a specific Notification data item, with a confirmation request preventing misclicks. 
    const handleDeleteNotification = async ( id ) => {
        if ( window.confirm( 'Are you sure you want to delete this Notification?' ) ) {
            try {
                let result = await deleteNotification( {
                    id,
                    successCallback: handleSuccessCallback,
                    errorCallback: handleErrorCallback,
                    stateSetter: () => {
                        setNotificationData( notificationData?.filter( ( item ) => item?._id && item?._id !== id ) );
                    },
                } );
                if ( result ) {
                    return true;
                }
            } catch ( error ) {
                console.error( 'Error deleting Notification:', error );
            }
        }
    };



    return {
        // Handler functions - Reminders
        getResultData,
        buildDialog,
        handleGetSchemas,
        handleFetchAllReminders,
        getSchemaForDataType,
        handleFetchReminderById,
        handleCloneReminder,
        handleCreateReminder,
        handleUpdateReminder,
        handleDeleteReminderStart,
        handleDeleteReminder,

        // Handler functions - Notifications
        handleFetchAllNotifications,
        handleCreateNotificationByReminderId,
        handleFetchNotificationsByReminderId,
        handleCreateNotification,
        handleUpdateNotification,
        handleRecoverNotification,
        handleTrashNotification,
        handleDeleteNotification,
        handleCloneNotification,

        handleCancel,

        // Config values
        columns,

        // State variables
        dialogType, setDialogType,
        dialogData, setDialogData,
        reminderSchema, setReminderSchema,
        notificationSchema, setNotificationSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,

    };
};

export default useMessage;

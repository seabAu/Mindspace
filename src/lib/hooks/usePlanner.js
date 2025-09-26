import { useCallback, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import API from '../services/api';
import { ToastAction } from '@/components/ui/toast';
import { toast } from 'sonner';
import * as utils from 'akashatools';
import {
    createEvent,
    fetchEvents,
    fetchEventsInDateRange,
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
    fetchPlanners,
    fetchPlannerById,
    createPlanner,
    updatePlanner,
    deletePlanner,
} from '../services/plannerService';
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
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import { Button } from '@/components/ui/button';
import DatePicker, { DateRangePicker } from '@/components/Calendar/DatePicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormGenerator from '@/components/Form/FormGenerator';
import { ArrowBigUpIcon, Delete, Edit, FileQuestion, FolderOpen, Plus, X } from 'lucide-react';
import { buildSelect, handleSchema2InitialData, validateSubmittedData } from '../utilities/input';
import { twMerge } from 'tailwind-merge';
import { addDays, differenceInDays } from 'date-fns';
import { DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from '../config/config';
import { DATE_PICKER_OPTIONS } from '../config/constants';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import { Switch } from '@/components/ui/switch';
import { arrSafeTernary, isArrSafe } from '../utilities/data';
import { useFormDialog } from '../providers/FormDialogContext';

// const API = axios.create( {
//     baseURL: 'http://localhost:4000/',
//     headers: {
//         "x-auth-token": localStorage.getItem( "mindspace-app-token" ), // token,
//         "Content-type": "application/json",
//         "Access-Control-Allow-Origin": "*"
//     }
// } );

// NOTE :: **Each component that calls this hook gets its own independent copy of the state**. This is a core React principle - hooks maintain isolated state per component instance. ComponentA and DialogComponent are using completely different instances of the state variables, even though they're calling the same hook. When ComponentA calls `setIsOpen(true)`, it only updates its own local copy of `isOpen`, not the one in DialogComponent.

const API_BASE_URL = '/api/app/planner'; // Base URL for notes API
const usePlanner = ( useSuccessToast = true ) => {
    // const [ events, setEvents ] = useState( [] );
    // const [ error, setError ] = useState( null );
    // const [ loading, setLoading ] = useState( false );
    // const [ calendars, setCalendars ] = useState( [] );

    const {
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        schemas, setSchemas, getSchema,
        data, getData, setData,
        user,
        debug, setDebug,
        // error,
        // setError,
        // loading,
        // setLoading,
    } = useGlobalStore();

    const {
        // Planner
        requestFetchPlanners, setRequestFetchPlanners,
        plannerData, setPlannerData,
        addPlanner: addPlannerData,
        updatePlanner: updatePlannerData,
        deletePlanner: deletePlannerData,

        // Calendar
        requestFetchCalendars, setRequestFetchCalendars,
        calendarsData, setCalendarsData,
        calendarsEventsData, setCalendarsEventsData,
        selectedCalendar, setSelectedCalendar,
        addCalendar: addCalendarData,
        updateCalendar: updateCalendarData,
        deleteCalendar: deleteCalendarData,

        // Events
        requestFetchEvents, setRequestFetchEvents,
        eventsData, setEventsData,
        selectedDate, setSelectedDate,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        selectedEvent, setSelectedEvent,
        addEvent: addEventData,
        updateEvent: updateEventData,
        deleteEvent: deleteEventData,
        sortEvents,
        getEventById,
        getEventByDate,
        eventTypes, setEventTypes,

        // Loading & Errors
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        error, setError,
        loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError( useSuccessToast );

    // const {
    //     dialogInitialData, setDialogInitialData,
    //     dialogDataType, setDialogDataType,
    //     dialogSchema: dialogDataSchema, setDialogSchema: setDialogDataSchema,
    //     dialogType, setDialogType,
    //     dialogData, setDialogData,
    //     isOpen,
    // } = useFormDialog();

    // Schema for converting OUR event schema to the usePlanner event schema.
    const conversionEventSchema = {
        workspaceId: 'workspaceId',
        calendarId: 'calendarId',
        // relatedEventIds: ,
        // participantIds: ,
        // categories: ,
        start: 'start',
        end: 'end',
        timezone: 'tzo',
        isAllDay: 'allDay',
        isActive: 'active',
        // isRecurring: '',
        recurrenceRules: 'rrules',
        title: 'title',
        description: 'description',
        location: 'location',
        // notes: ,
        _id: 'id',
        // reminders: ,
        // createdAt: ,
        // updatedAt: ,
    };

    // Modal state values
    const [ selected, setSelected ] = useState( null );
    const [ dialogType, setDialogType ] = useState( 'none' ); // NONE | VIEW | EDIT | ADD | DELETE | GOTO
    const [ dialogDataType, setDialogDataType ] = useState( 'event' ); // 'event' | 'calendar' | 'log'
    const [ dialogDataSchema, setDialogDataSchema ] = useState( null );
    const [ dialogData, setDialogData ] = useState( null );
    const [ dialogInitialData, setDialogInitialData ] = useState( null ); // For create-new event modal
    const [ gotoDate, setGotoDate ] = useState( false );
    const [ showGotoDialog, setShowGotoDialog ] = useState( false );
    const [ open, setOpen ] = useState( false );
    const [ simplifiedForm, setSimplifiedForm ] = useState( true );
    const [ isNotesSidebarOpen, setIsNotesSidebarOpen ] = useState( false );

    // Schemas
    const [ plannerSchema, setPlannerSchema ] = useState( null );
    const [ eventSchema, setEventSchema ] = useState( null );
    const [ calendarSchema, setCalendarSchema ] = useState( null );

    // const [ dialogConfig, setDialogConfig ] = useState( {
    //     type: 'none',
    //     data: null,
    //     dataType: 'none',
    //     initialData: null,
    //     schema: [],
    //     open: false,
    //     onSubmitCallback: () => { console.log( 'Planner.jsx :: dialogConfig object :: default onSubmitCallback called.' ); },
    //     onChangeCallback: () => { console.log( 'Planner.jsx :: dialogConfig object :: default onChangeCallback called.' ); },
    //     onCancelCallback: () => { console.log( 'Planner.jsx :: dialogConfig object :: default onCancelCallback called.' ); },
    // } );

    // Fetch data schema on component mount
    const handleGetSchemas = () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            setEventSchema( getSchema( 'event' ) );
            setCalendarSchema( getSchema( 'calendar' ) );
            setPlannerSchema( getSchema( 'planner' ) );
            return schemas?.app?.planner;
        }
        console.log( 'usePlanner.js :: handleGetSchemas called.' );
    };

    const getSchemaForDataType = ( type ) => {
        // handleGetSchemas(); // Make sure latest schemas are loaded.
        // if ( schemas && utils.val.isObject( schemas ) ) {
        if ( schemas && utils.val.isObject( schemas ) && schemas?.app && schemas?.app?.planner ) {
            switch ( type ) {
                case 'event':
                    return ( schemas?.app?.planner?.event );
                case 'calendar':
                    return ( schemas?.app?.planner?.calendar );
                case 'planner':
                    return ( schemas?.app?.planner?.planner );
                default:
                    return null;
            }
        }
        else {
            console.log( 'usePlanner.js :: getSchemaForDataType called :: error: type was invalid :: type = ', type );
        }
        console.log( 'usePlanner.js :: getSchemaForDataType called.' );
    };

    const handleConvertEvents = ( eventsToConvert, convertedEvents = [] ) => {
        let events = [];
        if ( utils.val.isValidArray( eventsToConvert, true ) ) {
            let eventsDataTemp = mapObj2Obj(
                eventsToConvert,
                conversionEventSchema,
            );
            eventsDataTemp.forEach( ( ev, index ) => {
                let e = { ...ev };
                if ( e?.start ) { e.start = formatDateTime( e.start ); }
                if ( e?.end ) { e.end = formatDateTime( e.end ); }

                events.push( e );
            } );
            return [
                ...( isArrSafe( eventsDataTemp ) ? eventsDataTemp : [] ),
                ...( isArrSafe( convertedEvents ) ? convertedEvents : [] ),
            ];
        }

        return [
            ...( isArrSafe( events ) ? events : [] ),
            ...( isArrSafe( convertedEvents ) ? convertedEvents : [] ),
        ];
    };

    const handleCloneSubmit = async ( data, dataType = 'event' ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let res;
            switch ( dataType ) {
                case 'event':
                    res = await createEvent( {
                        workspaceId,
                        data,
                        // successCallback: handleSuccessCallback,
                        successCallback: ( data ) => {
                            if ( data ) setEventsData( [ data, ...( /* Array.isArray( eventsData ) && eventsData.length > 0 */isArrSafe( eventsData ) ? eventsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'calendar':
                    res = await createCalendar( {
                        data,
                        // errorCallback: handleErrorCallback,
                        successCallback: ( data ) => {
                            if ( data ) setCalendarsData( [ data, ...( /* Array.isArray( calendarsData ) && calendarsData.length > 0 */isArrSafe( calendarsData ) ? calendarsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                /* case 'log':
                    res = await createLog( {
                        data,
                        // successCallback: handleSuccessCallback,
                        successCallback: ( data ) => {
                            if ( data ) setLogsData( [ data, ...( isArrSafe( logsData ) ? logsData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break; */
                case 'planner':
                    res = await createPlanner( {
                        data,
                        // successCallback: handleSuccessCallback,
                        successCallback: ( data ) => {
                            if ( data ) setPlannerData( [ data, ...(/*  Array.isArray( plannerData ) && plannerData.length > 0 */isArrSafe( plannerData ) ? plannerData : [] ) ] );
                        },
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                default:
                    res = null;
                    break;
            }

            if ( res ) {
                console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                // setData( data?.filter( ( item ) => item?._id !== id ) );
                return res;
            }
            else {
                console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                return null;
            }

            if ( clonedEvent ) {
                // Result not null, successful.
                // Insert into list. Try to insert right AFTER the cloned item.
                let events = [ ...eventsData ];
                let clonedEventIndex = events?.findIndex( ( event ) => ( event?._id === data?._id ) );
                if ( clonedEventIndex ) {
                    // setEventsData( [ ...eventsData, clonedEvent ] );
                    events.splice( clonedEventIndex, 0, clonedEvent );
                    setEventsData( events );
                }
                else {
                    // Just put it at the end. 
                    setEventsData( [ ...eventsData, clonedEvent ] );
                }

                handleCancel();
            }
        }
    };

    const handleClone = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            // onFinish( data );
            let clonedEvent = await createEvent( {
                workspaceId,
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            if ( clonedEvent ) {
                // Result not null, successful.
                // Insert into list. Try to insert right AFTER the cloned item.
                let events = [ ...eventsData ];
                let clonedEventIndex = events?.findIndex( ( event ) => ( event?._id === data?._id ) );
                if ( clonedEventIndex ) {
                    // setEventsData( [ ...eventsData, clonedEvent ] );
                    events.splice( clonedEventIndex, 0, clonedEvent );
                    setEventsData( events );
                }
                else {
                    // Just put it at the end. 
                    setEventsData( [ ...eventsData, clonedEvent ] );
                }

                handleCancel();
            }
        }
    };

    const handleDeleteStart = async ( id, data, setData, dataType = 'event' ) => {
        // Deletes object with _id "id" in data and sets the new Data on successful confirm and send.
        console.log(
            'usePlanner.js :: handleDeleteStart :: Asking user if want to delete document: ',
            id, data, setData, dataType
        );
        if ( window.confirm( 'Are you sure you want to delete this document?' ) ) {
            return handleDeleteSubmit( id, data, setData, dataType );
        } else {
            handleCancel();
        }
    };

    const handleDeleteSubmit = async ( id, data, setData, dataType = 'event' ) => {
        console.log( 'usePlanner.js :: handleDeleteSubmit :: Deleting: ', id, data, setData );
        try {
            let res;
            switch ( dataType ) {
                case 'event':
                    res = await deleteEvent( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                case 'calendar':
                    res = await deleteCalendar( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                // case 'log':
                //     res = await deleteLog( {
                //         id,
                //         successCallback: handleSuccessCallback,
                //         errorCallback: handleErrorCallback,
                //     } );
                //     break;
                case 'planner':
                    res = await deletePlanner( {
                        id,
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    break;
                default:
                    res = null;
                    break;
            }

            if ( res ) {
                console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                setData( data?.filter( ( item ) => item?._id !== id ) );
                return res;
            }
            else {
                console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
                return null;
            }



            // let result = await deleteEvent( {
            //     id,
            //     successCallback: handleSuccessCallback,
            //     errorCallback: handleErrorCallback,
            // } );
            // if ( result === null ) {
            //     let deleteItem = data?.find( ( item ) => item._id === id );
            //     setData( data?.filter( ( item ) => item?._id !== id ) );
            // }
            // }
        } catch ( error ) {
            console.error( 'Error deleting doc of type ', dataType, ': ', error );
        } finally {
            // Cleanup afterward.
            handleCancel();
        }
    };

    const handleInputChange = ( e, isEdit = false ) => {
        const { id, name, value } = e.target;
        if ( isEdit ) { setDialogData( { ...dialogData, [ name ]: value } ); } // Editing mode.
        else { setDialogData( { ...dialogData, [ name ]: value } ); } // New item mode.
    };

    const handleChange = ( field, value, data, setData ) => {
        if ( data && setData ) setData( { ...data, [ field ]: value } );
        else setDialogData( { ...dialogData, [ field ]: value } );
    };

    const handleInitializeData = ( dataType = 'event' ) => {
        // TODO :: Replace this with a schema and input.js initializeFromSchema call to generate initial data. 
        // if ( tilsu )

        const typeSchema = getSchema( dataType );
        const refData = getData();

        if ( utils.val.isDefined( typeSchema ) && utils.val.isObject( typeSchema ) ) {
            let initialValues = handleSchema2InitialData( { schema: typeSchema, refData: refData } );

            initialValues = {
                ...initialValues,
                userId: user?.id,
                workspaceId: workspaceId ?? activeWorkspace?._id,
            };
            console.log( "usePlanner :: handleInitializeData :: initial Data = ", initialValues, " :: ", "schema used = ", typeSchema );
            return initialValues;
        }
    };

    const handleCreateStart = ( data, dataType = "event" ) => {
        if ( !utils.val.isDefined( data ) && dataType === 'event' ) { data = initializeEvent( data ); }
        else {
            // data = handleInitializeData( dataType );
        }

        const schema = getSchema( dataType );
        if ( schema ) {
            // Add essential fields we already have values for.
            if ( schema?.hasOwnProperty( 'organizerId' ) ) { data[ 'organizerId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'userId' ) ) { data[ 'userId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'workspaceId' ) ) { data[ 'workspaceId' ] = workspaceId; }
            if ( schema?.hasOwnProperty( 'plannerId' ) ) {
                if ( plannerData && utils.val.isValidArray( plannerData, true ) ) {
                    data[ 'plannerId' ] = plannerData?.[ 0 ]?._id;
                }
                else {
                    data[ 'plannerId' ] = null;
                }
            }
            if ( schema?.hasOwnProperty( 'calendarId' ) ) {
                if ( calendarsData && utils.val.isValidArray( calendarsData, true ) ) {
                    data[ 'calendarId' ] = calendarsData?.[ 0 ]?._id;
                }
                else {
                    data[ 'calendarId' ] = null;
                }
            }
        }

        if ( data ) {
            setSelected( data );
            setDialogDataType( dataType );
            setDialogDataSchema( schema );
            setDialogType( 'add' );
            setDialogInitialData( data );
            setDialogData( data );
            console.log(
                'usePlanner',
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

        console.log( "usePlanner :: handleCreateSubmit :: data = ", data, " :: ", "dataType = ", dataType, " :: ", "isCloned = ", isCloned, " :: ", "typeSchema = ", typeSchema, " :: ", "validatedData = ", validatedData );


        switch ( dataType ) {
            case 'event':
                res = await handleCreateEvent( validatedData );
                // if ( utils.val.isDefined( res ) ) { setEventsData( [ ...eventsData, res ] ); }
                break;
            case 'calendar':
                res = await handleCreateCalendar( validatedData );
                // if ( utils.val.isDefined( res ) ) { setCalendarsData( [ ...calendarsData, res ] ); }
                break;
            // case 'log':
            //     res = await handleCreateLog( validatedData );
            //     // if ( utils.val.isDefined( res ) ) { setLogsData( [ ...logsData, res ] ); }
            //     break;
            case 'planner':
                res = await handleCreatePlanner( validatedData );
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

    const handleCreateEvent = async ( data ) => {
        // Send data to server, and push results (if valid) to the local events list.
        if ( data ) {
            let result = await createEvent( {
                workspaceId,
                data: { ...data, workspaceId: workspaceId },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            console.log(
                'usePlanner',
                ' :: ', 'handleCreateEvent',
                ' :: ', 'data = ', data,
                ' :: ', 'result = ', result,
            );
            if ( result ) {
                // let newEventData = handleConvertEvents( data );
                let newEventData = mapObj2Obj( result, conversionEventSchema );
                console.log(
                    'usePlanner :: handleCreateEvent',
                    ' :: ', 'data = ', data,
                    ' :: ', 'result = ', result,
                    ' :: ', 'Converted! :: newEventData = ', newEventData,
                    ' :: ', 'eventsData = ', eventsData,
                );
                setEventsData( [ result, ...eventsData ] );

                // let eventsDataTemp = mapObj2Obj( [ result ], conversionEventSchema );
                handleCancel();
                return result;
            }
            else {
                return null;
            }
        }
    };

    const handleEditStart = ( data, dataType = "event" ) => {
        if ( data ) {
            setSelected( data );
            setDialogData( data );
            setDialogInitialData( data );
            if ( dataType === 'event' ) setSelectedEvent( data );
            setDialogDataType( dataType );
            setDialogDataSchema( getSchemaForDataType( dataType ) );
            setDialogType( 'edit' );
            console.log(
                'usePlanner',
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
            case 'event':
                res = await handleUpdateEvent( validatedData );
                break;
            case 'calendar':
                res = await handleUpdateCalendar( validatedData );
                break;
            // case 'log':
            //     res = await handleUpdateLog( validatedData );
            //     break;
            case 'planner':
                res = await handleUpdatePlanner( validatedData );
                break;
            default:
                res = null;
                break;
        }

        if ( res ) {
            console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return res;
        }
        else {
            console.log( "usePlanner :: handleEditSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "dataType = ", dataType, " :: ", "result = ", res );
            return null;
        }
        // handleCancel();
    };

    const handleUpdateEvent = async ( data ) => {
        if ( data ) {
            let eventId = data?._id;
            let result = await updateEvent( {
                workspaceId,
                eventId,
                data,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            console.log(
                'usePlanner',
                ' :: ', 'handleUpdateEvent',
                ' :: ', 'data = ', data,
                ' :: ', 'result = ', result,
            );
            if ( result ) {
                let updatedEventData = mapObj2Obj( data, conversionEventSchema );
                console.log(
                    'usePlanner',
                    ' :: ', 'handleUpdateEvent',
                    ' :: ', 'data = ', data,
                    ' :: ', 'Converted!',
                    ' :: ', 'updatedEventData = ', updatedEventData,
                );

                // Update the globally saved events data. Make sure to use our schema, not usePlanner's.
                /* setEventsData( [
                    ...eventsData.filter( ( e ) => e?._id !== result?._id ),
                    result,
                ] ); */
                setEventsData( eventsData?.map( ( e, i ) => ( e?._id === result?._id ? result : e ) ) );

                handleCancel();

                // Return the converted data for the calendar to actually use.
                return updatedEventData;
            }
            else { return null; }
        }
    };

    const handleGetUpcomingEventsData = () => {
        if ( utils.val.isValidArray( eventsData, true ) ) {
            return (
                eventsData
                    .filter( ( e ) => (
                        new Date( e?.start ) >= new Date(
                            upcomingEventsRange
                                ? upcomingEventsRange?.startDate
                                // : Date.now() + ( upcomingEventsRange?.numDays ?? 7 ) * 24 * 60 * 60 )
                                : addDays( new Date( upcomingEventsRange?.startDate ), ( upcomingEventsRange?.numDays ?? 7 ) ) )
                    ) )
                    .map( ( e ) => ( {
                        title: e?.title,
                        pages: [ ...Object.keys( e ).map( ( key, index ) => ( { title: `${ key }: ${ e?.[ key ] }`, detail: `${ e?.[ key ] }` } ) ) ]
                    } ) )
            );
        }
        else {
            return [];
        }
    };

    const handleFilterEventsByActiveCalendar = ( events, calendars ) => {
        if ( utils.val.isValidArray( events, true ) && utils.val.isValidArray( calendars, true ) ) {
            // First get which calendars are active. 
            let calendarIds = calendars?.map( ( cal, index ) => {
                if ( cal && cal?.isActive === true && cal?._id ) { return cal?._id; }
            } );

            // With the IDs of the active calendars, filter out any events that don't have that id. 
            return events.filter( ( ev, index ) => ( ev && ev?.calendarId && calendarIds.includes( ev?.calendarId ) ) );
        }
    };

    const handleOpen = ( data, dataType = 'event' ) => {
        if ( data ) {
            setDialogData( data );
            setDialogInitialData( data );
            setSelected( data );
            switch ( dataType ) {
                case 'date':
                    setSelectedDate( data );
                    break;
                case 'event':
                    setSelectedEvent( data );
                    break;
                case 'calendar':
                    setSelectedCalendar( data );
                    break;
                case 'planner':
                    setSelected( data );
                    break;
                default:
                    break;
            }

            setDialogDataType( dataType );
            setDialogDataSchema( getSchemaForDataType( dataType ) );
            setDialogType( 'view' );
            console.log(
                'usePlanner',
                ' :: ', 'handleOpen',
                ' :: ', 'data = ', data,
                ' :: ', 'dataType = ', dataType,
            );
        }
    };

    const handleCancel = () => {
        // Cleanup.
        console.log( 'usePlanner :: handleCancel called. Current dialogDataType = ', dialogDataType, " :: ", "Current dialogType = ", dialogType );
        setSelectedEvent( null );
        setDialogType( 'none' );
        setDialogDataType( 'none' );
        setDialogInitialData( null );
        setDialogData( null );
        setDialogDataSchema( null );
    };

    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// CALENDARS /////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////

    const handleCloneCalendar = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;
            let clonedCalendar = await createCalendar( {
                workspaceId,
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            if ( clonedEvent ) {
                // Result not null, successful. Insert into list.
                setCalendarsData( [
                    ...calendarsData,
                    clonedCalendar
                ] );

                handleCancel();
            }
        }
    };

    const handleCreateCalendar = async ( data ) => {
        // Send data to server, and push results (if valid) to the local events list.
        if ( data ) {
            let result = await createCalendar( {
                data: { ...data, workspaceId: workspaceId },
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            console.log(
                'usePlanner :: handleCreateCalendarSubmit :: data = ', data,
                ' :: ', 'result = ', result,
            );
            if ( result ) {
                // Update the globally saved events data. Make sure to use our schema, not usePlanner's.
                if ( utils.val.isValidArray( calendarsData, true ) ) {
                    setCalendarsData( [
                        ...calendarsData?.filter( ( c ) => c?._id !== result?._id ),
                        result,
                    ] );
                    handleCancel();
                }

                // Return the converted data for the calendar to actually use.
                return result;
            }
        }
    };

    const handleUpdateCalendar = async ( data ) => {
        // Send data to server, and push results (if valid) to the local events list.
        if ( data ) {
            let result = await updateCalendar( {
                data,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );
            if ( result ) {
                // Update the globally saved events data. Make sure to use our schema, not usePlanner's.
                if ( utils.val.isValidArray( calendarsData, true ) ) {
                    // setCalendarsData( [
                    //     ...calendarsData?.filter( ( c ) => c?._id !== result?._id ),
                    //     result,
                    // ] );
                    setCalendarsData( calendarsData?.map( ( item, i ) => ( item?._id === result?._id ? result : item ) ) );

                    handleCancel();
                }

                // Return the converted data for the calendar to actually use.
                return result;
            }
        }
    };

    // Delete a specific calendar
    const handleDeleteCalendar = async ( data ) => {
        if ( window.confirm( 'Are you sure you want to delete this calendar?' ) ) {
            try {
                if ( utils.ao.has( data, '_id' ) ) {
                    let id = data?._id;
                    let result = await deleteCalendar( {
                        id,
                        // StateSetter
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    if ( result ) {
                        // Success, remove from local list.
                        setCalendarsData( [ ...calendarsData.filter( ( c ) => c?._id !== id ) ] );
                    }
                }
            } catch ( error ) {
                console.error( 'Error deleting calendar:', error );
            }
        }
    };

    // Fetch a single log by its ID
    const handleFetchCalendarById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        let result = await fetchCalendar( {
            workspaceId: workspaceId,
            id,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );

        return result;
    };

    const handleToggleActive = async ( calendar ) => {
        console.log( 'Toggling calendar: ', calendar );
        // Get currently active workspace and set its 'active' value to false, send to server.
        let isActive = calendar?.isActive || false;
        let result = await updateCalendar( {
            data: { ...calendar, isActive: !isActive },
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        if ( utils.val.isValidArray( calendarsData, true ) ) {
            let updatedCalendars = calendarsData.map( ( c, index ) => {
                if ( c?._id === calendar?._id ) { if ( result ) { return result; } } // The one we clicked on
                else { return c; } // All other calendars.
            } );

            setCalendarsData( updatedCalendars );
        }
    };

    // Function to SWITCH which object in an array is the active one.
    const handleChangeActive = async ( {
        data, setData,
        updateAPICall,
        activeFieldName = 'active', errorCallback,
        successCallback,
    } ) => {
        // Get currently active workspace and set its 'active' value to false, send to server.
        if ( utils.val.isValidArray( data, true ) ) {
            let updatedData = [];
            data?.forEach( async ( item ) => {
                if (
                    item
                    && Object.keys( item ).includes( activeFieldName )
                    && item?._id === data?._id
                    && item[ activeFieldName ] === false
                ) {
                    // Set this one active. Replace with updated document.
                    updatedData.push( { ...workspace, active: true } );
                    let result = await updateAPICall( {
                        id: item._id,
                        data: { ...item, active: true },
                        successCallback,
                        errorCallback,
                    } );
                    setData( [ ...data.map( ( item ) => { if ( item?._id === result?._id ) { return result; } else { return w; } } ) ] );
                } else {
                    // All others.
                    if ( item?.active ) {
                        // Set this one inactive.
                        updatedData.push( { ...item, active: false } );
                        let result = await updateAPICall( {
                            id: item._id,
                            data: { ...item, active: false },
                            successCallback,
                            errorCallback,
                        } );
                        setData( [ ...data.map( ( item ) => { if ( item?._id === result?._id ) { return result; } else { return w; } } ) ] );
                    } else {
                        // Do nothing.
                        updatedData.push( item );
                    }
                }
            } );

            if ( debug ) console.log( 'updatedData = ', updatedData );
        }

        setData( updatedData );
    };

    // On workspace ID change, fetch events and other data.
    // console.log( "WorkspaceId changed to: ", workspaceId );
    const handleGetEventsData = async () => {
        const res = await fetchEvents( {
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner.jsx :: Fetching events data for new workspaceId :: events = ', res );
        if ( res && utils.val.isValidArray( res, true ) ) {
            setEventsData( res );
            return res;
        }
        else {
            return null;
        }
    };

    const handleGetCalendarsData = async () => {
        const res = await fetchCalendars( {
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner.jsx :: Fetching calendar data for new workspaceId :: calendar = ', res );
        if ( utils.val.isValidArray( res, true ) ) { setCalendarsData( [ ...res ] ); }
        else { setCalendarsData( [ res ] ); }
    };

    const handleGetPlannersData = async () => {
        const res = await fetchPlanners( {
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner.jsx :: Fetching planners data for new workspaceId :: PLANNERS = ', res );
        setPlannerData( arrSafeTernary( res ) );
    };

    const handleGetCalendarsWithEvents = async () => {
        const res = await fetchCalendarsWithEvents( {
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner.jsx :: Fetching planner data for new workspaceId :: plannerevents = ', res );
        setCalendarsEventsData( res );
    };

    // On workspace ID change, fetch events and other data.
    // console.log( "WorkspaceId changed to: ", workspaceId );
    const handleGetEventsInDateRangeData = async ( {
        workspaceId,
        startDate,
        endDate,
        numDays,
    } ) => {
        if ( !workspaceId ) {
            handleErrorCallback( 'Error fetching upcoming events: WorkspaceId is required.' );
        }
        if ( !startDate ) {
            // No date given, assume today.
            startDate = new Date( Date.now() );
        }
        if ( !endDate ) {
            // No date given, assume 7 days from now.
            if ( !numDays ) numDays = 7;
            endDate = new Date( Date.now() + numDays * 24 * 60 * 60 );
        }
        const res = await fetchEventsInDateRange( {
            workspaceId,
            startDate,
            endDate,
            stateSetter: setUpcomingEventsData,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log(
            'usePlanner.jsx :: handleGetEventsInDateRangeData :: Fetching upcoming events data for new workspaceId :: events = ', res,
            " :: ", "given args = [", workspaceId, startDate, endDate, numDays, "]"
        );
        setUpcomingEventsData( res );
    };








    // Fetch a single planner by its ID
    const handleFetchPlannerById = async (
        id,
        // stateSetter,
        // successCallback,
        // errorCallback,
    ) => {
        return await fetchPlannerById( {
            id,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
    };

    // Fetch all logs for a specific workspace
    const handleFetchPlanners = async () => {
        const res = await fetchPlanners( {
            workspaceId,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner.jsx :: Fetching planners data for new workspaceId :: PLANNERS = ', res );
        setPlannerData( utils.val.isValidArray( res, true ) ? [ ...res ] : [ res ] );
    };

    // Create a new planner
    const handleCreatePlanner = async ( data ) => {
        console.log( 'usePlanner :: handleCreatePlanner :: data = ', data );
        let result = await createPlanner( {
            data: {
                ...data,
                workspaceId: workspaceId,
                userId: user?.id,
            },
            stateSetter: ( data ) => {
                setPlannerData( [ ...( isArrSafe( plannerData ) ), data ] );
            },
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log( 'usePlanner :: handleCreatePlanner :: result = ', result );

        if ( result && utils.val.isObject( result ) && result?.hasOwnProperty( '_id' ) ) {
            // let newEventData = mapObj2Obj( result, conversionEventSchema );
            // setEventsData( [ newEventData, ...eventsData ] );

            // let temp = [ ...( Array.isArray( plannerData ) ? plannerData : [] ), result ];
            // let planners = temp.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) );
            // setPlannerData( planners );
            // addPlannerData( result );
            handleCancel(); // Close modal and reset global variables. 
            return result;
        }
        else {
            return null;
        }
    };

    // Update an existing planner
    const handleUpdatePlanner = async ( data ) => {
        let id = data?._id;
        if ( id ) {
            console.log( 'usePlanner :: handleUpdatePlanner :: data = ', data, " :: ", "id = ", id );
            let result = await updatePlanner( {
                id,
                data,
                successCallback: handleSuccessCallback,
                errorCallback: handleErrorCallback,
            } );

            if ( result && utils.val.isObject( result, true ) ) {
                let temp;
                // if ( utils.val.isValidArray( plannerData, true ) ) {
                //     temp = plannerData.filter( ( l ) => l?._id !== id );
                // }
                // temp.concat( result );
                // let planners = temp.sort(
                //     ( a, b ) => new Date( b?.date ) - new Date( a?.date ),
                // );
                // setPlannerData( planners );

                setPlannerData(
                    plannerData
                        ?.map( ( item, i ) => ( item?._id === result?._id ? result : item ) )
                        ?.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) )
                );

                handleCancel(); // Close modal and reset global variables. 
                return result;
            }
            else {
                // Don't cancel in this case; let the user fix any issues and retry.
                console.error( 'usePlanner :: handleUpdatePlanner :: ERROR: Something went wrong, the server returned no result.' );
                return null;
            }
        }
        else {
            console.error( 'usePlanner :: handleUpdatePlanner :: ERROR: id must be defined.' );
            return null;
        }
    };

    // Clone a planner entry.
    const handleClonePlanner = async ( data ) => {
        if ( utils.val.isObject( data ) ) {
            let valtemp = { ...data };
            valtemp = utils.ao.filterKeys( data, [ "_id" ] );
            data = valtemp;

            let cloned = await createPlanner( {
                data,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
                // stateSetter: ( data ) => ( setPlannerData( [ ...plannerData, data ] ) ),
            } );

            if ( cloned ) {
                // Result not null, successful. Insert into list.
                setPlannerData( [ ...plannerData, cloned ] );
                handleCancel();
            }
        }
    };

    // Delete a specific planner
    const handleDeletePlanner = async ( data ) => {
        if ( window.confirm( 'Are you sure you want to delete this planner?' ) ) {
            try {
                if ( utils.ao.has( data, '_id' ) ) {
                    let id = data?._id;
                    let result = await deletePlanner( {
                        id,
                        // null, // StateSetter
                        successCallback: handleSuccessCallback,
                        errorCallback: handleErrorCallback,
                    } );
                    if ( result ) {
                        // Success, remove from local list.
                        setPlannerData( [ ...plannerData.filter( ( l ) => l?._id !== id ) ] );
                    }
                }
            } catch ( error ) {
                console.error( 'Error deleting planner:', error );
            }
        }
    };













    const handleChangeEventsRangeSelect = ( value ) => {
        console.log( "usePlanner.js :: handleChangeEventsRangeSelect :: ", "value = ", value );
        // let start = new Date( upcomingEventsRange?.startDate );
        // const day = start.getDate();
        // const month = start.getMonth() + 1;
        // const year = start.getFullYear();
        // const h = start.getHours();
        // const m = start.getMinutes();
        setUpcomingEventsRange( {
            numDays: value,
            startDate: new Date( upcomingEventsRange?.startDate ),
            // endDate: new Date( new Date( upcomingEventsRange?.startDate ) + new Date( value * 24 * 60 * 60 ) ),
            endDate: addDays( new Date( upcomingEventsRange?.startDate ), value ),
        } );
    };

    const filterEventsByActiveCalendar = ( events, calendars ) => {
        if (
            utils.val.isValidArray( events, true ) &&
            utils.val.isValidArray( calendars, true )
        ) {
            // First get which calendars are active.
            let calendarIds = calendars?.map( ( cal, index ) => {
                if ( cal && cal?.isActive === true && cal?._id ) {
                    return cal?._id;
                }
            } );

            // With the IDs of the active calendars, filter out any events that don't have that id.
            return events.filter(
                ( ev, index ) =>
                    ev &&
                    ev?.calendarId &&
                    calendarIds.includes( ev?.calendarId ),
            );
        }
    };

    // useEffect( () => {
    //     console.log( "usePlanner :: upcomingEventsRange updated :: upcomingEventsRange = ", upcomingEventsRange );
    // }, [ upcomingEventsRange ] );

    const handleChangeEventsRangeDates = ( value ) => {
        console.log( "usePlanner.js :: handleChangeEventsRangeDates :: value = ", value );
        if ( value && value?.from && value?.to ) {
            let numDays = value?.numDays;
            let start = new Date( value?.from );
            let end = new Date( value?.to );
            console.log( "usePlanner.js :: handleChangeEventsRangeDates :: start = ", formatDateTime( new Date( start ) ), " :: ", "end = ", formatDateTime( new Date( end ) ) );
            let one_day = 1000 * 60 * 60 * 24;
            let Difference_In_Time = start.getTime() - end.getTime();
            let Difference_In_Days = Math.round( Difference_In_Time / ( 1000 * 3600 * 24 ) );

            // Check agasinst current values to see which value was just changed. Only one is changed at a time. 
            let changedVarName;
            if ( start.getTime() === new Date( upcomingEventsRange?.startDate ).getTime() ) {
                if ( numDays === upcomingEventsRange?.numDays ) changedVarName = 'end';
                else changedVarName = 'num';
            }
            if ( end.getTime() === new Date( upcomingEventsRange?.endDate ).getTime() ) {
                if ( numDays === upcomingEventsRange?.numDays ) changedVarName = 'start';
                else changedVarName = 'num';
            }
            if ( numDays ) {
                if ( start.getTime() === new Date( upcomingEventsRange?.startDate ).getTime() ) { changedVarName = 'end'; }
                else if ( end.getTime() === new Date( upcomingEventsRange?.endDate ).getTime() ) { changedVarName = 'start'; }
            }

            if ( changedVarName ) {
                switch ( changedVarName ) {
                    case 'start':
                        setUpcomingEventsRange( {
                            // ...upcomingEventsRange,
                            startDate: formatDateTime( new Date( start ) ),
                            endDate: formatDateTime( new Date( upcomingEventsRange?.endDate ) ),
                            numDays: differenceInDays( new Date( start ), new Date( upcomingEventsRange?.endDate ) ),
                        } );
                        break;
                    case 'end':
                        setUpcomingEventsRange( {
                            // ...upcomingEventsRange,
                            startDate: formatDateTime( new Date( upcomingEventsRange?.startDate ) ),
                            endDate: formatDateTime( new Date( end ) ),
                            numDays: Math.abs( differenceInDays( new Date( upcomingEventsRange?.startDate ), new Date( end ) ) ),
                        } );
                        break;
                    case 'num':
                        // Add the num to the start date. 
                        // When changing numDays, all start dates are relative to today's date.
                        setUpcomingEventsRange( {
                            // ...upcomingEventsRange,
                            // startDate: formatDateTime( new Date( Date.now() ) ),
                            // endDate: formatDateTime( addDays( new Date( Date.now() ), numDays ) ),
                            // numDays: numDays,
                            startDate: formatDateTime( new Date( start ) ),
                            endDate: formatDateTime( new Date( end ) ),
                            numDays: Math.abs( numDays ),
                        } );
                        break;
                    default:
                        setUpcomingEventsRange( {
                            // ...upcomingEventsRange,
                            // startDate: new Date( value?.from ),
                            // endDate: new Date( value?.to ),
                            // startDate: formatDate( new Date( value?.from ) ),
                            // endDate: formatDate( new Date( value?.to ) )
                            startDate: formatDateTime( new Date( start ) ),
                            endDate: formatDateTime( new Date( end ) ),
                            numDays: Math.abs( differenceInDays( new Date( start ), new Date( end ) ) ),
                        } );
                }
            }

            // setUpcomingEventsRange( {
            //     // ...upcomingEventsRange,
            //     // startDate: new Date( value?.from ),
            //     // endDate: new Date( value?.to ),
            //     // startDate: formatDate( new Date( value?.from ) ),
            //     // endDate: formatDate( new Date( value?.to ) )
            //     startDate: formatDateTime( new Date( start ) ),
            //     endDate: formatDateTime( new Date( end ) ),
            //     numDays: differenceInDays( new Date( start ), new Date( end ) ),
            // } );
        }
    };

    const initializeEvent = ( eventData, className = '', icon = '' ) => {
        console.log( "usePlanner :: initializeEvent :: eventData = ", eventData, " :: " );
        let initialEventData = {};
        let today = new Date();
        const options = {
            // weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        if ( utils.val.isObject( eventData ) ) {
            let start = formatDateTime( eventData?.startStr );
            // if ( start ) start = start.split( 'T' )[ 0 ];
            let end = formatDateTime( eventData?.endStr );
            // if ( end ) end = end.split( 'T' )[ 0 ];
            let date = formatDateTime( eventData?.dateStr );
            // if ( date ) date = date.split( 'T' )[ 0 ];
            initialEventData = {
                // id: createEventId(),
                id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
                title: eventData?.title ? eventData?.title : 'New Event',
                description: eventData?.description ? eventData?.description : 'New Event Description',
                // date: date, // new Date( date ).toLocaleString(),
                // date: toMoment( date, calendarApi ),
                // start: eventData?.startStr.split( 'T' )[ 0 ], // new Date( eventData?.start ).yyyymmdd, // eventData?.startStr,
                // start: new Date( start ).toUTCString(), // Intl.allLocales, options ), // new Date( start ).toLocaleString(),
                // start: start ? start : new Date( today ).toISOString(), // Right now
                startTime: new Date( start ).toLocaleTimeString(), // Intl.allLocales, options ),
                // start: toMoment( start, calendarApi ),
                // end: eventData?.endStr.split( 'T' )[ 0 ], // new Date( eventData?.end ).yyyymmdd, // eventData?.endStr,
                // end: new Date( end ).toUTCString(), // Intl.allLocales, options ), // new Date( end ).toLocaleString(),
                // end: end ? end : new Date( today + 24 * 60 * 60 * 60 ).toISOString(), // +1 day,,
                endTime: new Date( end ).toLocaleTimeString(), // Intl.allLocales, options ),
                // end: toMoment( end, calendarApi ),
                allDay: eventData?.allDay ? eventData?.allDay : false,
                className: className,
                icon: icon,
                // dow: [ 1, 2, 4 ], // Mon, Tue, Thur
            };

            // Add on rrule info if it exists.
            if ( utils.ao.has( eventData, 'rrule' ) ) {
                initialEventData.rrule = {
                    freq: eventData?.rrule?.freq
                        ? eventData?.rrule?.freq
                        : 'weekly',
                    interval: eventData?.rrule?.interval
                        ? eventData?.rrule?.interval
                        : 5,
                    byweekday: eventData?.rrule?.byweekday
                        ? eventData?.rrule?.byweekday
                        : [ 'mo', 'fr' ],
                    dtstart: eventData?.rrule?.dtstart
                        ? eventData?.rrule?.dtstart
                        : '2024-02-01T10:30:00', // will also accept '20120201T103000'
                    until: eventData?.rrule?.until
                        ? eventData?.rrule?.until
                        : '2024-06-01', // will also accept '20120201'
                };
            }
        }

        else {
            // No initializing info, make it up. 
            // let calendarApi = calendarRef.current.getApi();
            // let start = toMoment( today, calendarApi ).format();
            // let end = toMoment( new Date( today + 24 * 60 * 60 * 60 ), calendarApi ).format();
            let start = new Date( today ).toISOString(); // Right now
            let end = new Date( today + 24 * 60 * 60 * 60 ).toISOString(); // +1 day
            initialEventData = {
                // id: createEventId(),
                id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),

                title: 'New Event',
                description: '',
                // date: m.format(),
                // start: Date.now() + "T12:00:00",
                // end: Date.now() + "T24:00:00",

                // date: new Date( Date.now() + 24 * 60 * 60 * 60 ).toISOString(),
                start: formatDateTime( start ),
                // start: start,
                end: formatDateTime( end ),
                // end: end,

                // rrule: {
                //     freq: 'weekly',
                //     interval: 5,
                //     byweekday: [ 'mo', 'fr' ],
                //     dtstart: '2024-02-01T10:30:00', // will also accept '20120201T103000'
                //     until: '2024-06-01', // will also accept '20120201'
                // },

                allDay: false,
                className: 'fc-bg-default',
                icon: "",
            };

            if ( debug === true )
                console.log( 'FullCalendar :: handleInitNewEvent :: today = ', today, ' :: ', nitialEventData = ', initialEventData' );
        }
        return initialEventData;
    };

    const handleSubmitRouting = ( data, handleSubmit, dialogType = 'event', dialogDataType = 'add' ) => {
        if ( handleSubmit ) {
            // Use the provided function since it exists.
            handleSubmit( data );
        }
        else {
            // Use fallback functions for each datatype.
            if ( dialogDataType === 'log' ) {
                if ( dialogType === 'edit' ) { handleEditSubmit( data, 'log' ); }
                else if ( dialogType === 'add' ) { handleCreateSubmit( data, 'log' ); }
            }
            else if ( dialogDataType === 'calendar' ) {
                if ( dialogType === 'edit' ) { handleEditSubmit( data, 'calendar' ); }
                else if ( dialogType === 'add' ) { handleCreateSubmit( data, 'calendar' ); }
            }
            else if ( dialogDataType === 'event' ) {
                if ( dialogType === 'edit' ) { handleEditSubmit( data, 'event' ); }
                else if ( dialogType === 'add' ) { handleCreateSubmit( data, 'event' ); }
            }
        }
    };

    const buildEventDialog = ( {
        initialData, setInitialData,
        dialogOpen, setDialogOpen,
        handleSubmit,
        handleChange,
        dialogType = 'add',
        dataType = 'event', // Name of type of data being represented.
        dialogTrigger,
    } ) => {
        let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;

        console.log( 'usePlanner :: buildEventDialog :: initialData = ', initialData );
        if ( utils.val.isDefined( initialData ) ) {
            return (
                <Dialog
                    title={ title }
                    open={ dialogOpen }
                    onOpenChange={ setDialogOpen }
                    className={ `flex flex-col` }
                >

                    { dialogTrigger && ( <DialogTrigger asChild>
                        <Button
                            className={ `select-none` }
                            variant='outline'>
                            { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }{ `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                        </Button>
                    </DialogTrigger> ) }

                    <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />

                    <DialogContent
                        className={ `flex flex-col sm:max-w-[${ 680 }px] max-h-modal min-w-[65vw] overflow-y-auto` }>
                        <DialogHeader>
                            <DialogTitle>{ `${ title }` }</DialogTitle>
                            <DialogDescription>{ `${ description }` }</DialogDescription>
                        </DialogHeader>

                        <div className={ `flex flex-col w-full` }>
                            <div className={ `flex flex-row w-full` }>
                                <div className={ `flex flex-col w-1/2` }>
                                    <div className='flex flex-col justify-center p-0 items-start'>
                                        <Label htmlFor='calendarId' className='h-2 p-0 text-right'>Calendar</Label>

                                        { utils.val.isValidArray( calendarsData ) &&
                                            buildSelect( {
                                                // placeholder: 'a Calendar',
                                                placeholder: calendarsData?.find( ( cal ) => ( initialData?.calendarId === cal?._id ) )?.title ?? 'Pick a calendar',
                                                opts: calendarsData?.map( ( item, index ) => ( { name: item?.title, value: item?._id } ) ),
                                                value: initialData?.calendarId,
                                                initialData: initialData?.calendarId,
                                                key: 'calendarId',
                                                // handleChange: handleChange,
                                                handleChange: ( key, value ) => {
                                                    setInitialData( { ...initialData, calendarId: value } );
                                                },
                                                className: '',
                                            } ) }
                                    </div>

                                    <div className='flex flex-col justify-center p-0 items-start'>
                                        <Label htmlFor='plannerId' className='h-2 p-0 text-right'>Planner</Label>

                                        { utils.val.isValidArray( plannerData ) &&
                                            buildSelect( {
                                                placeholder: plannerData?.find( ( planner ) => ( initialData?.plannerId === planner?._id ) )?.title ?? 'Pick a Planner',
                                                opts: plannerData?.map( ( item, index ) => ( { name: item?.title, value: item?._id } ) ),
                                                value: initialData?.plannerId,
                                                initialData: initialData?.plannerId,
                                                key: 'plannerId',
                                                // handleChange: handleChange,
                                                handleChange: ( key, value ) => {
                                                    setInitialData( { ...initialData, plannerId: value } );
                                                },
                                                className: '',
                                            } ) }
                                    </div>

                                    <div className='flex flex-col justify-center p-0 items-start'>
                                        <Label htmlFor='title' className='h-2 p-0 text-right'>Title</Label>

                                        <Input
                                            type='text'
                                            id='title'
                                            name='title'
                                            value={ initialData?.title ? initialData?.title : '' }
                                            className='col-span-3'
                                            onChange={ ( e ) => {
                                                const { name, value } = e.target;
                                                setInitialData( { ...initialData, [ name ]: value } );
                                            } }
                                        />
                                    </div>

                                    <div className='flex flex-row justify-stretch p-0 items-start'>

                                        <div className='flex flex-col w-1/2 max-w-1/2 justify-center p-0 items-start gap-x-2'>
                                            <Label htmlFor='start' className='h-2 text-right'>Start Time</Label>
                                            <Input
                                                type={ `datetime-local` }
                                                id='start'
                                                name='start'
                                                // defaultValue={ initialData?.start ? formatDateTime( initialData?.start ) : '' }
                                                value={ initialData.start ? formatDateTime( new Date( initialData.start ) ) : null }
                                                className='col-span-3'
                                                onChange={ ( e ) => {
                                                    const { name, value } = e.target;
                                                    let val = new Date( value );
                                                    setInitialData( { ...initialData, [ name ]: val } );
                                                } }
                                            />
                                        </div>

                                        <div className='ex flex-col w-1/2 max-w-1/2 justify-center p-0 items-start'>
                                            <Label htmlFor='end' className='h-2 p-0 text-right'>End Time</Label>
                                            <Input
                                                type={ `datetime-local` }
                                                id='end'
                                                name='end'
                                                // defaultValue={ initialData?.end ? formatDateTime( initialData?.end ) : '' }
                                                value={ initialData.end ? formatDateTime( new Date( initialData.end ) ) : null }
                                                className='col-span-3'
                                                onChange={ ( e ) => {
                                                    const { name, value } = e.target;
                                                    let val = new Date( value );
                                                    setInitialData( { ...initialData, [ name ]: val } );
                                                } }
                                            />
                                        </div>

                                    </div>

                                    <div className='flex flex-col justify-center p-0 items-start'>
                                        <Label htmlFor='date' className='h-2 p-0 text-right'>{ `Date` }</Label>

                                        <DatePicker
                                            placeholder={ "Event Date" }
                                            className={ `p-0 m-0 w-full z-1000 relative` }
                                            usePopover={ true }
                                            useSelect={ true }
                                            selectKey={ '' }
                                            selectValue={ initialData?.numDays ?? 7 }
                                            selectOnChange={ ( k, v ) => { } }
                                            options={ DATE_PICKER_OPTIONS }
                                            selectedDate={ {
                                                from: formatDateTime( new Date( initialData?.start ) ),
                                                to: formatDateTime( new Date( initialData?.end ) )
                                            } }
                                            setSelectedDate={ ( value ) => {
                                                setInitialData( {
                                                    ...initialData,
                                                    start: formatDateTime( value?.from ),
                                                    end: formatDateTime( value?.to )
                                                } );
                                            } }
                                            mode={ `range` }
                                            showOutsideDays={ true }
                                        />

                                    </div>

                                    <div className='flex flex-col justify-center p-0 items-start'>
                                        <div className='flex flex-row w-full p-1 justify-between items-start' onClick={ ( e ) => { setInitialData( { ...initialData, allDayEvent: !initialData?.allDayEvent || false } ); } }>
                                            <Label htmlFor='event-field-all-day-event' className='h-2 p-0 text-right'>{ `All Day Event` }</Label>
                                            <Switch
                                                className={ '' }
                                                id={ 'event-field-all-day-event' }
                                                key={ 'event-field-all-day-event' }
                                                name={ 'event-field-all-day-event' }
                                                size={ 5 }
                                                required={ false }
                                                placeholder={ 'All Day Event?' }
                                                defaultChecked={ initialData?.allDayEvent ?? false }
                                                onCheckedChange={ ( checked ) => ( setInitialData( { ...initialData, allDayEvent: !!checked } ) ) }
                                            />
                                        </div>



                                        <div className='flex flex-row w-full p-1 justify-between items-start' onClick={ ( e ) => { setInitialData( { ...initialData, isRecurring: !initialData?.isRecurring || false } ); } }>
                                            <Label htmlFor='event-field-recurring-toggle' className='h-2 p-0 text-right'>{ `Recurring Event` }</Label>
                                            <Switch
                                                className={ '' }
                                                id={ 'event-field-recurring-toggle' }
                                                key={ 'event-field-recurring-toggle' }
                                                name={ 'event-field-recurring-toggle' }
                                                size={ 5 }
                                                required={ false }
                                                placeholder={ 'Recurring?' }
                                                defaultChecked={ initialData?.isRecurring ?? false }
                                                onCheckedChange={ ( checked ) => ( setInitialData( { ...initialData, isRecurring: !!checked } ) ) }
                                            />
                                        </div>



                                        <div className='flex flex-row w-full p-1 justify-between items-start' onClick={ ( e ) => { setInitialData( { ...initialData, reminderEnabled: !initialData?.reminderEnabled || false } ); } }>
                                            <Label htmlFor='event-field-reminder-toggle' className='h-2 p-0 text-right'>{ `Reminders` }</Label>
                                            <Switch
                                                className={ '' }
                                                id={ 'event-field-reminder-toggle' }
                                                key={ 'event-field-reminder-toggle' }
                                                name={ 'event-field-reminder-toggle' }
                                                size={ 5 }
                                                required={ false }
                                                placeholder={ 'Remind me?' }
                                                defaultChecked={ initialData?.reminderEnabled ?? false }
                                                onCheckedChange={ ( checked ) => ( setInitialData( { ...initialData, reminderEnabled: !!checked } ) ) }
                                            />
                                        </div>
                                    </div>
                                </div>






                                <div className={ `flex flex-col w-1/2` }>
                                    <div className={ `h-full max-h-full items-start justify-center p-2 py-4 relative overflow-auto rounded-xl` }>
                                        <QuillEditor
                                            className={ `` }
                                            useThemeDropdown={ false }
                                            useSaveButton={ false }
                                            // useSaveButton={ dialogType === 'edit' }
                                            content={ initialData?.description }
                                            setContent={ ( value ) => ( setInitialData( { ...initialData, description: value } ) ) }
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>

                        <DialogFooter className='sm:justify-start'>
                            <DialogClose className={ `w-full justify-between rounded-xl shadow-3xl shadow-primary-100` } asChild>
                                <Button
                                    variant={ `outline` }
                                    type='submit'
                                    onClick={ () => {
                                        console.log( 'usePlanner :: submit button :: handleSubmit :: initialData = ', initialData ); handleSubmit( initialData );
                                    } }>
                                    { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                    { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                </Button>
                            </DialogClose>
                            <Button
                                className={ `self-end rounded-xl shadow-3xl shadow-primary-100` }
                                variant={ `destructive` }
                                onClick={ () => {
                                    console.log( 'usePlanner :: submit button :: handleSubmit :: initialData = ', initialData ); handleSubmit( initialData );
                                } }>
                                <X />{ `Cancel` }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }
    };

    const buildGoToDialog = ( {
        date, setDate,
        dialogOpen, setDialogOpen,
        handleSubmit,
        handleChange,
        dialogTrigger,
    } ) => {
        return (
            <Dialog
                title={ 'Go To Date' }
                open={ dialogOpen }
                onOpenChange={ setDialogOpen }
                className={ `flex flex-col` }
            >

                { dialogTrigger && ( <DialogTrigger asChild><Button className={ `select-none` } variant="outline">{ <ArrowBigUpIcon /> }</Button></DialogTrigger> ) }

                <DialogContent className={ `flex flex-col sm:max-w-[${ 425 }px] max-h-modal overflow-y-auto ` }>
                    <DialogHeader>
                        <DialogTitle>
                            { 'Go To Date' }
                        </DialogTitle>
                        <DialogDescription>
                            { 'Choose a date to jump to!' }
                        </DialogDescription>
                    </DialogHeader>

                    <div className={ `flex flex-col gap-2` }>
                        <div className="flex flex-col justify-center p-0 items-start">
                            <Label htmlFor="date" className="text-right">{ `Go To Date` }</Label>

                            <DatePicker
                                id={ `date` }
                                name={ `date` }
                                usePopover={ true }
                                useSelect={ true }
                                selected={ date }
                                onSelect={ setDate }
                                selectKey={ 'date' }
                                selectValue={ date }
                                selectOnChange={ handleChange }
                                options={ [] }
                                selectedDate={ date }
                                setSelectedDate={ ( date ) => {
                                    setDate( date );
                                    if ( handleChange ) handleChange( date );
                                } }
                                mode={ 'single' }
                                showOutsideDays={ true }
                                className={ `rounded-md border` }
                                events={ [ eventsData ] } // Array of existing events to show highlighted on the calendar.
                                footer={ <></> }
                            />
                        </div>

                    </div>

                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="submit" onClick={ ( date ) => { handleSubmit( date ); } }>
                                { `Go To Date` }
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    // This is a layout style schema for event forms that offers a simplified, essentials-only layout.
    // The form builder will create the fields in the order in which they appear below.  
    // The db schema will be sorted and filtered according to this arrangement. 
    const eventFormEssentialSchema = {
        // "plannerId",
        // "relatedEventIds",
        "title": { label: "Title", fieldType: "String", inputType: "text" },
        "description": { label: "Description", fieldType: "String", inputType: "text" },
        "notes": { label: "Notes", fieldType: "String", inputType: "wysiwyg" },
        "workspaceId": { label: "Workspace", fieldType: "ObjectId", inputType: "text" },
        "organizerId": { label: "Organizer", fieldType: "ObjectId", inputType: "text" },
        "calendarId": { label: "Calendar", fieldType: "ObjectId", inputType: "text" },
        "participantIds": { label: "Participants", fieldType: "[ObjectId]", inputType: "text" },
        "categories": { label: "Categories", fieldType: "[String]", inputType: "text" },
        "group": { label: "Group", fieldType: "String", inputType: "text" },
        "color": { label: "Color", fieldType: "String", inputType: "color" },
        "start": { label: "Start Time", fieldType: "Date", inputType: "datetime-local" },
        "end": { label: "End Time", fieldType: "Date", inputType: "datetime-local" },
        "timezone": { label: "Timezone", fieldType: "String", inputType: "text" },
        "location": { label: "Location", fieldType: "String", inputType: "text" },
        "isPinned": { label: "Pinned Event", fieldType: "Boolean", inputType: "switch" },
        "isAllDay": { label: "All Day", fieldType: "Boolean", inputType: "switch" },
        "isActive": { label: "Enabled", fieldType: "Boolean", inputType: "switch" },
        "isRecurring": { label: "Recurring", fieldType: "Boolean", inputType: "switch" },
        "reminderEnabled": { label: "Enable Reminder", fieldType: "String", inputType: "text" },
    };

    const calendarFormEssentialSchema = {
        "title": { label: 'Title', fieldType: 'String', inputType: 'text' },
        "description": { label: 'Description', fieldType: 'String', inputType: 'textarea' },

        "workspaceId": { label: "Workspace", fieldType: "ObjectId", inputType: "enum" },
        "plannerId": { label: "Planner", fieldType: "ObjectId", inputType: "enum" },
        "calendarId": { label: 'Calendar', fieldType: 'ObjectId', inputType: 'text' },
        "EventIds": { label: 'Events', fieldType: '[ObjectId]', inputType: 'enum' },

        "categories": { label: 'Categories', fieldType: '[String]', inputType: 'tags' },
        "filters": { label: 'Filters', fieldType: '[String]', inputType: 'tags' },
        "groups": { label: 'Groups', fieldType: '[String]', inputType: 'tags' },

        "isActive": { label: "Enabled", fieldType: "Boolean", inputType: "switch" },
        "inTrash": { label: 'In Trash', fieldType: "Boolean", inputType: "switch" },

        "color": { label: 'Color', fieldType: 'String', inputType: 'color' },
        "activeHours": { label: 'ActiveHours', fieldType: 'Object', inputType: 'object' },
        // "settings": { label: 'Settings', fieldType: '[Object]', inputType: '[Object]' },
        // "dailyHabits": { label: 'Daily Habits', fieldType: 'String', inputType: 'text' },
    };

    const plannerFormEssentialSchema = {
        "title": { label: 'Title', fieldType: 'String', inputType: 'text' },
        "description": { label: 'Description', fieldType: 'String', inputType: 'textarea' },

        "workspaceId": { label: "Workspace", fieldType: "ObjectId", inputType: "enum" },
        "EventIds": { label: 'Events', fieldType: '[ObjectId]', inputType: 'enum' },
        "calendarIds": { label: 'Calendars', fieldType: '[ObjectId]', inputType: 'enum' },

        "categories": { label: 'Categories', fieldType: '[String]', inputType: 'tags' },
        "filters": { label: 'Filters', fieldType: '[String]', inputType: 'tags' },
        "groups": { label: 'Groups', fieldType: '[String]', inputType: 'tags' },

        "isActive": { label: "Enabled", fieldType: "Boolean", inputType: "switch" },
        "inTrash": { label: 'In Trash', fieldType: "Boolean", inputType: "switch" },

        "color": { label: 'Color', fieldType: 'Color', inputType: 'color' },
        // "activeHours": { label: 'ActiveHours', fieldType: 'Object', inputType: 'object' },
        // "settings": { label: 'Settings', fieldType: '[Object]', inputType: '[Object]' },
        // "dailyHabits": { label: 'Daily Habits', fieldType: 'String', inputType: 'text' },
    };


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
        dataType = 'planner', // Name of type of data being represented.
        dialogTrigger,
        debug = false,
    } ) => {
        if ( debug === true )
            console.log(
                'usePlanner :: buildDialog :: args = ',
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
            case 'planner':
                simplifiedSchema = plannerFormEssentialSchema;
                break;
            case 'event':
                simplifiedSchema = eventFormEssentialSchema;
                break;
            case 'calendar':
                simplifiedSchema = calendarFormEssentialSchema;
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
                handleUpdate={ handleUpdate }
                handleClose={ handleClose }
                dialogType={ dialogType }
                dialogTrigger={ dialogTrigger }
                classNames={ '' }
                dialogClassNames={ '' }
                contentClassNames={ '' }
                simplifiedDataSchema={ simplifiedSchema ?? null }
                // useSimplifiedSchema={ simplifiedForm ?? true }
                useSimplifiedSchema={ false }
                useBadgesForStringArrays={ false }
            />
        );
    };

    const handleFetchPlannerData = useCallback(
        async () => {
            await handleGetPlannersData();
            await handleGetCalendarsData();
            await handleGetEventsData();
            if ( workspaceId ) {
                await handleGetEventsInDateRangeData( {
                    workspaceId,
                    startDate: upcomingEventsRange?.startDate,
                    endDate: upcomingEventsRange?.endDate,
                    numDays: upcomingEventsRange?.numDays,
                    ...upcomingEventsRange
                } );
            }
        }
        , [ workspaceId ]
    );

    const handleClearPlannerData = () => {
        setEventsData( [] );
        setPlannerData( [] );
        setCalendarsData( [] );
    };

    const handleInitializePlannerData = useCallback(
        async () => {
            if ( workspaceId ) {
                // Fetch data for this section of the app if it is empty. 
                console.log( "usePlanner :: handleInitializePlannerData :: workspaceId = ", workspaceId, " -> Initializing all data. " );
                if ( !utils.val.isValidArray( eventsData, true ) ) { handleGetEventsData(); }
                if ( !utils.val.isValidArray( plannerData, true ) ) { handleGetPlannersData(); }
                if ( !utils.val.isValidArray( calendarsData, true ) ) { handleGetCalendarsData(); }
                if ( !utils.val.isValidArray( upcomingEventsData, true ) ) {
                    handleGetEventsInDateRangeData( {
                        workspaceId,
                        startDate: upcomingEventsRange?.startDate,
                        endDate: upcomingEventsRange?.endDate,
                        numDays: upcomingEventsRange?.numDays,
                        ...upcomingEventsRange
                    } );
                }
            }
            else {
                // No workspace; clear all data. 
                console.log( "usePlanner :: handleInitializePlannerData :: no workspaceId -> Clearing all data. " );
                handleClearPlannerData();
            }
        }
        , [ user, workspaceId ]
    );


    return {
        // VARIABLES
        selected, setSelected,
        conversionEventSchema,
        getSchemaForDataType,
        handleGetSchemas,
        calendarFormEssentialSchema,
        plannerFormEssentialSchema,
        eventFormEssentialSchema,

        // HANDLER FUNCTIONS
        // >> enerci
        // >> Generic handlers
        handleFetchPlannerData,
        handleClearPlannerData,
        handleInitializeData,
        handleInitializePlannerData,
        handleCreateStart, handleCreateSubmit,
        handleEditStart, handleEditSubmit,
        handleDeleteStart, handleDeleteSubmit,

        handleOpen,
        handleClone,
        handleCancel,
        handleChange,
        handleCloneSubmit,
        handleInputChange,

        // >> Event handlers
        handleGetPlannersData,
        handleGetEventsData,
        handleGetUpcomingEventsData,
        filterEventsByActiveCalendar,
        handleFilterEventsByActiveCalendar,
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        handleCreateEvent,
        handleUpdateEvent,
        handleChangeEventsRangeSelect,
        handleChangeEventsRangeDates,

        // >> Calendar handlers
        handleGetCalendarsData,
        handleGetCalendarsWithEvents,
        handleGetEventsInDateRangeData,
        handleUpdateCalendar,
        handleCreateCalendar,
        handleCloneCalendar,
        handleDeleteCalendar,
        handleFetchCalendarById,

        // >> Planners handlers
        handleFetchPlannerById,
        handleFetchPlanners,
        handleCreatePlanner,
        handleUpdatePlanner,
        handleClonePlanner,
        handleDeletePlanner,

        handleSubmitRouting,

        // DIALOG MENUS
        buildEventDialog,
        buildGoToDialog,
        buildDialog,

        // INITIALIZERS
        initializeEvent,

        // GETTERS / SETTERS
        dialogDataSchema, setDialogDataSchema,
        eventSchema, setEventSchema,
        calendarSchema, setCalendarSchema,
        plannerSchema, setPlannerSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        showGotoDialog, setShowGotoDialog,
        gotoDate, setGotoDate,
        open, setOpen,
        // logDialogOpen, setLogDialogOpen,
        // isNotesSidebarOpen, setIsNotesSidebarOpen,
        // notesOpen, setNotesOpen, notesContent, setNotesContent,
        // isDrawerOpen, setIsDrawerOpen,

        // For opening the notes sidebar / drawer.
    };
};

export default usePlanner;

/* 
    const handleSpecificOnChange = ( data, dialogDataType, name, value ) => {
        switch ( dialogDataType ) {
            case 'event':
                setEventsData( { ...data, [ name ]: value } );
                break;
            case 'log':
                setLogsData( { ...data, [ name ]: value } );
                break;
            case 'calendar':
                setCalendarsData( { ...data, [ name ]: value } );
                break;
            case 'planner':
                setPlannerData( { ...data, [ name ]: value } );
                break;
            default:
                break;
        }
    };
*/

/*  const buildDialogOld = ( {
        data, setData, // For onChange
        refData,
        dataSchema,
        dialogOpen, setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'add',
        dataType = 'event', // Name of type of data being represented.   
        dialogTrigger,
        debug = false,
    } ) => {
        let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
        let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;

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

        // if ( debug === true )
        console.log( 'usePlanner :: buildDialog :: args = ', "\n :: ", "data = ", data,
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
                                data={ data }
                                setData={ setData }
                                initialData={ data ?? dialogInitialData }
                                refData={ refData }
                                schema={ dataSchema }
                                onChange={ ( e ) => {
                                    const { name, value } = e.target;
                                    if ( data && Object.keys( data ).includes( name ) ) {
                                        if ( handleChange ) handleChange( name, value, data, setData );
                                        setData( { data, [ name ]: value } );
                                    }
                                } }
                                onCancel={ () => handleCancel() }
                                onSubmit={ ( data ) => handleSubmit( data ) }
                                onUpdate={ ( updatedFormData ) => setData( updatedFormData ) } // Updating full form data externally whenever it changes internally.
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
                                    console.log(
                                        'usePlanner :: submit button :: handleSubmit :: dialogInitialData = ', dialogInitialData,
                                        " :: ", "data = ", data
                                    );
                                    handleSubmitRouting( data ?? dialogInitialData, handleSubmit, dialogType, dataType );
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
*/


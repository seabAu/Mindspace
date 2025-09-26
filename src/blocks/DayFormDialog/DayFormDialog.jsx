import React, { Component, useCallback, useEffect, useId, useRef, useState } from "react";
import * as utils from 'akashatools';
import { Button } from "@/components/ui/button";
import {
    ArrowBigLeft,
    ArrowBigRight,
    ArrowBigUpIcon,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Delete,
    Edit,
    EllipsisIcon,
    FileQuestion,
    FolderOpen,
    Forward,
    Plus,
    X
} from "lucide-react";
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
import usePlanner from "@/lib/hooks/usePlanner";
import DatePicker from "@/components/Calendar/DatePicker";
import { mapObj2Obj } from "@/lib/utilities/obj";
import { buildSelect, initializeValueFromSchema, typeToInitialDefault, validateSubmittedData } from "@/lib/utilities/input";
import { formatDateTime } from "@/lib/utilities/time";
import {
    createEvent,
    fetchEvents,
    fetchEventsInDateRange,
    fetchEvent,
    updateEvent,
    fetchCalendars,
    fetchEventsForCalendar,
    fetchCalendarsWithEvents,
    toggleCalendarEvent,
    createCalendar,
    fetchCalendar,
    updateCalendar,
    deleteCalendar,
} from "@/lib/services/plannerService";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import useGlobalStore from "@/store/global.store";
import usePlannerStore from "@/store/planner.store";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FormGenerator from "@/components/Form/FormGenerator";
import { DIALOG_TYPE_CLOSE_ICONS, DIALOG_TYPE_CLOSE_NAMES, DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from "@/lib/config/config";
import { caseCamelToSentence } from "@/lib/utilities/string";
import useTasksStore from "@/store/task.store";
import useTask from "@/lib/hooks/useTask";
import useNotes from "@/lib/hooks/useNotes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useMessage from "@/lib/hooks/useMessage";
import { ReminderFormMain } from "@/features/Remind/components/ReminderForm/reminder-form-main";
import useReflect from "@/lib/hooks/useReflect";


const DayFormDialog = ( {
    // title,
    // date = new Date( Date.now() ),
    initialData = {},
    isOpen = false,
    setIsOpen,
    onClose,
    // createEventSubmitCallback, createEventStartCallback,
    // createLogSubmitCallback, createLogStartCallback,
    // createCalendarSubmitCallback, createCalendarStartCallback,
    // createPlannerSubmitCallback, createPlannerStartCallback,
    // createTaskSubmitCallback, createTaskStartCallback,
    // children,
}, ...props ) => {

    const {
        // VARIABLES
        logSchema,
        eventSchema,
        plannerSchema,
        calendarSchema,
        initializeEvent,
        conversionEventSchema,
        eventFormEssentialSchema,
        plannerFormEssentialSchema,
        calendarFormEssentialSchema,

        handleCreateStart: handleCreateStartPlanner,
        handleCreateSubmit: handleCreateSubmitPlanner,

        handleEditStart: handleEditStartPlanner,
        handleEditSubmit: handleEditSubmitPlanner,
    } = usePlanner();

    const {
        handleCreateHabit: handleCreateHabitReflect,
        handleUpdateHabit: handleUpdateHabitReflect,
        handleCreateLog: handleCreateLogReflect,
        handleUpdateLog: handleUpdateLogReflect,
        logFormEssentialSchema,
    } = useReflect();

    const {
        taskSchema,
        taskFormEssentialSchema,
        handleCreateStart: handleCreateStartTask,
        handleCreateSubmit: handleCreateSubmitTask,
    } = useTask();

    const {
        reminderSchema,
        notificationSchema,
        handleCreateReminder,
        handleCreateNotification,
    } = useMessage();

    const {
        handleCreateFolderStart,
        handleCreateFolderSubmit,
        handleEditFolderStart,
        handleEditFolderSubmit,
        handleCreateFileStart,
        handleCreateFileSubmit,
        handleEditFileStart,
        handleEditFileSubmit,
    } = useNotes();

    const DayFormDataTypes = [
        'habit',
        'log',
        'event',
        'planner',
        'calendar',
        'task',
        'reminder',
        'notification'
    ];

    const formRef = useRef( null ); // Ref to call submit method on ReminderFormMain

    // Dialog menu for viewing an event info. 
    const getData = useGlobalStore( state => state.getData );
    const reloadData = useGlobalStore( state => state.reloadData );

    const schemas = useGlobalStore( state => state.schemas );
    const getSchema = useGlobalStore( state => state.getSchema );
    const debug = useGlobalStore( state => state.debug );
    const loading = useGlobalStore( state => state.loading );
    const setLoading = useGlobalStore( state => state.setLoading );
    const error = useGlobalStore( state => state.error );
    const setError = useGlobalStore( state => state.setError );
    const user = useGlobalStore( state => state.user );
    const workspaceId = useGlobalStore( state => state.workspaceId );

    const addPlannerData = usePlannerStore( state => state.addPlanner );
    const addCalendarData = usePlannerStore( state => state.addCalendar );
    const addEventData = usePlannerStore( state => state.addEvent );
    const addLogData = usePlannerStore( state => state.addLog );
    const addTaskData = useTasksStore( state => state.addTask );

    // const [ formData, setFormData ] = useState( initialData );
    const [ formData, setFormData ] = useState( null );
    const [ dataType, setDataType ] = useState( 'none' );
    const [ dataSchema, setDataSchema ] = useState( null );
    const [ dialogFormType, setDialogFormType ] = useState( 'none' );
    const [ dialogType, setDialogType ] = useState( 'none' );

    // Handles secondary staging of recurrence and reminder subforms. 
    // const [ isRecurring, setIsRecurring ] = useState( false );
    const [ reminderEnabled, setReminderEnabled ] = useState( false );
    const [ reminderData, setReminderData ] = useState( false );

    // Handles simplified schema usage. 
    const [ useSimplifiedSchema, setUseSimplifiedSchema ] = useState( false );
    const [ simplifiedSchema, setSimplifiedSchema ] = useState( null );


    // const [ parentId, setParentId ] = useState( null );
    const refData = getData();

    const handleCancel = () => {
        handleSelectAction( 'none' );
        setFormData( null );
        setIsOpen( false );
        setDataSchema( null );
        setDialogType( 'none' );
        setDialogFormType( 'none' );
        setReminderData( null );
        setReminderEnabled( false );
    };

    const handleCreateStart2 = ( dataType ) => {
        if ( dataType === 'event' ) handleCreateStartPlanner( {}, 'event' );
        else if ( dataType === 'log' ) handleCreateStartPlanner( {}, 'log' );
        else if ( dataType === 'calendar' ) handleCreateStartPlanner( {}, 'calendar' );
        else if ( dataType === 'planner' ) handleCreateStartPlanner( {}, 'planner' );
    };

    const handleSubmitForm = async ( data, type ) => {
        let result;
        // First, submit the original data depending on the type of dialog form. 
        if ( dialogType === 'add' ) {
            result = await handleCreateSubmit( data, type );
        }
        else if ( dialogType === 'edit' ) {
            // result = await handleCreateSubmit( data, type );
        }
        else if ( dialogType === 'delete' ) {
            // result = await handleCreateSubmit( data, type );
        }
        else {
            // handleCancel();
        }

        if ( debug === true ) console.log( "DayFormDialog :: HandleSubmitForm :: data = ", data, " :: ", "type = ", type, " :: ", "dialogType = ", dialogType, " :: ", "result = ", result );


        // Second, before exiting out, check if reminderEnabled exists in the data and is true. 
        // If true, suspend returning to the rest of the app and run a secondary form to create the reminder. 
        // This will pull in the reminder-form-main component into the dialog once initialized. 
        // When THAT submits, we send both documents to the server and hope for the best. 
        if ( result && utils.val.isObject( result ) ) {
            if ( result?.hasOwnProperty( 'reminderEnabled' ) ) {
                reloadData();
                let enabled = result?.reminderEnabled;
                if ( enabled ) {
                    // Reminder form is needed.
                    setReminderData( {
                        docType: dataType,
                        docId: result?._id ?? null,
                        title: result?.title ? `Reminder for ${ result.title }` : ``
                    } );
                    setReminderEnabled( true );

                    if ( debug === true ) console.log( "DayFormDialog :: HandleSubmitForm :: reminder is enabled :: reminder data = ", {
                        docType: dataType,
                        docId: result?._id ?? null,
                        title: result?.title ? `Reminder for ${ result.title }` : ``
                    } );
                }
            }
            else {
                handleCancel();
            }
        }
        else {
            // handleCancel();
        }
    };


    const handleSubmitReminderForm = async ( data ) => {
        if ( data ) {
            // We have some data from the reminder form and some from the original form. 
            let result = await handleCreateReminder( data );
            if ( result ) {
                // Success!
                handleCancel();
            }
            else {
                // Failure. Try again. 
            }
        }
    };

    const handleEditSubmit = async ( data, type ) => {
        let res;
        // let validatedData = utils.ao.removeKey( data, '_id' );
        let validatedData = validateSubmittedData( validatedData, dataSchema, false, true );
        if ( debug === true ) console.log( "DayFormDialog :: handleEditSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "type = ", type, " :: ", "dialogType = ", dialogType );




        try {
            switch ( type ) {
                case 'planner':
                    res = await handleEditSubmitPlanner( validatedData, type, false );
                    break;
                case 'event':
                    res = await handleEditSubmitPlanner( validatedData, type, false );
                    break;
                case 'calendar':
                    res = await handleEditSubmitPlanner( validatedData, type, false );
                    break;
                case 'log':
                    res = await handleUpdateLogReflect( validatedData, type, false );
                    break;
                case 'habit':
                    res = await handleUpdateHabitReflect( validatedData, type, false );
                    break;
                case 'task':
                    res = await handleCreateSubmitTask( validatedData, type, false );
                    break;
                case 'notes':
                case 'file':
                    res = await handleCreateFolderSubmit( validatedData, false );
                    break;
                case 'folder':
                    res = await handleCreateFileSubmit( validatedData, false );
                    break;
                case 'reminder':
                    res = await handleCreateReminder( validatedData, false );
                    break;
                case 'notification':
                    res = await handleCreateNotification( validatedData, false );
                    break;
                // case 'recurrence':
                //     res = await handleCreateFileSubmit( validatedData, false );
                //     break;
                default:
                    break;
            }

            if ( res ) {
                // Got a result back. 
                if ( debug === true ) console.log( 'DayFormDialog :: DayModal :: handleCreateSubmit :: type = ', type, ' :: ', 'res = ', res );
                return res;
            }
        } catch ( err ) {
            console.error( "Error creating data: ", err );
            return null;
        }
    };

    const handleCreateSubmit = async ( data, type ) => {
        let res;
        let validatedData = utils.ao.removeKey( data, '_id' );
        validatedData = validateSubmittedData( validatedData, dataSchema, false, true );
        if ( debug === true ) console.log( "DayFormDialog :: handleCreateSubmit :: data = ", data, " :: ", "validatedData = ", validatedData, " :: ", "type = ", type, " :: ", "dialogType = ", dialogType );

        try {
            switch ( type ) {
                case 'event':
                    res = await handleCreateSubmitPlanner( validatedData, type, false );
                    break;
                case 'log':
                    res = await handleCreateLogReflect( validatedData, type, false );
                    break;
                case 'habit':
                    res = await handleCreateHabitReflect( validatedData, type, false );
                    break;
                case 'calendar':
                    res = await handleCreateSubmitPlanner( validatedData, type, false );
                    break;
                case 'planner':
                    res = await handleCreateSubmitPlanner( validatedData, type, false );
                    break;
                case 'task':
                    res = await handleCreateSubmitTask( validatedData, type, false );
                    break;
                case 'notes':
                case 'file':
                    res = await handleCreateFolderSubmit( validatedData, false );
                    break;
                case 'folder':
                    res = await handleCreateFileSubmit( validatedData, false );
                    break;
                case 'reminder':
                    res = await handleCreateReminder( validatedData, false );
                    break;
                case 'notification':
                    res = await handleCreateNotification( validatedData, false );
                    break;
                // case 'recurrence':
                //     res = await handleCreateFileSubmit( validatedData, false );
                //     break;
                default:
                    break;
            }

            if ( res ) {
                // Got a result back. 
                if ( debug === true ) console.log( 'DayFormDialog :: DayModal :: handleCreateSubmit :: type = ', type, ' :: ', 'res = ', res );
                return res;
            }
        } catch ( err ) {
            console.error( "Error creating data: ", err );
            return null;
        }
    };

    const handleCreateStart = async ( data, type ) => {
        switch ( type ) {
            case 'event':
                handleCreateStartPlanner( data, type );
                break;
            case 'log':
                handleCreateStartPlanner( data, type );
                break;
            case 'calendar':
                handleCreateStartPlanner( data, type );
                break;
            case 'planner':
                handleCreateStartPlanner( data, type );
                break;
            case 'task':
                handleCreateStartTask( data, type );
                break;
            default:
                break;
        }
        if ( debug === true ) console.log( 'DayFormDialog :: DayModal :: handleStart :: type = ', type, ' :: ', 'data = ', data );
    };

    const initializeDataForType = ( type = 'event', schema ) => {
        // Create initial data.
        if ( !schema ) schema = getSchema( type );
        let initializedData = {};
        Object.keys( schema ).forEach( ( fieldSchemaKey ) => {
            const fieldSchema = schema?.[ fieldSchemaKey ];
            if ( fieldSchema ) {
                initializedData[ fieldSchemaKey ] = typeToInitialDefault(
                    fieldSchema?.type,
                    initialData?.[ fieldSchemaKey ] ?? null,
                    true
                );
            }
        } );
        // const initializedData = typeToInitialDefault( schema );

        if ( schema ) {
            // Add essential fields we already have values for.
            if ( schema?.hasOwnProperty( 'user' ) ) { initializedData[ 'user' ] = user; }
            if ( schema?.hasOwnProperty( 'userId' ) ) { initializedData[ 'userId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'workspaceId' ) ) { initializedData[ 'workspaceId' ] = workspaceId; }
        }

        if ( debug === true ) console.log( "DayFormDialog :: initializedData = ", initializedData );
        // setFormData( initializedData );
        return initializedData;
    };

    const handleSelectAction = ( type = 'event' ) => {
        switch ( type ) {
            case 'log':
                setDataSchema( getSchema( 'log' ) );
                setFormData( initializeDataForType( type ) );
                setDataType( 'log' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'event':
                setDataSchema( getSchema( 'event' ) );
                setFormData( initializeDataForType( type ) );
                setDataType( 'event' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'task':
                setDataSchema( getSchema( 'task' ) );
                setFormData( initializeDataForType( type ) );
                setDataType( 'task' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'planner':
                setDataSchema( getSchema( 'planner' ) );
                setFormData( initializeDataForType( type ) );
                setDataType( 'planner' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'calendar':
                setDataSchema( getSchema( 'calendar' ) );
                setFormData( initializeDataForType( type ) );
                setDataType( 'calendar' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'reminder':
                setDataSchema( getSchema( 'reminder' ) );
                setDataType( 'reminder' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                setFormData( initializeDataForType( type, getSchema( 'reminder' ) ) );
                break;
            case 'notification':
                setDataSchema( getSchema( 'notification' ) );
                setDataType( 'notification' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                setFormData( initializeDataForType( type, getSchema( 'notification' ) ) );
                break;
            case 'back':
                setDataSchema( null );
                setDataType( 'none' );
                setDialogType( 'none' );
                setDialogFormType( 'none' );
                setFormData( null );
                break;

            case 'none':
                setDataSchema( null );
                setDataType( type );
                setDialogType( 'none' );
                setDialogFormType( 'none' );
                setFormData( null );
                break;
            default:
                setDataSchema( null );
                setDataType( 'none' );
                setDialogType( 'add' );
                setDialogFormType( 'none' );
                setFormData( null );
                break;
        }
    };

    const handleChange = ( field, value ) => {
        setFormData( { ...formData, [ field ]: value } );
    };

    useEffect( () => {
        if ( debug === true ) console.log( "DayFormDialog :: formData is now = ", formData );
    }, [ formData ] );

    let date = new Date( Date.now() );
    if ( initialData && utils.val.isObject( initialData ) && initialData?.hasOwnProperty( 'date' ) ) {
        date = new Date( initialData?.date );
    }

    const handleChangeSchemaType = ( mode = false, type = 'event' ) => {
        if ( type ) {
            // If true, use the simplified schema. Create fresh data for the chosen schema. 
            setUseSimplifiedSchema( !!mode );
            let schema;
            // Type is the datatype of the schema. 
            switch ( type ) {
                case 'log':
                    if ( mode ) schema = logFormEssentialSchema;
                    else schema = getSchema( type );
                    break;
                case 'habit':
                    // if ( mode ) schema = logFormEssentialSchema; 
                    // No essential schema defined yet for habits. 
                    schema = getSchema( type );
                    break;
                case 'event':
                    if ( mode ) schema = eventFormEssentialSchema;
                    else schema = getSchema( type );
                    break;
                case 'planner':
                    if ( mode ) schema = plannerFormEssentialSchema;
                    else schema = getSchema( type );
                    break;
                case 'calendar':
                    if ( mode ) schema = calendarFormEssentialSchema;
                    else schema = getSchema( type );
                    break;
                case 'task':
                    if ( mode ) schema = taskFormEssentialSchema;
                    else schema = getSchema( type );
                    break;
                default:
                    break;
            }

            if ( schema ) {
                setDataSchema( schema );
                initializeDataForType( type, schema );
            }

            if ( mode ) {
                // Finally, as a backup, save the simplified schema in the state. 
                setSimplifiedSchema( schema );
            }
        }
    };

    if ( debug === true ) console.log( "DayFormDialog :: onComponentMount :: props = ", props );

    return (
        <>

            { isOpen === true && (
                <Dialog
                    open={ isOpen }
                    onClose={ onClose }
                    title={ `What do you want to do?` }
                    onOpenChange={ () => { handleCancel(); } }
                >
                    <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />

                    <DialogContent
                        className={ twMerge(
                            `flex flex-col max-h-modal w-full sm:max-w-[${ 100 }%] max-h-modal rounded-xl overflow-y-auto`,
                            `w-full h-auto max-h-modal flex flex-col`,
                            `transition-all ease-in-out duration-200`,
                            dialogType !== 'none' && `p-4 w-[70vw] min-w-[70vw] max-w-[70vw] sm:max-w-[${ 425 }px] max-h-modal`,
                            `w-full !min-w-[60vw] sm:max-w-[${ 525 }px] max-h-modal flex flex-col`,
                            `overflow-hidden p-4 overflow-y-hidden left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 `
                        ) }
                    >

                        { dialogType === 'none' ? (
                            <DialogHeader>
                                <DialogTitle>{ `What do you want to do?` }</DialogTitle>
                                <DialogDescription>{ `Create a new... for day: (${ new Date( date?.toLocaleDateString() ) })` }</DialogDescription>
                            </DialogHeader> )
                            : ( <DialogHeader className={ `` }>
                                <DialogTitle>
                                    { `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? caseCamelToSentence( dataType ) : `Event` }` }
                                </DialogTitle>
                                <DialogDescription>
                                    <div className={ `flex flex-col w-full h-auto` }>
                                        <div className={ `gap-4 px-2 w-full justify-stretch items-center flex flex-row` }>
                                            <Button
                                                size={ `sm` }
                                                className={ `px-2 py-1 w-auto p-2 rounded-lg border` }
                                                variant="primary"
                                                onClick={ ( e ) => {
                                                    e.preventDefault();
                                                    handleSelectAction( 'back' );
                                                } }
                                            >
                                                <div className={ `font-lg leading-8 font-sans flex flex-row justify-center items-center` }>
                                                    <ArrowBigLeft /> { `BACK` }
                                                </div>
                                            </Button>
                                            <div className={ `font-lg leading-8 font-sans` }>
                                                { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataType ? caseCamelToSentence( dataType ) : `Event` } for day: (${ new Date( date?.toLocaleDateString() ) })` }
                                            </div>
                                        </div>


                                        <div className='flex flex-row w-full p-1 justify-between items-start'>
                                            <Label htmlFor='dayform-toggle-advanced-schema-switch' className='h-2 p-0 text-right'>{ `Advanced Form` }</Label>
                                            <Switch
                                                className={ '' }
                                                id={ 'dayform-toggle-advanced-schema-switch' }
                                                key={ 'dayform-toggle-advanced-schema-switch' }
                                                name={ 'dayform-toggle-advanced-schema-switch' }
                                                size={ 5 }
                                                required={ false }
                                                placeholder={ 'Advanced Form' }
                                                defaultChecked={ !!useSimplifiedSchema ?? false }
                                                onCheckedChange={ ( checked ) => ( handleChangeSchemaType( checked, dataType ) ) }
                                            />
                                        </div>

                                    </div>
                                </DialogDescription>
                            </DialogHeader> ) }
                        <div className={ `gap-2 py-2 px-2 flex justify-stretch items-start h-full w-full overflow-auto` }>

                            { dialogType === 'none' ? (
                                <div className={ `flex flex-col items-stretch justify-stretch w-full h-full space-y-2` }>
                                    <div className={ `grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-2 w-full` }>

                                        { DayFormDataTypes.map( ( type, index ) => {
                                            return (
                                                <Button
                                                    size={ `sm` }
                                                    className={ `px-2 py-1 w-auto h-24 rounded-lg border` }
                                                    variant="primary"
                                                    onClick={ ( e ) => {
                                                        e.preventDefault();
                                                        if ( debug === true ) console.log( `DayFormDialog :: DayModal :: Callback for ${ type } clicked / called :: initialData = `, initialData );
                                                        handleSelectAction( type );
                                                    } }
                                                    disabled={ loading }
                                                >
                                                    <div className={ `font-lg leading-8 font-sans text-wrap self-start py-2` }>
                                                        { `Create ${ caseCamelToSentence( type ) }` }
                                                    </div>
                                                </Button>
                                            );
                                        } ) }
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={ handleCancel }
                                        className={ `px-2 py-1 w-full h-12 rounded-lg border bg-error/40` }
                                    >
                                        <div className={ `font-lg leading-8 font-sans` }>
                                            { `Cancel` }
                                        </div>
                                    </Button>
                                </div> )
                                : ( dataSchema && utils.val.isObject( dataSchema ) && (
                                    <div className={ `flex flex-col gap-2 w-full h-full` }>
                                        { reminderEnabled ? (
                                            <div className="flex-grow overflow-hidden">
                                                { reminderEnabled && reminderData && ( <ReminderFormMain
                                                    ref={ formRef } // Assign ref
                                                    onSave={ ( data ) => { handleSubmitReminderForm( data ); } } // onReminderCreated is the actual save function from parent
                                                    // onCancel is handled by DialogClose or onOpenChange
                                                    onCancel={ () => { } }
                                                    initialData={ reminderData }
                                                /> ) }
                                            </div>
                                        )
                                            : ( formData && ( <FormGenerator
                                                debug={ debug }
                                                // data={ formData ?? initialData }
                                                dataType={ dataType }
                                                data={ formData }
                                                initialData={ initialData }
                                                setData={ setFormData }
                                                refData={ refData }
                                                schema={ dataSchema }
                                                onUpdate={ ( updatedData ) => {
                                                    if ( updatedData && Object.keys( updatedData )?.length > 0 ) {
                                                        // if ( debug === true)console.log( "DayFormDialog :: FormGenerator Block :: onUpdate :: updated data = ", updatedData, " :: ", "formData = ", formData );
                                                        setFormData( updatedData );
                                                    }
                                                } }
                                                onChange={ ( e ) => {
                                                    const { name, value } = e.target;
                                                    // if ( debug === true)console.log( 'FormGenerator :: onChange triggered :: name, value = ', name, value );
                                                    if ( formData && Object.keys( formData ).includes( name ) ) {
                                                        handleChange( name, value );
                                                    }
                                                } }
                                                onCancel={ () => {
                                                    // handleSelectAction( 'none' );
                                                    handleCancel();
                                                } }
                                                onSubmit={ ( data ) => {
                                                    handleSubmitForm( formData, dataType );
                                                } }
                                                inputMaxWidth={ 32 }
                                                inputMaxHeight={ 32 }
                                                showFormModel={ true }
                                                showFormData={ true }
                                                showFormSchema={ true }
                                            /> ) ) }
                                    </div>
                                ) ) }
                        </div>
                        <DialogFooter className='sm:justify-start'>
                            { dialogType !== 'none' && ( <div className="flex flex-row gap-2 w-full justify-between items-stretch">
                                <DialogClose>
                                    <Button
                                        variant={ `destructive` }
                                        onClick={ () => handleCancel() }>
                                        <X />
                                        { `${ [ ...DIALOG_TYPE_CLOSE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                    </Button>
                                </DialogClose>

                                {/* <DialogClose> */ }
                                <Button
                                    // type='submit'
                                    className={ twMerge(
                                        // Base styles
                                        'relative inline-flex items-center border px-4 py-2 text-sm font-semibold transition-colors focus:z-10 focus:outline-none focus:ring-1',

                                        // Light-mode focus state
                                        'focus:border-teal-500 focus:ring-teal-500',

                                        // Dark-mode focus state
                                        'dark:focus:border-teal-400 dark:focus:ring-teal-400',
                                        true
                                            ? // Selected / hover states
                                            'border-teal-500 bg-teal-500 text-white hover:bg-teal-600'
                                            : // Unselected / hover state
                                            'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',

                                        true &&
                                        // Dark-mode unselected state (selected is the same)
                                        'dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
                                    ) }
                                    disabled={ false }
                                    onClick={ ( e ) => {
                                        e.preventDefault();
                                        if ( reminderEnabled ) {

                                            if ( formRef.current ) {
                                                const success = formRef.current.submitForm(); // Call the exposed submitForm method
                                                // handleSubmitReminderForm( formData, dataType );
                                                if ( success ) {
                                                    // setOpen( false ); // Close dialog only if form submission logic (e.g. validation) passes
                                                    if ( debug === true ) console.log( "DayFormDialog :: Reminder has been created successfully. " );
                                                    handleCancel();
                                                }
                                            }
                                        }
                                        else {
                                            handleSubmitForm( formData, dataType );
                                        }
                                    } }
                                >
                                    { [ ...DIALOG_TYPE_CLOSE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                    { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                </Button>
                                {/* </DialogClose> */ }
                            </div> ) }
                        </DialogFooter>
                    </DialogContent>
                </Dialog >
            ) }
        </>
    );
};

export default DayFormDialog;



/*  const handleCreateSubmit = async ( data, type ) => {
        let res;
        let validatedData = utils.ao.removeKey( data, '_id' );

        try {
            switch ( type ) {
                case 'event':
                    res = await createEventSubmitCallback( validatedData, type, false );
                    break;
                case 'log':
                    res = await createLogSubmitCallback( validatedData, type, false );
                    break;
                case 'calendar':
                    res = await createCalendarSubmitCallback( validatedData, type, false );
                    break;
                case 'planner':
                    res = await createPlannerSubmitCallback( validatedData, type, false );
                    break;
                case 'task':
                    res = await createTaskSubmitCallback( validatedData, type, false );
                    break;
                default:
                    break;
            }

            if ( res ) {
                // Got a result back. 
                if ( debug === true)console.log( 'DayFormDialog :: DayModal :: handleCreateSubmit :: type = ', type, ' :: ', 'res = ', res );
            }
        } catch ( err ) {
            console.error( "Error creating data: ", err );
        }
    };

    const handleStart = async ( data, type ) => {
        switch ( type ) {
            case 'event':
                createEventStartCallback( data, type, false );
                break;
            case 'log':
                createLogStartCallback( data, type, false );
                break;
            case 'calendar':
                createCalendarStartCallback( data, type, false );
                break;
            case 'planner':
                createPlannerStartCallback( data, type, false );
                break;
            case 'task':
                createTaskStartCallback( data, type, false );
                break;
            default:
                break;
        }
        if ( debug === true)console.log( 'DayFormDialog :: DayModal :: handleStart :: type = ', type, ' :: ', 'data = ', data );
    };

    const initializeDataForType = ( type = 'event' ) => {
        // Create initial data.
        const schema = getSchema( type );
        let initializedData = {};
        Object.keys( schema ).forEach( ( fieldSchemaKey ) => {
            const fieldSchema = schema?.[ fieldSchemaKey ];
            if ( fieldSchema ) {
                initializedData[ fieldSchemaKey ] = typeToInitialDefault(
                    fieldSchema?.type,
                    initialData?.[ fieldSchemaKey ] ?? null,
                    true
                );
            }
        } );
        // const initializedData = typeToInitialDefault( schema );
        if ( debug === true)console.log( "DayFormDialog :: initializedData = ", initializedData );
        setFormData( initializedData );
    };

    const handleSelectAction = ( type = 'event' ) => {
        switch ( type ) {
            case 'log':
                setDataSchema( getSchema( 'log' ) );
                setFormData(initializeDataForType( type ));
                setDataType( 'log' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'event':
                setDataSchema( getSchema( 'event' ) );
                setFormData(initializeDataForType( type ));
                setDataType( 'event' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'task':
                setDataSchema( getSchema( 'task' ) );
                setFormData(initializeDataForType( type ));
                setDataType( 'task' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'planner':
                setDataSchema( getSchema( 'planner' ) );
                setFormData(initializeDataForType( type ));
                setDataType( 'planner' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'calendar':
                setDataSchema( getSchema( 'calendar' ) );
                setFormData(initializeDataForType( type ));
                setDataType( 'calendar' );
                setDialogType( 'add' );
                setDialogFormType( `create_${ type }` ); // For reducer.
                break;
            case 'back':
                setDataSchema( null );
                setDataType( 'none' );
                setDialogType( 'none' );
                setDialogFormType( 'none' );
                break;
            case 'none':
                setDataSchema( null );
                setDataType( type );
                setDialogType( 'none' );
                setDialogFormType( 'none' );
                break;
            default:
                setDataSchema( null );
                setDataType( 'none' );
                setDialogType( 'add' );
                setDialogFormType( 'none' );
                break;
        }
    };
*/
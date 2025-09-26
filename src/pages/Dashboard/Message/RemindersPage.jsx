
import React, { useContext, createContext, useEffect, useState, useId, useMemo, useCallback } from 'react';
import Content from '@/components/Page/Content';
import {
    Bell,
    BellDotIcon,
    BellOff,
    BellRing,
    Blocks,
    Box,
    BoxesIcon,
    Calendar,
    CalendarCheck,
    CalendarCheck2,
    DatabaseBackup,
    Edit,
    File,
    Folder,
    Goal,
    House,
    ListCheck,
    ListChecks,
    LucideLaptopMinimalCheck,
    NotebookPen,
    PanelsTopLeft,
    Pin,
    PinOff,
    PlusCircleIcon,
    RefreshCcw,
    Trash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { caseCamelToSentence } from '@/lib/utilities/string';
import * as utils from 'akashatools';
import FlexibleTable from '@/components/Table/FlexibleTable';
import useMessage from '@/lib/hooks/useMessage';
import useReminderStore from '@/store/reminder.store';
import { Button } from '@/components/ui/button';
import { ReminderFormDialogWrapper } from '@/features/Remind/blocks/Dialog/reminderFormDialog';
import { calculateNextTriggerTime, shouldReminderTrigger } from '@/features/Remind/lib/notificationUtils';
import useNotificationsStore from '@/store/notification.store';
// import { CreateReminderDialog } from '@/features/Remind//create-reminder-dialog';
import { DB_DATA_TYPES, REMINDER_DOC_TYPES } from '@/lib/config/config';
import { ObjectId } from '@/lib/config/types';
import { addDays, addMinutes } from 'date-fns';
import useGlobalStore from '@/store/global.store';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES_NOTIFICATIONS, ROUTES_REMINDERS } from '@/lib/config/constants';
import { MessageProvider, useMessageContext } from '@/features/Remind/lib/contexts/MessageContext';
import { useBatchUpdates } from '@/lib/hooks/useBatchUpdates';
import useNotification from '@/lib/hooks/useNotification';

const RemindersPage = ( props ) => {
    return (
        <MessageProvider>
            <RemindersPageViews { ...props } />
        </MessageProvider>
    );
};

const RemindersPageViews = ( props ) => {
    const {
        title,
        defaultEndpoint,
    } = props;

    const {
        handleNotificationPermissions,
        notificationButton,
        showNotification,
    } = useNotification();

    const {
        data, getData, reloadData, getDataOfType,
        schemas, getSchema,
    } = useGlobalStore();

    const {
        // Handler functions - Reminders
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
    } = useMessage();

    const {
        requestFetchReminders,
        setRequestFetchReminders,
        reminderData,
        setReminderData,
        error,
        setError,
        clearError,
        remindersPerPage,
        setRemindersPerPage,
        getAllUniqueDataKeys,
        setReminderToEdit,
        clearReminderToEdit,
        setReminderToClone,
        clearReminderToClone,
        getFilteredReminders,
        getActiveReminders,
        getInactiveReminders,
        addReminder,
        addReminders,
        insertReminder,
        createReminder,
        updateReminder,
        updateReminders,
        deleteReminder,
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
        // } = useReminderStore();
    } = useMessageContext();

    const {
        // notificationData,
        setNotificationData,
        createNotificationFromReminder,
        addNotification,
        createNotification,
        updateNotification,
        updateNotifications,
        deleteNotification,
        deleteNotifications,
        toggleRead,
        markAsUnread,
        markAsRead,
        markAllAsRead,
        clearDismissed,
        state,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        clearDismissedNotifications,
        clearAllNotifications,
        getUnreadNotifications,
        getVisibleNotifications,
        // } = useNotificationsStore();
    } = useMessageContext();

    // Set up batch updates
    const { pendingUpdates, isProcessing } = useBatchUpdates( {
        interval: 3000, // Process updates every 3 seconds
        onProcessComplete: () => {
            console.log( 'Reminders Page :: Batch Updates processed successfully' );
        },
    } );


    const notificationData = useNotificationsStore( ( state ) => state.notificationData );

    const handleRefreshData = () => {
        handleFetchAllReminders();
        handleFetchAllNotifications();
        setReminderSchema( getSchema( 'Reminder' ) );
        setNotificationSchema( getSchema( 'Notification' ) );
    };


    let [ searchParams, setSearchParams ] = useSearchParams();

    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;

    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'messages' ) + 1 ];

    const handleGetViewPage = () => {
        // Handles fetching the sub-route from local storage on component mount.
        // let t = localStorage.getItem( ROUTES_REMINDERS );
        let index = ROUTES_REMINDERS.findIndex( ( val ) => ( val === endpoint ?? 'notifications' ) );
        if ( index < path.length ) {
            return endpoint;
        }
        // else if ( index === path.length - 1 ) {
        else {
            // Index is same as the size of the path, so we're at the ROOT of this directory. 
            // Default to 'reminders'
            return 'home';
        }
        // return endpoint ?? 'notifications';
        // return t;
    };

    const [ remindersLocalData, setRemindersLocalData ] = useState( null );
    const [ notificationsLocalData, setNotificationsLocalData ] = useState( null );
    const [ viewPage, setViewPage ] = useState( defaultEndpoint || ( endpoint ?? handleGetViewPage() ) );

    useEffect( () => {
        // Update local copies of data. 
        console.log( "RemindersPage :: On reminderData update :: reminderData = ", reminderData );
        if ( utils.val.isValidArray( reminderData, true ) ) {
            setRemindersLocalData( reminderData );
        }
        console.log( "RemindersPage :: On notificationData update :: notificationData = ", notificationData );
        if ( utils.val.isValidArray( notificationData, true ) ) {
            setNotificationsLocalData( notificationData );
        }
    }, [ reminderData, notificationData ] );

    useEffect( () => {
        setViewPage( endpoint );
    }, [ endpoint ] );

    const [ isModalOpen, setIsModalOpen ] = useState( false );
    const [ reminderTypes, setReminderTypes ] = useState( remindersLocalData ? getActiveReminderTypes() : [] );

    useEffect( () => {
        // if ( !utils.val.isDefined( reminderData ) ) handleFetchAllReminders();
        // if ( !utils.val.isDefined( notificationData ) ) handleFetchAllNotifications();
        // if ( !utils.val.isDefined( reminderSchema ) ) setReminderSchema( getSchema( 'Reminder' ) );
        // if ( !utils.val.isDefined( notificationSchema ) ) setNotificationSchema( getSchema( 'Notification' ) );
        if ( !reminderData || !remindersLocalData ) handleFetchAllReminders();
        if ( !notificationData || !notificationsLocalData ) handleFetchAllNotifications();
        if ( !reminderSchema ) setReminderSchema( getSchema( 'Reminder' ) );
        if ( !notificationSchema ) setNotificationSchema( getSchema( 'Notification' ) );
        console.log( "RemindersPage :: notificationData = ", notificationData, " :: ", "reminderData = ", reminderData );
    }, [] );

    useEffect( () => {
        if ( remindersLocalData ) setReminderTypes( getActiveReminderTypes() );
    }, [ remindersLocalData ] );

    useEffect( () => {
        if ( path ) setViewPage( handleGetViewPage() );
    }, [ path ] );

    const handleAddNotificationFromReminder = ( reminder ) => {
        addNotification( reminder );
    };

    // Notification Trigger Simulation
    useEffect( () => {
        const intervalId = setInterval( () => {
            const activeSystemReminders = getActiveReminders(); // Get current active reminders from store
            activeSystemReminders.forEach( ( reminder ) => {
                if ( shouldReminderTrigger( reminder ) ) {
                    // addNotification( reminder );
                    // setNotificationData( [ ...( utils.val.isValidArray( notificationData, true ) ? notificationData : [] ) ] );
                    const nextTriggerTime = calculateNextTriggerTime( reminder, new Date() );
                    handleAddNotificationFromReminder( reminder, nextTriggerTime );
                }
            } );
        }, 15 * 1000 ); // Check every 15 seconds

        return () => clearInterval( intervalId );
    }, [ addNotification, getActiveReminders ] ); // Rerun if addNotification or getActiveReminders changes (store might re-create them)


    // Form dialog handler functions. 
    const handleOpenCreateModal = () => {
        useReminderStore.getState().clearReminderToEdit(); // Ensure edit state is clear
        useReminderStore.getState().clearReminderToClone(); // Ensure clone state is clear
        setIsModalOpen( true );
    };

    const handleOpenEditModal = ( reminder ) => {
        if ( reminder ) {
            setReminderToEdit( reminder );
        } else {
            // This case can be used by clone to just open the modal
            useReminderStore.getState().clearReminderToEdit();
        }
        setIsModalOpen( true );
    };

    const handleTestNotifications = async () => {
        // Run through each reminder, set isActive to true, set the next triggerDate to in 1 minute, and send. 
        // const today = formatDateTime( addMinutes( new Date(), 2 ) );
        // const today = formatDateTime( new Date( addMinutes( new Date(), 2 ) - new Date( new Date() ).getTimezoneOffset() * 60 * 1000 ) );
        const today = addMinutes( ( new Date().getTime() - new Date().getTimezoneOffset() * 60000 ), 2 ).toISOString();


        console.log( "today = ", today );
        if ( utils.val.isValidArray( remindersLocalData, true ) ) {
            remindersLocalData.forEach( async ( reminder ) => {
                // TODO :: Make a batch upload for bulk changes.
                let updatedData = {
                    ...reminder,
                    triggerDates: [
                        ...reminder?.triggerDates,
                        today
                    ],
                    nextRunAt: today,
                    isActive: true,
                    isEnabled: true,
                };
                console.log( "RemindersPage :: handleTestNotifications :: testing each reminder :: reminder = ", reminder, " :: ", "updatedData = ", updatedData );

                let result = await handleUpdateReminder( reminder._id, updatedData );

                if ( result ) {
                    updateReminder( result );
                    console.log( "RemindersPage :: handleTestNotifications :: testing each reminder :: reminder = ", reminder, " :: ", "Update success.", " :: ", "result = ", result );
                }
                else {
                    console.error( "RemindersPage :: handleTestNotifications :: testing each reminder :: reminder = ", reminder, " :: ", "Update failed." );
                }
            } );
        }
    };

    // For spoofing notifications
    const spoofNotification = async ( e ) => {
        e.preventDefault();
        const activeSystemReminders = getActiveReminders();
        let reminder;
        if ( activeSystemReminders.length > 0 ) {
            const randomIndex = Math.floor( Math.random() * activeSystemReminders.length );
            reminder = activeSystemReminders[ randomIndex ];
            let spoofedNotification = createNotificationFromReminder( reminder, reminder?.triggerDates?.[ 0 ] ?? new Date( Date.now() ) );
            try {
                let newNotification = await handleCreateNotification( spoofedNotification );
                console.log( "RemindersPage :: spoofNotification :: randomIndex = ", randomIndex, " :: ", "reminder = ", reminder, " :: ", "spoofedNotification = ", spoofedNotification, " :: ", "newNotification = ", newNotification );
                if ( newNotification ) addNotification( newNotification ); // Success, add new notification for testing. 
                else addNotification( spoofedNotification ); // Failed DB, just use the spoofed one. 
            } catch ( error ) {
                console.error( error );
            }
        } else {
            // Create a dummy reminder if none exist for spoofing
            const docType = REMINDER_DOC_TYPES[ Math.floor( Math.random() * REMINDER_DOC_TYPES.length ) ];
            reloadData(); // Refresh the data stored in the global data store. 
            const docsOfType = getDataOfType( docType?.value );
            const docId = docsOfType ? docsOfType[ Math.floor( Math.random() * docsOfType?.length ) ] : new ObjectId();

            const nextRunAt = addDays( new Date( Date.now() ), 2 );
            const lastTriggeredAt = new Date( Date.now() );
            const triggerDates = [ lastTriggeredAt, nextRunAt ];
            const spoofedReminder = {
                // _id: "spoof_" + Date.now(),
                _id: new ObjectId(),
                title: "Spoofed Test Reminder",
                // notes: "This is a test notification.",
                message: `This is a test reminder about docID: \"${ docId }\" ==> of type \"${ docType?.value }\"`,
                notificationType: "alert",
                notificationContact: '111-111-1111',
                timezone: 'UTC',
                isActive: true,
                inTrash: false,
                nextRunAt: nextRunAt,
                triggerDates: triggerDates,
                lastTriggeredAt: lastTriggeredAt,
                docType: docType?.value,
                docId: docId,
                rrules: [],
            };

            try {
                let newReminder = await handleCreateReminder( spoofedReminder );
                let spoofedNotification;
                let newNotification;
                if ( newReminder ) {
                    spoofedNotification = createNotificationFromReminder( newReminder, newReminder?.triggerDates?.[ 0 ] ?? lastTriggeredAt );
                    newNotification = await handleCreateNotification( spoofedNotification );
                    if ( spoofedNotification ) addNotification( newNotification );
                    else addNotification( spoofedNotification );
                }
                else {
                    const spoofedNotification = createNotificationFromReminder( spoofedReminder, lastTriggeredAt );
                    newNotification = spoofedNotification;
                    if ( spoofedNotification ) addNotification( spoofedNotification );
                }
                console.log( "RemindersPage :: spoofNotification :: randomIndex = ", randomIndex, " :: ", "newReminder = ", newReminder, " :: ", "spoofedNotification = ", spoofedNotification, " :: ", "newNotification = ", newNotification );
            } catch ( error ) {
                console.error( error );
            }

        }
    };


    const tableControlBar = () => {
        return (
            <div className={ `w-full flex flex-row justify-start gap-4 items-center` }>
                <div className={ `w-full flex flex-row justify-center !h-8` }>
                    {/* <CreateReminderDialog
                        onReminderCreated={ handleCreateReminder }
                        triggerButton={
                            <Button
                                size={ 'sm' }
                                variant={ 'ghost' }
                                className={ `px-2 py-2 m-0 focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                            >
                                <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                                <h6 className={ `text-center self-center object-center w-full text-base` }>{ ` New Reminder ` }</h6>
                            </Button>
                        } /> */}

                    <Button
                        size={ 'sm' }
                        variant={ 'ghost' }
                        className={ `px-2 py-2 m-0 focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                        onClick={ handleOpenCreateModal }
                    >
                        <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                        <h6 className={ `text-center self-center object-center w-full text-base` }>{ ` New Reminder ` }</h6>
                    </Button>


                    <Button
                        size={ 'xs' }
                        variant={ 'ghost' }
                        className={ `px-2 py-2 m-0 focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-r-full self-center` }
                        onClick={ () => { handleRefreshData(); } }
                    >
                        <RefreshCcw className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                    </Button>

                </div>

                <div className={ `w-full flex flex-row !h-6 gap-4` }>
                    <div className={ `w-full flex flex-row justify-center gap-4` }>

                        <Button
                            size={ 'sm' }
                            variant={ 'ghost' }
                            className={ `rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ handleTestNotifications }
                        >
                            <BellRing className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                            Test All Notifications
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'ghost' }
                            className={ `rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ spoofNotification }
                        >
                            <BellRing className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                            Spoof Notification
                        </Button>


                        { notificationButton( {
                            body: "Notification body",
                            message: "Notification",
                            onClick: () => { console.log( "NotesPage :: onClick notification event triggered." ); },
                            onDismiss: () => { console.log( "NotesPage :: onDismiss notification event triggered." ); },
                            redirectURL: "./dash/home",
                        } ) }

                        <Button
                            variant={ `outline` }
                            size={ 'sm' }
                            onClick={ markAllAsRead }
                            className={ `rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                        >
                            <BellRing className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                            { `Set Read All` }
                        </Button>
                    </div>

                    <div className={ `w-full flex flex-row justify-center gap-4` }>
                        <Button
                            size={ 'sm' }
                            variant={ `destructive` }
                            onClick={ clearAllReminders }
                            className={ `bg-cosmic-red/20 hover:bg-cosmic-red/40 rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                        >
                            <BellOff className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                            { `Clear All Reminders` }
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ `destructive` }
                            onClick={ clearAllNotifications }
                            className={ `bg-cosmic-red/20 hover:bg-cosmic-red/40 rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                        >
                            <BellOff className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                            { `Clear All Notifications` }
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const handleFormatCell = ( row, key, schema ) => {
        const cellValue = row?.[ key ];
        let cellSchema = schema?.[ key ];
        let type;
        if ( utils.val.isValidArray( cellSchema, true ) ) {
            cellSchema = cellSchema[ 0 ];
        }
        if ( cellSchema?.hasOwnProperty( 'type' ) ) type = cellSchema?.type;

        console.log( "RemindersPage", " :: ", "Notifications Table", " :: ", "cell of row render-format", " :: ", "row = ", row, " :: ", "key = ", key, " :: ", "cellSchema = ", cellSchema, " :: ", "cellValue = ", cellValue, " :: ", "type = ", type );

        return cellValue;
        if ( cellSchema?.type === 'ObjectId' ) {
            if ( key === 'reminderId' ) {
                const reminder = reminderData?.find( ( r ) => ( r._id === cellValue ) );
                return reminder?.title;
            }
            else if ( key === 'docId' ) {
                const docType = row?.[ 'docType' ] ?? 'Custom';
                const docsOfType = getDataOfType( docType );
                const docData = docsOfType ? docsOfType.find( ( doc ) => ( cellValue === doc?._id ) ) : new ObjectId();
                // console.log( "RemindersPage :: Notifications Table :: cell of row render-format :: docData = ", docData, " :: ", "key = ", key, " :: ", "row = ", row, " :: ", "cellSchema = ", cellSchema, " :: ", "cellValue = ", cellValue );
                if ( docData ) {
                    return docData?.title ?? JSON.stringify( docData );
                }
            }
        }
        else {
            return cellValue;
        }
    };

    // console.log( "RemindersPage :: reminderData = ", reminderData, " :: ", "reminderTypes = ", reminderTypes );

    return (
        <Content.Container
            className={ `!h-auto flex-1 min-h-full overflow-hidden` }
        >
            <Tabs
                defaultValue={ viewPage ?? "reminders" }
                className={ `flex flex-col w-full gap-2` }
                onValueChange={ ( value ) => { setViewPage( value ); } }
            >
                <Content.Header
                // className={ `flex flex-row justify-center items-center h-min w-full flex-shrink-1 border rounded-lg` }
                >
                    {/* Nav buttons */ }
                    <div className={ `w-full flex flex-row justify-start items-center` }>
                        <TabsList className={ `justify-start border-2 border-white/10 p-0 rounded-lg !min-h-full` }>
                            { [ 'home', 'reminders', 'notifications', 'history' ].map( ( page ) => {
                                return (
                                    <TabsTrigger
                                        className="py-1 px-4 gap-4 h-full hover:border-white/10 transition-all duration-400 ease-in-out rounded-lg"
                                        value={ page }
                                        onClick={ () => {
                                            navigate(
                                                page === 'home' || endpoint === 'messages'
                                                    ? `/dash/messages`
                                                    : `/dash/messages/${ page }`
                                            );
                                        } }
                                    >
                                        <TooltipProvider delayDuration={ 0 }>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    { caseCamelToSentence( page ) }
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                                                    { caseCamelToSentence( page ) }
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TabsTrigger>
                                );
                            } ) }
                        </TabsList>
                    </div>

                </Content.Header>

                <Content.Body
                    className={ `flex flex-col gap-2 justify-stretch items-stretch h-[90vh] min-h-[90vh] w-full max-w-full px-1 overflow-hidden` }
                >
                    {/* NOTIFICATIONS PAGE */ }
                    <div className="h-full min-h-[90vh] flex-grow rounded-lg border border-border text-start overflow-hidden p-2">
                        <TabsContent
                            value={ "notifications" }
                            // className={ `h-[90vh] w-full max-w-[1920px] overflow-hidden` }
                            // className={ `h-[90vh] min-h-[90vh] w-full max-w-[1920px] flex-grow rounded-lg border border-border text-start !overflow-hidden ` }
                            className={ `!h-full !w-full !max-w-[1920px] !overflow-hidden ` }
                        >
                            <div className={ `h-full min-h-[90vh] max-h-[90vh] w-full max-w-[1920px] relative flex-grow rounded-lg text-start !overflow-y-auto` }>

                                {/* <p className="px-4 gap-1 p-1 text-xs text-muted-foreground">{ "Notifications History" }</p> */ }
                                { utils.val.isValidArray( notificationsLocalData, true ) && (
                                    <FlexibleTable
                                        dataSchema={ notificationSchema ?? getSchema( 'Notification' ) }
                                        controlsBar={ tableControlBar() }
                                        tableTitle={ "Notifications" }
                                        input={ notificationsLocalData.filter( ( n ) => ( !n.inTrash && !n.isDismissed ) ) }
                                        setInput={ () => { } }
                                        customColumnConfig={
                                            notificationSchema
                                                && utils.val.isObject( notificationSchema )
                                                && Object.keys( notificationSchema ).length > 0
                                                ? Object.keys( notificationSchema ).map( ( key, itemIndex ) => ( {
                                                    id: key,
                                                    index: itemIndex,
                                                    header: caseCamelToSentence( key ),
                                                    accessorKey: key,
                                                    width: 100,
                                                    priority: itemIndex,
                                                    // cell: ( row ) => { return handleFormatCell( row, key, notificationSchema ); },
                                                } ) )
                                                : []
                                        }
                                        cellRender={ ( cellData ) => { } }
                                        settings={ [] }
                                        layout={ [] }
                                        options={ [] }
                                        rowOnClick={ ( row ) => { console.log( 'RemindersPage :: Notifications Table :: rowOnClick triggered: row = ', row ); } }
                                        cellOnClick={ ( cell ) => { console.log( 'RemindersPage :: Notifications Table :: cellOnClick triggered: row = ', cell ); } }
                                        setShowSidePanel={ () => { } }
                                        setSidePanelID={ () => { } }
                                        isFilterable={ true }
                                        isSortable={ true }
                                        useRowActions={ true }
                                        rowActions={ [ {
                                            title: "edit",
                                            id: "edit",
                                            icon: <Edit className={ `size-4 aspect-square p-0` } />,
                                            onClick: ( row ) => {
                                                handleOpenEditModal( row );
                                            }
                                        }, {
                                            title: "pin",
                                            id: "pin",
                                            // icon: <Pin className={ `size-4 aspect-square p-0` } />,
                                            render: ( item, index ) => {
                                                if ( item ) {
                                                    return (
                                                        <Button
                                                            id={ `pin-notification-${ index }` }
                                                            variant={ `ghost` }
                                                            size={ 'xs' }
                                                            onClick={ () => {
                                                                handleUpdateNotification( item?._id ?? item?.id, { ...item, isPinned: !item?.isPinned } );
                                                            } }
                                                            className={ `p-2 aspect-square rounded-lg focus:outline-none focus-within:outline-none focus-visible:outline-none justify-center items-center self-center` }
                                                        >
                                                            { ( item?.isPinned ? <Pin className={ `size-4 aspect-square p-0` } /> : <PinOff className={ `size-4 aspect-square p-0` } /> ) }
                                                        </Button>
                                                    );
                                                }
                                            },
                                            onClick: ( row ) => {
                                                handleUpdateNotification( row?._id, { ...row, isPinned: !row?.isPinned } );
                                            }
                                        },
                                        {
                                            title: "delete",
                                            id: "delete",
                                            icon: <Trash className={ `size-4 aspect-square p-0` } />,
                                            onClick: ( row ) => {
                                                handleDeleteNotification( row );
                                            }
                                        } ] }
                                    />
                                ) }
                            </div>
                        </TabsContent>


                        {/* REMINDERS PAGE */ }
                        <TabsContent
                            value={ "reminders" }
                            // className={ `h-full w-full max-w-[1920px] overflow-auto` }
                            className={ `!h-full !w-full !max-w-[1920px] !overflow-hidden ` }
                        >
                            {/* <div className={ `min-h-full min-w-full w-full h-full overflow-hidden` }> */ }
                            <div className={ `h-full min-h-[90vh] max-h-[90vh] w-full max-w-[1920px] relative flex-grow rounded-lg text-start !overflow-y-auto` }>

                                <Tabs
                                    defaultValue={
                                        utils.val.isValidArray( reminderTypes, true )
                                            ? reminderTypes?.[ 0 ]
                                            : 'All'
                                    }
                                    orientation="vertical"
                                    className={ `flex w-full gap-2 !h-full overflow-hidden` }
                                >
                                    <TabsList className={ `flex-col justify-start border-2 border-white/10 p-0 h-min rounded-lg !min-h-full` }>
                                        { reminderTypes?.map( ( type ) => {
                                            let typeDetails = DB_DATA_TYPES?.find( ( t ) => ( t?.value === type ) );
                                            let numUnreadReminders;
                                            if ( !typeDetails || !typeDetails?.hasOwnProperty( 'value' ) ) {
                                                return ( <></> );
                                            }

                                            if ( typeDetails?.value === "All" ) {
                                                numUnreadReminders = remindersLocalData?.length;
                                            }
                                            else {
                                                numUnreadReminders = getActiveRemindersByType( type )?.length;
                                            }
                                            return (
                                                <TabsTrigger
                                                    value={ typeDetails?.value }
                                                    className="py-3 border hover:border-white/10 transition-all duration-400 ease-in-out rounded-lg"
                                                >
                                                    <TooltipProvider delayDuration={ 0 }>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="relative">
                                                                    { typeDetails?.hasOwnProperty( 'icon' ) && ( <typeDetails.icon size={ 16 } strokeWidth={ 1 } aria-hidden="true" className={ `stroke-2 size-6 p-0 m-0` } /> ) }
                                                                    { ( numUnreadReminders > 0 ) && (
                                                                        <Badge
                                                                            variant={ 'destructive' }
                                                                            className="absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[12px]/[.875rem] font-bold transition-opacity group-data-[state=inactive]:opacity-50 text-center aspect-square"
                                                                        >
                                                                            { numUnreadReminders }
                                                                        </Badge>
                                                                    ) }
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right" className="px-2 py-1 text-xs">
                                                                { typeDetails?.label }
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TabsTrigger>
                                            );
                                        } ) }
                                    </TabsList>
                                    <div className="h-full min-h-[90vh] flex-grow rounded-lg border border-border text-start overflow-hidden">
                                        { remindersLocalData && utils.val.isValidArray( remindersLocalData, true ) && reminderTypes?.map( ( type ) => {
                                            let typeDetails = DB_DATA_TYPES?.find( ( t ) => ( t?.value === type ) );
                                            let reminders;
                                            if ( !typeDetails || !typeDetails?.hasOwnProperty( 'value' ) ) {
                                                return ( <></> );
                                            }

                                            if ( typeDetails?.value === "All" ) {
                                                reminders = remindersLocalData;
                                            }
                                            else {
                                                reminders = getRemindersByType( typeDetails.value );
                                            }
                                            return (
                                                <TabsContent
                                                    value={ typeDetails.value }
                                                    className={ `h-full w-full max-w-[1920px] overflow-auto` }
                                                >
                                                    <p className="px-4 gap-1 p-1 text-xs text-muted-foreground">{ typeDetails.label }</p>
                                                    { utils.val.isValidArray( reminders, true ) && (
                                                        <FlexibleTable
                                                            dataSchema={ reminderSchema ?? getSchema( 'Reminder' ) }
                                                            controlsBar={ tableControlBar() }
                                                            tableTitle={ typeDetails?.label ?? typeDetails?.value }
                                                            input={ reminders }
                                                            setInput={ () => { } }
                                                            customColumnConfig={
                                                                reminderSchema
                                                                    && utils.val.isObject( reminderSchema )
                                                                    && Object.keys( reminderSchema ).length > 0
                                                                    ? Object.keys( reminderSchema ).map( ( key, itemIndex ) => ( {
                                                                        id: key,
                                                                        index: itemIndex,
                                                                        header: caseCamelToSentence( key ),
                                                                        accessorKey: key,
                                                                        width: 125,
                                                                        priority: itemIndex,
                                                                        // cell: ( row ) => { handleFormatCell( row, key, reminderSchema ); },
                                                                    } ) )
                                                                    : []
                                                            }
                                                            settings={ [] }
                                                            layout={ [] }
                                                            options={ [] }
                                                            rowOnClick={ ( row ) => { console.log( 'RemindersPage :: Table :: rowOnClick triggered: row = ', row ); } }
                                                            cellOnClick={ ( cell ) => { console.log( 'RemindersPage :: Table :: cellOnClick triggered: row = ', cell ); } }
                                                            setShowSidePanel={ () => { } }
                                                            setSidePanelID={ () => { } }
                                                            isFilterable={ true }
                                                            isSortable={ true }
                                                            useRowActions={ true }
                                                            rowActions={ [ {
                                                                title: "edit",
                                                                name: "edit",
                                                                icon: <Edit className={ `size-4 aspect-square p-0` } />,
                                                                onClick: ( row ) => {
                                                                    handleOpenEditModal( row );
                                                                }
                                                            } ] }
                                                        />
                                                    ) }
                                                </TabsContent>
                                            );
                                        } ) }
                                    </div>
                                </Tabs>

                            </div>
                        </TabsContent>
                    </div>
                </Content.Body>

            </Tabs>
            { isModalOpen && (
                <ReminderFormDialogWrapper
                    open={ isModalOpen }
                    onOpenChange={ setIsModalOpen }
                />
            ) }

        </Content.Container>
    );
};

export default RemindersPage;


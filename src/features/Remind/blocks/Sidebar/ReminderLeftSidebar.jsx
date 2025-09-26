import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useId,
    useMemo,
} from 'react';
import {
    HashRouter,
    Navigate,
    Route,
    Router,
    Routes,
    useNavigate,
    useParams,
} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Edit,
    Trash,
    Calendar,
    List,
    Home,
    FileText,
    Settings,
    Upload,
    LayoutGrid,
    PlusSquare,
    MinusSquare,
    Copy,
} from 'lucide-react';

// Utilities
import * as utils from 'akashatools';

// Data stores
import useGlobalStore from '@/store/global.store';
import useNotificationsStore from '@/store/notification.store';
import useReminderStore from '@/store/reminder.store';
import useMessage from '@/lib/hooks/useMessage';

import Nav from '@/components/Nav/Nav';
import { Spinner } from '@/components/Loader/Spinner';
import { Badge } from '@/components/ui/badge';
import { MdKeyboardControlKey } from 'react-icons/md';
import TaskDialog from '@/features/Todo/blocks/Dialog/TaskDialog';
import { formatDate } from '@/lib/utilities/time';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ReminderFormDialogWrapper } from '../Dialog/reminderFormDialog';
import { DATE_PICKER_OPTIONS } from '@/lib/config/constants';
import {
    calculateNextTriggerTime,
    getNextTrigger,
} from '../../lib/notificationUtils';

// Date picker options

// interface TodoListWithIcon {
//   id: number
//   name: string
//   isActive: boolean
//   icon?: string
//   bannerImage?: string
// }

export function ReminderLeftSidebar () {
    const {
        debug, setDebug,
        schemas, getSchema,
        data, setData, getData,
        user, setUser,
        workspaceId
    } = useGlobalStore();

    let refData = getData();

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
        requestFetchReminders, setRequestFetchReminders,
        reminderData, setReminderData,
        error, setError,
        clearError,
        remindersPerPage, setRemindersPerPage,
        getAllUniqueDataKeys,
        reminderToEdit, setReminderToEdit,
        clearReminderToEdit,
        reminderToClone, setReminderToClone,
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
    } = useReminderStore();

    const {
        // notificationData,        setNotificationData,
        createNotification,
        createNotificationFromReminder,
        addNotification,
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
    } = useNotificationsStore();

    const [ isModalOpen, setIsModalOpen ] = useState( false );

    // Update the todoLists initialization to include "All Lists" option
    const [ isCollapsed, setIsCollapsed ] = useState( false );
    const [ dateRange, setDateRange ] = useState( 7 ); // Default to 7 days
    const [ upcomingDates, setUpcomingDates ] = useState( {
        from: new Date(),
        to: addDays( new Date(), dateRange ?? 7 ),
    } ); // Default to 7 days
    const [ selectedReminder, setSelectedReminder ] = useState( null );
    // const [ upcomingReminders, setUpcomingReminders ] = useState( [] );

    const upcomingReminders = getRemindersByDateRange(
        upcomingDates?.from,
        upcomingDates?.to,
    );

    let controls = [
        {
            enabled: true,
            index: 0,
            id: 'context-menu-item-reminder-update',
            key: 'context-menu-item-reminder-update',
            type: 'button',
            // shortcut: '⌘⇧U',
            name: 'editReminder',
            label: 'Edit Reminder ',
            icon: <PlusSquare className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Reminder left sidebar nav list :: context :: edit reminder :: item = ',
                    item,
                );
                // handleUpdateReminder( item, 'reminder' );
                setReminderToEdit( item );
                setIsModalOpen( true );
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 1,
            id: 'context-menu-item-reminder-clone',
            key: 'context-menu-item-reminder-clone',
            type: 'button',
            shortcut: (
                <>
                    <MdKeyboardControlKey />
                    { `C` }
                </>
            ),
            name: 'cloneReminder',
            label: 'Clone Reminder ',
            icon: <Copy className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Reminder left sidebar nav list :: context :: clone reminder :: item = ',
                    item,
                );
                setReminderToClone( item );
                setIsModalOpen( true );
            },

            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 2,
            id: 'context-menu-item-reminder-delete',
            key: 'context-menu-item-reminder-delete',
            type: 'button',
            // shortcut: '⌘⇧D',
            name: 'deleteReminder',
            label: 'Delete Reminder',
            icon: <MinusSquare className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Reminder left sidebar nav list :: context :: delete reminder :: item = ',
                    item,
                );
                if ( item && utils.val.isObject( item ) ) {
                    if ( item?._id ) {
                        handleDeleteReminderStart( item?._id );
                    }
                }
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
    ];

    return (
        // <div className={ cn( "h-full min-h-[90vh] max-h-full relative top-0 bottom-0 left-0 inset-0 border-r flex flex-col transition-all duration-300 max-h-[calc(100vh-16rem)]", isCollapsed ? "w-12" : "w-64" ) }>
        <div
            className={ cn(
                'h-full min-h-[90vh] max-h-full relative top-0 bottom-0 left-0 inset-0 border-r flex flex-col transition-all duration-300 max-h-[calc(100vh-16rem)]',
                isCollapsed ? 'w-12' : 'w-auto max-w-56',
            ) }>
            <div className='flex-1 overflow-y-auto p-2 max-h-full min-h-full h-full'>
                { utils.val.isValidArray( reminderData, true ) ? (
                    <>
                        <div className='flex justify-between items-center h-fit '>
                            <Select
                                value={ dateRange }
                                onValueChange={ ( value ) => /*  */ {
                                    setUpcomingDates( {
                                        from: new Date(),
                                        to: addDays( new Date(), value ),
                                    } );
                                    setDateRange( value );
                                } }>
                                <SelectTrigger className=''>
                                    <SelectValue placeholder='Select range' />
                                </SelectTrigger>
                                <SelectContent>
                                    { DATE_PICKER_OPTIONS.map( ( option ) => (
                                        <SelectItem
                                            key={ option?.value }
                                            value={ option?.value }
                                            className='text-xs py-0.5'>
                                            { option?.name }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className='my-2' />

                        <div className='flex justify-between items-center h-fit '>
                            { utils.val.isValidArray( upcomingReminders, true ) ? (
                                <Nav.List
                                    label={
                                        <div className={ `text-nowrap pl-4` }>
                                            { `Upcoming Reminders` }{ ' ' }
                                            <Badge
                                                variant={ 'primary' }
                                                className={ `aspect-square size-5 text-center justify-center items-center self-center ${ upcomingReminders?.length >
                                                    0
                                                    ? '!bg-red-700'
                                                    : '!bg-transparent'
                                                    } !text-primary-500 absolute left-0 p-1` }>
                                                <h6
                                                    className={ `text-sm font-bold` }>
                                                    { upcomingReminders
                                                        ? upcomingReminders?.length
                                                        : 0 }
                                                </h6>
                                            </Badge>
                                        </div>
                                    }
                                    useSearch={ true }
                                    searchField={ 'title' }
                                    collapsible={ true }
                                    collapsibleDefaultOpen={ true }
                                    items={ upcomingReminders }
                                    maxShow={ 10 }
                                    useSort={ true }
                                    sortField={ 'index' }
                                    sortFunc={ ( a, b ) => a?.index - b?.index }
                                    activeItem={
                                        reminderToEdit ? reminderToEdit : null
                                    }
                                    className={ `gap-1 !p-0 m-0 w-full h-full` }
                                    itemClassname={ `!p-0 h-auto` }
                                    onClickItem={ ( item ) => {
                                        console.log(
                                            'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                            upcomingReminders,
                                            ' :: ',
                                            'onClickItem triggered :: item = ',
                                            item,
                                        );
                                        setReminderToEdit( item );
                                        setIsModalOpen( true );
                                    } }
                                    controls={ controls }
                                    showSubtitle={ true }
                                    // subtitleRender={ ( item ) => ( formatDate( item?.triggerDates && utils.val.isValidArray( item?.triggerDates, true ) ? ( item?.triggerDates?.sort( ( a, b ) => ( new Date( a ) - new Date( b ) ) ) ) : ( null ) ) ) }
                                    subtitleRender={ ( item ) =>
                                        formatDate(
                                            item?.triggerDates &&
                                                utils.val.isValidArray(
                                                    item?.triggerDates,
                                                    true,
                                                )
                                                ? getNextTrigger( item )
                                                : null,
                                        )
                                    }
                                />
                            ) : (
                                'No reminders upcoming in this time frame.'
                            ) }
                        </div>
                    </>
                ) : (
                    <Spinner
                        variant={ 'grid' }
                        size={ 'xl' }
                        color={ 'currentColor' }
                        overlay={ true }
                        className={ `` }
                    />
                ) }
            </div>

            { isModalOpen && (
                <ReminderFormDialogWrapper
                    open={ isModalOpen }
                    onOpenChange={ setIsModalOpen }
                />
            ) }
        </div>
    );
}

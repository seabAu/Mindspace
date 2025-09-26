import * as utils from 'akashatools';
import {
    BoxSelect,
    Check,
    Delete,
    Edit,
    ExternalLinkIcon,
    FileQuestion,
    FolderOpen,
    FolderPen,
    LucideMessageSquareX,
    Plus,
    Save,
    X,
    LayoutGrid,
    ListChecks,
    List,
    Table,
    Calendar,
    Database,
    LogsIcon,
    CalendarCheckIcon,
    ChartBarStacked,
    CalendarDays,
    NotepadTextDashed,
    LucideCalendarHeart,
    BellRing,
    Blocks,
    Box,
    BoxesIcon,
    CalendarCheck,
    CalendarCheck2,
    DatabaseBackup,
    File,
    Folder,
    Goal,
    House,
    ListCheck,
    LucideLaptopMinimalCheck,
    NotebookPen,
    PanelsTopLeft,
    PlusCircleIcon,
    RefreshCcw,
} from 'lucide-react';
import { daysInMonth } from "@/lib/utilities/time";
import { FaFileCircleQuestion, FaTrashCanArrowUp } from 'react-icons/fa6';

// Dialog Menus Config
export const DIALOG_TYPES = [ 'add', 'view', 'edit', 'delete', 'none' ];
export const DIALOG_TYPE_DESCRIPTIONS = [ 'Create', 'View', 'Edit', 'Delete', 'None' ];
export const DIALOG_TYPE_NAMES = [ 'Create', 'View', 'Update', 'Delete', 'None' ];
export const DIALOG_TYPE_ICONS = [ <Plus />, <FolderOpen />, <Edit />, <Delete />, <FileQuestion /> ];
export const DIALOG_TYPE_CLOSE_ICONS = [ <Check />, <ExternalLinkIcon />, <FolderPen />, <FaTrashCanArrowUp />, <FaFileCircleQuestion /> ];
export const DIALOG_TYPE_CLOSE_NAMES = [ 'Cancel', 'Close', 'Cancel Update', 'Reject', 'None' ];
export const DIALOG_TYPE_SUBMIT_NAMES = [ 'Submit', 'Close', 'Save Update', 'Okay', 'None' ];

export const DIALOG_FORM_TYPES = {
    NONE: "none",
    VIEW: "view",
    EDIT: "edit",
    ADD: "add",
    DELETE: "delete",
    GOTO: "goto",
};

export const DIALOG_FORM_TYPE_NAMES = {
    [ DIALOG_TYPES.NONE ]: "None",
    [ DIALOG_TYPES.VIEW ]: "View",
    [ DIALOG_TYPES.EDIT ]: "Edit",
    [ DIALOG_TYPES.ADD ]: "Add",
    [ DIALOG_TYPES.DELETE ]: "Delete",
    [ DIALOG_TYPES.GOTO ]: "Go To",
};

export const DIALOG_FORM_TYPE_DESCRIPTIONS = {
    [ DIALOG_TYPES.NONE ]: "No dialog",
    [ DIALOG_TYPES.VIEW ]: "View details",
    [ DIALOG_TYPES.EDIT ]: "Edit item",
    [ DIALOG_TYPES.ADD ]: "Add new item",
    [ DIALOG_TYPES.DELETE ]: "Delete item",
    [ DIALOG_TYPES.GOTO ]: "Navigate to date",
};

export const DIALOG_FORM_TYPE_ICONS = {
    [ DIALOG_TYPES.NONE ]: null,
    [ DIALOG_TYPES.VIEW ]: "eye",
    [ DIALOG_TYPES.EDIT ]: "edit",
    [ DIALOG_TYPES.ADD ]: "plus",
    [ DIALOG_TYPES.DELETE ]: "trash",
    [ DIALOG_TYPES.GOTO ]: "calendar",
};

export const DIALOG_FORM_TYPE_CLOSE_ICONS = {
    [ DIALOG_TYPES.NONE ]: "x",
    [ DIALOG_TYPES.VIEW ]: "x",
    [ DIALOG_TYPES.EDIT ]: "x",
    [ DIALOG_TYPES.ADD ]: "x",
    [ DIALOG_TYPES.DELETE ]: "x",
    [ DIALOG_TYPES.GOTO ]: "x",
};

export const DIALOG_FORM_TYPE_CLOSE_NAMES = {
    [ DIALOG_TYPES.NONE ]: "Close",
    [ DIALOG_TYPES.VIEW ]: "Close",
    [ DIALOG_TYPES.EDIT ]: "Cancel",
    [ DIALOG_TYPES.ADD ]: "Cancel",
    [ DIALOG_TYPES.DELETE ]: "Cancel",
    [ DIALOG_TYPES.GOTO ]: "Cancel",
};



export const TYPE_DIALOG_CONFIG = {
    getValues: function () { return ( this?.options?.map( ( o ) => ( o?.value ) ) ); },
    getNames: function () { return ( this?.options?.map( ( o ) => ( o?.name ) ) ); },
    getIcons: function () { return ( this?.options?.map( ( o ) => ( o?.icon ) ) ); },
    get: ( matchKey, matchValue, getKey ) => (
        [ 'value', 'name', 'icon' ].includes( getKey ) &&
        [ 'value', 'name', 'icon' ].includes( matchKey ) &&
        utils.val.isValid( matchValue ) &&
        ( this?.options?.filter( ( o, i ) => ( o?.[ matchKey ] === matchValue ) )?.[ getKey ] )
    ),
    getValue: function ( name ) { return ( this?.options?.filter( ( o, i ) => ( o?.value === name ) )?.value ); },
    getName: function ( name ) { return ( this?.options?.filter( ( o, i ) => ( o?.value === name ) )?.name ); },
    getIcon: function ( name ) { return ( this?.options?.filter( ( o, i ) => ( o?.value === name ) )?.icon ); },
    options: [
        { value: 'add', name: 'Create', icon: <Plus /> },
        { value: 'view', name: 'Close', icon: <X /> },
        { value: 'edit', name: 'Save', icon: <Save /> },
        { value: 'delete', name: 'Delete', icon: <Delete /> },
        { value: 'none', name: 'None', icon: <FileQuestion /> },
    ]
};



export const USER_ROLE_DEFS = [
    "guest",
    "editor",
    "creator",
    "writer",
    "user",
    "admin",
    "superadmin"
];

export const USER_ROLES = {
    GUEST: "guest",
    EDITOR: "editor",
    CREATOR: "creator",
    WRITER: "writer",
    USER: "user",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
};






// Define data table columns
export const STATS_DATATABLE_COLUMNS = [
    { value: "dataKey", header: "Data Key", span: 2 },
    { value: "dataType", header: "Data Type", span: 1 },
    { value: "timeStamp", header: "Timestamp", span: 3 },
    { value: "dataValue", header: "Data Value", span: 5 },
    { value: null, header: "Actions", span: 1, headerClassName: "text-right" },
];



export const DASHBOARD_RIGHT_SIDEBAR_ICONS_CONFIG = [
    { label: 'today', name: 'today', icon: CalendarCheckIcon },
    { label: 'log', name: 'log', icon: LogsIcon },
    { label: 'tasks', name: 'tasks', icon: ListChecks },
    { label: 'stats', name: 'stats', icon: ChartBarStacked },
    { label: 'plan', name: 'plan', icon: LucideCalendarHeart },
    { label: 'reflect', name: 'habits', icon: CalendarDays },
    { label: 'notepad', name: 'note', icon: NotepadTextDashed },
];

export const TODO_VIEWS_CONFIG = [
    { value: "kanban", icon: <LayoutGrid className="size-4 aspect-square" />, label: "Kanban" },
    { value: "data-table", icon: <Database className="size-4 aspect-square" />, label: "Data Table" },
    { value: "detailed-list", icon: <ListChecks className="size-4 aspect-square" />, label: "Detailed" },
    { value: "basic-list", icon: <List className="size-4 aspect-square" />, label: "Basic" },
    { value: "table", icon: <Table className="size-4 aspect-square" />, label: "Table" },
    { value: "calendar", icon: <Calendar className="size-4 aspect-square" />, label: "Calendar" },
];

export const TYPE_TASK_CONFIG = {
    getValues: () => ( this?.options?.map( ( o ) => ( o?.value ) ) ),
    getNames: () => ( this?.options?.map( ( o ) => ( o?.name ) ) ),
    getFilters: () => ( this?.options?.map( ( o ) => ( o?.filter ) ) ),
    getIcons: () => ( this?.options?.map( ( o ) => ( o?.icon ) ) ),
    getCols: () => ( this?.options?.map( ( o ) => ( { [ o?.name ]: o?.filter } ) ) ),

    options: [
        {
            value: 'all',
            name: 'All',
            icon: <BoxSelect />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'none',
            name: 'None',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'cancelled',
            name: 'Cancelled',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'postponed',
            name: 'Postponed',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'waitingrequirements',
            name: 'Waiting For Requirements',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'incomplete',
            name: 'Incomplete',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'inProgress',
            name: 'In Progress',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        }, {
            value: 'completed',
            name: 'Completed',
            icon: <LucideMessageSquareX />,
            filter: function ( tasks ) { return ( tasks && Array.isArray( tasks ) && tasks?.length > 0 && tasks?.filter( ( task ) => task?.status === this?.value ) ); }
        },
    ]
};

// Define data types for the various documents handled by the database.
export const DB_DATA_TYPES = [
    { value: 'All', label: 'All', icon: BoxesIcon },
    { value: 'Stats', label: 'Stats', icon: File },
    { value: 'Note', label: 'Notes', icon: NotebookPen },
    { value: 'Record', label: 'Records', icon: Folder },
    { value: 'File', label: 'Files', icon: File },
    { value: 'Folder', label: 'Folders', icon: Folder },
    { value: 'Day', label: 'Days', icon: Calendar },
    { value: 'Log', label: 'Logs', icon: DatabaseBackup },
    { value: 'Event', label: 'Events', icon: CalendarCheck2 },
    { value: 'Calendar', label: 'Calendars', icon: File },
    { value: 'Planner', label: 'Planner', icon: Calendar },
    { value: 'Goal', label: 'Goals', icon: Goal },
    { value: 'Task', label: 'Tasks', icon: CalendarCheck },
    { value: 'Task/TodoList', label: 'Todo Lists', icon: ListCheck },
    { value: 'Task/Group', label: 'Todo List Groups', icon: ListChecks },
    { value: 'Workspace', label: 'Workspaces', icon: Blocks },
    { value: 'Notification', label: 'Notifications', icon: BellRing },
    { value: 'Reminder', label: 'Reminders', icon: LucideLaptopMinimalCheck },
];


// Define data types for filter options
export const DATA_TYPES = [
    { value: "all", label: "All Types" },
    { value: "String", label: "String" },
    { value: "Number", label: "Number" },
    { value: "Integer", label: "Integer" },
    { value: "Decimal", label: "Decimal" },
    { value: "Boolean", label: "Boolean" },
    { value: "Date", label: "Date" },
    { value: "DateTime", label: "DateTime" },
    { value: "DateTimeLocal", label: "DateTimeLocal" },
    { value: "Object", label: "Object" },
    { value: "Array", label: "Array" },
    { value: "ObjectId", label: "ObjectId" },
    { value: "Mixed", label: "Mixed" },
    { value: "Custom", label: "Custom" },
];

export const FILE_TYPES = [ "none", "pdf", "image", "txt", "code" ];

export const TODO_STATUS_OPTIONS = [
    "none",
    "new",
    "cancelled",
    "postponed",
    "waitingRequirements",
    "incomplete",
    "inProgress",
    "completed",
];

export const TODO_PRIORITY_OPTIONS = [
    'none',
    'low',
    'medium',
    'high',
    'urgent',
    'asap',
    'critical',
];

export const TODO_DIFFICULTY_OPTIONS = [
    'none',
    'very low',
    'low',
    'medium',
    'high',
    'very high',
    'extreme',
    '?????',
];

export const LOG_MOOD_OPTIONS = [
    "Unstoppable",
    "Fulfilled",
    "Vibing",
    "Groovin",
    "Shmoovin",
    "Nobbad",
    "Halted",
    "Could Be Better",
    "Stunted",
    "Miserable",
    "Drained",
    "Custom",
];

export const NOTIFICATION_TYPES = [
    'none',
    'toast',
    'sms',
    'email',
    'alert',
    'push'
];

export const REMINDER_DOC_TYPES = [
    "Task",
    "Goal",
    "Day",
    "Event",
    "Custom",
    "Planner",
    "Log",
    "Data",
    "Recurring",
    "Reminder",
    "Notification",
    "Settings"
];

export const RECURRENCE_DEFAULT_FREQUENCIES = [
    'daily',
    'weekly',
    'monthly',
    'yearly',
];

export const RECURRENCE_DEFAULT_INTERVALS = [
    '1D',
    '2D',
    '4D',
    '1W',
    '1M',
    '1Y',
];

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

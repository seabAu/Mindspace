
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as utils from 'akashatools';
import {
    Bell,
    Calendar,
    CheckSquare,
    FileText,
    Folder,
    HelpCircle,
    Home,
    List,
    MessageSquare,
    Plus,
    Settings,
    Target,
    Users,
    Database,
    Briefcase,
    Repeat,
    FolderCheck,
    CalendarCheck,
    UserCircle,
    UserCheckIcon,
    DoorOpen,
} from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { config } from "@/lib/config/nav";
import { useNav } from "./NavProvider";
import { useToast } from "@/hooks/use-toast";
import useWorkspace from "../hooks/useWorkspace";
import { caseCamelToSentence } from "../utilities/string";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalStore from "@/store/global.store";
import useStatsStore from "@/store/stats.store";
import useNotesStore from "@/store/note.store";
import usePlannerStore from "@/store/planner.store";
import useTasksStore from "@/store/task.store";
import useNotificationsStore from "@/store/notification.store";
import useReminderStore from "@/store/reminder.store";
import { useSettingsStore } from "@/store/settings.store";
import DayFormDialog from "@/blocks/DayFormDialog/DayFormDialog";
import { FormDialogProvider } from "./FormDialogContext";

// Create context
const ContextMenuContext = createContext( null );

export function ContextMenuProvider ( { children } ) {
    const location = useLocation();
    const navigate = useNavigate();
    // const { hash, pathname, search } = location;
    // const path = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    // const pathnames = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    // const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );

    // const pathname = usePathname();
    const { toast } = useToast();

    const {
        // Values
        pathnames,
        pathname,
        endpoint,
        search,
        hash,
        path,

        // Nav config objects
        routesConfig,
        userNavConfig,
        // settingsNavConfig,

        // Handler functions
        getPath,
        getPathFrom,
        getRelativePath,
        getIdsArray,

        // Component builder functions
        getSubPathsOfEndpoint,
        getSubPathsOfPage,
        getDynamicNextPaths,
        getIdsOfType,
        buildBreadcrumbs,
        getNavButtons,
        getConfigOfEndpoint,
    } = useNav();

    const navSection = useMemo( () => (
        path?.[ path.indexOf( 'dash' ) + 1 ]
    ), [ path, pathname, endpoint ] );


    const applySettings = useSettingsStore( ( state ) => state.applySettings );
    const getSchema = useGlobalStore( ( state ) => state.getSchema );
    const statsData = useStatsStore( ( state ) => state.statsData );
    const filesData = useNotesStore( ( state ) => state.filesData );
    const foldersData = useNotesStore( ( state ) => state.foldersData );
    const recentNotesData = useNotesStore( ( state ) => state.recentNotesData );
    const plannerData = usePlannerStore( ( state ) => state.plannerData );
    const eventsData = usePlannerStore( ( state ) => state.eventsData );
    const logsData = usePlannerStore( ( state ) => state.logsData );
    const calendarsData = usePlannerStore( ( state ) => state.calendarsData );
    const tasksData = useTasksStore( ( state ) => state.tasksData );
    const goalsData = useTasksStore( ( state ) => state.goalsData );
    const todoLists = useTasksStore( ( state ) => state.todoLists );
    const todoListGroups = useTasksStore( ( state ) => state.customGroups );
    const workspacesData = useGlobalStore( ( state ) => state.workspacesData );
    // const notifications = useGlobalStore( ( state ) => state.notifications );
    // const reminders = useGlobalStore( ( state ) => state.reminders );
    const notificationData = useNotificationsStore( ( state ) => state.notificationData );
    const reminderData = useReminderStore( ( state ) => state.reminderData );

    const { handleSetActiveWorkspace } = useWorkspace();


    const [ contextMenuOpen, setContextMenuOpen ] = useState( false );
    const [ cursorPosition, setCursorPosition ] = useState( { x: 0, y: 0 } );

    // State for the day-form dialog accessible from within the global context menu.
    const [ dayDialogDataType, setDayDialogDataType ] = useState( 'none' );
    const [ dayDialogOpen, setDayDialogOpen ] = useState( false );
    const [ dayDialogInitialData, setDayDialogInitialData ] = useState( {} );

    // Page size handling state.
    const [ width, setWidth ] = useState( window.innerWidth );
    const [ height, setHeight ] = useState( window.innerHeight );
    const updateDimensions = () => {
        setWidth( window.innerWidth );
        setHeight( window.innerHeight );
    };

    useEffect( () => {
        // Catch and process changes in window size. 
        window.addEventListener( "resize", updateDimensions );
        return () => window.removeEventListener( "resize", updateDimensions );
    }, [] );


    // Navigation config - use the one from config.js
    // const navigationConfig = useMemo( () => config.navigation, [] );
    const navigationConfig = useMemo( () => routesConfig, [] );

    const userItems = useMemo( () => [
        { name: "Profile", icon: UserCircle, shortcut: "⌘P", onClick: () => handleMenuItemClick( 'manage-profile' ) },
        { name: "Account", icon: UserCheckIcon, shortcut: "⌘P", onClick: () => handleMenuItemClick( 'manage-account' ) },
        { name: "Sign Out", icon: DoorOpen, shortcut: "⌘P", onClick: () => handleMenuItemClick( 'signout-user' ) },
    ], [] );

    // Management items
    const managementItems = useMemo(
        () => [
            { name: "Workspaces", icon: CheckSquare, shortcut: "⌘W", onClick: () => handleMenuItemClick( 'manage-workspaces' ) },
            { name: "Tasks", icon: CheckSquare, shortcut: "⌘T", onClick: () => handleMenuItemClick( 'manage-tasks' ) },
            { name: "Goals", icon: Target, shortcut: "⌘G", onClick: () => handleMenuItemClick( 'manage-goals' ) },
            { name: "Habits", icon: Target, shortcut: "⌘H", onClick: () => handleMenuItemClick( 'manage-habits' ) },
            { name: "Day", icon: Calendar, shortcut: "⌘D", onClick: () => handleMenuItemClick( 'manage-day' ) },
            { name: "Events", icon: Calendar, shortcut: "⌘E", onClick: () => handleMenuItemClick( 'manage-events' ) },
            // { name: "Custom", icon: Plus, shortcut: "⌘C", onClick: () => handleMenuItemClick( 'manage-Customs' ) },
            { name: "Planners", icon: Calendar, shortcut: "⌘P", onClick: () => handleMenuItemClick( 'manage-planners' ) },
            { name: "Logs", icon: FileText, shortcut: "⌘L", onClick: () => handleMenuItemClick( 'manage-logs' ) },
            { name: "Data", icon: Database, shortcut: "⌘⇧D", onClick: () => handleMenuItemClick( 'manage-stats' ) },
            // { name: "Recurring", icon: Repeat, shortcut: "⌘R", onClick: () => handleMenuItemClick( 'manage-recurring' ) },
            { name: "Reminders", icon: Bell, shortcut: "⌘⇧R", onClick: () => handleMenuItemClick( 'manage-reminders' ) },
            { name: "Notifications", icon: Bell, shortcut: "⌘⇧N", onClick: () => handleMenuItemClick( 'manage-notifications' ) },
            { name: "Settings", icon: Settings, shortcut: "⌘,", onClick: () => handleMenuItemClick( 'manage-settings' ) },
        ],
        [],
    );

    // New items submenu
    const newItems = useMemo(
        () => [
            { name: "Create Workspace", icon: Users, shortcut: "⌘⇧N, W", onClick: () => handleMenuItemClick( 'create-workspace' ) },
            // { name: 'Create Notification', icon: CheckSquare, shortcut: '', onClick: () => handleMenuItemClick( 'create-notification' ) },
            { name: 'Create Reminder', icon: CheckSquare, shortcut: '', onClick: () => handleMenuItemClick( 'create-reminder' ) },
            { name: "Create Task", icon: CheckSquare, shortcut: "⌘⇧N, T", onClick: () => handleMenuItemClick( 'create-task' ) },
            { name: "Create Note", icon: FileText, shortcut: "⌘⇧N, N", onClick: () => handleMenuItemClick( 'create-note' ) },
            { name: "Create Event", icon: Calendar, shortcut: "⌘⇧N, E", onClick: () => handleMenuItemClick( 'create-event' ) },
            { name: "Create Planner", icon: Folder, shortcut: "⌘⇧N, P", onClick: () => handleMenuItemClick( 'create-planner' ) },
            { name: 'Create Calendar', icon: CheckSquare, shortcut: '', onClick: () => handleMenuItemClick( 'create-calendar' ) },
            { name: 'Create Habit', icon: CheckSquare, shortcut: '', onClick: () => handleMenuItemClick( 'create-habit' ) },
            { name: 'Create Journal', icon: CheckSquare, shortcut: '', onClick: () => handleMenuItemClick( 'create-journal' ) },
            { name: 'Create Note Group', icon: FileText, shortcut: '', onClick: () => handleMenuItemClick( 'create-note-folder' ) },
            { name: 'Create Note', icon: FolderCheck, shortcut: '', onClick: () => handleMenuItemClick( 'create-note' ) },
        ],
        [],
    );


    const buildOnThisPageOptions = ( section ) => {
        /* 
            Here we can have features such as showing "Save As Goal" when selecting the text inside a note file.
        */
    };


    // Handle menu item click
    const handleMenuItemClick = useCallback(
        ( item ) => {
            toast( {
                title: `Action: ${ caseCamelToSentence( String( item ) ) }`,
                description: `You clicked on ${ caseCamelToSentence( String( item ) ) }`,
            } );

            switch ( item ) {
                // // Navigation options // // 
                case 'ai-chat':
                    navigate( '/dash/orion' );
                    break;
                case 'manage-tasks':
                    navigate( `/dash/todo/kanban` );
                    break;
                case 'manage-goals':
                    navigate( `/dash/todo/goals` );
                    break;
                case 'manage-habits':
                    navigate( `/dash/reflect/habits` );
                    break;
                case 'manage-day':
                    // Open the day/time management dashboard in Planner.
                    navigate( `/dash/planner/day` );
                    break;
                case 'manage-events':
                    navigate( `/dash/planner/events` );
                    break;
                case 'manage-calendars':
                    navigate( `/dash/planner/calendars` );
                    break;
                case 'manage-planners':
                    navigate( `/dash/planner/planners` );
                    break;
                case 'manage-logs':
                    navigate( `/dash/reflect/journal/list` );
                    break;
                case 'manage-journal':
                    navigate( `/dash/reflect/journal` );
                    break;
                case 'manage-habits':
                    navigate( `/dash/reflect/habits` );
                    break;
                case 'manage-stats':
                    navigate( `/dash/reflect/stats` );
                    break;
                case 'manage-insights':
                    navigate( `/dash/reflect/stats` );
                    break;
                case 'manage-reminders':
                    navigate( `/dash/messages/reminders` );
                    break;
                case 'manage-notifications':
                    navigate( `/dash/messages/notifications` );
                    break;
                case "open-settings":
                case 'manage-settings':
                    navigate( `/dash/settings` );
                    break;
                case "open-help":
                    navigate( '/dash/help' );
                    break;

                // // Data related options // // 
                case "refresh-theme":
                    applySettings();
                    break;
                case "refresh-schemas":
                    applySettings();
                    break;
                case "refresh-data":
                    applySettings();
                    break;
                case "signout-user":
                    break;

                //  // Data creation options // // 
                case 'create-task':
                    setDayDialogDataType( 'task' );
                    setDayDialogOpen( false );
                    break;

                case 'create-reminder':
                    setDayDialogDataType( 'reminder' );
                    setDayDialogOpen( false );
                    break;

                case 'create-habit':
                    setDayDialogDataType( 'habit' );
                    setDayDialogOpen( false );
                    break;

                case 'create-goal':
                    setDayDialogDataType( 'goal' );
                    setDayDialogOpen( false );
                    break;

                case 'create-log':
                case 'create-journal':
                    setDayDialogDataType( 'log' );
                    setDayDialogOpen( false );
                    break;

                case 'create-notification':
                    setDayDialogDataType( 'notification' );
                    setDayDialogOpen( false );
                    break;

                case 'create-event':
                    setDayDialogDataType( 'event' );
                    setDayDialogOpen( false );
                    break;

                case 'create-calendar':
                    setDayDialogDataType( 'calendar' );
                    setDayDialogOpen( false );
                    break;

                case 'create-planner':
                    setDayDialogDataType( 'planner' );
                    setDayDialogOpen( false );
                    break;

                case 'create-note-folder':
                    setDayDialogDataType( 'folder' );
                    setDayDialogOpen( false );
                    break;

                case 'create-note':
                    setDayDialogDataType( 'file' );
                    setDayDialogOpen( false );
                    break;

                // // On-This-Page dynamic menu options // // 


                default:
                    break;
            }
        },
        [ toast ],
    );


    const handleRightClick = useCallback(
        ( e ) => {
            // Update cursor position
            setCursorPosition( { x: e.clientX, y: e.clientY } );

            // If menu is already open, close it first and then reopen it
            if ( contextMenuOpen ) {
                setContextMenuOpen( false );
                // Use setTimeout to ensure the menu closes before reopening
                setTimeout( () => {
                    setContextMenuOpen( true );
                }, 10 );
            }
        },
        [ contextMenuOpen ],
    );

    // Map of keyboard shortcuts to actions
    const keyboardShortcuts = useMemo(
        () => ( {
            // Workspace shortcuts
            w: "Switch Workspace",

            // Navigation shortcuts
            "g h": "Go to Home",
            "g t": "Go to Tasks",
            "g p": "Go to Planner",
            "g n": "Go to Notes",
            "g b": "Go to Notifications",
            "g s": "Go to Search",

            // Creation shortcuts
            n: "Create New Item",
            "n t": "Create New Task",
            "n n": "Create New Note",
            "n e": "Create New Event",
            "n p": "Create New Project",

            // Management shortcuts
            t: "Manage Tasks",
            g: "Manage Goals",
            r: "Create Reminder",
            d: "Manage Day",
            e: "Manage Event",
            p: "Manage Planner",
            l: "Manage Log",

            // Other shortcuts
            a: "Chat with AI",
            s: "Open Settings",
            "?": "Open Help",
        } ),
        [],
    );

    // Handle keyboard shortcuts
    useEffect( () => {
        let keys = [];
        let timeout;

        const handleKeyDown = ( e ) => {
            // Skip if in an input, textarea, or contentEditable element
            if ( e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable ) {
                return;
            }

            // TODO :: Make this dynamically register shortcut key combinations based on what is available for the current page being viewed or resource requested. 
            // Skip if modifier keys are pressed (except for specific combinations)
            if ( e.ctrlKey || e.metaKey ) {
                // Handle specific modifier combinations
                if ( e.metaKey && e.key === "t" ) {
                    e.preventDefault();
                    handleMenuItemClick( "create-task" );
                } else if ( e.metaKey && e.key === "g" ) {
                    e.preventDefault();
                    handleMenuItemClick( "manage-goals" );
                } else if ( e.metaKey && e.key === "r" ) {
                    e.preventDefault();
                    handleMenuItemClick( "create-reminder" );
                } else if ( e.metaKey && e.key === "," ) {
                    e.preventDefault();
                    handleMenuItemClick( "open-settings" );
                } else if ( e.metaKey && e.key === "/" ) {
                    e.preventDefault();
                    handleMenuItemClick( "open-help" );
                }
                return;
            }

            // Add key to the sequence
            keys.push( e.key.toLowerCase() );

            // Check if the sequence matches any shortcuts
            const sequence = keys.join( " " );
            const action = keyboardShortcuts[ sequence ];

            if ( action ) {
                e.preventDefault();
                handleMenuItemClick( action );
                keys = [];
            }

            // Reset sequence after a delay
            clearTimeout( timeout );
            timeout = setTimeout( () => {
                keys = [];
            }, 1000 );
        };

        window.addEventListener( "keydown", handleKeyDown );
        return () => {
            window.removeEventListener( "keydown", handleKeyDown );
            clearTimeout( timeout );
        };
    }, [ handleMenuItemClick, keyboardShortcuts ] );

    // Recursively build menu items from navigation config
    const buildMenuItems = useCallback(
        ( items ) => {
            return items
                .filter( ( item ) => item.enabled )
                .map( ( item ) => {
                    // console.log( 'ContextMenuProvider :: buildMenuItems :: items = ', items, ' :: ', 'item = ', item );
                    // if ( item.type === "group" ) {
                    if ( item.hasOwnProperty( 'pages' ) && utils.val.isValidArray( item.pages, true ) ) {
                        return (
                            <ContextMenuSub key={ item.endpoint }>
                                <ContextMenuSubTrigger
                                    onClick={ () => {
                                        navigate( item?.url );
                                    } }
                                >
                                    { item?.hasOwnProperty( 'icon' ) && utils.val.isDefined( item?.icon ) && ( <item.icon className="mr-2 size-4 aspect-square" /> ) }
                                    <span>{ item?.title || caseCamelToSentence( item?.endpoint ) }</span>
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48">
                                    { buildMenuItems( item?.pages ) }
                                </ContextMenuSubContent>
                            </ContextMenuSub>
                        );
                    }
                    else if ( item.hasOwnProperty( 'getPages' ) && typeof item.getPages === 'function' ) {
                        let pages = item.getPages || [];
                        if ( Array.isArray( pages ) && pages.length > 0 ) {
                            return (
                                <ContextMenuSub key={ item.endpoint }>
                                    <ContextMenuSubTrigger>
                                        { item?.hasOwnProperty( 'icon' ) && utils.val.isDefined( item?.icon ) && ( <item.icon className="mr-2 size-4 aspect-square" /> ) }
                                        <span>{ item.title }</span>
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                        { buildMenuItems( pages ) }
                                    </ContextMenuSubContent>
                                </ContextMenuSub>
                            );
                        }
                    }
                    else {
                        return (
                            <ContextMenuItem key={ item.endpoint } onClick={ () => handleMenuItemClick( `Navigate to ${ item.title }` ) }>
                                { item?.hasOwnProperty( 'icon' ) && utils.val.isDefined( item?.icon ) && ( <item.icon className="mr-2 size-4 aspect-square" /> ) }
                                <span>{ item.title }</span>
                                { item.badge && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        { item.badge }
                                    </span>
                                ) }
                            </ContextMenuItem>
                        );
                    }
                } );
        },
        [ handleMenuItemClick ],
    );

    return (
        <ContextMenuContext.Provider value={ { contextMenuOpen, setContextMenuOpen } }>
            { cursorPosition && ( <ContextMenu
                onOpenChange={ setContextMenuOpen }
                open={ contextMenuOpen }
                // key={ utils.rand.randString( 12 ) }
                className={ `context-menu-container overflow-visible` }
                style={ {
                    overflow: "visible",
                    position: "relative",
                    left: `auto`,
                    top: `auto`,
                } }
            >
                <ContextMenuTrigger className="context-menu-trigger min-h-screen w-full" onContextMenu={ handleRightClick }>
                    { children }
                </ContextMenuTrigger>
                <ContextMenuContent
                    className={ `context-menu-content w-64 !overflow-visible` }
                    style={ {
                        overflow: "visible",
                        position: "absolute",
                        // left: `${ cursorPosition.x - width / 2 }px`,
                        // top: `${ cursorPosition.y - height / 2 }px`,
                        // left: `${ cursorPosition.x }px`,
                        // top: `${ cursorPosition.y }px`,
                        left: `auto`,
                        top: `auto`,
                    } }
                >
                    {/* Workspace submenu */ }
                    { utils.val.isValidArray( workspacesData, true ) && (
                        <ContextMenuSub>
                            <ContextMenuSubTrigger>
                                <Users className="mr-2 size-4 aspect-square" />
                                <span>Workspace</span>
                                <ContextMenuShortcut>W</ContextMenuShortcut>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                { workspacesData?.map( ( workspace ) => (
                                    <ContextMenuItem
                                        key={ workspace._id }
                                        // onClick={ () => handleMenuItemClick( `Switch to ${ workspace.title } workspace` ) }
                                        onClick={ ( item ) => { handleSetActiveWorkspace( workspace ); } }
                                    >
                                        {/* { workspace?.hasOwnProperty( 'iconId' ) && ( <workspace.iconId className="mr-2 size-4 aspect-square" /> ) } */ }
                                        { workspace.title }
                                    </ContextMenuItem>
                                ) ) }
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    ) }

                    {/* Go to submenu */ }
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Home className="mr-2 size-4 aspect-square" />
                            <span>Go to</span>
                            <ContextMenuShortcut>G</ContextMenuShortcut>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            { buildMenuItems( navigationConfig ) }
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    {/* New submenu */ }
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Plus className="mr-2 size-4 aspect-square" />
                            <span>New</span>
                            <ContextMenuShortcut>N</ContextMenuShortcut>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            { newItems.map( ( item ) => (
                                <ContextMenuItem key={ `new-items-${ item.name }` } onClick={ () => handleMenuItemClick( `Create New ${ item.name }` ) }>
                                    <item.icon className="mr-2 size-4 aspect-square" />
                                    <span>{ item.name }</span>
                                    { item.shortcut && <ContextMenuShortcut>
                                        { item.shortcut }
                                    </ContextMenuShortcut> }
                                </ContextMenuItem>
                            ) ) }
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    {/* Create Reminder */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "manage-reminders" ) }>
                        <Bell className="mr-2 size-4 aspect-square" />
                        <span>Create Reminder</span>
                        <ContextMenuShortcut>R</ContextMenuShortcut>
                    </ContextMenuItem>

                    {/* Manage Goals */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "manage-goals" ) }>
                        <Target className="mr-2 size-4 aspect-square" />
                        <span>Manage Goals</span>
                        <ContextMenuShortcut>G</ContextMenuShortcut>
                    </ContextMenuItem>

                    {/* Manage Tasks */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "manage-tasks" ) }>
                        <CheckSquare className="mr-2 size-4 aspect-square" />
                        <span>Manage Tasks</span>
                        <ContextMenuShortcut>T</ContextMenuShortcut>
                    </ContextMenuItem>

                    {/* Manage submenu */ }
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Settings className="mr-2 size-4 aspect-square" />
                            <span>Manage</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            { managementItems.map( ( item ) => (
                                <ContextMenuItem key={ `manage-items-${ item.name }` } onClick={ () => handleMenuItemClick( `Manage ${ item.name }` ) }>
                                    <item.icon className="mr-2 size-4 aspect-square" />
                                    <span>{ item.name }</span>
                                    { item.shortcut && <ContextMenuShortcut>
                                        { item.shortcut }
                                    </ContextMenuShortcut> }
                                </ContextMenuItem>
                            ) ) }
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Settings className="mr-2 size-4 aspect-square" />
                            <span>User</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            { userItems.map( ( item ) => (
                                <ContextMenuItem key={ `user-items-${ item.name }` } onClick={ () => handleMenuItemClick( `Manage ${ item.name }` ) }>
                                    <item.icon className="mr-2 size-4 aspect-square" />
                                    <span>{ item.name }</span>
                                    { item?.shortcut && <ContextMenuShortcut>
                                        { item?.shortcut }
                                    </ContextMenuShortcut> }
                                </ContextMenuItem>
                            ) ) }
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    {/* Chat with AI */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "ai-chat" ) }>
                        <MessageSquare className="mr-2 size-4 aspect-square" />
                        <span>Chat with Orion</span>
                        <ContextMenuShortcut>A</ContextMenuShortcut>
                    </ContextMenuItem>

                    {/* Settings */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "manage-settings" ) }>
                        <Settings className="mr-2 size-4 aspect-square" />
                        <span>Settings</span>
                        <ContextMenuShortcut>⌘,</ContextMenuShortcut>
                    </ContextMenuItem>

                    {/* Help */ }
                    <ContextMenuItem onClick={ () => handleMenuItemClick( "open-help" ) }>
                        <HelpCircle className="mr-2 size-4 aspect-square" />
                        <span>Help</span>
                        <ContextMenuShortcut>?</ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu> ) }
            {
                <FormDialogProvider>
                    <DayFormDialog
                        // mode={ dayDialogDataType || 'day' }
                        isOpen={ dayDialogOpen }
                        setIsOpen={ setDayDialogOpen }
                        initialData={ dayDialogInitialData || {} }
                        setData={ setDayDialogInitialData }
                        onClose={ () => {
                            setDayDialogDataType( 'none' );
                            setDayDialogOpen( false );
                        } }
                    />
                </FormDialogProvider>
            }
        </ContextMenuContext.Provider>
    );
}

export function useContextMenu () {
    const context = useContext( ContextMenuContext );
    if ( !context ) {
        throw new Error( "useContextMenu must be used within a ContextMenuProvider" );
    }
    return context;
}

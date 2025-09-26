// Store file for all the global or UI concerned state variables

import { create } from 'zustand';
import axios from 'axios';
import * as utils from 'akashatools';
import API from '@/lib/services/api';
// import useWorkspacesStore from './workspace.store';
import usePlannerStore from './planner.store';
import useNotesStore from './note.store';
import useTasksStore from './task.store';
import {
    GetLocal,
    SetLocal
} from '@/lib/utilities/local';
import {
    devtools,
    subscribeWithSelector,
    combine,
    persist
} from 'zustand/middleware';
import { AUTH_TOKEN_STORAGE_NAME, SIDEBAR_MAIN_STATE_NAME, SIDEBAR_PRIMARY_STATE_NAME, SIDEBAR_SECONDARY_STATE_NAME, THEME_STORAGE_NAME, ZUSTAND_GLOBAL_STORE_STORAGE_NAME } from '@/lib/config/constants';
// import { shallow } from 'zustand/vanilla/shallow';
// import { createWithEqualityFn } from 'zustand/traditional';
import { v4 as uuidV4 } from "uuid";
import useReminderStore from './reminder.store';
import useNotificationsStore from './notification.store';
import useReflectStore from './reflect.store';
import { useSettingsStore } from './settings.store';

// import {
//     createEvent,
//     fetchEvents,
//     fetchEventsInDateRange,
//     fetchEvent,
//     updateEvent,
//     deleteEvent,
//     fetchCalendars,
//     fetchEventsForCalendar,
//     fetchCalendarsWithEvents,
//     toggleCalendarEvent,
//     createCalendar,
//     fetchCalendar,
//     updateCalendar,
//     deleteCalendar,
//     createLog,
//     updateLog,
//     fetchLogById,
//     fetchLogs,
//     deleteLog,
// } from '@/lib/services/plannerService';

const API_BASE_URL = '/api/app';

const createUserSlice = ( set, get, api ) => ( {
    requestFetchUser: false,
    setRequestFetchUser: ( requestFetchUser ) =>
        set( () => ( { requestFetchUser } ) ),

    requestLogUserOut: false,
    setRequestLogUserOut: ( requestLogUserOut ) =>
        set( () => ( { requestLogUserOut } ) ),

    requestRevalidateUser: false,
    setRequestRevalidateUser: ( requestRevalidateUser ) =>
        set( () => ( { requestRevalidateUser } ) ),

    logUserOut: () => {
        // To be called when the server returns an invalid or expired token  error. 
        console.log( '[global store] :: logUserOut called.' );
        if ( user?.hasOwnProperty( 'settings' ) ) {
            useSettingsStore.getState().setSettingsConfig( null );
        }

        get().wipeData();

        set( ( state ) => ( {
            ...state,
            user: null,
            userToken: null,
            userLoggedIn: false,
            workspacesData: [],
        } ) );
    },

    user: null,
    // setUser: ( user ) => set( () => ( { user } ) ),
    setUser: ( user ) => {
        // Save new user data.
        set( ( state ) => ( { ...state, user } ) );

        // If applicable, apply settings found in the new user data object to settings store.
        if ( user?.hasOwnProperty( 'settings' ) ) {
            useSettingsStore.getState().setSettingsConfig( user?.settings );
        }

        if ( user?.hasOwnProperty( 'phoneOptInConsent' ) ) {
            useSettingsStore.getState().updateSmsNotifications( {
                contact: user?.phone || user?.phoneNotificationContact || null,
                enabled: user?.phoneOptInConsent,
            } );
        }

        if ( user?.hasOwnProperty( 'emailOptInConsent' ) ) {
            useSettingsStore.getState().updateEmailNotifications( {
                contact: user?.email || user?.emailNotificationContact || null,
                enabled: user?.emailOptInConsent,
            } );
        }
    },

    userLoggedIn: null,
    setUserLoggedIn: ( userLoggedIn ) => set( () => ( { userLoggedIn } ) ),

    userToken: null,
    setUserToken: ( userToken ) => {
        set( () => ( { userToken } ) );
        SetLocal( AUTH_TOKEN_STORAGE_NAME, userToken );
    },
    getUserToken: () => {
        return GetLocal( AUTH_TOKEN_STORAGE_NAME );
    },

    updateUser: ( data ) => set( ( state ) => ( { user: { ...state.user, ...data } } ) ),
    updateUserSettings: () => {
        set( ( state ) => ( {
            ...state,
            user: {
                ...state.user,
                settings: useSettingsStore().getState().getSettingsConfig(),
            }
        } ) );
    },

    authData: [],
    setAuthData: ( authData ) => set( () => ( { authData } ) ),

    usersData: [],
    setUsersData: ( usersData ) => set( () => ( { usersData } ) ),

    addUser: ( user ) => {
        set( ( state ) => ( { usersData: [ ...state.usersData, user ] } ) );
    },
    updateUser: ( id, updates ) => {
        set( ( state ) => ( {
            usersData: state.usersData.map( ( w ) => ( w._id === id ? { ...w, ...updates } : w ) ),
        } ) );
    },
    deleteUser: ( id ) => {
        set( ( state ) => ( {
            usersData: state.usersData.filter( ( w ) => w._id !== id ),
        } ) );
    },

    getUserNameById: ( id ) => {
        const { usersData } = get();
        if ( utils.val.isValidArray( usersData, true ) ) {
            return usersData.find( ( u ) => ( u?.id === id ) )?.name || 'User not found.';
        }
        else {
            return 'Error getting user info: no users are in database.';
        }
    },

    settingsDialogOpen: false,
    setSettingsDialogOpen: ( settingsDialogOpen ) => set( () => ( { settingsDialogOpen } ) ),
} );


const createUserIntegrationsSlice = ( set, get, api ) => ( {
    userGoogleOAuthData: null,
    setUserGoogleOAuthData: ( userGoogleOAuthData ) => set( () => ( { userGoogleOAuthData } ) ),
} );


const createWorkspacesSlice = ( set, get, api ) => ( {
    // Workspace variables
    requestFetchWorkspaces: false,
    setRequestFetchWorkspaces: ( requestFetchWorkspaces ) => {
        set( () => ( { requestFetchWorkspaces } ) );
    },

    workspacesData: null,
    setWorkspacesData: ( workspacesData ) =>
        set( () => ( { workspacesData } ) ),

    activeWorkspace: null,
    setActiveWorkspace: ( activeWorkspace ) => set( () => ( { activeWorkspace } ) ),

    workspaceId: null,
    setWorkspaceId: ( workspaceId ) => set( () => ( { workspaceId } ) ),

    getWorkspaces: async () => {
        set( () => ( { loading: true } ) );
        try {
            const response = await API.get( `${ API_BASE_URL }/workspace/` );
            set( () => ( {
                workspacesData: response.data.data,
                error: null,
            } ) );
        } catch ( err ) {
            console.log( "globalStore :: getWorkspaces :: err = ", err );
            set( () => ( { error: err.response?.data?.message || 'Failed to fetch workspaces' } ) );
        } finally {
            set( () => ( { loading: false } ) );
        }
    },

    addWorkspace: ( workspace ) => {
        set( ( state ) => ( { workspacesData: [ ...state.workspacesData, workspace ] } ) );
    },
    updateWorkspace: ( id, updates ) => {
        set( ( state ) => ( {
            workspacesData: state.workspacesData.map( ( w ) => ( w._id === id ? { ...w, ...updates } : w ) ),
        } ) );
    },
    deleteWorkspace: ( id ) => {
        set( ( state ) => ( {
            workspacesData: state.workspacesData.filter( ( w ) => w._id !== id ),
        } ) );
    },
} );

const createDataSlice = ( set, get, api ) => ( {
    //        // Data state //      //
    // Fetch request variables
    requestFetchData: false,
    setRequestFetchData: ( requestFetchData ) =>
        set( () => ( { requestFetchData } ) ),

    // Total data across the app.
    // TODO :: Add a switch statement in the setData callback function
    // that lets me pass in data and what key in which to save it under. 
    // Ie, setData( data, [ "planner", "events" ] ) :: setData( data, path )
    data: null,
    setData: ( data ) => set( () => ( { data } ) ),
    setDataOfType: ( dataUpdate, dataName ) => {
        if ( dataUpdate && dataName && utils.val.isObject( dataUpdate ) ) {
            // if ( data.hasOwnProperty( path[ path.length - 1 ] ) ) {}
            let data = useGlobalStore.getState().data;
            if ( data?.hasOwnProperty( dataName ) ) {
                set( ( data ) => ( { ...data, [ dataName ]: dataUpdate } ) );
            }
        }
    },
    loadData: () => {
        const { data } = get();
        if ( utils.val.isObject( data ) ) {
            // Notes
            if ( data.hasOwnProperty( 'Note' ) ) useNotesStore.getState().setNotesData( data.Note );
            if ( data.hasOwnProperty( 'RecentFiles' ) ) useNotesStore.getState().setRecentNotesData( data.RecentNotes );

            // Reflect / Stats
            if ( data.hasOwnProperty( 'Stats' ) ) useReflectStore.getState().setStatsData( data.Stats );
            if ( data.hasOwnProperty( 'Habits' ) ) useReflectStore.getState().setHabitsData( data.Habits );
            if ( data.hasOwnProperty( 'Log' ) ) useReflectStore.getState().setLogsData( data.Log );

            // Planner
            if ( data.hasOwnProperty( 'Event' ) ) usePlannerStore.getState().setEventsData( data.Event );
            if ( data.hasOwnProperty( 'Planner' ) ) usePlannerStore.getState().setPlannerData( data.Planner );
            if ( data.hasOwnProperty( 'Calendar' ) ) usePlannerStore.getState().setCalendarsData( data.Calendar );

            // Todo
            if ( data.hasOwnProperty( 'Task' ) ) useTasksStore.getState().setTasksData( data.Task );
            if ( data.hasOwnProperty( 'TaskGoal' ) ) useTasksStore.getState().setTaskGoalsData( data.TaskGoal );
            if ( data.hasOwnProperty( 'TaskList' ) ) useTasksStore.getState().setTodoLists( data.TaskList );
            if ( data.hasOwnProperty( 'TaskListGroup' ) ) {
                useTasksStore.getState().setCustomGroups( data.TaskListGroup );
                useTasksStore.getState().setGroups( data.TaskListGroup );
            }

            // Reminder
            if ( data.hasOwnProperty( 'Reminder' ) ) useNotificationsStore.getState().setReminderData( data.Reminder );
            if ( data.hasOwnProperty( 'Notification' ) ) useReminderStore.getState().setNotificationData( data.Notification );


            // Workspace
            if ( data.hasOwnProperty( 'Workspace' ) ) useGlobalStore.getState().setWorkspacesData( data.Workspace );
        }
    },

    reloadData: () => {
        set( ( data ) => ( { data: useGlobalStore.getState().getData() } ) );
    },

    getData: () => {
        const allData = {
            // Global data
            Workspace: useGlobalStore.getState().workspacesData,
            User: useGlobalStore.getState().usersData,

            // Reminders, Notifications
            Reminder: useReminderStore.getState().reminderData,
            Notification: useNotificationsStore.getState().notificationData,

            // Planner data
            Planner: usePlannerStore.getState().plannerData,
            Calendar: usePlannerStore.getState().calendarsData,
            Event: usePlannerStore.getState().eventsData,
            Goal: usePlannerStore.getState().goalsData,

            // Notes data
            Note: useNotesStore.getState().notesData,
            RecentFiles: useNotesStore.getState().notesRecentFiles,

            // Tasks data
            Task: useTasksStore.getState().tasksData,
            TaskList: useTasksStore.getState().todoLists,
            TaskListGroup: useTasksStore.getState().columns,
            TaskGoal: useTasksStore.getState().taskGoalsData,

            // Life / Reflect data
            Data: useReflectStore.getState().statsData,
            Stats: useReflectStore.getState().statsData,
            Habits: useReflectStore.getState().habitsData,
            Log: useReflectStore.getState().logsData,
        };

        // set( ( data ) => ( { data: allData } ) );
        return allData;
    },

    clearData: () => {
        // Reminders data
        useReminderStore.getState().setReminderData( [] );

        // Notifications data
        useNotificationsStore.getState().setNotificationData( [] );

        // Planner data
        usePlannerStore.getState().setCalendarsData( [] );
        usePlannerStore.getState().setPlannerData( [] );
        usePlannerStore.getState().setEventsData( [] );

        // Notes data
        useNotesStore.getState().setNotesRecentFiles( [] );
        useNotesStore.getState().setNotesData( [] );
        // useNotesStore.getState().setFilesData( [] );
        // useNotesStore.getState().setFoldersData( [] );

        // Todo lists data
        useTasksStore.getState().setTasksData( [] );
        useTasksStore.getState().setTodoLists( [] );
        useTasksStore.getState().setGroups( [] );
        useTasksStore.getState().setColumns( [] );
        useTasksStore.getState().setCustomGroups( [] );
        useTasksStore.getState().setTaskGoalsData( [] );

        // Reflect dashboard data
        useReflectStore.getState().setStatsData( [] );
        useReflectStore.getState().setHabitsData( [] );
        useReflectStore.getState().setLogsData( [] );
    },

    wipeData: () => {
        const pass = 'placeholder-passkey';
        // Reminders data
        useReminderStore.getState().clearReminderData( pass );

        // Notifications data
        useNotificationsStore.getState().clearNotificationData( pass );

        // Planner data
        usePlannerStore.getState().clearPlannerData( pass );
        usePlannerStore.getState().clearCalendarData( pass );
        usePlannerStore.getState().clearEventData( pass );

        // Notes data
        useNotesStore.getState().clearNoteData( pass );
        // useNotesStore.getState().setFilesData( [] );
        // useNotesStore.getState().setFoldersData( [] );

        // Todo lists data
        useTasksStore.getState().clearTaskData( pass );

        // Reflect dashboard data
        useReflectStore.getState().clearLogsData( pass );
        useReflectStore.getState().clearStatsData( pass );
        useReflectStore.getState().clearHabitsData( pass );
    },

    fullWipeData: () => {
        // Workspaces Data
        get().setWorkspacesData( [] );

        // User data
        get().setUsersData( [] );
        get().setData( null );

        // User data is now null, and we no longer have a workspace set, so sign the user out and redirect to the login screen or landing page.
        get().setUser( null );
        get().userToken( null );
        get().userLoggedIn( false );
        get().workspaceId( null );

        localStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
        sessionStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
    },

    getDataOfType: ( dataType ) => {
        // Global data
        dataType = String( dataType ).toLowerCase();

        switch ( dataType ) {
            case "workspace":
                return useGlobalStore.getState().workspacesData;
            case "user":
                return useGlobalStore.getState().usersData;
            case "reminder":
                return useReminderStore.getState().reminderData;
            case "notification":
                return useNotificationsStore.getState().notificationData;
            case "planner":
                return usePlannerStore.getState().plannerData;
            case "calendar":
                return usePlannerStore.getState().calendarsData;
            case "event":
                return usePlannerStore.getState().eventsData;
            case "journal":
            case "log":
                return useReflectStore.getState().logsData;
            case "goal":
                return usePlannerStore.getState().goalsData;
            case "recentnotes":
                return useNotesStore.getState().notesRecentFiles;
            case "note":
                return useNotesStore.getState().notesData;
            case "todo":
            case "task":
                return useTasksStore.getState().tasksData;
            case "todolist":
            case "tasklist":
                return useTasksStore.getState().todoLists;
            case "todolistgroup":
            case "tasklistgroup":
                return useTasksStore.getState().columns;
            case "taskgoal":
                return useTasksStore.getState().taskGoalsData;
            case "data":
                return useReflectStore.getState().statsData;
            case "stats":
                return useReflectStore.getState().statsData;
            case "habits":
                return useReflectStore.getState().habits;
            case "trash":
                return [];
            default:
                return [];
        }

        // set( ( data ) => ( { data: allData } ) );
    },
} );

const createRoutesSlice = ( set, get, api ) => ( {
    // const [ state, dispatch ] = useReducer(
    //     function reducer ( state, action ) {
    //         switch ( action.type ) {
    //             case 'incremented_age': {
    //                 return {
    //                     name: state.name,
    //                     age: state.age + 1
    //                 };
    //             }
    //             case 'changed_name': {
    //                 return {
    //                     name: action.nextName,
    //                     age: state.age
    //                 };
    //             }
    //         }
    //         throw Error( 'Unknown action: ' + action.type );
    //     },
    //     { age: 42 }
    // );

    getRoute: ( dataType, queryType ) => {
        const { schemas } = get();
        if ( dataType && dataType !== '' ) {
            dataType = dataType?.toLowerCase();
            switch ( dataType ) {
                // case 'workspace':
                //     return ( data ) => ( handleCreateStart_workspace( data, 'event' ) );
                // case 'user':
                //     return ( data ) => ( handleCreateStart_workspace( data, 'user' ) );
                // case 'reminder':
                //     return ( data ) => ( handleCreateReminderStart( data ) );
                // case 'planner':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'event':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'log':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'calendar':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'day':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'note':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'task':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'todoList':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'goal':
                //     return ( data ) => ( handleCreateStart( data, dataType ) );
                // case 'mindspace':
                // return ( schemas?.app?.mindspace?.mindspace );
                default:
                    return null;
            }
        }
    },
} );

const createSchemaSlice = ( set, get, api ) => ( {
    schemas: null,
    setSchemas: ( schemas ) => {
        set( () => ( { schemas: schemas } ) );
        // if ( data && path ) {
        //     if ( data.hasOwnProperty( path[ path.length - 1 ] ) ) {
        //     }
        // }
    },

    // Fetch request variables
    requestFetchSchemas: false,
    setRequestFetchSchemas: ( requestFetchSchemas ) =>
        set( () => ( { requestFetchSchemas } ) ),

    fetchSchemas: async () => {
        set( () => ( { loading: true } ) );
        try {
            const response = await API.get( `/api/schema/app/compass/schema` );
            console.log( "App.js :: handleFetchSchemas :: response = ", response );

            set( () => ( {
                schemas: response?.data?.data,
                loading: false,
                error: null,
            } ) );

            return response?.data?.data;
        } catch ( err ) {
            set( () => ( { error: err.response?.data?.message || 'Failed to fetch schemas' } ) );
        } finally {
            set( () => ( { loading: false, error: null } ) );
        }
    },

    getSchema: ( type ) => {
        const { schemas } = get();
        if ( schemas && type && type !== '' ) {
            type = type?.toLowerCase();
            switch ( type ) {
                case 'workspace':
                    return ( schemas?.app?.workspace?.workspace );
                case 'user':
                    return ( schemas?.app?.user?.user );
                case 'calendar':
                    return ( schemas?.app?.planner?.calendar );
                case 'planner':
                    return ( schemas?.app?.planner?.planner );
                case 'event':
                    return ( schemas?.app?.planner?.event );
                case 'day':
                    return ( schemas?.app?.planner?.day );
                case 'note':
                    return ( schemas?.app?.note?.note );
                case 'record':
                    return ( schemas?.app?.note?.record );
                case 'todolistgroup':
                    return ( schemas?.app?.task?.todoListGroup );
                case 'todolist':
                    return ( schemas?.app?.task?.todoList );
                case 'goal':
                    return ( schemas?.app?.task?.goal );
                case 'task':
                    return ( schemas?.app?.task?.task );
                // case 'mindspace':
                // return ( schemas?.app?.mindspace?.mindspace );
                case 'reminder':
                    return ( schemas?.app?.time?.reminder );
                case 'notification':
                    return ( schemas?.app?.time?.notification );
                case 'recurrence':
                    return ( schemas?.app?.time?.recurrence );
                case 'data':
                    return ( schemas?.app?.reflect?.data );
                case 'stats':
                    return ( schemas?.app?.reflect?.stats );
                case 'habits':
                    return ( schemas?.app?.reflect?.habits );
                case 'journal':
                    return ( schemas?.app?.reflect?.journal );
                case 'log':
                    return ( schemas?.app?.reflect?.log );
                case 'insights':
                    return ( schemas?.app?.reflect?.insights );
                case 'settings':
                    return ( schemas?.app?.config?.setting );
                default:
                    return null;
            }
        }
    },
} );

const createUISlice = ( set, get, api ) => (
    {
        //        // UI State //      //
        loading: false,
        setLoading: ( loading ) => { set( { loading: loading } ); },

        // Special loading state variable for gating off the dashboard until the data for a user and their selected workspace has been loaded in, or failed trying. 
        loadingDB: false,
        setLoadingDB: ( loadingDB ) => { set( { loadingDB: loadingDB } ); },
        errorLoadingDB: false,
        setErrorLoadingDB: ( errorLoadingDB ) => { set( { errorLoadingDB: errorLoadingDB } ); },

        theme: 'light',
        // getTheme: () => { return localStorage.getItem( THEME_STORAGE_NAME ); },

        setTheme: ( theme ) => set( () => ( { theme } ) ),

        // setTheme: ( theme ) => {
        //     // Save to localstorage.
        //     localStorage.setItem(
        //         [ 'mindspace', 'app', 'theme', 'mode' ].join( '_' ),
        //         JSON.stringify( theme )
        //     );
        //     set( () => ( { theme: theme } ) );
        // },

        // Sidebar variables
        openSidebar: false,
        // setOpenSidebar: ( openSidebar ) => set( () => ( { openSidebar } ) ),
        setOpenSidebar: ( openSidebar ) => {
            SetLocal( SIDEBAR_MAIN_STATE_NAME, openSidebar );
            set( () => ( { openSidebar } ) );
        },
        toggleOpenSidebar: () => {
            SetLocal( SIDEBAR_MAIN_STATE_NAME, !get().openSidebar );
            set( ( state ) => ( { openSidebar: !state.openSidebar } ) );
        },

        openSidebarPrimary: true,
        setOpenSidebarPrimary: ( openSidebarPrimary ) => {
            SetLocal( SIDEBAR_PRIMARY_STATE_NAME, openSidebarPrimary );
            set( () => ( { openSidebarPrimary } ) );
        },
        toggleOpenSidebarPrimary: () => {
            SetLocal( SIDEBAR_PRIMARY_STATE_NAME, !get().openSidebarPrimary );
            set( ( state ) => ( { openSidebarPrimary: !state.openSidebarPrimary } ) );
        },

        sidebarContentPrimary: null,
        setSidebarContentPrimary: ( sidebarContentPrimary ) =>
            set( () => ( { sidebarContentPrimary } ) ),

        sidebarPrimaryActiveTab: "nav-tree",
        setSidebarPrimaryActiveTab: ( sidebarPrimaryActiveTab ) =>
            set( () => ( { sidebarPrimaryActiveTab } ) ),

        openSidebarSecondary: false,
        setOpenSidebarSecondary: ( openSidebarSecondary ) => {
            SetLocal( SIDEBAR_SECONDARY_STATE_NAME, openSidebarSecondary );
            set( () => ( { openSidebarSecondary } ) );
        },
        toggleOpenSidebarSecondary: () => {
            SetLocal( SIDEBAR_SECONDARY_STATE_NAME, !get().openSidebarSecondary );
            set( ( state ) => ( { openSidebarSecondary: !state.openSidebarSecondary } ) );
        },

        sidebarContentSecondary: null,
        setSidebarContentSecondary: ( sidebarContentSecondary ) =>
            set( () => ( { sidebarContentSecondary } ) ),

        sidebarRightMaximized: true,
        setSidebarRightMaximized: ( sidebarRightMaximized ) =>
            set( () => ( { sidebarRightMaximized } ) ),
        toggleOpenSidebarRightMaximized: () => {
            set( ( state ) => ( { sidebarRightMaximized: !state.sidebarRightMaximized } ) );
        },

        sidebarSecondaryActiveTab: "today",
        setSidebarSecondaryActiveTab: ( sidebarSecondaryActiveTab ) =>
            set( () => ( { sidebarSecondaryActiveTab } ) ),
    }
);

// const createNotifySlice = ( set, get, api ) => ( {
//     reminders: null,
//     setReminders: ( reminders ) => {
//         set( { reminders: reminders } );
//     },

//     activeReminders: null,
//     setActiveReminders: ( activeReminders ) => {
//         set( { activeReminders: activeReminders } );
//     },

//     notifications: null,
//     setNotifications: ( notifications ) => {
//         set( { notifications: notifications } );
//     },
//     activeNotifications: false,
//     setActiveNotifications: ( activeNotifications ) => set( () => ( { activeNotifications } ) ),
//     addNotification: ( notification ) =>
//         set( ( state ) => ( {
//             notifications: [
//                 ...state.notifications,
//                 { id: uuidV4(), ...notification },
//             ],
//         } ) ),
//     dismissNotification: ( id ) =>
//         set( ( state ) => ( {
//             notifications: state.notifications.filter(
//                 ( notification ) => notification.id !== id,
//             ),
//         } ) ),
// } );

const createNavSlice = ( set, get, api ) => ( {
    dashboardActive: 'dash/home',
    setDashboardActive: ( dashboardActive ) => set( () => ( { dashboardActive } ) ),

    navCurrentPath: [ 'dash', 'home' ],
    setNavCurrentPath: ( navCurrentPath ) => set( () => ( { navCurrentPath } ) ),

    navActiveEndpoint: 'dash/home',
    setNavActiveEndpoint: ( navActiveEndpoint ) => set( () => ( { navActiveEndpoint } ) ),

    navActiveConfig: null,
    setNavActiveConfig: ( navActiveConfig ) => set( () => ( { navActiveConfig } ) ),
} );

const createDebugSlice = ( set, get, api ) => ( {
    debug: false,
    setDebug: ( debug ) => set( () => ( { debug } ) ),

    error: null,
    setError: ( error ) => {
        set( { error: error } );
    },
} );

// const [ state, dispatch ] = useReducer(
//     function reducer ( state, action ) {
//         switch ( action.type ) {
//             case 'incremented_age': {
//                 return {
//                     name: state.name,
//                     age: state.age + 1
//                 };
//             }
//             case 'changed_name': {
//                 return {
//                     name: action.nextName,
//                     age: state.age
//                 };
//             }
//         }
//         throw Error( 'Unknown action: ' + action.type );
//     },
//     { age: 42 }
// );

const useGlobalStore = create(
    // devtools( ( set, get, api ) => ( {  } ),
    devtools(
        persist(
            ( ...a ) => ( {
                // Combine other sub-store slices. 
                ...createUISlice( ...a ),
                ...createNavSlice( ...a ),
                ...createDataSlice( ...a ),
                ...createUserSlice( ...a ),
                ...createDebugSlice( ...a ),
                ...createRoutesSlice( ...a ),
                ...createSchemaSlice( ...a ),
                // ...createNotifySlice( ...a ),
                ...createWorkspacesSlice( ...a ),
                ...createUserIntegrationsSlice( ...a ),
            } ),
            // { name: [ ZUSTAND_GLOBAL_STORE_STORAGE_NAME ], getStorage: () => localStorage, },
            // { name: [ ZUSTAND_TASKS_STORE_STORAGE_NAME ], getStorage: () => localStorage },
            {
                name: [ ZUSTAND_GLOBAL_STORE_STORAGE_NAME ],
                partialize: ( state ) => ( {
                    user: state.user,
                    userLoggedIn: state.userLoggedIn,
                    userToken: state.userToken,
                    usersData: state.usersData,
                    theme: state.theme,
                    reminders: state.reminders,
                    workspaceId: state.workspaceId,
                    openSidebar: state.openSidebar,
                    activeWorkspace: state.activeWorkspace,
                    workspacesData: state.workspacesData,
                    dashboardActive: state.dashboardActive,
                    navCurrentPath: state.navCurrentPath,
                    navActiveConfig: state.navActiveConfig,
                    navActiveEndpoint: state.navActiveEndpoint,
                    openSidebar: state.openSidebar,
                    openSidebarPrimary: state.openSidebarPrimary,
                    sidebarContentPrimary: state.sidebarContentPrimary,
                    sidebarPrimaryActiveTab: state.sidebarPrimaryActiveTab,
                    openSidebarSecondary: state.openSidebarSecondary,
                    sidebarContentSecondary: state.sidebarContentSecondary,
                    sidebarRightMaximized: state.sidebarRightMaximized,
                    sidebarSecondaryActiveTab: state.sidebarSecondaryActiveTab,
                } ),
                getStorage: () => localStorage
            },
        ),
    ),
);

// console.log( 'useGlobalStore = ', useGlobalStore );

export default useGlobalStore;


/*  const Gifts = {
        123: { id: 123, name: "Gift Card", valueInUSD: 60 },
        456: { id: 456, name: "Custom T-Shirt", valueInUSD: 20 }
    };
    import { createStore } from "./store";
    const useStore = createStore( ( set, get ) => ( {
        currentGift: Gifts[ 123 ],
        count: 0,
        shouldDisplayTotal: false,
        switchGift: () =>
            set( ( state ) => {
                state.currentGift =
                    state.currentGift.id === 123 ? Gifts[ 456 ] : Gifts[ 123 ];
                state.shouldDisplayTotal = false;
            } ),
        decrement: () =>
            set( ( state ) => {
                if ( state.count > 0 ) {
                    state.count--;
                    state.shouldDisplayTotal = false;
                }
            } ),
        increment: () =>
            set( ( state ) => {
                state.count++;
                state.shouldDisplayTotal = false;
            } ),

        calcTotal: () => {
            const { currentGift, count } = get();
            return currentGift.valueInUSD * count;
        },

        displayTotal: () => set( { shouldDisplayTotal: true } )
    } ) );

    export default function App () {
        return (
            <div>
                <h1>Pick your gift!</h1>
                <CurrentGift />
                <br />
                <GiftsCount />
                <br />
                <Total />
            </div>
        );
    }

    function CurrentGift () {
        console.log( "Rendering CurrentGift" );
        const [ currentGift, switchGift ] = useStore(
            ( state ) => [ state.currentGift, state.switchGift ],
            shallow
        );

        return (
            <div>
                <div>
                    #{ currentGift.id } { currentGift.name } - ${ currentGift.valueInUSD }
                </div>
                <div>
                    <button onClick={ switchGift }>Change</button>
                </div>
            </div>
        );
    }

    const GiftsCount = () => {
        console.log( "Rendering GiftsCount" );
        const { count, decrement, increment } = useStore(
            ( state ) => ( {
                count: state.count,
                decrement: state.decrement,
                increment: state.increment
            } ),
            shallow
        );

        return (
            <div>
                <div>Count: { count }</div>
                <div>
                    <button onClick={ decrement }>Decrement</button>
                    <button onClick={ increment }>Increment</button>
                </div>
            </div>
        );
    };

    function Total () {
        console.log( "Rendering Total" );
        const shouldDisplayTotal = useStore( ( state ) => state.shouldDisplayTotal );
        const displayTotal = useStore( ( state ) => state.displayTotal );
        const calcTotal = useStore( ( state ) => state.calcTotal );

        if ( shouldDisplayTotal ) {
            const total = calcTotal();
            return <div>Total: ${ total }</div>;
        }

        return (
            <div>
                <button onClick={ displayTotal }>Calculate total</button>
            </div>
        );
    }
*/

/*  setNotesDirectoryPath: ( id ) => {
        console.log( "store.js :: setNotesDirectoryPath = ", setNotesDirectoryPath, " :: ", "id = ", id );
        if ( id ) {
            let directoryTree = api.getState().notesDirectoryTree;
            let newPath = findAbsolutePath(
                directoryTree,
                id
            );
 
            set( () => ( { notesDirectoryPath: newPath } ) );
        }
    },
    
    fetchNotesDirectoryTree: async () => {
        const directory = await fetchDirectoryTree( workspaceId );
        set( () => ( { notesDirectoryTree: directory } ) );
        set( () => ( { notesActiveFolder: directory } ) );
    },

    // Updates the current path
    updatePath: ( newPath ) => set( { notesDirectoryPath: newPath } ),
 
    // Adds an ID to the current path
    navigateTo: ( id ) => {
        const updatedPath = [ ...get().notesDirectoryPath, id ];
        set( { notesDirectoryPath: updatedPath } );
    },
 
    // Removes the last ID from the current path (Backtracking)
    navigateBack: () => {
        const updatedPath = [ ...get().notesDirectoryPath ];
        updatedPath.pop();
        set( { notesDirectoryPath: updatedPath } );
    },
 
    // Fetches folder details based on the last ID in the current path
    fetchCurrentFolder: () => {
        const path = get().notesDirectoryPath;
        const currentFolderId = path[ path.length - 1 ]; // Last ID in the path
 
        // Find the full folder object defined by the currentFolderId.
        if ( utils.val.isValidArray( notesDirectoryPath, true ) && utils.val.isValidArray( notesDirectoryTree, true ) ) {
            notesDirectoryPath.forEach( ( path, index ) => {
 
            } );
        }
        set( { notesDirectoryTree: data } );
    },

    fetchNotesForActiveWorkspace: async () => {
        // Using an external state to fetch data in another store.
        // const activeWorkspace = useWorkspacesStore.getState().activeWorkspace;

        const activeWorkspace = get().activeWorkspace;
        if ( !activeWorkspace ) {
            console.error( 'No active workspace selected.' );
            return;
        }

        try {
            const response = await fetch(
                `/api/app/note/path/directory?workspaceId=${ activeWorkspace?._id }`,
            );
            const data = await response.json();
            console.log( "Store.js :: fetchNotesForActiveWorkspace :: data = ", data );
            set( () => ( { notesDirectoryTree: data } ) );
        } catch ( err ) {
            console.error( 'Store.js :: fetchNotesForActiveWorkspace :: Failed to fetch notes:', err?.response?.data?.message );
        }
    },

    fetchNotesDirectoryTree: async ( workspaceId ) => {
        if ( !workspaceId ) {
            // WorkspaceId required.
            console.error( "store.js :: fetchNotesDirectoryTree :: workspaceId must be provided and valid." );
            return;
        }

        try {
            set( { loading: true, error: null } );
            const response = await axios.get( `/api/app/note/path/explorer?workspaceId=${ workspaceId }` );
            set( { notesDirectoryTree: response?.data?.data } );
        } catch ( err ) {
            set( { error: err?.response?.data?.message || "Error fetching notes tree" } );
            console.error( "Error fetching notes tree:", err?.response?.data?.message );
        } finally {
            set( { loading: false } );
        }
    },

    // Create a new file
    createFile: async ( workspaceId, parentId, fileData ) => {
        try {
            set( { loading: true, error: null } );
            const response = await axios.post( "/api/app/note/file/", {
                workspaceId,
                parentId,
                ...fileData,
            } );

            // Add the new file to the appropriate folder in the tree
            const newFile = response.data.data;
            const updatedTree = get().notesDirectoryTree.map( ( node ) =>
                updateNodeWithNewFileOrFolder( node, parentId, newFile, "file" )
            );
            set( { notesDirectoryTree: updatedTree } );
        } catch ( err ) {
            set( { error: err?.response?.data?.message || "Error creating file" } );
            console.error( "Error creating file:", err?.response?.data?.message );
        } finally {
            set( { loading: false } );
        }
    },

    // Create a new folder
    createFolder: async ( workspaceId, parentId, folderData ) => {
        try {
            set( { loading: true, error: null } );
            const response = await axios.post( "/api/app/note/folder/", {
                workspaceId,
                parentId,
                ...folderData,
            } );

            // Add the new folder to the appropriate folder in the tree
            const newFolder = response.data.data;
            const updatedTree = get().notesDirectoryTree.map( ( node ) =>
                updateNodeWithNewFileOrFolder( node, parentId, newFolder, "folder" )
            );
            set( { notesDirectoryTree: updatedTree } );
        } catch ( err ) {
            set( { error: err?.response?.data?.message || "Error creating folder" } );
            console.error( "Error creating folder:", err?.response?.data?.message );
        } finally {
            set( { loading: false } );
        }
    },
*/

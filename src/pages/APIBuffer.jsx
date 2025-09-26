// This component's purpose is to preload the required data for each section of the app when prompted, and on component mount. This will handle all the requests to re-fetch data as well. 
// Dependencies
import React, { useState, useEffect, useRef, useId, useMemo, useCallback } from "react";
// Usehooks
import useAuth from '@/lib/hooks/useAuth';
import useTask from '@/lib/hooks/useTask';
import useNotes from '@/lib/hooks/useNotes';
import usePlanner from '@/lib/hooks/usePlanner';
import useWorkspace from '@/lib/hooks/useWorkspace';
import useLocalStorage from '@/lib/hooks/useLocalStorage';

// Data stores
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import useNotesStore from '@/store/note.store';
import useTasksStore from '@/store/task.store';

// Utilities
import * as utils from 'akashatools';
import { SIDEBAR_PRIMARY_STATE_NAME, SIDEBAR_SECONDARY_MAXIMIZED_NAME, SIDEBAR_SECONDARY_STATE_NAME } from "@/lib/config/constants";
import useReflect from "@/lib/hooks/useReflect";
import useMessage from "@/lib/hooks/useMessage";
import API from "@/lib/services/api";
import { useSync } from "@/lib/hooks/useSync";
import { isInvalid } from "@/lib/utilities/data";
import useReminderStore from "@/store/reminder.store";
import useNotificationsStore from "@/store/notification.store";
import useStatsStore from "@/store/stats.store";
import useReflectStore from "@/store/reflect.store";
import { handleFetch } from "akashatools/lib/Http";

const APIBuffer = ( {
    importData, settings,
    access,
    children,
} ) => {

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        requestFetchSchemas, setRequestFetchSchemas,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        data, setData, getData, reloadData, wipeData, getDataOfType,
        schemas, setSchemas, getSchema, fetchSchemas,
        user, setUser,
        usersData, setUsersData,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken,
        settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        openSidebar, setOpenSidebar,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        sidebarRightMaximized, setSidebarRightMaximized, toggleOpenSidebarRightMaximized,
        fetchWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
        loadingDB, setLoadingDB,
        errorLoadingDB, setErrorLoadingDB,
    } = useGlobalStore();

    const {
        GetLocal,
        SetLocal,
        DeleteLocal,
    } = useLocalStorage();

    // React data-fetch hooks.
    const {
        // Variables
        // userLoggedIn,
        // setUserLoggedIn,
        authData, setAuthData,
        user: authUserData,
        userToken: authUserToken, setUserToken: setAuthUserToken,
        error: authError,
        loading: authLoading,
        debug: authDebug, setDebug: setAuthDebug,
        handleAuthRouting,

        // Fetch functions
        login,
        signup,
        authUser,
        verifyUser,

        // Other functions.
        handleGetUserList,

        // Getter / Setter functions
        SetToken,
        GetToken,
        DeleteToken,
    } = useAuth( true, {
        onLogin: ( userData, token ) => {
            console.log( "APIBuffer.jsx :: useAuth callback functions :: onLogin :: ( userData, token ) = ", userData, token );
        },
        onLogout: ( user ) => {
            console.log( "APIBuffer.jsx :: useAuth callback functions :: onLogout :: ( user ) = ", user );
        },
        onTokenRefresh: ( token ) => {
            console.log( "APIBuffer.jsx :: useAuth callback functions :: onTokenRefresh :: ( token ) = ", token );
        },
    } );

    const {
        // VARIABLES
        workspaceSchema, setWorkspaceSchema,

        // HANDLER FUNCTIONS
        handleFetchWorkspaces,
        handleAddWorkspace,
        handleEditWorkspace,
        handleEditStart,
        handleCreateStart,
        handleEditCancel,
        handleCreateCancel,
        handleDeleteWorkspace,
        handleSetFocusedWorkspace,
        handleSetActiveWorkspace,
        handleInputChange: handleInputChangeWorkspace,
    } = useWorkspace();

    const {
        requestFetchEvents, setRequestFetchEvents,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        selectedEvent, setSelectedEvent,
        calendarsData, setCalendarsData,
        selectedDate, setSelectedDate,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData,
        fetchTasks,
        todoLists, setTodoLists,
        activeListId, setActiveList, setActiveListId,
        groups, setGroups,
        customGroups, setCustomGroups,
        taskGoalsData, setTaskGoalsData,
        addGoal, createGoal, updateGoal, deleteGoal, getGoalById,
        loading: loadingTasks, setLoading: setLoadingTasks,
        error: errorTasks, setError: setErrorTasks,
    } = useTasksStore();

    const {
        // VARIABLES
        // HANDLER FUNCTIONS
        taskSchema, setTaskSchema,
        taskListSchema, setTaskListSchema,
        taskListGroupSchema, setTaskListGroupSchema,
        goalSchema, setGoalSchema,
        handleFetchTasks,
        handleFetchTodoLists,
        handleFetchTodoListGroups,
    } = useTask();

    const {
        // HANDLER FUNCTIONS
        eventSchema, setEventSchema,
        calendarSchema, setCalendarSchema,
        plannerSchema, setPlannerSchema,
        handleChange,
        handleGetEventsData,
        handleGetPlannersData,
        handleGetCalendarsData,
        handleGetCalendarsWithEvents,
        handleGetEventsInDateRangeData,

        // DIALOG MENUS
        buildEventDialog,
        buildGoToDialog,
        buildDialog,
    } = usePlanner();

    const {
        filesData, setFilesData,
        foldersData, setFoldersData,
        requestFetchTree, setRequestFetchTree,
        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        notesRecentFiles, setNotesRecentFiles,
        notesActiveFile, setNotesActiveFile,
        notesActiveFolder, setNotesActiveFolder,
        notesActiveFolderContents, setNotesActiveFolderContents,
        notesDirectoryTree, setNotesDirectoryTree,
        notesDirectoryPath, setNotesDirectoryPath,
        fetchNotesDirectoryTree, setNotesDirectoryPathBack,
        findObjectByPath,
        findPathById,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();


    // React data-fetch hooks.
    const {
        // VARIABLES
        noteSchema, setNoteSchema,
        stickyNoteSchema, setStickyNoteSchema,
        handleBuildNoteDialog,

        // HANDLER FUNCTIONS
        handleSaveFile,
        handleGoBack,
        handleCreateNote,
        handleOpenFile,
        handleOpenFolder,
        handleOpenFolderContents,
        handleCreateFile,
        handleCreateFolder,
        handleEditFile,
        handleEditFolder,
        handleEditFolderStart,
        handleEditFileStart,
        handleCreateFolderStart,
        handleCreateFileStart,
        handleEditCancel: handleEditCancelNotes,
        handleCreateCancel: handleCreateCancelNotes,
        handleDeleteFile,
        handleDeleteFolder,
        handleInputChange: handleInputChangeNotes,
        handleChangeNode,
        handleFetchNotesDirectoryTree,
        handleFetchRecentNotes,
        handleGetFolders,
        handleGetFiles,
        handleGetAllNotes,
        handleGetDirectoryTree,
        handleGetRecentNotes,

        // Extra notes logic
        fetchRecentNotesOnWorkspaceChange,
        updateFolderContents,
        updateFileContents,
        fetchTreeOnRequest,
        handleChangesToDirectoryPath,
    } = useNotes();

    const {
        setLogSchema,
        setDataSchema,
        setStatsSchema,
        setHabitsSchema,
        handleFetchAllStats,
        handleFetchAllHabits,

        handleFetchLogById,
        handleFetchLogs,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,
    } = useReflect();

    const {
        requestFetchLogs, setRequestFetchLogs,
        statsData, setStatsData,
        logsData, setLogsData,
        selectedLog, setSelectedLog,
        habitsData, setHabitsData,
    } = useReflectStore();

    const {
        handleFetchAllReminders,
        handleFetchAllNotifications,
        reminderSchema, setReminderSchema,
        notificationSchema, setNotificationSchema,
    } = useMessage();
    const notificationData = useNotificationsStore( ( state ) => state.notificationData );
    const setNotificationData = useNotificationsStore( ( state ) => state.setNotificationData );
    const reminderData = useReminderStore( ( state ) => state.reminderData );
    const setReminderData = useReminderStore( ( state ) => state.setReminderData );

    const [ processingUserChange, setProcessingUserChange ] = useState( false );

    // Define all sync configurations in a single array

    // Define all sync configurations in a single array
    const syncConfigs = [
        {
            key: 'usersData',
            valueToWatch: usersData,
            interval: 30000, // Check user every 15 seconds
            emptyPermitted: false,
            syncFunction: () => handleGetUserList(),
            // onSyncSuccess: ( data ) => ( setUsersData( data ) ),
        },
        // {
        //     key: 'user',
        //     valueToWatch: user,
        //     interval: 10000, // Check user every 15 seconds
        //     emptyPermitted: false,
        //     syncFunction: () => verifyUser(),
        //     // onSyncSuccess: ( data ) => ( setUser( data ) ),
        // },
        {
            key: 'workspaces',
            valueToWatch: workspacesData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken ],
            syncFunction: () => handleFetchWorkspaces(),
            // onSyncSuccess: ( data ) => ( setWorkspacesData( data ) ),
        },
        {
            key: 'stats',
            valueToWatch: statsData,
            interval: 30000, // Check todos every 20 seconds
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchAllStats(),
            // onSyncSuccess: ( data ) => ( setStatsData( data ) ),
        },
        {
            key: 'habits',
            valueToWatch: habitsData,
            interval: 30000, // Check todos every 20 seconds
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchAllHabits(),
            // onSyncSuccess: ( data ) => ( setHabitsData( data ) ),
        },
        {
            key: 'todo',
            valueToWatch: tasksData,
            interval: 30000, // Check todos every 20 seconds
            emptyPermitted: true,
            prerequisites: [
                user,
                userLoggedIn,
                userToken,
                workspaceId,
                activeListId,
            ],
            syncFunction: () => handleFetchTasks(),
            // onSyncSuccess: ( data ) => ( setTasksData( data ) ),
        },
        {
            key: 'todoList',
            valueToWatch: todoLists,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchTodoLists(),
            // onSyncSuccess: ( data ) => ( setTodoLists( data ) ),
        },
        {
            key: 'todoListGroups',
            valueToWatch: customGroups,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [
                user,
                userLoggedIn,
                userToken,
                workspaceId,
                activeListId,
            ],
            syncFunction: () => handleFetchTodoListGroups(),
            // onSyncSuccess: ( data ) => ( setCustomGroups( data ) ),
        },
        // You can easily add more sync tasks here for other features
        {
            key: 'plannerEvents',
            valueToWatch: eventsData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            // syncFunction: () => ( handleGetEventsData() ),
            onSyncSuccess: ( data ) => setEventsData( data ),
        },
        {
            key: 'plannerCalendars',
            valueToWatch: calendarsData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => {
                handleGetCalendarsData();
                handleGetCalendarsWithEvents();
            },
            onSyncSuccess: ( data ) => setCalendarsData( data ),
        },
        {
            key: 'logs',
            valueToWatch: logsData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchLogs(),
            // onSyncSuccess: ( data ) => ( setLogsData( data ) ),
        },
        {
            key: 'habits',
            valueToWatch: habitsData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchAllHabits(),
            // onSyncSuccess: ( data ) => ( setHabitsData( data ) ),
        },
        {
            key: 'notes',
            valueToWatch: notesData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleGetAllNotes(),
            // onSyncSuccess: ( data ) => ( setNotesData( data ) ),
        },
        {
            key: 'reminders',
            valueToWatch: reminderData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchAllReminders(),
            // onSyncSuccess: ( data ) => ( setReminderData( data ) ),
        },
        {
            key: 'notifications',
            valueToWatch: notificationData,
            interval: 30000,
            emptyPermitted: true,
            prerequisites: [ user, userLoggedIn, userToken, workspaceId ],
            syncFunction: () => handleFetchAllNotifications(),
            // onSyncSuccess: ( data ) => ( setNotificationData( data ) ),
        },
    ];


    // Make a static, hopefully unchanging key for the fragment this utility component exports. 
    const bufferKey = useId();

    const handleSync = () => {
        // if ( isInvalid( schemas ) ) fetchSchemas();
        // handleFetchData();
        // initializeDatabase();
        if ( utils.val.isValid( workspaceId ) ) {
            // Planner
            if ( isInvalid( eventsData ) ) handleGetEventsData(); // Populates eventsData.
            if ( isInvalid( calendarsData ) ) handleGetCalendarsData(); // populates calendarsData.
            if ( isInvalid( plannersData ) ) handleGetPlannersData();
            // handleGetCalendarsWithEvents(); // populates calendarsData with all the event _ids replaced with the full event documents.

            if ( isInvalid( upcomingEventsData ) ) {
                handleGetEventsInDateRangeData( {
                    workspaceId,
                    startDate: upcomingEventsRange?.startDate,
                    endDate: upcomingEventsRange?.endDate,
                    numDays: upcomingEventsRange?.numDays,
                } );
            }

            // Notes
            if ( isInvalid( folderData ) || isInvalid( fileData ) || isInvalid( notesData ) ) {
                handleGetAllNotes();
            }
            if ( isInvalid( recentNotesData ) ) fetchRecentNotesOnWorkspaceChange();

            // Tasks
            if ( isInvalid( tasksData ) ) handleFetchTasks();
            if ( isInvalid( todoLists ) ) handleFetchTodoLists();
            if ( activeListId && isInvalid( customGroups ) ) {
                handleFetchTodoListGroups();
            }

            // Reminders
            if ( isInvalid( reminderData ) ) handleFetchAllReminders();
            if ( isInvalid( notificationData ) ) handleFetchAllNotifications();

            // Reflect
            if ( isInvalid( logsData ) ) handleFetchLogs(); // Populates logsData.
            if ( isInvalid( statsData ) ) handleFetchAllStats(); // Populates logsData.
            if ( isInvalid( habitsData ) ) handleFetchAllHabits(); // Populates logsData.

        }
    };

    /* 
        useEffect( () => {
            // Set up the periodic check and store its ID.
            const intervalIds = [];
    
            const timerId = setInterval( () => {
                // Check each major data variable; if it is invalid, empty, null, or undefined, re-sync with the server.
                handleSync();
            }, 10000 );
            intervalIds.push( timerId );
    
            return () => {
                intervalIds.forEach( clearInterval );
            };
        }, [ workspaceId, isInvalid ] );
    
     */

    // A single call to the hook manages all sync operations
    const {
        syncLoading, setSyncLoading,
        syncError, setSyncError,
    } = useSync( syncConfigs );

    const showToastMessage = () => {
        toast.success( "Success Notification !", {
            position: "top-right"
        } );
    };

    // Make sure a visitor is successfully logged in before letting them access any page other than "/login".
    // useEffect( () => {
    //     // Fetch user data on component load and populate store variables with useHook variables. 
    //     // Check to see if there's a token. 
    //     const doAuthUser = async () => {
    //         let authedUserData = await verifyUser();
    //         if ( authedUserData ) {
    //             let token;
    //             console.log( "App.jsx :: doAuthUser :: authedUserData = ", authedUserData );
    //             if ( utils.ao.has( authedUserData, 'token' ) ) { token = authedUserData?.token; }
    //             else { token = GetToken(); }

    //             if ( authUserData || authedUserData ) setUser( authUserData || authedUserData );
    //             // if ( authUserToken ) setUserToken( authUserToken );
    //             if ( token ) setUserToken( authUserToken );
    //             if ( userLoggedIn ) setUserLoggedIn( userLoggedIn );

    //                 console.log(
    //                     "App.jsx",
    //                     " :: ", "on component load :: handling login for user",
    //                     " :: ", "authedUserData = ", authedUserData,
    //                     " :: ", "authUserData = ", authUserData,
    //                     " :: ", "authUserToken = ", authUserToken,
    //                     " :: ", "userLoggedIn = ", userLoggedIn
    //                 );

    //             /*  
    //                 if ( authedUserData ) {
    //                     console.log( "App.jsx :: authedUserData = ", authedUserData );
    //                     setUser( authedUserData );
    //                 }
    //                 else if ( authUserData ) {
    //                     console.log( "App.jsx :: authUserData = ", authUserData );
    //                     setUser( authUserData );
    //                 }

    //                 if ( authUserToken ) {
    //                     console.log( "App.jsx :: authUserToken = ", authUserToken );
    //                     setUserToken( authUserToken );
    //                 }

    //                 if ( userLoggedIn ) {
    //                     console.log( "App.jsx :: userLoggedIn = ", userLoggedIn );
    //                     setUserLoggedIn( userLoggedIn );
    //                 }
    //             */

    //             /* // let tok = GetToken();
    //             if ( token ) {
    //                 // Currently logged in, so delete the token to log them out, and send them to the home page.
    //                 window.history.pushState( "/dashboard", '', '/dashboard' );
    //                 redirect( '/dashboard' );
    //             } else {
    //                 // Not logged in. Send to login page.
    //                 window.history.pushState( "/login", '', '/login' );
    //                 redirect( '/login' );
    //             } */
    //         }
    //         else {
    //             // Not authed, send to login.
    //             // Not logged in. Send to login page.
    //             // redirect( '/login' );
    //         }
    //     };

    //     doAuthUser();

    //     // Next, load any UI data stored on the localstorage. 
    // }, [] );


    const handleFetchData = async () => {
        setLoading( true );
        setLoadingDB( true );
        if ( !workspaceId ) {
            setLoading( false );
            console.error( "[APIBuffer] :: An active workspace is required to fetch your data." );
            setError( "An active workspace is required to fetch your data." );
            return null;
        }
        try {
            const response = await API.get( `/api/schema/app/compass/data?workspaceId=${ workspaceId }` );
            console.log( "[APIBuffer] :: handleFetchData :: response = ", response, " :: ", "data currently = ", data );

            if ( response && response?.hasOwnProperty( 'data' ) && response?.data?.hasOwnProperty( 'data' ) ) {
                setData( response?.data?.data );
                handleLoadData( response?.data?.data );
                setLoading( false );
                return response?.data?.data;
            }
            else {
                setError( err?.response?.data?.message || 'API Buffer Error: Attempt to fetch database returned no data.' );
                setLoading( false );
                return null;
            }
        } catch ( err ) {
            setError( err?.response?.data?.message || 'API Buffer Error: Failed to fetch data.' );
            setErrorLoadingDB( err?.response?.data?.message || 'API Buffer Error: Failed to fetch data.' );
        } finally {
            setError( null );
            setLoading( false );
            setErrorLoadingDB( null );
            setLoadingDB( false );
        }
    };

    const handleLoadData = ( data ) => {
        console.log( '[APIBuffer] :: handleLoadData called. :: data given = ', data );
        // Sets all schemas across all the stores and usehook files. 
        if ( utils.val.isObject( data ) ) {
            // Notes
            if ( data.hasOwnProperty( 'Note' ) ) setNotesData( data.Note );
            // if ( data.hasOwnProperty( 'RecentFiles' ) ) setRecentNotesData( data.RecentFiles );

            // Reflect / Stats
            if ( data.hasOwnProperty( 'Stats' ) ) setStatsData( data.Stats );
            if ( data.hasOwnProperty( 'Habit' ) ) setLogsData( data.Habit );
            if ( data.hasOwnProperty( 'Log' ) ) setLogsData( data.Log );

            // Planner
            if ( data.hasOwnProperty( 'Event' ) ) setEventsData( data.Event );
            if ( data.hasOwnProperty( 'Planner' ) ) setPlannerData( data.Planner );
            if ( data.hasOwnProperty( 'Calendar' ) ) setCalendarsData( data.Calendar );

            // Todo
            if ( data.hasOwnProperty( 'Task' ) ) setTasksData( data.Task );
            if ( data.hasOwnProperty( 'TaskGoal' ) ) setTaskGoalsData( data.TaskGoal );
            if ( data.hasOwnProperty( 'TaskList' ) ) setTodoLists( data.TaskList );
            if ( data.hasOwnProperty( 'TaskListGroup' ) ) { setCustomGroups( data.TaskListGroup ); setgroups( data.TaskListGroup ); }

            // Reminder
            if ( data.hasOwnProperty( 'Reminder' ) ) setReminderData( data.Reminder );
            if ( data.hasOwnProperty( 'Notification' ) ) setNotificationData( data.Notification );
            if ( data.hasOwnProperty( 'Workspace' ) ) setWorkspacesData( data.Workspace );

            // Reflect
            if ( data.hasOwnProperty( 'Habits' ) ) setHabitsData( data.Habits );

            // Workspace
            // setWorkspaceSchema( data?.Workspace );
        }
    };

    const handleFetchSchemas = async () => {
        console.log( '[APIBuffer] :: handleFetchSchemas called. ' );
        setLoading( true );
        try {
            const response = await API.get( `/api/schema/app/compass/schema` );
            setSchemas( response?.data?.data );
            return response?.data?.data;
        } catch ( err ) {
            setError( err?.response?.data?.message || 'Failed to fetch schemas.' );
        } finally {
            setError( null );
            setLoading( false );
        }
    };

    const handleSetSchemas = () => {
        console.log( '[APIBuffer] :: handleSetSchemas called. ' );
        // Sets all schemas across all the stores and usehook files. 
        if ( schemas && utils.val.isObject( schemas ) ) {
            // Notes
            setNoteSchema( getSchema( 'note' ) );
            setStickyNoteSchema( getSchema( 'stickynote' ) );

            // Reflect / Stats
            setLogSchema( getSchema( 'log' ) );
            setDataSchema( getSchema( 'data' ) );
            setStatsSchema( getSchema( 'stats' ) );
            setHabitsSchema( getSchema( 'habits' ) );

            // Planner
            setEventSchema( getSchema( 'event' ) );
            setPlannerSchema( getSchema( 'planner' ) );
            setCalendarSchema( getSchema( 'calendar' ) );

            // Todo
            setGoalSchema( getSchema( 'goal' ) );
            setTaskSchema( getSchema( 'task' ) );
            setTaskListSchema( getSchema( 'todoList' ) );
            setTaskListGroupSchema( getSchema( 'todoListGroup' ) );

            // Reminder
            setReminderSchema( getSchema( 'reminder' ) );
            setNotificationSchema( getSchema( 'notification' ) );

            // Workspace
            setWorkspaceSchema( getSchema( 'workspace' ) );
        }
    };

    useEffect( () => {
        console.log( '[APIBuffer] :: handleGetEventsInDateRangeData :: upcomingEventsRange = ', upcomingEventsRange );
        if ( workspaceId ) {
            handleGetEventsInDateRangeData( {
                workspaceId,
                startDate: upcomingEventsRange?.startDate,
                endDate: upcomingEventsRange?.endDate,
                numDays: upcomingEventsRange?.numDays,
                // ...upcomingEventsRange
            } );
        }
    }, [ workspaceId, upcomingEventsRange ] );

    const initializeDatabase = async () => {
        let allData = await handleFetchData();
        console.log( '[APIBuffer] :: initializeDatabase :: allData fetched = ', allData );
        if ( allData ) {
            handleLoadData( allData );
        }
    };

    const handleUpdateActiveDashboard = () => {
        // Set active dashboard on load. 
        let path = location.pathname.split( '/' ).filter( x => x );
        let dashboardIndex = path.indexOf( 'dash' );
        let dashActive = ( path.length === dashboardIndex - 1 )
            ? ( 'dash' )
            : ( path[ dashboardIndex + 1 ] );
        setDashboardActive( dashActive );

        console.log( '[APIBuffer] :: handleUpdateActiveDashboard',
            ' :: ', 'path = ', path,
            ' :: ', 'dashboardIndex = ', dashboardIndex,
            ' :: ', 'dashActive = ', dashActive,
        );

        return dashActive;
    };

    const handleWorkspaceIdChange = useCallback(
        async ( wsId, activeDash ) => {
            // let activeDash = handleUpdateActiveDashboard();
            if ( !activeDash ) activeDash = handleUpdateActiveDashboard();
            console.log( '[APIBuffer] :: handleWorkspaceIdChange called. :: workspaceId = ', workspaceId, " :: ", "wsId = ", wsId, " :: ", "activeDash = ", activeDash );

            // On workspace ID change, fetch events and other data. 
            if ( utils.val.isValid( workspaceId ) ) {
                setLoadingDB( true );
                // setErrorLoadingDB();

                // First wipe current data, EXCEPT user data and workspace data. 
                // wipeData();

                // Planner
                await handleGetEventsData(); // Populates eventsData.
                await handleGetCalendarsData(); // populates calendarsData.
                await handleGetPlannersData();

                await handleGetCalendarsWithEvents(); // populates calendarsData with all the event _ids replaced with the full event documents.

                if ( debug === true )
                    console.log( '[APIBuffer] :: handleGetEvents InDateRangeData :: upcomingEventsRange = ', upcomingEventsRange );
                await handleGetEventsInDateRangeData( {
                    workspaceId,
                    startDate: upcomingEventsRange?.startDate,
                    endDate: upcomingEventsRange?.endDate,
                    numDays: upcomingEventsRange?.numDays,
                    // ...upcomingEventsRange
                } );

                // Notes
                await handleGetAllNotes(); // Populates all notes data. 
                await handleGetDirectoryTree();
                await handleGetRecentNotes();

                // Tasks
                await handleFetchTodoLists();

                if ( activeListId ) {
                    await handleFetchTodoListGroups();
                }
                else {
                    setActiveListId( utils.val.isValidArray( todoLists, true ) ? todoLists?.[ 0 ]?._id : null );
                }

                await handleFetchTasks();

                // Reminders
                await handleFetchAllReminders();

                // Reflect
                await handleFetchLogs(); // Populates logsData for journal.
                await handleFetchAllStats();
                await handleFetchAllHabits();

                setLoadingDB( false );
            }
        }
        , [ workspaceId, user ] );

    const handleFetchPriorityData = async ( activeDash, priorityComplete = false ) => {

        console.log( "[APIBuffer] :: handleFetchPriorityData :: activeDash = ", activeDash, " :: ", "priorityComplete = ", priorityComplete, " :: ", "workspaceId = ", workspaceId );
        // On workspace ID change, fetch events and other data. 
        if ( utils.val.isValid( workspaceId ) ) {
            // Planner
            if ( ( activeDash === 'planner' && !priorityComplete ) || ( priorityComplete === true ) ) {
                await handleGetEventsData(); // Populates eventsData.
                await handleGetCalendarsData(); // populates calendarsData.
                await handleGetPlannersData();
                await handleGetCalendarsWithEvents(); // populates calendarsData with all the event _ids replaced with the full event documents.
                if ( debug === true )
                    console.log( '[APIBuffer] :: handleGetEvents InDateRangeData :: upcomingEventsRange = ', upcomingEventsRange );
                await handleGetEventsInDateRangeData( {
                    workspaceId,
                    startDate: upcomingEventsRange?.startDate,
                    endDate: upcomingEventsRange?.endDate,
                    numDays: upcomingEventsRange?.numDays,
                    // ...upcomingEventsRange
                } );
            }

            // Notes
            if ( ( activeDash === 'notes' && !priorityComplete ) || ( priorityComplete === true ) ) {
                await handleGetAllNotes(); // Populates all notes data. 
                await handleGetDirectoryTree();
                await handleGetRecentNotes();
            }

            // Tasks
            if ( ( activeDash === 'todo' && !priorityComplete ) || ( priorityComplete === true ) ) {
                await handleFetchTasks();
                await handleFetchTodoLists();
                if ( activeListId ) { await handleFetchTodoListGroups(); }
                else {
                    setActiveList( utils.val.isValidArray( todoLists, true ) ? todoLists?.[ 0 ]?._id : null );
                }
            }


            // Reminders
            if ( ( activeDash === 'messages' && !priorityComplete ) || ( priorityComplete === true ) ) {
                await handleFetchAllReminders();
                await handleFetchAllNotifications();
            }

            // Reflect
            if ( activeDash === 'reflect' ) {
                await handleFetchLogs(); // Populates logsData for journal.
                await handleFetchAllStats();
                await handleFetchAllHabits();
            }

            if ( !priorityComplete ) {
                // Change flag to run the rest of the fetches in a second run.
                await handleFetchPriorityData( activeDash, true );
            }
        }
    };

    const handleUserChange = useCallback(
        async () => {
            // Set the processing user change flag to avoid recursive fetches down the line from the workspacesData and workspaceId changing.
            console.log( "[APIBuffer] :: handleUserChange triggered :: User data changed :: user = ", user );

            setProcessingUserChange( true );

            setActiveWorkspace( null );
            setWorkspaceId( null );
            setWorkspacesData( [] );

            let activeDash = handleUpdateActiveDashboard();

            // Re-fetch user data.
            // Because user changed, we need to wipe EVERYTHING, then re-fetch it all. 
            // First wipe current data, EXCEPT user data and workspace data. 
            wipeData();

            // Schemas
            // handleFetchSchemas();
            // if ( isInvalid( schemas ) ) fetchSchemas();
            fetchSchemas();

            // Next fetch any workspaces for the new user.
            let resultPromise = handleFetchWorkspaces();
            if ( resultPromise ) {
                const wsData = await resultPromise;
                console.log( "[APIBuffer] :: User data changed :: user = ", user, " :: ", "resultPromise = ", resultPromise, " :: ", "wsData = ", wsData );
                if ( wsData ) {
                    setWorkspacesData( wsData );
                    if ( utils.val.isValidArray( wsData, true ) ) {
                        // Find out which workspace is currently active, according to the server. 
                        wsData.some( ( workspace ) => {
                            if ( workspace?.active ) {
                                setActiveWorkspace( workspace );
                                setWorkspaceId( workspace?._id );
                            }
                        } );
                    }
                }
            }

            // Once we have workspacesData and a workspaceId, then fetch the rest. 
            // By this point, we should have a workspaceId. 
            // Try to prioritize by what page we're on. 
            // await handleWorkspaceIdChange( workspaceId, activeDash );
            await handleFetchPriorityData( activeDash, false );

            // handleFetchData();
            // initializeDatabase();

            setProcessingUserChange( false );
        }
        , [ user?.id ] );

    useEffect( () => {
        console.log( "[APIBuffer] :: useEffect :: User id changed :: user = ", user, " L :: ", "processingUserChange = ", processingUserChange );
        if ( user?.id && userLoggedIn ) {
            if ( !processingUserChange ) handleUserChange();
        }
    }, [ user?.id ] );

    useEffect( () => {
        // Load any global variables we can on component load.
        setDebug( import.meta.env.VITE_DEBUG );
        // let activeDash = handleUpdateActiveDashboard();
        // handleUserChange();

        console.log( "[APIBuffer] :: useEffect :: handleUserChange / handleWorkspaceIdChange :: workspaceId = ", workspaceId, " :: ", "user = ", user, " :: ", "processingUserChange = ", processingUserChange );
        if ( workspaceId ) {
            if ( !processingUserChange ) {
                handleWorkspaceIdChange( workspaceId );
            }
        }

    }, [ workspaceId ] );

    useEffect( () => {
        // On todo list change, fetch that list's groups.
        console.log( "[APIBuffer] :: useEffect :: activeListId changed. :: activeListId = ", activeListId );
        handleFetchTasks();
        handleFetchTodoListGroups();
    }, [ activeListId ] );

    const initializeAPIBuffer = async () => {
        // This one is supposed to run first or near-first, as it triggers many others once the workspaces and schemas are set. 
        let activeDash = handleUpdateActiveDashboard();
        console.log( '[APIBuffer] :: initializeAPIBuffer called :: activeDash = ', activeDash );

        // handleFetchSchemas();
        await fetchSchemas();

        await handleGetUserList();

        await handleFetchWorkspaces();

        // reloadData();
        await handleUserChange();
    };

    useEffect( () => {
        // Fetch data for the current dashboard view. 
        initializeAPIBuffer();
        // handleFetchSchemas();
        fetchSchemas();

        // Update the sidebar states per their stored local storage values. 
        setOpenSidebarPrimary( GetLocal( SIDEBAR_PRIMARY_STATE_NAME ) );
        setOpenSidebarSecondary( GetLocal( SIDEBAR_SECONDARY_STATE_NAME ) );
        setSidebarRightMaximized( GetLocal( SIDEBAR_SECONDARY_MAXIMIZED_NAME ) );
    }, [] );




    useEffect( () => {
        console.log( "[APIBuffer] :: useEffect :: requestFetchWorkspaces changed. :: requestFetchWorkspaces = ", requestFetchWorkspaces );
        if ( requestFetchWorkspaces ) {
            setRequestFetchWorkspaces( false );
            handleFetchWorkspaces();
        }
    }, [ requestFetchWorkspaces ] );

    useEffect( () => {
        console.log( "[APIBuffer] :: useEffect :: requestFetchSchemas changed. :: requestFetchSchemas = ", requestFetchSchemas );
        if ( requestFetchSchemas ) {
            setRequestFetchSchemas( false );
            // handleFetchSchemas();
            fetchSchemas();
            handleSetSchemas();
        }
    }, [ requestFetchSchemas ] );

    useEffect( () => {
        // If schemas updates, pass the updates on to each of the individual data stores. 
        console.log( "[APIBuffer] :: useEffect :: schemas changed. :: schemas = ", schemas );
        handleSetSchemas();
    }, [ schemas ] );

    /* useEffect( () => {
        // On workspace ID change, fetch events and other data.
        // const events = fetchEvents();
        if ( utils.val.isValid( workspaceId ) ) {
            // Fetch events.
            // Fetch notes for this workspace.
            // handleFetchRecentNotes( workspaceId`  );

            // Fetch tasks for this workspace.
            // handleFetchTasks( workspaceId );
        }
    }, [ workspaceId, activeWorkspace ] ); */

    useEffect( () => {
        console.log( "[APIBuffer] :: useEffect :: schemas changed. :: schemas = ", schemas );
        fetchTreeOnRequest();
    }, [ requestFetchTree ] );

    useEffect( () => {
        console.log( "[APIBuffer] :: useEffect :: schemas changed. :: schemas = ", schemas );
        if ( workspaceId && !utils.val.isValid( plannerData ) ) {
            handleGetCalendarsWithEvents();
        }
    }, [ calendarsData ] );
    fetchSchemas();

    return (
        <React.Fragment key={ bufferKey }>
            { children }
        </React.Fragment>
    );
};

export default APIBuffer;


/* { isCreating &&
    buildDialog( {
        data: selectedEvent, setData: setSelectedEvent,
        dataSchema: eventSchema,
        dialogOpen: isCreating, setDialogOpen: setIsCreating,
        handleSubmit: handleCreateEventSubmit,
        handleChange: handleChange,
        handleClose: handleClose,
        type: 'add',
        dialogType: 'add',
        dataType: 'event',
    } ) }

{ isEditing &&
    buildDialog( {
        data: selectedEvent, setData: setSelectedEvent,
        dataSchema: eventSchema,
        dialogOpen: isEditing, setDialogOpen: setIsEditing,
        handleSubmit: handleEditEventSubmit,
        handleChange: handleChange,
        handleClose: handleClose,
        type: 'edit',
        dialogType: 'edit',
        dataType: 'event',
    } ) }

{ open &&
    buildDialog( {
        data: selectedEvent, setData: setSelectedEvent,
        dataSchema: eventSchema,
        dialogOpen: open, setDialogOpen: setOpen,
        // handleSubmit: handle,
        // handleChange: handleChange,
        handleClose: handleClose,
        type: 'view',
        dialogType: 'view',
        dataType: 'event',
    } ) } 
*/
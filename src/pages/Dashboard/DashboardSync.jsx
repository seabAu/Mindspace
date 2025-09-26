
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
import { arrSafeTernary, isInvalid } from "@/lib/utilities/data";
import useReminderStore from "@/store/reminder.store";
import useNotificationsStore from "@/store/notification.store";
import useStatsStore from "@/store/stats.store";
import useReflectStore from "@/store/reflect.store";
import { handleFetch } from "akashatools/lib/Http";
import { DatabaseBackup, DatabaseBackupIcon, DeleteIcon, LayoutTemplateIcon, LucideDatabaseZap, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Constants / Config
import {
    CONTENT_BREADCRUMBS_HEIGHT,
    CONTENT_HEADER_HEIGHT,
    SIDEBAR_LEFT_KEYBOARD_SHORTCUT,
    SIDEBAR_RIGHT_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH_ICON,
    SIDEBAR_WIDTH_LEFT,
    SIDEBAR_WIDTH_RIGHT,
    SIDEBAR_WIDTH_RIGHT_MINI,
} from '@/lib/config/constants';


const DashboardSync = ( {
    syncConfig,
    syncInterval,
    children,
}, ...props ) => {

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        requestFetchSchemas, setRequestFetchSchemas,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        data, setData, getData, reloadData, wipeData, clearData, getDataOfType,
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
        handleFetchWorkspaces,
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
        ...( arrSafeTernary( syncConfig ) ),
    ];


    // Make a static, hopefully unchanging key for the fragment this utility component exports. 
    const bufferKey = useId();

    const handleFetchMissingData = useCallback(
        async () => {
            // if ( isInvalid( schemas ) ) fetchSchemas();
            // handleFetchData();
            // initializeDatabase();
            if ( utils.val.isValid( workspaceId ) ) {
                // Planner
                if ( isInvalid( eventsData ) ) {
                    await handleGetEventsData(); // Populates eventsData.
                }
                if ( isInvalid( calendarsData ) ) {
                    await handleGetCalendarsData(); // populates calendarsData.
                }
                if ( isInvalid( plannerData ) ) {
                    await handleGetPlannersData();
                }
                // handleGetCalendarsWithEvents(); // populates calendarsData with all the event _ids replaced with the full event documents.

                if ( isInvalid( upcomingEventsData ) ) {
                    await handleGetEventsInDateRangeData( {
                        workspaceId,
                        startDate: upcomingEventsRange?.startDate,
                        endDate: upcomingEventsRange?.endDate,
                        numDays: upcomingEventsRange?.numDays,
                    } );
                }

                // Notes
                if ( isInvalid( notesData ) ) {
                    await handleGetAllNotes();
                }
                if ( isInvalid( recentNotesData ) ) {
                    await fetchRecentNotesOnWorkspaceChange();
                }

                // Tasks
                if ( isInvalid( tasksData ) ) {
                    await handleFetchTasks();
                }
                if ( isInvalid( todoLists ) ) {
                    await handleFetchTodoLists();
                }
                if ( !activeListId || isInvalid( customGroups ) ) {
                    await handleFetchTodoListGroups();
                }

                // Reminders
                if ( isInvalid( reminderData ) ) {
                    await handleFetchAllReminders(); // Populates reminderData.
                }
                if ( isInvalid( notificationData ) ) {
                    await handleFetchAllNotifications(); // Populates notificationData.
                }

                // Reflect
                if ( isInvalid( logsData ) ) {
                    await handleFetchLogs(); // Populates logsData.
                }
                if ( isInvalid( statsData ) ) {
                    await handleFetchAllStats(); // Populates logsData.
                }
                if ( isInvalid( habitsData ) ) {
                    await handleFetchAllHabits(); // Populates logsData.
                }

            }
        }
        , [ user, workspaceId ] );

    const handleForceSync = useCallback(
        async () => {
            // Hard sync function. Wipes all data, then re-fetches all for a full sync. 
            await wipeData();
            await handleGetEventsData(); // Populates eventsData.
            await handleGetCalendarsData(); // populates calendarsData.
            await handleGetPlannersData();
            await handleGetEventsInDateRangeData( { workspaceId, startDate: upcomingEventsRange?.startDate, endDate: upcomingEventsRange?.endDate, numDays: upcomingEventsRange?.numDays, } );
            await handleGetAllNotes();
            await fetchRecentNotesOnWorkspaceChange();
            await handleFetchTasks();
            await handleFetchTodoLists();
            await handleFetchTodoListGroups();
            await handleFetchAllReminders(); // Populates reminderData.
            await handleFetchAllNotifications(); // Populates notificationData.
            await handleFetchLogs(); // Populates logsData.
            await handleFetchAllStats(); // Populates logsData.
            await handleFetchAllHabits(); // Populates logsData.
        }
        , [ user, workspaceId ] );


    const handleSync = useCallback(
        async () => {
            // Hard sync function. Wipes all data, then re-fetches all for a full sync. 
            await wipeData();
            await handleFetchMissingData();
        }
        , [ user, workspaceId ] );


    return (
        <div className={ `flex flex-row bg-sidebar-background w-full h-full items-center p-0 h-${ CONTENT_HEADER_HEIGHT }` }>
            <Button
                title={ `Refetch Schemas (for input forms)` }
                variant={ 'ghost' }
                size={ `icon` }
                className={ `h-full aspect-square` }
                onClick={ () => { fetchSchemas(); } }
            >
                <LayoutTemplateIcon className={ `size-full aspect-square !p-0` } />
            </Button>

            <Button
                title={ `Refetch All Data` }
                variant={ 'ghost' }
                size={ `icon` }
                className={ `h-full aspect-square` }
                onClick={ () => { wipeData(); } }
            >
                <LucideDatabaseZap className={ `aspect-square size-full !m-0 !p-0` } />
            </Button>

            {/* Button to trigger a full re-sync of all data. */ }
            <Button
                title={ `Fetch Missing/Invalid Data` }
                size={ 'sm' }
                variant={ 'ghost' }
                className={ `w-auto h-full aspect-square focus-within:outline-none focus-visible:outline-none justify-center items-center self-center` }
                onClick={ () => ( handleFetchMissingData() ) }
            >
                <RefreshCcw className={ `aspect-square size-6 p-0 m-0` } />
            </Button>
            <Button
                title={ `Force-Sync All Data` }
                size={ 'sm' }
                variant={ 'ghost' }
                className={ `w-auto h-full aspect-square focus-within:outline-none focus-visible:outline-none justify-center items-center self-center !p-0` }
                onClick={ () => ( handleForceSync() ) }
            >
                <DatabaseBackupIcon className={ `aspect-square size-full stroke-[0.125rem] p-0 m-0` } />
            </Button>
            { children }
        </div>
    );
};

export default DashboardSync;
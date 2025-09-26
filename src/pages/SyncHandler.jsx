"use client";

import React, { useId, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

// Enhanced useDataSync hook
import { useDataSync } from "@/lib/hooks/useDataSync";

import useAuth from "@/lib/hooks/useAuth";

// Feature hooks
import useWorkspace from "@/lib/hooks/useWorkspace";
import useTask from "@/lib/hooks/useTask";
import useNotes from "@/lib/hooks/useNotes";
import usePlanner from "@/lib/hooks/usePlanner";
import useReflect from "@/lib/hooks/useReflect";
import useMessage from "@/lib/hooks/useMessage";

// Data stores
import useGlobalStore from "@/store/global.store";
import usePlannerStore from "@/store/planner.store";
import useNotesStore from "@/store/note.store";
import useTasksStore from "@/store/task.store";
import useReminderStore from "@/store/reminder.store";
import useNotificationsStore from "@/store/notification.store";
import useReflectStore from "@/store/reflect.store";

// Utilities
import * as utils from "akashatools";

/**
 * Enhanced data sync handler with integrated authentication callbacks
 * @param {Object} props - Component props
 * @returns {JSX.Element} Buffer component wrapping children
 */
const SyncHandler = ( { children } ) => {
    const router = useRouter();

    // Global store state
    const {
        user,
        setUser,
        userToken,
        setUserToken,
        workspacesData,
        setWorkspacesData,
        workspaceId,
        setWorkspaceId,
        wipeData,
        setDebug,
    } = useGlobalStore();

    // Feature hooks
    const workspaceHandlers = useWorkspace();
    const taskHandlers = useTask();
    const notesHandlers = useNotes();
    const plannerHandlers = usePlanner();
    const reflectHandlers = useReflect();
    const messageHandlers = useMessage();

    const handleAuthLogin = useCallback(
        async ( userData, token ) => {
            console.log( "[v0] User logged in, triggering workspace data load..." );
            try {
                // Immediately fetch workspaces after login
                await workspaceHandlers.handleFetchWorkspaces();
            } catch ( error ) {
                console.error( "[v0] Failed to load workspaces after login:", error );
            }
        },
        [ workspaceHandlers ],
    );

    const handleAuthLogout = useCallback(
        ( userData ) => {
            console.log( "[v0] User logged out, clearing all data..." );
            // Data is already wiped by useAuth, but we can add additional cleanup here
            setWorkspaceId( null );
        },
        [ setWorkspaceId ],
    );

    const handleTokenRefresh = useCallback( ( token ) => {
        console.log( "[v0] Token refreshed, updating sync configurations..." );
        // Token refresh doesn't require immediate data reload since user is still authenticated
    }, [] );

    const { authUser, GetToken } = useAuth( true, {
        onLogin: handleAuthLogin,
        onLogout: handleAuthLogout,
        onTokenRefresh: handleTokenRefresh,
    } );

    const handleAuthPrereqFailure = useCallback( async () => {
        console.log( "[v0] Auth prerequisites failed, attempting login..." );
        try {
            const authedUserData = await authUser();
            if ( authedUserData ) {
                const token = utils.ao.has( authedUserData, "token" ) ? authedUserData.token : GetToken();
                if ( authedUserData ) setUser( authedUserData );
                if ( token ) setUserToken( token );
            }
        } catch ( error ) {
            console.error( "[v0] Auth remediation failed:", error );
        }
    }, [ authUser, GetToken, setUser, setUserToken ] );

    const handleWorkspacePrereqFailure = useCallback( async () => {
        console.log( "[v0] Workspace prerequisites failed, fetching workspaces..." );
        try {
            await workspaceHandlers.handleFetchWorkspaces();
        } catch ( error ) {
            console.error( "[v0] Workspace remediation failed:", error );
        }
    }, [ workspaceHandlers ] );

    const syncConfigs = useMemo(
        () => [
            // Step 1: Load workspaces when user logs in
            {
                key: "workspaces",
                valueToWatch: workspacesData,
                interval: 30000,
                prerequisites: [ user, userToken ],
                triggerOnChange: [ user, userToken ], // Immediate trigger when user/token changes
                syncFunction: workspaceHandlers.handleFetchWorkspaces,
                onSyncSuccess: ( data ) => {
                    console.log( "[v0] Workspaces loaded, setting active workspace" );
                    if ( data && data.length > 0 && !workspaceId ) {
                        // Set first workspace as active if none selected
                        setWorkspaceId( data[ 0 ]._id );
                    }
                },
                onSyncPrereqFailure: handleAuthPrereqFailure,
                onSyncFailure: async ( error ) => {
                    console.error( "[v0] Workspace sync failed, retrying in 5s:", error );
                    setTimeout( () => workspaceHandlers.handleFetchWorkspaces(), 5000 );
                },
            },

            // Step 2: Load essential workspace data when workspaceId is set
            {
                key: "tasks-essential",
                valueToWatch: useTasksStore.getState().tasksData,
                interval: 45000,
                prerequisites: [ workspaceId ],
                triggerOnChange: [ workspaceId ], // Immediate trigger when workspace changes
                syncFunction: () => taskHandlers.handleFetchTasks(),
                onSyncPrereqFailure: handleWorkspacePrereqFailure,
            },

            {
                key: "notes-essential",
                valueToWatch: useNotesStore.getState().recentNotesData,
                interval: 45000,
                prerequisites: [ workspaceId ],
                triggerOnChange: [ workspaceId ],
                syncFunction: () => notesHandlers.handleGetRecentNotes(),
                onSyncPrereqFailure: handleWorkspacePrereqFailure,
            },

            // Step 3: Page-specific data loading
            {
                key: "planner-page-data",
                valueToWatch: usePlannerStore.getState().eventsData,
                interval: 60000,
                prerequisites: [ workspaceId ],
                triggerOnPage: {
                    path: "/dashboard/planner",
                    callback: () => {
                        console.log( "[v0] Loading planner page data..." );
                        plannerHandlers.handleGetEventsData();
                        plannerHandlers.handleGetCalendarsData();
                        plannerHandlers.handleGetPlannersData();
                    },
                },
                syncFunction: () => plannerHandlers.handleGetEventsData(),
            },

            {
                key: "notes-page-data",
                valueToWatch: useNotesStore.getState().notesData,
                interval: 60000,
                prerequisites: [ workspaceId ],
                triggerOnPage: {
                    path: "/dashboard/notes",
                    callback: () => {
                        console.log( "[v0] Loading notes page data..." );
                        notesHandlers.handleGetAllNotes();
                        notesHandlers.handleGetFolders();
                        notesHandlers.handleGetFiles();
                    },
                },
                syncFunction: () => notesHandlers.handleGetAllNotes(),
            },

            {
                key: "tasks-page-data",
                valueToWatch: useTasksStore.getState().todoLists,
                interval: 60000,
                prerequisites: [ workspaceId ],
                triggerOnPage: {
                    path: "/dashboard/tasks",
                    callback: () => {
                        console.log( "[v0] Loading tasks page data..." );
                        taskHandlers.handleFetchTodoLists();
                        taskHandlers.handleFetchTodoListGroups();
                    },
                },
                syncFunction: () => taskHandlers.handleFetchTodoLists(),
            },

            {
                key: "reflect-page-data",
                valueToWatch: useReflectStore.getState().statsData,
                interval: 60000,
                prerequisites: [ workspaceId ],
                triggerOnPage: {
                    path: "/dashboard/reflect",
                    callback: () => {
                        console.log( "[v0] Loading reflect page data..." );
                        reflectHandlers.handleFetchAllStats();
                        reflectHandlers.handleFetchAllHabits();
                    },
                },
                syncFunction: () => reflectHandlers.handleFetchAllStats(),
            },

            // Background sync for notifications and reminders
            {
                key: "notifications",
                valueToWatch: useNotificationsStore.getState().notificationData,
                interval: 120000, // Less frequent for background data
                prerequisites: [ workspaceId ],
                syncFunction: () => messageHandlers.handleFetchAllNotifications(),
            },

            {
                key: "reminders",
                valueToWatch: useReminderStore.getState().reminderData,
                interval: 120000,
                prerequisites: [ workspaceId ],
                syncFunction: () => messageHandlers.handleFetchAllReminders(),
            },
        ],
        [
            user,
            userToken,
            workspaceId,
            workspacesData,
            workspaceHandlers,
            taskHandlers,
            notesHandlers,
            plannerHandlers,
            reflectHandlers,
            messageHandlers,
            setWorkspaceId,
            handleAuthPrereqFailure,
            handleWorkspacePrereqFailure,
        ],
    );

    const { syncLoading, syncError, currentPath } = useDataSync( syncConfigs );

    React.useEffect( () => {
        const handleUserChange = () => {
            if ( !user ) {
                console.log( "[v0] User logged out, wiping data..." );
                wipeData();
            }
        };

        handleUserChange();
    }, [ user, wipeData ] );

    React.useEffect( () => {
        setDebug( process.env.NEXT_PUBLIC_DEBUG === "true" );
    }, [ setDebug ] );

    const bufferKey = useId();

    return <React.Fragment key={ bufferKey }>{ children }</React.Fragment>;
};

export default SyncHandler;

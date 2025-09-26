"use client";

import { useState, useCallback, useMemo } from "react";
import useGlobalStore from "@/store/global.store";

/**
 * Simple data loading hook that handles workspace and route-specific data
 * @param {Object} config - Configuration object
 * @param {Array} config.routes - Routes configuration from NavProvider
 * @param {string} config.currentRoute - Current active route
 * @returns {Object} Data loading state and methods
 */
const useDataLoader = ( config = {} ) => {
    const { routes = [], currentRoute = "" } = config;
    const [ isLoading, setIsLoading ] = useState( false );
    const [ loadingStage, setLoadingStage ] = useState( "" );

    const {
        debug,
        setData,
        wipeData,
        // Store setters for different data types
        setWorkspaceData,
        setTasksData,
        setPlannerData,
        setNotesData,
        setFoldersData,
        setFilesData,
        setGroupsData,
        setUsersData,
    } = useGlobalStore();

    /**
     * Load workspace data after successful login
     * @param {Object} userData - User data from authentication
     * @param {string} token - Authentication token
     */
    const loadWorkspaceData = useCallback(
        async ( userData, token ) => {
            if ( !userData || !token ) return;

            setIsLoading( true );
            setLoadingStage( "Loading workspace..." );

            try {
                // Load critical workspace data first
                const workspacePromise = fetch( "/api/app/workspace/", {
                    headers: { "x-auth-token": token },
                } ).then( ( res ) => res.json() );

                const workspace = await workspacePromise;
                if ( workspace?.data ) {
                    setWorkspaceData( workspace.data );
                }

                setLoadingStage( "Loading user data..." );

                // Load secondary data in background
                const secondaryDataPromises = [
                    fetch( "/api/app/task/todo/", { headers: { "x-auth-token": token } } )
                        .then( ( res ) => res.json() )
                        .then( ( data ) => data?.data && setTasksData( data.data ) ),

                    fetch( "/api/app/task/group/", { headers: { "x-auth-token": token } } )
                        .then( ( res ) => res.json() )
                        .then( ( data ) => data?.data && setGroupsData( data.data ) ),
                ];

                // Don't wait for secondary data - let it load in background
                Promise.allSettled( secondaryDataPromises ).then( () => {
                    console.log( "[DataLoader] Secondary data loaded" );
                } );

                setLoadingStage( "Ready" );
            } catch ( error ) {
                console.error( "[DataLoader] Error loading workspace data:", error );
            } finally {
                setIsLoading( false );
            }
        },
        [ debug, setWorkspaceData, setTasksData, setGroupsData ],
    );

    /**
     * Load route-specific data based on current route
     * @param {string} route - Current route path
     */
    const loadRouteData = useCallback(
        async ( route, token ) => {
            if ( !route || !token ) return;

            const routeConfig = routes.find( ( r ) => r.path === route || r.url === route );
            if ( !routeConfig?.dataRequirements ) return;

            setLoadingStage( `Loading ${ routeConfig.label || route } data...` );

            try {
                const { priority = [], secondary = [] } = routeConfig.dataRequirements;

                // Load priority data first
                for ( const dataType of priority ) {
                    await loadDataType( dataType, token );
                }

                // Load secondary data in background
                secondary.forEach( ( dataType ) => {
                    loadDataType( dataType, token ).catch( ( err ) =>
                        console.warn( `[DataLoader] Failed to load secondary data ${ dataType }:`, err ),
                    );
                } );
            } catch ( error ) {
                console.error( "[DataLoader] Error loading route data:", error );
            }
        },
        [ routes ],
    );

    /**
     * Load specific data type
     * @param {string} dataType - Type of data to load (tasks, notes, etc.)
     * @param {string} token - Authentication token
     */
    const loadDataType = useCallback(
        async ( dataType, token ) => {
            const endpoints = {
                tasks: "/api/tasks",
                planner: "/api/planner",
                notes: "/api/notes",
                folders: "/api/folders",
                files: "/api/files",
                groups: "/api/groups",
                users: "/api/users",
            };

            const setters = {
                tasks: setTasksData,
                planner: setPlannerData,
                notes: setNotesData,
                folders: setFoldersData,
                files: setFilesData,
                groups: setGroupsData,
                users: setUsersData,
            };

            const endpoint = endpoints[ dataType ];
            const setter = setters[ dataType ];

            if ( !endpoint || !setter ) {
                console.warn( `[DataLoader] Unknown data type: ${ dataType }` );
                return;
            }

            try {
                const response = await fetch( endpoint, {
                    headers: { "x-auth-token": token },
                } );
                const data = await response.json();

                if ( data?.data ) {
                    setter( data.data );
                    console.log( `[DataLoader] Loaded ${ dataType }:`, data.data.length || "N/A" );
                }
            } catch ( error ) {
                console.error( `[DataLoader] Error loading ${ dataType }:`, error );
            }
        },
        [ debug, setTasksData, setPlannerData, setNotesData, setFoldersData, setFilesData, setGroupsData, setUsersData ],
    );

    /**
     * Clear all data on logout
     */
    const clearData = useCallback( () => {
        wipeData();
        setLoadingStage( "" );
        console.log( "[DataLoader] Data cleared on logout" );
    }, [ wipeData, debug ] );

    // Memoized callbacks for useAuth integration
    const authCallbacks = useMemo(
        () => ( {
            onLogin: loadWorkspaceData,
            onLogout: clearData,
            onTokenRefresh: ( token ) => {
                console.log( "[DataLoader] Token refreshed:", token );
            },
        } ),
        [ loadWorkspaceData, clearData, debug ],
    );

    return {
        isLoading,
        loadingStage,
        authCallbacks,
        loadRouteData,
        loadDataType,
        clearData,
    };
};

export default useDataLoader;

"use client";

/**
 * DataLoader - Handles data fetching and loading states for routes
 * Uses route configuration to determine what data to fetch and when
 */
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import useGlobalStore from "@/store/global.store";
import useAuth from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/Loader/Spinner";
import * as utils from "akashatools";

/**
 * Maps route endpoints to their required data types and fetch functions
 */
const ROUTE_DATA_MAP = {
    planner: {
        priority: [ "eventsData", "calendarsData" ],
        secondary: [ "upcomingEventsData" ],
        fetchFunctions: [ "handleGetEventsData", "handleGetCalendarsData" ],
    },
    tasks: {
        priority: [ "tasksData", "todoLists" ],
        secondary: [ "customGroups", "taskGoalsData" ],
        fetchFunctions: [ "handleFetchTasks", "handleFetchTodoLists" ],
    },
    notes: {
        priority: [ "notesData", "notesDirectoryTree" ],
        secondary: [ "recentNotesData" ],
        fetchFunctions: [ "handleGetAllNotes", "handleGetDirectoryTree" ],
    },
    reflect: {
        priority: [ "logsData", "statsData" ],
        secondary: [ "habitsData" ],
        fetchFunctions: [ "handleFetchLogs", "handleFetchAllStats" ],
    },
    messages: {
        priority: [ "reminderData", "notificationData" ],
        secondary: [],
        fetchFunctions: [ "handleFetchAllReminders", "handleFetchAllNotifications" ],
    },
};

/**
 * DataLoader component that handles route-specific data loading
 * @param {Object} props - Component props
 * @param {Object} props.routeConfig - Route configuration object
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.Component} DataLoader with children or loading state
 */
const DataLoader = ( { routeConfig, children } ) => {
    const location = useLocation();
    const [ isLoading, setIsLoading ] = useState( false );
    const [ loadingStage, setLoadingStage ] = useState( "" );

    const {
        user,
        userLoggedIn,
        userToken,
        workspaceId,
        workspacesData,
        loading: globalLoading,
        setLoading: setGlobalLoading,
    } = useGlobalStore();

    const { GetToken } = useAuth();

    /**
     * Determines the current route endpoint from the location
     */
    const currentEndpoint = useMemo( () => {
        const pathSegments = location.pathname.split( "/" ).filter( ( x ) => x );
        const dashIndex = pathSegments.indexOf( "dash" );
        console.log( "[DataLoader] :: currentEndpoint called :: dashIndex = ", dashIndex );
        return dashIndex >= 0 && pathSegments[ dashIndex + 1 ] ? pathSegments[ dashIndex + 1 ] : routeConfig?.endpoint;
    }, [ location.pathname, routeConfig?.endpoint ] );

    /**
     * Gets the data requirements for the current route
     */
    const dataRequirements = useMemo( () => {
        console.log( "[DataLoader] :: dataRequirements called :: currentEndpoint = ", currentEndpoint, " :: ", "ROUTE_DATA_MAP[ currentEndpoint ] || { priority: [], secondary: [], fetchFunctions: [] } = ", ROUTE_DATA_MAP[ currentEndpoint ] || { priority: [], secondary: [], fetchFunctions: [] } );
        return ROUTE_DATA_MAP[ currentEndpoint ] || { priority: [], secondary: [], fetchFunctions: [] };
    }, [ currentEndpoint ] );

    /**
     * Checks if user has required authentication
     */
    const isAuthenticated = useMemo( () => {
        console.log( "[DataLoader] :: isAuthenticated called :: userToken = ", userToken, " :: ", "GetToken() = ", GetToken(), " :: ", "user = ", user, " :: ", "userLoggedIn = ", userLoggedIn );
        return GetToken() && user && userLoggedIn && userToken;
    }, [ GetToken, user, userLoggedIn, userToken ] );

    /**
     * Checks if workspace is available for data fetching
     */
    const hasWorkspace = useMemo( () => {
        console.log( "[DataLoader] :: hasWorkspace called :: hasWorkspace = ", hasWorkspace, " :: ", "workspaceId = ", workspaceId );
        return workspaceId && utils.val.isValid( workspaceId );
    }, [ workspaceId ] );

    /**
     * Loads priority data first, then secondary data in background
     */
    const loadRouteData = async () => {
        console.log( "[DataLoader] :: loadRouteData called :: isAuthenticated = ", isAuthenticated, " :: ", "hasWorkspace = ", hasWorkspace );
        if ( !isAuthenticated || !hasWorkspace ) return;

        setIsLoading( true );
        setGlobalLoading( true );

        try {
            // Load priority data first
            setLoadingStage( "Loading essential data..." );
            await loadPriorityData();

            // Allow UI to render with priority data
            setIsLoading( false );
            setGlobalLoading( false );

            // Load secondary data in background
            setTimeout( () => {
                loadSecondaryData();
            }, 100 );
        } catch ( error ) {
            console.error( "DataLoader: Error loading route data:", error );
            setIsLoading( false );
            setGlobalLoading( false );
        }
    };

    /**
     * Loads priority data that's essential for the route
     */
    const loadPriorityData = async () => {
        const { priority, fetchFunctions } = dataRequirements;

        if ( priority.length === 0 ) return;

        // Here you would implement the actual data fetching logic
        // For now, we'll simulate the loading
        await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

        console.log( `DataLoader: Loaded priority data for ${ currentEndpoint }:`, priority );
    };

    /**
     * Loads secondary data in the background
     */
    const loadSecondaryData = async () => {
        const { secondary } = dataRequirements;

        if ( secondary.length === 0 ) return;

        setLoadingStage( "Loading additional data..." );

        // Simulate background loading
        await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

        console.log( `DataLoader: Loaded secondary data for ${ currentEndpoint }:`, secondary );
        setLoadingStage( "" );
    };

    /**
     * Effect to load data when route or dependencies change
     */
    useEffect( () => {
        if ( currentEndpoint && dataRequirements.priority.length > 0 ) {
            loadRouteData();
        }
    }, [ currentEndpoint, hasWorkspace ] );

    /**
     * Show loading spinner while priority data is loading
     */
    if ( isLoading || globalLoading ) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Spinner variant="circle" size="xl" color="currentColor" className="text-primary" />
                { loadingStage && <p className="text-sm text-muted-foreground animate-pulse">{ loadingStage }</p> }
            </div>
        );
    }

    /**
     * Render children when data is ready
     */
    return children;
};

export default DataLoader;

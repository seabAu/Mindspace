'use client';

import { createContext, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '@/lib/hooks/useAuth';
import useDataLoader from '@/lib/hooks/useDataLoader';
import { AUTH_TOKEN_STORAGE_NAME } from '../config/constants';

const DataSyncContext = createContext( {} );

/**
 * Provider that coordinates authentication and data loading
 * @param {Object} props - Component props
 * @param {Array} props.routes - Routes configuration
 * @param {React.ReactNode} props.children - Child components
 */
const DataSyncProvider = ( { routes = [], children } ) => {
    const location = useLocation();

    // Initialize data loader with routes config
    const { isLoading, loadingStage, authCallbacks, loadRouteData } =
        useDataLoader( {
            routes,
            currentRoute: location.pathname,
        } );

    // Initialize auth with data loading callbacks
    const authState = useAuth( true, authCallbacks );

    const initializeUserData = useCallback( async () => {
        const token =
            localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) ||
            sessionStorage.getItem( AUTH_TOKEN_STORAGE_NAME );
        if ( token && authState.verifyUser ) {
            await authState.verifyUser();
        }
    }, [] );

    // Load route-specific data when route changes
    useEffect( () => {
        let token = authState.GetToken();
        if ( authState.userLoggedIn && ( authState.userToken || token ) ) {
            loadRouteData( location.pathname, authState.userToken || token );
        }
    }, [
        location.pathname,
        authState.userLoggedIn,
        authState.userToken,
        loadRouteData,
    ] );

    const contextValue = {
        ...authState,
        isLoadingData: isLoading,
        loadingStage,
        initializeUserData,
    };

    return (
        <DataSyncContext.Provider value={ contextValue }>
            { children }
        </DataSyncContext.Provider>
    );
};

/**
 * Hook to access auth and data sync state
 */
export const useDataSync = () => {
    const context = useContext( DataSyncContext );
    if ( !context ) {
        throw new Error( 'useDataSync must be used within a DataSyncProvider' );
    }
    return context;
};

export default DataSyncProvider;

"use client";

import { useCallback, useMemo } from "react";
import useAuth from "@/lib/hooks/useAuth";
import useGlobalStore from "@/store/global.store";

/**
 * Enhanced authentication state hook that integrates with data loading
 * @returns {Object} Auth state and methods
 */
const useAuthState = () => {
    const {
        user,
        setUser,
        userToken,
        setUserToken,
        userLoggedIn,
        setUserLoggedIn,
        workspacesData,
        setWorkspacesData,
        activeWorkspace,
        setActiveWorkspace,
        loading,
        setLoading,
        error,
        setError,
        workspaceId,
        setWorkspaceId,
        data,
        getData,
        setData,
        wipeData,
    } = useGlobalStore();

    const authCallbacks = useMemo(
        () => ( {
            onLogin: async ( userData, token ) => {
                console.log( "[useAuthState] :: onLogin called :: Auth state: User logged in, triggering data cascade" );
                // Data loading will be handled by SyncHandler automatically
            },
            onLogout: ( userData ) => {
                console.log( "[useAuthState] :: onLogout called :: Auth state: User logged out :: userData = ", userData, " :: ", "userData = ", userData, " :: ", "clearing workspace" );
                setWorkspaceId( null );
            },
            onTokenRefresh: ( token ) => {
                console.log( "[useAuthState] :: onLogout called :: Auth state: Token refreshed :: token = ", token, " :: ", );
                console.log( "[useAuthState] :: onTokenRefresh called :: Auth state: Token refreshed: ", token );
                SetToken( token );
            },
        } ),
        [ setWorkspaceId ],
    );

    const { login, signup, logout, verifyUser, GetToken, SetToken, DeleteToken, googleAuth } = useAuth( true, authCallbacks );

    /**
     * Initialize authentication state
     */
    const initializeAuth = useCallback( async () => {
        console.log( "[useAuthState] :: initializeAuth called :: token = ", token, " :: ", "user = ", user );
        const token = GetToken();
        if ( token && !user ) {
            await verifyUser();
        }
    }, [ GetToken, user, verifyUser ] );

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    const isAuthenticated = useCallback( () => {
        console.log( "[useAuthState] :: isAuthenticated called :: userToken = ", userToken, " :: ", "user = ", user, " :: ", "userLoggedIn = ", userLoggedIn );
        return Boolean( user && userToken && userLoggedIn );
    }, [ user, userToken, userLoggedIn ] );

    // const isAuthenticated = useCallback( () => {
    //     return !!( GetToken() && user && userLoggedIn && userToken );
    // }, [ GetToken, user, userLoggedIn, userToken ] );

    /**
     * Handle logout with cleanup
     */
    const handleLogout = useCallback( () => {
        console.log( "[useAuthState] :: handleLogout called :: userToken = ", userToken, " :: ", "user = ", user, " :: ", "userLoggedIn = ", userLoggedIn );
        logout();
    }, [ logout ] );

    const clearAuthState = useCallback( () => {
        console.log( "[useAuthState] :: clearAuthState called :: userToken = ", userToken, " :: ", "user = ", user, " :: ", "userLoggedIn = ", userLoggedIn );
        setUser( null );
        setUserToken( null );
        setUserLoggedIn( false );
        setError( null );
    }, [ setUser, setUserToken, setUserLoggedIn, setError ] );

    const handleWorkspaceChange = useCallback(
        ( newWorkspaceId ) => {
            console.log( "[useAuthState] :: handleWorkspaceChange called :: userToken = ", userToken, " :: ", "user = ", user, " :: ", "userLoggedIn = ", userLoggedIn );
            if ( newWorkspaceId === workspaceId ) return; // No change needed

            try {
                setLoading( true );

                // Clear workspace-specific data but keep user data
                const preservedData = {
                    user,
                    userToken,
                    userLoggedIn,
                    workspacesData,
                };

                // Wipe data except preserved items
                wipeData();

                // Restore preserved data
                setUser( preservedData.user );
                setUserToken( preservedData.userToken );
                setUserLoggedIn( preservedData.userLoggedIn );
                setWorkspacesData( preservedData.workspacesData );

                // Set new workspace
                setWorkspaceId( newWorkspaceId );

                // Find and set active workspace
                if ( workspacesData && Array.isArray( workspacesData ) ) {
                    const workspace = workspacesData.find( ( w ) => w._id === newWorkspaceId );
                    if ( workspace ) {
                        setActiveWorkspace( workspace );
                    }
                }

                console.log( "useAuthState: Workspace changed to:", newWorkspaceId );
            } catch ( error ) {
                console.error( "useAuthState: Workspace change error:", error );
                setError( error.message || "Failed to change workspace" );
            } finally {
                setLoading( false );
            }
        },
        [
            workspaceId,
            user,
            userToken,
            userLoggedIn,
            workspacesData,
            wipeData,
            setUser,
            setUserToken,
            setUserLoggedIn,
            setWorkspacesData,
            setWorkspaceId,
            setActiveWorkspace,
            setLoading,
            setError,
        ],
    );

    const hasValidWorkspace = useCallback( () => {
        return !!( workspaceId && utils.val.isValid( workspaceId ) );
    }, [ workspaceId ] );

    return {
        // State
        user,
        userLoggedIn,
        userToken,
        loading,
        error,
        workspaceId,

        // Methods
        login,
        signup,
        logout: handleLogout,
        initializeAuth,
        isAuthenticated,
        hasValidWorkspace,
        handleWorkspaceChange,
        clearAuthState,
        verifyUser,
        googleAuth,
    };
};

export default useAuthState;


/* 
    "use client";

    import { useCallback, useEffect } from "react";
    import useGlobalStore from "@/store/global.store";
    import useAuth from "@/lib/hooks/useAuth";
    import   from "@/lib/hooks/useLocalStorage";
    import * as utils from "akashatools";

    const useAuthState = () => {
        const {
            user,
            setUser,
            userLoggedIn,
            setUserLoggedIn,
            userToken,
            setUserToken,
            workspacesData,
            setWorkspacesData,
            workspaceId,
            setWorkspaceId,
            activeWorkspace,
            setActiveWorkspace,
            loading,
            setLoading,
            error,
            setError,
            wipeData,
        } = useGlobalStore();

        const {
            authData,
            setAuthData,
            user: authUserData,
            userToken: authUserToken,
            setUserToken: setAuthUserToken,
            error: authError,
            loading: authLoading,
            authUser,
            login,
            signup,
            SetToken,
            GetToken,
            DeleteToken,
        } = useAuth();

        const { GetLocal, SetLocal, DeleteLocal } = useLocalStorage();

        const initializeAuth = useCallback( async () => {
            try {
                setLoading( true );
                const token = GetToken();

                if ( token ) {
                    const userData = await authUser();
                    if ( userData ) {
                        setUser( userData );
                        setUserToken( token );
                        setUserLoggedIn( true );
                        return userData;
                    }
                }

                // No valid token, clear auth state
                clearAuthState();
                return null;
            } catch ( error ) {
                console.error( "useAuthState: Error initializing auth:", error );
                clearAuthState();
                return null;
            } finally {
                setLoading( false );
            }
        }, [ authUser, GetToken, setUser, setUserToken, setUserLoggedIn, setLoading ] );

        const handleLogin = useCallback(
            async ( credentials ) => {
                try {
                    setLoading( true );
                    setError( null );

                    const result = await login( credentials );

                    if ( result && result.user && result.token ) {
                        setUser( result.user );
                        setUserToken( result.token );
                        setUserLoggedIn( true );
                        SetToken( result.token );
                        return result;
                    }

                    throw new Error( "Login failed: Invalid response" );
                } catch ( error ) {
                    console.error( "useAuthState: Login error:", error );
                    setError( error.message || "Login failed" );
                    throw error;
                } finally {
                    setLoading( false );
                }
            },
            [ login, setUser, setUserToken, setUserLoggedIn, SetToken, setLoading, setError ],
        );

        const handleSignup = useCallback(
            async ( userData ) => {
                try {
                    setLoading( true );
                    setError( null );

                    const result = await signup( userData );

                    if ( result && result.user && result.token ) {
                        setUser( result.user );
                        setUserToken( result.token );
                        setUserLoggedIn( true );
                        SetToken( result.token );
                        return result;
                    }

                    throw new Error( "Signup failed: Invalid response" );
                } catch ( error ) {
                    console.error( "useAuthState: Signup error:", error );
                    setError( error.message || "Signup failed" );
                    throw error;
                } finally {
                    setLoading( false );
                }
            },
            [ signup, setUser, setUserToken, setUserLoggedIn, SetToken, setLoading, setError ],
        );

        const handleLogout = useCallback( () => {
            try {
                // Clear all authentication data
                clearAuthState();

                // Wipe all user data from stores
                wipeData();

                // Clear local storage
                DeleteToken();

                console.log( "useAuthState: User logged out successfully" );
            } catch ( error ) {
                console.error( "useAuthState: Logout error:", error );
            }
        }, [ wipeData, DeleteToken ] );

        const clearAuthState = useCallback( () => {
            setUser( null );
            setUserToken( null );
            setUserLoggedIn( false );
            setAuthData( null );
            setError( null );
        }, [ setUser, setUserToken, setUserLoggedIn, setAuthData, setError ] );

        const handleWorkspaceChange = useCallback(
            ( newWorkspaceId ) => {
                if ( newWorkspaceId === workspaceId ) return; // No change needed

                try {
                    setLoading( true );

                    // Clear workspace-specific data but keep user data
                    const preservedData = {
                        user,
                        userToken,
                        userLoggedIn,
                        workspacesData,
                    };

                    // Wipe data except preserved items
                    wipeData();

                    // Restore preserved data
                    setUser( preservedData.user );
                    setUserToken( preservedData.userToken );
                    setUserLoggedIn( preservedData.userLoggedIn );
                    setWorkspacesData( preservedData.workspacesData );

                    // Set new workspace
                    setWorkspaceId( newWorkspaceId );

                    // Find and set active workspace
                    if ( workspacesData && Array.isArray( workspacesData ) ) {
                        const workspace = workspacesData.find( ( w ) => w._id === newWorkspaceId );
                        if ( workspace ) {
                            setActiveWorkspace( workspace );
                        }
                    }

                    console.log( "useAuthState: Workspace changed to:", newWorkspaceId );
                } catch ( error ) {
                    console.error( "useAuthState: Workspace change error:", error );
                    setError( error.message || "Failed to change workspace" );
                } finally {
                    setLoading( false );
                }
            },
            [
                workspaceId,
                user,
                userToken,
                userLoggedIn,
                workspacesData,
                wipeData,
                setUser,
                setUserToken,
                setUserLoggedIn,
                setWorkspacesData,
                setWorkspaceId,
                setActiveWorkspace,
                setLoading,
                setError,
            ],
        );

        const isAuthenticated = useCallback( () => {
            return !!( GetToken() && user && userLoggedIn && userToken );
        }, [ GetToken, user, userLoggedIn, userToken ] );

        const hasValidWorkspace = useCallback( () => {
            return !!( workspaceId && utils.val.isValid( workspaceId ) );
        }, [ workspaceId ] );

        useEffect( () => {
            initializeAuth();
        }, [] );

        return {
            // State
            user,
            userLoggedIn,
            userToken,
            workspaceId,
            activeWorkspace,
            workspacesData,
            loading: loading || authLoading,
            error: error || authError,

            // Methods
            initializeAuth,
            handleLogin,
            handleSignup,
            handleLogout,
            handleWorkspaceChange,
            clearAuthState,
            isAuthenticated,
            hasValidWorkspace,

            // Token methods
            GetToken,
            SetToken,
            DeleteToken,
        };
    };

    export default useAuthState;
*/
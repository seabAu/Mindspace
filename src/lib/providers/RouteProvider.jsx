"use client";

/**
 * RouteProvider - Dynamic route management with lazy loading and data prefetching
 * Uses routesConfig to generate routes with associated data loading and Suspense boundaries
 */
import { Suspense, lazy, useMemo, useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useNav } from "./NavProvider";
import useGlobalStore from "@/store/global.store";
import useAuth from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/Loader/Spinner";
import DataLoader from "@/pages/DataLoader";
import * as utils from 'akashatools';
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import WorkspaceLandingPage from "@/pages/Dashboard/Workspaces/WorkspaceLandingPage";
import APIBuffer from "@/pages/APIBuffer";

/**
 * Creates a lazy-loaded component with data prefetching
 * @param {Object} routeConfig - Route configuration object
 * @returns {React.Component} Lazy component with data loading
 */
const createLazyRoute = ( routeConfig ) => {
    return lazy( async () => {
        // If the route has a component, return it directly
        if ( routeConfig.element ) {
            return {
                default: () => (
                    <DataLoader routeConfig={ routeConfig }>
                        { routeConfig.element }
                    </DataLoader>
                ),
            };
        }

        // For dynamic imports, you could add logic here
        // For now, return a placeholder
        return {
            default: () => (
                <div className="p-4">
                    <h2>Route: { routeConfig.title }</h2>
                    <p>Endpoint: { routeConfig.endpoint }</p>
                    <p>Target: { routeConfig.target }</p>
                    <p>URL: { routeConfig.url }</p>
                </div>
            ),
        };
    } );
};

/**
 * Recursively generates routes from routesConfig
 * @param {Array} routes - Array of route configurations
 * @param {string} basePath - Base path for nested routes
 * @returns {Array} Array of Route components
 */
const generateRoutes = ( routes, basePath = "" ) => {
    if ( !routes || !Array.isArray( routes ) ) return [];

    return (
        <Routes>
            { routes
                ?.filter( ( route ) => route.enabled && route.visible )
                ?.map( ( route, index ) => {
                    const routePath = route.endpoint;
                    const fullPath = basePath ? `${ basePath }/${ route.endpoint }` : route.endpoint;

                    // console.log( "RouteProvider :: generateRoutes :: routes = ", routes, " :: ", "basePath = ", basePath, " :: ", "fullPath = ", fullPath, " :: ", "routePath = ", routePath, " :: ", "route = ", route );

                    return (
                        <Route
                            key={ `${ route.endpoint }-${ index }` }
                            path={ route?.target || route?.endpoint }
                            element={
                                route?.element
                            }
                        >
                            {/* Recursively generate nested routes */ }
                            { route.pages && generateRoutes( route.pages, fullPath ) }
                        </Route>
                    );

                    // const LazyComponent = createLazyRoute( route );
                    // return (
                    //     <Route
                    //         key={ `${ route.endpoint }-${ index }` }
                    //         path={ route.target || routePath }
                    //         element={
                    //             <Suspense
                    //                 fallback={ <Spinner variant="circle" size="md" color="currentColor" overlay={ true } className="z-50" /> }
                    //             >
                    //                 <LazyComponent />
                    //             </Suspense>
                    //         }
                    //     >
                    //         {/* Recursively generate nested routes */ }
                    //         { route.pages && generateRoutes( route.pages, fullPath ) }
                    //     </Route>
                    // );
                } ) }
        </Routes>
    );
};

/**
 * Protected route wrapper component
 * @param {Object} props - Component props
 * @returns {React.Component} Protected route or redirect
 */
const ProtectedRoute = ( { children, isAllowed, redirectPath = "/login" } ) => {
    if ( !isAllowed ) {
        return <Navigate to={ redirectPath } replace />;
    }
    return children;
};

/**
 * Main RouteProvider component
 * @param {Object} props - Component props
 * @returns {React.Component} Dynamic routes based on routesConfig
 */
const RouteProvider = ( { children } ) => {
    const { routesConfig } = useNav();
    const {
        GetToken,
        verifyUser,
        logout,
        clearAuthState
    } = useAuth();
    const {
        user,
        userToken, setUserToken,
        userLoggedIn, setUserLoggedIn,
        workspaceId,
        workspacesData,
        logUserOut,
        requestLogUserOut, setRequestLogUserOut,
        requestRevalidateUser, setRequestRevalidateUser,
    } = useGlobalStore();

    /**
     * Memoized route generation to prevent unnecessary re-renders
     */
    const generatedRoutes = useMemo( () => {
        if ( !routesConfig ) return [];
        return generateRoutes( routesConfig );
    }, [ routesConfig ] );

    const generatedTopRoutes = useMemo( () => {
        if ( !routesConfig ) return [];
        return generateRoutes( routesConfig, "/" );
    }, [ routesConfig ] );


    useEffect( () => {
        const token = GetToken();
        console.log( "[RouteProvider] useAuth: Initializing, token exists:", !!token, "user exists:", !!user );

        // verifyUser();
        // return;
        if ( token && !user ) {
            console.log( "[RouteProvider] useAuth: Token found but no user, verifying..." );
            verifyUser();
            return;
        }

        if ( token && user ) {
            setUserLoggedIn( true );
            setUserToken( token );
            return;
        }
        else if ( token && !user ) {
            console.log( "[RouteProvider] useAuth: Token found but no user, verifying..." );
            verifyUser();
            return;
        } else if ( !token && user ) {
            console.log( "[RouteProvider] useAuth: No token but user exists, clearing auth state" );
            // clearAuthState();
            return;
        }
    }, [] ); // Empty dependency array - run only once


    /**
     * Check if user is authenticated
     */
    // const isAuthenticated = useCallback(
    //     async () => {
    //         if ( user && userLoggedIn ) {
    //             console.log( "Rerendering routeprovider for some reason." );
    //             return true;
    //         }
    //         else {
    //             console.log( "Rerendering routeprovider for some reason with invalid user / userLoggedIn / userToken." );
    //             let authenticated = await verifyUser();
    //             return authenticated && user && userLoggedIn;
    //             // return GetToken() && user && userLoggedIn;
    //         }
    //     }, [ user, userLoggedIn ]
    // );
    const isAuthenticated = useCallback(
        async () => {
            console.log( "[RouteProvider] :: [isAuthenticated] :: Rerendering routeprovider with: ", GetToken(), user, userLoggedIn );
            return GetToken() && user && userLoggedIn;
        }, [ userLoggedIn ]
    );

    const authenticated = useMemo( () => {
        console.log( "[RouteProvider] :: [authenticated] :: isAuthenticated() = ", isAuthenticated() );
        return isAuthenticated();
    }, [ userLoggedIn, userToken ] );

    return (
        <Routes>
            {/* Public routes */ }
            <Route
                path="/"
                element={
                    <Suspense fallback={ <Spinner variant="circle" size="md" overlay={ true } /> }>
                        { routesConfig?.find( ( r ) => r.endpoint === "home" )?.element }
                    </Suspense>
                }
            />

            <Route
                path="/login"
                element={
                    <Suspense fallback={ <Spinner variant="circle" size="md" overlay={ true } /> }>
                        { routesConfig?.find( ( r ) => r.endpoint === "login" )?.element }
                    </Suspense>
                }
            />

            <Route
                path="/signup"
                element={
                    <Suspense fallback={ <Spinner variant="circle" size="md" overlay={ true } /> }>
                        { routesConfig?.find( ( r ) => r.endpoint === "signup" )?.element }
                    </Suspense>
                }
            />

            {/* All top-level pages */ }
            { routesConfig
                ?.filter( ( route ) => route.location?.includes( 'home' ) || !route?.location )
                ?.map( ( route ) => (
                    <Route
                        path={ route?.url }
                        element={
                            <Suspense fallback={ <Spinner variant="circle" size="md" overlay={ true } /> }>
                                {/* { routesConfig?.find( ( r ) => r.endpoint === "signup" )?.element } */ }
                                { route?.element || <>{ `404` }</> }
                            </Suspense>
                        }
                    />
                ) )
            }
            {/* { utils.val.isValidArray( generatedTopRoutes, true )
                && ( generatedTopRoutes
                    // ?.filter( ( route ) => route.location?.includes( 'home' ) || !route?.location )
                    ?.map( ( route ) => route )
                ) } */}

            {/* Protected dashboard routes */ }
            <Route
                path="dash/*"
                element={
                    <ProtectedRoute isAllowed={ authenticated } redirectPath={ `/login` }>
                        <DashboardPage>
                            {/* <WorkspaceLandingPage> */ }
                            <Routes>
                                {
                                    utils.val.isValidArray( generatedRoutes, true )
                                    // && utils.val.isValidArray( workspacesData, true )
                                    && ( generatedRoutes
                                        ?.filter( ( route ) => route.key?.includes( "dash" ) || route.props?.path?.includes( "dash" ) )
                                        ?.map( ( route ) => route )
                                    ) }
                                {/* { utils.val.isValidArray( generatedRoutes, true )
                                        // && utils.val.isValidArray( workspacesData, true )
                                        ? ( <>
                                            { generatedRoutes
                                                ?.filter( ( route ) => route.key?.includes( "dash" ) || route.props?.path?.includes( "dash" ) )
                                                ?.map( ( route ) => route ) }
                                        </> )
                                        : (
                                            <Route path={ `/dash/*` } element={ <WorkspaceLandingPage /> } />
                                        ) } */}
                            </Routes>
                            {/* </WorkspaceLandingPage> */ }
                        </DashboardPage>
                    </ProtectedRoute>
                }
            />

            {/* Fallback route */ }
            <Route
                path="/*"
                element={
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-foreground">404</h1>
                            <p className="text-muted-foreground">Page not found</p>
                        </div>
                    </div>
                }
            />

            { children }
        </Routes>
    );
};

export default RouteProvider;

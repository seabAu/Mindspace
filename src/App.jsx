"use client";

// Dependencies
import { memo, useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import "@/App.css";
import NavProvider from "@/lib/providers/NavProvider";
import { Toaster } from "@/components/ui/sonner";
import NotifyHandler from "@/pages/NotifyHandler";
import { Spinner } from "@/components/Loader/Spinner";

import RouteProvider from "@/lib/providers/RouteProvider";
import DataSyncProvider, { useDataSync } from "@/lib/providers/DataSyncProvider";
import { AUTH_TOKEN_STORAGE_NAME } from "@/lib/config/constants";
import APIBuffer from "@/pages/APIBuffer";
const MemoizedAPIBuffer = memo( APIBuffer );

const ProtectedRoute = ( { children, isAllowed, redirectPath = "/", reqRoles = [] } ) => {
    // const isAuthenticated = isAllowed;
    if ( !isAllowed ) {
        return <Navigate to={ redirectPath } replace />;
    }

    return children ? children : <Outlet />;
};

const ProtectedRouteTemplate = ( { children } ) => {
    // Assume 'isAuthenticated' is a boolean state or context value
    // that reflects the user's login status.
    const isAuthenticated = true; // Replace with actual authentication check

    if ( !isAuthenticated ) {
        return <Navigate to="/login" replace />; // Redirect to login if not authenticated
    }

    return children ? children : <Outlet />; // Render child routes or nested content
};

/**
 * Enhanced authentication handler component that manages all auth routing flows
 * @returns {React.Component} Auth handler
 */
const AuthHandler = () => {
    const { userLoggedIn, user, loading, isLoadingData, initializeUserData } = useDataSync();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect( () => {
        const pathnames = location.pathname.split( "/" ).filter( ( x ) => x );
        const isAuthRoute = pathnames.includes( "login" ) || pathnames.includes( "signup" );
        const isDashRoute = pathnames.includes( "dash" );
        const isHomePage = location.pathname === "/" || location.pathname === "";

        console.log( "[App] :: [AuthHandler] :: useEffect call for userLoggedIn, loading, or isLoadingData changes: ",
            " :: ", "user = ", user,
            " :: ", "userLoggedIn = ", userLoggedIn,
            " :: ", "isLoadingData = ", isLoadingData,
            " :: ", "loading = ", loading,
            " :: ", "isDashRoute = ", isDashRoute,
            " :: ", "isHomePage = ", isHomePage,
            " :: ", "user = ", user,
        );
        if ( userLoggedIn && user ) {
            // User is authenticated
            if ( isAuthRoute ) {
                // Redirect authenticated users away from auth pages
                navigate( "/dash/home", { replace: true } );
            } else if ( isHomePage ) {
                // Redirect authenticated users from home to dashboard
                navigate( "/dash/home", { replace: true } );
            }
        } else if ( !loading && !isLoadingData ) {
            // User is not authenticated and not loading
            if ( isDashRoute ) {
                // Redirect unauthenticated users from protected pages to login
                navigate( "/login", { replace: true } );
            }
        }
        // }, [ location.pathname, userLoggedIn, user, loading, isLoadingData, navigate ] );
    }, [ userLoggedIn, loading, isLoadingData ] );

    useEffect( () => {
        const token = localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) || sessionStorage.getItem( AUTH_TOKEN_STORAGE_NAME );
        const pathnames = location.pathname.split( "/" ).filter( ( x ) => x );
        const isAuthRoute = pathnames.includes( "login" ) || pathnames.includes( "signup" );

        console.log( "[App] :: [AuthHandler] :: useEffect call for [location.pathname, user, userLoggedIn, loading, initializeUserData] changes: ",
            " :: ", "user = ", user,
            " :: ", "token = ", token,
            " :: ", "userLoggedIn = ", userLoggedIn,
            " :: ", "isLoadingData = ", isLoadingData,
            " :: ", "loading = ", loading,
            " :: ", "isAuthRoute = ", isAuthRoute,
            " :: ", "pathnames = ", pathnames,
        );
        // If we have a token but no user data, and we're on an auth page, try to authenticate
        if ( token && !user && !userLoggedIn && isAuthRoute && !loading ) {
            initializeUserData();
        }
    }, [ location.pathname, user, userLoggedIn, loading ] );

    return null;
};

/**
 * Main App component
 * @returns {React.Component} Main application
 */
function App () {
    return (
        <DataSyncProvider>
            <AppContent />
        </DataSyncProvider>
    );
}

/**
 * App content component that uses DataSync context
 * @returns {React.Component} App content
 */
const AppContent = () => {
    const { loading, isLoadingData, loadingStage } = useDataSync();

    return (
        <div className={ `App` } data-theme="system" style={ {} }>
            { ( loading || isLoadingData ) && (
                <Spinner
                    variant="circle"
                    size="md"
                    overlay={ true }
                    message={ loadingStage || "Loading..." }
                />
            ) }

            <AuthHandler />
            <NotifyHandler />

            {/* <MemoizedAPIBuffer /> */}
            <RouteProvider />

            <div id="notification-center">
                <Toaster position="bottom-right" richColors />
            </div>
        </div>
    );
};

export default App;

/*  // https://dev.to/tywenk/how-to-use-nested-routes-in-react-router-6-4jhd // 
        <Router>
            <Routes>
                <Route path={"/"} element={<Home
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    // For minified sidebar
                    isMinified={isMinified}
                    setIsMinified={setIsMinified}
                    subComponent={<AssessmentDashboard
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        // For minified sidebar
                        isMinified={isMinified}
                        setIsMinified={setIsMinified}
                    />
                    }
                />} />
                <Route path="dashboard">
                    <Route
                        path={"/assessment"}
                        element={<Home
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            // For minified sidebar
                            isMinified={isMinified}
                            setIsMinified={setIsMinified}
                            subComponent={
                                <AssessmentDashboard
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    // For minified sidebar
                                    isMinified={isMinified}
                                    setIsMinified={setIsMinified}
                                />
                            }
                        />}
                    />
                </Route>
                <Route path="usermanagement">
                    <Route
                        path={"/users"}
                        element={<Home
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            // For minified sidebar
                            isMinified={isMinified}
                            setIsMinified={setIsMinified}
                            subComponent={
                                <AssessmentDashboard
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    // For minified sidebar
                                    isMinified={isMinified}
                                    setIsMinified={setIsMinified}
                                />
                            }
                        />}
                    />
                </Route>
                <Route path={"/login"} element={<Login />} />
                <Route path={"/login2"} element={<Login2
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    mobileViewContainer={mobileViewContainer}
                />}
                />
                <Route path={"/forgetpassword"} element={<ForgetPassWord />} />
                <Route path={"/*"} element={<h1 className='text-center text-warning mt-4'>404: Not Found</h1>} />
            </Routes>
        </Router>
*/


/*
    <Router>
        <div className="App flex">
            <Sidebar />
            <div className="flex-1">
            <Switch>
                <Route exact path="/" component={Calendar} />
                <Route path="/calendars" component={CalendarList} />
                <Route path="/calendar/:id" component={CalendarDetail} />
                <Route path="/events" component={EventList} />
                <Route path="/event/:id" component={EventDetail} />
                <Route path="/todos" component={TodoList} />
                <Route path="/todo/:id" component={TodoDetail} />
                <Route exact path="/logs" component={LogList} />
                <Route exact path="/log/new" component={LogForm} />
                <Route path="/log/:id/edit" component={LogForm} />
                <Route path="/log/:id" component={LogDetail} />
            </Switch>
            </div>
        </div>
    </Router> 
*/

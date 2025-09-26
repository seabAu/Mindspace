"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, LogOut, User } from "lucide-react";
import {
    initializeGoogleAPI,
    initializeGoogleIdentity,
    requestAccessToken,
    signOut,
    isSignedIn,
    getCurrentUser,
} from "../../lib/services/googleAuthService.js";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.jsx";

/**
 * GoogleLoginButton component with singleton initialization pattern to prevent infinite loops
 * @param {Function} onAuthSuccess - Callback when authentication succeeds
 * @param {Function} onAuthError - Callback when authentication fails
 * @param {Function} onSignOut - Callback when user signs out
 */
const GoogleLoginButton = ( { onAuthSuccess, onAuthError, onSignOut } ) => {
    const [ isLoading, setIsLoading ] = useState( false );
    const [ isInitialized, setIsInitialized ] = useState( false );
    const [ user, setUser ] = useState( null );
    const [ error, setError ] = useState( null );
    const [ signedIn, setSignedIn ] = useState( false );
    const [ showDebugDialog, setShowDebugDialog ] = useState( false );
    const [ debugData, setDebugData ] = useState( null );

    const initializationRef = useRef( false );
    const mountedRef = useRef( true );

    const initializeGoogleServices = useCallback( async () => {
        // Prevent multiple simultaneous initializations
        if ( initializationRef.current || isInitialized ) {
            console.log( "[v0] GoogleLoginButton: Already initialized or initializing" );
            return;
        }

        initializationRef.current = true;
        setIsLoading( true );
        setError( null );

        try {
            console.log( "[v0] GoogleLoginButton: Starting initialization..." );
            await Promise.all( [ initializeGoogleAPI(), initializeGoogleIdentity() ] );

            // Only update state if component is still mounted
            if ( mountedRef.current ) {
                setIsInitialized( true );
                console.log( "[v0] GoogleLoginButton: Services initialized successfully" );

                // Check if user is already signed in
                if ( isSignedIn() ) {
                    const userInfo = await getCurrentUser();
                    setUser( userInfo );
                    setSignedIn( true );
                    onAuthSuccess?.( userInfo );
                }
            }
        } catch ( err ) {
            console.error( "[v0] GoogleLoginButton: Failed to initialize Google services:", err );
            if ( mountedRef.current ) {
                setError( `Failed to initialize Google services: ${ err.message }` );
                onAuthError?.( err );
            }
        } finally {
            if ( mountedRef.current ) {
                setIsLoading( false );
            }
            initializationRef.current = false;
        }
    }, [ isInitialized, onAuthSuccess, onAuthError ] );

    useEffect( () => {
        mountedRef.current = true;

        // Only initialize once
        if ( !isInitialized && !initializationRef.current ) {
            initializeGoogleServices();
        }

        // Cleanup function
        return () => {
            mountedRef.current = false;
        };
    }, [] ); // Empty dependency array - only run once on mount

    const handleSignIn = useCallback( async () => {
        if ( !isInitialized ) {
            setError( "Google services not initialized" );
            return;
        }

        setIsLoading( true );
        setError( null );

        try {
            console.log( "[v0] GoogleLoginButton: Starting sign in process..." );
            const accessToken = await requestAccessToken();
            console.log( "[v0] GoogleLoginButton: Access token received, getting user info..." );

            const userInfo = await getCurrentUser();
            console.log( "[v0] GoogleLoginButton: User info received:", userInfo );

            if ( mountedRef.current ) {
                setUser( userInfo );
                setSignedIn( true );

                setDebugData( {
                    accessToken,
                    userInfo,
                    timestamp: new Date().toISOString(),
                    scopes:
                        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                } );
                setShowDebugDialog( true );

                onAuthSuccess?.( userInfo, accessToken );
            }
        } catch ( err ) {
            console.error( "[v0] GoogleLoginButton: Sign in failed:", err );
            if ( mountedRef.current ) {
                setError( `Sign in failed: ${ err.message }` );
                onAuthError?.( err );
            }
        } finally {
            if ( mountedRef.current ) {
                setIsLoading( false );
            }
        }
    }, [ isInitialized, onAuthSuccess, onAuthError ] );

    const handleSignOut = useCallback( () => {
        try {
            console.log( "[v0] GoogleLoginButton: Signing out..." );
            signOut();
            setUser( null );
            setSignedIn( false );
            setDebugData( null );
            onSignOut?.();
        } catch ( err ) {
            console.error( "[v0] GoogleLoginButton: Sign out failed:", err );
            setError( `Sign out failed: ${ err.message }` );
        }
    }, [ onSignOut ] );

    const renderObjectRecursively = useCallback( ( obj, depth = 0 ) => {
        if ( depth > 3 ) return <span>{ "..." }</span>;

        if ( obj === null ) return <span className="text-gray-500">null</span>;
        if ( obj === undefined ) return <span className="text-gray-500">undefined</span>;
        if ( typeof obj === "string" ) return <span className="text-green-600">"{ obj }"</span>;
        if ( typeof obj === "number" ) return <span className="text-blue-600">{ obj }</span>;
        if ( typeof obj === "boolean" ) return <span className="text-purple-600">{ obj.toString() }</span>;

        if ( Array.isArray( obj ) ) {
            return (
                <ul className="ml-4">
                    { obj.map( ( item, index ) => (
                        <li key={ index } className="mb-1">
                            <span className="text-gray-400">[{ index }]:</span> { renderObjectRecursively( item, depth + 1 ) }
                        </li>
                    ) ) }
                </ul>
            );
        }

        if ( typeof obj === "object" ) {
            return (
                <ul className="ml-4">
                    { Object.entries( obj ).map( ( [ key, value ] ) => (
                        <li key={ key } className="mb-1">
                            <span className="font-medium text-gray-700">{ key }:</span> { renderObjectRecursively( value, depth + 1 ) }
                        </li>
                    ) ) }
                </ul>
            );
        }

        return <span>{ String( obj ) }</span>;
    }, [] );

    // Loading state during initialization
    if ( !isInitialized && isLoading ) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Initializing Google Services
                    </CardTitle>
                    <CardDescription>Setting up Google Calendar integration...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Signed in state
    if ( signedIn && user ) {
        return (
            <>
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Welcome, { user?.name }
                        </CardTitle>
                        <CardDescription>Connected to Google OAuth</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            { user.picture && (
                                <img src={ user.picture || "/placeholder.svg" } alt={ user.name } className="w-10 h-10 rounded-full" />
                            ) }
                            <div>
                                <p className="font-medium">{ user.name }</p>
                                <p className="text-sm text-muted-foreground">{ user.email }</p>
                            </div>
                        </div>

                        <Button onClick={ () => setShowDebugDialog( true ) } variant="outline" className="w-full">
                            Show Debug Data
                        </Button>

                        <Button onClick={ handleSignOut } variant="outline" className="w-full bg-transparent">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>

                <Dialog open={ showDebugDialog } onOpenChange={ setShowDebugDialog }>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Google OAuth Debug Data</DialogTitle>
                            <DialogDescription>All data returned from Google OAuth authentication</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">{ debugData && renderObjectRecursively( debugData ) }</div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // Default sign in state
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader></CardHeader>
            <CardContent className="">
                { error && (
                    <Alert variant="destructive">
                        <AlertDescription>{ error }</AlertDescription>
                    </Alert>
                ) }
                <TooltipProvider delayDuration={ 100 } skipDelayDuration={ true }>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={ handleSignIn } disabled={ isLoading || !isInitialized } className="w-full">
                                { isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" /> }
                                Sign in with Google
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs text-muted-foreground text-center">
                                This will allow the app to read and manage your Google Calendar events
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    );
};

export default GoogleLoginButton;

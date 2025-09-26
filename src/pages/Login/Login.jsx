"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import useAuth from "@/lib/hooks/useAuth";
import * as utils from "akashatools";
import useGlobalStore from "@/store/global.store";
import SignInForm from "@/features/User/components/Auth/SignInForm";
import SignUpForm from "@/features/User/components/Auth/SignUpForm";
import GoogleLoginButton from "@/features/User/blocks/GoogleLoginButton/GoogleLoginButton";
import HomeHeader from "../HomeHeader";
import HomeContainer from '@/pages/Home/HomeContainer';

const Login = ( { mode = "login", onAuthSuccess } ) => {
    const navigate = useNavigate();
    const { googleAuth, authUser, verifyUser, login, signup, signout, SetToken, GetToken, DeleteToken } = useAuth();
    const {
        // Debug state
        debug,
        setDebug,

        // Fetch requests state
        requestFetchData,
        setRequestFetchData,
        requestFetchUser,
        setRequestFetchUser,

        // Data state
        data,
        setData,
        wipeData,
        user,
        setUser,
        userToken,
        setUserToken,
        getUserToken,
        userLoggedIn,
        setUserLoggedIn,
        settingsDialogOpen,
        setSettingsDialogOpen,
        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
        loading,
        userGoogleOAuthData,
        setUserGoogleOAuthData,
    } = useGlobalStore();

    const [ askedLogin, setAskedLogin ] = useState( false );
    const [ formMode, setFormMode ] = useState( mode );
    const [ authError, setAuthError ] = useState( null );
    const [ isAuthenticated, setIsAuthenticated ] = useState( false );
    const [ error, setError ] = useState( null );
    const [ activeTab, setActiveTab ] = useState( "calendar" );
    const [ credentials, setCredentials ] = useState( {
        display_name: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: "",
        emailOptInConsent: false,
        phoneOptInConsent: false,
    } );

    const handleLoginSubmit = async ( credentials ) => {
        const result = await login( credentials );
        console.log( "Login :: handleLoginSubmit triggered :: credentials = ", credentials, " :: ", "result = ", result );
        // handleAuthResult( result );
        return result || null;
    };

    const handleSignupSubmit = async ( credentials ) => {
        const result = await signup( credentials );
        console.log( "Login :: handleSignupSubmit triggered :: credentials = ", credentials, " :: ", "result = ", result );
        // handleAuthResult( result );
        return result || null;
    };

    const handleSignup = ( res ) => {
        handleLogIn( res );
    };

    const handleLogOut = () => {
        console.log( "Login :: handleLogOut triggered." );
        setUserLoggedIn( false );
        setUser( null );
        DeleteToken();
        SetToken( null );
        setUserToken( null );
    };

    const handleLogInFinish = () => {
        console.log( "Login :: handleLogInFinish triggered." );
        setUserLoggedIn( true );
        navigate( "/dash/home" );
    };

    const handleLogIn = ( userData ) => {
        console.log( "Login :: handleLogIn triggered. :: userData = ", userData );
        try {
            if ( userData ) {
                if ( utils.val.isObject( userData ) && userData.hasOwnProperty( "token" ) ) {
                    // Save token
                    SetToken( userData?.token );
                    setUserToken( userData?.token );
                }
                setUser( userData );
                handleLogInFinish();
                // window.location.href = "/dashboard";
            }
        } catch ( error ) {
            console.error( "ERROR: Failed to log in: ", error );
        }
    };

    const handleAuthResult = ( res ) => {
        console.log( "Login :: handleAuthResult :: res = ", res );
        if ( res ) {
            handleLogIn( res );
        } else {
            handleLogOut();
        }
    };

    const handleGoogleAuthSuccess = ( userInfo, accessToken ) => {
        if ( googleAuth?.handleSuccess ) {
            googleAuth.handleSuccess( userInfo, accessToken );
        }
        setAuthError( null );
        setUserGoogleOAuthData( userInfo );
        if ( onAuthSuccess ) {
            onAuthSuccess( userInfo );
        }
    };

    const handleGoogleAuthError = ( error ) => {
        // googleAuth.handleError( error );
        if ( googleAuth?.handleError && error ) {
            googleAuth.handleError( error || "" );
        }
        setAuthError( `Google authentication failed: ${ error || "" }` );
    };

    const handleAuthSuccess = ( userData ) => {
        setAuthError( null );
        setUserGoogleOAuthData( userData );
        handleAuthResult( userData );
        if ( onAuthSuccess ) {
            onAuthSuccess( userData );
        }
    };

    const handleCheckUser = async () => {
        // Verify that this user is signed in AND has valid credentials/token.
        const token = GetToken();
        if (/*  userLoggedIn === true &&  */ token !== "" ) {
            // Either already signed in, OR freshly authenticated.
            // TODO :: Improve this later.
            if ( window.confirm( "It looks like you're already authenticated. Do you want to log in with these credentials?" ) ) {
                // User wants to use this account.
                try {
                    const result = await authUser();
                    if ( result ) {
                        handleLogIn( result );
                    }
                } catch ( error ) {
                    console.error( "ERROR: Failed to route to dashboard: ", error );
                }
            } else {
                // User wants to use a different account.
                // DeleteToken();
                handleLogOut();
            }
        }
    };

    /* useEffect( () => {
          if ( !isAuthenticated && !askedLogin ) {
              // On component mount, check if the user is already authenticated.
              // If so, redirect to their dashboard.
              if ( mode === 'login' ) {
                  // Login mode
                  setAskedLogin( true );
                  handleCheckUser();
              }
              else {
                  // Signup mode
                  setAskedLogin( true );
              }
          }
      }, [] );
   */

    const googleButton = useMemo( () => {
        return (
            <GoogleLoginButton
                className="w-full"
                onAuthSuccess={ handleGoogleAuthSuccess }
                onAuthError={ handleGoogleAuthError }
                onSignOut={ () => {
                    if ( googleAuth?.signOut ) {
                        googleAuth.signOut();
                    }
                } }
            />
        );
    }, [ googleAuth?.signOut ] );


    return (
        <HomeContainer classNames="min-h-screen bg-gradient-to-br h-screen w-full items-center justify-center overflow-hidden">

            <div className="w-full h-full overflow-hidden justify-center items-center">
                { authError && (
                    <Alert variant="destructive">
                        <AlertDescription>{ authError }</AlertDescription>
                    </Alert>
                ) }

                { formMode === "login" ? (
                    <div className="w-full h-full overflow-auto justify-center items-center md:flex-row flex-col">
                        <SignInForm
                            onSubmit={ handleLoginSubmit }
                            onSuccess={ ( result ) => {
                                console.log( "[v0] Login.jsx :: SignInForm :: onSuccess triggered. :: result = ", result );
                                if ( result ) {
                                    handleLogIn( result );
                                }
                            } }
                            onSwitchToSignUp={ () => setFormMode( "signup" ) }
                            credentials={ credentials }
                            setCredentials={ setCredentials }
                        />
                        <div className="relative p-4 md:w-[40%] flex-col items-center justify-center">
                            <div className="relative p-4 md:max-w-96 md:w-full">
                                <div className="absolute inset-0 flex items-center">
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background p-2 text-muted-foreground items-center justify-center text-center">
                                        Or continue with
                                    </span>
                                </div>
                            { googleButton }
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full overflow-auto space-y-4 justify-center items-center flex-row">
                        <SignUpForm
                            onSubmit={ handleSignupSubmit }
                            onSuccess={ ( result ) => {
                                console.log( "[v0] Login.jsx :: SignUpForm :: onSuccess triggered. :: result = ", result );
                                if ( result ) {
                                    handleSignup( result );
                                }
                            } }
                            onSwitchToSignIn={ () => setFormMode( "login" ) }
                            credentials={ credentials }
                            setCredentials={ setCredentials }
                        />
                    </div>
                ) }

            </div>
        </HomeContainer>
    );
};

export default Login;

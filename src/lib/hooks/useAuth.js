"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import * as utils from "akashatools";
import useError from "./useError";
import useGlobalStore from "@/store/global.store";
import { AUTH_TOKEN_STORAGE_NAME } from "@/lib/config/constants";
import { handleApiRequest } from "../utilities/fetch";
import { validatePassword } from "../utilities/validation";
import { toast } from "sonner";
import { fetchUserById, fetchUserList, updateUser } from "../services/authService";

const API_BASE_URL = "/api/users";

/**
 * Simplified authentication hook with minimal state management
 * @param {boolean} useSuccessToast - Whether to show success toasts
 * @param {Object} callbacks - Callback functions for auth events
 * @returns {Object} Auth state and methods
 */
const useAuth = ( useSuccessToast = true, useErrorToast = true, callbacks = {} ) => {
    const {
        debug, setDebug,
        user, setUser,
        usersData, setUsersData,
        loading, setLoading,
        error, setError,
        wipeData,
        userToken, setUserToken,
        userLoggedIn, setUserLoggedIn,

        logUserOut,
        requestLogUserOut, setRequestLogUserOut,
        requestRevalidateUser, setRequestRevalidateUser,
    } = useGlobalStore();

    const {
        handleError,
        handleSuccess,
        handleResponse,
        handleErrorCallback,
        handleSuccessCallback
    } = useError( useSuccessToast, useErrorToast );
    const { onLogin, onLogout, onTokenRefresh } = callbacks || {};

    const isProcessing = useRef( false );

    //////////////////////////////////////////////////////
    ////////////////////// USER AUTH /////////////////////
    //////////////////////////////////////////////////////

    /* const SetToken = ( t ) => {
        localStorage.setItem( AUTH_TOKEN_STORAGE_NAME, t );
        sessionStorage.setItem( AUTH_TOKEN_STORAGE_NAME, t );
    };

    const GetToken = () => {
        const t = localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) || sessionStorage.getItem( AUTH_TOKEN_STORAGE_NAME );
        if ( t ) { return t; }
        else { return null; }
    };

    const DeleteToken = () => {
        if ( debug === true ) console.log( "Deleting user userToken: ", userToken );
        localStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
        sessionStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
        setUserToken( null );
    }; */

    const getToken = () => {
        console.log( '[useAuth] :: getToken called. Token is currently = ', localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) );
        return localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) || sessionStorage.getItem( AUTH_TOKEN_STORAGE_NAME );
    };

    const setToken = ( token ) => {
        console.log( '[useAuth] :: setToken called. token = ', token );
        if ( token ) {
            localStorage.setItem( AUTH_TOKEN_STORAGE_NAME, token );
            sessionStorage.setItem( AUTH_TOKEN_STORAGE_NAME, token );
            if ( onTokenRefresh ) onTokenRefresh( token );
        }
    };

    const deleteToken = () => {
        console.log( '[useAuth] :: deleteToken called. Token is currently = ', localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ) );
        localStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
        sessionStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
    };

    // const isAuthenticated = useMemo( () => ( !!( user && getToken() ) ), [ user ] );
    const isAuthenticated = useCallback( () => {
        console.log( "[useAuth] :: isAuthenticated called :: returning: ", user && getToken() );
        return ( !!( user && getToken() ) );
    }, [ user ] );
    // const userToken = getToken();
    // const userLoggedIn = !!user;
    // setUserLoggedIn( userLoggedIn );

    const clearAuthState = useCallback( () => {
        console.log( "[useAuth]: Clearing auth state" );
        // deleteToken();
        setUser( null );
        // setUserLoggedIn( false );
        // setUserToken( null );
        // setError( null );
    }, [ setUser, setError ] );

    const login = async ( credentials ) => {
        if ( isProcessing.current ) return null;

        if ( !credentials || !utils.ao.hasAll( credentials, [ "username", "password" ] ) ) {
            const errorMsg = "Invalid credentials provided";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        isProcessing.current = true;
        setLoading( true );

        try {
            console.log( "[useAuth]: Attempting login..." );

            const result = await handleApiRequest( {
                method: "post",
                url: `${ API_BASE_URL }/auth/login`,
                data: {
                    username: credentials.username,
                    password: credentials.password,
                },
                setLoading,
                setError,
            } );

            // const userData = result?.data?.data;
            const userData = result || result?.data?.data;
            const token = result?.token;
            console.log( "[useAuth]: Login result = ", result, " :: ", "userData = ", userData );

            if ( userData && token ) {
                console.log( "[useAuth]: Login successful" );
                setToken( token );
                setUserLoggedIn( true );
                setUserToken( token );
                setUser( userData );

                if ( useSuccessToast ) {
                    toast.success( `Welcome back, ${ userData.display_name || userData.username }!` );
                }

                if ( onLogin ) {
                    console.log( "[useAuth]: Calling onLogin callback" );
                    onLogin( userData, token );
                }

                // Navigate after state updates
                setTimeout( () => {
                    window.location.href = "/dash/home";
                }, 100 );

                return userData;
            } else {
                throw new Error( "Error during login: Invalid response from server" );
            }
        } catch ( err ) {
            console.error( "[useAuth]: Login error:", err );
            const errorMsg = err.message || "Login failed";
            setError( errorMsg );
            toast.error( `Login failed: ${ errorMsg }` );
            return null;
        } finally {
            setLoading( false );
            isProcessing.current = false;
            return null;
        }
    };

    /**
     * Enhanced signup function with plan selection and validation
     * @param {Object} credentials - User signup data
     * @returns {Object} Signup result
     */
    const signup = async ( credentials ) => {
        if ( isProcessing.current ) return null;

        const required = [ "password", "confirmPassword", "username", "display_name", "email" ];
        if ( !credentials || !utils.ao.hasAll( credentials, required ) ) {
            const errorMsg = "Missing required fields";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        if ( credentials.password !== credentials.confirmPassword ) {
            const errorMsg = "Passwords must match";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if ( !emailRegex.test( credentials.email ) ) {
            const errorMsg = "Invalid email format";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        // Validate password strength
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const passwordValid = validatePassword( credentials.password );
        if ( !passwordValid ) {
            const errorMsg = "Invalid password. Password must contain uppercase, lowercase, number, and special character";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        isProcessing.current = true;
        setLoading( true );

        try {
            console.log( "[useAuth]: Attempting signup..." );

            // Build data to send to server.
            const signupData = {
                ...credentials,
                firstName: credentials.firstName || credentials.display_name?.split( ' ' )[ 0 ] || '',
                lastName: credentials.lastName || credentials.display_name?.split( ' ' ).slice( 1 ).join( ' ' ) || '',
                email: credentials.email.toLowerCase(),
                password: credentials.password,
                plan: credentials?.plan || "free",
                subscribeNewsletter: !!credentials?.subscribeNewsletter || false,
                emailOptInConsent: !!credentials?.emailOptInConsent || false,
                phoneOptInConsent: !!credentials?.phoneOptInConsent || false,
            };


            const result = await handleApiRequest( {
                method: "post",
                url: `${ API_BASE_URL }/auth/signup`,
                data: signupData,
                setLoading,
                setError,
            } );

            // const userData = result?.data?.data;
            // const token = result?.data?.token || userData?.token;
            const userData = result || result?.data?.data;
            const token = result?.token;
            console.log( '[useAuth] :: signup :: result = ', result );

            if ( userData && token ) {
                console.log( "[useAuth]: Signup successful" );
                setToken( token );
                setUser( userData );

                if ( useSuccessToast ) {
                    toast.success( `Account created successfully! Welcome, ${ userData?.display_name }!` );
                }

                if ( onLogin ) {
                    console.log( "[useAuth]: Calling onLogin callback" );
                    onLogin( userData, token );
                }

                // Navigate after state updates
                setTimeout( () => {
                    window.location.href = "/dash/home";
                }, 100 );

                return userData;
            } else {
                throw new Error( "Error during signup: Invalid response from server" );
            }
        } catch ( err ) {
            console.error( "[useAuth]: Signup error:", err );
            const errorMsg = err.message || "Signup failed";
            setError( errorMsg );
            toast.error( `Signup failed: ${ errorMsg }` );
            return null;
        } finally {
            setLoading( false );
            isProcessing.current = false;
        }


        // try {
        //     console.log( "[useAuth]: Attempting signup..." );

        //     // Check if user already exists (simulate database check)
        //     const existingUsers = [ "test@example.com", "admin@example.com" ];
        //     if ( existingUsers.includes( signupData.email ) ) {
        //         throw new Error( "User with this email already exists" );
        //     }

        //     // Simulate processing delay
        //     await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

        //     // Create user object
        //     const userId = `user_${ Date.now() }`;
        //     const newUser = {
        //         id: userId,
        //         firstName: signupData.firstName,
        //         lastName: signupData.lastName,
        //         email: signupData.email,
        //         username: credentials.username,
        //         display_name: credentials.display_name,
        //         plan: signupData.plan,
        //         status: "active",
        //         createdAt: new Date().toISOString(),
        //         subscribeNewsletter: signupData.subscribeNewsletter,
        //         subscription: signupData.plan === "pro" ? {
        //             status: "active",
        //             currentPeriodStart: new Date().toISOString(),
        //             currentPeriodEnd: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString(),
        //             cancelAtPeriodEnd: false,
        //         } : null,
        //     };

        //     // Generate token
        //     const token = `token_${ Date.now() }_${ Math.random().toString( 36 ).substr( 2, 9 ) }`;

        //     console.log( "[useAuth]: Signup successful" );
        //     setToken( token );
        //     setUser( newUser );
        //     setUserLoggedIn( true );
        //     setUserToken( token );

        //     if ( useSuccessToast ) {
        //         toast.success( `Account created successfully! Welcome, ${ newUser.display_name }!` );
        //     }

        //     if ( onLogin ) {
        //         console.log( "[useAuth]: Calling onLogin callback" );
        //         onLogin( newUser, token );
        //     }

        //     // Navigate after state updates
        //     setTimeout( () => {
        //         window.location.href = "/dash/home";
        //     }, 100 );

        //     return newUser;
        // } catch ( err ) {
        //     console.error( "[useAuth]: Signup error:", err );
        //     const errorMsg = err.message || "Signup failed";
        //     setError( errorMsg );
        //     toast.error( `Signup failed: ${ errorMsg }` );
        //     return null;
        // } finally {
        //     setLoading( false );
        //     isProcessing.current = false;
        // }
    };

    const logout = () => {
        console.log( "[useAuth]: Logging out..." );

        if ( onLogout ) {
            onLogout( user );
        }

        clearAuthState();
        wipeData();

        if ( useSuccessToast ) {
            toast.success( "Logged out successfully" );
        }

        // Navigate to home
        setTimeout( () => {
            window.location.href = "/";
        }, 100 );
    };

    const verifyUser = useCallback( async () => {
        if ( isProcessing.current ) {
            console.log( "[useAuth]: Already processing, skipping verification" );
            return null;
        }

        console.log( "[useAuth]: verifyUser called. " );
        const token = getToken();
        console.log( "[useAuth]: verifyUser called with token:", !!token );

        if ( !token ) {
            console.log( "[useAuth]: No token found, clearing auth state" );
            clearAuthState();
            return null;
        }

        isProcessing.current = true;

        try {
            console.log( "[useAuth]: Verifying token..." );

            const result = await handleApiRequest( {
                method: "post",
                url: `${ API_BASE_URL }/auth`,
                headers: {
                    "x-auth-token": token,
                    "Content-type": "application/json",
                },
                setLoading,
                setError,
            } );

            // const userData = result?.data?.data;
            const userData = result;
            console.log( "[useAuth]: Token verification result: ", result, " :: ", "userData = ", userData );

            if ( userData && utils.val.isObject( userData ) ) {
                const userToken = userData?.token || token;
                setToken( userToken );
                setUser( userData );
                setUserLoggedIn( true );
                setUserToken( userToken );

                console.log( "[useAuth]: User state updated successfully" );

                if ( onLogin ) {
                    console.log( "[useAuth]: Calling onLogin callback" );
                    onLogin( userData, userToken );
                }

                return userData;
            } else {
                console.log( "[useAuth]: Invalid user data received, clearing auth" );
                clearAuthState();
                return null;
            }
        } catch ( error ) {
            console.error( "[useAuth]: Token verification error:", error );
            clearAuthState();
            return null;
        } finally {
            isProcessing.current = false;
        }
        // }, [ onLogin, setUser, setLoading, setError, clearAuthState ] );
    }, [] );

    //////////////////////////////////////////////////////
    ////////////// USER PROFILE & USER DATA //////////////
    //////////////////////////////////////////////////////

    const handleGetUserList = async () => {
        const res = await fetchUserList( {
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
            stateSetter: setUsersData,
            setLoading,
            setError,
            doThrowError: true,
        } );

        if ( debug === true ) console.log( "useAuth :: handleGetUserList :: res = ", res );
    };

    const handleFetchUserById = async ( id ) => {
        const result = await fetchUserById( {
            id: id,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );

        if ( utils.val.isDefined( result ) ) {
            return result;
        } else {
            console.error(
                `useAuth :: handleFetchUserById :: userData = `,
                user,
                " :: ",
                "Error fetching user by id: ",
                id,
                " :: ",
                "result = ",
                result,
            );
            return null;
        }
    };

    const handleUpdateUser = async ( id, data ) => {
        const result = await updateUser( {
            id: id,
            data: data,
            errorCallback: handleErrorCallback,
            successCallback: handleSuccessCallback,
        } );

        if ( utils.val.isDefined( result ) ) {
            // setUsersData( [ ...( usersData?.length > 0 ? usersData : [] ), result ] );
            setUser( {
                ...user,
                ...result
            } );
            return result;
        } else {
            console.error(
                `useAuth`,
                ` :: `, `handleUpdateUser`,
                ` :: `, `user = `, user,
                " :: ", "Error updating user data. :: result = ", result,
            );
            return null;
        }
    };

    const handleGetUserProfileData = async ( id ) => {
        if ( id ) {
            const profile = await fetchUserById( {
                id: id,
                errorCallback: handleErrorCallback,
                successCallback: handleSuccessCallback,
            } );
            return profile;
        }
        return null;
    };

    // const token = getToken();
    // console.log( "[useAuth]: Initializing, token exists:", !!token, "user exists:", !!user );

    // if ( token && !user ) {
    //     console.log( "[useAuth]: Token found but no user, verifying..." );
    //     verifyUser();
    // } else if ( !token && user ) {
    //     console.log( "[useAuth]: No token but user exists, clearing auth state" );
    //     clearAuthState();
    // }


    //////////////////////////////////////////////////////
    //////////////////// SUBSCRIPTIONS ///////////////////
    //////////////////////////////////////////////////////

    /**
     * Process payment for Pro subscription
     * @param {Object} paymentData - Payment processing data
     * @returns {Object} Payment result
     */
    const processPayment = async ( paymentData, plan = "premium" ) => {
        if ( isProcessing.current ) return null;

        const { userId, paymentMethod, billingCycle, amount, paymentDetails } = paymentData;

        // Validate required fields
        if ( !userId || !paymentMethod || !billingCycle || !amount ) {
            const errorMsg = "Missing required payment information";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        // Validate payment method
        const validPaymentMethods = [ "stripe", "paypal", "crypto" ];
        if ( !validPaymentMethods.includes( paymentMethod ) ) {
            const errorMsg = "Invalid payment method";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        isProcessing.current = true;
        setLoading( true );

        try {
            console.log( "[useAuth]: Processing payment..." );

            // Simulate payment processing based on method
            let paymentResult = { success: false, transactionId: null, error: null };

            switch ( paymentMethod ) {
                case "stripe":
                    paymentResult = await processStripePayment( paymentDetails.stripe, amount );
                    break;
                case "paypal":
                    paymentResult = await processPayPalPayment( paymentDetails.paypal, amount );
                    break;
                case "crypto":
                    paymentResult = await processCryptoPayment( paymentDetails.crypto, amount );
                    break;
            }

            if ( !paymentResult.success ) {
                throw new Error( paymentResult.error || "Payment processing failed" );
            }

            // Create subscription record
            const subscription = {
                id: `sub_${ Date.now() }`,
                userId,
                plan: plan || "premium",
                status: "active",
                amount,
                interval: billingCycle === "yearly" ? "year" : "month",
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: new Date(
                    Date.now() + ( billingCycle === "yearly" ? 365 : 30 ) * 24 * 60 * 60 * 1000
                ).toISOString(),
                paymentMethod,
                transactionId: paymentResult.transactionId,
                createdAt: new Date().toISOString(),
            };

            // Create invoice record
            const invoice = {
                id: `inv_${ Date.now() }`,
                userId,
                subscriptionId: subscription.id,
                amount,
                status: "paid",
                description: `Akasha - ${ billingCycle === "yearly" ? "Annual" : "Monthly" }`,
                paymentMethod: paymentMethod === "stripe"
                    ? `•••• ${ paymentDetails.stripe?.cardNumber?.slice( -4 ) }`
                    : paymentMethod === "paypal"
                        ? "PayPal"
                        : "Cryptocurrency",
                transactionId: paymentResult.transactionId,
                paidAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };

            const result = {
                message: "Payment processed successfully",
                subscription,
                invoice,
                transactionId: paymentResult.transactionId,
            };

            if ( useSuccessToast ) {
                toast.success( "Payment processed successfully! Your subscription is now active." );
            }

            return result;
        } catch ( error ) {
            console.error( "[useAuth]: Payment processing error:", error );
            const errorMsg = error.message || "Payment processing failed";
            setError( errorMsg );
            toast.error( `Payment failed: ${ errorMsg }` );
            return null;
        } finally {
            setLoading( false );
            isProcessing.current = false;
        }
    };

    /**
     * Simulates Stripe payment processing
     * @param {Object} stripeData - Stripe payment data
     * @param {number} amount - Payment amount
     * @returns {Object} Payment result
     */
    const processStripePayment = async ( stripeData, amount ) => {
        // Simulate processing delay
        await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );

        // Validate card data
        if ( !stripeData?.cardNumber || !stripeData?.expiryDate || !stripeData?.cvv ) {
            return { success: false, error: "Invalid card information" };
        }

        // Simulate random payment failure (10% chance)
        if ( Math.random() < 0.1 ) {
            return { success: false, error: "Card declined. Please try a different payment method." };
        }

        // Simulate successful payment
        return {
            success: true,
            transactionId: `stripe_${ Date.now() }`,
            error: null,
        };
    };

    /**
     * Simulates PayPal payment processing
     * @param {Object} paypalData - PayPal payment data
     * @param {number} amount - Payment amount
     * @returns {Object} Payment result
     */
    const processPayPalPayment = async ( paypalData, amount ) => {
        // Simulate processing delay
        await new Promise( ( resolve ) => setTimeout( resolve, 1500 ) );

        // Validate PayPal data
        if ( !paypalData?.email ) {
            return { success: false, error: "Invalid PayPal email" };
        }

        // Simulate random payment failure (5% chance)
        if ( Math.random() < 0.05 ) {
            return { success: false, error: "PayPal payment failed. Please try again." };
        }

        // Simulate successful payment
        return {
            success: true,
            transactionId: `paypal_${ Date.now() }`,
            error: null,
        };
    };

    /**
     * Simulates cryptocurrency payment processing
     * @param {Object} cryptoData - Crypto payment data
     * @param {number} amount - Payment amount
     * @returns {Object} Payment result
     */
    const processCryptoPayment = async ( cryptoData, amount ) => {
        // Simulate processing delay (crypto takes longer)
        await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );

        // Validate crypto data
        if ( !cryptoData?.type ) {
            return { success: false, error: "Invalid cryptocurrency type" };
        }

        // Simulate random payment failure (3% chance)
        if ( Math.random() < 0.03 ) {
            return { success: false, error: "Cryptocurrency transaction failed. Please try again." };
        }

        // Simulate successful payment with 20% discount
        const discountedAmount = amount * 0.8;

        return {
            success: true,
            transactionId: `crypto_${ cryptoData.type }_${ Date.now() }`,
            error: null,
            actualAmount: discountedAmount,
        };
    };


    return {
        // State
        user,
        userLoggedIn,
        userToken,
        isAuthenticated,
        loading,
        error,

        // Methods
        login,
        signup,
        logout,
        verifyUser,
        authUser: verifyUser, // Alias for backward compatibility
        SetToken: setToken,
        GetToken: getToken,
        DeleteToken: deleteToken,
        clearAuthState,

        handleGetUserList,
        handleFetchUserById,
        handleUpdateUser,
        handleGetUserProfileData,
    };
};

export default useAuth;


/* 
    const signup = async ( credentials ) => {
        if ( isProcessing.current ) return null;

        const required = [ "password", "confirmPassword", "username", "display_name", "email" ];
        if ( !credentials || !utils.ao.hasAll( credentials, required ) ) {
            const errorMsg = "Missing required fields";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        if ( credentials.password !== credentials.confirmPassword ) {
            const errorMsg = "Passwords must match";
            setError( errorMsg );
            toast.error( errorMsg );
            return null;
        }

        isProcessing.current = true;
        setLoading( true );

        try {
            console.log( "[useAuth]: Attempting signup..." );

            const result = await handleApiRequest( {
                method: "post",
                url: `${ API_BASE_URL }/auth/signup`,
                data: credentials,
                setLoading,
                setError,
            } );

            const userData = result?.data?.data;
            const token = result?.data?.token || userData?.token;

            if ( userData && token ) {
                console.log( "[useAuth]: Signup successful" );
                setToken( token );
                setUser( userData );

                if ( useSuccessToast ) {
                    toast.success( `Account created successfully! Welcome, ${ userData?.display_name }!` );
                }

                if ( onLogin ) {
                    console.log( "[useAuth]: Calling onLogin callback" );
                    onLogin( userData, token );
                }

                // Navigate after state updates
                setTimeout( () => {
                    window.location.href = "/dash/home";
                }, 100 );

                return userData;
            } else {
                throw new Error( "Error during signup: Invalid response from server" );
            }
        } catch ( err ) {
            console.error( "[useAuth]: Signup error:", err );
            const errorMsg = err.message || "Signup failed";
            setError( errorMsg );
            toast.error( `Signup failed: ${ errorMsg }` );
            return null;
        } finally {
            setLoading( false );
            isProcessing.current = false;
        }
    };
*/

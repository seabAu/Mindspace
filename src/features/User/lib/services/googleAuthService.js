// Google OAuth configuration and authentication utilities
const GOOGLE_CLIENT_ID = "205290666106-k64p2p41u7q5o9do1f50rmqkgirgp7kq.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const GOOGLE_API_KEY = "AIzaSyCA_ntu9LJW7eBd97UJvGMyx6iXjqhjjwU";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES =
    "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

const debug = false;
let gapi = null;
let tokenClient = null;

let isGapiInitialized = false;
let isIdentityInitialized = false;

if ( debug === true )
    console.log( "[v0] Google OAuth Config:", {
        clientId: GOOGLE_CLIENT_ID,
        hasApiKey: !!GOOGLE_API_KEY,
        scopes: SCOPES,
    } );

/**
 * Initialize Google API and OAuth with singleton pattern to prevent multiple initializations
 */
export const initializeGoogleAPI = async () => {
    return new Promise( ( resolve, reject ) => {
        if ( typeof window === "undefined" ) {
            reject( new Error( "Google API can only be initialized in browser environment" ) );
            return;
        }

        if ( isGapiInitialized && gapi ) {
            console.log( "[v0] Google API already initialized" );
            resolve();
            return;
        }

        // Load Google API script
        if ( !window.gapi ) {
            const script = document.createElement( "script" );
            script.src = "https://apis.google.com/js/api.js";
            script.onload = () => {
                window.gapi.load( "client", async () => {
                    try {
                        await window.gapi.client.init( {
                            apiKey: GOOGLE_API_KEY,
                            discoveryDocs: [ DISCOVERY_DOC ],
                        } );
                        gapi = window.gapi;
                        isGapiInitialized = true;
                        console.log( "[v0] Google API client initialized successfully" );
                        resolve();
                    } catch ( error ) {
                        console.error( "[v0] Google API client init error:", error );
                        reject( error );
                    }
                } );
            };
            script.onerror = () => {
                console.error( "[v0] Failed to load Google API script" );
                reject( new Error( "Failed to load Google API script" ) );
            };
            document.head.appendChild( script );
        } else {
            gapi = window.gapi;
            isGapiInitialized = true;
            console.log( "[v0] Google API already loaded" );
            resolve();
        }
    } );
};

/**
 * Initialize Google Identity Services with singleton pattern
 */
export const initializeGoogleIdentity = () => {
    return new Promise( ( resolve, reject ) => {
        if ( typeof window === "undefined" ) {
            reject( new Error( "Google Identity can only be initialized in browser environment" ) );
            return;
        }

        if ( isIdentityInitialized && tokenClient ) {
            console.log( "[v0] Google Identity already initialized" );
            resolve();
            return;
        }

        if ( !window.google ) {
            const script = document.createElement( "script" );
            script.src = "https://accounts.google.com/gsi/client";
            script.onload = () => {
                try {
                    tokenClient = window.google.accounts.oauth2.initTokenClient( {
                        client_id: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        callback: "", // Will be set when requesting access
                    } );
                    isIdentityInitialized = true;
                    console.log( "[v0] Token client initialized successfully" );
                    resolve();
                } catch ( error ) {
                    console.error( "[v0] Token client init error:", error );
                    reject( error );
                }
            };
            script.onerror = () => {
                console.error( "[v0] Failed to load Google Identity script" );
                reject( new Error( "Failed to load Google Identity script" ) );
            };
            document.head.appendChild( script );
        } else {
            try {
                tokenClient = window.google.accounts.oauth2.initTokenClient( {
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: "", // Will be set when requesting access
                } );
                isIdentityInitialized = true;
                console.log( "[v0] Token client already initialized" );
                resolve();
            } catch ( error ) {
                console.error( "[v0] Token client init error:", error );
                reject( error );
            }
        }
    } );
};

export const requestAccessToken = () => {
    return new Promise( ( resolve, reject ) => {
        if ( !tokenClient ) {
            console.error( "[v0] Token client not initialized" );
            reject( new Error( "Token client not initialized" ) );
            return;
        }

        tokenClient.callback = ( response ) => {
            if ( response.error !== undefined ) {
                console.error( "[v0] Token request error:", response.error, response.error_description );
                reject( new Error( `OAuth Error: ${ response.error } - ${ response.error_description || "Unknown error" }` ) );
            } else {
                // Set the token in gapi client
                if ( gapi && gapi.client ) {
                    gapi.client.setToken( {
                        access_token: response.access_token,
                    } );
                }
                resolve( response.access_token );
            }
        };

        try {
            if ( gapi && gapi.client.getToken() === null ) {
                tokenClient.requestAccessToken( { prompt: "consent" } );
            } else {
                tokenClient.requestAccessToken( { prompt: "" } );
            }
        } catch ( error ) {
            console.error( "[v0] Error requesting access token:", error );
            reject( error );
        }
    } );
};

export const signOut = () => {
    if ( gapi && gapi.client.getToken() !== null ) {
        const token = gapi.client.getToken();
        if ( token && token.access_token ) {
            window.google.accounts.oauth2.revoke( token.access_token );
        }
        gapi.client.setToken( "" );
    }
};

export const isSignedIn = () => {
    const signedIn = gapi && gapi.client.getToken() !== null;
    return signedIn;
};

export const getCurrentUser = async () => {
    if ( !isSignedIn() ) {
        console.error( "[v0] User not signed in" );
        throw new Error( "User not signed in" );
    }

    try {
        const response = await gapi.client.request( {
            path: "https://www.googleapis.com/oauth2/v2/userinfo",
        } );
        return response.result;
    } catch ( error ) {
        console.error( "[v0] Error getting user info:", error );
        throw error;
    }
};

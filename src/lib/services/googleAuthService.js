// Google OAuth configuration and authentication utilities
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
const GOOGLE_API_KEY = "AIzaSyCA_ntu9LJW7eBd97UJvGMyx6iXjqhjjwU";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/calendar";

let gapi = null;
let tokenClient = null;

// Initialize Google API and OAuth
export const initializeGoogleAPI = async () => {
    return new Promise( ( resolve, reject ) => {
        if ( typeof window === "undefined" ) {
            reject( new Error( "Google API can only be initialized in browser environment" ) );
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
                        resolve();
                    } catch ( error ) {
                        reject( error );
                    }
                } );
            };
            script.onerror = () => reject( new Error( "Failed to load Google API script" ) );
            document.head.appendChild( script );
        } else {
            gapi = window.gapi;
            resolve();
        }
    } );
};

// Initialize Google Identity Services
export const initializeGoogleIdentity = () => {
    return new Promise( ( resolve, reject ) => {
        if ( typeof window === "undefined" ) {
            reject( new Error( "Google Identity can only be initialized in browser environment" ) );
            return;
        }

        if ( !window.google ) {
            const script = document.createElement( "script" );
            script.src = "https://accounts.google.com/gsi/client";
            script.onload = () => {
                tokenClient = window.google.accounts.oauth2.initTokenClient( {
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: "", // Will be set when requesting access
                } );
                resolve();
            };
            script.onerror = () => reject( new Error( "Failed to load Google Identity script" ) );
            document.head.appendChild( script );
        } else {
            tokenClient = window.google.accounts.oauth2.initTokenClient( {
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: "", // Will be set when requesting access
            } );
            resolve();
        }
    } );
};

// Request access token
export const requestAccessToken = () => {
    return new Promise( ( resolve, reject ) => {
        if ( !tokenClient ) {
            reject( new Error( "Token client not initialized" ) );
            return;
        }

        tokenClient.callback = ( response ) => {
            if ( response.error !== undefined ) {
                reject( response );
            } else {
                resolve( response.access_token );
            }
        };

        if ( gapi && gapi.client.getToken() === null ) {
            tokenClient.requestAccessToken( { prompt: "consent" } );
        } else {
            tokenClient.requestAccessToken( { prompt: "" } );
        }
    } );
};

// Sign out
export const signOut = () => {
    if ( gapi && gapi.client.getToken() !== null ) {
        window.google.accounts.oauth2.revoke( gapi.client.getToken().access_token );
        gapi.client.setToken( "" );
    }
};

// Check if user is signed in
export const isSignedIn = () => {
    return gapi && gapi.client.getToken() !== null;
};

// Get current user info
export const getCurrentUser = async () => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        const response = await gapi.client.request( {
            path: "https://www.googleapis.com/oauth2/v2/userinfo",
        } );
        return response.result;
    } catch ( error ) {
        console.error( "Error getting user info:", error );
        throw error;
    }
};

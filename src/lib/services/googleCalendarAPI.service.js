// Google Calendar API utilities for CRUD operations
import { isSignedIn } from "./googleAuth.js";
import {
    appEventToGoogleEvent,
    googleEventToAppEvent,
    validateAppEvent,
    validateGoogleEvent,
} from "./eventTranslator.js";

/**
 * Enhanced error handler for Google Calendar API operations
 * @param {Error} error - The error object from Google API
 * @param {string} operation - The operation that failed
 * @returns {Object} Formatted error response
 */
const handleGoogleCalendarError = ( error, operation ) => {
    console.error( `Google Calendar API Error (${ operation }):`, error );

    let userMessage = `Failed to ${ operation }`;
    const errorCode = error.status || error.code || "UNKNOWN";

    switch ( errorCode ) {
        case 401:
            userMessage = "Authentication required. Please sign in to Google again.";
            break;
        case 403:
            userMessage = "Permission denied. Please check your Google Calendar permissions.";
            break;
        case 404:
            userMessage = "Calendar or event not found.";
            break;
        case 409:
            userMessage = "Conflict occurred. The event may have been modified by another user.";
            break;
        case 429:
            userMessage = "Too many requests. Please try again in a moment.";
            break;
        case 500:
        case 502:
        case 503:
            userMessage = "Google Calendar service is temporarily unavailable.";
            break;
        default:
            userMessage = `${ operation } failed: ${ error.message || "Unknown error" }`;
    }

    return {
        success: false,
        error: {
            code: errorCode,
            message: userMessage,
            originalError: error,
        },
    };
};

// Get list of calendars
export const getCalendarList = async () => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        const response = await window.gapi.client.calendar.calendarList.list();
        return response.result.items || [];
    } catch ( error ) {
        console.error( "Error fetching calendar list:", error );
        throw error;
    }
};

// Get events from a specific calendar
export const getCalendarEvents = async ( calendarId = "primary", timeMin = null, timeMax = null ) => {
    if ( !isSignedIn() ) {
        return handleGoogleCalendarError( new Error( "User not signed in" ), "fetch events" );
    }

    const params = {
        calendarId: calendarId,
        timeMin: timeMin || new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
    };

    if ( timeMax ) {
        params.timeMax = timeMax;
    }

    try {
        const response = await window.gapi.client.calendar.events.list( params );
        const googleEvents = response.result.items || [];

        return {
            success: true,
            data: googleEvents,
            appEvents: googleEvents.map( googleEventToAppEvent ),
        };
    } catch ( error ) {
        return handleGoogleCalendarError( error, "fetch events" );
    }
};

// Create a new event
export const createCalendarEvent = async ( eventData, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        return handleGoogleCalendarError( new Error( "User not signed in" ), "create event" );
    }

    // Validate app event before conversion
    const validation = validateAppEvent( eventData );
    if ( !validation.isValid ) {
        return handleGoogleCalendarError( new Error( `Validation failed: ${ validation.errors.join( ", " ) }` ), "create event" );
    }

    try {
        // Convert app event to Google format
        const googleEventData = appEventToGoogleEvent( eventData );

        // Validate Google event format
        const googleValidation = validateGoogleEvent( googleEventData );
        if ( !googleValidation.isValid ) {
            return handleGoogleCalendarError(
                new Error( `Google format validation failed: ${ googleValidation.errors.join( ", " ) }` ),
                "create event",
            );
        }

        const response = await window.gapi.client.calendar.events.insert( {
            calendarId: calendarId,
            resource: googleEventData,
        } );

        return {
            success: true,
            data: response.result,
            appEvent: googleEventToAppEvent( response.result ),
        };
    } catch ( error ) {
        return handleGoogleCalendarError( error, "create event" );
    }
};

// Update an existing event
export const updateCalendarEvent = async ( eventId, eventData, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        return handleGoogleCalendarError( new Error( "User not signed in" ), "update event" );
    }

    const validation = validateAppEvent( eventData );
    if ( !validation.isValid ) {
        return handleGoogleCalendarError( new Error( `Validation failed: ${ validation.errors.join( ", " ) }` ), "update event" );
    }

    try {
        const googleEventData = appEventToGoogleEvent( eventData );
        const googleValidation = validateGoogleEvent( googleEventData );
        if ( !googleValidation.isValid ) {
            return handleGoogleCalendarError(
                new Error( `Google format validation failed: ${ googleValidation.errors.join( ", " ) }` ),
                "update event",
            );
        }

        const response = await window.gapi.client.calendar.events.update( {
            calendarId: calendarId,
            eventId: eventId,
            resource: googleEventData,
        } );

        return {
            success: true,
            data: response.result,
            appEvent: googleEventToAppEvent( response.result ),
        };
    } catch ( error ) {
        return handleGoogleCalendarError( error, "update event" );
    }
};

// Delete an event
export const deleteCalendarEvent = async ( eventId, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        return handleGoogleCalendarError( new Error( "User not signed in" ), "delete event" );
    }

    try {
        await window.gapi.client.calendar.events.delete( {
            calendarId: calendarId,
            eventId: eventId,
        } );

        return {
            success: true,
            data: { eventId, deleted: true },
        };
    } catch ( error ) {
        return handleGoogleCalendarError( error, "delete event" );
    }
};

// Watch for calendar changes (webhooks)
export const watchCalendarEvents = async ( calendarId = "primary", webhookUrl ) => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        const response = await window.gapi.client.calendar.events.watch( {
            calendarId: calendarId,
            resource: {
                id: `calendar-watch-${ Date.now() }`,
                type: "web_hook",
                address: webhookUrl,
            },
        } );
        return response.result;
    } catch ( error ) {
        console.error( "Error setting up calendar watch:", error );
        throw error;
    }
};

export const syncAppEventToGoogle = async ( appEvent, calendarId = "primary" ) => {
    if ( appEvent.googleCalendarId ) {
        // Update existing Google Calendar event
        return await updateCalendarEvent( appEvent.googleCalendarId, appEvent, calendarId );
    } else {
        // Create new Google Calendar event
        const result = await createCalendarEvent( appEvent, calendarId );
        if ( result.success ) {
            // Store the Google Calendar ID in the app event for future updates
            result.appEvent.googleCalendarId = result.data.id;
        }
        return result;
    }
};

export const batchSyncEvents = async ( appEvents, calendarId = "primary" ) => {
    const results = {
        successful: [],
        failed: [],
        total: appEvents.length,
    };

    for ( const appEvent of appEvents ) {
        try {
            const result = await syncAppEventToGoogle( appEvent, calendarId );
            if ( result.success ) {
                results.successful.push( { appEvent, googleEvent: result.data } );
            } else {
                results.failed.push( { appEvent, error: result.error } );
            }
        } catch ( error ) {
            results.failed.push( { appEvent, error: handleGoogleCalendarError( error, "sync event" ) } );
        }
    }

    return results;
};

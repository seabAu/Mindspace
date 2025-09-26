// Google Calendar API utilities for CRUD operations
import { isSignedIn } from "./googleAuthService.js";

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
        throw new Error( "User not signed in" );
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
        return response.result.items || [];
    } catch ( error ) {
        console.error( "Error fetching calendar events:", error );
        throw error;
    }
};

// Create a new event
export const createCalendarEvent = async ( eventData, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        const response = await window.gapi.client.calendar.events.insert( {
            calendarId: calendarId,
            resource: eventData,
        } );
        return response.result;
    } catch ( error ) {
        console.error( "Error creating calendar event:", error );
        throw error;
    }
};

// Update an existing event
export const updateCalendarEvent = async ( eventId, eventData, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        const response = await window.gapi.client.calendar.events.update( {
            calendarId: calendarId,
            eventId: eventId,
            resource: eventData,
        } );
        return response.result;
    } catch ( error ) {
        console.error( "Error updating calendar event:", error );
        throw error;
    }
};

// Delete an event
export const deleteCalendarEvent = async ( eventId, calendarId = "primary" ) => {
    if ( !isSignedIn() ) {
        throw new Error( "User not signed in" );
    }

    try {
        await window.gapi.client.calendar.events.delete( {
            calendarId: calendarId,
            eventId: eventId,
        } );
        return true;
    } catch ( error ) {
        console.error( "Error deleting calendar event:", error );
        throw error;
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

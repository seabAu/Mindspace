
import {
    devtools,
    subscribeWithSelector,
    combine,
    persist
} from 'zustand/middleware';
import { create } from 'zustand';
import useGlobalStore from './global.store';
import * as utils from 'akashatools';
import API from '@/lib/services/api';
import { ZUSTAND_PLANNER_STORE_STORAGE_NAME } from '@/lib/config/constants';
import { isSameDay } from 'date-fns';

const createPlannerStatusSlice = ( set, get, api ) => ( {
    // Fetch result helper variables
    loading: false,
    setLoading: ( loading ) => set( () => ( { loading } ) ),

    error: null,
    setError: ( error ) => set( () => ( { error } ) ),
} );

const createPlannerSlice = ( set, get, api ) => ( {
    // State slice for planners (the planner datatype, not overall; list of all calendars, logs, and events).
    requestFetchPlanners: false,
    setRequestFetchPlanners: ( requestFetchPlanners ) =>
        set( () => ( { requestFetchPlanners } ) ),

    // Planner variables
    plannerData: null, // [],
    setPlannerData: ( plannerData ) => {
        set( { plannerData: plannerData } );
    },

    addPlanner: ( planner ) => {
        set( ( state ) => ( { plannerData: [ ...state.plannerData, planner ] } ) );
    },

    updatePlanner: ( id, updates ) => {
        set( ( state ) => ( {
            plannerData: state.plannerData.map( ( c ) => ( c._id === id ? { ...c, ...updates } : c ) ),
        } ) );
    },

    deletePlanner: ( id ) => {
        set( ( state ) => ( {
            plannerData: state.plannerData.filter( ( c ) => c._id !== id ),
        } ) );
    },

    clearPlannerData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( { plannerData: [] } );
    },
} );

const createPlannerCalendarsSlice = ( set, get, api ) => ( {

    requestFetchCalendars: false,
    setRequestFetchCalendars: ( requestFetchCalendars ) =>
        set( () => ( { requestFetchCalendars } ) ),

    calendarsData: null, // [],
    setCalendarsData: ( calendarsData ) => {
        set( { calendarsData: calendarsData } );
    },

    calendarsEventsData: null, // [],
    setCalendarsEventsData: ( calendarsEventsData ) => {
        set( { calendarsEventsData: calendarsEventsData } );
    },

    selectedCalendar: null,
    setSelectedCalendar: ( selectedCalendar ) => set( () => ( { selectedCalendar } ) ),

    addCalendar: ( calendar ) => {
        set( ( state ) => ( { calendarsData: [ ...state.calendarsData, calendar ] } ) );
    },

    updateCalendar: ( id, updates ) => {
        set( ( state ) => ( {
            calendarsData: state.calendarsData.map( ( c ) => ( c._id === id ? { ...c, ...updates } : c ) ),
        } ) );
    },

    deleteCalendar: ( id ) => {
        set( ( state ) => ( {
            calendarsData: state.calendarsData.filter( ( c ) => c._id !== id ),
        } ) );
    },

    clearCalendarData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( { calendarsData: [] } );
    },
} );

const createPlannerEventsSlice = ( set, get, api ) => ( {
    requestFetchEvents: false,
    setRequestFetchEvents: ( requestFetchEvents ) =>
        set( () => ( { requestFetchEvents } ) ),

    eventsData: null, // [],
    setEventsData: ( eventsData ) => {
        set( { eventsData: eventsData } );
    },

    selectedDate: null,
    setSelectedDate: ( selectedDate ) => set( () => ( { selectedDate } ) ),

    upcomingEventsData: null,
    setUpcomingEventsData: ( upcomingEventsData ) => set( () => ( { upcomingEventsData } ) ),

    upcomingEventsRange: {
        numDays: 7,
        startDate: new Date( Date.now() ),
        endDate: new Date( Date.now() + 7 * 24 * 60 * 60 ),
    },

    setUpcomingEventsRange: ( data ) => {
        console.log( "planner.store :: setUpcomingEventsRange triggered :: data = ", data );
        if ( data && data?.startDate && data?.endDate ) {
            let start = new Date( data?.startDate );
            let end = new Date( data?.endDate );
            set( () => ( {
                upcomingEventsRange: {
                    numDays: data?.numDays ? data?.numDays : 7,
                    startDate: start,
                    endDate: end,
                }
            } ) );
        }
    },

    selectedEvent: null,
    setSelectedEvent: ( selectedEvent ) => set( () => ( { selectedEvent } ) ),

    addEvent: ( event ) => {
        set( ( state ) => ( { eventsData: [ ...state.eventsData, event ] } ) );
    },

    updateEvent: ( id, updates ) => {
        set( ( state ) => ( {
            eventsData: state.eventsData.map( ( e ) => ( e._id === id ? { ...e, ...updates } : e ) ),
        } ) );
    },

    deleteEvent: ( id ) => {
        set( ( state ) => ( {
            eventsData: state.eventsData.filter( ( e ) => e._id !== id ),
        } ) );
    },

    sortEvents: ( events ) => (
        utils.val.isValidArray( events, true )
            ? events?.sort( ( a, b ) => new Date( b?.start ) - new Date( a?.start ) )
            : events
    ),


    getEventById: ( id ) => {
        const events = get().eventsData;
        return events?.find( ( item ) => item?._id === id ) || null;
    },

    getEventByDate: ( date ) => {
        const events = get().eventsData;
        return events?.find( ( item ) => isSameDay( new Date( item?.start ).getTime(), new Date( date ).getTime() ) ) || null;
    },

    clearEventData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( { eventsData: [] } );
    },
    
    eventTypes: [
        { name: 'event', label: 'event', color: '#16a085', },
        { name: 'appointment', label: 'appointment', color: '#27ae60', },
        { name: 'convention', label: 'convention', color: '#2c3e50', },
        { name: 'concert', label: 'concert', color: '#f39c12', },
        { name: 'date', label: 'date', color: '#e74c3c', },
        { name: 'health', label: 'health', color: '#9b59b6', },
        { name: 'fitness', label: 'fitness', color: '#FB6964', },
        { name: 'financial', label: 'financial', color: '#342224', },
        { name: 'reminder', label: 'reminder', color: '#472E32', },
        { name: 'goal', label: 'goal', color: '#BDBB99', },
        { name: 'task', label: 'task', color: '#77B1A9', },
        { name: 'repeatingEvent', label: 'repeatingEvent', color: '#73A857', },
    ],
    setEventTypes: ( eventTypes ) => set( () => ( { eventTypes } ) ),
} );

const usePlannerStore = create(
    // devtools( ( set, get, api ) => ( {  } ),
    devtools(
        persist(
            ( ...a ) => ( {
                // Combine other sub-store slices. 
                ...createPlannerSlice( ...a ),
                ...createPlannerEventsSlice( ...a ),
                ...createPlannerCalendarsSlice( ...a ),
                ...createPlannerStatusSlice( ...a ),
            } ),
            {
                name: [ ZUSTAND_PLANNER_STORE_STORAGE_NAME ],
                partialize: ( state ) => ( {
                    plannerData: state.plannerData, // Add groups to persisted state
                    selectedDate: state.selectedDate,
                    calendarsData: state.calendarsData,
                    selectedEvent: state.selectedEvent,
                    selectedCalendar: state.selectedCalendar,
                    calendarsEventsData: state.calendarsEventsData,
                    upcomingEventsRange: state.upcomingEventsRange,
                    eventsData: state.eventsData,
                    eventTypes: state.eventTypes,
                } ),
                getStorage: () => localStorage,
            },
        ),
    ),
);

export default usePlannerStore;

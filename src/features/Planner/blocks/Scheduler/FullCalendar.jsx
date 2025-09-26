import React, { Component, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
    Calendar,
    // FormatDateOptions, 
    // FormatRangeOptions, 
    // createPlugin, 
    // formatDate, 
    // formatRange, 
    // globalLocales, 
    // globalPlugins, 
    // version 
    // EventApi,
    // DateSelectArg,
    // EventClickArg,
    // EventContentArg
} from "@fullcalendar/core";
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import allLocales from "@fullcalendar/core/locales-all";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'; // a plugin!
import multiMonthPlugin from '@fullcalendar/multimonth';
import timelinePlugin from '@fullcalendar/timeline';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { toMoment } from '@fullcalendar/moment'; // only for formatting
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
// import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!
import * as utils from 'akashatools';
// import { v4 as uuid } from "uuid";

import './../Calendar/Calendar.css';
// import 'https://cdn.jsdelivr.net/fullcalendar/1.6.1/fullcalendar.css';
import { Button } from "@/components/ui/button";
import {
    ArrowBigLeft,
    ArrowBigRight,
    ArrowBigUpIcon,
    ArrowUpCircleIcon,
    Calendar1Icon,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Delete,
    Edit,
    EllipsisIcon,
    FastForwardIcon,
    FileQuestion,
    FolderOpen,
    Forward,
    ForwardIcon,
    Plus,
    PlusCircleIcon,
    RewindIcon,
    X
} from "lucide-react";
import { addHours, formatDate } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
import usePlanner from "@/lib/hooks/usePlanner";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    useSidebar
} from "@/components/ui/sidebar";
import DatePicker from "@/components/Calendar/DatePicker";
import { mapObj2Obj } from "@/lib/utilities/obj";
import { buildSelect } from "@/lib/utilities/input";
import { formatDateTime } from "@/lib/utilities/time";
import {
    createEvent,
    fetchEvents,
    fetchEventsInDateRange,
    fetchEvent,
    updateEvent,
    fetchCalendars,
    fetchEventsForCalendar,
    fetchCalendarsWithEvents,
    toggleCalendarEvent,
    createCalendar,
    fetchCalendar,
    updateCalendar,
    deleteCalendar,
} from "@/lib/services/plannerService";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import useGlobalStore from "@/store/global.store";
import usePlannerStore from "@/store/planner.store";
import { Textarea } from "@/components/ui/textarea";
import viewsConfig from "./_config/calendarViews";
import { HEADER_TRIGGER_DROPDOWN_WIDTH_LG } from "@/lib/config/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import PlannerDialogWrapper from "../../components/dialog/PlannerDialogWrapper";
import FormGenerator from "@/components/Form/FormGenerator";
import { DIALOG_TYPE_CLOSE_ICONS, DIALOG_TYPE_CLOSE_NAMES, DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from "@/lib/config/config";
import DayFormDialog from "@/blocks/DayFormDialog/DayFormDialog";
import useTask from "@/lib/hooks/useTask";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { useSettingsStore } from "@/store/settings.store";
import { stringAsColor } from "@/lib/utilities/color";

// import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/packages/list/src/index.css";
// import "@fullcalendar/timegrid/main.css";
// import "@fullcalendar/timegrid/main.css";

// Prototype conversion for date. 
// Usage: 
// d = new Date();
// $( '#today' ).html( d.yyyymmdd() );
Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = ( this.getMonth() + 1 ).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + '-' + ( mm[ 1 ] ? mm : "0" + mm[ 0 ] ) + '-' + ( dd[ 1 ] ? dd : "0" + dd[ 0 ] );
};

// const events = [ { title: "Today", date: new Date() } ];
const CalendarView = ( props ) => {
    const {
        title,
        // eventsData,
        // setEventsData,
        // selectedDate,
        // setSelectedDate,
    } = props;

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
        user,
        setUser,
        userLoggedIn,
        setUserLoggedIn,
        userToken,
        setUserToken,
        settingsDialogOpen,
        setSettingsDialogOpen,

        activeWorkspace,
        setActiveWorkspace,
        workspaceId,
        setWorkspaceId,
    } = useGlobalStore();

    const {
        // Planner
        requestFetchPlanners, setRequestFetchPlanners,
        plannerData, setPlannerData,
        addPlanner,
        updatePlanner,
        deletePlanner,

        // Calendar
        requestFetchCalendars, setRequestFetchCalendars,
        calendarsData, setCalendarsData,
        selectedCalendar, setSelectedCalendar,
        addCalendar,
        updateCalendar,
        deleteCalendar,

        // Events
        requestFetchEvents, setRequestFetchEvents,
        eventsData, setEventsData,
        selectedDate, setSelectedDate,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        selectedEvent, setSelectedEvent,
        addEvent,
        updateEvent,
        deleteEvent,

        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        // VARIABLES
        plannerSchema,
        calendarSchema,
        eventSchema,
        conversionEventSchema,
        logSchema,

        // INITIALIZERS
        initializeEvent,

        // HANDLER FUNCTIONS
        handleToggleActive,
        handleConvertEvents,
        handleInputChange,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleCancel,
        handleGetEventsData,
        handleGetCalendarsData,
        handleGetCalendarsWithEvents,

        // GETTERS / SETTERS
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogInitialData, setDialogInitialData,
        showGotoDialog, setShowGotoDialog,
        gotoDate, setGotoDate,
    } = usePlanner();

    const {
        handleCreateStart: handleCreateStartTask,
        handleCreateSubmit: handleCreateSubmitTask,
    } = useTask();

    const { integrations } = useSettingsStore();

    const [ eventsExample, setEventsExample ] = useState( [
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'event 1',
            date: new Date( Date.now() + 24 * 60 * 60 * 60 ).yyyymmdd(),
            start: new Date( Date.now() + 24 * 60 * 60 * 60 ).yyyymmdd(),
            end: new Date( Date.now() + 2 * 24 * 60 * 60 * 60 ).yyyymmdd(),
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'event 2',
            date: new Date( Date.now() + 24 * 60 * 60 * 60 ).yyyymmdd(),
            start: new Date( Date.now() + 24 * 60 * 60 * 60 ).yyyymmdd(),
            end: new Date( Date.now() + 2 * 24 * 60 * 60 * 60 ).yyyymmdd(),
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: "All Day Event",
            start: "2024-12-01",
            end: "2024-12-01",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: "Long Event",
            start: "2024-12-07",
            end: "2024-12-10",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            groupId: "999",
            title: "Repeating Event",
            start: "2024-12-09T16:00:00+00:00",
            end: "2024-12-09T18:00:00+00:00",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            groupId: "999",
            title: "Repeating Event",
            start: "2024-12-16T16:00:00+00:00",
            end: "2024-12-16T18:00:00+00:00",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: "Conference",
            start: "2024-12-23",
            end: "2024-12-25",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'my recurring event 1',
            rrule: {
                freq: 'weekly',
                interval: 5,
                byweekday: [ 'mo', 'fr' ],
                dtstart: '2024-02-01T10:30:00', // will also accept '20120201T103000'
                until: '2024-06-01', // will also accept '20120201'
            },
            start: "2024-12-23",
            end: "2024-12-25",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'my recurring event 2',
            rrule: 'DTSTART:20240201T103000Z\nRRULE:FREQ=WEEKLY;INTERVAL=5;UNTIL=20240601;BYDAY=MO,FR',
            start: "2024-12-23",
            end: "2024-12-25",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'my recurring event 3',
            rrule: {
                freq: 'weekly',
                dtstart: '2024-02-01'
            },
            exdate: [ '2024-02-08' ], // will also accept a single string
            start: "2024-12-23",
            end: "2024-12-25",
        },
        {
            id: Math.floor( utils.rand.rand( 0, 1e6, true ) ),
            title: 'my recurring event 4',
            rrule: {
                freq: 'weekly',
                dtstart: '2024-02-01'
            },
            exrule: { // will also accept an array of these objects
                freq: 'weekly',
                dtstart: '2024-02-15',
                until: '2024-02-22',
            },
            start: "2024-12-23",
            end: "2024-12-25",
        },
        {
            "title": "All Day Event",
            "start": "2025-01-01"
        },
        {
            "title": "Long Event",
            "start": "2025-01-07",
            "end": "2025-01-10"
        },
        {
            "groupId": "999",
            "title": "Repeating Event",
            "start": "2025-01-09T16:00:00+00:00"
        },
        {
            "groupId": "999",
            "title": "Repeating Event",
            "start": "2025-01-16T16:00:00+00:00"
        },
        {
            "title": "Conference",
            "start": "2025-01-04",
            "end": "2025-01-06"
        },
        {
            "title": "Meeting",
            "start": "2025-01-05T10:30:00+00:00",
            "end": "2025-01-05T12:30:00+00:00"
        },
        {
            "title": "Lunch",
            "start": "2025-01-05T12:00:00+00:00"
        },
        {
            "title": "Birthday Party",
            "start": "2025-01-06T07:00:00+00:00"
        },
        {
            "url": "http://google.com/",
            "title": "Click for Google",
            "start": "2025-01-28"
        }
    ] );

    // https://fullcalendar.io/docs/react#custom-views-with-components
    const calendarRef = useRef( null );
    const [ dayModalOpen, setDayModalOpen ] = useState( false );
    const [ weekendsVisible, setWeekendsVisible ] = useState( true );
    // const [ currentEvents, setCurrentEvents ] = useState(
    //     // handleConvertEvents( eventsData, eventsExample )
    //     handleConvertEvents( eventsData )
    //     // [
    //     // ...( utils.val.isValidArray( eventsData, true ) ? mapObj2Obj( eventsData, conversionEventSchema ) : [] ),
    //     // ...( utils.val.isValidArray( eventsData, true ) ? eventsData : [] ),
    //     // ...( eventsExample ? eventsExample : [] ),
    //     // googleCalendarId: 'abcd1234@group.calendar.google.com'
    //     // ] 
    // );
    const [ initialData, setInitialData ] = useState( null );

    function handleWeekendsToggle () {
        setWeekendsVisible( !weekendsVisible );
    }

    const show = () => setOpen( true );
    const handleEvents = useCallback(
        ( events ) => {
            console.log( "FullCalendar :: handleEvents triggered. :: events = ", events );
            // setCurrentEvents( events );
        },
        []
    );

    const currentEvents = useMemo( () => {
        /* mapObj2Obj( eventsData, conversionEventSchema )  */
        // First filter out all events not in active calendars. 
        let activeCalendars = calendarsData
            ?.filter( ( cal ) => ( cal?.isActive ) )
            ?.map( ( cal ) => ( cal?._id ) );
        let activeEvents = eventsData?.filter( ( event ) => ( activeCalendars?.includes( event?.calendarId ) ) );

        console.log( 'FullCalendar :: currentEvents :: eventsData = ', eventsData, ' :: ', 'activeCalendars = ', activeCalendars, ' :: ', 'activeEvents = ', activeEvents );

        return handleConvertEvents( activeEvents );
    }, [ eventsData, calendarsData, plannerData, conversionEventSchema ] );

    // const handleEvents = ( events ) => {
    //     if ( debug === true ) console.log( "FullCalendar :: handleEvents triggered. :: events = ", events );
    //     // setCurrentEvents( events );
    //     // setEventsData( events );
    // };

    useEffect( () => {
        // Update testing events set.
        let ev = handleConvertEvents( eventsData );
        // setCurrentEvents( ev );

        // Force-update the calendar. 
        let calendarApi = calendarRef?.current?.getApi();
        if ( calendarApi && utils.ao.has( calendarApi, 'addEvent' ) ) {
            if ( utils.val.isValidArray( eventsData, true ) ) {
                eventsData?.forEach( ( event ) => {
                    calendarApi?.addEvent( mapObj2Obj( event, conversionEventSchema ) );
                } );
            }
        }
    }, [ eventsData ] );

    useEffect( () => {
        console.log( "Fullcalendar detected a change in the eventsData." );
    }, [ eventsData ] );

    /*
        ////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////// CALENDAR VIEW CTRL //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////
    */

    // const [ selectedDate, setSelectedDate ] = useState( Date.now().toLocaleString() );
    const [ currentView, setCurrentView ] = useState( 'dayGridMonth' );

    /*
        ////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////// CALENDAR FUNCTIONS //////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////
    */

    const handleGoToDate = useCallback( ( date ) => {
        let calendarApi = calendarRef?.current?.getApi();
        if ( calendarApi && utils.ao.has( calendarApi, "gotoDate" ) ) {
            calendarApi?.gotoDate( date );
        }
    }, [ calendarRef ] );

    const handleSelect = ( info ) => {
        alert( 'selected ' + info.startStr + ' to ' + info.endStr );
    };

    const handleDateSelect = useCallback( ( selectInfo ) => {
        // calendar.select( { start, end , allDay , resourceId } )

        // let title = prompt( 'Please enter a new title for your event' );
        let calendarApi = selectInfo.view.calendar;
        // "2025-01-01T03:45:00-05:00";
        if ( calendarApi ) {
            calendarApi.unselect(); // clear date selection

            let initialData = initializeEvent( selectInfo, '', '' );
            // if ( debug === true ) 
            console.log( 'FullCalendar :: handleDateSelect triggered :: selectInfo = ', selectInfo, " :: ", 'initialData = ', initialData, " :: " );
            handleCreateStart( initialData, 'event' );
            setInitialData( initialData );
            // setDayModalOpen( true );
        }
    }, [] );

    /*  const handleDateSelect = useCallback( ( selectInfo ) => {
            let title = prompt( "Add new event" )?.trim();
            let calendarApi = selectInfo.view.calendar;
            calendarApi.unselect();
            if ( title ) {
                calendarApi.addEvent( {
                    id: createEventId(),
                    title,
                    start: selectInfo.startStr,
                    end: selectInfo.endStr,
                    allDay: selectInfo.allDay
                } );
            }
        }, [] );
    */

    const handleEventClick = (
        clickInfo,
        event,
        jsEvent,
        view
    ) => {
        /* eventClickInfo is a plain object with the following properties:
                event	
                    The associated Event Object.
                        Event Schema:
                            {
                                title: 'Birthday',
                                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu pellentesque nibh. In nisl nulla, convallis ac nulla eget, pellentesque pellentesque magna.',
                                start: '2023-09-13',
                                end: '2023-09-14',
                                className: 'fc-bg-default',
                                icon : "birthday-cake"
                            }
    
                         Recurring event schema: 
                            events: [{
                                title:"My repeating event",
                                start: '10:00', 
                                end: '14:00', 
                                dow: [ 1,2,4 ] // Mon, Tue, Thur
                            }]
    
                el	
                    The HTML element for this event.
    
                jsEvent	
                    The native JavaScript event with low-level information such as click coordinates.
    
                view	
                    The current View Object.
        */
        // if ( debug === true ) 
        console.log( "FullCalendar :: handleEventClick :: clickInfo = ", clickInfo, " :: ", "event = ", event, " :: ", "jsEvent = ", jsEvent, " :: ", "view = ", view );
        let calendarApi = clickInfo?.event;
        if ( calendarApi ) {
            let eventData = calendarApi?._def;
            let eventId = eventData?.publicId;
            function CallbackFnToFindEventById ( eventInfo ) {
                return eventInfo?._id === eventId;
            }

            if ( utils.val.isValidArray( eventsData, true ) ) {
                // Find the event that shares the eventId with the one clicked, if one exists. 
                let eventFullData = eventsData.find( CallbackFnToFindEventById );
                // if ( debug === true ) 
                console.log( 'handleEventClick :: clickInfo = ', clickInfo, " :: ", "calendarApi = ", calendarApi, " :: ", "event = ", eventFullData );
                handleEditStart( eventFullData, 'event' );
            }
            else {
                handleEditStart( eventData, 'event' );
            }
        }
    };

    /*  const handleEventClick = useCallback( ( clickInfo ) => {
            let action = prompt( 'do you want to "set" | "remove" this event?' )?.trim();
            switch ( action ) {
                case "set": {
                    let title = prompt( "New title" )?.trim();
                    let calendarApi = clickInfo.event;
                    if ( title ) {
                        calendarApi.setProp( "title", title );
                    }
                    return;
                }
                case "remove": {
                    if (
                        window.confirm( `Are you sure to remove「${ clickInfo.event.title }` )
                    ) {
                        clickInfo.event.remove();
                    }
                    return;
                }
                default:
                    break;
            }
        }, [] );
    */

    const handleAddEvent = useCallback(
        // ( { title, type } ) => {
        ( event ) => {
            const isApprove = type === "approve";
            if ( calendarRef?.current === null ) return;
            let calendarApi = calendarRef?.current?.getApi();
            if ( calendarApi && calendarRef?.hasOwnProperty( 'addEvent' ) ) {
                /* calendarApi.addEvent( {
                    // id: createEventId(),
                    id: useId(),
                    title,
                    start: todayStr + "T12:00:00",
                    end: todayStr + "T24:00:00",
                    color: isApprove ? "#37BE6B" : "#F04545",
                    allDay: true
                } ); */
                calendarApi.addEvent( mapObj2Obj( event, conversionEventSchema ) );
            }
        },
        []
    );

    useEffect( () => {
        // Respond to viewport type update by updating the actual Calendar. 
        if ( calendarRef ) {
            let calendarApi = calendarRef.current.getApi();
            if ( debug === true ) console.log( "FullCalendar :: currentView = ", currentView, " :: ", "calendarApi = ", calendarApi );
            // calendarApi.changeView( currentView, selectedDate ? selectedDate : Date.now().toLocaleString() );
            calendarApi.changeView( currentView );
        }
    }, [ currentView ] );

    const handleDateClick = ( info ) => {
        /*  dateClickInfo is a plain object with the following properties:
                date	
                a Date for the clicked day/time.
    
                dateStr	
                An ISO8601 string representation of the date. Will have a time zone offset according to the calendar’s timeZone like 2018-09-01T12:30:00-05:00. If clicked on an all-day cell, won’t have a time part nor a time zone part, like 2018-09-01.
    
                allDay	
                true or false whether the click happened on an all-day cell.
    
                dayEl	
                An HTML element that represents the whole-day that was clicked on.
    
                jsEvent	
                The native JavaScript event with low-level information such as click coordinates.
    
                view	
                The current View Object.
    
                resource	
                If the current view is a resource-view, the Resource Object that owns this date. Must be using one of the resource plugins.
        */
        // millisecond value is correctly in America/New_York
        // let calendarApi = calendarRef?.current?.getApi();
        let calendarApi = info?.event?.calendar;
        if ( debug === true )
            alert(
                'clicked ' + info.dateStr + ' on info ' + JSON.stringify( info, null, 2 ),
                'Current view: ' + info.view.type,
                'Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY
            );

        // change the day's background color just for fun
        // info.dayEl.style.backgroundColor = 'red';

        // Change color of dot marker
        // var dotEl = info.el.getElementsByClassName( 'fc-event-dot' )[ 0 ];
        // if ( dotEl ) {
        //     dotEl.style.backgroundColor = 'white';
        // }

        if ( calendarApi ) {
            console.log( "FullCalendar :: handleDateClick :: date = ", info?.date.valueOf() );

            // use the plugin for manipulation and formatting
            let m = toMoment( info?.date, calendarApi );
            // if ( debug === true ) 
            console.log( m.format() ); // something like '2018-09-01T12:30:00-05:00'

            // Now for the actual functionality, open and initialize the new event form modal.
            let initialData = {
                // id: createEventId(),
                userId: user?.id ?? null,
                workspaceId: workspaceId ?? null,
                title: 'New Event',
                description: '',
                date: m.format(),
                start: info?.dateStr,
                // start: info?.dateStr + "T12:00:00",
                // start: new Date( new Date( info?.dateStr ) + "T12:00:00" ).toISOString(),
                end: info?.dateStr,
                // end: info?.dateStr + "T24:00:00",
                // end: new Date( new Date( info?.dateStr ) + "T24:00:00" ).toISOString(),
                allDay: false,
                className: 'fc-bg-default',
                icon: "birthday-cake",
                // dow: [ 1, 2, 4 ], // Mon, Tue, Thur
            };

            console.log( 'FullCalendar :: handleDateSelect :: info = ', info, ' :: ', 'initialData = ', initialData );

            setInitialData( initialData );
            setDayModalOpen( true );
            // handleCreateStart( initialData, 'event' );
        }

    };

    const handleEventResize = ( info ) => {
        console.log( 'handleEventResize :: info = ', info );
        // alert( info.event.title + " end is now " + info.event.end.toISOString() );
        if ( !confirm( "is this okay?" ) ) {
            info.revert();
        }
    };

    function handleEventDrop ( eventDropInfo ) {

        console.log( 'handleEventDrop :: eventDropInfo = ', eventDropInfo );
        // alert( info.event.title + " was dropped on " + info.event.start.toISOString() );

        if ( !confirm( "Are you sure about this change?" ) ) {
            eventDropInfo.revert();
        }
        else {
            let { event, oldEvent, jsEvent, newResource } = eventDropInfo;
            let calendarApi = calendarRef?.current?.getApi();
            /* 
                event	
                    An Event Object that holds information about the event (date, title, etc) after the drop.
     
                relatedEvents	
                    an array of other related Event Objects that were also dropped. an event might have other recurring event instances or might be linked to other events with the same groupId
     
                oldEvent	
                    An Event Object that holds information about the event before the drop.
     
                oldResource	
                    If the resource has changed, this is the Resource Object the event came from. If the resource has not changed, this will be undefined. For use with the resource plugins only.
     
                newResource	
                    If the resource has changed, this is the Resource Object the event went to. If the resource has not changed, this will be undefined. For use with the resource plugins only.
     
                delta	
                    A Duration Object that represents the amount of time the event was moved by.
     
                revert	
                    A function that, if called, reverts the event’s start/end date to the values before the drag. This is useful if an ajax call should fail.
     
                view	
                    The current View Object.
     
                el	
                    The HTML element that was dragged.
     
                jsEvent	
                    The native JavaScript event with low-level information such as click coordinates.
            */
            console.log( 'handleEventDrop :: event = ', event, " :: ", "event?._def = ", event?._def, " :: ", "event?.start = ", event?.start, " :: ", "event?.end = ", event?.end, " :: ", " event, oldEvent, jsEvent, newResource = ", event, oldEvent, jsEvent, newResource );
            /* 
            // const droppedEvent = $( this ).data( "eventObj" );
            // const droppedEvent = event;
            const origStartDate = oldEvent?.start;
            const origEndDate = oldEvent?.end;
    
            // Set the start date to the new date with the original time
            let startDate = toMoment( date, calendarApi );
            startDate.set( {
                hour: origStartDate?.get( "hour" ),
                minute: origStartDate?.get( "minute" ),
                second: origStartDate?.get( "second" )
            } );
    
            const endDate = toMoment( date, calendarApi );
    
            // If the orginal dates were on different days we have to calculate the new end date
            if ( !origStartDate?.isSame( origEndDate, "d" ) ) {
                endDate.add(
                    oldEvent?.end?.diff(
                        oldEvent?.start,
                        "d"
                    ),
                    "d"
                );
            }
    
            endDate.set( {
                hour: origEndDate?.get( "hour" ),
                minute: origEndDate?.get( "minute" ),
                second: origEndDate?.get( "second" )
            } );
            */

            // $calendar.fullCalendar(
            //     "renderEvent",
            //     {
            //         // resourceId,
            //         title: droppedEvent?.title,
            //         start: startDate,
            //         end: endDate
            //     },
            //     true
            // );

            let eventData = event?._def;
            let eventId = eventData?.publicId;
            let startDate = event.start;
            let endDate = event.end ?? addHours( new Date( startDate ), 1.0 );

            if ( !endDate ) {
                // If endDate is invalid, null, undefined, empty, set it to 1 hr after startDate.
                endDate = addHours( new Date( startDate ), 1.0 );
            }

            handleChangeEventDates(
                eventId,
                eventsData,
                startDate, // new Date( startDate ),
                endDate, // new Date( endDate ),
            );
            event.setDates( new Date( startDate ), new Date( endDate ), [] );
        }
    };

    function handleDrop ( dropInfo ) { // date, jsEvent, ui, resourceId ) {
        console.log( 'handleDrop :: dropInfo  = ', dropInfo );
        // alert( info.event.title + " was dropped on " + info.event.start.toISOString() );

        if ( !confirm( "Are you sure about this change?" ) ) {
            eventDropInfo.revert();
        }
        else {
            let { event, date, jsEvent, ui, resourceId } = dropInfo;
            let calendarApi = calendarRef?.current?.getApi();
            /*  // dropInfo is a plain object with the following properties:
                'allDay	
                    true or false whether dropped on one of the all-day cells.
    
                date	
                    The Date of where the draggable was dropped.
    
                dateStr	
                    The ISO8601 string representation of where the draggable was dropped.
    
                draggedEl	
                    The HTML element that was being dragged.
    
                jsEvent	
                    The native JavaScript event with low-level information such as click coordinates.
    
                resource	
                    If the current view is a resource-view, the Resource Object the element was dropped on. Must be using one of the resource plugins.
    
                view	
                    The current View Object.
            */
            console.log( 'handleDrop :: event = ', event );
            const droppedEvent = $( this ).data( "eventObj" );
            const origStartDate = droppedEvent?.dateProfile?.start;
            const origEndDate = droppedEvent?.dateProfile?.end;

            // Set the start date to the new date with the original time
            let startDate = toMoment( date, calendarApi );
            /* startDate.set( {
                hour: origStartDate.get( "hour" ),
                minute: origStartDate.get( "minute" ),
                second: origStartDate.get( "second" )
            } ); */

            let endDate = toMoment( date, calendarApi );

            // If the orginal dates were on different days we have to calculate the new end date
            if ( !origStartDate.isSame( origEndDate, "d" ) ) {
                endDate.add(
                    droppedEvent.dateProfile.end.diff(
                        droppedEvent.dateProfile.start,
                        "d"
                    ),
                    "d"
                );
            }

            /* endDate.set( {
                hour: origEndDate.get( "hour" ),
                minute: origEndDate.get( "minute" ),
                second: origEndDate.get( "second" )
            } ); */

            $calendar.fullCalendar(
                "renderEvent",
                {
                    resourceId,
                    title: droppedEvent?.title,
                    start: startDate,
                    end: endDate
                },
                true
            );

            let eventId = event?.publicId;
            handleChangeEventDates(
                eventId,
                eventsData,
                startDate,
                endDate,
            );

            event.setDates( startDate, endDate, [] );

            /* 
                let eventId = event?.publicId;
                // Lastly, update the server.
                if ( utils.val.isValidArray( eventsData, true ) ) {
                    let eventFullData = eventsData?.find( ( ev ) => ev?._id === eventId );
                    if ( eventFullData ) {
                        let updatedEvent = {
                            ...eventFullData,
                            // title: droppedEvent?.title,
                            start: startDate,
                            end: endDate
                        };
                        console.log( 'handleEventDrop :: changing start and end times :: updatedEvent = ', updatedEvent );
                        handleEditSubmit( updatedEvent, 'event' );
                    }
                }
            */
        }
    };

    const handleChangeEventDates = async ( eventId, events, startDate, endDate ) => {
        if ( utils.val.isValidArray( events, true ) ) {
            let eventFullData = events?.find( ( ev ) => ev?._id === eventId );
            if ( eventFullData ) {
                let updatedEvent = {
                    ...eventFullData,
                    // title: droppedEvent?.title,
                    start: startDate,
                    end: endDate
                };
                console.log( 'handleChangeEventDates :: changing start and end times :: start = ', startDate, ", end = ", endDate, ' :: updatedEvent = ', updatedEvent );
                let res = await handleEditSubmit( updatedEvent, 'event' );
                if ( res ) {
                    updateEvent( eventId, res );
                }
            }
        }
    };

    const handleEventDropAllow = ( dropInfo, draggedEvent ) => {
        console.log( 'handleEventDrop :: dropInfo = ', dropInfo, ' :: ', 'draggedEvent = ', draggedEvent );

        if ( draggedEvent.id === '999' ) {
            return dropInfo.start > new Date( 2016, 0, 1 ); // a boolean
        }
        else {
            return true;
        }
    };

    const handleEventAdd = ( info ) => {
        /*  The addInfo argument has the following properties:
                event	an Event Object for the added event
                relatedEvents	an array of other related Event Objects that have also been added. an event might have other recurring event instances or might be linked to other events with the same groupId
                revert	a function that can be called to reverse this action
        */
        if ( debug === true ) console.log( `handleEventAdd triggered :: info = `, info );
        handleAddEvent( info );
    };

    const handleEventChange = ( info ) => {
        /*  The changeInfo argument has the following properties:
                event	an Event Object with the updated changed data
                relatedEvents	an array of other related Event Objects that were also affected. an event might have other recurring event instances or might be linked to other events with the same groupId
                oldEvent	an Event Object with data prior to the change
                revert	a function that can be called to reverse this action
        */
        if ( debug === true ) console.log( `handleEventChange triggered :: info = `, info );
    };

    const handleEventRemove = ( info ) => {
        /*  The removeInfo argument has the following properties:
                event	the Event Object that was removed
                relatedEvents	an array of other related Event Objects that were also be removed. an event might have other recurring event instances or might be linked to other events with the same groupId
                revert	a function that can be called to reverse this action
        */
        if ( debug === true ) console.log( `handleEventRemove triggered :: info = `, info );
    };


    const handleEventsSet = ( events ) => {
        if ( debug === true ) console.log( `handleEventsSet triggered :: events = `, events );
    };


    const handleEventReceive = ( info ) => {
        if ( debug === true ) console.log( `handleEventReceive triggered :: info = `, info );
    };


    const renderEventContent = ( eventInfo ) => {
        if ( eventInfo ) {
            /* EventInfo schema?:
            {
                "event": {
                    "allDay": false,
                    "title": "Repeating Event",
                    "start": "2025-01-16T11:00:00-05:00",
                    "groupId": "999"
                },
                "view": {
                    "type": "dayGridMonth",
                    "dateEnv": {
                        "timeZone": "local",
                        "canComputeOffset": true,
                        "calendarSystem": {},
                        "locale": {
                            "codeArg": "en",
                            "codes": [
                                "en"
                            ],
                            "week": {
                                "dow": 0,
                                "doy": 4
                            },
                            "simpleNumberFormat": {},
                            "options": {
                                "direction": "ltr",
                                "buttonText": {
                                    "prev": "prev",
                                    "next": "next",
                                    "prevYear": "prev year",
                                    "nextYear": "next year",
                                    "year": "year",
                                    "today": "today",
                                    "month": "month",
                                    "week": "week",
                                    "day": "day",
                                    "list": "list"
                                },
                                "weekText": "W",
                                "weekTextLong": "Week",
                                "closeHint": "Close",
                                "timeHint": "Time",
                                "eventHint": "Event",
                                "allDayText": "all-day",
                                "moreLinkText": "more",
                                "noEventsText": "No events to display",
                                "buttonHints": {
                                    "prev": "Previous $0",
                                    "next": "Next $0"
                                },
                                "viewHint": "$0 view",
                                "navLinkHint": "Go to $0"
                            }
                        },
                        "weekDow": 0,
                        "weekDoy": 4,
                        "weekText": "W",
                        "weekTextLong": "Week",
                        "cmdFormatter": null,
                        "defaultSeparator": " - "
                    }
                },
                "timeText": "11a",
                "textColor": "",
                "backgroundColor": "#332266FF",
                "borderColor": "#332266FF",
                "isDraggable": true,
                "isStartResizable": true,
                "isEndResizable": true,
                "isMirror": false,
                "isStart": true,
                "isEnd": true,
                "isPast": false,
                "isFuture": true,
                "isToday": false,
                "isSelected": false,
                "isDragging": false,
                "isResizing": false
            }
            */
            // console.log( "renderEventContent :: eventInfo = ", eventInfo.event._def );
            let event = eventInfo?.event;
            let eventData = eventInfo?.event?._def;
            let randId = Math.floor( utils.rand.rand( 1e6, 0 ) );
            let id = `planner-event-${ eventData ? eventData?.publicId : randId }`;
            return (
                <div
                    id={ id }
                    key={ id }
                    className={ twMerge( [
                        `flex flex-row gap-2 w-full items-center`,
                    ] ) }
                >
                    <div className={ `w-1/5 font-thin text-xs text-ellipsis text-wrap text-left` }>
                        { eventInfo?.timeText }
                    </div>
                    <div className={ `w-4/5 font-extralight text-xs text-ellipsis text-wrap text-left` }>
                        { eventInfo?.event?.title }
                    </div>
                    {/* <i>({ e.event.extendedProps.RestPersonas })</i> */ }
                </div>
            );
        }
    };

    const getEventColor = ( event ) => {
        if ( event && event.hasOwnProperty( 'color' ) ) {
            return String( event.color );
        }
        if ( event && event.hasOwnProperty( 'title' ) ) {
            return stringAsColor( event.title );
        }
        return `#332266FF`;
    };

    // Event source functions
    function handleEventSourceSuccess ( content, response ) {
        let calendarApi = calendarRef?.current?.getApi();

        console.log( "FullCalendar :: handleEventSourceSuccess :: content = ", content, " :: ", "response = ", response, " :: ", "Eventsources = ", calendarApi?.getEventSources() );
        return content.eventArray;
    }

    function handleEventSourceFailure ( errorObj ) {
        console.log( "FullCalendar :: handleEventSourceFailure :: errorObj = ", errorObj );
        return errorObj;
    }

    function handleEventOverlap ( stillEvent, movingEvent ) {
        return true || stillEvent.allDay && movingEvent.allDay;
    }

    const googleCalendarIds = useMemo( () => (
        utils.val.isValidArray( integrations?.googleCalendar?.calendarIds, true ) ? (
            integrations?.googleCalendar?.calendarIds.map( ( id, index ) => {
                console.log( "id = ", id );
                return { googleCalendarId: id, className: '' };
            } ) )
            : []
    ),
        [ integrations ]
    );

    console.log( "FullCalendar :: integrations = ", integrations, " :: ", "integrations?.googleCalendar?.calendarIds = ", integrations?.googleCalendar?.calendarIds );

    return (
        <div
            className={ `h-full max-h-full w-full max-w-full gap-2 m-0 flex flex-col` }
        >
            <div className={ `row title` } style={ { marginTop: "0px" } }>
                <div className={ `flex flex-row justify-center items-center m-0 p-0 gap-1 col-sm-12 ` }>
                    <CalendarHeaderToolbar
                        // calendarApi={ calendarRef.current.getApi() }
                        calendarApi={ calendarRef }
                        calendarRef={ calendarRef }
                        eventsData={ eventsData }
                        selectedDate={ selectedDate }
                        currentView={ currentView }
                        setCurrentView={ setCurrentView }
                    // headerButtons={ headerButtons }
                    />
                </div>
            </div>

            <div
                className={ cn(
                    "bg-background p-0 sticky",
                    "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
                    `w-full max-w-full max-h-full h-full p-0 gap-1`,
                    `min-h-full max-h-full max-w-full w-full flex flex-col justify-start items-start h-full p-0 gap-1`,
                    `overflow-y-auto overflow-x-hidden`,
                    `h-full max-h-[100%] w-full min-w-[100%] p-0 gap-2 border rounded-xl px-2 py-2`
                ) }
            >
                <FullCalendar
                    ref={ calendarRef }
                    className={ `h-full w-full flex flex-row ` }
                    // defaultView={ currentView }
                    initialView={ currentView }
                    // googleCalendarApiKey={ 'AIzaSyDJwKa7fRRZECFzs8X-IJFnVQ8xZNng5xo' }
                    // googleCalendarApiKey={ `205290666106-k64p2p41u7q5o9do1f50rmqkgirgp7kq.apps.googleusercontent.com` }
                    // googleCalendarApiKey={ `AIzaSyCA_ntu9LJW7eBd97UJvGMyx6iXjqhjjwU` }
                    googleCalendarApiKey={ integrations?.googleCalendar.apikey || 'AIzaSyCA_ntu9LJW7eBd97UJvGMyx6iXjqhjjwU' }
                    schedulerLicenseKey={ `CC-Attribution-NonCommercial-NoDerivatives` }
                    // events={ currentEvents }
                    eventSources={ [
                        currentEvents,
                        ...( utils.val.isValidArray( googleCalendarIds, true ) ? ( googleCalendarIds ) : [] )
                    ] }
                    // events={ mapObj2Obj( eventsData, conversionEventSchema ) }
                    // initialEvents={ mapObj2Obj( eventsData, conversionEventSchema ) }
                    // initialEvents={ currentEvents } // alternatively, use the `events` setting to fetch from a feed
                    /*  customButtons={ {
                            addEvent: {
                                text: "New Event",
                                click: () => {
                                    let initialData = initializeEvent();
                                    handleCreateStart( initialData, 'event' );
                                }
                            },
                            testButton: {
                                text: 'custom!',
                                click: function () {
                                    alert( 'clicked the custom button!' );
                                }
                            },
                            Button: {
                                text: 'custom button!',
                                click: function () {
                                    alert( 'clicked the custom button!' );
                                },
                            },
                            Goto: {
                                text: 'Go To',
                                click: function () {
                                    // alert( 'clicked the custom button!' );
                                    console.log( "Toggling goto dialog on: " );
                                    setShowGotoDialog( true );
                                },
                            },
                        } }
     
                        headerToolbar={ {
                            // buttons for switching between views
                            // left: "prev,next prevYear,nextYear today addEventButton,testButton",
                            left: 'prevYear,prev,today,next,nextYear',
                            center: 'title', // 'dayGridDay,dayGridMonth,dayGridYear,timeGridWeek,timeGridDay,listWeek,listMonth,listDay',
                            // right: "dayGridDay,dayGridMonth,dayGridYear,timeGridWeek,timeGridDay,listWeek agendaWeek,agendaDay,agendaDetailed,timeGridFourDay,dayGridFourWeek,multiMonthYear,multiMonthFourMonth",
                            right: 'Goto,addEvent',
                        } }
                    */

                    /* header={ {
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek,agendaWeek,agendaDay,timeGridFourDay,dayGridFourWeek",
                    } } */
                    // themeSystem={ `bootstrap5` }
                    headerToolbar={ {} }
                    views={ viewsConfig }
                    // slotLabelFormat={ [
                    //     { month: 'long', year: 'numeric' }, // top level of text
                    //     { weekday: 'short' } // lower level of text
                    // ] }
                    dayHeaderFormat={
                        // like 'Mon', for month view
                        // { weekday: 'short' }

                        // like 'Mon 9/7', for week views
                        { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }
                    }
                    titleFormat={ {
                        // https://fullcalendar.io/docs/date-formatting
                        // will produce something like "Tuesday, September 18, 2018"
                        month: 'long',
                        year: 'numeric',
                        day: 'numeric',
                        weekday: 'long'
                    } }
                    buttonText={ {
                        today: 'today',
                        month: 'month',
                        week: 'week',
                        day: 'day',
                        list: 'list'
                    } }
                    eventLimit={ true } // allow "more" link when too many events
                    /* eventRender={
                        function ( event, element ) {
                            if ( event.icon ) {
                                element
                                    .find( ".fc-title" )
                                    .prepend(
                                        "<i class='fa fa-" + event.icon + "'></i>"
                                    );
                            }
                        }
                    } */
                    eventOverlap={ handleEventOverlap }
                    eventColor={ getEventColor } // `#332266FF` }
                    eventContent={ renderEventContent } // custom render function
                    eventClick={ handleEventClick }
                    eventsSet={ handleEventsSet } // called after events are initialized/added/changed/removed
                    /* ^You can update a remote database when these fire: */
                    eventAdd={ handleEventAdd } // function () { } }
                    eventChange={ handleEventChange } // function () { } }
                    eventRemove={ handleEventRemove } // function () { } }
                    eventReceive={ handleEventReceive } // ( info ) => console.log( info ) }
                    eventResize={ handleEventResize }
                    drop={ handleDrop } // When dropped from external calendar.
                    eventDrop={ handleEventDrop } // When dropped from within calendar.
                    eventSourceFailure={ handleEventSourceFailure }
                    eventSourceSuccess={ handleEventSourceSuccess }
                    // eventAllow={ handleEventDropAllow }
                    // locales={ allLocales }
                    locale={ `en` }
                    timeZone={ `local` }
                    weekends={ true }
                    weekNumbers={ true }
                    dayMaxEvents={ true } // when too many events in a day, show the popover
                    droppable={ true }
                    editable={ true }
                    eventResizableFromStart={ true } // Whether the user can resize an event from its starting edge.
                    eventStartEditable={ true } // Allow events’ start times to be editable through dragging.
                    eventDurationEditable={ true } // Allow events’ durations to be editable through resizing.
                    dateClick={ handleDateClick }
                    selectable={ true }
                    selectMirror={ true }
                    navLinks={ true } // can click day/week names to navigate views
                    select={ handleDateSelect } // handleSelect
                    dayHeaders={ true }
                    allDaySlot={ true }
                    expandRows={ true }
                    aspectRatio={ 1.35 }
                    height={ window.innerHeight - 100 }
                    contentHeight={ `auto` }
                    businessHours={ {
                        daysOfWeek: [ 1, 2, 3, 4, 5 ],
                        startTime: "08:00",
                        endTime: "18:00"
                    } }
                    stickyHeaderDates={ true } // auto, true, false
                    stickyFooterScrollbar={ true }
                    showNonCurrentDates={ true }
                    nowIndicator={ true }
                    handleWindowResize={ true }
                    windowResize={ function ( arg ) {
                        // alert( 'The calendar has adjusted to a window resize. Current view: ' + arg.view.type );
                    } }
                    // now={ }
                    plugins={ [
                        // dayGridYear,dayGridMonth,dayGridWeek,dayGridDay,dayGrid
                        dayGridPlugin,
                        // timeGridWeek, timeGridDay, timeGrid
                        timeGridPlugin,
                        rrulePlugin,
                        interactionPlugin,
                        resourceTimelinePlugin,
                        listPlugin,
                        multiMonthPlugin,
                        timelinePlugin,
                        googleCalendarPlugin,
                        momentTimezonePlugin, // For timezones. 
                        // bootstrap5Plugin,
                        // customViewPlugin 
                    ] }

                />
                {/* 
                    <FullCalendar 
                        defaultView="listWeek" 
                        plugins={ [ listWeek ] } 
                        events={ eventsData } 
                    /> 
                */}

                {/* </ScrollArea> */ }
            </div>

            {/* Go To Event  Dialog */ }
            { <CalendarGoToDialog
                calendarApi={ calendarRef }
                eventsData={ eventsData }
                mode={ 'goto' }
                isOpen={ showGotoDialog }
                setIsOpen={ setShowGotoDialog }
                date={ gotoDate }
                setDate={ setGotoDate }
                handleSubmit={ ( date ) => { handleGoToDate( date ); } }
            /> }

            { <DayFormDialog
                calendarApi={ calendarRef }
                mode={ 'day' }
                isOpen={ dayModalOpen }
                setIsOpen={ setDayModalOpen }
                initialData={ initialData }
                onClose={ () => ( setDayModalOpen( false ) ) }

                // Create events
                createEventStartCallback={ handleCreateStart }
                createEventSubmitCallback={ handleCreateSubmit }

                // Create logs
                createLogStartCallback={ handleCreateStart }
                createLogSubmitCallback={ handleCreateSubmit }

                // Create calendars
                createCalendarStartCallback={ handleCreateStart }
                createCalendarSubmitCallback={ handleCreateSubmit }

                // Create Planners
                createPlannerStartCallback={ handleCreateStart }
                createPlannerSubmitCallback={ handleCreateSubmit }

                // CREATE TASKS
                createTaskStartCallback={ handleCreateStartTask }
                createTaskSubmitCallback={ handleCreateSubmitTask }
            /> }

            {/* Create Event Dialog */ }
            <CalendarEventDialog
                calendarApi={ calendarRef }
                calendarsData={ calendarsData }
                isOpen={ dialogType === 'add' }
                setIsOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                initialData={ dialogInitialData }
                setInitialData={ setDialogInitialData }
                handleSubmit={ ( data ) => {
                    let res = handleCreateSubmit( data, 'event' );
                    console.log( "CALENDAR EVENT DIALOG :: handleCreateSubmit( data ) :: data = ", data, " :: ", "res = ", res );
                } }
                mode={ 'add' }
                data={ dialogData }
                setData={ setDialogData }
                handleChange={ handleChange }
            />

            {/* Edit Event Dialog */ }
            <CalendarEventDialog
                calendarApi={ calendarRef }
                calendarsData={ calendarsData }
                isOpen={ dialogType === 'edit' }
                setIsOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                initialData={ dialogData }
                setInitialData={ setDialogData }
                handleSubmit={ ( data ) => {
                    let res = handleEditSubmit( data, 'event' );
                    console.log( "CALENDAR EVENT DIALOG :: handleEditSubmit( data ) :: data = ", data, " :: ", "res = ", res );
                } }
                mode={ 'edit' }
                data={ dialogData }
                setData={ setDialogData }
                handleChange={ handleChange }
            />


            <PlannerDialogWrapper />
        </div>
    );
};



const CalendarHeaderToolbar = ( props ) => {
    const {
        calendarApi,
        calendarRef,
        selectedDate,
        eventsData,
        currentView = '',
        setCurrentView,
        // headerButtons = [],
    } = props;

    const {
        user,
        workspaceId,
    } = useGlobalStore();

    const {
        // VARIABLES
        plannerSchema,
        calendarSchema,
        eventSchema,
        conversionEventSchema,
        logSchema,

        // INITIALIZERS
        initializeEvent,

        // HANDLER FUNCTIONS
        handleToggleActive,
        handleConvertEvents,
        handleInputChange,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleCancel,
        handleGetEventsData,
        handleGetCalendarsData,
        handleGetCalendarsWithEvents,

        // GETTERS / SETTERS
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogInitialData, setDialogInitialData,
        showGotoDialog, setShowGotoDialog,
        gotoDate, setGotoDate,
        open, setOpen,
    } = usePlanner();

    const calendarBtn = ( btnName ) => {
        if ( calendarRef ) {
            const calendarApi = calendarRef?.current?.getApi();
            if ( btnName ) {
                switch ( btnName ) {
                    case 'next':
                        calendarApi.next();
                        break;
                    case 'prev':
                        calendarApi.prev();
                        break;
                    case 'nextYear':
                        calendarApi.nextYear();
                        break;
                    case 'prevYear':
                        calendarApi.prevYear();
                        break;
                    case 'today':
                        calendarApi.today();
                        break;
                    default:
                        break;
                }
            }
        }
    };

    const headerButtons = {
        left: [
            {
                type: 'group',
                items: [
                    {
                        type: 'button',
                        id: 'addEventButton',
                        enabled: false,
                        label: 'Add Event',
                        icon: <PlusCircleIcon />,
                        onClick: () => {
                            let initialData = initializeEvent( eventsData ? eventsData[ 0 ] : null, '', '' );
                            // handleCreateStart( eventsData ? eventsData[ 0 ] : {} );
                            console.log( "FullCalendar :: addEventButton clicked :: initialData = ", initialData );
                            // handleCreateStart( initialData, 'event' );
                            handleCreateStart( {
                                userId: user?.id,
                                organizerId: user?.id,
                                workspaceId: workspaceId,
                                start: new Date( Date.now() ).toLocaleDateString(),
                                end: addHours( new Date( Date.now() ), 1 ).toLocaleDateString(),
                                title: `Event on (${ new Date( Date.now() ).toLocaleDateString() } )`,
                                ...initialData,
                            }, "event" );
                            // setEventsData( [
                            //     ...eventsData,
                            //     {
                            //         title: "event",
                            //         date: new Date().toISOString().substr( 0, 10 )
                            //     }
                            // ] );
                        }
                    },
                ]
            },
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'button',
                        id: 'gotoButton',
                        enabled: true,
                        label: 'Go To',
                        icon: <ArrowUpCircleIcon />,
                        onClick: () => {
                            console.log( "Toggling goto dialog on: " );
                            setShowGotoDialog( true );
                        }
                    },
                ]
            },
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'button',
                        id: 'today',
                        enabled: true,
                        label: 'today',
                        icon: <Calendar1Icon />,
                        onClick: () => { calendarBtn( 'today' ); }
                    },
                ]
            },
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'button',
                        id: 'prevYear',
                        enabled: true,
                        label: 'prevYear',
                        icon: <BsChevronDoubleLeft />,
                        onClick: () => { calendarBtn( 'prevYear' ); }
                    },
                    {
                        type: 'button',
                        id: 'prev',
                        enabled: true,
                        label: 'prev',
                        icon: <RewindIcon />,
                        onClick: () => { calendarBtn( 'prev' ); }
                    },
                    {
                        type: 'button',
                        id: 'next',
                        enabled: true,
                        label: 'next',
                        icon: <ForwardIcon />,
                        onClick: () => { calendarBtn( 'next' ); }
                    },
                    {
                        type: 'button',
                        id: 'nextYear',
                        enabled: true,
                        label: 'nextYear',
                        icon: <FastForwardIcon />,
                        onClick: () => { calendarBtn( 'nextYear' ); }
                    },
                ]
            },
        ],
        center: [
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'view',
                        enabled: true,
                        id: 'timeGridDay',
                        label: 'T1D',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'dayGridDay',
                        label: 'G1D',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'dayGridMonth',
                        label: 'G1M',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'dayGridYear',
                        label: 'G1Y',
                    },
                ]
            },
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'view',
                        enabled: true,
                        id: 'listDay',
                        label: 'L1D',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'listWeek',
                        label: 'L1W',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'listMonth',
                        label: 'L1M',
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'listYear',
                        label: 'L1Y',
                    },
                ]
            },
        ],
        right: [
            /* {
                type: 'group',
                items: [
                    {
                        type: 'view',
                        enabled: true,
                        id: 'agendaDay',
                        label: 'A1D'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'agendaWeek',
                        label: 'A1W'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'agendaMonth',
                        label: 'A1M'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'agendaDetailed',
                        label: 'AgendaDetailed'
                    },
                ]
            }, */
            {
                type: 'group',
                enabled: true,
                items: [
                    {
                        type: 'view',
                        enabled: true,
                        id: 'timeGridFourDay',
                        label: '4D'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'dayGridFourWeek',
                        label: '4W'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'multiMonthYear',
                        label: '3M'
                    },
                    {
                        type: 'view',
                        enabled: true,
                        id: 'multiMonthFourMonth',
                        label: '4M'
                    },
                ]
            },
        ]
    };

    const [ showDropdown, setShowDropdown ] = useState( false );
    const [ width, setWidth ] = useState( window.innerWidth );
    const [ height, setHeight ] = useState( window.innerHeight );
    // const DROPDOWN_BREAKPOINT = 980;

    const updateDimensions = () => {
        setWidth( window.innerWidth );
        setHeight( window.innerHeight );
    };

    useEffect( () => {
        // Catch and process changes in window size. 
        window.addEventListener( "resize", updateDimensions );
        return () => window.removeEventListener( "resize", updateDimensions );
    }, [] );

    useEffect( () => {
        // Catch and process changes in smallScale
        if ( showDropdown && width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG ) setShowDropdown( false );
    }, [ width ] );

    const buildViewButtons = ( items, useDropdown ) => {

        // const buildViewGroupButtons = ( items, useDropdown ) => {
        //     let elements = [];
        //     if ( utils.val.isValidArray( items, true ) ) {
        //         items.forEach( ( item, index ) => {
        //             elements.push(
        //                 buildViewButtons( item )
        //             );
        //         } );
        //     }

        //     return (
        //         <>
        //             { elements }
        //         </>
        //     );
        // };

        let elements = [];
        if ( utils.val.isValidArray( items, true ) ) {
            items.forEach( ( item, index ) => {
                if ( item.enabled ) {
                    if ( item?.type === 'separator' ) {
                        elements.push( <DropdownMenuSeparator /> );
                    }
                    else if ( item?.type === 'group' ) {
                        if ( utils.ao.has( item, 'items' ) ) {
                            if ( utils.val.isValidArray( item?.items, true ) ) {
                                elements.push(
                                    <div className={ twMerge(
                                        `flex gap-2`,
                                        useDropdown
                                            ? 'flex-col flex-wrap h-full w-full justify-stretch items-stretch '
                                            : 'flex-row flex-nowrap bg-muted/50 max-w-3xl justify-center items-center',
                                    ) }>
                                        { buildViewButtons( item?.items, useDropdown ) }
                                    </div>
                                );
                            }
                        }
                    }
                    else if ( item?.type === 'button' ) {
                        let { id, label } = item;
                        const today = Date.now().toLocaleString();
                        let button = (
                            <Button
                                key={ `planner-btn-${ label }-${ id }-${ index }` }
                                className={ twMerge(
                                    `focus:outline-none !px-2 !py-1 m-0 w-min flex-grow flex-1 justify-start items-center`,
                                    width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG && index === 0 && `rounded-l-2xl`,
                                    width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG && index >= items.length - 1 && `rounded-r-2xl`,
                                ) }
                                variant={ `${ currentView === label?.toLowerCase() ? 'default' : 'outline' }` }
                                size={ `xs` }
                                onClick={ () => {
                                    console.log( 'FullCalendar :: header buttons :: item = ', item );
                                    if ( utils.ao.has( item, 'onClick' ) ) {
                                        item?.onClick( item );
                                    }
                                } }
                            >
                                <div className={ `select-none p-0 text-xs capitalize w-auto inline-flex gap-2` }>
                                    { item?.hasOwnProperty( 'icon' ) && utils.val.isDefined( item?.icon ) ? item?.icon : <></> }
                                    <p className={ `text-xs font-sans ${ width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG ? 'hidden' : '' }` }>{ label }</p>
                                </div>
                            </Button>
                        );

                        if ( useDropdown ) {
                            elements.push(
                                <DropdownMenuItem className={ `p-0 gap-0 m-0` }>
                                    { button }
                                </DropdownMenuItem>
                            );
                        }
                        else {
                            elements.push( button );
                        }
                    }
                    else if ( item?.type === 'view' ) {
                        let { id, label } = item;
                        const today = Date.now().toLocaleString();
                        let button = (
                            <Button
                                key={ `planner-btn-${ label }-${ id }-${ index }` }
                                className={ twMerge(
                                    `focus:outline-none !px-2 !py-1 m-0 w-min flex-grow flex-1 justify-start items-center`,
                                    width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG && index === 0 && `rounded-l-2xl`,
                                    width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG && index >= items.length - 1 && `rounded-r-2xl`,
                                ) }
                                variant={ `${ currentView === id ? 'default' : 'outline' }` }
                                size={ `xs` }
                                onClick={ () => {
                                    // setCurrentView( label?.toLowerCase() );
                                    setCurrentView( id );
                                    // calendarApi.changeView( id, selectedDate ? selectedDate : today );
                                } }
                            >
                                <div
                                    className={ `select-none p-0 px-1 text-xs capitalize w-auto gap-0 ` }
                                >
                                    { item?.hasOwnProperty( 'icon' ) && utils.val.isDefined( item?.icon ) ? item?.icon : <></> }
                                    <p className={ `text-xs font-sans` }>{ width < HEADER_TRIGGER_DROPDOWN_WIDTH_LG ? caseCamelToSentence( id ) : label }</p>
                                </div>
                            </Button>
                        );

                        if ( useDropdown ) {
                            elements.push(
                                <DropdownMenuItem className={ `p-0 gap-0 m-0 w-full` }>
                                    { button }
                                </DropdownMenuItem>
                            );
                        }
                        else {
                            elements.push( button );
                        }
                    }
                }
            } );
        }

        return (
            <div
                key={ `planner-btn-${ 'group-container' }-${ utils.rand.rand( 1e6, 0 ) }` }
                className={ `content-header-nav nav-dropdown-sm flex ${ useDropdown
                    ? 'flex-col flex-wrap h-full w-auto items-stretch justify-stretch'
                    : 'h-full w-auto rounded-xl flex flex-row max-w-3xl justify-stretch items-stretch'
                    }` }
            >
                { elements }
            </div>
        );
    };

    return (
        <>
            <div className="content-body mx-auto h-auto w-full justify-between items-stretch">
                { width > HEADER_TRIGGER_DROPDOWN_WIDTH_LG && (
                    <div className={ `h-auto w-full flex flex-row justify-center items-center gap-0` }>
                        { buildViewButtons( headerButtons.left, false ) }
                        { buildViewButtons( headerButtons.center, false ) }
                        { buildViewButtons( headerButtons.right, false ) }
                    </div>
                ) }
                { width < HEADER_TRIGGER_DROPDOWN_WIDTH_LG && (
                    <div className={ `content-header-nav nav-dropdown-sm flex flex-row justify-center items-center h-full w-full` }>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <EllipsisIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                { buildViewButtons( headerButtons.left, true ) }
                                { buildViewButtons( headerButtons.center, true ) }
                                { buildViewButtons( headerButtons.right, true ) }
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) }
            </div>
        </>
    );
};

const CalendarSidebar = ( props ) => {
    const {
        weekendsVisible,
        handleWeekendsToggle,
        currentEvents
    } = props;

    const SIDEBAR_WIDTH = "16rem";
    const SIDEBAR_WIDTH_MOBILE = "18rem";
    const SIDEBAR_WIDTH_ICON = "3rem";
    const SIDEBAR_KEYBOARD_SHORTCUT = "b";
    // const {
    //     state,
    //     open,
    //     setOpen,
    //     openMobile,
    //     setOpenMobile,
    //     isMobile,
    //     toggleSidebar,
    // } = useSidebar();
    const [ openSidebar, setOpenSidebar ] = useState( false );
    const toggleSidebar = () => {
        setOpenSidebar( !openSidebar );
    };

    /* const setOpen = React.useCallback(
        ( value | ( ( value ) ) ) => {
            const openState = typeof value === "function" ? value( open ) : value;
            if ( setOpenProp ) {
                setOpenProp( openState );
            } else {
                _setOpen( openState );
            }

            // This sets the cookie to keep the sidebar state.
            document.cookie = `${ SIDEBAR_COOKIE_NAME }=${ openState }; path=/; max-age=${ SIDEBAR_COOKIE_MAX_AGE }`;
        },
        [ setOpenProp, open ]
    ); */

    return (
        <div className={ `!p-0 !m-0 w-[${ openSidebar ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }] transition-all duration-500` }>
            <SidebarProvider
                open={ openSidebar }
                state={ openSidebar ? 'expanded' : 'collapsed' }
                onOpenChange={ setOpenSidebar }
                className={ `h-full` }
                // width={ `14rem` }
                side={ 'right' }
                style={
                    {
                        "--sidebar-width": `${ openSidebar ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }`,
                        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                    } }
            >
                <Sidebar
                    // variant="sidebar | floating | inset"
                    variant="sidebar"
                    // collapsible="offcanvas | icon | none"
                    // className={ `app-sidebar w-full h-full max-h-fit min-h-full overflow-auto` }
                    collapsible="none"
                >
                    <SidebarHeader
                        className={ `app-sidebar-header w-full p-4 m-0` }
                    >
                        <SidebarTrigger
                            onClick={ () => {
                                setOpenSidebar( !openSidebar );
                                // toggleSidebar(); 
                            } }
                        />

                        { openSidebar &&
                            <>
                                <div
                                    className={ `app-sidebar-section w-full p-0 m-0` }
                                >
                                    <SidebarGroup className={ `gap-2 line-clamp-1 w-full p-0` }>
                                        <SidebarGroupLabel
                                            className={ `text-lg` }
                                        >
                                            Instructions
                                        </SidebarGroupLabel>
                                        <SidebarGroupLabel>Select dates and you will be prompted to create a new event</SidebarGroupLabel>
                                        <SidebarGroupLabel>Drag, drop, and resize events</SidebarGroupLabel>
                                        <SidebarGroupLabel>Click an event to delete it</SidebarGroupLabel>
                                    </SidebarGroup>
                                </div>
                                <div className='app-sidebar-section'>
                                    <label>
                                        <input
                                            type='checkbox'
                                            checked={ weekendsVisible }
                                            onChange={ handleWeekendsToggle }
                                        ></input>
                                        { `Toggle Weekends` }
                                    </label>
                                </div>
                            </>
                        }
                    </SidebarHeader>
                    <SidebarContent
                        className={ `bg-sextary-400 w-full` }
                    >
                        <div>
                            { utils.val.isValidArray( currentEvents, true ) && (
                                <SidebarGroup>
                                    <SidebarGroupLabel className={ `text-lg` }>All Events ({ currentEvents.length })</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu
                                            className={ `w-full justify-stretch items-stretch p-0 m-0  max-h-full overflow-auto min-h-screen` }
                                        >
                                            <ul>
                                                {
                                                    currentEvents.map( ( event ) => {
                                                        if ( utils.ao.hasAll( event, [ 'start', 'title', 'id' ] ) ) {
                                                            return (
                                                                <SidebarMenuItem
                                                                    className={ `w-full justify-start items-start p-0 m-0 ` }
                                                                    key={ utils.rand.rand( 1e6, 0 ) }
                                                                >
                                                                    <SidebarMenuButton asChild>
                                                                        <CalendarSidebarEvent
                                                                            key={ event.id }
                                                                            event={ event }
                                                                            openSidebar={ openSidebar }
                                                                        />
                                                                    </SidebarMenuButton>
                                                                </SidebarMenuItem>
                                                            );
                                                        }
                                                    } )
                                                }
                                            </ul>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            ) }
                        </div>

                        <SidebarRail
                            className={ `sidebar-left-rail bg-body w-1 focus-within:outline-none focus:outline-none focus-visible:outline-none` }
                            onClick={ ( e ) => {
                                toggleSidebar( e );
                            } }
                            style={ {
                                right: `-0.5rem`,
                            } }
                        />
                    </SidebarContent>
                    <SidebarFooter />
                </Sidebar>
            </SidebarProvider>
        </div>
    );
};

const CalendarSidebarEvent = ( props ) => {
    const {
        event,
        openSidebar = true,
    } = props;

    const isDateValid = ( dateStr ) => {
        return !isNaN( new Date( dateStr ) );
    };

    return (
        <div className={ `flex flex-col flex-1 w-full h-auto` }>
            { isDateValid( event?.start ) &&
                (
                    <li key={ event?.id } className={ `w-full p-0 flex flex-1` }>
                        <SidebarMenuButton asChild className={ `w-full p-0 flex flex-1 border-y-2` } >
                            <div className={ `w-full flex flex-col flex-nowrap text-nowrap whitespace-nowrap justify-start items-start p-0 m-0 h-auto ` }>
                                <b className={ `text-xs p-0 h-auto` }>
                                    {

                                        // formatDate(
                                        //     event?.start,
                                        //     { year: 'numeric', month: 'short', day: 'numeric' }
                                        // )

                                    }
                                    {
                                        event?.start
                                    }</b>
                                <i className={ `text-xs h-auto` }>{ event?.title }</i>
                            </div>
                        </SidebarMenuButton>
                    </li>
                )
            }
        </div>
    );
};

const CalendarEventDialog = ( props ) => {
    // Dialog menu for the "Go to" button functionality. 
    const {
        calendarApi,
        calendarsData,
        isOpen = false,
        setIsOpen,
        initialData,
        setInitialData,
        handleSubmit = () => { },
        // handleChange = () => { },
        mode = 'add',
        data,
        setData,
        schema = [],
    } = props;

    const {
        // VARIABLES
        buildEventDialog,
        handleChange,
    } = usePlanner();

    /*  const buildDialog = (
            initialData,
            setInitialData,
            dialogOpen,
            setDialogOpen,
            handleSubmit,
            handleChange,
            dialogType,
            dataType, // Name of type of data being represented. 
        ) => {
            let title = `${ [ 'New', 'View', 'Edit', 'Delete', 'None' ][ [ 'add', 'view', 'edit', 'delete' ].indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
            let description = `${ [ 'Create New', 'View a', 'Edit a', 'Delete a', 'None' ][ [ 'add', 'view', 'edit', 'delete' ].indexOf( dialogType ) ] } ${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;
            console.log( 'FullCalendar :: buildEventDialog :: initialData = ', initialData );
            return (
    
                <Dialog
                    title={ title }
                    open={ dialogOpen }
                    onOpenChange={ setDialogOpen }
                    className={ `flex flex-col` }
                >
                    <DialogTrigger asChild>
                        <Button
                            className={ `select-none` }
                            variant="outline"
                        >
                            {
                                dialogType === 'add'
                                    ? ( <Plus /> )
                                    : ( dialogType === 'edit'
                                        ? ( <Edit /> )
                                        : ( dialogType === 'delete'
                                            ? ( <Delete /> )
                                            : ( dialogType === 'open'
                                                ? ( <FolderOpen /> )
                                                : ( <FileQuestion /> )
                                            )
                                        )
                                    )
                            }
                        </Button>
                    </DialogTrigger>
    
                    <DialogContent
                        className={ `flex flex-col sm:max-w-[${ 425 }px] max-h-modal overflow-y-auto` }
                    >
                        <DialogHeader>
                            <DialogTitle>
                                { title }
                            </DialogTitle>
                            <DialogDescription>
                                { description }
                            </DialogDescription>
                        </DialogHeader>
    
                        <div
                            className={ `flex flex-col gap-2` }
                        >
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="calendarId"
                                    className="text-right"
                                >
                                    Calendar
                                </Label>
    
                                { utils.val.isValidArray( calendarsData ) && buildSelect(
                                    // placeholder
                                    'Choose a Calendar',
                                    // opts
                                    calendarsData?.map( ( item, index ) => {
                                        return {
                                            name: item?.title,
                                            value: item?._id,
                                        };
                                    } ),
                                    // initialData
                                    initialData?.calendarId,
                                    // value
                                    'calendarId',
                                    // field
                                    initialData,
                                    // className
                                    handleChange,
                                    '',
                                ) }
                            </div>
    
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="title"
                                    className="text-right"
                                >
                                    Title
                                </Label>
    
                                <Input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={ initialData?.title ? initialData?.title : '' }
                                    className="col-span-3"
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        setInitialData( { ...initialData, [ name ]: value } );
                                    } }
                                />
                            </div>
    
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Description
                                </Label>
                                <Input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={ initialData?.description ? initialData?.description : '' }
                                    className="col-span-3"
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        setInitialData( { ...initialData, [ name ]: value } );
                                    } }
                                />
                            </div>
    
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="start"
                                    className="text-right"
                                >
                                    Start Time
                                </Label>
                                <Input
                                    // type="date"
                                    type={ `datetime-local` }
                                    // min={``}
                                    // max={``}
                                    id="start"
                                    name="start"
                                    defaultValue={ initialData?.start ? formatDateTime( initialData?.start ) : '' }
                                    className="col-span-3"
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        let val = formatDateTime( value );
                                        // console.log( "Start time :: onChange :: value = ", value, " :: ", "name = ", name, " :: ", "val = ", val );
                                        setInitialData( { ...initialData, [ name ]: val } );
                                    } }
                                />
                            </div>
    
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="end"
                                    className="text-right"
                                >
                                    End Time
                                </Label>
                                <Input
                                    // type="date"
                                    type={ `datetime-local` }
                                    // min={``}
                                    // max={``}
                                    id="end"
                                    name="end"
                                    // defaultValue={ initialData?.end ? new Date( initialData?.end ) : Date.now() }
                                    defaultValue={ initialData?.end ? formatDateTime( initialData?.end ) : '' }
                                    className="col-span-3"
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        let val = formatDateTime( value );
                                        setInitialData( { ...initialData, [ name ]: val } );
                                    } }
                                />
                            </div>
    
                            <div
                                className="flex flex-col justify-center p-0 items-start gap-2"
                            >
                                <Label
                                    htmlFor="date"
                                    className="text-right"
                                >
                                    Date
                                </Label>
    
                                <DatePicker
                                    id="date"
                                    name="date"
                                    className={ `rounded-md border` }
                                    selectedDate={ initialData?.date ? initialData?.date : '' }
                                    setSelectedDate={ ( e ) => {
                                        let from = e.from;
                                        setInitialData( { ...initialData, date: from } );
                                        // let to = e.to;
                                        // let range = { from: e.from, to: e.to };
                                        // console.log( "Calendar onselect :: e = ", e );
    
                                    } }
                                />
                            </div>
    
                        </div >
    
                        <DialogFooter
                            className="sm:justify-start"
                        >
                            <DialogClose asChild>
                                <Button
                                    type="submit"
                                    onClick={ () => {
                                        console.log( "FullCalendar :: submit button :: handleSubmit :: initialData = ", initialData );
                                        handleSubmit( initialData );
                                    } }
                                >
                                    { `${ [ 'Create', 'Close', 'Save', 'Delete', 'None' ][ [ 'add', 'view', 'edit', 'delete' ].indexOf( dialogType ) ] }` }
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent >
                </Dialog >
            );
        };
    */

    return (
        <>
            <div className="content-body mx-auto h-auto w-full justify-center items-center">
                {/* Create or Edit Event Dialog */ }
                { isOpen && ( data || initialData ) && buildEventDialog( {
                    data: data,
                    setData: setData,
                    initialData: initialData,
                    setInitialData: setInitialData,
                    dialogOpen: isOpen,
                    setDialogOpen: setIsOpen,
                    handleSubmit: handleSubmit,
                    handleChange: handleChange,
                    dialogType: mode,
                    dataType: 'event',
                } ) }
                {/* { isOpen && buildDialog( {
                    initialData,
                    data,
                    setData, // For onchange
                    refData,
                    dataSchema,
                    dialogOpen: isOpen,
                    setDialogOpen: setIsOpen,
                    handleSubmit,
                    handleChange,
                    handleClose,
                    dialogType = 'add',
                    dataType = 'planner', // Name of type of data being represented.
                    dialogTrigger,
                    debug = false
                } ) } */}
            </div>
        </>
    );
};

const CalendarGoToDialog = ( props ) => {
    // Dialog menu for the "Go to" button functionality. 
    const {
        calendarRef,
        calendarApi,
        eventsData,
        isOpen = false,
        setIsOpen = () => { },
        date,
        setDate = () => { },
        handleSubmit = () => { },
        handleChange = () => { },
    } = props;

    const { buildGoToDialog } = usePlanner();

    /*  const handleGoToDate = useCallback( ( date ) => {
            if ( calendarRef ) {
                let calendarApi = calendarRef?.current?.getApi();
                if ( calendarApi && utils.ao.has( calendarApi, "gotoDate" ) ) {
                    calendarApi.gotoDate( new Date( date ) );
                }
            }
        }, [ calendarRef ] );
    */

    return (
        <>
            <div className="content-body mx-auto h-auto w-full justify-center items-center">

                { ( buildGoToDialog( {
                    date,
                    setDate,
                    dialogOpen: isOpen,
                    setDialogOpen: setIsOpen,
                    handleSubmit,
                    handleChange,
                } ) ) }

                {/* 
                    <CustomDialogTrigger
                        isOpen={ isOpen }
                        setIsOpen={ setIsOpen }
                        onClose={ () => { if ( handleSubmit ) { handleSubmit( date ); } } }
                        title={ 'Go To Date' }
                        description={ 'Go to date or date range: ' }
                        className={ `` }
                    >
                        <DatePicker
                            mode={ `range` }
                            selected={ date }
                            onSelect={ setDate }
                            className="rounded-md border"
                            events={ [ eventsData ] } // Array of existing events to show highlighted on the calendar.
                            selectedDate={ date }
                            setSelectedDate={ setDate }
                            // showOutsideDays = true,
                            footer={ <></> }
                        />
                    </CustomDialogTrigger>
                */}
            </div>
        </>
    );
};


const CalendarEventDialog2 = ( {
    // Dialog menu for both creating and updating events.

    // State props
    debugInput = false,
    isOpen = false,
    setIsOpen,
    data = {},
    setData,

    // Content props
    header = {},
    description = {},
    content = {},

    // Handler function props
    handleChange = () => { },
    handleStart = () => { },
    handleFinish = () => { },
    handleCancel = () => { },
    children,
} ) => {

    const [ open, setOpen ] = useState( false );
    const handleClose = () => {
        setOpen( false );
        if ( handleCancel ) {
            handleCancel();
        }
    };

    return (
        <Dialog
            modal={ false }
            className={ `w-full rounded-xl justify-center items-center h-auto overflow-visible flex p-0 m-0` }
            open={ open }
            onClose={ onClose }
            // defaultOpen={true}
            onOpenChange={ () => { handleClose(); } }
        >
            <DialogOverlay />

            <DialogTrigger asChild className={ clsx( '', className ) }>
                { children }
                {/* dialogTrigger */ }
            </DialogTrigger>
            <DialogContent className="h-screen block sm:h-[440px] overflow-scroll w-full">
                <DialogHeader>
                    <DialogTitle>{ header }</DialogTitle>
                    <DialogDescription>{ description }</DialogDescription>
                </DialogHeader>
                { content }
            </DialogContent>
            <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                    <Button size={ 'sm' } onClick={ () => { handleClose(); } }>
                        { `Close` }
                    </Button>
                </DialogClose>
            </DialogFooter>
        </Dialog>
    );
};


export default CalendarView;



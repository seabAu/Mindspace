/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo } from 'react';
import {
    CalendarArrowUp,
    CalendarFoldIcon,
    CalendarMinus,
    CalendarPlus,
    ChevronRight,
} from "lucide-react";

// Utilities
import * as utils from 'akashatools';
import { buildSelect } from '@/lib/utilities/input';
import usePlanner from '@/lib/hooks/usePlanner';
import { cn } from '@/lib/utilities/style';
import clsx from 'clsx';
import { addDays } from 'date-fns';

// Constants / Config
import {
    DATE_PICKER_OPTIONS,
} from '@/lib/config/constants';

// Data stores
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';

// Components
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import Nav from '@/components/Nav/Nav';
import DatePicker, { DateRangePicker } from '@/components/Calendar/DatePicker';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Collapse from '@/components/Collapsible/Collapse';

const PlannerLeftSidebarContent = () => {
    // Display upcoming events.
    // Ordered by proximity, lower = further away. 
    // Create inputs to set date range and filter order / asc | desc

    let [ searchParams, setSearchParams ] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;

    const {
        debug, setDebug,
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,
        data, setData,
        user, setUser,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken,
        settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        // getWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,

        notifications, setNotifications,
        activeNotifications, setActiveNotifications, addNotification, dismissNotification,
        reminders, setReminders,
        activeReminders, setActiveReminders,
    } = useGlobalStore();

    const {
        requestFetchEvents,
        setRequestFetchEvents,
        requestFetchCalendars,
        setRequestFetchCalendars,
        plannerData,
        setPlannerData,
        eventsData,
        setEventsData,
        selectedEvent,
        setSelectedEvent,
        upcomingEventsData,
        setUpcomingEventsData,
        upcomingEventsRange,
        setUpcomingEventsRange,
        calendarsData,
        setCalendarsData,
        selectedDate,
        setSelectedDate,
        loading: loadingPlanner,
        setLoading: setLoadingPlanner,
        error: errorPlanner,
        setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        // VARIABLES
        selected, setSelected,
        plannerSchema,
        calendarSchema,
        eventSchema,
        logSchema,
        conversionEventSchema,

        // HANDLER FUNCTIONS
        handleChangeEventsRangeSelect,
        handleChangeEventsRangeDates,
        handleClone,
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        // handleInputChange: planner_handleInputChange,
        handleChange,
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,
        handleOpen,
        handleCancel,
    } = usePlanner();

    const upcomingEvents = useMemo( () => {
        return (
            utils.val.isValidArray( eventsData, true ) )
            ? (
                eventsData.filter( ( e ) => (
                    new Date( e?.start ) >= new Date(
                        upcomingEventsRange
                            ? upcomingEventsRange?.startDate
                            : addDays(
                                new Date( upcomingEventsRange?.startDate ),
                                ( upcomingEventsRange?.numDays ?? 7 )
                            ) )
                ) ).map( ( e ) => ( {
                    _id: e?._id,
                    title: e?.title,
                    pages: [ ...Object.keys( e ).map( ( key, index ) => ( {
                        title: `${ key }: ${ e?.[ key ] }`,
                        detail: `${ e?.[ key ] }`
                    } ) ) ],
                    ...e
                } ) )
            )
            : ( [] );
    }, [ eventsData, upcomingEventsRange, upcomingEventsData ] );

    let eventsControls = [ {
        enabled: true,
        index: 0,
        id: 'context-menu-item-event-open',
        key: 'context-menu-item-event-open',
        type: 'button',
        // shortcut: '⌘⇧O',
        name: "openEvent",
        label: "Open Event",
        icon: <CalendarArrowUp className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Events nav list :: context :: open :: item = ', item );
            navigate( `/dashboard/planner/events/${ item?._id }` );
            if ( item ) { handleOpen( item, 'event' ); }
        },
        useTooltip: false,
        tooltipInfo: '',
    }, {
        enabled: true,
        index: 1,
        id: 'context-menu-item-event-clone',
        key: 'context-menu-item-event-clone',
        type: 'button',
        // shortcut: '⌘⇧C',
        name: "cloneEvent",
        label: "Clone Event",
        icon: <CalendarFoldIcon className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Events nav list :: context :: clone :: item = ', item );
            if ( item ) { handleCreateStart( item, 'event' ); handleClone( item ); }
        },
        useTooltip: false,
        tooltipInfo: '',
    },
    {
        enabled: true,
        index: 2,
        id: 'context-menu-item-event-update',
        key: 'context-menu-item-event-update',
        type: 'button',
        // shortcut: '⌘⇧U',
        name: "editEvent",
        label: "Edit Event ",
        icon: <CalendarPlus className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Events nav list :: context :: edit event :: item = ', item );
            navigate( `/dash/planner/events/${ item?._id }/edit` );
            if ( item ) { handleEditStart( item, 'event' ); }
        },
        useTooltip: false,
        tooltipInfo: '',
    },
    {
        enabled: true,
        index: 3,
        id: 'context-menu-item-event-delete',
        key: 'context-menu-item-event-delete',
        type: 'button',
        // shortcut: '⌘⇧D',
        name: "deleteEvent",
        label: "Delete Event",
        icon: <CalendarMinus className="fa fa-2x control-button-icon icon" />,
        classes: `control-list-item`,
        onClick: ( item ) => {
            console.log( 'Events nav list :: context :: delete event :: item = ', item );
            if ( item && utils.val.isObject( item ) ) {
                if ( item?._id ) { handleDeleteStart( item?._id, item, setEventsData, 'event' ); }
            }
        },
        useTooltip: false,
        tooltipInfo: '',
    },
    ];

    return (
        <div className={ `w-full !overflow-auto !max-h-full h-auto block justify-start place-items-start` }>

            <React.Fragment key={ `dashboard-planner-menu-filters-dropdown` }>
                <SidebarGroup className={ `w-full py-0 px-1 m-0 group-data-[collapsible=icon]:hidden justify-start items-stretch` }>
                    <Collapse
                        label={ ` Filters ` }
                        defaultOpen={ true }
                        className={ `group/collapsible` }
                    >
                        <SidebarGroupContent>
                            <SidebarMenu>
                                { upcomingEventsRange && (
                                    <DatePicker
                                        className={ `p-0 m-0 w-full` }
                                        usePopover={ true }
                                        useSelect={ true }
                                        selectContent={ buildSelect( {
                                            placeholder: 'Show Events In',
                                            opts: DATE_PICKER_OPTIONS,
                                            value: 3,
                                            initialData: 3,
                                            // key: '',
                                            handleChange: ( key, value ) => {
                                                // console.log( "Select date range for events :: value = ", String( value ) );
                                                handleChangeEventsRangeSelect( value );
                                            },
                                            className: '',
                                            multiple: false
                                        } ) }
                                        selectKey={ '' }
                                        selectValue={ upcomingEventsRange?.numDays ?? 7 }
                                        selectOnChange={ ( k, v ) => handleChangeEventsRangeSelect( v ) }
                                        options={ DATE_PICKER_OPTIONS }
                                        selectedDate={ {
                                            from: new Date( upcomingEventsRange?.startDate ),
                                            to: new Date( upcomingEventsRange?.endDate )
                                        } }
                                        setSelectedDate={ ( value ) => { handleChangeEventsRangeDates( value ); } }
                                        mode={ `range` }
                                        showOutsideDays={ true }
                                        footer={ <></> }
                                        placeholder={ "Get Events Between:" }
                                    />
                                ) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </Collapse>

                </SidebarGroup>
                <SidebarSeparator className="mx-0" />
            </React.Fragment>
            { utils.val.isValidArray( upcomingEvents, true )
                ? (
                    <Nav.List
                        useLoader={ false }
                        label={ 'Upcoming Events' }
                        controls={ eventsControls }
                        useSearch={ true }
                        searchField={ 'title' }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( new Date( a?.start ) - new Date( b?.start ) ) }
                        collapsible={ true }
                        collapsibleDefaultOpen={ true }
                        items={
                            // handleGetUpcomingEventsData()
                            /* ( utils.val.isValidArray( eventsData, true ) )
                                ? (
                                    eventsData.filter( ( e ) => (
                                        new Date( e?.start ) >= new Date(
                                            upcomingEventsRange
                                                ? upcomingEventsRange?.startDate
                                                : addDays(
                                                    new Date( upcomingEventsRange?.startDate ),
                                                    ( upcomingEventsRange?.numDays ?? 7 )
                                                ) )
                                    ) ).map( ( e ) => ( {
                                        _id: e?._id,
                                        title: e?.title,
                                        pages: [ ...Object.keys( e ).map( ( key, index ) => ( {
                                            title: `${ key }: ${ e?.[ key ] }`,
                                            detail: `${ e?.[ key ] }`
                                        } ) ) ],
                                        ...e
                                    } ) )
                                )
                                : ( [] ) */
                            upcomingEvents
                        }
                        maxShow={ 10 }
                        activeItem={ selectedEvent }
                        className={ `gap-1 p-0 m-0 w-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            // console.log( "Dashboard :: Events sidebar dropdown list :: items = ", item, " :: ", "upcomingEventsData = ", " :: ", "onClickItem triggered :: item = ", item );
                            if ( item ) { handleEditStart( item, 'event' ); }
                            navigate( `/dash/planner/events/${ item?._id }/edit` );
                        } }
                        onDoubleClickItem={ ( item ) => {
                            console.log( 'Events nav list :: onDoubleClickItem :: item = ', item );
                            navigate( `/dash/planner/events/${ item?._id }/edit` );
                            if ( item ) { handleEditStart( item, 'event' ); }
                        } }
                    />
                )
                : ( <div className={ `text-center w-full p-2 items-center justify-center` }>{ "There are no items to show. Adjust the timespan to show upcoming events." }</div> )
            }

            <Nav.List
                label={ 'Events' }
                controls={ eventsControls }
                useSearch={ true }
                searchField={ 'title' }
                collapsible={ true }
                collapsibleDefaultOpen={ true }
                items={ eventsData }
                selectedItem={ selectedEvent || selected }
                maxShow={ 10 }
                activeItem={ selectedEvent }
                className={ `gap-1 p-0 m-0 w-full` }
                itemClassname={ `p-0 h-6` }
                onClickItem={ ( item ) => {
                    // console.log( "Dashboard :: Events sidebar dropdown list :: items = ", eventsData, " :: ", "onClickItem triggered :: item = ", item );
                    // handleEditStart( item, 'event' );
                    setSelectedEvent( item );
                } }
                onDoubleClickItem={ ( item ) => {
                    console.log( 'Events nav list :: onDoubleClickItem :: item = ', item );
                    navigate( `/dash/planner/events/${ item?._id }/edit` );
                    if ( item ) { handleEditStart( item, 'event' ); }
                } }
            />
        </div>
    );
};

export default PlannerLeftSidebarContent;

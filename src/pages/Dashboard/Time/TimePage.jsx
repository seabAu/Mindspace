import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
    memo,
    useMemo,
} from 'react';

import { ArrowBigLeft, Calendar1Icon, CalendarPlus2Icon, CalendarPlusIcon, ClockIcon, Edit, EllipsisIcon, LucideLayoutGrid, Plus, PlusCircleIcon, RefreshCcw, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import Planner from '@/components/Calendar';
// import { Calendar } from '@/components/ui/calendar';
// import { useSelectSingle } from 'react-day-picker';
import clsx from 'clsx';
import * as utils from 'akashatools';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import isBetween from 'dayjs/plugin/isBetween'; // ES 2015
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { Form } from '@/components/ui/form';
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
import FormGenerator from '@/components/Form/FormGenerator';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import usePlanner from '@/lib/hooks/usePlanner';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import Clock from '@/components/Time/Clock';
import { filterByDates, formatDateTime, isSameDay } from '@/lib/utilities/time';
import {
    CONTENT_HEADER_HEIGHT,
    HEADER_TRIGGER_DROPDOWN_WIDTH_LG,
    HEADER_TRIGGER_DROPDOWN_WIDTH_MD,
    HEADER_TRIGGER_DROPDOWN_WIDTH_XL,
    ROUTES_PLANNER,
    ROUTES_PLANNER_PAGE,
    ROUTES_PLANNER_PAGE_LOG_SUBPAGE,
    ROUTES_TIME,
    ROUTES_TIME_PAGE,
} from '@/lib/config/constants';
import { buildButtonGroup, buttonListToSchema } from '@/lib/utilities/nav';
import Droplist from '@/components/Droplist';
import { DateTimeLocal } from '@/lib/config/types';
import Form from '@/components/Form';
import Content from '@/components/Page/Content';
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { initializeFormModel } from '@/lib/utilities/input';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { convertCamelCaseToSentenceCase } from '@/lib/utilities/string';
import { ScrollArea, ScrollAreaCorner, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';
import DropTable from '@/components/Droplist/droptable';
import EventDetail from '@/features/Planner/blocks/Event/EventDetail';
import EventCreate from '@/features/Planner/blocks/Event/EventCreate';
import EventList from '@/features/Planner/blocks/Event/EventList';
import { Spinner } from '@/components/Loader/Spinner';
import Container from '@/components/Page/Container';
import { twMerge } from 'tailwind-merge';
import PlannerDialog from '@/features/Planner/components/dialog/PlannerDialog';
import LogView from '@/features/Reflect/Journal/views/LogPageView';
import LogList from '@/features/Reflect/Journal/views/LogList';
import LogCreate from '@/features/Reflect/Journal/views/LogCreate';
import LogDetail from '@/features/Reflect/Journal/views/LogDetail';
import TodayView from '@/features/Planner/blocks/Today/PlannerTodayView';
import Timeblocks from '@/features/Planner/blocks/Timeblocks/Timeblocks';
import CalendarView from '@/features/Planner/blocks/Scheduler/FullCalendar';
import PlannerDialogWrapper from '@/features/Planner/components/dialog/PlannerDialogWrapper';
import PlannerList from '@/features/Planner/blocks/Planner/PlannerList';
import PlannerDetail from '@/features/Planner/blocks/Planner/PlannerDetail';
import PlannerCreate from '@/features/Planner/blocks/Planner/PlannerCreate';
import { FaTimeline } from 'react-icons/fa6';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BsCalendar3Event, BsCalendar3EventFill, BsCalendarEvent } from 'react-icons/bs';
import { addDays, differenceInMilliseconds, differenceInMinutes, formatDate, isWithinInterval } from 'date-fns';
import { useSync } from '@/lib/hooks/useSync';
import TimeGridView from '@/features/Time/blocks/TimeGrid/TimeGridView';
import { PomodoroTimer } from '@/features/Time/blocks/FocusTimer';
import { CountdownTimers } from '@/features/Time/blocks/timer/CountdownTimers';
import TimeGrid from '@/features/Time/blocks/TimeGrid/TimeGridDisplay';
import EnhancedTimeGrid from '@/features/Time/blocks/TimeGrid/EnhancedTimeGrid';
import TimeHeatmap from '@/features/Time/blocks/Heatmap/TimeHeatmap';

// import usePlannerApi from './usePlannerApi';
// import FormGenerator from './FormGenerator'; // Our modular form component

const TimePage = ( props ) => {
    const { view = '', children, classNames = '', } = props;

    const {
        // Debug state
        debug, setDebug,

        // Fetch requests state
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,

        // Data state
        data, setData, getData,
        schemas,
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
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    const {
        requestFetchEvents, setRequestFetchEvents,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        upcomingEventsData, setUpcomingEventsData,
        selectedEvent, setSelectedEvent,
        calendarsData, setCalendarsData,
        selectedCalendar, setSelectedCalendar,
        selectedDate, setSelectedDate,
        upcomingEventsRange, setUpcomingEventsRange,
    } = usePlannerStore();

    const {
        // VARIABLES
        conversionEventSchema,
        getSchemaForDataType,
        handleGetSchemas,

        // HANDLER FUNCTIONS
        // >> enerci
        // >> Generic handlers
        handleCreateStart, handleCreateSubmit,
        handleEditStart, handleEditSubmit,
        handleDeleteStart, handleDeleteSubmit,

        // >> Event handlers
        handleClone,
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        handleInputChange, handleChange,
        handleCreateEvent,
        handleUpdateEvent,
        handleCancel,
        handleGetEventsData,
        handleChangeEventsRangeSelect,
        handleChangeEventsRangeDates,
        handleFilterEventsByActiveCalendar,
        filterEventsByActiveCalendar,

        // >> Calendar handlers
        handleCloneCalendar,
        handleDeleteCalendar,
        handleUpdateCalendar,
        handleCreateCalendar,
        handleGetCalendarsData,
        handleGetPlannersData,
        handleGetCalendarsWithEvents,
        handleGetEventsInDateRangeData,
        handleFetchCalendarById,

        handleSubmitRouting,

        // DIALOG MENUS
        buildEventDialog,
        buildGoToDialog,
        buildDialog,

        // INITIALIZERS
        initializeEvent,

        // GETTERS / SETTERS

        dialogDataSchema, setDialogDataSchema,
        eventSchema, setEventSchema,
        calendarSchema, setCalendarSchema,
        logSchema, setLogSchema,
        plannerSchema, setPlannerSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        showGotoDialog, setShowGotoDialog,
        gotoDate, setGotoDate,
        open, setOpen,
        isCreating, setIsCreating,
        isEditing, setIsEditing,
    } = usePlanner();
    let [ searchParams, setSearchParams ] = useSearchParams();

    // const {
    //     syncLoading, setSyncLoading,
    //     syncError, setSyncError,
    // } = useSync( {
    //     valueToWatch: eventsData,
    //     interval: 15000, // Check every 15 seconds
    //     syncFunction: handleGetEventsData, // The function to call to get data
    //     onSyncSuccess: setEventsData, // The Zustand action to update the store
    // } );

    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    let allData = getData();

    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'time' ) + 1 ];

    const handleGetViewType = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_TIME_PAGE );
        if ( !t || t === '' ) { return endpoint ?? 'logs'; }
        return t;
    };

    const [ viewType, setViewType ] = useState( endpoint ?? handleGetViewType() ); // AGENDA | DAY | WEEK | MONTH | YEAR | 5-YEAR | CUSTOM

    useEffect( () => {
        setViewType( endpoint );
    }, [ endpoint ] );

    const handleSetViewType = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        setViewType( t );
        // navigate( t );
        localStorage.setItem(
            ROUTES_TIME_PAGE,
            t,
        );
    };

    useEffect( () => {
        if ( workspaceId ) handleGetEventsInDateRangeData( { workspaceId } );
    }, [] );

    // console.log( "PlannerPage.jsx :: Events: ", eventsData );
    return (

        <Content.Container
            // className={ `w-full !items-start !justify-start rounded-[${ 0.25 }rem] overflow-auto flex !h-full !max-h-full !min-h-full min-w-full w-full items-stretch justify-stretch ` }
            className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-0 gap-0 mx-auto my-auto max-w-full ` }
            centered={ false }
        >
            <Content.Header
                className={ `flex flex-row justify-between items-center w-full rounded-[${ 0.25 }rem] h-8 max-h-8` }
            >
                {/* Nav buttons */ }
                <div className={ `new-task-button w-auto h-auto flex-nowrap inline-flex p-0 m-0 gap-0 px-1 items-center justify-center self-center` }>
                    <ButtonGroup
                        parentRoute={ `./time` }
                        containerClassNames={ `mx-4 my-4 rounded-full !hover:bg-transparent` }
                        dropdownMenuClassNames={ `rounded-lg bg-transparent hover:bg-transparent p-1 m-0` }
                        dropdownTriggerClassNames={ `` }
                        dropdownContentClassNames={ `` }
                        // buttons={ plannerBtns }
                        buttons={ buttonListToSchema( ROUTES_TIME, viewType, ( value ) => { handleSetViewType( value ); } ) }
                        activeValue={ viewType }
                        setActiveValue={ setViewType }
                        dropdownTriggerIcon={ <LucideLayoutGrid className={ `p-1 h-8` } /> }
                        responsiveMode={ 'dropdown' }
                        responsiveBreakpoint={ 980 }
                    />
                </div>

            </Content.Header>

            {/* // List of calendar groupings; */ }
            {/* // Change which one is active, edit data, etc. */ }

            <div
                className={ `relative content-body-container !w-full !min-w-full !max-w-full ${ classNames } !overflow-auto` }
            /* style={ {
                paddingBlock: `${ CONTENT_HEADER_HEIGHT / 4 + CONTENT_HEADER_HEIGHT / 12 }rem`,
                top: `${ CONTENT_HEADER_HEIGHT / 4 }rem`,
                bottom: `${ CONTENT_HEADER_HEIGHT / 4 }rem`,
            } } */
            >

                <Content.Body
                    // className={ `flex flex-col gap-2 justify-center items-center h-full w-full max-w-full px-1` }
                    className={ twMerge(
                        // `sticky`,
                        // " min-h-svh flex-1 flex-col bg-background p-0 sticky",
                        "p-0 px-1",
                        // "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-lg md:peer-data-[variant=inset]:shadow",
                        // `min-h-full max-h-full max-w-full w-full flex flex-col`,
                        // `border border-[${ 0.5 }rem] border-solid border-2 rounded-[${ 0.25 }rem] flex flex-grow justify-start items-start h-full w-full max-w-full min-w-full p-2`,
                        // `overflow-y-hidden overflow-x-hidden`,
                        // `!w-full !max-w-full !min-h-full !h-full !max-h-full `,
                    ) }
                    centered={ false }
                >

                    <ScrollArea
                        className={ `task-interface-container !w-full !max-w-full !min-h-full !h-full !max-h-full !px-0 mb-0 gap-0 overflow-hidden` }
                    >
                        <div
                            className={ twMerge(
                                `border-[0.125rem] border-solid rounded-lg h-full w-full max-w-full min-w-full`,
                                `m-0 gap-0 !px-2 !py-2`,
                                `!overflow-y-hidden !overflow-x-hidden`,
                            ) }
                        >
                            {/* Actual content area */ }
                            <Routes>

                                {/* <Route path={ "timeBlocks" } element={ <TimePage /> } /> */ }

                                <Route
                                    path={ 'timers' }
                                    element={
                                        <Timeblocks
                                            title={ 'timers' }
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            { ...props }
                                        >
                                            <CountdownTimers />
                                        </Timeblocks>
                                    }
                                />

                                <Route
                                    path={ 'timeBlockVisualizer' }
                                    element={
                                        <EnhancedTimeGrid
                                            title={ 'timeBlockVisualizer' }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            mode={ 'default' }
                                            className={ `` }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'focus' }
                                    element={
                                        <PomodoroTimer
                                            title={ 'focus' }
                                            mode={ 'default' }
                                            className={ `` }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'today' }
                                    element={
                                        <TodayView
                                            title={ 'today' }
                                            mode={ 'default' }
                                            className={ '' }
                                            { ...props }
                                        />
                                    }
                                />
                                <Route
                                    path={ 'heatmap' }
                                    element={
                                        <TimeHeatmap
                                            title={ 'heatmap' }
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            { ...props }
                                        />
                                    }
                                />
                            </Routes>
                        </div>
                    </ScrollArea>
                </Content.Body>
            </div>
            {/* <Content.Footer className={ `flex flex-shrink !h-8 rounded-[${ 0.25 }rem]` }>
                { eventsData ? JSON.stringify( JSON.parse( eventsData.length.toString() ), null, '\t' ) : '' }
            </Content.Footer> */}
        </Content.Container>
    );
};

export default TimePage;

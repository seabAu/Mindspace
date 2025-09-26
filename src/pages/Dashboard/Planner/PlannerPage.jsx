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
import { TimePage } from '@/pages/Dashboard/Pomodoro/TimePage';
import PlannerList from '@/features/Planner/blocks/Planner/PlannerList';
import PlannerDetail from '@/features/Planner/blocks/Planner/PlannerDetail';
import PlannerCreate from '@/features/Planner/blocks/Planner/PlannerCreate';
import { FaTimeline } from 'react-icons/fa6';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BsCalendar3Event, BsCalendar3EventFill, BsCalendarEvent } from 'react-icons/bs';
import { addDays, differenceInMilliseconds, differenceInMinutes, formatDate, isWithinInterval } from 'date-fns';
import { useSync } from '@/lib/hooks/useSync';
import EnhancedTimeGrid from '@/features/Time/blocks/TimeGrid/EnhancedTimeGrid';
import TimeGridView from '@/features/Time/blocks/TimeGrid/TimeGridView';
import { PomodoroTimer } from '@/features/Time/blocks/FocusTimer';
import ContentHeader from '@/components/Page/ContentHeader/ContentHeader';

// import usePlannerApi from './usePlannerApi';
// import FormGenerator from './FormGenerator'; // Our modular form component

const PlannerPage = ( {
    view = '',
    defaultRoute = 'scheduler',
    children,
    classNames = ''
}, ...props ) => {

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
        handleFetchPlannerData,
        handleClearPlannerData,
        handleInitializeData, // For initializing data for a given data type for a form. 
        handleInitializePlannerData, // For initializing all data for this dashboard on load.
        handleCreateStart, handleCreateSubmit,
        handleEditStart, handleEditSubmit,
        handleDeleteStart, handleDeleteSubmit,
        handleInputChange, handleChange,
        handleCancel,
        handleSubmitRouting,

        // >> Event handlers
        handleGetEventsData,
        handleClone,
        handleToggleActive,
        handleChangeActive,
        handleConvertEvents,
        handleCreateEvent,
        handleUpdateEvent,
        handleChangeEventsRangeSelect,
        handleChangeEventsRangeDates,
        handleFilterEventsByActiveCalendar,
        filterEventsByActiveCalendar,

        // >> Calendar handlers
        handleGetCalendarsData,
        handleGetPlannersData,
        handleGetCalendarsWithEvents,
        handleGetEventsInDateRangeData,
        handleCloneCalendar,
        handleDeleteCalendar,
        handleUpdateCalendar,
        handleCreateCalendar,
        handleFetchCalendarById,

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
    const endpoint = path?.[ path.indexOf( 'planner' ) + 1 ];
    // console.log( "PlannerPage :: pathname = ", endpoint );

    useEffect( () => {
        // Load schemas on component mount.
        handleGetSchemas();

        // Load data on component mount if it is missing. 
        handleInitializePlannerData();

    }, [] );

    // useEffect( () => {
    //     // Workspace changed. Wipe data and fetch new data.
    //     console.log( "PlannerPage :: useEffect :: no workspaceId -> Clearing all data. " );
    //     handleClearPlannerData();

    //     // Load data on component mount if it is missing. 
    //     handleGetPlannersData();
    // }, [ workspaceId, user ] );

    /* useEffect( () => {
        console.log( "PlannerPage :: handleGetSchemas :: schemas updated :: schemas = ", [
            schemas,
            eventSchema,
            plannerSchema,
            calendarSchema,
        ] );
    }, [
        schemas,
        eventSchema,
        plannerSchema,
        calendarSchema,
    ] ); */

    const handleGetViewType = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_PLANNER_PAGE );
        if ( !t || t === '' ) { return endpoint ?? defaultRoute; }
        return t;
    };

    const [ viewType, setViewType ] = useState( endpoint ?? handleGetViewType() ); // AGENDA | DAY | WEEK | MONTH | YEAR | 5-YEAR | CUSTOM

    useEffect( () => {
        setViewType( endpoint );
    }, [ endpoint ] );

    useEffect( () => {
        console.log( "PlannerPage :: selectedEvent changed :: selectedEvent = ", selectedEvent );
    }, [ selectedEvent ] );

    /* useEffect( () => {
        console.log( "PlannerPage :: PARAMS >:C :: params changed = ", [
            selectedEvent,
            dialogType,
            dialogData,
            dialogDataType,
            dialogInitialData,
            showGotoDialog,
            gotoDate,
            open,
            isCreating,
            isEditing,
        ] );
    }, [
        selectedEvent,
        dialogType,
        dialogData,
        dialogDataType,
        dialogInitialData,
        showGotoDialog,
        gotoDate,
        open,
        isCreating,
        isEditing,
    ] ); */

    const handleSetViewType = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        setViewType( t );
        // navigate( t );
        localStorage.setItem(
            ROUTES_PLANNER_PAGE,
            t,
        );
    };

    // console.log( "PlannerPage.jsx :: Events: ", eventsData );
    return (

        <Content.Container
            // className={ `w-full !items-start !justify-start rounded-[${ 0.25 }rem] overflow-auto flex !h-full !max-h-full !min-h-full min-w-full w-full items-stretch justify-stretch ` }
            className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-0 gap-0 mx-auto my-auto max-w-full ` }
            centered={ false }
        >

            <ContentHeader
                useRefresh={ true }
                refreshFn={ handleFetchPlannerData }
                localStorageName={ ROUTES_PLANNER_PAGE }
                routes={ ROUTES_PLANNER }
                activeRoute={ viewType }
                setActiveRoute={ setViewType }
                defaultRoute={ 'scheduler' }
                parentRoute={ `planner` }
                parentPath={ '/dash/planner' }
                buttonsLeft={
                    <div className={ `new-task-button flex-nowrap inline-flex items-center justify-center` }>
                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `focus:outline-none max-h-8 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-lg self-center` }
                            onClick={ () => {
                                if ( debug === true )
                                    console.log( 'PlannerPage :: Multi-data-type createStart button :: endpoint = ', endpoint );
                                if ( endpoint === 'events' ) handleCreateStart( {}, 'event' );
                                // else if ( endpoint === 'logs' ) handleCreateStart( {}, 'log' );
                                else if ( endpoint === 'calendars' ) handleCreateStart( {}, 'calendar' );
                                else if ( endpoint === 'planners' ) handleCreateStart( {}, 'planner' );
                            } }
                        >
                            <Plus className={ `p-0 m-0 h-full !size-5` } />
                            <h6 className={ `text-center self-center object-center leading-relaxed select-none p-0 text-xs capitalize w-auto` }>
                                { ` New ` }
                            </h6>
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `px-2 py-1 m-0 focus:outline-none max-h-8 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ () => { handleCreateStart( {}, 'event' ); } }
                        >
                            <BsCalendarEvent className={ `aspect-square size-6 p-0 m-0` } />
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `px-2 py-1 m-0 focus:outline-none max-h-8 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ () => { handleCreateStart( {}, 'log' ); } }
                        >
                            <CalendarPlus2Icon className={ `aspect-square size-6 p-0 m-0` } />
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `px-2 py-1 m-0 focus:outline-none max-h-8 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ () => { handleCreateStart( {}, 'calendar' ); } }
                        >
                            <CalendarPlusIcon className={ `aspect-square size-6 p-0 m-0` } />
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `px-2 py-1 m-0 focus:outline-none max-h-8 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border self-center` }
                            onClick={ () => { handleCreateStart( {}, 'planner' ); } }
                        >
                            <AiTwotoneCalendar className={ `aspect-square size-6 p-0 m-0` } />
                        </Button>

                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            className={ `px-2 py-1 m-0 focus:outline-none w-auto max-h-8 focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-r-lg self-center` }
                            onClick={ () => {
                                handleGetEventsData();
                                handleGetPlannersData();
                                handleGetCalendarsData();
                                if ( workspaceId ) handleGetEventsInDateRangeData( {
                                    workspaceId,
                                    startDate: upcomingEventsRange?.startDate,
                                    endDate: upcomingEventsRange?.endDate,
                                    numDays: upcomingEventsRange?.numDays,
                                    ...upcomingEventsRange
                                } );
                            } }
                        >
                            <RefreshCcw className={ `aspect-square size-6 p-0 m-0` } />
                        </Button>
                    </div>
                }
                className={ `w-full px-1 rounded-md` }
            />

            {/* <ButtonGroup
                        parentRoute={ `./planner` }
                        containerClassNames={ `min-h-7 mx-4 my-4 rounded-full !hover:bg-transparent items-center justify-stretch max-h-8 h-full` }
                        dropdownMenuClassNames={ `rounded-lg bg-transparent hover:bg-transparent p-1 m-0` }
                        dropdownTriggerClassNames={ `` }
                        dropdownContentClassNames={ `` }
                        // buttons={ plannerBtns }
                        buttons={ buttonListToSchema( ROUTES_PLANNER, viewType, ( value ) => { handleSetViewType( value ); } ) }
                        activeValue={ viewType }
                        setActiveValue={ setViewType }
                        dropdownTriggerIcon={ <LucideLayoutGrid className={ `p-1 h-9` } /> }
                        responsiveMode={ 'dropdown' }
                        responsiveBreakpoint={ 980 }
                    /> */}

            {/* // List of calendar groupings; */ }
            {/* // Change which one is active, edit data, etc. */ }

            <div className={ `relative content-body-container !w-full !min-w-full !max-w-full !h-[92.5%] !max-h-[92.5%] !min-h-[92.5%] ${ classNames } !overflow-auto` }
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
                        `relative flex flex-col gap-2 h-full w-full max-w-full`,
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
                                `task-interface-container w-full max-w-full !min-h-full !h-full !max-h-full`,
                                `border-[0.125rem] border-solid rounded-lg flex flex-grow justify-start items-start h-full w-full max-w-full min-w-full`,
                                `m-0 gap-0 !px-2 !py-2`,
                                `!overflow-y-auto !overflow-x-auto`,
                            ) }
                        >
                            {/* Actual content area */ }
                            <Routes>

                                {/* <Route path={ "timeBlocks" } element={ <TimePage /> } /> */ }

                                {/* // List of calendar groupings; */ }
                                {/* // Change which one is active, edit data, etc. */ }
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
                                            <TimePage />
                                        </Timeblocks>
                                    }
                                />

                                <Route
                                    path={ 'timeBlocks' }
                                    element={
                                        <PomodoroTimer
                                            title={ 'timeBlockVisualizer' }
                                            date={ selectedDate }
                                            mode={ 'default' }
                                            className={ `` }
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            setSelectedDate={ setSelectedDate }
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

                                {/* Agenda is just like the today-page, except it shows all upcoming events, tasks, reminders, etc. in a given time range.  */ }
                                <Route
                                    path={ 'agenda' }
                                    element={
                                        <EventAgenda
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            // Specifies the starting day of the week. Defaults to "sunday".
                                            weekStartsOn='monday'
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ `logs` }
                                    element={
                                        <LogView
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            width={ 100 }
                                            height={ 100 }
                                            // showDropdown={ showDropdown }
                                            { ...props }
                                        />
                                    }
                                >
                                    <Route path={ '' } element={ <LogList /> } />
                                    <Route path={ 'new' } element={ <LogCreate /> } />
                                    <Route path={ ':id' } element={ <LogDetail /> } />
                                </Route>

                                <Route path={ `planners` }>
                                    <Route path={ '' } element={ <PlannerList /> } />
                                    <Route path={ ':id' }>
                                        <Route path={ 'detail' } element={ <PlannerDetail editingMode={ false } /> } />
                                        <Route path={ 'edit' } element={ <PlannerDetail editingMode={ true } /> } />
                                    </Route>
                                    <Route path={ 'create' } element={ <PlannerCreate /> } />
                                </Route>

                                <Route path={ `events` }>
                                    <Route path={ '' } element={ <EventList /> } />
                                    <Route path={ ':id' }>
                                        <Route path={ 'detail' } element={ <EventDetail editingMode={ false } /> } />
                                        <Route path={ 'edit' } element={ <EventDetail editingMode={ true } /> } />
                                    </Route>
                                    <Route path={ 'create' } element={ <EventCreate /> } />
                                </Route>

                                {/* // List of calendar groupings; */ }
                                {/* // Change which one is active, edit data, etc. */ }
                                <Route
                                    path={ 'scheduler' }
                                    element={
                                        <div
                                            className={ `w-full h-full flex flex-col p-0 m-0 justify-center items-center` }
                                        >
                                            <CalendarView
                                                initialState={ eventsData }
                                                eventsData={ handleFilterEventsByActiveCalendar( eventsData, calendarsData ) }
                                                setEventsData={ setEventsData }
                                                selectedDate={ selectedDate }
                                                setSelectedDate={ setSelectedDate }
                                                // Specifies the starting day of the week. Defaults to "sunday".
                                                weekStartsOn='monday'
                                                // – Callback triggered when an event is added.
                                                onAddEvent={ () => { console.log( 'Calendar :: Scheduler :: onAddEvent triggered.' ); } }
                                                // – Callback triggered when an event is updated.
                                                onUpdateEvent={ () => { console.log( 'Calendar :: Scheduler :: onUpdateEvent triggered.' ); } }
                                                // – Callback triggered when an event is deleted.
                                                onDeleteEvent={ () => { console.log( 'Calendar :: Scheduler :: onDeleteEvent triggered.' ); } }
                                                { ...props }
                                            />
                                            {/* <Planner /> */ }
                                        </div>
                                    }
                                />

                                {/* <Route
                                    path={ 'heatmap' }
                                    element={
                                        <Heatmap
                                            title={ 'heatmap' }
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'custom' }
                                    element={
                                        <Custom
                                            title={ 'custom' }
                                            eventsData={ eventsData }
                                            setEventsData={ setEventsData }
                                            selectedDate={ selectedDate }
                                            setSelectedDate={ setSelectedDate }
                                            { ...props }
                                        />
                                    }
                                /> */}

                            </Routes>

                        </div>
                    </ScrollArea>

                </Content.Body>
            </div>;
            {/* <Content.Footer className={ `flex flex-shrink !h-8 rounded-[${ 0.25 }rem]` }>
                { eventsData ? JSON.stringify( JSON.parse( eventsData.length.toString() ), null, '\t' ) : '' }
            </Content.Footer> */}

            {
                dialogType === 'add' && (
                    <PlannerDialog
                        data={ dialogData ?? {} }
                        setData={ setDialogData }
                        dataSchema={ getSchemaForDataType( dialogDataType ) }
                        dialogOpen={ dialogType === 'add' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                        handleSubmit={ ( data ) => { handleCreateSubmit( data, dialogDataType ?? 'event' ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'add' }
                        dataType={ dialogDataType }
                        debug={ debug }
                    />
                )
            }

            {/* Edit Dialog */ }
            {
                dialogType === 'edit' && (
                    <PlannerDialog
                        data={ selectedEvent ?? dialogData }
                        refData={ allData }
                        setData={ setDialogData } // { setSelectedEvent }
                        dataSchema={ getSchemaForDataType( dialogDataType ) }
                        dialogOpen={ dialogType === 'edit' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                        handleSubmit={ ( data ) => { handleEditSubmit( data, dialogDataType ?? 'event' ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'edit' }
                        dataType={ dialogDataType }
                        debug={ debug }
                    />
                )
            }

            {/* Open Dialog */ }
            {
                open === true && (
                    <PlannerDialog
                        data={ selectedEvent ?? selected }
                        refData={ allData }
                        setData={ setSelectedEvent }
                        dataSchema={ getSchemaForDataType( dialogDataType ) }
                        dialogOpen={ dialogType === 'view' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'view' ) }
                        // handleSubmit={ handleCancel }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'view' }
                        dataType={ dialogDataType }
                        debug={ debug }
                    />
                )
            }

            {/* <PlannerDialogWrapper /> */ }
        </Content.Container>
    );
};

export const EventAgenda = ( props ) => {
    const {
        classNames = '',
        eventsData,
        setEventsData,
        selectedDate,
        setSelectedDate,
        selectedDateRange,
        selected,
        onSelect,
        agendaDaysLimit = 5,
        isLoading = false,
        children,
    } = props;

    const {
        handleGetUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
    } = usePlanner();

    // const [ upcomingEvents, setUpcomingEvents ] = useState( null );
    const upcomingEvents = useMemo( () => {
        const date = new Date( Date.now() );
        const rangeStartDate = addDays( date, -1 * agendaDaysLimit );
        const rangeEndDate = addDays( date, agendaDaysLimit );
        console.log( "date = ", date, " :: ", "rangeStartDate = ", rangeStartDate, " :: ", "rangeEndDate = ", rangeEndDate );

        if ( utils.val.isValidArray( eventsData, true ) ) {
            return (
                eventsData
                    ?.sort( ( a, b ) => ( new Date( a?.start ) - new Date( b?.start ) ) )
                    ?.filter( ( e ) => ( isWithinInterval( new Date( e?.start ), { start: rangeStartDate, end: rangeEndDate } ) ) )
            );
        }
        else {
            return [];
        }
    }, [ eventsData, selectedDate ] );

    // console.log( "PlannerPage :: Agenda :: upcomingEvents = ", upcomingEvents, " :: ", "upcomingEventsRange = ", upcomingEventsRange, " :: ", "" );

    return (
        <div className={ `space-y-2` }>
            <h2 className={ `text-3xl` }>
                Agenda
            </h2>

            <div className={ `plannerpage-agenda-container` }>
                <div className={ `w-full h-full grid grid-flow-col grid-cols-8 p-0 m-0 justify-center items-start px-4` }>
                    <div className={ `col-span-8 w-full` }>
                        {/* Render events */ }
                        { utils.val.isValidArray( upcomingEvents, true ) && (
                            Array( agendaDaysLimit )
                                .fill()
                                .map( ( _, index ) => index + 1 )
                                .map( ( dayNum ) => {
                                    let agendaDate = addDays( new Date(), dayNum );
                                    let agendaDateEvents = upcomingEvents.filter( ( event ) => (
                                        isSameDay(
                                            new Date( event?.start ),
                                            agendaDate
                                        )
                                    ) );

                                    if ( utils.val.isValidArray( agendaDateEvents, true ) ) {
                                        // if ( agendaDateEvents ) {
                                        return (
                                            <div className={ `agenda-date-group w-full h-auto rounded-lg flex-col flex-nowrap p-2` }>
                                                <div key={ `agenda-date-group-title-${ dayNum }` } className={ `col-span-4 text-lg leading-2` }>
                                                    { formatDate( agendaDate, 'PPPP' ) }
                                                    { agendaDateEvents?.length ?? 0 }
                                                </div>
                                                { utils.val.isValidArray( agendaDateEvents, true ) &&
                                                    agendaDateEvents?.map( ( event ) => {
                                                        const start = new Date( event?.start );
                                                        const end = new Date( event?.end );
                                                        let timeUntil = differenceInMinutes( start, new Date() );
                                                        let timeUntilHrs = Math.floor( timeUntil / 60 );
                                                        let timeUntilMinutes = timeUntil % 60;
                                                        let duration = Math.abs( differenceInMinutes( start, end ) );
                                                        let durationHrs = Math.floor( duration / 60 );
                                                        let durationMinutes = duration % 60;
                                                        return (
                                                            <div key={ `event-agenda-${ event?._id }` } className={ `col-span-8 grid grid-flow-row grid-cols-8 border rounded-lg p-2 w-full` }>
                                                                <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-4 text-lg leading-2 flex-row flex-nowrap gap-4` }>
                                                                    <ClockIcon />
                                                                    <div className={ `flex-col` }>

                                                                        <div className={ `text-lg` }>{ event?.title }</div>

                                                                        <div className={ `flex-row gap-4 text-sm` }>
                                                                            <div key={ `event-agenda-start-time-${ event?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                                                { formatDate( new Date( event?.start ), 'pp' ) }
                                                                            </div>
                                                                            { `-` }
                                                                            <div key={ `event-agenda-start-time-${ event?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                                                { formatDate( new Date( event?.end ), 'pp' ) }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-2 text-lg leading-2` }>
                                                                    <div key={ `event-agenda-start-date-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                                        { `${ timeUntilHrs }H, ${ timeUntilMinutes }m from now` }
                                                                    </div>
                                                                </div>
                                                                <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-2 text-lg leading-2` }>
                                                                    <div key={ `event-agenda-start-time-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                                        { `${ durationHrs }H, ${ durationMinutes }m long` }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } ) }
                                            </div>
                                        );
                                    }
                                } )
                        ) }
                        {/* { utils.val.isValidArray( eventsData, true ) &&
                            upcomingEvents?.map( ( event ) => {
                                const start = new Date( event?.start );
                                const end = new Date( event?.end );
                                let timeUntil = differenceInMilliseconds( new Date(), start );
                                let duration = differenceInMilliseconds( start, end );
                                return (
                                    <div key={ `event-agenda-${ event?._id }` } className={ `col-span-8 grid grid-flow-row grid-cols-8 border rounded-lg p-2 w-full` }>
                                        <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-4 text-lg leading-2 flex-row flex-nowrap gap-4` }>
                                            <ClockIcon />
                                            { event?.title }
                                        </div>
                                        <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-2 text-lg leading-2` }>
                                            <div key={ `event-agenda-start-date-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                { formatDate( new Date( event?.start ), 'PPPP' ) }
                                            </div>
                                            <div key={ `event-agenda-start-time-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                { formatDate( new Date( event?.start ), 'pp' ) }
                                            </div>
                                        </div>
                                        <div key={ `event-agenda-title-${ event?._id }` } className={ `col-span-2 text-lg leading-2` }>
                                            <div key={ `event-agenda-start-date-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                { formatDate( new Date( event?.end ), 'PPPP' ) }
                                            </div>
                                            <div key={ `event-agenda-start-time-${ event?._id }` } className={ `col-span-1 text-lg leading-2` }>
                                                { formatDate( new Date( event?.end ), 'pp' ) }
                                            </div>
                                        </div>
                                    </div>
                                );
                            } ) } */}
                    </div>
                </div>
            </div>
        </div>
    );
};

/*  const Sidebar = () => {
        const [ sortBy, setSortBy ] = useState( 'deadline' );
        const { events, todos } = useStore();

        const upcomingItems = useMemo( () => {
            const now = new Date();
            const oneWeekLater = addDays( now, 7 );

            const upcomingEvents = events.filter( event =>
                isWithinInterval( new Date( event.startDate ), { start: now, end: oneWeekLater } )
            ).map( event => ( { ...event, type: 'event', deadline: new Date( event.startDate ) } ) );

            const upcomingTodos = todos.filter( todo =>
                todo.dueDate && isWithinInterval( new Date( todo.dueDate ), { start: now, end: oneWeekLater } )
            ).map( todo => ( { ...todo, type: 'todo', deadline: new Date( todo.dueDate ) } ) );

            const allItems = [ ...upcomingEvents, ...upcomingTodos ];

            switch ( sortBy ) {
                case 'priority':
                    return allItems.sort( ( a, b ) => {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[ b.priority ] - priorityOrder[ a.priority ];
                    } );
                case 'urgency':
                    return allItems.sort( ( a, b ) => new Date( a.deadline ) - new Date( b.deadline ) );
                case 'deadline':
                default:
                    return allItems.sort( ( a, b ) => new Date( a.deadline ) - new Date( b.deadline ) );
            }
        }, [ events, todos, sortBy ] );

        return (
            <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Upcoming Items</h2>
                <Select
                    value={ sortBy }
                    onValueChange={ ( value ) => setSortBy( value ) }
                    className="mb-4"
                >
                    <option value="deadline">Deadline</option>
                    <option value="priority">Priority</option>
                    <option value="urgency">Urgency</option>
                </Select>
                <ul className="space-y-2">
                    { upcomingItems.map( ( item ) => (
                        <li key={ item._id } className="bg-white p-2 rounded shadow">
                            <span className={ `inline-block w-2 h-2 rounded-full mr-2 ${ item.type === 'event' ? 'bg-blue-500' : 'bg-green-500' }` }></span>
                            <span className="font-medium">{ item.title }</span>
                            <p className="text-sm text-gray-600">
                                { format( item.deadline, 'MMM d, yyyy h:mm a' ) }
                            </p>
                            { item.type === 'todo' && (
                                <p className="text-sm text-gray-600">
                                    Priority: { item.priority }
                                </p>
                            ) }
                        </li>
                    ) ) }
                </ul>
            </div>
        );
    };
*/

export default PlannerPage;

/*  { plannerLogSchema && utils.val.isObject( plannerLogSchema ) && (
        <Form
            debug={ true }
            showViewport={ true }
            // viewportOverride={}
            // formModel={ initialData }
            formModel={ plannerLogSchema }
            initialData={ initialData }
            onSubmit={ ( values ) => {
                handleSubmit( values );
            } }
            layout={ `block` }
            viewportLayout={ `column` }
            data={ initialData }
            setData={ ( e ) => { } }
            // onChange={ ( e ) => {
            //     handleInputChange( e );
            // } }
            styles={ '' }
            classes={ "" }
        />
    ) }
    
    { false && plannerLogSchema && utils.val.isObject( plannerLogSchema ) && (
        <DynamicForm
            // schema={ logSchema }
            data={ allData }
            schema={ plannerLogSchema }
            initialData={ initialData }
            onSubmit={ handleSubmit }
            useSlidersForNumbers={ true }
        />
    ) }
*/
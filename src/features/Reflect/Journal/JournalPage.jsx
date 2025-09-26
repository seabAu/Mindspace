import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react';

import {
    ArrowBigLeft,
    Calendar1Icon,
    CalendarPlus2Icon,
    CalendarPlusIcon,
    Edit,
    EllipsisIcon,
    LucideLayoutGrid,
    Plus,
    PlusCircleIcon,
    RefreshCcw,
    TimerReset,
} from 'lucide-react';
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
import { isSameDay } from '@/lib/utilities/time';
import {
    CONTENT_HEADER_HEIGHT,
    HEADER_TRIGGER_DROPDOWN_WIDTH_LG,
    HEADER_TRIGGER_DROPDOWN_WIDTH_MD,
    HEADER_TRIGGER_DROPDOWN_WIDTH_XL,
    ROUTES_PLANNER,
    ROUTES_JOURNAL_PAGE,
    ROUTES_PLANNER_PAGE_LOG_SUBPAGE,
    ROUTES_PLANNER_LOGS,
} from '@/lib/config/constants';
import { buildButtonGroup, buttonListToSchema } from '@/lib/utilities/nav';
import Droplist from '@/components/Droplist';
import { DateTimeLocal } from '@/lib/config/types';
import Form from '@/components/Form';
import Content from '@/components/Page/Content';
import {
    Route,
    Routes,
    useLocation,
    useNavigate,
    useSearchParams,
} from 'react-router-dom';
import { initializeFormModel } from '@/lib/utilities/input';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { convertCamelCaseToSentenceCase } from '@/lib/utilities/string';
import {
    ScrollArea,
    ScrollAreaCorner,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
} from '@radix-ui/react-scroll-area';
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
import { TimePage } from '../../../pages/Dashboard/Pomodoro/TimePage';
import PlannerList from '@/features/Planner/blocks/Planner/PlannerList';
import PlannerDetail from '@/features/Planner/blocks/Planner/PlannerDetail';
import PlannerCreate from '@/features/Planner/blocks/Planner/PlannerCreate';
import { FaTimeline } from 'react-icons/fa6';
import { AiTwotoneCalendar } from 'react-icons/ai';
import {
    BsCalendar3Event,
    BsCalendar3EventFill,
    BsCalendarEvent,
} from 'react-icons/bs';
import { LogCalendarView } from '@/features/Reflect/Journal/views/LogCalendar/LogCalendarView';
import LogSchemaView from '@/features/Reflect/Journal/views/LogSchemaView';
import { isToday } from 'date-fns';
import LogNotesDrawer from '@/features/Reflect/Journal/blocks/LogNotesDrawer/LogNotesDrawer';
import useReflect from '@/lib/hooks/useReflect';
import useReflectStore from '@/store/reflect.store';
import ReflectDialogWrapper from './blocks/LogDialog/ReflectDialogWrapper';

// import usePlannerApi from './usePlannerApi';
// import FormGenerator from './FormGenerator'; // Our modular form component

const JournalPage = ( props ) => {
    const { view = '', children, classNames = '' } = props;

    const {
        // Debug state
        debug, setDebug,

        // Fetch requests state
        requestFetchData, setRequestFetchData,
        requestFetchUser, setRequestFetchUser,

        // Data state
        data, setData,
        getData,
        schemas,
        getSchema,
        user, setUser,
        userLoggedIn, setUserLoggedIn,
        userToken, setUserToken, settingsDialogOpen, setSettingsDialogOpen,
        theme, setTheme,
        dashboardActive, setDashboardActive,
        openSidebarPrimary, setOpenSidebarPrimary,
        sidebarContentPrimary, setSidebarContentPrimary,
        openSidebarSecondary, setOpenSidebarSecondary,
        sidebarContentSecondary, setSidebarContentSecondary,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    const {
        requestFetchLogs, setRequestFetchLogs,
        logsData, setLogsData,
        selectedLog, setSelectedLog,
        selectedDate, setSelectedDate,
        addLog: addLogData,
        updateLog: updateLogData,
        deleteLog: deleteLogData,
        sortLogs,
        getLogById,
        getLogByDate,
        notesOpen, setNotesOpen, notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
    } = useReflectStore();

    const {
        // VARIABLES
        initialLogData,

        // HANDLER FUNCTIONS
        // >> enerci
        // >> Generic handlers
        handleCreateStart,
        handleCreateSubmit,
        handleEditStart,
        handleEditSubmit,
        handleDeleteStart,
        handleDeleteSubmit,

        // >> Logs handlers
        handleFetchLogById,
        handleFetchLogs,
        handleCloneLog,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,

        // DIALOG MENUS
        buildDialog,

        // INITIALIZERS
        initializeEvent,

        // GETTERS / SETTERS
        logSchema, setLogSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        isNotesSidebarOpen, setIsNotesSidebarOpen,
    } = useReflect();
    let [ searchParams, setSearchParams ] = useSearchParams();

    const location = useLocation();
    const { hash, pathname, search } = location;
    let allData = getData();

    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'journal' ) + 1 ];
    console.log( 'JournalPage :: pathname = ', endpoint );

    // useEffect( () => {
    //     // Load schema on component mount.
    //     handleGetSchemas();
    // }, [ schemas ] );

    useEffect( () => {
        if ( !logSchema ) setLogSchema( getSchema( 'log' ) );
    }, [] );

    const handleGetViewType = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_JOURNAL_PAGE );
        if ( !t || t === '' ) {
            return endpoint ?? 'logs';
        }
        return t;
    };

    const [ viewType, setViewType ] = useState( endpoint ?? handleGetViewType() ); // AGENDA | DAY | WEEK | MONTH | YEAR | 5-YEAR | CUSTOM

    useEffect( () => {
        setViewType( endpoint );
    }, [ endpoint ] );

    useEffect( () => {
        console.log(
            'JournalPage :: selectedLog changed :: selectedLog = ',
            selectedLog,
        );
    }, [ selectedLog ] );

    const handleSetViewType = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage.
        setViewType( t );
        // navigate( t );
        localStorage.setItem( ROUTES_JOURNAL_PAGE, t );
    };

    return (
        <Content.Container
            className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-1 gap-0 mx-auto my-auto max-w-full flex flex-col bg-background min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden m-1` }
            centered={ false }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT - 2.5 ) }rem` } }
        >
            <Content.Header className={ `flex flex-row justify-start items-center w-full rounded-[${ 0.25 }rem] h-8 max-h-8 border` }>
                {/* Nav buttons */ }
                <div className={ `new-task-button w-auto h-auto flex-nowrap inline-flex p-0 m-0 gap-0 items-center justify-center self-center` }>
                    {/* Button to add new log */ }
                    <Button
                        variant={ 'ghost' }
                        size={ 'sm' }
                        className={ `rounded-l-full !h-7 self-center justify-center items-center border` }
                        onClick={ () => {
                            handleCreateStart(
                                {
                                    userId: user?.id,
                                    workspaceId: workspaceId,
                                    date: new Date(
                                        Date.now(),
                                    ).toLocaleDateString(),
                                    // TODO :: Create a custom format string in settings for the logs dashboard.
                                    title: `Log Entry for (${ new Date(
                                        Date.now(),
                                    ).toLocaleDateString() })`,
                                },
                                'log',
                            );
                        } }>
                        <Plus className={ `p-0 m-0 h-full !size-5` } />
                        <h6
                            className={ `text-center self-center object-center leading-relaxed select-none p-0 text-xs capitalize w-auto` }>
                            { `New Log for (${ new Date(
                                Date.now(),
                            ).toLocaleDateString() })` }
                        </h6>
                    </Button>

                    <Button
                        size={ 'sm' }
                        variant={ 'ghost' }
                        className={ `!px-2 !py-1 !h-7 focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center rounded-r-full self-center border` }
                        onClick={ () => {
                            handleFetchLogs();
                        } }>
                        <RefreshCcw
                            className={ `p-0 m-0 size-8 hover:animate-rotate transition-all` }
                        />
                    </Button>
                </div>

                <ButtonGroup
                    parentRoute={ `./journal` }
                    containerClassNames={ `mx-4 my-4 !hover:bg-transparent !border-transparent` }
                    dropdownMenuClassNames={ `bg-transparent hover:bg-transparent !p-0 m-0` }
                    dropdownTriggerClassNames={ `` }
                    dropdownContentClassNames={ `` }
                    buttonClassNames={ `!h-full` }
                    // buttons={ plannerBtns }
                    buttons={ buttonListToSchema(
                        ROUTES_PLANNER_LOGS,
                        viewType,
                        ( value ) => {
                            handleSetViewType( value );
                        },
                    ) }
                    activeValue={ viewType }
                    setActiveValue={ setViewType }
                    dropdownTriggerIcon={ <LucideLayoutGrid /> }
                    responsiveMode={ 'dropdown' }
                    responsiveBreakpoint={ 980 }
                />
            </Content.Header>

            <div className={ `relative content-body-container !w-full !min-w-full !max-w-full !h-[87.5%] !max-h-[87.5%] !min-h-[87.5%] ${ classNames } !overflow-auto` }>
                <Content.Body
                    className={ twMerge(
                        `relative flex flex-col gap-2 h-full w-full max-w-full`,
                        'p-0 px-1',
                        `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))]`,
                    ) }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem` } }
                    centered={ false }>
                    <ScrollArea
                        className={ `task-interface-container !w-full !max-w-full !min-h-full !h-full !max-h-full !px-0 mb-0 gap-0 ` }>
                        <ScrollAreaViewport
                        /* className={ twMerge(
                            `w-full max-w-full !min-h-full !h-full !max-h-full`,
                            `border-[0.125rem] border-solid rounded-lg flex flex-grow justify-start items-start h-full w-full max-w-full min-w-full`,
                            `m-0 gap-0 !px-2 !py-2`,
                            `overflow-y-auto overflow-x-auto`,
                        ) } */
                        >
                            {/* Actual content area */ }
                            <Routes>
                                <Route
                                    path={ '' }
                                    element={
                                        <JournalHome>
                                            { utils.val.isValidArray( logsData, true )
                                                ? (
                                                    logsData?.find( ( l, i ) =>
                                                        isToday( new Date( l?.date ) ),
                                                    ) ? (
                                                        <LogDetail
                                                            logOverride={ logsData?.find(
                                                                ( l, i ) =>
                                                                    isToday(
                                                                        new Date(
                                                                            l?.date,
                                                                        ),
                                                                    ),
                                                            ) }
                                                            editingMode={ false }
                                                            logSchema={ logSchema }
                                                            logsData={ logsData }
                                                            setLogsData={ setLogsData }
                                                            { ...props }
                                                        />
                                                    ) : (
                                                        <LogList
                                                            parentPath={ `/dash/reflect/journal` }
                                                            logs={ logsData }
                                                            { ...props }
                                                        />
                                                    )
                                                )
                                                : (
                                                    <LogCreate
                                                        logSchema={ logSchema }
                                                        logDate={
                                                            new Date( Date.now() )
                                                        }
                                                        { ...props }
                                                    />
                                                )
                                            }
                                        </JournalHome>
                                    }
                                />

                                <Route
                                    path={ 'dailylog' }
                                    element={
                                        <LogCreate
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ logSchema }
                                            logDate={ new Date( Date.now() ) }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'new' }
                                    element={
                                        <LogCreate
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ logSchema }
                                            logDate={ selectedDate ?? new Date() }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ `:id` }
                                    element={
                                        <LogDetail
                                            parentPath={ `/dash/reflect/journal` }
                                            editingMode={ false }
                                            logSchema={ logSchema }
                                            schemas={ schemas }
                                            logsData={ logsData }
                                            setLogsData={ setLogsData }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ `:id/detail` }
                                    element={
                                        <LogDetail
                                            parentPath={ `/dash/reflect/journal` }
                                            editingMode={ false }
                                            logsData={ logsData }
                                            setLogsData={ setLogsData }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ `:id/edit` }
                                    element={
                                        <LogDetail
                                            parentPath={ `/dash/reflect/journal` }
                                            editingMode={ true }
                                            logSchema={ logSchema }
                                            schemas={ schemas }
                                            logsData={ logsData }
                                            setLogsData={ setLogsData }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'list' }
                                    element={
                                        <LogList
                                            parentPath={ `/dash/reflect/journal` }
                                            logs={ logsData }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ 'schema' }
                                    element={
                                        <LogSchemaView
                                            parentPath={ `/dash/reflect/journal` }
                                            logSchema={ logSchema }
                                            schemas={ schemas }
                                            { ...props }
                                        />
                                    }
                                />

                                <Route
                                    path={ `calendar` }
                                    element={
                                        <LogCalendarView
                                            items={ logsData }
                                            onAddItem={ handleCreateLog }
                                            onUpdateItem={ handleUpdateLog }
                                            onDeleteItem={ handleDeleteLog }
                                            selectedLog={ selectedLog }
                                            tags={ [] }
                                            { ...props }
                                        />
                                    }
                                />
                            </Routes>
                        </ScrollAreaViewport>
                    </ScrollArea>
                </Content.Body>
            </div>

            {/* <Content.Footer className={ `flex flex-shrink !h-8 rounded-[${ 0.25 }rem]` }>
                { eventsData ? JSON.stringify( JSON.parse( eventsData.length.toString() ), null, '\t' ) : '' }
            </Content.Footer> */}

            <ReflectDialogWrapper />

            {/* { dialogType === 'add' && (
                <PlannerDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, dialogDataType ?? 'log' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}

            {/* Edit Dialog */ }
            {/* { dialogType === 'edit' && (
                <PlannerDialog
                    data={ selectedLog }
                    refData={ allData }
                    setData={ setDialogData } // { setSelectedEvent }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, dialogDataType ?? 'log' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}

            {/* Open Dialog */ }
            {/* { open === true && (
                <PlannerDialog
                    data={ selectedLog ?? selected }
                    refData={ allData }
                    setData={ setSelectedLog }
                    dataSchema={ getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'view' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'view' ) }
                    // handleSubmit={ handleCancel }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'view' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) } */}

            {
                <LogNotesDrawer
                    isOpen={ notesOpen }
                    onOpen={ () => {
                        setNotesContent( selectedLog );
                        setNotesOpen( true );
                    } }
                    onClose={ () => {
                        setNotesContent( null );
                        setNotesOpen( false );
                    } }
                    log={ selectedLog?.content }
                    // log={ selectedLog }
                    setLog={ ( t ) => {
                        setNotesContent( t );
                    } }
                    // setLog={ ( t ) => { setSelectedLog( t ); } }
                    onDeleteNotes={ ( notes ) => {
                        // if ( handleUpdateLog ) handleUpdateLog( { ...notesContent, notes: [ '' ] } );
                        if ( handleUpdateLog )
                            handleUpdateLog( { ...selectedLog, notes: [ '' ] } );
                    } }
                    onUpdateNotes={ ( notes ) => {
                        // let t = { ...notesContent, notes: notes };
                        // if ( handleUpdateLog ) handleUpdateLog( { ...notesContent, notes: notes } );
                        if ( handleUpdateLog )
                            handleUpdateLog( { ...selectedLog, notes: notes } );
                    } }
                />
            }

        </Content.Container>
    );
};

export const JournalHome = ( props ) => {
    const { title, children } = props;
    return (
        <div className={ `` }>
            { title !== '' && <div className={ `` }>{ title }</div> }
            { children }
        </div>
    );
};

export default JournalPage;

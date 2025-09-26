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
    Edit,
    EllipsisIcon,
    LucideLayoutGrid,
    Plus,
    PlusCircleIcon,
    RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import * as utils from 'akashatools';
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
    ROUTES_PLANNER_LOGS,
    ROUTES_PLANNER_PAGE,
    ROUTES_PLANNER_PAGE_LOG_SUBPAGE,
} from '@/lib/config/constants';
import { buildButtonGroup, buttonListToSchema } from '@/lib/utilities/nav';
import Droplist from '@/components/Droplist';
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
import LogDetail from '@/features/Reflect/Journal/views/LogDetail';
import LogCreate from '@/features/Reflect/Journal/views/LogCreate';
import LogList from '@/features/Reflect/Journal/views/LogList';
import LogSchemaView from '@/features/Reflect/Journal/views/LogSchemaView';
import { Spinner } from '@/components/Loader/Spinner';
import Container from '@/components/Page/Container';
import { twMerge } from 'tailwind-merge';
import PlannerDialog from '@/features/Planner/components/dialog/PlannerDialog';
import { isToday } from 'date-fns';
import { LogCalendarView } from './LogCalendar/LogCalendarView';
import useReflectStore from '@/store/reflect.store';
import useReflect from '@/lib/hooks/useReflect';
import ReflectDialog from '../blocks/LogDialog/ReflectDialog';
import ReflectDialogWrapper from '../blocks/LogDialog/ReflectDialogWrapper';

// const { default: LogSchemaView } = require( "./LogSchemaView" );

const LogView = ( props ) => {
    const {
        parentPath = '/dash/planner/logs',
        baseUrl,
        title,
        classNames = '',
        mode = 'single',
        selected,
        onSelect,
        // isLoading = false,
        initialDataAutofillRandom = false,
        useSlidersForNumbers = true,
        useSwitchesForBoolean = true,
        width = 100,
        height = 100,
        showDropdown,
    } = props;

    const {
        debug, setDebug,
        data,
        getData, setData,
        schemas,
        // setSchemas,
        // getSchemas,
        user, setUser,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    const {
        requestFetchEvents, setRequestFetchEvents,
        requestFetchLogs, setRequestFetchLogs,
        requestFetchCalendars, setRequestFetchCalendars,
        plannerData, setPlannerData,
        eventsData, setEventsData,
        selectedEvent, setSelectedEvent,
        logsData, setLogsData,
        selectedLog, setSelectedLog,
        calendarsData, setCalendarsData,
        selectedDate, setSelectedDate,
    } = useReflectStore();

    const {
        // VARIABLES
        conversionEventSchema,
        initialLogData,
        handleGetSchemas,
        getSchemaForDataType,

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

        handleFetchLogById,
        handleFetchLogs,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,

        // DIALOG MENUS
        buildEventDialog,
        buildGoToDialog,
        buildDialog,

        // GETTERS / SETTERS
        logSchema, setLogSchema,
        dialogDataType, setDialogDataType,
        showGotoDialog, setShowGotoDialog,
        dialogType, setDialogType,
        dialogData, setDialogData,
        dialogDataSchema, setDialogDataSchema,
        selectedData, setSelectedData,
        dialogInitialData, setDialogInitialData,
    } = useReflect();


    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'logs' ) + 1 ];

    useEffect( () => {
        console.log(
            'PlannerPage :: plannerLogSchema :: schemas updated :: schemas = ',
            schemas,
            ' :: ',
            'schemas?.app?.planner?.log = ',
            schemas?.app?.planner?.log,
        );
        if (
            schemas &&
            schemas?.app &&
            schemas?.app?.planner &&
            schemas?.app?.planner?.log
        ) {
            setLogSchema( schemas?.app?.planner?.log );
            // setPlannerLogSchema( schemas?.app?.planner?.log );
        }
    }, [ schemas ] );
    let allData = getData();

    const handleGetViewSubType = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_PLANNER_PAGE_LOG_SUBPAGE );
        if ( !t || t === '' ) {
            return endpoint;
        }
        return endpoint;
    };

    const [ subpageView, setSubpageView ] = useState( handleGetViewSubType() );
    const handleSetSubpageView = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage.
        setSubpageView( t );
        localStorage.setItem( ROUTES_PLANNER_PAGE_LOG_SUBPAGE, t );
    };

    return (
        <Content.Container
            className={ `!h-full !w-full !min-w-full !max-w-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-0 gap-0 mx-auto my-auto max-w-full ` }
            centered={ false }>
            <div
                className={ `h-full w-full max-w-full self-center justify-center items-center !overflow-auto flex flex-row` }>
                {/* Button to add new log */ }
                <Button
                    variant={ 'outline' }
                    size={ 'sm' }
                    className={ `rounded-full !px-2 !py-1 !h-8 self-center justify-center items-center ` }
                    onClick={ () => {
                        handleCreateStart(
                            {
                                userId: user?.id,
                                workspaceId: workspaceId,
                                date: new Date( Date.now() ).toLocaleDateString(),
                                // TODO :: Create a custom format string in settings for the logs dashboard.
                                title: `Log Entry for (${ new Date(
                                    Date.now(),
                                ).toLocaleDateString() })`,
                            },
                            'log',
                        );
                    } }>
                    <PlusCircleIcon className={ `p-0 m-0 h-full !size-6` } />
                    <h6
                        className={ `text-center object-center leading-relaxed w-full text-base` }>
                        { `New Log for (${ new Date(
                            Date.now(),
                        ).toLocaleDateString() })` }
                    </h6>
                </Button>

                <ButtonGroup
                    parentRoute={ `./logs` }
                    containerClassNames={ `overflow-x-auto` }
                    dropdownMenuClassNames={ `w-full bg-transparent p-1 m-0` }
                    dropdownTriggerClassNames={ `w-full ` }
                    dropdownContentClassNames={ `!w-full ` }
                    buttons={ buttonListToSchema(
                        ROUTES_PLANNER_LOGS,
                        subpageView,
                        handleSetSubpageView,
                    ) }
                    // buttons={ ROUTES_PLANNER_LOGS.map( ( item ) => ( {
                    //     title: ( item.label ? convertCamelCaseToSentenceCase( item.label ) : 'N/A' ),
                    //     value: item.label,
                    //     active: subpageView === this?.value,
                    //     link: item.value,
                    //     onClick: () => handleSetSubpageView( item.value ),
                    // } ) ) }
                    responsiveMode={ 'dropdown' }
                    responsiveBreakpoint={ 768 }
                    activeValue={ subpageView }
                    setActiveValue={ setSubpageView }
                    dropdownTriggerIcon={ <LucideLayoutGrid /> }
                />
            </div>

            <div
                className={ `relative content-body-container !w-full !min-w-full !max-w-full !h-[90%] !max-h-[90%] !min-h-[90%] ${ classNames } !overflow-auto` }>
                <Content.Body
                    className={ twMerge(
                        `relative flex flex-col gap-2 h-full w-full max-w-full px-1`,
                        'bg-background p-0',
                        `overflow-y-auto overflow-x-auto !h-auto !w-full`,
                    ) }
                    centered={ false }>
                    <Routes>
                        <Route
                            path={ '' }
                            element={
                                <LogHome>
                                    { utils.val.isValidArray( logsData, true ) &&
                                        logsData?.find( ( l, i ) =>
                                            isToday( new Date( l?.date ) ),
                                        ) ? (
                                        <LogDetail
                                            logOverride={ logsData?.find(
                                                ( l, i ) =>
                                                    isToday( new Date( l?.date ) ),
                                            ) }
                                            editingMode={ false }
                                            logSchema={ logSchema }
                                            logsData={ logsData }
                                            setLogsData={ setLogsData }
                                        />
                                    ) : (
                                        <LogCreate
                                            logSchema={ logSchema }
                                            logDate={ new Date( Date.now() ) }
                                        />
                                    ) }
                                </LogHome>
                            }
                        />

                        <Route
                            path={ 'dailyLog' }
                            element={
                                <LogCreate
                                    logSchema={ logSchema }
                                    logDate={ new Date( Date.now() ) }
                                />
                            }
                        />

                        <Route
                            path={ 'new' }
                            element={ <LogCreate logSchema={ logSchema } /> }
                        />

                        {/* <Route path={ 'list/*' }> */ }

                        <Route
                            path={ 'list' }
                            element={
                                <LogList
                                    logs={ logsData }
                                    logSchema={ logSchema }
                                    schemas={ schemas }
                                    classNames={ `` }
                                />
                            }
                        />

                        <Route
                            path={ `:id` }
                            element={
                                <LogDetail
                                    editingMode={ false }
                                    logSchema={ logSchema }
                                    logsData={ logsData }
                                    setLogsData={ setLogsData }
                                />
                            }
                        />

                        <Route
                            path={ `:id/detail` }
                            element={
                                <LogDetail
                                    editingMode={ false }
                                    logSchema={ logSchema }
                                    logsData={ logsData }
                                    setLogsData={ setLogsData }
                                />
                            }
                        />

                        <Route
                            path={ `:id/edit` }
                            element={
                                <LogDetail
                                    editingMode={ true }
                                    logSchema={ logSchema }
                                    logsData={ logsData }
                                    setLogsData={ setLogsData }
                                />
                            }
                        />
                        {/* </Route> */ }

                        <Route
                            path={ 'schema' }
                            element={
                                <LogSchemaView
                                    logSchema={ logSchema }
                                    schemas={ schemas }
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
                                    tags={ [] }
                                />
                            }
                        />
                    </Routes>
                </Content.Body>
            </div>

            <ReflectDialogWrapper />

            {/* Create Dialog */ }
            {/* { dialogType === 'add' && dialogDataType !== 'none' && (
                <PlannerDialog
                    refData={ allData }
                    data={ dialogData ?? initialLogData }
                    setData={ setDialogData }
                    dataSchema={ getSchema( 'log' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateLog( data ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ dialogDataType ?? 'log' }
                    debug={ debug }
                />
            ) } */}

            {/* Edit Dialog */ }
            {/* { dialogType === 'edit' && dialogDataType !== 'none' && (
                <PlannerDialog
                    refData={ allData }
                    data={ dialogData ?? selectedLog }
                    setData={ setDialogData }
                    dataSchema={ getSchema( 'log' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleUpdateLog( selectedLog?._id, data ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType ?? 'log' }
                    debug={ debug }
                />
            ) } */}
        </Content.Container>
    );
};

export const LogHome = ( props ) => {
    const { title, children } = props;
    return (
        <div className={ `p-0 w-full h-full` }>
            { title !== '' && <div className={ `` }>{ title }</div> }
            { children }
        </div>
    );
};

export default LogView;

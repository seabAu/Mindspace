import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsPageView from '@/features/Reflect/Stats/views/StatsPageView';
import useReflect from '@/lib/hooks/useReflect';
import * as utils from 'akashatools';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CONTENT_HEADER_HEIGHT, ROUTES_REFLECT, ROUTES_REFLECT_PAGE } from '@/lib/config/constants';
import HabitDashboard from '@/features/Reflect/Habit/views/HabitDashboard';
import JournalPage from '../../../features/Reflect/Journal/JournalPage';
import Content from '@/components/Page/Content';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { buttonListToSchema } from '@/lib/utilities/nav';
import { LucideLayoutGrid, RefreshCcw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ReflectProvider } from '@/features/Reflect/context/ReflectProvider';
import { Button } from '@/components/ui/button';
import useGlobalStore from '@/store/global.store';
import useReflectStore from '@/store/reflect.store';

const ReflectPage = ( {
    useRefresh = true,
    entries, setEntries,
    date, setData,
    logData, setLogData,
    timeInterval,
    columnNames = [],
    columnRelations = [], // Key-name pairs to match columns to database field names. 
}, props ) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pathname } = location;
    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'notes' ) + 1 ];

    const { workspaceId, user } = useGlobalStore();
    const { logsData, setLogsData } = useReflectStore();
    const {
        initialLogData,
        buildDialog,
        handleGetSchemas,
        getSchemaForDataType,

        // >> Stats handlers
        handleFetchAllStats,

        // >> Habits handlers
        handleFetchAllHabits,

        // >> Logs handlers
        handleFetchLogById,
        handleFetchLogs,
        handleCloneLog,
        handleCreateLog,
        handleUpdateLog,
        handleDeleteLog,
        handleFetchReflectData,
        handleInitializeReflectData,

    } = useReflect();

    // Navigation handling
    // TODO :: Make this into a modular component that accepts a button list, a endpoint to begin from, and an optional onClick event handler. 


    const handleGetView = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_REFLECT_PAGE );
        if ( !t || t === '' ) { return endpoint ?? 'dash'; }
        return t;
    };

    const [ view, setView ] = useState( handleGetView() ?? endpoint );

    const handleSetView = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        setView( t );
        localStorage.setItem( ROUTES_REFLECT_PAGE, t );
    };

    useEffect( () => {
        setView( endpoint );
    }, [ endpoint ] );

    const buttonClassNames = `px-2 py-1 rounded-lg items-center justify-center outline-none focus-within:outline-none focus-visible:outline-none focus:outline-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`;

    useEffect( () => {
        // Stats Data for Reflections
        handleInitializeReflectData();
    }, [] );

    useEffect( () => {
        // Stats Data for Reflections
        handleFetchReflectData();
    }, [ workspaceId ] );

    useEffect( () => {
        if ( !utils.val.isValidArray( logsData, true ) ) {
            // setRequestFetchLogs( true );
            handleFetchLogs();
        }
    }, [ logsData ] );

    const buildPage = () => {
        // Build a key-value list-sheet style UI. each line have editable
        // key and value fields.
    };

    return (
        <ReflectProvider>
            <Content.Container
            // className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-0 gap-0 mx-auto my-auto max-w-full flex flex-col bg-background min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden m-1 p-2` } 
            // centered={ false }
            // style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 2.5 ) }rem` } }
            >
                <Content.Header className={ `flex flex-row justify-start items-center w-full max-h-8 space-x-2` }>

                    <div className={ `flex flex-grow w-full flex-row h-8 justify-between items-center gap-2` }>
                        <div className={ `flex flex-row flex-shrink items-center justify-between w-min` }>
                            { useRefresh === true && (
                                <Button
                                    size={ 'xs' }
                                    variant={ 'outline' }
                                    className={ `px-2 py-1 m-0 focus:outline-none !h-7 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-r-full self-center ${ buttonClassNames }` }
                                    onClick={ () => {
                                        handleFetchLogs();
                                        handleFetchAllHabits();
                                        handleFetchAllStats();
                                    } }
                                >
                                    <RefreshCcw className={ `p-0 m-0 size-8 hover:animate-rotate transition-all` } />
                                </Button>
                            ) }
                        </div>

                        <div className={ `flex flex-row flex-grow items-center justify-center px-4 border rounded-md max-h-8` }>
                            <ButtonGroup
                                parentRoute={ `/dash/reflect` }
                                containerClassNames={ `!hover:bg-transparent !border-transparent !p-1` }
                                dropdownMenuClassNames={ `bg-transparent hover:bg-transparent !p-0 m-0` }
                                dropdownTriggerClassNames={ `` }
                                dropdownContentClassNames={ `` }
                                buttonClassNames={ `!h-full` }
                                // buttons={ plannerBtns }
                                buttons={ buttonListToSchema(
                                    ROUTES_REFLECT,
                                    view,
                                    handleSetView,
                                ) }
                                activeValue={ view }
                                setActiveValue={ setView }
                                dropdownTriggerIcon={ <LucideLayoutGrid /> }
                                responsiveMode={ 'dropdown' }
                                responsiveBreakpoint={ 480 }
                            />
                        </div>
                    </div>
                </Content.Header>


                <Routes>
                    <Route path={ `dash/*` } element={ <StatsPageView /> } />
                    <Route path={ `stats/*` } element={ <StatsPageView /> } />
                    <Route path={ `habits/*` } element={ <HabitDashboard /> } />
                    <Route path={ `insights/*` } element={ <HabitDashboard /> } />
                    <Route path={ `journal/*` } element={ <JournalPage /> } />

                    {/* <Route
                        path={ `habits/*` }
                        element={
                            <HabitDashboard
                                width={ 100 }
                                height={ 100 }
                                { ...props }
                            />
                        }
                    >
                        <Route path={ '' } element={ <HabitList /> } />
                        <Route path={ 'list' } element={ <HabitList /> } />
                        <Route path={ 'new' } element={ <HabitCreate /> } />
                        <Route path={ ':id' } element={ <HabitDetail /> } />
                        <Route path={ 'calendar' } element={ <HabitCalendarView /> } />
                    </Route> */}
                </Routes>
            </Content.Container>
        </ReflectProvider>
    );
};

export default ReflectPage


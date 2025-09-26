import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import usePlannerStore from "@/store/planner.store";
import { isSameDay } from "date-fns";
import { EventsAndTasksWidget } from "@/features/Dashboard/blocks/widgets/EventsAndTasks";
import { RemindersWidget } from "@/features/Dashboard/blocks/widgets/Reminders";
import { GoalsWidget } from "@/features/Dashboard/blocks/widgets/Goals";
import { NotepadWidget } from "@/features/Dashboard/blocks/widgets/Notepad";
import { DailyLogForm } from "@/features/Reflect/Journal/blocks/DailyLogForm/DailyLogForm";
import * as utils from 'akashatools';
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import { produce } from "immer";
import { getPrettyDate } from "@/lib/utilities/time";
import useGlobalStore from "@/store/global.store";
import { typeToInitialDefault } from "@/lib/utilities/input";
import usePlanner from "@/lib/hooks/usePlanner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

// Data updated to use HTML instead of Markdown for rich text fields
export default function DashboardPage () {
    const {
        logsData,
        // selectedDate, setSelectedDate,
        getLogByDate,
        updateLog,
    } = usePlannerStore();

    const {
        handleCreateLog,
        handleCreateSubmit,
        handleUpdateLog,
        handleEditSubmit,
    } = usePlanner();

    const user = useGlobalStore( state => state.user );
    const getSchema = useGlobalStore( state => state.getSchema );
    const workspaceId = useGlobalStore( state => state.workspaceId );

    const [ selectedDate, setSelectedDate ] = useState( new Date() );

    const initLogForDate = ( date ) => {
        const prettyDate = getPrettyDate( new Date( date || Date.now() ) );
        let dateLog = {
            workspaceId: workspaceId,
            userId: user?.id || null,
            date: new Date( date || Date.now() ),
            title: `New log for ${ prettyDate }`,
            summary: "",
            content: "",
            notes: "",
            description: "",
            tokens: [ "logs" ],
            timeBlocks: [
                {
                    name: "",
                    startTime: "10:00",
                    endTime: "11:00",
                    color: "#ffffff",
                    notes: ""
                },
            ],
            morningGoals: "",
            eveningReflection: "",
            gratitude: [ "" ],
            challenges: [ "" ],
            mood: "None",
            customMood: "",
            tags: [ "daily log" ],
            achievements: [ {
                description: "",
                completed: false
            } ],
            plansForTomorrow: "",
            weather: {
                temperature: 75,
                humidity: 0,
                condition: "",
                other: ""
            },
            wellness: {
                stepsTaken: 0,
                hoursSlept: 0.0,
                waterIntake: 0,
                numOfTabs: 0,
                weight: 0.0,
                tookVitamins: false,
                tookMeds: false,
                effectIntensityOverall: 0,
                effects: [
                    {
                        effectType: "",
                        effectStartTime: "",
                        effectEndTime: "",
                        effectIntensity: 0,
                        notes: "",
                    },
                ],
            },
            attachments: [ { fileUrl: "", description: "" } ],
        };

        console.log( "Log initialized for date: ", date, " :: ", "log = ", dateLog );
        return ( dateLog );
    };

    const initializeLogForDate = ( initialData = null ) => {
        // Create initial data.
        let schema = getSchema( 'log' );
        if ( !schema ) return initialData;

        let initializedData = {};
        Object.keys( schema ).forEach( ( fieldSchemaKey ) => {
            const fieldSchema = schema?.[ fieldSchemaKey ];
            let fieldInitialValue = null;
            if ( initialData && utils.val.isObject( initialData ) && initialData?.hasOwnProperty( fieldSchemaKey ) ) {
                fieldInitialValue = initialData?.[ fieldSchemaKey ];
            }

            if ( fieldSchema ) {
                initializedData[ fieldSchemaKey ] = typeToInitialDefault(
                    fieldSchema?.type,
                    fieldInitialValue ?? null,
                    true
                );
            }
        } );

        if ( schema ) {
            // Add essential fields we already have values for.
            if ( schema?.hasOwnProperty( 'user' ) ) { initializedData[ 'user' ] = user; }
            if ( schema?.hasOwnProperty( 'userId' ) ) { initializedData[ 'userId' ] = user?.id; }
            if ( schema?.hasOwnProperty( 'workspaceId' ) ) { initializedData[ 'workspaceId' ] = workspaceId; }
        }

        console.log( "DashboardHome :: Log initialized for date :: schema = ", schema, " :: ", "initializedData = ", initializedData );
        return initializedData;
    };

    const initialLogData = useMemo( () => {
        let log;
        if ( utils.val.isValidArray( logsData, true ) ) {
            log = logsData?.find( ( log ) => (
                isSameDay(
                    new Date( log?.date ),
                    new Date(
                        selectedDate
                            ? selectedDate
                            : Date.now()
                    ).toISOString().split( "T" )[ 0 ]
                )
            ) );

            if ( log ) { return log; }
            else { return initLogForDate( new Date( selectedDate ) ); }
        }

        return log;
    }, [ selectedDate, logsData ] );

    const [ logData, setLogData ] = useState( initialLogData );

    const handleDateChange = ( newDate ) => {
        // The selectedDate changed; update dashboard accordingly.
        if ( newDate ) {
            const dateKey = newDate.toISOString().split( "T" )[ 0 ];
            setSelectedDate( new Date( newDate ) /* newDate */ );

            let log = getLogByDate( new Date( dateKey ) );
            // Fetch and set the log for this date if it exists. 
            // if ( log ) {
            // updateLog( log?._id, { ...log, date: newDate } );
            const fullLogForDate = initLogForDate( new Date( newDate ) );
            setLogData(
                log || {
                    ...fullLogForDate,
                    // date: newDate,
                    date: new Date( newDate || Date.now() ),
                    workspaceId: workspaceId,
                    userId: user?.id || null,
                    title: `Daily Log for ${ getPrettyDate( newDate ) }`,
                } );
            // }
        }
    };

    const updateLogData = ( updater ) => {
        setLogData( produce( updater ) );
    };


    return (
        <div
            className={ `bg-background min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden m-1` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 2.5 ) }rem`,
            } }>
            {/* Desktop Layout */ }
            <div className={ `hidden lg:flex lg:flex-row w-full lg:flex-grow min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden p-0 space-b-2 px-2` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 2.5 ) }rem`,
                } }>
                <main className="w-2/3 flex flex-col !px-2">
                    {/* Agenda widgets - full left side */ }
                    <EventsAndTasksWidget
                        onDateChange={ handleDateChange }
                        selectedDate={ selectedDate || logData?.date /* ?? selectedDate */ }
                        timeBlocks={ logData?.timeBlocks || [] }
                    />
                </main>
                <aside className="w-1/3 flex flex-col !px-2">
                    {/* Other widgets - full right side */ }
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                        <RemindersWidget />
                        <GoalsWidget />
                        <NotepadWidget />
                        { selectedDate && logData && (
                            <DailyLogForm
                                date={ selectedDate }
                                data={ logData }
                                setData={ setLogData }
                                onUpdate={ ( name, value ) => ( setLogData( { ...logData, [ name ]: value } ) ) }
                                onSubmit={ ( data ) => {
                                    console.log( "Form is in edit mode; data = ", data );
                                    if ( data?.hasOwnProperty( '_id' ) && data?._id ) { handleEditSubmit( data, 'log' ); }
                                    else { handleCreateSubmit( data, 'log' ); }
                                } }
                            />
                        ) }
                    </div>
                </aside>
            </div>

            {/* Mobile & Tablet Layout */ }
            <div className="lg:hidden p-0 sm:p-0">
                <Tabs defaultValue="agenda" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="agenda">Agenda</TabsTrigger>
                        <TabsTrigger value="log">Log</TabsTrigger>
                        <TabsTrigger value="notes">Notepad</TabsTrigger>
                        <TabsTrigger value="trackers">Trackers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="agenda" className="gap-2 p-2">
                        {/* Agenda widgets */ }
                        <EventsAndTasksWidget
                            onDateChange={ handleDateChange }
                            selectedDate={ selectedDate || logData?.date /* ?? selectedDate */ }
                            timeBlocks={ logData?.timeBlocks || [] }
                        />
                    </TabsContent>
                    <TabsContent value="log" className="gap-2 p-2">
                        { selectedDate && logData && (
                            <DailyLogForm
                                date={ selectedDate }
                                data={ logData }
                                setData={ setLogData }
                                onUpdate={ ( name, value ) => ( setLogData( { ...logData, [ name ]: value } ) ) }
                                onSubmit={ ( data ) => {
                                    console.log( "Form is in edit mode; data = ", data );
                                    if ( data?.hasOwnProperty( '_id' ) && data?._id ) { handleEditSubmit( data, 'log' ); }
                                    else { handleCreateSubmit( data, 'log' ); }
                                } }
                            />
                        ) }
                    </TabsContent>
                    <TabsContent value="notes" className="gap-2 p-2">
                        <NotepadWidget />
                    </TabsContent>
                    <TabsContent value="trackers" className="gap-2 p-2">
                        <RemindersWidget />
                        <GoalsWidget />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}




/* 


    const initLogForDate = ( date ) => {
        let dateLog = {
            date: new Date( date || Date.now() ),
            title: "Fully Detailed Monday",
            summary: "<p>A comprehensive log of the day's <strong>activities</strong> and <em>metrics</em>.</p>",
            content: "<h3>Main Content</h3><p>Detailed notes about the project progress.</p>",
            notes:
                "<h3>Additional Notes</h3><ul><li>Remember to check the server logs tomorrow.</li><li>Follow up on the new design mockups.</li></ul>",
            description: "<p>A general description of the day.</p>",
            tokens: [ "#project-alpha", "#q3-report" ],
            timeBlocks: [
                { name: "Morning Focus", startTime: "09:30", endTime: "11:00", color: "#0ea5e9", notes: "Worked on the report." },
                { name: "Client Call Prep", startTime: "13:30", endTime: "14:00", color: "#f59e0b", notes: "Prepared slides." },
            ],
            morningGoals: "<ol><li>Finalize report</li><li>Sync with design team</li></ol>",
            eveningReflection: "<p>Felt very accomplished today. The focus blocks really helped.</p>",
            gratitude: [ "A sunny morning", "Helpful feedback from Sarah" ],
            challenges: [ "Distractions from construction noise" ],
            mood: "Fulfilled",
            customMood: "",
            tags: [ "work", "reporting", "focus" ],
            achievements: [ { description: "Q3 report finalized", completed: true } ],
            plansForTomorrow: "Start outlining the Q4 strategy document.",
            weather: { temperature: 72, humidity: 55, condition: "Sunny", other: "Slight breeze" },
            wellness: {
                stepsTaken: 8200,
                hoursSlept: 7.5,
                waterIntake: 2,
                numOfTabs: 12,
                weight: 180.5,
                tookVitamins: true,
                tookMeds: false,
                effectIntensityOverall: 7,
                effects: [
                    {
                        effectType: "Caffeine",
                        effectStartTime: "09:00",
                        effectEndTime: "13:00",
                        effectIntensity: 8,
                        notes: "Morning coffee",
                    },
                ],
            },
            attachments: [ { fileUrl: "/path/to/report.pdf", description: "Final Q3 Report" } ],
        };

        console.log( "Log initialized for date: ", date, " :: ", "log = ", dateLog );
        return ( dateLog );
    };


    import React, { useEffect, useState } from 'react';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { Button } from '@/components/ui/button';
    import * as utils from 'akashatools';
    
    import Dash from '@/components/Page/Dashboard/Dash';
    import useGlobalStore from '@/store/global.store';
    import { EllipsisIcon } from 'lucide-react';

    const DashboardHomePage = ( props ) => {

        const {
            view = '',
            children,
            maxWidth,
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

            // UI state
            theme,
            setTheme,
            openSidebar,
            setOpenSidebar,
            dashboardActive,
            setDashboardActive,
            openSidebarPrimary,
            setOpenSidebarPrimary,
            sidebarContentPrimary,
            setSidebarContentPrimary,
            openSidebarSecondary,
            setOpenSidebarSecondary,
            sidebarContentSecondary,
            setSidebarContentSecondary,
            requestFetchWorkspaces,
            setRequestFetchWorkspaces,
            // getWorkspaces,
            workspacesData,
            setWorkspacesData,
            activeWorkspace,
            setActiveWorkspace,
            workspaceId,
            setWorkspaceId,
            loading,
            setLoading,
            error,
            setError,
        } = useGlobalStore();


        // const [ selectedDate, setSelectedDate ] = useState( Date.now().toLocaleString() );
        const [ viewType, setViewType ] = useState( 'full' );
        const [ width, setWidth ] = useState( window.innerWidth );
        const [ height, setHeight ] = useState( window.innerHeight );

        const DROPDOWN_BREAKPOINT = 500;

        const updateDimensions = () => {
            setWidth( window.innerWidth );
            setHeight( window.innerHeight );
        };

        return (
            <>
                <div className="content-body mx-auto h-9 w-full max-w-3xl rounded-xl bg-muted/50 justify-center items-center ">
                    {
                        width > DROPDOWN_BREAKPOINT && (
                            <div className={ `content-header-nav nav-dropdown-sm flex flex-row justify-center items-center` }>
                            </div>
                        )
                    }
                    {
                        width < DROPDOWN_BREAKPOINT && (
                            <div className={ `content-header-nav nav-dropdown-sm flex flex-row justify-center items-center h-full w-full` }>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <EllipsisIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        { buildPlannerBtns( true ) }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )
                    }
                </div>

                <Dash />
            </>
        );
    };

    export default DashboardHomePage;
*/
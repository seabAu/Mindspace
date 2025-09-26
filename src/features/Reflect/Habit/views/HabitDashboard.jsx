
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import useReflectStore from "@/store/reflect.store";
import HabitGanttView from "./HabitGanttView";
import HabitCalendarView from "./HabitCalendarView";
import HabitChartsView from "./HabitChartView";
import HabitStreaksView from "./HabitStreaksView";
import { useState } from "react";
import HabitForm from "../blocks/HabitForm/HabitForm";
import useReflect from "@/lib/hooks/useReflect";
import { Spinner } from "@/components/Loader/Spinner";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";

const HabitDashboard = () => {
    const { habitsData, loading, activeTab, setActiveTab, loadHabits, createHabit, addHabit } = useReflectStore();

    const {
        // State variables
        dialogType, setDialogType,
        dialogData, setDialogData,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,

        ///////////////////////////// Stats/Data hooks /////////////////////////////
        // Handler functions
        handleExport,
        handleImportData,
        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
        handleFetchStatsById,
        handleCloneStats,
        handleCreateStats,
        handleUpdateStats,
        handleDeleteStats,
        handleCancel,

        // Config values
        columns: STATS_DATATABLE_COLUMNS,

        ///////////////////////////// Habits hooks /////////////////////////////
        handleFetchHabitById,
        handleFetchAllHabits,
        handleCreateHabit,
        handleUpdateHabit,
        handleCloneHabit,
        handleDeleteHabitStart,
        handleDeleteHabit,
    } = useReflect();


    const [ showHabitForm, setShowHabitForm ] = useState( false );

    // useEffect( () => {
    //     loadHabits();
    // }, [ loadHabits ] );

    useEffect( () => {
        handleFetchAllHabits();
    }, [] );

    if ( loading ) {
        return (
            <div className="flex w-full h-64 items-stretch justify-center">
                <div className="self-center h-10 text-center text-lg">Loading habits...</div>
                <Spinner
                    variant={ 'wave' }
                    size={ 'xl' }
                    color={ 'currentColor' }
                    overlay={ true }
                    className={ `` }
                />
            </div>
        );
    }

    return (
        <div
            className={ `space-y-2 w-full max-w-full min-w-full flex-1 flex flex-col min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !px-2 border rounded-xl` }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem` } }
        >
            <div className="flex px-8 w-full justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Habit Tracker</h1>
                    <p className="text-sm text-muted-foreground">Track your daily habits and build better routines</p>
                </div>
                <Button onClick={ () => setShowHabitForm( true ) } size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Habit
                </Button>
            </div>

            <Tabs
                value={ activeTab }
                onValueChange={ setActiveTab }
                className={ `space-y-4 space-x-4 !px-2 h-full min-h-full max-h-full overflow-hidden` }
            >
                <TabsList className="h-min w-full grid grid-cols-4 rounded-xl">
                    <TabsTrigger value="gantt" className="h-full rounded-lg self-center text-sm transform-none hover:transform-none">Table</TabsTrigger>
                    <TabsTrigger value="calendar" className="h-full rounded-lg self-center text-sm transform-none hover:transform-none">Calendar</TabsTrigger>
                    <TabsTrigger value="charts" className="h-full rounded-lg self-center text-sm transform-none hover:transform-none">Charts</TabsTrigger>
                    <TabsTrigger value="streaks" className="h-full rounded-lg self-center text-sm transform-none hover:transform-none">Streaks</TabsTrigger>
                </TabsList>

                <TabsContent
                    value="gantt"
                    // className="relative flex-col"
                    className={ `space-y-2 !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-y-auto` }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
                >
                    <Card className={ `!m-0 !p-0 !border-hidden` }>
                        <CardHeader className="!m-0 !px-2 !py-1">
                            <CardTitle className="text-lg">Daily Habit Tracking</CardTitle>
                            <CardDescription className="text-sm">Manage and track your habits</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-grow overflow-auto !h-full !border-hidden m-0 p-0">
                            <HabitGanttView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="calendar"
                    // className="relative flex-col"
                    className={ `space-y-2 min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-y-auto` }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
                >
                    <Card className={ `!m-2 !p-0 !border-hidden` }>
                        <CardHeader className="!m-0 !p-0">
                            <CardTitle className="text-lg">Calendar View</CardTitle>
                            <CardDescription className="text-sm">View your habits in calendar format</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-grow overflow-auto !h-full !border-hidden m-0 p-0">
                            <HabitCalendarView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="charts"
                    // className="relative flex-col"
                    className={ `space-y-2 min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-y-auto !px-2` }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
                >
                    <Card className={ `!m-2 !p-0 !border-hidden` }>
                        <CardHeader className="!m-0 !p-0">
                            <CardTitle className="text-lg">Charts & Analytics</CardTitle>
                            <CardDescription className="text-sm">Analyze your habit patterns</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-grow overflow-auto !h-full !border-hidden m-0 p-0">
                            <HabitChartsView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="streaks"
                    // className="relative flex-col"
                    className={ `space-y-2 min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-y-auto !px-2` }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 12.5 ) }rem` } }
                >
                    <Card className={ `!m-2 !p-0 !border-hidden` }>
                        <CardHeader className="!m-0 !p-0">
                            <CardTitle className="text-lg">Habit Streaks</CardTitle>
                            <CardDescription className="text-sm">Track consistency and achievements</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-grow overflow-auto !h-full !border-hidden m-0 p-0">
                            <HabitStreaksView />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            { showHabitForm && (
                <HabitForm
                    onSubmit={ async ( data ) => {
                        // Create a habit with the correct fieldNames. 
                        let newHabit = createHabit( data );

                        const result = await handleCreateHabit( newHabit );
                        if ( result ) {
                            // addHabit( result );
                            setShowHabitForm( false );
                        }
                    } }
                    onCancel={ () => {
                        setShowHabitForm( false );
                    } }
                />
            ) }
        </div>
    );
};

export default HabitDashboard;

"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import HabitGanttView from "@/features/Reflect/Habit/views/HabitGanttView";
import HabitCalendarView from "@/features/Reflect/Habit/views/HabitCalendarView";
import HabitChartView from "@/features/Reflect/Habit/views/HabitChartView";
import HabitStreaksView from "@/features/Reflect/Habit/views/HabitStreaksView";
import HabitAchievementsView from "@/features/Reflect/Habit/views/HabitAchievementsView";
import FixedTabContainer from "@/components/Tabs/FixedTabContainer";
import { useState } from "react";
import HabitForm from "./blocks/HabitForm/HabitForm";

const HabitDashboard = () => {
    const { user } = useGlobalStore();
    const { habitsData, getActiveHabits, loading, activeTab, setActiveTab, loadHabits } = useReflectStore();
    const [ showHabitForm, setShowHabitForm ] = useState( false );

    useEffect( () => {
        loadHabits();
    }, [ loadHabits ] );

    if ( loading ) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading habits...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="container mx-auto p-4 space-y-4">
                {/* Header */ }
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">Habit Tracker</h1>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>Track your daily habits and build better routines</span>
                            <div className="flex items-center space-x-3">
                                <span className="text-cyan-400 font-medium flex items-center gap-1">
                                    <span className="text-lg">🏆</span>
                                    { user.habitTrackerData.totalPoints } pts
                                </span>
                                <span className="text-orange-400 font-medium flex items-center gap-1">
                                    <span className="text-lg">🔥</span>
                                    { user.habitTrackerData.dailySignInStreak }
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={ () => setShowHabitForm( true ) } size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Habit
                    </Button>
                </div>

                {/* Tabs */ }
                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
                        <TabsTrigger
                            value="gantt"
                            className="text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger
                            value="charts"
                            className="text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                            Charts
                        </TabsTrigger>
                        <TabsTrigger
                            value="streaks"
                            className="text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                            Streaks
                        </TabsTrigger>
                        <TabsTrigger
                            value="rewards"
                            className="text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                            Achievements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gantt" className="mt-0">
                        <FixedTabContainer>
                            <HabitGanttView />
                        </FixedTabContainer>
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-0">
                        <FixedTabContainer>
                            <HabitCalendarView />
                        </FixedTabContainer>
                    </TabsContent>

                    <TabsContent value="charts" className="mt-0">
                        <FixedTabContainer>
                            <HabitChartView />
                        </FixedTabContainer>
                    </TabsContent>

                    <TabsContent value="streaks" className="mt-0">
                        <FixedTabContainer>
                            <HabitStreaksView />
                        </FixedTabContainer>
                    </TabsContent>

                    <TabsContent value="rewards" className="mt-0">
                        <FixedTabContainer>
                            <HabitAchievementsView />
                        </FixedTabContainer>
                    </TabsContent>
                </Tabs>

                { showHabitForm && (
                    <HabitForm
                        onSubmit={ async ( data ) => {
                            const result = await useReflectStore.getState().createHabit( data );
                            if ( result.success ) setShowHabitForm( false );
                        } }
                        onCancel={ () => setShowHabitForm( false ) }
                    />
                ) }
            </div>
        </div>
    );
};

export default HabitDashboard;

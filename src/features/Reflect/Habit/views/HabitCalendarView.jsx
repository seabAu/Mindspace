
import { useMemo, useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isToday,
    isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useReflectStore from "@/store/reflect.store";
import * as utils from 'akashatools';

const HabitCalendarView = () => {
    const {
        habitsData,
        getActiveHabits,
        visibleHabits,
        toggleHabitVisibility,
        toggleAllHabitsVisibility,
        selectedHabitsDate,
        setSelectedHabitsDate,
        getHabitsForDate,
        getActivityForDate,
        setActiveTab
    } = useReflectStore();

    const [ currentMonth, setCurrentMonth ] = useState( new Date() );
    const [ selectedDayDetails, setSelectedDayDetails ] = useState( null );
    const [ allHabitsVisible, setAllHabitsVisible ] = useState( false );

    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );

    const navigateMonth = ( direction ) => {
        setCurrentMonth( prev =>
            direction === "next" ? addMonths( prev, 1 ) : subMonths( prev, -1 )
        );
    };

    const handleDateClick = ( date ) => {
        setSelectedHabitsDate( date );

        const dayHabits = getHabitsForDate( date );
        const dayDetails = dayHabits.map( habit => {
            const activity = getActivityForDate( habit._id, date );
            return {
                ...habit,
                activity: activity
            };
        } );

        setSelectedDayDetails( {
            date: date,
            habits: dayDetails
        } );
    };

    const handleHabitClick = ( habit ) => {
        setSelectedHabitsDate( selectedDayDetails.date );
        setActiveTab( 'gantt' );
    };

    // Get calendar days
    const monthStart = startOfMonth( currentMonth );
    const monthEnd = endOfMonth( currentMonth );
    const calendarStart = startOfWeek( monthStart );
    const calendarEnd = endOfWeek( monthEnd );
    const calendarDays = eachDayOfInterval( { start: calendarStart, end: calendarEnd } );

    const getHabitsForDay = ( date ) => {
        return activeHabits.filter( habit => {
            if ( !visibleHabits[ habit._id ] ) return false;

            const activity = habit.activity.find( a =>
                new Date( a.date ).toDateString() === date.toDateString()
            );

            if ( habit.inputType === 'custom' ) {
                return activity && activity.notes && activity.notes.trim() !== '';
            }
            return activity && activity.value > 0;
        } );
    };

    return (
        <div className="flex gap-2">
            {/* Sidebar */ }
            <div className="w-64 space-y-2">
                {/* Habit toggles */ }
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Habits</CardTitle>

                        <Checkbox
                            checked={ allHabitsVisible }
                            onCheckedChange={ () => {
                                if ( utils.val.isValidArray( activeHabits, true ) ) {
                                    // activeHabits.forEach( ( h ) => {
                                    //     toggleHabitVisibility( h._id );
                                    // } );
                                    setAllHabitsVisible( !allHabitsVisible );
                                    toggleAllHabitsVisibility( activeHabits, !allHabitsVisible );
                                }
                            } }
                            className="h-3 w-3"
                        />
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ScrollArea className="h-48">
                            <div className="space-y-1">
                                { activeHabits.map( habit => (
                                    <div key={ habit._id } className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50">
                                        <Checkbox
                                            checked={ visibleHabits[ habit._id ] || false }
                                            onCheckedChange={ () => toggleHabitVisibility( habit._id ) }
                                            className="h-3 w-3"
                                        />
                                        <div className="flex items-center space-x-1 flex-1 min-w-0">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={ { backgroundColor: habit.color } }
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium truncate">{ habit.title }</div>
                                                <div className="text-xs text-muted-foreground">
                                                    { habit.activity.filter( a =>
                                                        habit.inputType === 'custom'
                                                            ? a.notes && a.notes.trim() !== ''
                                                            : a.value > 0
                                                    ).length }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Day details */ }
                { selectedDayDetails && (
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                    { format( selectedDayDetails.date, "MMM dd, yyyy" ) }
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={ () => setSelectedDayDetails( null ) }
                                    className="h-6 w-6 p-0"
                                >
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            { selectedDayDetails.habits.length > 0 ? (
                                <div className="space-y-2">
                                    { selectedDayDetails.habits.map( habit => (
                                        <div
                                            key={ habit._id }
                                            className="p-2 rounded border cursor-pointer hover:bg-muted/50"
                                            onClick={ () => handleHabitClick( habit ) }
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={ { backgroundColor: habit.color } }
                                                />
                                                <span className="text-xs font-medium">{ habit.title }</span>
                                                <ArrowLeft className="w-3 h-3 ml-auto text-muted-foreground" />
                                            </div>

                                            { habit.inputType === 'toggle' && (
                                                <div className="text-xs text-muted-foreground">
                                                    { habit.activity?.value ? 'Completed' : 'Not completed' }
                                                </div>
                                            ) }

                                            { habit.inputType === 'value' && (
                                                <div className="text-xs text-muted-foreground">
                                                    Value: { habit.activity?.value || 0 }
                                                </div>
                                            ) }

                                            { habit.inputType === 'custom' && habit.activity?.notes && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    { habit.activity.notes }
                                                </div>
                                            ) }
                                        </div>
                                    ) ) }
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground text-center py-2">
                                    No habits tracked this day
                                </div>
                            ) }
                        </CardContent>
                    </Card>
                ) }
            </div>

            {/* Calendar */ }
            <div className="flex-1">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                { format( currentMonth, "MMMM yyyy" ) }
                            </CardTitle>
                            <div className="flex items-center space-x-1">
                                <Button variant="outline" size="sm" onClick={ () => navigateMonth( 'prev' ) } className="h-7 w-7 p-0">
                                    <ChevronLeft className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={ () => {
                                        setCurrentMonth( new Date() );
                                        handleDateClick( new Date() );
                                    } }
                                    className="h-7 px-2 text-xs"
                                >
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={ () => navigateMonth( 'next' ) } className="h-7 w-7 p-0">
                                    <ChevronRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {/* Calendar Grid */ }
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day headers */ }
                            { [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ].map( day => (
                                <div key={ day } className="p-1 text-center text-xs font-medium text-muted-foreground">
                                    { day }
                                </div>
                            ) ) }

                            {/* Calendar days */ }
                            { calendarDays.map( day => {
                                const dayHabits = getHabitsForDay( day );
                                const isCurrentMonth = isSameMonth( day, currentMonth );
                                const isTodayDate = isToday( day );
                                const isSelected = selectedDayDetails && isSameDay( day, selectedDayDetails.date );

                                return (
                                    <div
                                        key={ day.toISOString() }
                                        className={ `
                      relative p-1 min-h-[60px] border border-border rounded cursor-pointer transition-colors
                      ${ isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/30 hover:bg-muted/40' }
                      ${ isTodayDate ? 'ring-2 ring-primary' : '' }
                      ${ isSelected ? 'bg-primary/10 border-primary' : '' }
                    `}
                                        onClick={ () => handleDateClick( day ) }
                                    >
                                        {/* Day number */ }
                                        <div className={ `
                      text-xs font-medium mb-1
                      ${ isCurrentMonth ? 'text-foreground' : 'text-muted-foreground' }
                      ${ isTodayDate ? 'text-primary font-bold' : '' }
                    `}>
                                            { format( day, 'd' ) }
                                        </div>

                                        {/* Habit dots */ }
                                        <div className="flex flex-wrap gap-0.5">
                                            { dayHabits.slice( 0, 8 ).map( habit => (
                                                <div
                                                    key={ habit._id }
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={ { backgroundColor: habit.color } }
                                                    title={ habit.title }
                                                />
                                            ) ) }
                                            { dayHabits.length > 8 && (
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                                                    title={ `+${ dayHabits.length - 8 } more habits` }
                                                />
                                            ) }
                                        </div>
                                    </div>
                                );
                            } ) }
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */ }
                <Card className="mt-2">
                    <CardContent className="pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 border-2 border-primary rounded" />
                                    <span>Today</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <span>Habit completed</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-primary/10 border border-primary rounded" />
                                    <span>Selected day</span>
                                </div>
                            </div>
                            <div>
                                Visible habits: { Object.values( visibleHabits ).filter( Boolean ).length }
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HabitCalendarView;

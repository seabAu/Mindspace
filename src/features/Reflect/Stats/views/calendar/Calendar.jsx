import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import * as utils from 'akashatools';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addDays,
    subDays,
    isToday,
    isBefore,
    isAfter,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStatsContext } from "@/features/Reflect/Stats/contexts/StatsContext";
import { generateDataForDay } from "@/features/Reflect/Stats/utils/sampleDataGenerator";
import DynamicDataForm from "../dataform/DynamicDataForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countEntriesByDay, getColorForCount, filterItemsByDate } from "@/features/Reflect/Stats/utils/dataUtils";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const Calendar = () => {
    const { statsData, addStat, updateStat } = useReflectContext();
    const [ currentDate, setCurrentDate ] = useState( new Date() );
    const [ viewType, setViewType ] = useState( "month" );
    const [ selectedDate, setSelectedDate ] = useState( null );
    const [ selectedEndDate, setSelectedEndDate ] = useState( null );
    const [ isDialogOpen, setIsDialogOpen ] = useState( false );
    const [ isDataFormOpen, setIsDataFormOpen ] = useState( false );
    const [ isDragging, setIsDragging ] = useState( false );
    const [ dragStartDate, setDragStartDate ] = useState( null );
    const [ dragEndDate, setDragEndDate ] = useState( null );
    const calendarRef = useRef( null );

    // Count entries by day
    const entriesByDay = useMemo( () => countEntriesByDay( statsData ), [ statsData ] );

    // Get min/max counts for color scaling
    const { minCount, maxCount } = useMemo( () => {
        const counts = Object.values( entriesByDay );
        return {
            minCount: Math.min( ...counts, 0 ),
            maxCount: Math.max( ...counts, 1 ),
        };
    }, [ entriesByDay ] );

    // Get days for the current month view
    const monthDays = useMemo( () => {
        const firstDay = startOfMonth( currentDate );
        const lastDay = endOfMonth( currentDate );

        // Get all days in the month
        const daysInMonth = eachDayOfInterval( { start: firstDay, end: lastDay } );

        // Get the first day of the first week of the month
        const startDate = startOfWeek( firstDay );

        // Get the last day of the last week of the month
        const endDate = endOfWeek( lastDay );

        // Get all days to display in the calendar
        return eachDayOfInterval( { start: startDate, end: endDate } );
    }, [ currentDate ] );

    // Get days for the current week view
    const weekDays = useMemo( () => {
        const startDate = startOfWeek( currentDate );
        const endDate = endOfWeek( currentDate );

        return eachDayOfInterval( { start: startDate, end: endDate } );
    }, [ currentDate ] );

    // Get days for the current day view
    const dayHours = useMemo( () => {
        return Array.from( { length: 24 }, ( _, i ) => {
            const date = new Date( currentDate );
            date.setHours( i, 0, 0, 0 );
            return date;
        } );
    }, [ currentDate ] );

    // Navigation functions
    const nextMonth = useCallback( () => setCurrentDate( addMonths( currentDate, 1 ) ), [ currentDate ] );
    const prevMonth = useCallback( () => setCurrentDate( subMonths( currentDate, 1 ) ), [ currentDate ] );
    const nextWeek = useCallback( () => setCurrentDate( addDays( currentDate, 7 ) ), [ currentDate ] );
    const prevWeek = useCallback( () => setCurrentDate( subDays( currentDate, 7 ) ), [ currentDate ] );
    const nextDay = useCallback( () => setCurrentDate( addDays( currentDate, 1 ) ), [ currentDate ] );
    const prevDay = useCallback( () => setCurrentDate( subDays( currentDate, 1 ) ), [ currentDate ] );
    const today = useCallback( () => setCurrentDate( new Date() ), [] );

    // Handle day click
    const handleDayClick = useCallback(
        ( day, isMouseDown = true ) => {
            if ( isMouseDown ) {
                setSelectedDate( day );
                setSelectedEndDate( null );
                setDragStartDate( day );
                setDragEndDate( null );
                setIsDragging( true );
            } else if ( isDragging ) {
                // Mouse up after dragging
                setDragEndDate( day );
                setIsDragging( false );

                // Ensure start date is before end date
                let startDate = dragStartDate;
                let endDate = day;

                if ( isBefore( day, dragStartDate ) ) {
                    startDate = day;
                    endDate = dragStartDate;
                }

                setSelectedDate( startDate );
                setSelectedEndDate( endDate );
                setIsDialogOpen( true );
            }
        },
        [ isDragging, dragStartDate ],
    );

    // Handle day hover during drag
    const handleDayHover = useCallback(
        ( day ) => {
            if ( isDragging ) {
                setDragEndDate( day );
            }
        },
        [ isDragging ],
    );

    // Handle mouse up on calendar
    const handleMouseUp = useCallback( () => {
        if ( isDragging ) {
            setIsDragging( false );

            if ( dragStartDate && dragEndDate ) {
                // Ensure start date is before end date
                let startDate = dragStartDate;
                let endDate = dragEndDate;

                if ( isBefore( dragEndDate, dragStartDate ) ) {
                    startDate = dragEndDate;
                    endDate = dragStartDate;
                }

                setSelectedDate( startDate );
                setSelectedEndDate( endDate );
                setIsDialogOpen( true );
            }
        }
    }, [ isDragging, dragStartDate, dragEndDate ] );

    // Add event listener for mouse up
    useEffect( () => {
        const handleGlobalMouseUp = () => {
            if ( isDragging ) {
                setIsDragging( false );
            }
        };

        window.addEventListener( "mouseup", handleGlobalMouseUp );
        return () => {
            window.removeEventListener( "mouseup", handleGlobalMouseUp );
        };
    }, [ isDragging ] );

    // Open data form for the selected date
    const openDataForm = useCallback( () => {
        setIsDataFormOpen( true );
        setIsDialogOpen( false );
    }, [] );

    // Generate sample data for a day
    const generateSampleDataForDay = useCallback(
        ( day, endDay = null ) => {
            // If we have a date range, generate data for each day in the range
            if ( endDay ) {
                const days = eachDayOfInterval( { start: day, end: endDay } );
                days.forEach( ( date ) => {
                    const sampleData = generateDataForDay( date, 2 ); // Fewer items per day in a range
                    sampleData.forEach( ( item ) => {
                        const newItem = addStat();
                        if ( newItem ) {
                            setTimeout( () => {
                                updateStat( newItem._id, item );
                            }, 10 );
                        }
                    } );
                } );
            } else {
                // Generate data for a single day
                const sampleData = generateDataForDay( day, 5 );
                sampleData.forEach( ( item ) => {
                    const newItem = addStat();
                    if ( newItem ) {
                        setTimeout( () => {
                            updateStat( newItem._id, item );
                        }, 10 );
                    }
                } );
            }

            setIsDialogOpen( false );
        },
        [ addStat, updateStat ],
    );

    // Check if a day is in the selected range
    const isDayInRange = useCallback(
        ( day ) => {
            if ( !dragStartDate || !dragEndDate ) return false;

            const start = isBefore( dragStartDate, dragEndDate ) ? dragStartDate : dragEndDate;
            const end = isBefore( dragStartDate, dragEndDate ) ? dragEndDate : dragStartDate;

            return ( isAfter( day, start ) || isSameDay( day, start ) ) && ( isBefore( day, end ) || isSameDay( day, end ) );
        },
        [ dragStartDate, dragEndDate ],
    );

    // Render data dots for a day
    const renderDataDots = useCallback(
        ( day ) => {
            const dateStr = format( day, "yyyy-MM-dd" );
            const count = entriesByDay[ dateStr ] || 0;

            if ( count === 0 ) return null;

            // Get filtered items for this day
            const dayData = filterItemsByDate( statsData, day );

            // Group by entry type for coloring
            const entryTypes = {};
            dayData.forEach( ( item ) => {
                if ( !entryTypes[ item.entryType ] ) {
                    entryTypes[ item.entryType ] = [];
                }
                entryTypes[ item.entryType ].push( item );
            } );

            // Color mapping for entry types
            const colorMap = {
                Wellness: "bg-washed-blue-500",
                Fitness: "bg-brown-500",
                Nutrition: "bg-tahiti-500",
                Financial: "bg-primary-purple-500",
                Journal: "bg-primary-blue-500",
                default: "bg-background",
            };

            return (
                <div className="flex flex-wrap justify-center mt-1 gap-1">
                    { Object.entries( entryTypes )
                        .slice( 0, 3 )
                        .map( ( [ type, statsData ], index ) => (
                            <TooltipProvider key={ `${ dateStr }-${ type }` }>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={ `w-2 h-2 rounded-full ${ colorMap[ type ] || colorMap.default }` }></div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-white text-xs p-2">
                                        <div className="font-medium mb-1">
                                            { type } ({ statsData.length })
                                        </div>
                                        <ul className="list-disc pl-4">
                                            { statsData.slice( 0, 3 ).map( ( item, i ) => (
                                                <li key={ `${ item._id }-${ i }` } className="truncate max-w-[200px]">
                                                    { item.dataKey }:{ " " }
                                                    { typeof item.dataValue === "object"
                                                        ? JSON.stringify( item.dataValue ).substring( 0, 20 ) + "..."
                                                        : String( item.dataValue ).substring( 0, 20 ) }
                                                </li>
                                            ) ) }
                                            { statsData.length > 3 && <li>...and { statsData.length - 3 } more</li> }
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) ) }
                    { Object.keys( entryTypes ).length > 3 && <div className="w-2 h-2 rounded-full bg-background"></div> }
                </div>
            );
        },
        [ entriesByDay, statsData ],
    );

    // Render month view
    const renderMonthView = useCallback( () => {
        return (
            <div className="grid grid-cols-7 gap-1" onMouseUp={ handleMouseUp } ref={ calendarRef }>
                { [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ].map( ( day ) => (
                    <div key={ day } className="text-center text-sm font-medium text-neutral-400 py-2">
                        { day }
                    </div>
                ) ) }

                { monthDays.map( ( day ) => {
                    const isCurrentMonth = isSameMonth( day, currentDate );
                    const isSelected = selectedDate && isSameDay( day, selectedDate );
                    const isEndDate = selectedEndDate && isSameDay( day, selectedEndDate );
                    const isInRange = isDayInRange( day );
                    const isTodayDate = isToday( day );
                    const dateStr = format( day, "yyyy-MM-dd" );
                    const count = entriesByDay[ dateStr ] || 0;
                    const color = count > 0 ? getColorForCount( count, minCount, maxCount ) : undefined;

                    return (
                        <div
                            key={ day.toString() }
                            className={ cn(
                                "min-h-[80px] p-1 border rounded-md relative",
                                !isCurrentMonth && "opacity-40",
                                isSelected && "border-washed-blue-500 bg-washed-blue-900/20",
                                isEndDate && "border-washed-blue-500 bg-washed-blue-900/20",
                                isInRange && "bg-washed-blue-900/10",
                                isTodayDate && !isSelected && !isInRange && "bg-primary-purple-800/20",
                                isDragging && "cursor-pointer",
                            ) }
                            style={ {
                                backgroundColor: count > 0 && !isSelected && !isEndDate && !isInRange ? color : undefined,
                            } }
                            onMouseDown={ () => handleDayClick( day, true ) }
                            onMouseUp={ () => handleDayClick( day, false ) }
                            onMouseEnter={ () => handleDayHover( day ) }
                        >
                            <div className="text-right text-sm">{ format( day, "d" ) }</div>
                            { renderDataDots( day ) }
                        </div>
                    );
                } ) }
            </div>
        );
    }, [
        monthDays,
        currentDate,
        selectedDate,
        selectedEndDate,
        isDragging,
        isDayInRange,
        handleDayClick,
        handleDayHover,
        handleMouseUp,
        renderDataDots,
        entriesByDay,
        minCount,
        maxCount,
    ] );

    // Render week view
    const renderWeekView = useCallback( () => {
        return (
            <div className="grid grid-cols-7 gap-1" onMouseUp={ handleMouseUp }>
                { weekDays.map( ( day ) => {
                    const isSelected = selectedDate && isSameDay( day, selectedDate );
                    const isEndDate = selectedEndDate && isSameDay( day, selectedEndDate );
                    const isInRange = isDayInRange( day );
                    const isTodayDate = isToday( day );
                    const dateStr = format( day, "yyyy-MM-dd" );
                    const count = entriesByDay[ dateStr ] || 0;
                    const color = count > 0 ? getColorForCount( count, minCount, maxCount ) : undefined;

                    return (
                        <div key={ day.toString() } className="text-center">
                            <div
                                className={ cn(
                                    "py-2 font-medium",
                                    isTodayDate && "text-washed-blue-500",
                                    isSelected && "bg-washed-blue-900/20 rounded-md",
                                    isEndDate && "bg-washed-blue-900/20 rounded-md",
                                ) }
                            >
                                { format( day, "EEE" ) }
                                <div className="text-lg">{ format( day, "d" ) }</div>
                            </div>

                            <div
                                className={ cn(
                                    "min-h-[400px] border rounded-md p-2",
                                    isSelected && "border-washed-blue-500 bg-washed-blue-900/20",
                                    isEndDate && "border-washed-blue-500 bg-washed-blue-900/20",
                                    isInRange && "bg-washed-blue-900/10",
                                ) }
                                style={ {
                                    backgroundColor: count > 0 && !isSelected && !isEndDate && !isInRange ? color : undefined,
                                } }
                                onMouseDown={ () => handleDayClick( day, true ) }
                                onMouseUp={ () => handleDayClick( day, false ) }
                                onMouseEnter={ () => handleDayHover( day ) }
                            >
                                { renderDataDots( day ) }

                                {/* Show a few items directly in the week view */ }
                                <div className="mt-2">
                                    { filterItemsByDate( statsData, day )
                                        ?.slice( 0, 3 )
                                        .map( ( item, index ) => (
                                            <div
                                                key={ `${ item._id }-${ index }` }
                                                className="text-xs p-1 mb-1 bg-primary-purple-800/20 rounded truncate"
                                                title={ `${ item.dataKey }: ${ typeof item.dataValue === "object" ? JSON.stringify( item.dataValue ) : item.dataValue
                                                    }` }
                                            >
                                                { format( new Date( item.timeStamp ), "HH:mm" ) } - { item.dataKey }
                                            </div>
                                        ) ) }
                                </div>
                            </div>
                        </div>
                    );
                } ) }
            </div>
        );
    }, [
        weekDays,
        selectedDate,
        selectedEndDate,
        isDayInRange,
        handleDayClick,
        handleDayHover,
        handleMouseUp,
        renderDataDots,
        entriesByDay,
        minCount,
        maxCount,
        statsData,
    ] );

    // Render day view
    const renderDayView = useCallback( () => {
        const dayData = filterItemsByDate( statsData, currentDate );

        return (
            <div className="grid grid-cols-1 gap-1">
                <div className="text-center py-2 font-medium">{ format( currentDate, "EEEE, MMMM d, yyyy" ) }</div>

                <div className="grid grid-cols-1 gap-1" onMouseUp={ handleMouseUp }>
                    { dayHours.map( ( hour ) => {
                        const hourData = dayData.filter( ( item ) => {
                            const itemDate = new Date( item.timeStamp );
                            return itemDate.getHours() === hour.getHours();
                        } );

                        const isSelected =
                            selectedDate && isSameDay( hour, selectedDate ) && selectedDate.getHours() === hour.getHours();

                        const isEndDate =
                            selectedEndDate && isSameDay( hour, selectedEndDate ) && selectedEndDate.getHours() === hour.getHours();

                        const isInRange = isDayInRange( hour );

                        return (
                            <div
                                key={ hour.toString() }
                                className={ cn(
                                    "flex border-t py-2",
                                    isSelected && "bg-washed-blue-900/20",
                                    isEndDate && "bg-washed-blue-900/20",
                                    isInRange && "bg-washed-blue-900/10",
                                ) }
                                onMouseDown={ () => handleDayClick( hour, true ) }
                                onMouseUp={ () => handleDayClick( hour, false ) }
                                onMouseEnter={ () => handleDayHover( hour ) }
                            >
                                <div className="w-16 text-right pr-2 text-neutral-400">{ format( hour, "HH:mm" ) }</div>

                                <div className="flex-1">
                                    { hourData.map( ( item, index ) => (
                                        <div key={ `${ item._id }-${ index }` } className="p-2 mb-1 bg-primary-purple-800/20 rounded-md text-sm">
                                            <div className="font-medium">{ item.dataKey }</div>
                                            <div className="text-xs text-neutral-300">{ item.entryType }</div>
                                            <div className="mt-1">
                                                { typeof item.dataValue === "object" ? JSON.stringify( item.dataValue ) : String( item.dataValue ) }
                                            </div>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            </div>
        );
    }, [
        currentDate,
        dayHours,
        selectedDate,
        selectedEndDate,
        isDayInRange,
        handleDayClick,
        handleDayHover,
        handleMouseUp,
        statsData,
    ] );

    // Render list view
    const renderListView = useCallback( () => {
        // Sort all items by timeStamp
        const sortedItems = [ ...statsData ].sort( ( a, b ) => new Date( b.timeStamp ).getTime() - new Date( a.timeStamp ).getTime() );

        // Group by date
        const groupedByDate = {};
        sortedItems.forEach( ( item ) => {
            const dateStr = format( new Date( item.timeStamp ), "yyyy-MM-dd" );
            if ( !groupedByDate[ dateStr ] ) {
                groupedByDate[ dateStr ] = [];
            }
            groupedByDate[ dateStr ].push( item );
        } );

        return (
            <div className="space-y-4">
                { Object.entries( groupedByDate ).map( ( [ dateStr, dateItems ] ) => (
                    <Card key={ dateStr } className="bg-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                <span>{ format( new Date( dateStr ), "EEEE, MMMM d, yyyy" ) }</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={ () => handleDayClick( new Date( dateStr ) ) }
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                { dateItems.map( ( item ) => (
                                    <div key={ item._id } className="p-2 bg-primary-purple-800/20 rounded-md text-sm">
                                        <div className="flex justify-between">
                                            <div className="font-medium">{ item.dataKey }</div>
                                            <div className="text-xs text-neutral-400">{ format( new Date( item.timeStamp ), "HH:mm" ) }</div>
                                        </div>
                                        <div className="text-xs text-neutral-300">{ item.entryType }</div>
                                        <div className="mt-1">
                                            { typeof item.dataValue === "object" ? JSON.stringify( item.dataValue ) : String( item.dataValue ) }
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </CardContent>
                    </Card>
                ) ) }
            </div>
        );
    }, [ statsData, handleDayClick ] );

    // Navigation controls based on view type
    const renderNavigation = useCallback( () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={ today } className="bg-background text-white">
                        Today
                    </Button>

                    <div className="flex">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={ viewType === "month" ? prevMonth : viewType === "week" ? prevWeek : prevDay }
                            className="bg-background text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={ viewType === "month" ? nextMonth : viewType === "week" ? nextWeek : nextDay }
                            className="bg-background text-white"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="text-lg font-medium">
                        { viewType === "month"
                            ? format( currentDate, "MMMM yyyy" )
                            : viewType === "week"
                                ? `${ format( weekDays[ 0 ], "MMM d" ) } - ${ format( weekDays[ 6 ], "MMM d, yyyy" ) }`
                                : format( currentDate, "MMMM d, yyyy" ) }
                    </div>
                </div>

                {/* View type selector */ }
                <Select value={ viewType } onValueChange={ setViewType }>
                    <SelectTrigger className="w-32 bg-background text-white">
                        <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-white">
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    }, [ currentDate, viewType, weekDays, today, prevMonth, nextMonth, prevWeek, nextWeek, prevDay, nextDay ] );

    return (
        <div className="h-full flex flex-col bg-background text-white p-2">
            { !isDataFormOpen ? (
                <>
                    { renderNavigation() }

                    <ScrollArea className="flex-1">
                        <div className="bg-background border rounded-md p-2">
                            { viewType === "month" && renderMonthView() }
                            { viewType === "week" && renderWeekView() }
                            { viewType === "day" && renderDayView() }
                            { viewType === "list" && renderListView() }
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            { selectedDate && selectedEndDate && !isSameDay( selectedDate, selectedEndDate )
                                ? `Data for ${ format( selectedDate, "MMMM d" ) } - ${ format( selectedEndDate, "MMMM d, yyyy" ) }`
                                : selectedDate && `Data for ${ format( selectedDate, "EEEE, MMMM d, yyyy" ) }` }
                        </h2>
                        <Button variant="outline" size="sm" onClick={ () => setIsDataFormOpen( false ) }>
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Back to Calendar
                        </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <DynamicDataForm selectedDate={ selectedDate } selectedEndDate={ selectedEndDate } />
                    </div>
                </div>
            ) }

            {/* Dialog for day actions */ }
            <Dialog open={ isDialogOpen } onOpenChange={ setIsDialogOpen }>
                <DialogContent className="bg-background border-sextary-700 text-white">
                    <DialogHeader>
                        <DialogTitle>
                            { selectedDate && selectedEndDate && !isSameDay( selectedDate, selectedEndDate )
                                ? `${ format( selectedDate, "MMMM d" ) } - ${ format( selectedEndDate, "MMMM d, yyyy" ) }`
                                : selectedDate && format( selectedDate, "EEEE, MMMM d, yyyy" ) }
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Button className="w-full bg-washed-blue-600 hover:bg-washed-blue-700" onClick={ openDataForm }>
                            View & Edit Data
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={ () => generateSampleDataForDay( selectedDate, selectedEndDate ) }
                        >
                            Generate Sample Data
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={ () => setIsDialogOpen( false ) }>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo( Calendar );

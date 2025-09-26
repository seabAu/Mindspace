// import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react";
import useTasksStore from "@/store/task.store";
import { Button } from "@/components/ui/button";
import {
    format,
    isSameDay,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isValid,
    addMonths,
    subMonths,
    addDays,
    parseISO,
    subDays,
    startOfWeek,
    endOfWeek,
    isSameMonth,
} from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Tag, Edit, Trash } from "lucide-react";
import { TodoDialog } from "@/features/Todo/blocks/Dialog/task-dialog";
import { TodoNotesSidebar } from "@/features/Todo/blocks/Sidebar/TodoNotesSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterComponent } from "@/features/Todo/blocks/Filters/FilterComponent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as utils from 'akashatools';
import { twMerge } from "tailwind-merge";
import { stringAsColor } from "@/lib/utilities/color";


export function CalendarView ( { onAddTask, onUpdateTask, filteredColumns } ) {
    const {
        activeListId,
        tasksData, deleteTask,
        categories, setCategories, getCategories,
        tags, setTags, getTags, getAllTags, initTags,
        filteredTasks, setFilteredTasks, getFilteredTasks,
        columns, setColumns, getFilteredColumns,
    } = useTasksStore();
    const [ currentMonth, setCurrentMonth ] = useState( new Date() );
    const [ isTaskDialogOpen, setIsTaskDialogOpen ] = useState( false );
    const [ selectedDate, setSelectedDate ] = useState( null );
    const [ selectedTask, setSelectedTask ] = useState( null );
    const [ selectedColumnId, setSelectedColumnId ] = useState( null );
    const [ isNotesSidebarOpen, setIsNotesSidebarOpen ] = useState( false );
    const [ dragStartDate, setDragStartDate ] = useState( null );
    const [ dragEndDate, setDragEndDate ] = useState( null );
    const [ isDragging, setIsDragging ] = useState( false );
    const [ showTimelineView, setShowTimelineView ] = useState( false );
    const [ timelineDate, setTimelineDate ] = useState( new Date() );
    const [ selectedTimeSlot, setSelectedTimeSlot ] = useState( null );
    const [ filters, setFilters ] = useState( [] );
    // const [ filteredTasks, setFilteredTasks ] = useState( [] );
    const [ activeTab, setActiveTab ] = useState( "month" );
    const [ selectedDayTasks, setSelectedDayTasks ] = useState( [] );
    const [ selectedDayDate, setSelectedDayDate ] = useState( null );

    // Get all tasks
    // const tasksData = useMemo( () => getAllTasks(), [ getAllTasks ] );

    // Apply filters to tasks
    /* useEffect( () => {
        if ( filters.length === 0 ) {
            setFilteredTasks( tasksData.filter( ( task ) => ( task?.todoListId === activeListId || activeListId === null ) ) );
            return;
        }

        const filtered = tasksData.filter( ( task ) => {
            return filters.every( ( filter ) => {
                const value = filter.value.toLowerCase();

                switch ( filter.field ) {
                    case "title":
                        return task.title.toLowerCase().includes( value );
                    case "description":
                        return task.description?.toLowerCase().includes( value ) || false;
                    case "status":
                        return task.status?.toLowerCase().includes( value ) || false;
                    case "priority":
                        return task.priority?.toLowerCase().includes( value ) || false;
                    case "tags":
                        return task.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) );
                    case "assignee":
                        return task.user?.name.toLowerCase().includes( value ) || false;
                    default:
                        return true;
                }
            } );
        } );

        setFilteredTasks( filtered );
    }, [ filters, tasksData ] ); */

    // Get tasks for a specific date
    const getTasksForDate = useCallback(
        ( date ) => {
            // if ( !date || !isValid( date ) ) return [];

            return tasksData?.filter( ( task ) => {
                // console.log( "getTasksForDate :: date = ", date, " :: ", "task?.timestampDue = ", task?.timestampDue, isValid( new Date( task?.timestampDue ) ), tasksData, filteredTasks, " :: parseISO(date) = ", new Date( date ).toLocaleDateString(), " :: ", "parseISO(task?.timestampDue) = ", new Date( task?.timestampDue ).toLocaleDateString() );
                if ( !task?.timestampDue ) return false;

                try {
                    let taskDueDate = new Date( task?.timestampDue ).toLocaleDateString();
                    let selectedDate = new Date( date ).toLocaleDateString();

                    // let taskDate;
                    // // Handle different date formats
                    // if ( typeof task?.timestampDue === "string" ) { taskDate = parseISO( task?.timestampDue ); }
                    // else { taskDate = new Date( task?.timestampDue ); }

                    // Check if the date is valid
                    // if ( !isValid( taskDate ) ) return false;
                    // console.log( "getTasksForDate :: date = ", date, " :: ", "task?.timestampDue = ", task?.timestampDue, isValid( new Date( task?.timestampDue ) ), tasksData, filteredTasks, " :: ", "isSameDay( new Date( task?.timestampDue ), date ) = ", isSameDay( new Date( task?.timestampDue ), date ), " :: parseISO(date) = ", new Date( date ).toLocaleDateString(), " :: ", "parseISO(task?.timestampDue) = ", new Date( task?.timestampDue ).toLocaleDateString()  );

                    return isSameDay( taskDueDate, selectedDate );
                } catch ( error ) {
                    // If there's any error parsing the date, skip this task
                    // console.log( "err" );
                    return false;
                }
            } );
        },
        [ tasksData, selectedDate ],
    );

    // Get calendar days for the current month view
    const calendarDays = useMemo( () => {
        const monthStart = startOfMonth( currentMonth );
        const monthEnd = endOfMonth( currentMonth );
        const startDate = startOfWeek( monthStart );
        const endDate = endOfWeek( monthEnd );

        return eachDayOfInterval( { start: startDate, end: endDate } );
    }, [ currentMonth ] );

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentMonth( subMonths( currentMonth, 1 ) );
    };

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentMonth( addMonths( currentMonth, 1 ) );
    };

    // Go to today
    const goToToday = () => {
        setCurrentMonth( new Date() );
        if ( showTimelineView ) {
            setTimelineDate( new Date() );
        }
    };

    // Handle date selection
    const handleDateClick = ( date ) => {
        if ( !date || !isValid( date ) ) return;

        // Set the selected day and get its tasks
        setSelectedDayDate( new Date( date ) );
        // console.log( "dateclick :: getTasksForDate( date ) = ", date, isValid( date ), getTasksForDate( date ), tasksData, filteredTasks );
        setSelectedDayTasks( getTasksForDate( new Date( date ) ) );
    };

    // Handle double click to create task
    const handleDateDoubleClick = ( date ) => {
        if ( !date || !isValid( date ) ) return;

        // If this date is the same as the current, assume a valid doubleclick. 
        // We want to avoid instances where the dialog is triggered on clicking multiple days too quickly.
        if ( date === selectedDate ) {
            setSelectedDate( date );
            setSelectedTask( null );

            // Find the first column to add the task to
            const columns = useTasksStore.getState().columns;
            if ( columns.length > 0 ) {
                setSelectedColumnId( columns[ 0 ].id );
                setIsTaskDialogOpen( true );
            }
        }
    };

    // Handle click on a task dot
    const handleTaskClick = ( e, task ) => {
        e.stopPropagation();
        setSelectedTask( task );
        setSelectedDayTasks( [ task ] );
    };

    // Handle mouse down for drag selection
    const handleMouseDown = ( date ) => {
        if ( !date || !isValid( date ) ) return;
        setDragStartDate( date );
        setDragEndDate( null );
        setIsDragging( true );
    };

    // Handle mouse move for drag selection
    const handleMouseMove = ( date ) => {
        if ( isDragging && dragStartDate && date && isValid( date ) ) {
            setDragEndDate( date );
        }
    };

    // Handle mouse up for drag selection
    const handleMouseUp = () => {
        if ( isDragging && dragStartDate && dragEndDate ) {
            // Ensure start date is before end date
            const startDate = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
            const endDate = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;

            setSelectedDate( startDate );

            // Find the first column to add the task to
            const columns = useTasksStore.getState().columns;
            if ( columns.length > 0 ) {
                setSelectedColumnId( columns[ 0 ].id );
                setIsTaskDialogOpen( true );
            }
        }

        setIsDragging( false );
    };

    // Handle time slot selection in timeline view
    const handleTimeSlotClick = ( time ) => {
        setSelectedTimeSlot( time );

        // Create a date object with the selected time
        const [ hours, minutes ] = time.split( ":" ).map( Number );
        const dateWithTime = new Date( timelineDate );
        dateWithTime.setHours( hours, minutes, 0, 0 );

        setSelectedDate( dateWithTime );

        // Find the first column to add the task to
        const columns = useTasksStore.getState().columns;
        if ( columns.length > 0 ) {
            setSelectedColumnId( columns[ 0 ].id );
            setIsTaskDialogOpen( true );
        }
    };

    // Switch to timeline view for a specific date
    const switchToTimelineView = ( date ) => {
        setTimelineDate( date );
        setActiveTab( "day" );
    };

    // Generate time slots for timeline view (30-minute intervals)
    const timeSlots = useMemo( () => {
        const slots = [];
        for ( let hour = 0; hour < 24; hour++ ) {
            for ( let minute = 0; minute < 60; minute += 30 ) {
                slots.push( `${ hour.toString().padStart( 2, "0" ) }:${ minute.toString().padStart( 2, "0" ) }` );
            }
        }
        return slots;
    }, [] );

    // Get tasks for the timeline view
    const tasksForTimeline = useMemo( () => {
        return getTasksForDate( timelineDate );
    }, [ timelineDate, getTasksForDate ] );

    // Map tasks to time slots
    const getTasksForTimeSlot = ( timeSlot ) => {
        const [ hours, minutes ] = timeSlot.split( ":" ).map( Number );

        return tasksForTimeline.filter( ( task ) => {
            if ( !task?.timestampDue ) return false;

            try {
                let taskDate;

                if ( typeof task?.timestampDue === "string" ) { taskDate = parseISO( task?.timestampDue ); }
                else { taskDate = new Date( task?.timestampDue ); }

                if ( !isValid( taskDate ) ) return false;

                return taskDate.getHours() === hours && Math.floor( taskDate.getMinutes() / 30 ) * 30 === minutes;
            } catch {
                return false;
            }
        } );
    };

    // Generate month options for dropdown
    const monthOptions = useMemo( () => {
        return Array.from( { length: 12 }, ( _, i ) => {
            const date = new Date( 2000, i, 1 );
            return {
                value: i.toString(),
                label: format( date, "MMMM" ),
            };
        } );
    }, [] );

    // Generate year options for dropdown (5 years before and after current year)
    const yearOptions = useMemo( () => {
        const currentYear = new Date().getFullYear();
        return Array.from( { length: 11 }, ( _, i ) => {
            const year = currentYear - 5 + i;
            return {
                value: year.toString(),
                label: year.toString(),
            };
        } );
    }, [] );

    // Handle month change from dropdown
    const handleMonthChange = ( value ) => {
        const newDate = new Date( currentMonth );
        newDate.setMonth( Number.parseInt( value ) );
        setCurrentMonth( newDate );

        timelineDate( newDate );
    };

    // Handle year change from dropdown
    const handleYearChange = ( value ) => {
        const newDate = new Date( currentMonth );
        newDate.setFullYear( Number.parseInt( value ) );
        setCurrentMonth( newDate );

        timelineDate( newDate );
    };

    // Helper function to get color based on priority
    const getPriorityColor = ( priority ) => {
        return stringAsColor( priority );
    };

    // Format date for display
    const formatDate = () => {
        if ( !date ) return "No date";

        try {
            const dateObj = typeof date === "string" ? parseISO( date ) : new Date( date );
            return isValid( dateObj ) ? format( dateObj, "MMM d, yyyy" ) : "Invalid date";
        } catch {
            return "Invalid date";
        }
    };

    // Handle edit task
    const handleEditTask = ( task ) => {
        setSelectedTask( task );
        setIsTaskDialogOpen( true );
    };

    // Handle delete task
    const handleDeleteTask = ( taskId ) => {
        if ( confirm( "Are you sure you want to delete this task?" ) ) {
            deleteTask( taskId );
        }
    };

    // Render the calendar view
    const renderCalendarView = () => {
        const weekDays = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

        return (
            <div className="flex-1 overflow-auto">
                <div className={ twMerge(
                    `grid grid-cols-7 gap-px p-1`,
                    `w-[100%] relative bg-gradient-to-br from-current-400/30 via-background-500/30 to-washed-purple-600/30 backdrop-blur-lg rounded-lg shadow-xl text-white`,
                    `overflow-hidden`,
                ) }>
                    { weekDays.map( ( day ) => (
                        <div key={ day } className={ `p-2 text-center text-xs font-medium  hover:bg-washed-purple-800/20 transition-colors duration-300 ease-in-out` }>
                            { day }
                        </div>
                    ) ) }

                    { calendarDays?.map( ( day, i ) => {
                        const tasksForDay = getTasksForDate( day );
                        // console.log( "renderCalendarView :: tasksForDay = ", tasksForDay );
                        const isCurrentMonth = isSameMonth( day, currentMonth );
                        const isToday = isSameDay( day, new Date() );
                        const isSelected = selectedDayDate && isSameDay( day, selectedDayDate );
                        const isInDragSelection =
                            isDragging &&
                            dragStartDate &&
                            dragEndDate &&
                            day >= ( dragStartDate < dragEndDate ? dragStartDate : dragEndDate ) &&
                            day <= ( dragStartDate < dragEndDate ? dragEndDate : dragStartDate );

                        return (
                            <div
                                key={ i }
                                className={ twMerge(
                                    `min-h-[80px] p-1 hover:bg-washed-purple-800/20 transition-colors duration-100 ease-in-out`,
                                    `w-[125%] relative bg-gradient-to-br from-current-400/30 via-background-500/30 to-washed-purple-600/30 backdrop-blur-lg p-4 border-sextary-300/30 text-white`,
                                    `border-2 border-sextary-300 rounded-lg`,
                                    isSelected && "bg-blue-50 dark:bg-washed-purple-900/20",
                                    isToday && "border border-washed-purple-500",
                                    isInDragSelection && "bg-washed-purple-100 dark:bg-washed-purple-900/40",
                                    !isCurrentMonth && "text-secondary-950 dark:text-secondary-400",
                                ) }
                                onMouseDown={ () => handleMouseDown( day ) }
                                onMouseMove={ () => handleMouseMove( day ) }
                                onMouseUp={ handleMouseUp }
                                onClick={ () => handleDateClick( day ) }
                                onDoubleClick={ () => handleDateDoubleClick( day ) }
                            >
                                <div className={ twMerge(
                                    `text-sm font-medium`,
                                    !isCurrentMonth && "text-secondary-950 dark:text-secondary-400",
                                    ``,
                                ) }>{ format( day, "d" ) }</div>

                                { tasksForDay && (
                                    <div className="flex flex-wrap gap-1">
                                        <TooltipProvider>
                                            { tasksForDay.map( ( task ) => (
                                                ( task && utils.val.isObject( task ) &&
                                                    <Tooltip key={ task?._id }>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={ `h-3 w-3 rounded-full cursor-pointer size-2 aspect-square border-2 border-secondary-300` }
                                                                style={ { backgroundColor: getPriorityColor( task?.priority ) } }
                                                                onClick={ ( e ) => handleTaskClick( e, task ) }
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="p-2 max-w-xs">
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-xs">{ task?.title }</div>
                                                                { task?.description && (
                                                                    <div className="text-xs text-muted-foreground line-clamp-2">{ task?.description }</div>
                                                                ) }
                                                                <div className="flex flex-wrap gap-0.5">
                                                                    { task?.tags.map( ( tag ) => (
                                                                        <Badge
                                                                            key={ tag?.id }
                                                                            style={ { backgroundColor: tag?.color } }
                                                                            className="text-xs py-0 px-1"
                                                                        >
                                                                            { String( tag?.name ) }
                                                                        </Badge>
                                                                    ) ) }
                                                                </div>
                                                                <div className="text-xs">
                                                                    Priority: <span className="capitalize">{ task.priority || "Medium" }</span>
                                                                </div>
                                                                { task?.user && <div className="text-xs">Assigned to: { task?.user.name }</div> }
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            ) ) }
                                        </TooltipProvider>
                                    </div>
                                ) }
                            </div>
                        );
                    } ) }
                </div>
            </div>
        );
    };

    // Render the timeline view
    const renderTimelineView = () => {
        return (
            <div className="border rounded-md h-full overflow-y-auto">
                <div className="sticky top-0  z-10 p-2 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium">{ format( timelineDate, "EEEE, MMMM d, yyyy" ) }</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={ () => setTimelineDate( subDays( timelineDate, 1 ) ) }>
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={ goToToday }>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={ () => setTimelineDate( addDays( timelineDate, 1 ) ) }>
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <div className="p-2">
                    { timeSlots?.map( ( timeSlot ) => {
                        const tasksForSlot = getTasksForTimeSlot( timeSlot );
                        const [ hours, minutes ] = timeSlot.split( ":" ).map( Number );
                        const isHourStart = minutes === 0;

                        return (
                            <div
                                key={ timeSlot }
                                className={ `flex border-b py-2 bg-background cursor-pointer ${ isHourStart ? "border-t border-t-gray-300 dark:border-t-gray-600" : ""
                                    }` }
                                onClick={ () => handleTimeSlotClick( timeSlot ) }
                            >
                                <div className={ `w-16 text-xs ${ isHourStart ? "font-medium" : "text-gray-500" }` }>{ timeSlot }</div>
                                <div className="flex-1">
                                    { tasksForSlot.map( ( task ) => (
                                        <div
                                            key={ task._id }
                                            className="mb-1 p-1 text-xs rounded"
                                            style={ { backgroundColor: getPriorityColor( task.priority ) + "33" } }
                                            onClick={ ( e ) => {
                                                e.stopPropagation();
                                                setSelectedTask( task );
                                                setIsNotesSidebarOpen( true );
                                            } }
                                        >
                                            <div className="font-medium">{ task.title }</div>
                                            { task.description && <div className="text-xs opacity-75 line-clamp-1">{ task.description }</div> }
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            </div>
        );
    };

    // Render selected day tasks
    const renderSelectedDayTasks = () => {
        if ( !selectedDayDate ) {
            return <div className="p-4 text-center text-muted-foreground">Click on a date to view tasks</div>;
        }

        if ( selectedDayTasks.length === 0 ) {
            return (
                <div className="p-4 text-center text-muted-foreground">
                    No tasks for { format( selectedDayDate, "MMMM d, yyyy" ) }
                </div>
            );
        }

        return (
            <div className="space-y-3 p-3">
                <h3 className="text-sm font-medium">Tasks for { format( selectedDayDate, "MMMM d, yyyy" ) }</h3>

                { selectedDayTasks?.map( ( task ) => (
                    <Card key={ task._id } className="overflow-hidden">
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span>{ task.title }</span>
                                <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={ () => handleEditTask( task ) }>
                                        <Edit className="h-3 w-3" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive"
                                        onClick={ () => handleDeleteTask( task._id ) }
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardTitle>
                            { task.description && <CardDescription className="text-xs mt-1">{ task.description }</CardDescription> }
                        </CardHeader>

                        <CardContent className="p-3 pt-1">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{ task?.timestampDue ? format( new Date( task?.timestampDue ), "h:mm a" ) : "No time set" }</span>
                                </div>

                                { task.priority && (
                                    <div>
                                        <Badge
                                            variant="outline"
                                            style={ {
                                                backgroundColor: getPriorityColor( task.priority ) + "33",
                                                color: getPriorityColor( task.priority ),
                                            } }
                                        >
                                            { String( task.priority ) }
                                        </Badge>
                                    </div>
                                ) }

                                { task.user && (
                                    <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                        <span>{ task.user.name }</span>
                                    </div>
                                ) }

                                { task.tags && task.tags.length > 0 && (
                                    <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                        { task.tags.map( ( tag ) => {
                                            // Find this tag in the array of all tags and fetch its info.
                                            let tagData = tags?.find( ( t ) => ( t?.name === tag ) );
                                            if ( tagData ) {
                                                return (
                                                    <Badge key={ tag.id } style={ { backgroundColor: tag.color } } className="text-xs py-0 px-1">
                                                        { String( tag.name ) }
                                                    </Badge>
                                                );
                                            }
                                        } ) }
                                    </div>
                                ) }
                            </div>
                        </CardContent>

                        { task.notes && task.notes.length > 0 && (
                            <CardFooter className="p-3 pt-0 border-t text-xs">
                                <div>
                                    <h4 className="font-medium mb-1">Notes</h4>
                                    <div className="text-muted-foreground">
                                        { task.notes.map( ( note, index ) => (
                                            <p key={ index } className="mb-1">
                                                { note }
                                            </p>
                                        ) ) }
                                    </div>
                                </div>
                            </CardFooter>
                        ) }
                    </Card>
                ) ) }
            </div>
        );
    };

    return (
        <div className="p-2">
            <div className="flex flex-row flex-nowrap items-center justify-around gap-2">
                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full flex-col">
                    <div className={ `flex flex-nowrap items-center justify-between` }>
                        <div className={ `flex flex-row gap-2 items-center justify-center` }>
                            <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={ goToPreviousMonth }>
                                <ChevronLeft className="h-3 w-3" />
                            </Button>

                            <Select value={ currentMonth.getMonth().toString() } onValueChange={ handleMonthChange }>
                                <SelectTrigger className="h-8 text-center items-center justify-between px-2 w-auto min-w-20 text-xs">
                                    <SelectValue placeholder={ format( currentMonth, "MMMM" ) } />
                                </SelectTrigger>
                                <SelectContent>
                                    { monthOptions.map( ( option ) => (
                                        <SelectItem key={ option.value } value={ option.value } className="text-xs">
                                            { option.label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>

                            <Select value={ currentMonth.getFullYear().toString() } onValueChange={ handleYearChange }>
                                <SelectTrigger className="h-8 text-center items-center justify-between px-2 w-auto min-w-16 text-xs">
                                    <SelectValue placeholder={ format( currentMonth, "yyyy" ) } />
                                </SelectTrigger>
                                <SelectContent>
                                    { yearOptions.map( ( option ) => (
                                        <SelectItem key={ option.value } value={ option.value } className="text-xs">
                                            { option.label }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={ goToNextMonth }>
                                <ChevronRight className="h-3 w-3" />
                            </Button>

                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={ goToToday }>
                                Today
                            </Button>
                        </div>

                        <div className={ `flex flex-row gap-2 items-center justify-center` }>

                            <FilterComponent
                                onFiltersChange={ setFilters }
                                availableFields={ [
                                    "title",
                                    "description",
                                    "status",
                                    "priority",
                                    "tags",
                                    "assignee"
                                ] }
                            />
                        </div>

                        <div className={ `flex flex-row gap-2 items-center justify-center` }>
                            <TabsList className={ `h-8 w-auto justify-center items-center self-center` }>
                                <TabsTrigger className={ `h-7` } value="month">Month</TabsTrigger>
                                <TabsTrigger className={ `h-7` } value="week">Week</TabsTrigger>
                                <TabsTrigger className={ `h-7` } value="day">Day</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className={ `flex flex-row gap-2 items-center justify-center` }>
                            <Button onClick={ onAddTask } className="h-8 text-xs px-2 ml-auto">
                                Add Task
                            </Button>
                        </div>
                    </div>


                    <div className={ `w-full flex-1 justify-center items-center` }>
                        <TabsContent value="month" className="flex flex-col space-y-4">
                            <div className="border border-transparent rounded-md overflow-auto">{ renderCalendarView() }</div>
                            <div className="border border-transparent rounded-md overflow-auto">{ renderSelectedDayTasks() }</div>
                        </TabsContent>

                        <TabsContent value="day">
                            { renderTimelineView() }
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Task Dialog for creating/editing tasks */ }
                <TodoDialog
                    open={ isTaskDialogOpen }
                    onOpenChange={ setIsTaskDialogOpen }
                    task={ selectedTask }
                    columnId={ selectedColumnId }
                    defaultDate={ selectedDate }
                    defaultEndDate={ dragEndDate }
                />

                {/* Notes Sidebar */ }
                <TodoNotesSidebar
                    task={ selectedTask }
                    isOpen={ isNotesSidebarOpen }
                    onClose={ () => setIsNotesSidebarOpen( false ) }
                />
            </div>
        </div>
    );
}

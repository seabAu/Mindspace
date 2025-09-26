// import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react";
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
    isDate,
} from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Tag, Edit, Trash } from "lucide-react";
// import { TodoDialog } from "@/features/Todo/blocks/Dialog/log-dialog";
// import { NotesSidebar } from "@/features/Todo/blocks/Sidebar/NotesSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterComponent } from "@/features/Todo/blocks/Filters/FilterComponent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as utils from 'akashatools';
import { twMerge } from "tailwind-merge";
import { stringAsColor } from "@/lib/utilities/color";
import usePlanner from "@/lib/hooks/usePlanner";
import usePlannerStore from "@/store/planner.store";
import { NotesSidebar } from "../../../../Planner/blocks/Sidebar/NotesSidebar";
import LogCreate from "../LogCreate";
import useGlobalStore from "@/store/global.store";
import PlannerDialog from "@/features/Planner/components/dialog/PlannerDialog";
import PlannerDialogWrapper from "@/features/Planner/components/dialog/PlannerDialogWrapper";
import useReflectStore from "@/store/reflect.store";
import useReflect from "@/lib/hooks/useReflect";
import DocumentCreate from "./DocumentCreate";


function DocumentCalendarView ( {
    // Config
    dataType = 'note',
    parentPath = '/dash',
    customDocumentForm = null,

    // Data
    selected, setSelected,
    items = [],
    initialData = {},
    selectedDate = new Date( Date.now() ),
    setSelectedDate,
    dialogType, setDialogType,
    dialogData, setDialogData,

    // Callback functions
    onClickItemFn = () => { },
    onCancel = () => { },
    onRefresh = () => { },
    onDelete = () => { },
    onCreateSubmit = () => { },
    onCreateStart = () => { },
    onUpdateSubmit = () => { },
    onUpdateStart = () => { },
    onChange = () => { },
    // documents, setDocuments,
}, ...props ) {

    const {
        workspaceId,
        schemas, getSchema, getUserNameById,
        data, getData,
        debug, setDebug,
    } = useGlobalStore();

    const allData = getData();

    // const [ selectedDate, setSelectedDate ] = useState( null );
    const [ currentMonth, setCurrentMonth ] = useState( new Date() );
    const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState( false );
    // const [ selected, setSelected ] = useState( null );
    const [ selectedColumnId, setSelectedColumnId ] = useState( null );
    // const [ isNotesSidebarOpen, setIsNotesSidebarOpen ] = useState( false );
    const [ dragStartDate, setDragStartDate ] = useState( null );
    const [ dragEndDate, setDragEndDate ] = useState( null );
    const [ isDragging, setIsDragging ] = useState( false );
    const [ showTimelineView, setShowTimelineView ] = useState( false );
    const [ timelineDate, setTimelineDate ] = useState( new Date() );
    const [ selectedTimeSlot, setSelectedTimeSlot ] = useState( null );
    const [ filters, setFilters ] = useState( [] );
    const [ tags, setTags ] = useState( [] );
    const [ categories, setCategories ] = useState( [] );
    // const [ filteredTasks, setFilteredTasks ] = useState( [] );
    const [ activeTab, setActiveTab ] = useState( "month" );
    const [ selectedDayLogs, setSelectedDayLogs ] = useState( [] );
    const [ selectedDayDate, setSelectedDayDate ] = useState( null );

    // Get all logs
    // const logsData = useMemo( () => getAllTasks(), [ getAllTasks ] );

    // Apply filters to logs
    /* useEffect( () => {
        if ( filters.length === 0 ) {
            setFilteredTasks( logsData.filter( ( log ) => ( log?.todoListId === activeListId || activeListId === null ) ) );
            return;
        }

        const filtered = logsData.filter( ( log ) => {
            return filters.every( ( filter ) => {
                const value = filter.value.toLowerCase();

                switch ( filter.field ) {
                    case "title":
                        return log.title.toLowerCase().includes( value );
                    case "description":
                        return log.description?.toLowerCase().includes( value ) || false;
                    case "status":
                        return log.status?.toLowerCase().includes( value ) || false;
                    case "priority":
                        return log.priority?.toLowerCase().includes( value ) || false;
                    case "tags":
                        return log.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) );
                    case "assignee":
                        return log.user?.name.toLowerCase().includes( value ) || false;
                    default:
                        return true;
                }
            } );
        } );

        setFilteredTasks( filtered );
    }, [ filters, logsData ] ); */

    // Get logs for a specific date
    const getItemsForDate = useCallback(
        ( date ) => {
            // if ( !date || !isValid( date ) ) return [];

            return items?.filter( ( log ) => {
                // console.log( "getItemsForDate :: date = ", date, " :: ", "log?.date = ", log?.date, isValid( new Date( log?.date ) ), items, filteredTasks, " :: parseISO(date) = ", new Date( date ).toLocaleDateString(), " :: ", "parseISO(log?.date) = ", new Date( log?.date ).toLocaleDateString() );
                if ( !log?.date ) return false;

                try {
                    let itemDate = new Date( log?.date ).toLocaleDateString();
                    let selectedDate = new Date( date ).toLocaleDateString();

                    // let itemDate;
                    // // Handle different date formats
                    // if ( typeof log?.date === "string" ) { itemDate = parseISO( log?.date ); }
                    // else { itemDate = new Date( log?.date ); }

                    // Check if the date is valid
                    // if ( !isValid( itemDate ) ) return false;
                    // console.log( "getItemsForDate :: date = ", date, " :: ", "log?.date = ", log?.date, isValid( new Date( log?.date ) ), items, filteredTasks, " :: ", "isSameDay( new Date( log?.date ), date ) = ", isSameDay( new Date( log?.date ), date ), " :: parseISO(date) = ", new Date( date ).toLocaleDateString(), " :: ", "parseISO(log?.date) = ", new Date( log?.date ).toLocaleDateString()  );

                    return isSameDay( itemDate, selectedDate );
                } catch ( error ) {
                    // If there's any error parsing the date, skip this log
                    // console.log( "err" );
                    return false;
                }
            } );
        },
        [ items, selectedDate ],
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

        // Set the selected day and get its logs
        setSelectedDayDate( new Date( date ) );
        // console.log( "dateclick :: getItemsForDate( date ) = ", date, isValid( date ), getItemsForDate( date ), logsData, filteredTasks );
        setSelectedDayLogs( getItemsForDate( new Date( date ) ) );
    };

    // Handle double click to create log
    const handleDateDoubleClick = ( date ) => {
        if ( !date || !isValid( date ) ) return;

        // If this date is the same as the current, assume a valid doubleclick. 
        // We want to avoid instances where the dialog is triggered on clicking multiple days too quickly.
        if ( date === selectedDate ) {
            setSelectedDate( date );
            setSelected( null );

            // Find the first column to add the log to
            /* const columns = useTasksStore.getState().columns;
            if ( columns.length > 0 ) {
                setSelectedColumnId( columns[ 0 ].id );
                setIsCreateDialogOpen( true );
            } */
        }
    };

    // Handle click on a log dot
    const handleLogClick = ( e, log ) => {
        e.stopPropagation();
        setSelected( log );
        setSelectedDayLogs( [ log ] );
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

            setSelectedDate( { from: startDate, to: endDate } );

            /* setSelectedDate( startDate );

            // Find the first column to add the log to
            const columns = useTasksStore.getState().columns;
            if ( columns.length > 0 ) {
                setSelectedColumnId( columns[ 0 ].id );
                setIsCreateDialogOpen( true );
            } */
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

        // Find the first column to add the log to
        /* const columns = useTasksStore.getState().columns;
        if ( columns.length > 0 ) {
            setSelectedColumnId( columns[ 0 ].id );
            setIsCreateDialogOpen( true );
        } */
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

    // Get logs for the timeline view
    const itemsForTimeline = useMemo( () => {
        return getItemsForDate( timelineDate );
    }, [ timelineDate, getItemsForDate ] );

    // Map logs to time slots
    const getItemsForTimeSlot = ( timeSlot ) => {
        const [ hours, minutes ] = timeSlot.split( ":" ).map( Number );

        if ( utils.val.isValidArray( itemsForTimeline, true ) ) {
            return itemsForTimeline?.filter( ( log ) => {
                if ( !log?.date ) return false;

                try {
                    let itemDate;

                    if ( typeof log?.date === "string" ) { itemDate = parseISO( log?.date ); }
                    else { itemDate = new Date( log?.date ); }

                    if ( !isValid( itemDate ) ) return false;

                    return itemDate.getHours() === hours && Math.floor( itemDate.getMinutes() / 30 ) * 30 === minutes;
                } catch {
                    return false;
                }
            } );
        }
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

    // Handle edit item (log)
    const handleEditItem = ( item ) => {
        setSelected( item );
        setIsCreateDialogOpen( true );
    };

    // Handle delete item (log)
    const handleDeleteItem = ( id ) => {
        if ( confirm( "Are you sure you want to delete this item?" ) ) {
            onDelete( id, items, setItems, dataType );
        }
    };

    // Render the calendar view
    const renderCalendarView = () => {
        const weekDays = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

        return (
            <div className="flex-1 overflow-auto w-full">
                <div className={ twMerge(
                    `grid grid-cols-7 gap-px bg-sextary-200 dark:bg-sextary-700 p-1`,
                    `w-[100%] relative bg-gradient-to-br from-sextary-400/30 via-sextary-500/30 to-sextary-600/30 text-white`,
                    `overflow-hidden`,
                ) }>
                    { weekDays.map( ( day ) => (
                        <div key={ day } className={ `p-2 text-center text-xs font-medium  hover:bg-washed-purple-800/20 transition-colors duration-300 ease-in-out` }>
                            { day }
                        </div>
                    ) ) }

                    { calendarDays?.map( ( day, i ) => {
                        const itemsForDay = getItemsForDate( day );
                        // console.log( "renderCalendarView :: itemsForDay = ", itemsForDay );
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
                                    `min-h-[80px] p-1 bg-sextary-800 hover:bg-washed-purple-800/20 transition-colors duration-100 ease-in-out`,
                                    `hover:bg-gradient-to-br hover:from-sextary-400/30 hover:via-sextary-500/30 hover:to-washed-purple-600/30 hover:backdrop-blur-lg transition-all duration-300 ease-in-out`,
                                    // `w-[125%] relative p-4 rounded-lg shadow-xl border border-sextary-300/30 text-white`,
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

                                { itemsForDay && (
                                    <div className="flex flex-wrap gap-1 justify-center items-center">
                                        <TooltipProvider>
                                            { itemsForDay.map( ( item ) => (
                                                ( item && utils.val.isObject( item ) &&
                                                    <Tooltip key={ item?._id }>
                                                        <TooltipTrigger>
                                                            <div
                                                                className={ `rounded-full cursor-pointer size-5 aspect-square border-2 border-secondary-300 justify-center items-center self-center` }
                                                                // style={ { backgroundColor: stringAsColor( item?.mood ) } }
                                                                onClick={ ( e ) => onClickItemFn( e, item ) }
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="p-2 max-w-xs !z-[2000]">
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-xs">{ item?.title }</div>
                                                                { selectedDate && isDate( selectedDate ) && ( <div className="text-xs flex-col">
                                                                    <span className="capitalize">{ format( selectedDate, "MMM d, yyyy" ) }</span>
                                                                </div> ) }
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
            <div className="border rounded-lg h-full overflow-y-auto">
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
                    { timeSlots?.map( ( timeSlot, timeSlotIndex ) => {
                        const startTime = timeSlot?.startTime;
                        const endTime = timeSlot?.endTime;
                        const itemsForSlot = getItemsForTimeSlot( timeSlot );
                        const [ hours, minutes ] = timeSlot.split( ":" ).map( Number );
                        const isHourStart = minutes === 0;

                        return (
                            <div
                                key={ `timeblocks-slot-${ timeSlotIndex }` }
                                className={ `flex border-b py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${ isHourStart ? "border-t border-t-gray-300 dark:border-t-gray-600" : ""
                                    }` }
                                onClick={ () => handleTimeSlotClick( timeSlot ) }
                            >
                                <div className={ `w-16 text-xs ${ isHourStart ? "font-medium" : "text-gray-500" }` }>{ timeSlot?.activity }</div>
                                <div className="flex-1">
                                    { utils.val.isValidArray( itemsForSlot, true ) && itemsForSlot?.map( ( item ) => (
                                        <div
                                            key={ item._id }
                                            className="mb-1 p-1 text-xs rounded"
                                            // onClick={ ( e ) => {
                                            //     // e.stopPropagation();
                                            //     setSelected( log );
                                            //     // setIsNotesSidebarOpen( !isNotesSidebarOpen );
                                            //     setNotesOpen( true );
                                            // } }
                                            onClick={ () => onClickItemFn( item ) }
                                        >
                                            { item?.title && ( <div className="font-medium">{ item?.title }</div> ) }
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

    // Render selected day logs
    const renderSelectedDayItems = () => {
        if ( !selectedDayDate ) {
            return <div className="p-4 text-center text-muted-foreground">Click on a date to view items</div>;
        }

        if ( selectedDayLogs.length === 0 ) {
            return (
                <div className="w-full h-full">
                    <div className="p-4 text-center text-muted-foreground">
                        No log exists for { format( selectedDayDate, "MMMM d, yyyy" ) }. Create one now?
                    </div>

                    <DocumentCreate
                        schema={ getSchema( dataType ) }
                        date={ selectedDayDate ?? new Date( Date.now() ) }
                        dataType={ dataType }
                        parentPath={ parentPath }
                        initialData={ initialData }
                        date={ date }
                        onCancel={ onCancel }
                        onRefresh={ onRefresh }
                        onCreateSubmit={ onCreateSubmit }
                        onCreateStart={ onCreateStart }
                        onChange={ onChange }
                    />
                </div>
            );
        }

        return (
            <div className="space-y-3 p-3">
                <h3 className="text-sm font-medium">Logs for { format( selectedDayDate, "MMMM d, yyyy" ) }</h3>

                { selectedDayLogs?.map( ( log ) => (
                    <Card key={ log?._id } className="overflow-hidden">
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span>{ log.title }</span>
                                <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={
                                        () => {
                                            // handleEditItem( log );
                                            onEditStart( log, 'log' );
                                        }
                                    }>
                                        <Edit className="h-3 w-3" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive"
                                        onClick={ () => handleDeleteItem( log._id ) }
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardTitle>
                            { log?.description && <CardDescription className="text-xs mt-1">{ log?.description ?? '' }</CardDescription> }
                        </CardHeader>

                        <CardContent className="p-3 pt-1">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{ log?.date ? format( new Date( log?.date ), "h:mm a" ) : "No time set" }</span>
                                </div>

                                { log?.mood && (
                                    <div>
                                        <Badge
                                            variant="outline"
                                            style={ {
                                                backgroundColor: stringAsColor( log?.mood ) + "33",
                                                color: stringAsColor( log?.mood ),
                                            } }
                                        >
                                            { log.mood }
                                        </Badge>
                                    </div>
                                ) }

                                { log.userId && (
                                    <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                        <span>{ getUserNameById( log.userId ) }</span>
                                    </div>
                                ) }

                                { log?.tags && utils.val.isValidArray( log?.tags, true ) && (
                                    <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                        { log.tags.map( ( tag ) => {
                                            // Find this tag in the array of all tags and fetch its info.
                                            // let tagData = tags?.find( ( t ) => ( t?.name === tag ) );
                                            if ( tag ) {
                                                return (
                                                    <Badge key={ tag } style={ { backgroundColor: stringAsColor( tag ) } } className="text-xs py-0 px-1">
                                                        { caseCamelToSentence( tag ) }
                                                    </Badge>
                                                );
                                            }
                                        } ) }
                                    </div>
                                ) }
                            </div>
                        </CardContent>

                        {/* { log.notes && log.notes.length > 0 && (
                            <CardFooter className="p-3 pt-0 border-t text-xs">
                                <div>
                                    <h4 className="font-medium mb-1">Notes</h4>
                                    <div className="text-muted-foreground">
                                        { log.notes.map( ( note, index ) => (
                                            <p key={ index } className="mb-1">
                                                { note }
                                            </p>
                                        ) ) }
                                    </div>
                                </div>
                            </CardFooter>
                        ) } */}
                        { log.notes && log.notes?.length > 0 && (
                            <CardFooter className="p-3 pt-0 border-t text-xs">
                                <div>
                                    <h4 className="font-medium mb-1">Notes</h4>
                                    <div className="text-muted-foreground">
                                        <p key={ `log-notes` } className="mb-1">
                                            { notes }
                                        </p>
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
        <div className="p-0">
            <div className="flex flex-row flex-nowrap items-center justify-around gap-2">
                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full flex-col">
                    <div className={ `flex flex-nowrap items-center justify-between` }>
                        <div className={ `flex flex-row gap-2 items-center justify-center` }>
                            <TabsList className={ `h-8 w-auto justify-center items-center self-center` }>
                                <TabsTrigger className={ `h-7` } value="month">Month</TabsTrigger>
                                <TabsTrigger className={ `h-7` } value="week">Week</TabsTrigger>
                                <TabsTrigger className={ `h-7` } value="day">Day</TabsTrigger>
                            </TabsList>
                        </div>

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

                            {/* <FilterComponent
                                onFiltersChange={ setFilters }
                                availableFields={ [
                                    "title",
                                    "description",
                                    "content",
                                    "priority",
                                    "tags",
                                    "assignee"
                                ] }
                            /> */}
                        </div>

                        <div className={ `flex flex-row gap-2 items-center justify-center` }>
                            <Button onClick={ () => {
                                onCreateStart(
                                    {
                                        // (selectedDate ? ...{selectedDate: selectedDate} :null )
                                        title: `New log for ${ selectedDate ? new Date( selectedDate ).toLocaleString() : new Date( Date.now() ) }`,
                                        date: selectedDate ? new Date( selectedDate ) : new Date( Date.now() ),
                                    },
                                    'log'
                                );
                            } } className="h-8 text-xs px-2 ml-auto">
                                Add
                            </Button>
                        </div>
                    </div>


                    <div className={ `w-full flex-1 justify-center items-center` }>
                        <TabsContent value="month" className="flex flex-col space-y-4">
                            <div className="border rounded-lg overflow-auto">{ renderCalendarView() }</div>
                            <div className="border rounded-lg overflow-auto">{ renderSelectedDayItems() }</div>
                        </TabsContent>

                        <TabsContent value="week">
                            { renderTimelineView() }
                        </TabsContent>

                        <TabsContent value="day">
                            { renderTimelineView() }
                        </TabsContent>
                    </div>
                </Tabs>

                <PlannerDialogWrapper />

                {/* Edit Dialog */ }
                { dialogType === 'edit' && (
                    <PlannerDialog
                        refData={ allData }
                        data={ dialogData ?? selected }
                        setData={ setDialogData }
                        dataSchema={ getSchema( dataType ) }
                        dialogOpen={ dialogType === 'edit' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                        // handleSubmit={ ( data ) => { handleUpdateLog( data ); } }
                        handleSubmit={ ( data ) => { onEditSubmit( data, 'log' ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'edit' }
                        dataType={ 'log' }
                    />
                ) }

                {/* Notes Sidebar */ }
                {/* { selected && ( <NotesSidebar
                    isOpen={ isNotesSidebarOpen }
                    // onClose={ () => setIsNotesSidebarOpen( !isNotesSidebarOpen ) }
                    onClose={ () => setIsNotesSidebarOpen( false ) }
                    item={ selected }
                    fieldKey={ 'notes' }
                    onCloseOnSave={ false }
                    onUpdateItem={ onUpdateItem }
                /> ) } */}
            </div>
        </div>
    );
}

export default DocumentCalendarView;
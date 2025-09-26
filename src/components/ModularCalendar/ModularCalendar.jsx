"use client";

import { useState, useMemo, useCallback, memo, Suspense, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Edit, Trash2, Copy, ChevronLeft, ChevronRight, Clock, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
    subDays,
    startOfWeek,
    endOfWeek,
    isSameMonth,
} from "date-fns";

/**
 * Modular calendar component for displaying timestamped data entries
 * @param {Array} entries - Array of data entries with timestamp fields
 * @param {Function} fetchData - Optional function to fetch data (enables refresh button)
 * @param {Function} onDateClick - Handler for date selection
 * @param {Function} onTimeClick - Handler for time slot selection
 * @param {Function} onEntryEdit - Handler for editing entries
 * @param {Function} onEntryCreate - Handler for creating new entries
 * @param {Function} onEntryClone - Handler for cloning entries
 * @param {Function} onEntryDelete - Handler for deleting entries
 * @param {Function} renderEntryCard - Optional custom renderer for entry cards
 * @param {Object} fieldConfig - Configuration for dynamic field rendering
 * @param {Array} tooltipFields - Array of field names to show in tooltips
 * @param {String} timestampField - Field name containing the timestamp (default: 'date')
 * @param {String} timelineOrientation - Timeline orientation: 'vertical' or 'horizontal'
 * @param {Number} lineSpacing - Line spacing for timeline view (default: 60)
 * @param {String} maxSize - Maximum size for calendar container
 * @param {String} title - Calendar title
 * @param {String} dataType - Type of data being displayed
 */
const ModularCalendar = memo(
    ( {
        entries = [],
        fetchData,
        onDateClick,
        onTimeClick,
        onEntryEdit,
        onEntryCreate,
        onEntryClone,
        onEntryDelete,
        renderEntryCard,
        fieldConfig = {},
        tooltipFields = [],
        timestampField = "date",
        timelineOrientation = "vertical",
        lineSpacing = 60,
        maxSize = "100%",
        title = "Calendar",
        dataType = "entry",
    } ) => {
        const [ currentMonth, setCurrentMonth ] = useState( new Date() );
        const [ selectedDate, setSelectedDate ] = useState( null );
        const [ selectedTime, setSelectedTime ] = useState( null );
        const [ isLoading, setIsLoading ] = useState( false );
        const [ localEntries, setLocalEntries ] = useState( entries );
        const [ editingEntry, setEditingEntry ] = useState( null );
        const [ activeTab, setActiveTab ] = useState( "month" );
        const [ selectedDayEntries, setSelectedDayEntries ] = useState( [] );
        const [ timelineDate, setTimelineDate ] = useState( new Date() );
        const [ focusedEntry, setFocusedEntry ] = useState( null );
        const sidebarRef = useRef( null );

        useEffect( () => {
            setLocalEntries( entries );
            // Reset focused entry when data changes
            setFocusedEntry( null );
        }, [ entries ] );

        /**
         * Handles data refresh when fetchData function is provided
         */
        const handleRefresh = useCallback( async () => {
            if ( !fetchData || typeof fetchData !== "function" ) return;

            setIsLoading( true );
            try {
                const newData = await fetchData();
                setLocalEntries( newData || [] );
            } catch ( error ) {
                console.error( "Failed to fetch data:", error );
            } finally {
                setIsLoading( false );
            }
        }, [ fetchData ] );

        useEffect( () => {
            if ( fetchData && typeof fetchData === "function" && localEntries.length === 0 ) {
                handleRefresh();
            }
        }, [ fetchData, localEntries.length, handleRefresh ] );

        /**
         * Gets entries for a specific date
         * @param {Date} date - Target date
         * @returns {Array} Filtered entries for the date
         */
        const getEntriesForDate = useCallback(
            ( date ) => {
                if ( !date || !isValid( date ) ) return [];

                return localEntries.filter( ( entry ) => {
                    if ( !entry[ timestampField ] ) return false;

                    try {
                        const entryDate = new Date( entry[ timestampField ] );
                        if ( !isValid( entryDate ) ) return false;
                        return isSameDay( entryDate, date );
                    } catch {
                        return false;
                    }
                } );
            },
            [ localEntries, timestampField ],
        );

        /**
         * Gets entries for a specific hour
         * @param {Date} date - Target date
         * @param {Number} hour - Target hour (0-23)
         * @returns {Array} Filtered entries for the hour
         */
        const getEntriesForHour = useCallback(
            ( date, hour ) => {
                if ( !date || !isValid( date ) ) return [];

                return localEntries.filter( ( entry ) => {
                    if ( !entry[ timestampField ] ) return false;

                    try {
                        const entryDate = new Date( entry[ timestampField ] );
                        if ( !isValid( entryDate ) ) return false;
                        return isSameDay( entryDate, date ) && entryDate.getHours() === hour;
                    } catch {
                        return false;
                    }
                } );
            },
            [ localEntries, timestampField ],
        );

        /**
         * Handles date click events
         * @param {Date} date - Clicked date
         */
        const handleDateClick = useCallback(
            ( date ) => {
                if ( !date || !isValid( date ) ) return;

                setSelectedDate( date );
                setSelectedTime( null );
                const dayEntries = getEntriesForDate( date );
                setSelectedDayEntries( dayEntries );
                setFocusedEntry( null );
                onDateClick?.( date );
            },
            [ onDateClick, getEntriesForDate ],
        );

        /**
         * Handles time slot click events
         * @param {Date} date - Target date
         * @param {Number} hour - Target hour
         */
        const handleTimeClick = useCallback(
            ( date, hour ) => {
                setSelectedTime( { date, hour } );
                setSelectedDate( date );
                const hourEntries = getEntriesForHour( date, hour );
                setSelectedDayEntries( hourEntries );
                setFocusedEntry( null );
                onTimeClick?.( date, hour );
            },
            [ onTimeClick, getEntriesForHour ],
        );

        const handleEntryClick = useCallback( ( entry ) => {
            setFocusedEntry( ( prev ) => ( prev === entry ? null : entry ) );
        }, [] );

        const handleEntryDoubleClick = useCallback( ( entry ) => {
            setEditingEntry( entry );
        }, [] );

        const calendarDays = useMemo( () => {
            const monthStart = startOfMonth( currentMonth );
            const monthEnd = endOfMonth( currentMonth );
            const startDate = startOfWeek( monthStart );
            const endDate = endOfWeek( monthEnd );

            return eachDayOfInterval( { start: startDate, end: endDate } );
        }, [ currentMonth ] );

        const timeSlots = useMemo( () => {
            const slots = [];
            for ( let hour = 0; hour < 24; hour++ ) {
                for ( let minute = 0; minute < 60; minute += 30 ) {
                    slots.push( `${ hour.toString().padStart( 2, "0" ) }:${ minute.toString().padStart( 2, "0" ) }` );
                }
            }
            return slots;
        }, [] );

        /**
         * Renders individual entry tooltip content
         * @param {Object} entry - Entry object
         * @returns {JSX.Element} Tooltip content
         */
        const renderEntryTooltip = useCallback(
            ( entry ) => {
                const fieldsToShow =
                    tooltipFields.length > 0
                        ? tooltipFields
                        : entry.title
                            ? [ "title", timestampField ]
                            : Object.keys( entry ).slice( 0, 3 );

                return (
                    <div className="space-y-1 max-w-xs">
                        { fieldsToShow.map( ( field ) => {
                            if ( !entry[ field ] ) return null;

                            let value = entry[ field ];
                            if ( field === timestampField && isValid( new Date( value ) ) ) {
                                value = format( new Date( value ), "MMM d, yyyy h:mm a" );
                            }

                            return (
                                <div key={ field } className="text-xs">
                                    <span className="font-medium capitalize">{ field }: </span>
                                    <span>{ String( value ) }</span>
                                </div>
                            );
                        } ) }
                    </div>
                );
            },
            [ tooltipFields, timestampField ],
        );

        /**
         * Renders calendar month view with improved styling
         */
        const renderMonthView = useMemo( () => {
            const weekDays = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

            return (
                <div className="border-2 border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="grid grid-cols-7 gap-0">
                        { weekDays.map( ( day ) => (
                            <div key={ day } className="p-3 text-center text-sm font-semibold bg-muted/50 border-b-2 border-border">
                                { day }
                            </div>
                        ) ) }

                        { calendarDays.map( ( day, i ) => {
                            const dayEntries = getEntriesForDate( day );
                            const isCurrentMonth = isSameMonth( day, currentMonth );
                            const isToday = isSameDay( day, new Date() );
                            const isSelected = selectedDate && isSameDay( day, selectedDate );

                            return (
                                <div
                                    key={ i }
                                    className={ cn(
                                        "min-h-24 p-2 border-b border-r cursor-pointer transition-all duration-200 hover:shadow-md",
                                        isCurrentMonth
                                            ? "bg-card hover:bg-accent/50"
                                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
                                        isToday && "ring-2 ring-primary ring-inset bg-primary/5",
                                        isSelected && "bg-primary/10 ring-1 ring-primary",
                                        isMobile && "min-h-16 p-1",
                                    ) }
                                    onClick={ () => handleDateClick( day ) }
                                >
                                    <div
                                        className={ cn(
                                            "text-sm font-semibold mb-2",
                                            isToday && "text-primary font-bold",
                                            isMobile && "text-xs mb-1",
                                        ) }
                                    >
                                        { format( day, "d" ) }
                                    </div>

                                    { dayEntries.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            <TooltipProvider>
                                                { isMobile ? (
                                                    // Mobile: Single badge with count
                                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                                                        { dayEntries.length }
                                                    </Badge>
                                                ) : (
                                                    // Desktop: Individual dots with tooltips
                                                    dayEntries
                                                        .slice( 0, 6 )
                                                        .map( ( entry, idx ) => (
                                                            <Tooltip key={ idx }>
                                                                <TooltipTrigger>
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary hover:bg-primary/80 transition-colors shadow-sm" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom" className="z-50">
                                                                    { renderEntryTooltip( entry ) }
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) )
                                                ) }
                                                { !isMobile && dayEntries.length > 6 && (
                                                    <span className="text-xs text-muted-foreground font-medium">+{ dayEntries.length - 6 }</span>
                                                ) }
                                            </TooltipProvider>
                                        </div>
                                    ) }
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            );
        }, [ calendarDays, currentMonth, selectedDate, getEntriesForDate, handleDateClick, renderEntryTooltip ] );

        /**
         * Renders timeline view based on orientation
         */
        const renderTimelineView = useMemo( () => {
            const currentDate = timelineDate || selectedDate || new Date();
            const dayEntries = getEntriesForDate( currentDate );

            if ( timelineOrientation === "horizontal" ) {
                return (
                    <div
                        className="space-y-4 border-2 border-border rounded-xl p-4 bg-card shadow-sm"
                        style={ { maxHeight: maxSize } }
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{ format( currentDate, "EEEE, MMMM d, yyyy" ) }</h3>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( subDays( currentDate, 1 ) ) }>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( new Date() ) }>
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( addDays( currentDate, 1 ) ) }>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <div className="flex bg-muted/50">
                                <div className="w-32 p-3 font-semibold border-r">Entries</div>
                                <div className="flex-1 flex">
                                    { Array.from( { length: 24 }, ( _, hour ) => (
                                        <div
                                            key={ hour }
                                            className="flex-1 p-2 text-center text-sm border-r cursor-pointer hover:bg-accent transition-colors"
                                            onClick={ () => handleTimeClick( currentDate, hour ) }
                                        >
                                            { hour }
                                        </div>
                                    ) ) }
                                </div>
                            </div>

                            { dayEntries.length > 0 ? (
                                dayEntries.map( ( entry, idx ) => {
                                    const entryDate = new Date( entry[ timestampField ] );
                                    const startHour = entryDate.getHours();
                                    const duration = entry.duration || 1;

                                    return (
                                        <div
                                            key={ idx }
                                            className="flex border-b hover:bg-accent/30 transition-colors"
                                            style={ { minHeight: lineSpacing } }
                                        >
                                            <div className="w-32 p-3 border-r">
                                                <div className="text-sm font-medium truncate">
                                                    { entry.title || entry[ Object.keys( entry )[ 0 ] ] || "Entry" }
                                                </div>
                                            </div>
                                            <div className="flex-1 relative">
                                                <div
                                                    className={ cn(
                                                        "absolute bg-primary/20 border-l-4 border-primary h-full flex items-center px-3 cursor-pointer hover:bg-primary/30 transition-colors",
                                                        focusedEntry === entry && "bg-primary/40 ring-2 ring-primary",
                                                    ) }
                                                    style={ {
                                                        left: `${ ( startHour / 24 ) * 100 }%`,
                                                        width: `${ ( duration / 24 ) * 100 }%`,
                                                    } }
                                                    onClick={ () => handleEntryClick( entry ) }
                                                    onDoubleClick={ () => handleEntryDoubleClick( entry ) }
                                                >
                                                    <span className="text-sm truncate font-medium">{ entry.title || "Entry" }</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } )
                            ) : (
                                <div className="text-center text-muted-foreground py-12 text-lg">No entries for selected date</div>
                            ) }
                        </div>
                    </div>
                );
            } else {
                return (
                    <div
                        className="border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm"
                        style={ { maxHeight: maxSize } }
                    >
                        <div className="sticky top-0 bg-background z-10 p-4 border-b-2 border-border flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{ format( currentDate, "EEEE, MMMM d, yyyy" ) }</h3>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( subDays( currentDate, 1 ) ) }>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( new Date() ) }>
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={ () => setTimelineDate( addDays( currentDate, 1 ) ) }>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-y-auto">
                            { timeSlots.map( ( timeSlot, timeSlotIndex ) => {
                                const [ hours, minutes ] = timeSlot.split( ":" ).map( Number );
                                const entriesForSlot = getEntriesForHour( currentDate, hours ).filter( ( entry ) => {
                                    const entryDate = new Date( entry[ timestampField ] );
                                    return Math.floor( entryDate.getMinutes() / 30 ) * 30 === minutes;
                                } );
                                const isHourStart = minutes === 0;

                                return (
                                    <div
                                        key={ timeSlotIndex }
                                        className={ cn(
                                            "flex border-b cursor-pointer hover:bg-accent/30 transition-colors",
                                            isHourStart && "border-t-2 border-border",
                                        ) }
                                        style={ { minHeight: lineSpacing / 2 } }
                                        onClick={ () => handleTimeClick( currentDate, hours ) }
                                    >
                                        <div
                                            className={ cn(
                                                "w-20 p-3 text-sm bg-muted/50 border-r-2 border-border text-center font-medium",
                                                isHourStart ? "font-semibold" : "text-muted-foreground",
                                            ) }
                                        >
                                            { timeSlot }
                                        </div>
                                        <div className="flex-1 p-2">
                                            { entriesForSlot.length > 0 ? (
                                                <div className="space-y-1">
                                                    { entriesForSlot.map( ( entry, idx ) => (
                                                        <div
                                                            key={ idx }
                                                            className={ cn(
                                                                "text-sm bg-primary/10 p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors border-l-4 border-primary",
                                                                focusedEntry === entry && "bg-primary/30 ring-2 ring-primary",
                                                            ) }
                                                            onClick={ ( e ) => {
                                                                e.stopPropagation();
                                                                handleEntryClick( entry );
                                                            } }
                                                            onDoubleClick={ ( e ) => {
                                                                e.stopPropagation();
                                                                handleEntryDoubleClick( entry );
                                                            } }
                                                        >
                                                            <div className="font-semibold">{ entry.title || "Entry" }</div>
                                                            { entry.description && (
                                                                <div className="text-muted-foreground truncate text-xs mt-1">{ entry.description }</div>
                                                            ) }
                                                        </div>
                                                    ) ) }
                                                </div>
                                            ) : null }
                                        </div>
                                    </div>
                                );
                            } ) }
                        </div>
                    </div>
                );
            }
        }, [
            timelineDate,
            selectedDate,
            timelineOrientation,
            maxSize,
            lineSpacing,
            getEntriesForDate,
            getEntriesForHour,
            handleTimeClick,
            handleEntryClick,
            handleEntryDoubleClick,
            focusedEntry,
            timeSlots,
            timestampField,
        ] );

        /**
         * Renders entry cards for selected date/time - responsive layout
         */
        const renderEntryCards = useMemo( () => {
            const entriesToShow = focusedEntry ? [ focusedEntry ] : selectedDayEntries;

            if ( entriesToShow.length === 0 ) {
                return selectedDate ? (
                    <div className="p-6 text-center text-muted-foreground">
                        No entries for { format( selectedDate, "MMMM d, yyyy" ) }. Click to create one.
                    </div>
                ) : (
                    <div className="p-6 text-center text-muted-foreground">Click on a date to view entries</div>
                );
            }

            return (
                <div className="space-y-4 p-4">
                    <h3 className="text-lg font-semibold">
                        { focusedEntry
                            ? "Entry Details"
                            : selectedTime
                                ? `Entries for ${ selectedTime.hour }:00`
                                : `Entries for ${ selectedDate ? format( selectedDate, "MMMM d, yyyy" ) : "" }` }
                    </h3>
                    <div className="space-y-3">
                        { entriesToShow.map( ( entry, idx ) => (
                            <EntryCard
                                key={ idx }
                                entry={ entry }
                                fieldConfig={ fieldConfig }
                                renderEntryCard={ renderEntryCard }
                                onEdit={ onEntryEdit }
                                onDelete={ () => onEntryDelete?.( entry ) }
                                onClone={ () => onEntryClone?.( entry ) }
                                isEditing={ editingEntry === entry }
                                setEditing={ setEditingEntry }
                                timestampField={ timestampField }
                                localEntries={ localEntries }
                                setLocalEntries={ setLocalEntries }
                            />
                        ) ) }
                    </div>
                </div>
            );
        }, [
            focusedEntry,
            selectedDayEntries,
            selectedDate,
            selectedTime,
            fieldConfig,
            renderEntryCard,
            onEntryEdit,
            onEntryDelete,
            onEntryClone,
            editingEntry,
            timestampField,
            localEntries,
        ] );

        const isWideScreen = typeof window !== "undefined" && window.innerWidth >= 1024;

        return (
            <div className="space-y-6" style={ { maxWidth: maxSize } }>
                {/* Header */ }
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{ title }</h2>
                    <div className="flex items-center gap-2">
                        { fetchData && (
                            <Button variant="outline" size="sm" onClick={ handleRefresh } disabled={ isLoading }>
                                <RefreshCw className={ cn( "h-4 w-4", isLoading && "animate-spin" ) } />
                            </Button>
                        ) }
                    </div>
                </div>

                <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full">
                    <div className="flex items-center justify-between">
                        <TabsList className="h-10">
                            <TabsTrigger value="month" className="h-8 px-4">
                                Month View
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="h-8 px-4">
                                Timeline
                            </TabsTrigger>
                        </TabsList>

                        {/* Navigation controls */ }
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={ () => {
                                    if ( activeTab === "month" ) {
                                        setCurrentMonth( subMonths( currentMonth, 1 ) );
                                    } else {
                                        setTimelineDate( subDays( timelineDate, 1 ) );
                                    }
                                } }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm font-semibold min-w-40 text-center">
                                { activeTab === "month" ? format( currentMonth, "MMMM yyyy" ) : format( timelineDate, "MMM d, yyyy" ) }
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={ () => {
                                    if ( activeTab === "month" ) {
                                        setCurrentMonth( addMonths( currentMonth, 1 ) );
                                    } else {
                                        setTimelineDate( addDays( timelineDate, 1 ) );
                                    }
                                } }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={ () => {
                                    const today = new Date();
                                    setCurrentMonth( today );
                                    setTimelineDate( today );
                                } }
                            >
                                Today
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Views with responsive layout */ }
                    <div className={ cn( "w-full", isWideScreen && "flex gap-6" ) }>
                        <div className={ cn( "flex-1", isWideScreen && "w-2/3" ) }>
                            <TabsContent value="month" className="mt-6">
                                <Suspense fallback={ <div className="text-center py-8">Loading calendar...</div> }>
                                    { renderMonthView }
                                </Suspense>
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-6">
                                <Suspense fallback={ <div className="text-center py-8">Loading timeline...</div> }>
                                    { renderTimelineView }
                                </Suspense>
                            </TabsContent>
                        </div>

                        {/* Entry Cards - always visible sidebar on wide screens, below on mobile */ }
                        { isWideScreen ? (
                            <div
                                ref={ sidebarRef }
                                className="w-1/3 border-2 border-border rounded-xl bg-card shadow-sm overflow-auto max-h-[600px]"
                            >
                                { renderEntryCards }
                            </div>
                        ) : (
                            ( selectedDayEntries.length > 0 || selectedDate || focusedEntry ) && (
                                <div className="mt-6 border-2 border-border rounded-xl bg-card shadow-sm p-0 overflow-auto">
                                    { renderEntryCards }
                                </div>
                            )
                        ) }
                    </div>
                </Tabs>
            </div>
        );
    },
);

/**
 * Individual entry card component with edit capabilities
 * @param {Object} entry - Entry data object
 * @param {Object} fieldConfig - Field configuration
 * @param {Function} renderEntryCard - Custom card renderer
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onClone - Clone handler
 * @param {Boolean} isEditing - Edit mode state
 * @param {Function} setEditing - Edit mode setter
 * @param {String} timestampField - Timestamp field name
 * @param {Array} localEntries - Local entries array
 * @param {Function} setLocalEntries - Local entries setter
 */
const EntryCard = memo(
    ( {
        entry,
        fieldConfig,
        renderEntryCard,
        onEdit,
        onDelete,
        onClone,
        isEditing,
        setEditing,
        timestampField,
        localEntries,
        setLocalEntries,
    } ) => {
        const [ editedEntry, setEditedEntry ] = useState( entry );

        useEffect( () => {
            setEditedEntry( entry );
        }, [ entry ] );

        const handleSave = useCallback( async () => {
            try {
                // Call the onEdit function if provided (assume it's async)
                if ( onEdit ) {
                    await onEdit( editedEntry );
                }

                // Update local entries immediately for responsive UI
                if ( setLocalEntries && localEntries ) {
                    setLocalEntries( ( prev ) => prev.map( ( e ) => ( e === entry ? editedEntry : e ) ) );
                }

                setEditing( null );
            } catch ( error ) {
                console.error( "Failed to save entry:", error );
                // Optionally show error message to user
            }
        }, [ editedEntry, onEdit, setEditing, entry, setLocalEntries, localEntries ] );

        const handleCancel = useCallback( () => {
            setEditedEntry( entry );
            setEditing( null );
        }, [ entry, setEditing ] );

        const handleEditClick = useCallback( () => {
            if ( isEditing ) {
                handleCancel();
            } else {
                setEditing( entry );
            }
        }, [ isEditing, entry, setEditing, handleCancel ] );

        /**
         * Renders input component based on field type
         * @param {String} key - Field key
         * @param {*} value - Field value
         * @returns {JSX.Element} Input component
         */
        const renderFieldInput = useCallback(
            ( key, value ) => {
                const fieldType = fieldConfig[ key ]?.type || typeof value;

                switch ( fieldType ) {
                    case "textarea":
                    case "text":
                        if ( key === "description" || ( typeof value === "string" && value.length > 50 ) ) {
                            return (
                                <Textarea
                                    value={ editedEntry[ key ] || "" }
                                    onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, [ key ]: e.target.value } ) ) }
                                    className="h-20 text-sm resize-none"
                                    placeholder={ `Enter ${ key }...` }
                                />
                            );
                        }
                        return (
                            <Input
                                value={ editedEntry[ key ] || "" }
                                onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, [ key ]: e.target.value } ) ) }
                                className="h-8 text-sm"
                                placeholder={ `Enter ${ key }...` }
                            />
                        );
                    case "number":
                        return (
                            <Input
                                type="number"
                                value={ editedEntry[ key ] || "" }
                                onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, [ key ]: e.target.value } ) ) }
                                className="h-8 text-sm"
                                placeholder={ `Enter ${ key }...` }
                            />
                        );
                    case "date":
                    case "datetime-local":
                        return (
                            <Input
                                type="datetime-local"
                                value={ editedEntry[ key ] ? new Date( editedEntry[ key ] ).toISOString().slice( 0, 16 ) : "" }
                                onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, [ key ]: e.target.value } ) ) }
                                className="h-8 text-sm"
                            />
                        );
                    default:
                        return (
                            <Input
                                value={ editedEntry[ key ] || "" }
                                onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, [ key ]: e.target.value } ) ) }
                                className="h-8 text-sm"
                                placeholder={ `Enter ${ key }...` }
                            />
                        );
                }
            },
            [ editedEntry, fieldConfig ],
        );

        if ( renderEntryCard ) {
            return renderEntryCard( entry, { onEdit, onDelete, onClone } );
        }

        return (
            <Card className="p-0 border-2 border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                        { isEditing ? (
                            <Input
                                value={ editedEntry.title || "" }
                                onChange={ ( e ) => setEditedEntry( ( prev ) => ( { ...prev, title: e.target.value } ) ) }
                                className="h-8 text-base font-semibold"
                                placeholder="Enter title..."
                            />
                        ) : (
                            <span className="font-semibold">{ entry.title || "Entry" }</span>
                        ) }
                        <div className="flex items-center space-x-1">
                            { !isEditing ? (
                                <>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={ handleEditClick }>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={ () => onClone?.( entry ) }>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={ () => onDelete?.( entry ) }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={ handleCancel }>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600" onClick={ handleSave }>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </>
                            ) }
                        </div>
                    </CardTitle>
                    { ( entry.description || isEditing ) && (
                        <CardDescription className="text-sm mt-2">
                            { isEditing ? renderFieldInput( "description", entry.description ) : entry.description }
                        </CardDescription>
                    ) }
                </CardHeader>

                <CardContent className="p-4 pt-2">
                    <div className="space-y-3 text-sm">
                        {/* Timestamp */ }
                        { ( entry[ timestampField ] || isEditing ) && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="font-medium">Time:</span>
                                </div>
                                { isEditing ? (
                                    renderFieldInput( timestampField, entry[ timestampField ] )
                                ) : (
                                    <span>
                                        { isValid( new Date( entry[ timestampField ] ) )
                                            ? format( new Date( entry[ timestampField ] ), "MMM d, yyyy h:mm a" )
                                            : "No time set" }
                                    </span>
                                ) }
                            </div>
                        ) }

                        {/* Other fields */ }
                        { Object.entries( entry )
                            .filter( ( [ key ] ) => key !== timestampField && key !== "title" && key !== "description" )
                            .map( ( [ key, value ] ) => (
                                <div key={ key } className="flex justify-between items-start gap-3">
                                    <span className="font-medium capitalize min-w-20">{ key }:</span>
                                    <div className="flex-1">
                                        { isEditing ? renderFieldInput( key, value ) : <span className="break-words">{ String( value ) }</span> }
                                    </div>
                                </div>
                            ) ) }
                    </div>

                    { isEditing && (
                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                            <Button size="sm" variant="outline" onClick={ handleCancel }>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={ handleSave } className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </div>
                    ) }
                </CardContent>
            </Card>
        );
    },
);

ModularCalendar.displayName = "ModularCalendar";
EntryCard.displayName = "EntryCard";

export default ModularCalendar;

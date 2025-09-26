import React, { useMemo } from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// Import your UI components from your project
// If you're using shadcn/ui, you'll need to import these from your project
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayPicker } from "react-day-picker";
import { twMerge } from "tailwind-merge";

/**
 * Advanced Event Calendar with Date and Time Selection
 * 
 * @param {Object} props
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Function} props.setSelectedDate - Function to update selected date
 * @param {string} props.selectedTime - Currently selected time (format: "HH:MM")
 * @param {Function} props.setSelectedTime - Function to update selected time
 * @param {Array} props.events - Array of event objects
 * @param {Function} props.onSelectDateTime - Optional callback when date and time are selected
 * @param {Date} props.minDate - Optional minimum selectable date (defaults to today)
 * @param {Object} props.className - Optional className for the container
 */
export function DateTimePicker ( {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    events = [],
    onSelectDateTime,
    minDate = new Date(),
    className
} ) {
    const [ showTimeSelect, setShowTimeSelect ] = React.useState( false );

    // ====== Date Validation Utilities ======
    function isValidDate ( value ) {
        return value instanceof Date && !isNaN( value.getTime() );
    }

    function safeParse ( dateValue, fallback = new Date() ) {
        if ( dateValue instanceof Date ) {
            return isValidDate( dateValue ) ? dateValue : fallback;
        }

        try {
            const parsedDate = new Date( dateValue );
            return isValidDate( parsedDate ) ? parsedDate : fallback;
        } catch ( error ) {
            console.error( "Error parsing date:", error );
            return fallback;
        }
    }

    // ====== Event Processing ======
    // Group events by date for easier lookup
    const eventsByDate = useMemo( () => {
        const grouped = {};

        events.forEach( ( event ) => {
            // Validate event date
            if ( !event.date ) {
                console.warn( "Event missing date:", event );
                return;
            }

            try {
                // Parse the date safely
                const eventDate = typeof event.date === "string" ? safeParse( event.date ) : event.date;

                if ( !isValidDate( eventDate ) ) {
                    console.warn( "Invalid event date:", event );
                    return;
                }

                const dateKey = format( eventDate, "yyyy-MM-dd" );
                if ( !grouped[ dateKey ] ) {
                    grouped[ dateKey ] = [];
                }
                grouped[ dateKey ].push( event );
            } catch ( error ) {
                console.error( "Error processing event:", error );
            }
        } );

        return grouped;
    }, [ events ] );

    // Get events for the selected date
    const selectedDateEvents = useMemo( () => {
        if ( !isValidDate( selectedDate ) ) return [];

        const dateKey = format( selectedDate, "yyyy-MM-dd" );
        return eventsByDate[ dateKey ] || [];
    }, [ selectedDate, eventsByDate ] );

    // Generate time slots
    const timeSlots = useMemo( () => {
        // Create time slots from 8:00 to 18:00 with 30-minute intervals
        const slots = [];

        if ( !isValidDate( selectedDate ) ) {
            return slots;
        }

        for ( let hour = 8; hour <= 18; hour++ ) {
            for ( const minute of [ 0, 30 ] ) {
                const timeString = `${ hour.toString().padStart( 2, "0" ) }:${ minute.toString().padStart( 2, "0" ) }`;

                // Check if this time slot is available (not booked by an event)
                const isBooked = selectedDateEvents.some( ( event ) => {
                    if ( !event.time || !event.duration ) {
                        return false;
                    }

                    try {
                        const eventTime = event.time;
                        const [ eventHour, eventMinute ] = eventTime.split( ":" ).map( Number );

                        // Create a new date object for the event time
                        const eventDate = new Date( selectedDate );
                        setHours( eventDate, eventHour );
                        setMinutes( eventDate, eventMinute );

                        if ( !isValidDate( eventDate ) ) {
                            return false;
                        }

                        // Create a new date object for the slot time
                        const slotDate = new Date( selectedDate );
                        const [ slotHour, slotMinute ] = timeString.split( ":" ).map( Number );
                        setHours( slotDate, slotHour );
                        setMinutes( slotDate, slotMinute );

                        // Check if the time slot falls within the event duration
                        const eventEndDate = new Date( eventDate );
                        eventEndDate.setMinutes( eventEndDate.getMinutes() + event.duration );

                        return slotDate >= eventDate && slotDate < eventEndDate;
                    } catch ( error ) {
                        console.error( "Error checking time slot availability:", error );
                        return false;
                    }
                } );

                slots.push( { time: timeString, available: !isBooked } );
            }
        }
        return slots;
    }, [ selectedDate, selectedDateEvents ] );

    // ====== Event Handlers ======
    // Handle date selection
    const handleDateSelect = ( newDate ) => {
        if ( newDate && isValidDate( newDate ) ) {
            setSelectedDate( newDate );
            setSelectedTime( null );
            setShowTimeSelect( true );
        }
    };

    // Handle time selection
    const handleTimeSelect = ( newTime ) => {
        setSelectedTime( newTime );
        if ( onSelectDateTime && isValidDate( selectedDate ) ) {
            onSelectDateTime( selectedDate, newTime );
        }
    };

    // ====== Calendar Rendering Helpers ======
    // Get color based on event count
    const getEventColor = ( day ) => {
        if ( !isValidDate( day ) ) return "";

        try {
            const dateKey = format( day, "yyyy-MM-dd" );
            const count = eventsByDate[ dateKey ]?.length || 0;

            if ( count === 0 ) return "";
            if ( count === 1 ) return "bg-blue-100 hover:bg-blue-200";
            if ( count === 2 ) return "bg-yellow-100 hover:bg-yellow-200";
            if ( count >= 3 ) return "bg-red-100 hover:bg-red-200";
        } catch ( error ) {
            console.error( "Error getting event color:", error );
        }

        return "";
    };

    // Custom day renderer to show event indicators
    const renderDay = ( day, dayProps ) => {
        if ( !isValidDate( day ) ) {
            return <div className={ dayProps.className }>{ dayProps.children }</div>;
        }

        try {
            const dateKey = format( day, "yyyy-MM-dd" );
            const dayEvents = eventsByDate[ dateKey ] || [];
            const eventCount = dayEvents.length;
            const colorClass = getEventColor( day );

            return (
                <div className={ `relative w-full h-full flex items-center justify-center ${ colorClass }` }>
                    <div className={ dayProps.className }>{ format( day, "d" ) }</div>
                    { eventCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex">
                                        { Array.from( { length: Math.min( eventCount, 3 ) } ).map( ( _, i ) => (
                                            <div
                                                key={ i }
                                                className={ `w-1 h-1 rounded-full mx-0.5 ${ eventCount === 1 ? "bg-blue-500" : eventCount === 2 ? "bg-yellow-500" : "bg-red-500"
                                                    }` }
                                            />
                                        ) ) }
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="p-0 max-w-xs">
                                    <div className="p-2">
                                        <p className="font-medium mb-1">{ format( day, "EEEE, MMMM d, yyyy" ) }</p>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            { eventCount } event{ eventCount !== 1 ? "s" : "" }
                                        </p>
                                        <ul className="space-y-1 text-sm">
                                            { dayEvents.slice( 0, 3 ).map( ( event ) => (
                                                <li key={ event.id } className="flex items-start gap-2">
                                                    <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                    <span>
                                                        { event.time } - { event.title }
                                                    </span>
                                                </li>
                                            ) ) }
                                            { eventCount > 3 && (
                                                <li className="text-xs text-muted-foreground pl-5 pt-1">
                                                    +{ eventCount - 3 } more event{ eventCount - 3 !== 1 ? "s" : "" }
                                                </li>
                                            ) }
                                        </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) }
                </div>
            );
        } catch ( error ) {
            console.error( "Error rendering day:", error );
            return <div className={ dayProps.className }>{ dayProps.children }</div>;
        }
    };

    // ====== Calendar Component ======
    function Calendar ( { className, classNames, showOutsideDays = true, components: userComponents, ...props } ) {
        const defaultClassNames = {
            months: "relative flex flex-col sm:flex-row gap-4",
            month: "w-full",
            month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
            caption_label: "text-sm font-medium",
            nav: "absolute top-0 flex w-full justify-between z-10",
            button_previous: twMerge(
                buttonVariants( { variant: "ghost" } ),
                "size-9 text-muted-foreground/80 hover:text-foreground p-0",
            ),
            button_next: twMerge( buttonVariants( { variant: "ghost" } ), "size-9 text-muted-foreground/80 hover:text-foreground p-0" ),
            weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
            day_button:
                "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground",
            day: "group size-9 px-0 text-sm",
            range_start: "range-start",
            range_end: "range-end",
            range_middle: "range-middle",
            today:
                "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
            outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
            hidden: "invisible",
            week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
        };

        const mergedClassNames = Object.keys( defaultClassNames ).reduce(
            ( acc, key ) => ( {
                ...acc,
                [ key ]: classNames?.[ key ] ? twMerge( defaultClassNames[ key ], classNames[ key ] ) : defaultClassNames[ key ],
            } ),
            {},
        );

        const defaultComponents = {
            Chevron: ( props ) => {
                if ( props.orientation === "left" ) {
                    return <ChevronLeft size={ 16 } strokeWidth={ 2 } { ...props } aria-hidden="true" />;
                }
                return <ChevronRight size={ 16 } strokeWidth={ 2 } { ...props } aria-hidden="true" />;
            },
        };

        const mergedComponents = {
            ...defaultComponents,
            ...userComponents,
        };

        return (
            <DayPicker
                showOutsideDays={ showOutsideDays }
                className={ twMerge( "w-fit", className ) }
                classNames={ mergedClassNames }
                components={ mergedComponents }
                { ...props }
            />
        );
    }

    // ====== Main Component Render ======
    return (
        <div className={ twMerge( "space-y-4", className ) }>
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Select Date & Time</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Info className="h-3.5 w-3.5" />
                            <span>Event Legend</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-2">
                            <h3 className="font-medium">Event Indicators</h3>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-blue-100" />
                                    <span className="text-sm">1 event</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-yellow-100" />
                                    <span className="text-sm">2 events</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-red-100" />
                                    <span className="text-sm">3+ events</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Hover over days with events to see details</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="rounded-lg border border-border">
                <div className="flex max-sm:flex-col">
                    <Calendar
                        mode="single"
                        selected={ selectedDate }
                        onSelect={ handleDateSelect }
                        className="p-2 sm:pe-5 bg-background"
                        disabled={ [ { before: minDate } ] }
                        components={ {
                            DayContent: ( { date, ...props } ) => renderDay( date, props ),
                        } }
                    />

                    { showTimeSelect && (
                        <div className="relative w-full max-sm:h-48 sm:w-40">
                            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
                                <ScrollArea className="h-full border-border sm:border-s">
                                    <div className="space-y-3">
                                        <div className="flex h-5 shrink-0 items-center px-5">
                                            <p className="text-sm font-medium">
                                                { isValidDate( selectedDate ) ? format( selectedDate, "EEEE, d" ) : "Select a date" }
                                            </p>
                                        </div>

                                        { selectedDateEvents.length > 0 && (
                                            <div className="px-5 mb-2">
                                                <Select>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="View events" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        { selectedDateEvents.map( ( event ) => (
                                                            <SelectItem key={ event.id } value={ event.id } className="text-xs">
                                                                { event.time } - { event.title }
                                                            </SelectItem>
                                                        ) ) }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) }

                                        <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                                            { timeSlots.map( ( { time: timeSlot, available } ) => (
                                                <Button
                                                    key={ timeSlot }
                                                    variant={ selectedTime === timeSlot ? "default" : "outline" }
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={ () => handleTimeSelect( timeSlot ) }
                                                    disabled={ !available }
                                                >
                                                    { timeSlot }
                                                </Button>
                                            ) ) }
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    ) }
                </div>
            </div>

            { selectedTime && isValidDate( selectedDate ) && (
                <div className="p-3 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm font-medium">Selected Date & Time:</p>
                    <p className="text-lg">
                        { format( selectedDate, "EEEE, MMMM d, yyyy" ) } at { selectedTime }
                    </p>
                </div>
            ) }
        </div>
    );
}

// Example usage:
/*
import { DateTimePicker } from './DateTimePicker';
import { useState } from 'react';

function MyApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  
  const events = [
    {
      id: "1",
      title: "Team Meeting",
      description: "Weekly team sync",
      date: "2025-04-06T00:00:00.000Z",
      time: "10:00",
      duration: 60
    },
    // More events...
  ];

  return (
    <DateTimePicker
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedTime={selectedTime}
      setSelectedTime={setSelectedTime}
      events={events}
      onSelectDateTime={(date, time) => console.log(`Selected: ${date} at ${time}`)}
    />
  );
}
*/
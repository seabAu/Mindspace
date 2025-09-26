"use client";

import { useState, useEffect, useMemo } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    isDate,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

const DateTimePicker = ( {
    className = '',
    value,
    onChange,
    onClear,
    compact = false,
    maxClockWidth = 224,
    maxClockHeight = 224,
    showOutsideDays = true,
} ) => {
    const [ date, setDate ] = useState( value ? new Date( value ) : new Date() );
    const [ isOpen, setIsOpen ] = useState( false );
    const [ currentMonth, setCurrentMonth ] = useState( date );
    const [ selectedHour, setSelectedHour ] = useState( date.getHours() );
    const [ selectedMinute, setSelectedMinute ] = useState( date.getMinutes() );
    const [ showMonthSelector, setShowMonthSelector ] = useState( false );

    useEffect( () => {
        if ( value ) {
            const newDate = new Date( value );
            setDate( newDate );
            setCurrentMonth( newDate );
            setSelectedHour( newDate.getHours() );
            setSelectedMinute( newDate.getMinutes() );
        }
    }, [ value ] );

    const handleDateSelect = ( day ) => {
        const newDate = new Date( day );
        newDate.setHours( selectedHour );
        newDate.setMinutes( selectedMinute );
        setDate( newDate );
        onChange( newDate );
    };

    const handleTimeChange = ( hours, minutes ) => {
        const newDate = new Date( date );
        newDate.setHours( hours !== undefined ? hours : selectedHour );
        newDate.setMinutes( minutes !== undefined ? minutes : selectedMinute );
        setDate( newDate );
        setSelectedHour( newDate.getHours() );
        setSelectedMinute( newDate.getMinutes() );
        onChange( newDate );
    };

    // Calculate clock dimensions based on provided max dimensions
    const clockDimensions = useMemo( () => {
        const size = Math.min( maxClockWidth, maxClockHeight );
        const center = size / 2;
        const hourRadius = center * 0.7;
        const minuteRadius = center * 0.85;

        return {
            size,
            center,
            hourRadius,
            minuteRadius,
            hourHandLength: center * 0.45,
            minuteHandLength: center * 0.65,
            hourMarkerSize: size * 0.1,
            minuteMarkerSize: size * 0.07,
            centerDotSize: size * 0.05,
        };
    }, [ maxClockWidth, maxClockHeight ] );

    const handleClockClick = ( e ) => {
        const clockRect = e.currentTarget.getBoundingClientRect();
        const { center } = clockDimensions;

        const x = e.clientX - clockRect.left - center;
        const y = e.clientY - clockRect.top - center;

        // Calculate angle in radians
        const angle = Math.atan2( y, x );
        // Convert to degrees and adjust to start from 12 o'clock position
        let degrees = ( angle * ( 180 / Math.PI ) + 90 ) % 360;
        if ( degrees < 0 ) degrees += 360;

        // Calculate hour (0-11)
        const hour = Math.round( degrees / 30 ) % 12;

        // Calculate minutes (0-59)
        const distance = Math.sqrt( x * x + y * y );
        const maxDistance = center;
        const isOuterRing = distance > maxDistance * 0.6;

        if ( isOuterRing ) {
            // User clicked on the minute ring
            const minute = Math.round( degrees / 6 ) % 60;
            handleTimeChange( selectedHour, minute );
        } else {
            // User clicked on the hour ring
            handleTimeChange( hour === 0 ? 12 : hour, selectedMinute );
        }
    };

    const nextMonth = () => setCurrentMonth( addMonths( currentMonth, 1 ) );
    const prevMonth = () => setCurrentMonth( subMonths( currentMonth, 1 ) );

    // Get calendar days including outside days if showOutsideDays is true
    const calendarDays = useMemo( () => {
        const monthStart = startOfMonth( currentMonth );
        const monthEnd = endOfMonth( currentMonth );

        if ( showOutsideDays ) {
            // Get the start of the week for the first day of the month
            const calendarStart = startOfWeek( monthStart );
            // Get the end of the week for the last day of the month
            const calendarEnd = endOfWeek( monthEnd );

            // Return all days in the calendar view
            return eachDayOfInterval( { start: calendarStart, end: calendarEnd } );
        } else {
            // Just return the days in the current month
            return eachDayOfInterval( { start: monthStart, end: monthEnd } );
        }
    }, [ currentMonth, showOutsideDays ] );

    const handleMonthYearSelect = ( month, year ) => {
        const newDate = new Date( year, month, 1 );
        setCurrentMonth( newDate );
        setShowMonthSelector( false );
    };

    // Generate time list for the side panel
    const timeList = useMemo( () => {
        const times = [];
        for ( let h = 0; h < 24; h++ ) {
            for ( let m = 0; m < 60; m += 5 ) {
                times.push( {
                    hour: h,
                    minute: m,
                    label: `${ h.toString().padStart( 2, "0" ) }:${ m.toString().padStart( 2, "0" ) }`,
                } );
            }
        }
        return times;
    }, [] );

    const renderMonthYearSelector = () => {
        const years = Array.from( { length: 10 }, ( _, i ) => new Date().getFullYear() - 5 + i );
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return (
            <div className={ twMerge(
                "p-2rounded-md shadow-lg",
                className
            ) }>
                <div className="grid grid-cols-3 gap-1">
                    { months.map( ( month, idx ) => (
                        <Button
                            key={ month }
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            onClick={ () => handleMonthYearSelect( idx, currentMonth.getFullYear() ) }
                        >
                            { month }
                        </Button>
                    ) ) }
                </div>
                <div className="grid grid-cols-5 gap-1 mt-2">
                    { years.map( ( year ) => (
                        <Button
                            key={ year }
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            onClick={ () => handleMonthYearSelect( currentMonth.getMonth(), year ) }
                        >
                            { year }
                        </Button>
                    ) ) }
                </div>
            </div>
        );
    };

    const renderClockFace = () => {
        const hours = Array.from( { length: 12 }, ( _, i ) => i + 1 );
        const minutes = Array.from( { length: 12 }, ( _, i ) => i * 5 );
        const {
            size,
            center,
            hourRadius,
            minuteRadius,
            hourHandLength,
            minuteHandLength,
            hourMarkerSize,
            minuteMarkerSize,
            centerDotSize,
        } = clockDimensions;

        // Fix the hour hand rotation calculation
        // For 12-hour format, we need to convert 24-hour format to 12-hour format
        // and calculate the angle based on that
        const hour12 = selectedHour % 12 - 1;
        const hourAngle = hour12 * 30 + selectedMinute / 2;

        return (
            <div className="flex">
                <div
                    className="relative mx-auto border border-gray-600 rounded-full"
                    style={ { width: `${ size }px`, height: `${ size }px` } }
                    onClick={ handleClockClick }
                >
                    {/* Hour markers */ }
                    { hours.map( ( hour ) => {
                        const angle = ( ( hour % 12 ) / 12 ) * 2 * Math.PI - Math.PI / 2;
                        const x = hourRadius * Math.cos( angle ) + center;
                        const y = hourRadius * Math.sin( angle ) + center;

                        return (
                            <div
                                key={ `hour-${ hour }` }
                                className={ `absolute flex items-center justify-center rounded-full text-xs font-medium ${ selectedHour % 12 === hour % 12 || ( hour === 12 && selectedHour % 12 === 0 )
                                    ? "bg-washed-blue-600 text-white"
                                    : "bg-sextary-800 text-neutral-300"
                                    }` }
                                style={ {
                                    left: `${ x }px`,
                                    top: `${ y }px`,
                                    transform: "translate(-50%, -50%)",
                                    width: `${ hourMarkerSize }px`,
                                    height: `${ hourMarkerSize }px`,
                                } }
                            >
                                { hour }
                            </div>
                        );
                    } ) }

                    {/* Minute markers */ }
                    { minutes.map( ( minute ) => {
                        const angle = ( minute / 60 ) * 2 * Math.PI - Math.PI / 2;
                        const x = minuteRadius * Math.cos( angle ) + center;
                        const y = minuteRadius * Math.sin( angle ) + center;

                        return (
                            <div
                                key={ `minute-${ minute }` }
                                className={ `absolute flex items-center justify-center rounded-full text-xs ${ Math.abs( selectedMinute - minute ) < 3 ? "bg-washed-blue-600 text-white" : "bg-sextary-800 text-neutral-300"
                                    }` }
                                style={ {
                                    left: `${ x }px`,
                                    top: `${ y }px`,
                                    transform: "translate(-50%, -50%)",
                                    width: `${ minuteMarkerSize }px`,
                                    height: `${ minuteMarkerSize }px`,
                                } }
                            >
                                { minute }
                            </div>
                        );
                    } ) }

                    {/* Hour hand */ }
                    <div
                        className="absolute bg-washed-blue-500 rounded-full"
                        style={ {
                            width: `${ size * 0.02 }px`,
                            height: `${ hourHandLength }px`,
                            left: `${ center }px`,
                            top: `${ center - hourHandLength }px`,
                            transformOrigin: `0 ${ hourHandLength }px`,
                            transform: `rotate(${ hourAngle }deg)`,
                        } }
                    />

                    {/* Minute hand */ }
                    <div
                        className="absolute bg-washed-blue-300 rounded-full"
                        style={ {
                            width: `${ size * 0.01 }px`,
                            height: `${ minuteHandLength }px`,
                            left: `${ center }px`,
                            top: `${ center - minuteHandLength }px`,
                            transformOrigin: `0 ${ minuteHandLength }px`,
                            transform: `rotate(${ selectedMinute * 6 }deg)`,
                        } }
                    />

                    {/* Center dot */ }
                    <div
                        className="absolute bg-washed-blue-600 rounded-full"
                        style={ {
                            width: `${ centerDotSize }px`,
                            height: `${ centerDotSize }px`,
                            left: `${ center - centerDotSize / 2 }px`,
                            top: `${ center - centerDotSize / 2 }px`,
                        } }
                    />
                </div>

                {/* Time list */ }
                <div className="ml-4" style={ { width: "100px" } }>
                    <ScrollArea className="h-56 rounded border border-gray-600">
                        <div className="p-0">
                            { timeList.map( ( time ) => (
                                <Button
                                    key={ `${ time.hour }-${ time.minute }` }
                                    variant="ghost"
                                    size="sm"
                                    className={ cn(
                                        "w-full justify-start text-xs h-7",
                                        selectedHour === time.hour && Math.abs( selectedMinute - time.minute ) < 3
                                            ? "bg-washed-blue-600 text-sextary-800"
                                            : "hover:bg-sextary-700 text-white",
                                    ) }
                                    onClick={ () => handleTimeChange( time.hour, time.minute ) }
                                >
                                    { time.label }
                                </Button>
                            ) ) }
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full grid grid-flow-col grid-cols-12">
            <Popover open={ isOpen } onOpenChange={ setIsOpen }>
                <PopoverTrigger asChild className={ `col-span-12` }>
                    <Button
                        variant="outline"
                        className={ cn(
                            "w-auto text-wrap justify-start text-left",
                            compact ? "h-7 text-xs !px-2" : "h-8 !pl-2 pr-4",
                        ) }
                    >
                        <CalendarIcon className={ cn( "mx-0 aspect-ratio", compact ? "size-3" : "size-3.5" ) } />
                        <span className={ `h-min font-normal font-sans !text-[0.75rem] text-white text-sm leading-3` }>{ date ? format( new Date( date || Date.now() ), compact ? "PP p" : "PPpp" ) : `Pick a date & time` }</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-gray-700">
                    <Tabs defaultValue="date" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="date">Date</TabsTrigger>
                            <TabsTrigger value="time">Time</TabsTrigger>
                        </TabsList>

                        <TabsContent value="date" className="p-2">
                            <div className="flex items-center justify-between mb-2">
                                <Button variant="ghost" size="sm" onClick={ prevMonth }>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="font-medium"
                                    onClick={ () => setShowMonthSelector( !showMonthSelector ) }
                                >
                                    { format( currentMonth, "MMMM yyyy" ) }
                                </Button>
                                <Button variant="ghost" size="sm" onClick={ nextMonth }>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            { showMonthSelector ? (
                                renderMonthYearSelector()
                            ) : (
                                <>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                                        { [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ].map( ( day ) => (
                                            <div key={ day } className="text-neutral-400">
                                                { day }
                                            </div>
                                        ) ) }
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {/* We don't need empty divs for the start of the month anymore since we're showing outside days */ }
                                        { calendarDays.map( ( day ) => {
                                            const isSelected = isSameDay( day, date );
                                            const isToday = isSameDay( day, new Date() );
                                            const isOutsideCurrentMonth = !isSameMonth( day, currentMonth );

                                            return (
                                                <Button
                                                    key={ day.toString() }
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ cn(
                                                        "h-8 w-8 p-0 font-normal",
                                                        isSelected && "bg-washed-blue-600 text-white",
                                                        !isSelected && isToday && "border border-blue-500",
                                                        !isSelected && isOutsideCurrentMonth && "text-neutral-500",
                                                        // Hide outside days if showOutsideDays is false
                                                        isOutsideCurrentMonth && !showOutsideDays && "hidden",
                                                    ) }
                                                    onClick={ () => handleDateSelect( day ) }
                                                >
                                                    { format( day, "d" ) }
                                                </Button>
                                            );
                                        } ) }
                                    </div>
                                </>
                            ) }
                        </TabsContent>

                        <TabsContent value="time" className="p-2">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={ selectedHour }
                                        onChange={ ( e ) => handleTimeChange( Number.parseInt( e.target.value, 10 ), undefined ) }
                                        className="w-16 h-8 border-gray-600 text-white text-center"
                                    />
                                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400">h</span>
                                </div>
                                <span className="text-xl">:</span>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={ selectedMinute }
                                        onChange={ ( e ) => handleTimeChange( undefined, Number.parseInt( e.target.value, 10 ) ) }
                                        className="w-16 h-8 border-gray-600 text-white text-center"
                                    />
                                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400">m</span>
                                </div>
                            </div>

                            { renderClockFace() }

                            <div className="flex justify-end mt-4">
                                <Button size="sm" className="bg-washed-blue-600 hover:bg-washed-blue-700" onClick={ () => setIsOpen( false ) }>
                                    Done
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>

            <Button
                variant="ghost"
                size="icon"
                className={ cn( "absolute col-span-2 right-0 top-0 p-0", compact ? "h-7 w-7" : "h-8 w-8" ) }
                onClick={ () => {
                    onClear();
                    setDate( new Date() );
                } }>
                <X className={ cn( "p-0 aspect-ratio", compact ? "size-3" : "size-3.5" ) } />
            </Button>
        </div>
    );
};

export default DateTimePicker;

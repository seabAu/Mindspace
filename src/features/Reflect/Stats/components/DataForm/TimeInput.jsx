import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
// import TimeInput from "./TimeInput";

export const TimeInput = forwardRef( ( { value, onChange, onClear, compact = true, onKeyDown }, ref ) => {
    const [ isOpen, setIsOpen ] = useState( false );

    // Parse time string to hours and minutes
    const parseTime = ( timeStr ) => {
        if ( !timeStr ) return { hours: 0, minutes: 0 };

        try {
            // Handle Date objects
            if ( timeStr instanceof Date ) {
                return {
                    hours: timeStr.getHours(),
                    minutes: timeStr.getMinutes(),
                };
            }

            // Handle time strings like "14:30"
            const parts = timeStr.split( ":" );
            if ( parts.length >= 2 ) {
                return {
                    hours: Number.parseInt( parts[ 0 ], 10 ) || 0,
                    minutes: Number.parseInt( parts[ 1 ], 10 ) || 0,
                };
            }

            return { hours: 0, minutes: 0 };
        } catch ( e ) {
            return { hours: 0, minutes: 0 };
        }
    };

    // Format hours and minutes to time string
    const formatTime = ( hours, minutes ) => {
        return `${ hours.toString().padStart( 2, "0" ) }:${ minutes.toString().padStart( 2, "0" ) }`;
    };

    const { hours, minutes } = parseTime( value );

    // Generate time list for the time picker
    const timeList = Array.from( { length: 24 * 4 }, ( _, i ) => {
        const h = Math.floor( i / 4 );
        const m = ( i % 4 ) * 15;
        return {
            hours: h,
            minutes: m,
            label: formatTime( h, m ),
        };
    } );

    const handleTimeChange = ( h, m ) => {
        onChange( formatTime( h, m ) );
    };

    const handleInputChange = ( e ) => {
        onChange( e.target.value );
    };

    const handleClear = () => {
        onChange( "" );
        if ( onClear ) onClear();
    };

    return (
        <div className="relative w-full">
            <Popover open={ isOpen } onOpenChange={ setIsOpen }>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={ cn(
                            "w-full justify-start text-left font-normal pr-8 bg-gray-700 border-gray-600 text-white",
                            compact ? "h-6 text-xs" : "h-8 text-sm",
                        ) }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    >
                        <Clock className="mr-2 h-3 w-3" />
                        { formatTime( hours, minutes ) || <span>Select time</span> }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 bg-gray-800 border-gray-700">
                    <div className="flex items-center justify-center space-x-2 p-2 border-b border-gray-700">
                        <Input
                            type="number"
                            min="0"
                            max="23"
                            value={ hours }
                            onChange={ ( e ) => handleTimeChange( Number.parseInt( e.target.value, 10 ) || 0, minutes ) }
                            className="w-16 h-8 bg-gray-700 border-gray-600 text-white text-center"
                        />
                        <span className="text-xl text-white">:</span>
                        <Input
                            type="number"
                            min="0"
                            max="59"
                            value={ minutes }
                            onChange={ ( e ) => handleTimeChange( hours, Number.parseInt( e.target.value, 10 ) || 0 ) }
                            className="w-16 h-8 bg-gray-700 border-gray-600 text-white text-center"
                        />
                    </div>

                    <ScrollArea className="h-56">
                        <div className="p-1">
                            { timeList.map( ( time ) => (
                                <Button
                                    key={ time.label }
                                    variant="ghost"
                                    size="sm"
                                    className={ cn(
                                        "w-full justify-start text-xs h-7 mb-1",
                                        hours === time.hours && minutes === time.minutes ? "bg-blue-600 text-white" : "hover:bg-gray-700",
                                    ) }
                                    onClick={ () => {
                                        handleTimeChange( time.hours, time.minutes );
                                        setIsOpen( false );
                                    } }
                                >
                                    { time.label }
                                </Button>
                            ) ) }
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
            <Button
                variant="ghost"
                size="icon"
                className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
                onClick={ handleClear }
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
} );

TimeInput.displayName = "TimeInput";


export const TimeRangeInput = forwardRef( ( { value, onChange, onClear, compact = true, onKeyDown }, ref ) => {
    // Parse time range string or object
    const parseTimeRange = ( rangeValue ) => {
        if ( !rangeValue ) return { start: "", end: "" };

        try {
            // Handle object with start and end
            if ( typeof rangeValue === "object" && rangeValue !== null ) {
                return {
                    start: rangeValue.start || "",
                    end: rangeValue.end || "",
                };
            }

            // Handle string format "start-end"
            if ( typeof rangeValue === "string" && rangeValue.includes( "-" ) ) {
                const [ start, end ] = rangeValue.split( "-" );
                return { start, end };
            }

            return { start: "", end: "" };
        } catch ( e ) {
            return { start: "", end: "" };
        }
    };

    const { start, end } = parseTimeRange( value );

    const handleStartChange = ( newStart ) => {
        onChange( { start: newStart, end } );
    };

    const handleEndChange = ( newEnd ) => {
        onChange( { start, end: newEnd } );
    };

    const handleClear = () => {
        onChange( { start: "", end: "" } );
        if ( onClear ) onClear();
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2 w-10">Start:</span>
                <div className="flex-1">
                    <TimeInput value={ start } onChange={ handleStartChange } compact={ compact } onKeyDown={ onKeyDown } />
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2 w-10">End:</span>
                <div className="flex-1">
                    <TimeInput value={ end } onChange={ handleEndChange } compact={ compact } onKeyDown={ onKeyDown } />
                </div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-red-400 hover:text-red-300" onClick={ handleClear }>
                Clear Range
            </Button>
        </div>
    );
} );

TimeRangeInput.displayName = "TimeRangeInput";

export default TimeRangeInput;

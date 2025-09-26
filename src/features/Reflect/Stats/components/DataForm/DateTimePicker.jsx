import { useState, useEffect } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

const DateTimePicker = ( { value, onChange, onClear, compact = false } ) => {
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

    const handleClockClick = ( e ) => {
        const clockRect = e.currentTarget.getBoundingClientRect();
        const centerX = clockRect.width / 2;
        const centerY = clockRect.height / 2;

        const x = e.clientX - clockRect.left - centerX;
        const y = e.clientY - clockRect.top - centerY;

        // Calculate angle in radians
        const angle = Math.atan2( y, x );
        // Convert to degrees and adjust to start from 12 o'clock position
        let degrees = ( angle * ( 180 / Math.PI ) + 90 ) % 360;
        if ( degrees < 0 ) degrees += 360;

        // Calculate hour (0-11)
        const hour = Math.round( degrees / 30 ) % 12;

        // Calculate minutes (0-59)
        const distance = Math.sqrt( x * x + y * y );
        const maxDistance = Math.min( centerX, centerY );
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

    const days = eachDayOfInterval( {
        start: startOfMonth( currentMonth ),
        end: endOfMonth( currentMonth ),
    } );

    const handleMonthYearSelect = ( month, year ) => {
        const newDate = new Date( year, month, 1 );
        setCurrentMonth( newDate );
        setShowMonthSelector( false );
    };

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
            <div className="p-2 bg-sextary-800 rounded-md shadow-lg">
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

        return (
            <div
                className="relative w-56 h-56 rounded-full bg-sextary-700 mx-auto mt-4 border border-gray-600"
                onClick={ handleClockClick }
            >
                {/* Hour markers */ }
                { hours.map( ( hour ) => {
                    const angle = ( ( hour % 12 ) / 12 ) * 2 * Math.PI - Math.PI / 2;
                    const x = 80 * Math.cos( angle ) + 96;
                    const y = 80 * Math.sin( angle ) + 96;

                    return (
                        <div
                            key={ `hour-${ hour }` }
                            className={ `absolute w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${ selectedHour % 12 === hour % 12 ? "bg-washed-blue-600 text-white" : "bg-sextary-800 text-neutral-300"
                                }` }
                            style={ { left: `${ x }px`, top: `${ y }px`, transform: "translate(-100%, -100%)" } }
                        >
                            { hour }
                        </div>
                    );
                } ) }

                {/* Minute markers */ }
                { minutes.map( ( minute ) => {
                    const angle = ( minute / 60 ) * 2 * Math.PI - Math.PI / 2;
                    const x = 100 * Math.cos( angle ) + 96;
                    const y = 100 * Math.sin( angle ) + 96;

                    return (
                        <div
                            key={ `minute-${ minute }` }
                            className={ `absolute w-4 h-4 flex items-center justify-center rounded-full text-xs ${ Math.abs( selectedMinute - minute ) < 3 ? "bg-washed-blue-600 text-white" : "bg-sextary-800 text-neutral-300"
                                }` }
                            style={ { left: `${ x }px`, top: `${ y }px`, transform: "translate(-100%, -100%)" } }
                        >
                            { minute }
                        </div>
                    );
                } ) }

                {/* Hour hand */ }
                <div
                    className="absolute w-1 bg-washed-blue-500 rounded-full origin-bottom"
                    style={ {
                        height: "50px",
                        left: "96px",
                        top: "56px",
                        transformOrigin: "0 56px",
                        transform: `rotate(${ ( selectedHour % 12 ) * 30 + selectedMinute / 2 }deg)`,
                    } }
                />

                {/* Minute hand */ }
                <div
                    className="absolute w-0.5 bg-washed-blue-300 rounded-full origin-bottom"
                    style={ {
                        height: "70px",
                        left: "96px",
                        top: "16px",
                        transformOrigin: "0 72px",
                        transform: `rotate(${ selectedMinute * 6 }deg)`,
                    } }
                />

                {/* Center dot */ }
                <div className="absolute w-3 h-3 bg-washed-blue-600 rounded-full" style={ { left: "84px", top: "84px" } } />
            </div>
        );
    };

    return (
        <div className="relative w-full">
            <Popover open={ isOpen } onOpenChange={ setIsOpen }>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={ cn(
                            "w-full justify-start text-left font-normal bg-sextary-700 border-gray-600 text-white text-sm",
                            compact ? "h-7 text-xs" : "h-8",
                        ) }
                    >
                        <CalendarIcon className={ cn( "mr-2", compact ? "h-3 w-3" : "h-3.5 w-3.5" ) } />
                        { date ? format( date, compact ? "PP p" : "PPpp" ) : <span>Pick a date & time</span> }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-sextary-800 border-gray-700">
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
                                        { Array.from( {
                                            length: new Date( currentMonth.getFullYear(), currentMonth.getMonth(), 1 ).getDay(),
                                        } ).map( ( _, i ) => (
                                            <div key={ `empty-${ i }` } className="h-8" />
                                        ) ) }

                                        { days.map( ( day ) => {
                                            const isSelected = isSameDay( day, date );
                                            const isToday = isSameDay( day, new Date() );

                                            return (
                                                <Button
                                                    key={ day.toString() }
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ cn(
                                                        "h-8 w-8 p-0 font-normal",
                                                        isSelected && "bg-washed-blue-600 text-white",
                                                        !isSelected && isToday && "border border-washed-blue-500",
                                                        !isSelected && !isToday && !isSameMonth( day, currentMonth ) && "text-neutral-500",
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

                        <TabsContent value="time" className="p-4">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={ selectedHour }
                                        onChange={ ( e ) => handleTimeChange( Number.parseInt( e.target.value, 10 ), undefined ) }
                                        className="w-16 h-8 bg-sextary-700 border-gray-600 text-white text-center"
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
                                        className="w-16 h-8 bg-sextary-700 border-gray-600 text-white text-center"
                                    />
                                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400">m</span>
                                </div>
                            </div>

                            { renderClockFace() }

                            <div className="flex justify-end mt-12">
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
                className={ cn( "absolute right-0 top-0 p-0", compact ? "h-7 w-7" : "h-8 w-8" ) }
                onClick={ () => {
                    onClear();
                    setDate( new Date() );
                } }
            >
                <X className={ compact ? "h-3 w-3" : "h-3.5 w-3.5" } />
            </Button>
        </div>
    );
};

export default DateTimePicker;

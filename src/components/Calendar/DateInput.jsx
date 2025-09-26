import { use, useEffect, useRef, useState } from "react";
import * as utils from 'akashatools';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isValidDate } from "@fullcalendar/core/internal";
import {
    eachMonthOfInterval,
    eachYearOfInterval,
    endOfYear,
    format,
    isAfter,
    isBefore,
    startOfYear,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import { isNonEmptyArray } from "@/lib/utilities/array";
// import { CaptionLabelProps, MonthGridProps } from "react-day-picker";
// const { isEmpty } = _;

const cleanDateToString = ( date ) => {
    if ( date !== null && date !== undefined ) {
        return (
            date
                ? ( utils.val.isObject( date )
                    && ( date?.hasOwnProperty( 'from' ) && isValidDate( date?.from ) )
                    && ( date?.hasOwnProperty( 'to' ) && isValidDate( date?.to ) )
                    // SelectedDate is an object of 2 date objects.
                    ? `${ format( new Date( date?.from ), "PPP" ) } \n${ format( new Date( date?.to ), "PPP" ) }`
                    // SelectedDate is a date object
                    : ( isValidDate( date )
                        ? format( isValidDate( date ), "PPP" )
                        : format( new Date( Date.now() ), "PPP" ) ) )
                : ( <span>Pick a date</span> )
        );
    }
};

const cleanDateToString2 = ( date ) => {
    // console.log( "DatePicker :: date = ", date, " :: " );
    return ( ( date !== null && date !== undefined )
        ? ( isValidDate( date )
            // SelectedDate is a date object
            ? ( format( isValidDate( date ), "PPP" ) )
            : ( format( new Date( Date.now() ), "PPP" ) ) )
        : ( utils.val.isObject( date )
            && ( date?.hasOwnProperty( 'from' ) && isValidDate( date?.from ) )
            && ( date?.hasOwnProperty( 'to' ) && isValidDate( date?.to ) )
            // SelectedDate is an object of 2 date objects.
            ? ( ( `${ format( new Date( date?.from ), "PPP" ) } \n${ format( new Date( date?.to ), "PPP" ) }` ) )
            : ( <span>Pick a date</span> ) )
    );
};

function DateInput ( props ) {
    const {
        date,
        setDate,
        mode = `range`,
        showOutsideDays = true,
        className = '',
    } = props;

    const today = new Date();
    const [ month, setMonth ] = useState( today );
    // const [ date, setDate ] = useState( today );
    const [ isYearView, setIsYearView ] = useState( true );
    const startDate = new Date( 1980, 6 );
    const endDate = new Date( 2030, 6 );
    const [ time, setTime ] = useState( null );

    const years = eachYearOfInterval( {
        start: startOfYear( startDate ),
        end: endOfYear( endDate ),
    } );

    const [ selectedDayText, setSelectedDateText ] = useState( '' );
    useEffect( () => {
        if ( utils.val.isObject( date ) ) {
            if ( Object.keys( date ).length > 1 ) {
                // console.log( "SelectedDate = ", typeof date );
                let first = date[ Object.keys( date )[ 0 ] ];
                let last = date[ Object.keys( date )[ Object.keys( date ).length - 1 ] ];
                setSelectedDateText( `${ first }-${ last }` );
            }
            else {
                setSelectedDateText( date ? date : 'Pick A Day' );
            }
        }
    }, [ date ] );

    const handleTimeChange = ( value ) => {
        setDate( prev => new Date( prev ).setTime( value ) );
    };

    const handleDateChange = ( value ) => {
        if ( utils.val.isObject( value ) ) {
            if ( Object.keys( value ).length > 1 ) {
                // console.log( "SelectedDate = ", typeof date );
                let from = new Date( value[ Object.keys( value )[ 0 ] ] );
                let to = new Date( value[ Object.keys( value )[ Object.keys( value ).length - 1 ] ] );
                // setSelectedDateText( `${ from }-${ to }` );
                // console.log( "DateInput.js :: handleDateChange :: from = ", formatDateTime( new Date( from ) ), " :: ", "to = ", formatDateTime( new Date( to ) ) );
                let one_day = 1000 * 60 * 60 * 24;
                let Difference_In_Time = from.getTime() - to.getTime();
                let Difference_In_Days = Math.round( Difference_In_Time / ( 1000 * 3600 * 24 ) );
                setDate( { from: from, to: to } );
            }
            else {
                // setSelectedDateText( date ? date : 'Pick A Day' );
                setDate( new Date( value ) );
            }
        }/* 
        let newDate = ( ( date !== null && date !== undefined )
            ? ( isValidDate( date )
                // SelectedDate is a date object
                ? ( format( isValidDate( date ), "PPP" ) )
                : ( format( new Date( Date.now() ), "PPP" ) ) )
            : ( utils.val.isObject( date )
                && ( date?.hasOwnProperty( 'from' ) && isValidDate( date?.from ) )
                && ( date?.hasOwnProperty( 'to' ) && isValidDate( date?.to ) )
                // SelectedDate is an object of 2 date objects.
                ? ( ( `${ format( new Date( date?.from ), "PPP" ) } \n${ format( new Date( date?.to ), "PPP" ) }` ) )
                : ( <span>Pick a date</span> ) )
        ); */

        setDate( newDate );
    };

    return (
        <div className="">
            <div className="flex max-sm:flex-col">
                <Calendar
                    showOutsideDays={ showOutsideDays }
                    gridSize={ 8 }
                    gridGap={ 1 }
                    captionFontSize={ `0.6rem` }
                    headerFontSize={ `0.5rem` }
                    gridFontSize={ `0.5rem` }
                    mode={ mode ? mode : 'single' }
                    selected={ date }
                    onSelect={ ( value ) => {
                        // setDate( new Date( value ) );
                        handleDateChange( value );
                    } }
                    month={ month }
                    onMonthChange={ ( month ) => {
                        setMonth( month );
                        handleDateChange( new Date( date ).setMonth( month ) );
                    } }
                    // defaultMonth={ date?.from }
                    defaultMonth={ date && date?.hasOwnProperty( 'from' ) ? date?.from : new Date() }
                    startMonth={ startDate }
                    endMonth={ endDate }
                    className="overflow-hidden rounded-lg border border-border p-2 bg-background"
                    classNames={ {
                        month_caption: "ms-2.5 me-20 justify-start",
                        nav: "justify-end",
                    } }
                    components={ {
                        CaptionLabel: ( props ) => (
                            <CaptionLabel isYearView={ isYearView } setIsYearView={ setIsYearView } { ...props } />
                        ),
                        MonthGrid: ( props ) => {
                            return (
                                <MonthGrid
                                    className={ props.className }
                                    isYearView={ isYearView }
                                    setIsYearView={ setIsYearView }
                                    startDate={ startDate }
                                    endDate={ endDate }
                                    years={ years }
                                    currentYear={ month.getFullYear() }
                                    currentMonth={ month.getMonth() }
                                    onMonthSelect={ ( selectedMonth ) => {
                                        setMonth( selectedMonth );
                                        setIsYearView( false );
                                    } }
                                >
                                    { props.children }
                                </MonthGrid>
                            );
                        },
                        CaptionLabel: ( props ) => (
                            <TimePicker
                                date={ date }
                                setDate={ setDate }
                                // time={ time }
                                // setTime={ setTime }
                                time={ utils.val.isDefined( date ) && isValidDate( date ) ? new Date( date ).getTime() : new Date().getTime() }
                                setTime={ ( t ) => handleTimeChange( t ) }
                                { ...props }
                            /> ),
                    } }
                />
                {/* <p
                className="mt-4 text-center text-xs text-muted-foreground"
                role="region"
                aria-live="polite"
            >
                Advanced selection -{ " " }
                <a
                    className="underline hover:text-foreground"
                    href="https://daypicker.dev/"
                    target="_blank"
                    rel="noopener nofollow"
                >
                    React DayPicker
                </a>
            </p> */}

            </div>
        </div>
    );
}

function MonthGrid ( {
    className,
    children,
    isYearView,
    startDate,
    endDate,
    years,
    currentYear,
    currentMonth,
    onMonthSelect,
} ) {
    const currentYearRef = useRef( null );
    const currentMonthButtonRef = useRef( null );
    const scrollAreaRef = useRef( null );

    useEffect( () => {
        if ( isYearView && currentYearRef.current && scrollAreaRef.current ) {
            const viewport = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]",
            );
            if ( viewport ) {
                const yearTop = currentYearRef.current.offsetTop;
                viewport.scrollTop = yearTop;
            }
            setTimeout( () => {
                currentMonthButtonRef.current?.focus();
            }, 100 );
        }
    }, [ isYearView ] );

    return (
        <div className="relative">
            <table className={ className }>{ children }</table>
            { isYearView && (
                <div className="absolute inset-0 z-20 -mx-2 -mb-2">
                    <ScrollArea ref={ scrollAreaRef } className="h-full">
                        { years.map( ( year ) => {
                            const months = eachMonthOfInterval( {
                                start: startOfYear( year ),
                                end: endOfYear( year ),
                            } );
                            const isCurrentYear = year.getFullYear() === currentYear;

                            return (
                                <div key={ year.getFullYear() } ref={ isCurrentYear ? currentYearRef : undefined }>
                                    <CollapsibleYear title={ year.getFullYear().toString() } open={ isCurrentYear }>
                                        <div className="grid grid-cols-3 gap-2">
                                            { months.map( ( month ) => {
                                                const isDisabled = isBefore( month, startDate ) || isAfter( month, endDate );
                                                const isCurrentMonth =
                                                    month.getMonth() === currentMonth && year.getFullYear() === currentYear;

                                                return (
                                                    <Button
                                                        key={ month.getTime() }
                                                        ref={ isCurrentMonth ? currentMonthButtonRef : undefined }
                                                        variant={ isCurrentMonth ? "default" : "outline" }
                                                        size="sm"
                                                        className="h-7"
                                                        disabled={ isDisabled }
                                                        onClick={ () => onMonthSelect( month ) }
                                                    >
                                                        { format( month, "MMM" ) }
                                                    </Button>
                                                );
                                            } ) }
                                        </div>
                                    </CollapsibleYear>
                                </div>
                            );
                        } ) }
                    </ScrollArea>
                </div>
            ) }
        </div>
    );
}

function CaptionLabel ( {
    children,
    isYearView,
    setIsYearView,
} ) {
    return (
        <Button
            className="-ms-2 flex items-center gap-2 text-sm font-medium hover:bg-transparent data-[state=open]:text-muted-foreground/80 [&[data-state=open]>svg]:rotate-180"
            variant="ghost"
            size="sm"
            onClick={ () => setIsYearView( ( prev ) => !prev ) }
            data-state={ isYearView ? "open" : "closed" }
        >
            { children }
            <ChevronDown
                size={ 16 }
                strokeWidth={ 2 }
                className="shrink-0 text-muted-foreground/80 transition-transform duration-200"
                aria-hidden="true"
            />
        </Button>
    );
}

function CollapsibleYear ( {
    title,
    children,
    open,
} ) {
    return (
        <Collapsible className="border-t border-border px-2 py-1.5" defaultOpen={ open }>
            <CollapsibleTrigger asChild>
                <Button
                    className="flex w-full justify-start gap-2 text-sm font-medium hover:bg-transparent [&[data-state=open]>svg]:rotate-180"
                    variant="ghost"
                    size="sm"
                >
                    <ChevronDown
                        size={ 16 }
                        strokeWidth={ 2 }
                        className="shrink-0 text-muted-foreground/80 transition-transform duration-200"
                        aria-hidden="true"
                    />
                    { title }
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden px-3 py-1 text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                { children }
            </CollapsibleContent>
        </Collapsible>
    );
}

function TimePicker ( { timeSlotAvailability, date, setDate, time, setTime } ) {
    /* const timeSlots = [
        { time: "09:00", available: false },
        { time: "09:30", available: false },
        { time: "10:00", available: true },
        { time: "10:30", available: true },
        { time: "11:00", available: true },
        { time: "11:30", available: true },
        { time: "12:00", available: false },
        { time: "12:30", available: true },
        { time: "13:00", available: true },
        { time: "13:30", available: true },
        { time: "14:00", available: true },
        { time: "14:30", available: false },
        { time: "15:00", available: false },
        { time: "15:30", available: true },
        { time: "16:00", available: true },
        { time: "16:30", available: true },
        { time: "17:00", available: true },
        { time: "17:30", available: true },
    ]; */
    const today = new Date();
    //   const [time, setTime] = (null);

    // console.log( "DateInput :: TimePicker :: date = ", date, " :: ", "time = ", time );
    const createTimeSlots = ( availability ) => {
        let slots = [];
        let hours = 24;
        let slotsPerHour = 2;
        let numSlots = hours * slotsPerHour;

        for ( let index = 0; index < numSlots; index++ ) {
            let hr = Math.floor( index / slotsPerHour );
            let slotTime = `${ hr < 10 ? "0" + String( hr ) : String( hr ) }:${ index % 2 === 0 ? '00' : '30' }`;
            slots.push( {
                time: slotTime,
                available: availability?.includes( slotTime ),
                value: 60 * 60 * index + ( index % 2 === 0 ? ( ( 60 * 60 ) / ( 2 ) ) : ( 60 * 60 ) )
            } );
        }
        return slots;
    };

    const timeSlots = createTimeSlots( timeSlotAvailability );

    return (
        <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 border-border py-2 max-sm:border-t">
                <ScrollArea className="h-full border-border sm:border-s">
                    <div className="space-y-3">
                        <div className="flex shrink-0 items-start px-2.5">
                            <p className="text-sm font-medium">
                                {/* { format( date, "EEEE, d" ) } */ }
                                {/* { isValidDate( date )
                                    ? format( isValidDate( date ), "EEEE, d" )
                                    : format( isValidDate( new Date() ), "EEEE, d" ) } */}
                                {/* { cleanDateToString( date ) } */ }
                                { date?.from ? (
                                    date?.to ? (
                                        <>
                                            { format( date?.from, "LLL dd, y" ) } -{ " " }
                                            { format( date?.to, "LLL dd, y" ) }
                                        </>
                                    )
                                        : ( format( date?.from, "LLL dd, y" ) )
                                )
                                    : ( <span>Pick a date</span> ) }
                            </p>
                        </div>
                        <div className="px-2 max-sm:grid-cols-2 grid-cols-1"
                            style={ {
                                display: `grid`,
                                gridTemplateColumns: `repeat(auto-fill, minmax(3rem, 1fr)) !important`,
                                gridGap: `0.125rem !important`,
                                gridAutoRows: `minmax(1fr, 1fr) !important`
                            } }
                        >
                            { timeSlots.map( ( { time: timeSlot, available } ) => (
                                <Button
                                    key={ timeSlot }
                                    variant={ time === timeSlot ? "default" : "outline" }
                                    size="sm"
                                    className={ `w-full cursor-pointer hover:bg-header/20` }
                                    onClick={ () => setTime( timeSlot ) }
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
    );
}

const DateInputFormat = ( props ) => {
    const [ dateInput, setDateInput ] = useState();
    const [ dateSeparator, setDateSeparator ] = useState( "/" );
    const [ isValidDate, setIsValidDate ] = useState();
    const [ dateFormat, setDateFormat ] = useState( "DD/MM/YYYY" );
    const [ errorSummary, setErrorSummary ] = useState();
    let isBackspacePressed = false;
    const validDateSeparators = [ "/", ".", "-" ];

    useEffect( () => {
        validateDate();
    }, [ dateInput, dateFormat ] );

    onDateFormatChange = ( e ) => {
        const value = e.target.value;
        const separator = validDateSeparators.find(
            ( item ) => value.indexOf( item ) > -1
        );
        console.log( "Date separator changed to :>> ", separator );
        setDateSeparator( separator );
        setDateFormat( value );
        setDateInput( "" );
    };

    autoFormatDate = ( input ) => {
        let preFormattedInput = input;
        if ( !isNonEmptyArray( input ) && !isBackspacePressed ) {
            debugger;
            const dateFields = dateFormat.split( dateSeparator );
            const inputLength = input.length;
            const separatorLength = dateSeparator.length;
            const firstMatchLength = dateFields[ 0 ].length;
            const secondMatchLength =
                dateFields[ 0 ].length + separatorLength + dateFields[ 1 ].length;
            const separatorCount = preFormattedInput.split( dateSeparator ).length - 1;

            if ( separatorCount !== 2 ) {
                console.log( "🔴 🔴 🔴 🔴 formatting date..!! 🔴 🔴 🔴 🔴 " );
                preFormattedInput = preFormattedInput.replaceAll( dateSeparator, "" );

                if ( inputLength >= firstMatchLength ) {
                    if ( inputLength >= secondMatchLength ) {
                        preFormattedInput =
                            preFormattedInput.slice( 0, firstMatchLength ) +
                            dateSeparator +
                            preFormattedInput.slice( firstMatchLength, secondMatchLength - 1 ) +
                            dateSeparator +
                            preFormattedInput.slice( secondMatchLength - 1 );
                    } else {
                        preFormattedInput =
                            preFormattedInput.slice( 0, firstMatchLength ) +
                            dateSeparator +
                            preFormattedInput.slice( firstMatchLength );
                    }
                }
            }
        }
        setDateInput( preFormattedInput );
    };

    const formats = [
        { value: 'D/M/YY', name: 'D/M/YY' },
        { value: 'D-M-YY', name: 'D-M-YY' },
        { value: 'D.M.YY', name: 'D.M.YY' },
        { value: 'M/D/YY', name: 'M/D/YY' },
        { value: 'M-D-YY', name: 'M-D-YY' },
        { value: 'M.D.YY', name: 'M.D.YY' },
        { value: 'DD/MM/YY', name: 'DD/MM/YY' },
        { value: 'DD-MM-YY', name: 'DD-MM-YY' },
        { value: 'DD.MM.YY', name: 'DD.MM.YY' },
        { value: 'MM/DD/YY', name: 'MM/DD/YY' },
        { value: 'MM-DD-YY', name: 'MM-DD-YY' },
        { value: 'MM.DD.YY', name: 'MM.DD.YY' },
        { value: 'DD/MM/YYYY', name: 'DD/MM/YYYY' },
        { value: 'DD-MM-YYYY', name: 'DD-MM-YYYY' },
        { value: 'DD.MM.YYYY', name: 'DD.MM.YYYY' },
        { value: 'MM/DD/YYYY', name: 'MM/DD/YYYY' },
        { value: 'MM-DD-YYYY', name: 'MM-DD-YYYY' },
        { value: 'MM.DD.YYYY', name: 'MM.DD.YYYY' },
        { value: 'YYYY/MM/DD', name: 'YYYY/MM/DD' },
        { value: 'YYYY-MM-DD', name: 'YYYY-MM-DD' },
        { value: 'YYYY.MM.DD', name: 'YYYY.MM.DD' },
    ];

    onDateInputChange = ( e ) => {
        const value = e.target.value;
        autoFormatDate( value );
    };

    validateDate = () => {
        if ( !isNonEmptyArray( dateInput ) ) {
            const isValidDate = moment( dateInput, dateFormat, true ).isValid();
            setIsValidDate( isValidDate );
            setErrorSummary(
                isValidDate
                    ? "Date is valid..!!"
                    : "Please check the date and try again..!!"
            );
        } else {
            setIsValidDate( false );
            setErrorSummary( "" );
        }
    };

    keyDown = ( e ) => {
        const keyCode = e.keyCode || e.which;
        isBackspacePressed = keyCode === 8;
    };

    return (
        <div className="container">
            <h1>React Date with Formats!</h1>
            <select
                name="date format list"
                className="date-format"
                id="dateFormats"
                value={ dateFormat }
                onChange={ onDateFormatChange }
            >
                { formats?.map( ( [ value, name ] ) => ( <option value={ value }>{ name }</option> ) ) }
                {/* <option value="D/M/YY">D/M/YY</option>
                <option value="D-M-YY">D-M-YY</option>
                <option value="D.M.YY">D.M.YY</option>
                <option value="M/D/YY">M/D/YY</option>
                <option value="M-D-YY">M-D-YY</option>
                <option value="M.D.YY">M.D.YY</option>
                <option value="DD/MM/YY">DD/MM/YY</option>
                <option value="DD-MM-YY">DD-MM-YY</option>
                <option value="DD.MM.YY">DD.MM.YY</option>
                <option value="MM/DD/YY">MM/DD/YY</option>
                <option value="MM-DD-YY">MM-DD-YY</option>
                <option value="MM.DD.YY">MM.DD.YY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                <option value="MM.DD.YYYY">MM.DD.YYYY</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="YYYY.MM.DD">YYYY.MM.DD</option> */}
            </select>
            <input
                id="dateInput"
                className="date-input"
                type="tel"
                placeholder={ dateFormat }
                name="custom date input"
                value={ dateInput }
                maxLength={ dateFormat.length }
                onChange={ onDateInputChange }
                onKeyDown={ keyDown }
            />
            <div className={ isValidDate ? "error-summary" : "error-summary error" }>
                { errorSummary }
            </div>
            <button className="calculate" onClick={ validateDate }>
                Validate
            </button>
        </div>
    );
};

DateInput.Format = DateInputFormat;


export default DateInput;

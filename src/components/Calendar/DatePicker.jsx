import React, { createContext, use, useContext, useEffect, useRef, useState } from 'react';
import { Calendar, MonthsDropdown } from "@/components/ui/calendar";
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import * as utils from 'akashatools';
import clsx from 'clsx';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select';
import { addDays, differenceInDays, format } from "date-fns";
import { buildSelect } from '@/lib/utilities/input';
import { isValidDate } from '@/lib/utilities/time';
import { Badge } from '../ui/badge';
import { twMerge } from 'tailwind-merge';
import { DayPickerContext } from 'react-day-picker';
import { Label } from '@/components/ui/label';

const cleanDateToString = ( date ) => {
    // console.log( "DatePicker :: date = ", date, " :: " );
    return ( ( date !== null && date !== undefined )
        ? ( isValidDate( date )
            // SelectedDate is a date object
            ? ( format( new Date( date ), "PPP" ) )
            : ( format( new Date( Date.now() ), "PPP" ) ) )
        : ( utils.val.isObject( date )
            && ( date?.hasOwnProperty( 'from' ) && isValidDate( date?.from ) )
            && ( date?.hasOwnProperty( 'to' ) && isValidDate( date?.to ) )
            // SelectedDate is an object of 2 date objects.
            ? ( ( `${ format( new Date( date?.from ), "PPP" ) } \n${ format( new Date( date?.to ), "PPP" ) }` ) )
            : ( <span>Pick a date</span> ) )
    );
};

const cleanDateToString2 = ( date ) => {
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


/* const SelectedDateContext = React.createContext( {
    selected: new Date( Date.now() ),
    setSelected: ( date ) => ( this?.selected = date ),
} ); */

const SelectedDateContext = createContext( null );

export function SelectedDateProvider ( { children } ) {
    const [ selected, setSelected ] = useState( new Date( Date.now() ) );

    return <SelectedDateContext.Provider value={ {
        selected,
        setSelected,
    } }>
        { children }
    </SelectedDateContext.Provider>;
}

export function useSelectedDate () {
    const context = useContext( SelectedDateContext );
    if ( !context ) {
        throw new Error( "useSelectedDate must be used within a SelectedDateProvider" );
    }
    return context;
}


function DayButton ( props ) {
    const { day, modifiers, bookedDates = [], disableBookedDates = false, ...buttonProps } = props;

    // const { selected, setSelected } = useSelectedDate();
    const { selectedDate, setSelectedDate } = use( SelectedDateContext );
    // console.log( "DatePicker :: DayButton :: isBookedDate :: props = ", props );

    const isBookedDate = () => {
        let thisDate = day.date;
        let isBooked = false;
        console.log( "DatePicker :: DayButton :: isBookedDate :: date = ", date, ' :: ', 'modifiers = ', modifiers, ' :: ', 'day = ', day );
        if ( utils.val.isValidArray( bookedDates, true ) ) {
            bookedDates?.forEach( ( date ) => {
                if ( differenceInDays( new Date( thisDate ).getDate(), new Date( date ).getDate() ) <= 0 ) {
                    console.log( "Date = ", date, " :: ", "isBooked!" );
                    isBooked = true;
                }
            } );
        }
        return isBooked;
    };

    return (
        <button
            { ...buttonProps }
            onClick={ () => setSelectedDate?.( undefined ) }
            onDoubleClick={ () => setSelectedDate?.( day.date ) }
            { ...( disableBookedDates ? { disabled: true } : null ) }
        >
            { isBookedDate()
                ? ( <Badge variant={ 'primary' } key={ `booked-day-` } className={ `` } /> )
                : ( <></> ) }
        </button>
    );
}

const DatePicker = ( props ) => {
    const {
        placeholder = '',
        usePopover = false,
        useSelect = false,
        selectKey = '',
        selectValue = '',
        selectOnChange = ( k, v ) => { },
        options = [],
        events = [], // Array of existing events to show highlighted on the calendar. 
        selectedDate,
        setSelectedDate,
        mode = `range`,
        showOutsideDays = true,
        className = '',
        footer = <></>,
        modifiers = {},
        components = {},
        disableBookedDates,
        bookedDays,
    } = props;

    const [ selectedDayText, setSelectedDateText ] = useState( '' );
    const [ selected, setSelected ] = useState();

    useEffect( () => {
        if ( utils.val.isObject( selectedDate ) ) {
            if ( Object.keys( selectedDate ).length > 1 ) {
                // console.log( "SelectedDate = ", typeof selectedDate );
                let first = selectedDate[ Object.keys( selectedDate )[ 0 ] ];
                let last = selectedDate[ Object.keys( selectedDate )[ Object.keys( selectedDate ).length - 1 ] ];
                // console.log( "DatePicker.jsx :: ", "selectedDate changed :: selectedDate = ", JSON.stringify( selectedDate ), " :: first = ", first, " :: last = ", last );
                setSelectedDateText( `${ first }-${ last }` );
            }
            else {
                setSelectedDateText( selectedDate ? selectedDate : 'Pick A Day' );
            }
        }

        // console.log( "DatePicker.jsx :: props = ", props, " :: ", "selectedDate changed :: selectedDate = ", selectedDate );
    }, [ selectedDate ] );

    const buildSelectInput = () => (
        buildSelect( {
            placeholder: 'Select a date',
            opts: options,
            key: selectKey,
            value: selectValue,
            initialData: selectValue,
            handleChange: ( key, value ) => {
                if ( selectOnChange ) selectOnChange( selectKey, value );
            },
            className: 'date-picker-popover-select',
            multiple: false,
        } )
    );

    const buildCalendar = () => {
        return (
            <DayPickerContext.Provider>
                <SelectedDateContext.Provider value={ { selectedDate, setSelectedDate } }>
                    <Calendar
                        modifiers={ {
                            ...modifiers,
                            booked: bookedDays,
                        } }
                        bookedDays={ bookedDays }
                        components={ {
                            // Day: CustomDaycell,
                            // Day: <CustomDayButton buttonProps={ { onClick: () => setSelectedDate( date ) } } />,
                            // DayButton,
                            // DayButton: ( props ) => ( <DayButton
                            //     { ...props }
                            //     bookedDates={ bookedDays }
                            //     disableBookedDates={ disableBookedDates ?? false }
                            //     modifiers={ modifiers }
                            // /> ),
                            // MonthGrid: CustomMonthGrid,
                            MonthsDropdown,
                            // ...components
                        } }
                        className={
                            clsx( [
                                // className,
                                `![&_[role=gridcell].bg-accent]:bg-sidebar-primary`,
                                `![&_[role=gridcell].bg-accent]:washed-purple-900`,
                                `![&_[role=gridcell]]:w-[24px] !p-0 m-0`,
                                // usePopover && `z-[2000]`,
                            ] )
                        }
                        showOutsideDays={ !!showOutsideDays }
                        mode={ mode }
                        // selected={ selectedDate }
                        selected={
                            selectedDate
                            // selectedDate
                            //     ? ( utils.val.isObject( selectedDate )
                            //         && selectedDate?.hasOwnProperty( 'from' )
                            //         && selectedDate?.hasOwnProperty( 'to' )
                            //         ? {
                            //             from: selectedDate?.from,
                            //             to: selectedDate?.to
                            //         }
                            //         : selectedDate
                            //     )
                            //     : <span>Pick a date</span>
                        }
                        onSelect={ ( date ) => {
                            console.log( "DatePicker.jsx :: Calendar component :: onSelect :: date chosen = ", date );
                            setSelectedDate( date );
                        } }
                        initialFocus
                        numberOfMonths={ usePopover ? 2 : 1 }
                        captionLayout="dropdown"
                        footer={ <>{ footer ? footer : `${ selectedDayText } ` }</> }
                        hideNavigation
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        defaultMonth={ selectedDate?.from }
                        startMonth={ new Date( new Date().getFullYear() - 1, 1 ) }
                        endMonth={ new Date( new Date().getFullYear() + 1, 12 ) }
                        fromYear={ 2015 }
                        toYear={ 2025 }
                        pagedNavigation={ true }
                        reverseMonths={ true }
                        onDayClick={ ( day, modifiers ) => {
                            console.log( "Datepicker.jsx :: Calendar :: onDayClick :: day = ", day, " :: ", "modifiers = ", modifiers, " :: ", "selectedDate = ", selectedDate );

                            // Clear the selection if the day is already selected
                            if ( modifiers.selected ) {
                                // If modifiers.selected is true, change the from-date.
                                if ( mode === 'range' ) {
                                    setSelectedDate( { ...selectedDate, from: new Date( day ) } );
                                }
                                else {
                                    setSelectedDate( null );
                                }

                                // setSelectedDate( {
                                //     from: new Date( day?.from ),
                                //     to: new Date( day?.to ),
                                // } );
                            }
                            else {
                                if ( mode === 'range' ) {
                                    setSelectedDate( { ...selectedDate, to: new Date( day ) } );
                                }
                                else {
                                    setSelectedDate( new Date( day ) );
                                }

                            }
                        } }
                        { ...props }
                    />
                </SelectedDateContext.Provider>
            </DayPickerContext.Provider>
        );
    };


    return (
        <SidebarGroup className={ `px-0 py-0 max-w-full w-full` }>
            <SidebarGroupContent className={ `px-0 py-0 max-w-full w-full` }>


                {/* <div className="gap-1 grid grid-cols-2 w-full">
                    <Label className="text-xs font-medium">Completed Date</Label>
                    <Popover
                        modal
                        open={ isCalendarOpen && calendarOpenFor === 'timestampCompleted' }
                        onOpenChange={ () => {
                            setIsCalendarOpen( !isCalendarOpen );
                            if ( !isCalendarOpen === true ) setCalendarOpenFor( 'timestampCompleted' );
                            else setCalendarOpenFor( null );
                        } }
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={ `w-full justify-start text-left font-normal h-6 text-xs ${ !taskFormData?.timestampCompleted && "text-muted-foreground" }` }
                            >
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                { taskFormData?.timestampCompleted && isValid( taskFormData?.timestampCompleted ) ? format( taskFormData?.timestampCompleted, "PPP" ) : "Select date" }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                className={ `z-[2000]` }
                                mode="single"
                                selected={ new Date( taskFormData?.timestampCompleted ) }
                                onSelect={ ( date ) => {
                                    setTaskFormData( { ...taskFormData, [ 'timestampCompleted' ]: date } );
                                    setIsCalendarOpen( false );
                                } }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div> */}

                { usePopover
                    ? (
                        <Popover modal>
                            <PopoverTrigger asChild className={ `` }>

                                <div className={ twMerge(
                                    `items-center justify-center min-w-[10rem] w-[10rem] group relative`,
                                    className
                                ) }>
                                    <Button
                                        variant={ "outline" }
                                        className={ cn(
                                            `px-4 justify-around text-left font-normal`,
                                            `w-full`,
                                            // className,
                                            !selectedDate && "text-muted-foreground",
                                            `!hover:transform-none`
                                        ) }
                                    >
                                        <CalendarIcon />
                                        <div className={ `whitespace-break-spaces flex-wrap text-wrap text-[0.75rem] leading-auto justify-stretch p-4 items-between` }>
                                            { new Date( selectedDate ) instanceof Date ? cleanDateToString( selectedDate ) : placeholder }
                                        </div>
                                        <Label
                                            htmlFor={ "timestampDue" }
                                            className={ twMerge(
                                                // `col-span-1 !flex !items-center !justify-start px-2 w-auto min-w-min`,
                                                'absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50'
                                            ) }
                                        >
                                            { placeholder ?? 'Date' }
                                        </Label>

                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent asChild className="flex w-auto flex-col space-y-2 p-2 z-[2000]">
                                <div className={ `flex flex-grow items-center justify-center` }>
                                    <div className={ `p-2 rounded-lg border` }>
                                        {/* <CustomSelectDropdown
                                            onChange={ ( e ) => { e.preventDefault(); } }
                                        /> */}
                                        { useSelect === true && ( buildSelectInput() ) }
                                        { buildCalendar() }
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )
                    : ( <div className={ `flex flex-grow items-center justify-center` }>
                        <div className={ `p-2 rounded-lg border` }>
                            {/* <CustomSelectDropdown
                                onChange={ ( e ) => { e.preventDefault(); } }
                            /> */}
                            { useSelect === true && ( buildSelectInput() ) }
                            { buildCalendar() }
                        </div>
                    </div> ) }
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export function DateRangePicker ( props ) {
    const {
        date,
        setDate,
        className,
    } = props;
    /* 
        const [ selectedDate, setSelectedDate ] = useState( {
            from: new Date( date?.from ),
            to: addDays( new Date( date?.to ), 20 ),
        } ); */

    return (
        <div className={ cn( "grid gap-1", className ) }>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={ "outline" }
                        className={ cn(
                            `justify-start text-left font-normal whitespace-pre h-min py-[0.125rem]`,
                            // `w-[260px] `,
                            `!w-full !max-w-full`,
                            !date && "text-muted-foreground"
                        ) }
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        { cleanDateToString( date ) }
                        {/* { date?.from ? (
                            date?.to ? (
                                <>
                                    { format( date?.from, "LLL dd, y" ) } -{ " " }
                                    { format( date?.to, "LLL dd, y" ) }
                                </>
                            )
                                : ( format( date?.from, "LLL dd, y" ) )
                        )
                            : ( <span>Pick a date</span> ) } */}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={ date?.from }
                        selected={ date }
                        onSelect={ setDate }
                        numberOfMonths={ 2 }
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}


DatePicker.Range = DateRangePicker;

export function CustomDayButton ( props ) {
    const { day, modifiers, ...buttonProps } = props;
    const ref = useRef( null );

    // useEffect( () => {
    //     if ( modifiers.focused ) ref.current?.focus();
    // }, [ modifiers.focused ] );

    return <button ref={ ref } { ...buttonProps } onClick={ () => { modifiers.setDate( day ); } }>
        { day }
    </button>;
}

export function CustomDaycell ( props ) {
    const { day, modifiers, ...tdProps } = props;

    const handleValueChange = ( newValue ) => {
        if ( onChange ) {
            const syntheticEvent = {
                target: {
                    value: newValue
                }
            };

            onChange( syntheticEvent );
        }
    };

    const today = new Date();

    return (
        <span style={ { position: "relative", overflow: "visible" } }>
            <td { ...tdProps } />
            { props.date.getDate() === today ? ` 🎉` : props.date.getDate() }
        </span>
    );
}

export function CustomSelectDropdown ( { options, value, onChange, ...props } ) {
    // const { options, value, onChange } = props;

    const handleValueChange = ( newValue ) => {
        if ( onChange ) {
            const syntheticEvent = {
                target: {
                    value: newValue
                }
            };

            onChange( syntheticEvent );
        }
    };

    return (
        <Select value={ value?.toString() } onValueChange={ handleValueChange }>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    { options?.map( ( option ) => (
                        <SelectItem
                            key={ option.value }
                            value={ option.value.toString() }
                            disabled={ option.disabled }
                        >
                            { option.label }
                        </SelectItem>
                    ) ) }
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default DatePicker;
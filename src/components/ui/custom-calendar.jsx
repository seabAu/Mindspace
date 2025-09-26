import React, { createContext, useContext, useState } from 'react';
// import {
//     CalendarBody,
//     CalendarDate,
//     CalendarDatePagination,
//     CalendarDatePicker,
//     CalendarHeader,
//     CalendarItem,
//     CalendarMonthPicker,
//     CalendarProvider,
//     CalendarYearPicker,
// } from "@/components/ui/custom-calendar";
import {
    getDay,
    getDaysInMonth,
    isSameDay,
    addMonths,
    endOfMonth,
    startOfMonth,
    subDays,
    subMonths,
} from "date-fns";
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';


export const useCalendar = create()(
    devtools( ( set ) => ( {
        sec: new Date().getSeconds(),
        min: new Date().getMinutes(),
        hour: new Date().getHours(),
        day: new Date().getDay(),
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        setSec: ( sec ) => set( () => ( { sec } ) ),
        setMin: ( min ) => set( () => ( { min } ) ),
        setHour: ( hour ) => set( () => ( { hour } ) ),
        setDay: ( day ) => set( () => ( { day } ) ),
        setMonth: ( month ) => set( () => ( { month } ) ),
        setYear: ( year ) => set( () => ( { year } ) ),
    } ) )
);

/* type CalendarContextProps = {
    locale: Intl.LocalesArgument;
    startDay: number;
}; */

const CalendarContext = createContext( {
    locale: 'en-US',
    startDay: 0,
} );

/* export type Status = {
    id: string;
    name: string;
    color: string;
};

export type Feature = {
    id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    status: Status;
};

type ComboboxProps = {
    value: string;
    setValue: ( value: string ) => void;
    data: {
        value: string;
        label: string;
    }[];
    labels: {
        button: string;
        empty: string;
        search: string;
    };
    className?: string;
}; */

export const monthsForLocale = (
    localeName,
    monthFormat = 'long'
) => {
    const format = new Intl.DateTimeFormat( localeName, { month } ).format;

    return [ ...new Array( 12 ).keys() ].map( ( m ) =>
        format( new Date( Date.UTC( 2021, m % 12 ) ) )
    );
};

export const daysForLocale = ( locale, startDay ) => {
    const weekdays = [];
    const baseDate = new Date( 2024, 0, startDay );

    for ( let i = 0; i < 7; i++ ) {
        weekdays.push(
            new Intl.DateTimeFormat( locale, { weekday: 'short' } ).format( baseDate )
        );
        baseDate.setDate( baseDate.getDate() + 1 );
    }

    return weekdays;
};

const Combobox = ( {
    value,
    setValue,
    data,
    labels,
    className,
} ) => {
    const [ open, setOpen ] = useState( false );

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    aria-expanded={ open }
                    className={ cn( 'w-40 justify-between capitalize', className ) }
                >
                    { value
                        ? data.find( ( item ) => item.value === value )?.label
                        : labels.button }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
                <Command
                    filter={ ( value, search ) => {
                        const label = data.find( ( item ) => item.value === value )?.label;

                        return label?.toLowerCase().includes( search.toLowerCase() ) ? 1 : 0;
                    } }
                >
                    <CommandInput placeholder={ labels.search } />
                    <CommandList>
                        <CommandEmpty>{ labels.empty }</CommandEmpty>
                        <CommandGroup>
                            { data.map( ( item ) => (
                                <CommandItem
                                    key={ item.value }
                                    value={ item.value }
                                    onSelect={ ( currentValue ) => {
                                        setValue( currentValue === value ? '' : currentValue );
                                        setOpen( false );
                                    } }
                                    className="capitalize"
                                >
                                    <Check
                                        className={ cn(
                                            'mr-2 h-4 w-4',
                                            value === item.value ? 'opacity-100' : 'opacity-0'
                                        ) }
                                    />
                                    { item.label }
                                </CommandItem>
                            ) ) }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

/* type OutOfBoundsDayProps = {
    day: number;
}; */

export const OutOfBoundsDay = ( { day } ) => (
    <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
        { day }
    </div>
);

/* export type CalendarBodyProps = {
    features: Feature[];
    children: ( props: {
        feature: Feature;
    } ) => ReactNode;
}; */

export const CalendarBody = ( { features, children } ) => {
    const { month, year } = useCalendar();
    const { startDay } = useContext( CalendarContext );
    const daysInMonth = getDaysInMonth( new Date( year, month, 1 ) );
    const firstDay = ( getDay( new Date( year, month, 1 ) ) - startDay + 7 ) % 7;
    const days = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth( new Date( prevMonthYear, prevMonth, 1 ) );
    const prevMonthDaysArray = Array.from(
        { length: prevMonthDays },
        ( _, i ) => i + 1
    );

    for ( let i = 0; i < firstDay; i++ ) {
        const day = prevMonthDaysArray[ prevMonthDays - firstDay + i ];

        if ( day ) {
            days.push( <OutOfBoundsDay key={ `prev-${ i }` } day={ day } /> );
        }
    }

    for ( let day = 1; day <= daysInMonth; day++ ) {
        const featuresForDay = features.filter( ( feature ) => {
            return isSameDay( new Date( feature.endAt ), new Date( year, month, day ) );
        } );

        days.push(
            <div
                key={ day }
                className="relative flex h-full w-full flex-col gap-1 p-1 text-muted-foreground text-xs"
            >
                { day }
                <div>
                    { featuresForDay.slice( 0, 3 ).map( ( feature ) => children( { feature } ) ) }
                </div>
                { featuresForDay.length > 3 && (
                    <span className="block text-muted-foreground text-xs">
                        +{ featuresForDay.length - 3 } more
                    </span>
                ) }
            </div>
        );
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth( new Date( nextMonthYear, nextMonth, 1 ) );
    const nextMonthDaysArray = Array.from(
        { length: nextMonthDays },
        ( _, i ) => i + 1
    );

    const remainingDays = 7 - ( ( firstDay + daysInMonth ) % 7 );
    if ( remainingDays < 7 ) {
        for ( let i = 0; i < remainingDays; i++ ) {
            const day = nextMonthDaysArray[ i ];

            if ( day ) {
                days.push( <OutOfBoundsDay key={ `next-${ i }` } day={ day } /> );
            }
        }
    }

    return (
        <div className="grid flex-grow grid-cols-7">
            { days.map( ( day, index ) => (
                <div
                    key={ index }
                    className={ cn(
                        'relative aspect-square overflow-hidden border-t border-r',
                        index % 7 === 6 && 'border-r-0'
                    ) }
                >
                    { day }
                </div>
            ) ) }
        </div>
    );
};

/* export type CalendarDatePickerProps = {
    className?: string;
    children: ReactNode;
}; */

export const CalendarDatePicker = ( {
    className,
    children,
} ) => (
    <div className={ cn( 'flex items-center gap-1', className ) }>{ children }</div>
);

/* export type CalendarMonthPickerProps = {
    className?: string;
}; */

export const CalendarMonthPicker = ( {
    className,
} ) => {
    const { month, setMonth } = useCalendar();
    const { locale } = useContext( CalendarContext );

    return (
        <Combobox
            className={ className }
            value={ month.toString() }
            setValue={ ( value ) =>
                setMonth( Number.parseInt( value ) )
            }
            data={ monthsForLocale( locale ).map( ( month, index ) => ( {
                value: index.toString(),
                label: month,
            } ) ) }
            labels={ {
                button: 'Select month',
                empty: 'No month found',
                search: 'Search month',
            } }
        />
    );
};

/* export type CalendarYearPickerProps = {
    className?: string;
    start: number;
    end: number;
}; */

export const CalendarYearPicker = ( {
    className,
    start,
    end,
} ) => {
    const { year, setYear } = useCalendar();

    return (
        <Combobox
            className={ className }
            value={ year.toString() }
            setValue={ ( value ) => setYear( Number.parseInt( value ) ) }
            data={ Array.from( { length: end - start + 1 }, ( _, i ) => ( {
                value: ( start + i ).toString(),
                label: ( start + i ).toString(),
            } ) ) }
            labels={ {
                button: 'Select year',
                empty: 'No year found',
                search: 'Search year',
            } }
        />
    );
};

/* export type CalendarDatePaginationProps = {
    className?: string;
}; */

export const CalendarDatePagination = ( {
    className,
} ) => {
    const { month, year, setMonth, setYear } = useCalendar();

    const handlePreviousMonth = () => {
        if ( month === 0 ) {
            setMonth( 11 );
            setYear( year - 1 );
        } else {
            setMonth( ( month - 1 ) );
        }
    };

    const handleNextMonth = () => {
        if ( month === 11 ) {
            setMonth( 0 );
            setYear( year + 1 );
        } else {
            setMonth( ( month + 1 ) );
        }
    };

    return (
        <div className={ cn( 'flex items-center gap-2', className ) }>
            <Button onClick={ () => handlePreviousMonth() } variant="ghost" size="icon">
                <ChevronLeftIcon size={ 16 } />
            </Button>
            <Button onClick={ () => handleNextMonth() } variant="ghost" size="icon">
                <ChevronRightIcon size={ 16 } />
            </Button>
        </div>
    );
};

/* export type CalendarDateProps = {
    children: ReactNode;
}; */

export const CalendarDate = ( { children } ) => (
    <div className="flex items-center justify-between p-3">{ children }</div>
);

/* export type CalendarHeaderProps = {
    className?: string;
}; */

export const CalendarHeader = ( { className } ) => {
    const { locale, startDay } = useContext( CalendarContext );

    return (
        <div className={ cn( 'grid flex-grow grid-cols-7', className ) }>
            { daysForLocale( locale, startDay ).map( ( day ) => (
                <div key={ day } className="p-3 text-right text-muted-foreground text-xs">
                    { day }
                </div>
            ) ) }
        </div>
    );
};

/* export type CalendarItemProps = {
    feature: Feature;
    className?: string;
}; */

export const CalendarItem = ( { feature, className } ) => (
    <div className={ cn( 'flex items-center gap-2', className ) } key={ feature.id }>
        <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={ {
                backgroundColor: feature.status.color,
            } }
        />
        <span className="truncate">{ feature.name }</span>
    </div>
);

/* export type CalendarProviderProps = {
    locale?: Intl.LocalesArgument;
    startDay?: number;
    children: ReactNode;
    className?: string;
}; */

export const CalendarProvider = ( {
    locale = 'en-US',
    startDay = 0,
    children,
    className,
} ) => (
    <CalendarContext.Provider value={ { locale, startDay } }>
        <div className={ cn( 'relative flex flex-col', className ) }>{ children }</div>
    </CalendarContext.Provider>
);



export const CustomCalendarRender = ( { items } ) => {
    const today = new Date();
    const earliestYear =
        items
            .map( ( item ) => item.start.getFullYear() )
            .sort()
            .at( 0 ) ?? new Date().getFullYear();

    const latestYear =
        items
            .map( ( item ) => item.end.getFullYear() )
            .sort()
            .at( -1 ) ?? new Date().getFullYear();

    return (
        <CalendarProvider>
            <CalendarDate>
                <CalendarDatePicker>
                    <CalendarMonthPicker />
                    <CalendarYearPicker start={ earliestYear } end={ latestYear } />
                </CalendarDatePicker>
                <CalendarDatePagination />
            </CalendarDate>
            <CalendarHeader />
            <CalendarBody features={ exampleFeatures }>
                { ( { item } ) => <CalendarItem key={ item.id } item={ item } /> }
            </CalendarBody>
        </CalendarProvider>
    );
};
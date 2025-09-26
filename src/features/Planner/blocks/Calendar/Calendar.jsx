// https://21st.dev/haydenbleasel/calendar/default // 

import DropTable from '@/components/Droplist/droptable';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/* export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year;
  setMonth: (month) => void;
  setYear: (year) => void;
}; */

export const useCalendar = create()(
    devtools( ( set ) => ( {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        setMonth: ( month ) => set( () => ( { month } ) ),
        setYear: ( year ) => set( () => ( { year } ) ),
    } ) )
);

/* type CalendarContextProps = {
  locale;
  startDay;
}; */

const CalendarContext = createContext( {
    locale: 'en-US',
    startDay: 0,
} );

/* export type Status = {
  id: string;
  name: string;
  color: string;
}; */

/* export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
}; */

/* type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
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
    const format = new Intl.DateTimeFormat( localeName, { month: monthFormat } )
        .format;

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
                    className={ cn( 'w-40 px-2 gap-1 justify-between capitalize', className ) }
                >
                    { value
                        ? data.find( ( item ) => item.value === value )?.label
                        : labels.button }
                    <ChevronsUpDown className="ml-0 px-0 h-4 w-4 shrink-0 opacity-50" />
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
  day;
}; */

const OutOfBoundsDay = ( { day } ) => (
    <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
        { day }
    </div>
);

/* export type CalendarBodyProps = {
  features: Feature[];
  children: (props: {
    feature: Feature;
  }) => ReactNode;
}; */

export const CalendarBody = ( { features, onDayClick, onDayDoubleClick, children } ) => {
    const [ selectedDate, setSelectedDate ] = useState( null );
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
        const featuresForDay = features?.filter( ( feature ) => {
            return isSameDay( new Date( feature?.date ), new Date( year, month, day ) );
        } );

        days.push(
            <div
                key={ day }
                className="relative flex h-full w-full flex-col gap-1 p-1 text-muted-foreground text-xs"
            >
                { day }
                <div>
                    { featuresForDay?.slice( 0, 3 ).map( ( feature ) => children ? children( { feature } ) : null ) }
                </div>
                { featuresForDay?.length > 3 && (
                    <span className="block text-muted-foreground text-xs">
                        +{ featuresForDay?.length - 3 } more
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

    // console.log( " new Date( selectedDate ) = ", selectedDate, " :: ", "new Date( day, month, year ) = ", new Date( startDay, month, year ) );

    return (
        <div className="grid flex-grow grid-cols-7">
            { days.map( ( day, index ) => (
                <div
                    key={ index }
                    className={ cn(
                        'relative aspect-square overflow-hidden border-t border-r cursor-pointer hover:bg-Neutrals/neutrals-11',
                        index % 7 === 6 && 'border-r-0',
                        // selectedDate ? new Date( day, month, year ) === new Date( selectedDate ) && 'bg-primary-500/20' : ''
                        isSameDay( new Date( selectedDate ), new Date( day, month, year ) ) && 'bg-primary-500/20',
                    ) }
                    onClick={ ( e ) => {
                        e.preventDefault();
                        if ( onDayClick ) {
                            // onDayClick( new Date( nextMonthDays?.[ index ] ) );
                            let d = new Date();
                            d.setDate( day );
                            d.setMonth( month );
                            d.setYear( year );
                            console.log( "Calendar.jsx :: CalendarBody :: onDayClick :: day = ", day, " :: ", "month = ", month, " :: ", "year = ", year, " :: ", "index = ", index, " :: ", nextMonthDays, nextMonthDaysArray, " :: ", "Date = ", d );

                            setSelectedDate( new Date( d ) );
                            onDayClick( new Date( d ) );
                        }
                    } }
                    onDoubleClick={ ( e ) => {
                        e.preventDefault();
                        if ( onDayDoubleClick ) {
                            // onDayClick( new Date( nextMonthDays?.[ index ] ) );
                            let d = new Date();
                            d.setDate( day );
                            d.setMonth( month );
                            d.setYear( year );
                            console.log( "Calendar.jsx :: CalendarBody :: onDayDoubleClick :: day = ", day, " :: ", "month = ", month, " :: ", "year = ", year, " :: ", "index = ", index, " :: ", nextMonthDays, nextMonthDaysArray, " :: ", "Date = ", d );

                            onDayDoubleClick( new Date( d ) );
                        }
                    } }
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
    <div className={ cn( 'flex max-w-[100%] items-center gap-1', className ) }>{ children }</div>
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
            className={ twMerge(
                'px-2 py-2 max-w-[50%]',
                className
            ) }
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
  start;
  end;
}; */

export const CalendarYearPicker = ( {
    className,
    start,
    end,
} ) => {
    const { year, setYear } = useCalendar();

    return (
        <Combobox
            className={ twMerge(
                'px-2 py-2 max-w-[30%]',
                className
            ) }
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
        <div className={ cn( 'flex gap-1 px-0', className ) }>
            <Button onClick={ () => handlePreviousMonth() } variant="ghost" size="xs" className={ `px-2` }>
                <ChevronLeftIcon size={ 16 } />
            </Button>
            <Button onClick={ () => handleNextMonth() } variant="ghost" size="xs" className={ `px-2` }>
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
    <div className={ cn( 'flex items-center gap-2', className ) } key={ feature?._id }>
        <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={ {
                // backgroundColor: feature.status.color,
                backgroundColor: `#234768`,
            } }
        />
        <span className="truncate">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge variant={ `secondary` } className={ `h-3 w-3 aspect-square rounded-full` } />
                    </TooltipTrigger>
                    <TooltipContent className={ `max-w-[400px] max-h-[400px] overflow-hidden relative` }>
                        <div className={ `max-w-full max-h-full overflow-auto` }>
                            {/* { feature?.title } */ }
                            <DropTable
                                label={ feature?.title }
                                data={ feature }
                                showControls={ true }
                                expandable={ true }
                                compact={ true }
                                collapse={ false }
                                useBackgroundOverlay={ true }
                            />
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </span>
    </div>
);

/* export type CalendarProviderProps = {
  locale?;
  startDay?;
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


/* 
"use client";

import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from "@/components/ui/calendar";
import type { FC } from "react";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

const today = new Date();

const exampleStatuses = [
  { id: "1", name: "Planned", color: "#6B7280" },
  { id: "2", name: "In Progress", color: "#F59E0B" },
  { id: "3", name: "Done", color: "#10B981" },
];

const exampleFeatures = [
  {
    id: "1",
    name: "AI Scene Analysis",
    startAt: startOfMonth(subMonths(today, 6)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[0],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "1",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
      name: "Alice Johnson",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "1", name: "v1.0" },
  },
  {
    id: "2",
    name: "Collaborative Editing",
    startAt: startOfMonth(subMonths(today, 5)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "2",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
      name: "Bob Smith",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "1", name: "v1.0" },
  },
  {
    id: "3",
    name: "AI-Powered Color Grading",
    startAt: startOfMonth(subMonths(today, 4)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[2],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "3",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
      name: "Charlie Brown",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "2", name: "v1.1" },
  },
  {
    id: "4",
    name: "Real-time Video Chat",
    startAt: startOfMonth(subMonths(today, 3)),
    endAt: subDays(endOfMonth(today), 12),
    status: exampleStatuses[0],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "4",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
      name: "Diana Prince",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "2", name: "v1.1" },
  },
  {
    id: "5",
    name: "AI Voice-to-Text Subtitles",
    startAt: startOfMonth(subMonths(today, 2)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "5",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5",
      name: "Ethan Hunt",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "2", name: "v1.1" },
  },
  {
    id: "6",
    name: "Cloud Asset Management",
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: endOfMonth(today),
    status: exampleStatuses[2],
    group: { id: "3", name: "Cloud Infrastructure" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "6",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=6",
      name: "Fiona Gallagher",
    },
    initiative: { id: "3", name: "Cloud Migration" },
    release: { id: "3", name: "v1.2" },
  },
  {
    id: "7",
    name: "AI-Assisted Video Transitions",
    startAt: startOfMonth(today),
    endAt: endOfMonth(addMonths(today, 1)),
    status: exampleStatuses[0],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "7",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=7",
      name: "George Lucas",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "3", name: "v1.2" },
  },
  {
    id: "8",
    name: "Version Control System",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: endOfMonth(addMonths(today, 2)),
    status: exampleStatuses[1],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "8",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=8",
      name: "Hannah Montana",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "3", name: "v1.2" },
  },
  {
    id: "9",
    name: "AI Content-Aware Fill",
    startAt: startOfMonth(addMonths(today, 2)),
    endAt: endOfMonth(addMonths(today, 3)),
    status: exampleStatuses[2],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "9",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=9",
      name: "Ian Malcolm",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "4", name: "v1.3" },
  },
  {
    id: "10",
    name: "Multi-User Permissions",
    startAt: startOfMonth(addMonths(today, 3)),
    endAt: endOfMonth(addMonths(today, 4)),
    status: exampleStatuses[0],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "10",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=10",
      name: "Julia Roberts",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "4", name: "v1.3" },
  },
  {
    id: "11",
    name: "AI-Powered Audio Enhancement",
    startAt: startOfMonth(addMonths(today, 4)),
    endAt: endOfMonth(addMonths(today, 5)),
    status: exampleStatuses[1],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "11",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=11",
      name: "Kevin Hart",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "4", name: "v1.3" },
  },
  {
    id: "12",
    name: "Real-time Project Analytics",
    startAt: startOfMonth(addMonths(today, 5)),
    endAt: endOfMonth(addMonths(today, 6)),
    status: exampleStatuses[2],
    group: { id: "3", name: "Cloud Infrastructure" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "12",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=12",
      name: "Lara Croft",
    },
    initiative: { id: "3", name: "Cloud Migration" },
    release: { id: "5", name: "v1.4" },
  },
  {
    id: "13",
    name: "AI Scene Recommendations",
    startAt: startOfMonth(addMonths(today, 6)),
    endAt: endOfMonth(addMonths(today, 7)),
    status: exampleStatuses[0],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "13",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=13",
      name: "Michael Scott",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "5", name: "v1.4" },
  },
  {
    id: "14",
    name: "Collaborative Storyboarding",
    startAt: startOfMonth(addMonths(today, 7)),
    endAt: endOfMonth(addMonths(today, 8)),
    status: exampleStatuses[1],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "14",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=14",
      name: "Natalie Portman",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "5", name: "v1.4" },
  },
  {
    id: "15",
    name: "AI-Driven Video Compression",
    startAt: startOfMonth(addMonths(today, 8)),
    endAt: endOfMonth(addMonths(today, 9)),
    status: exampleStatuses[2],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "15",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=15",
      name: "Oscar Isaac",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "6", name: "v1.5" },
  },
  {
    id: "16",
    name: "Global CDN Integration",
    startAt: startOfMonth(addMonths(today, 9)),
    endAt: endOfMonth(addMonths(today, 10)),
    status: exampleStatuses[0],
    group: { id: "3", name: "Cloud Infrastructure" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "16",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=16",
      name: "Penelope Cruz",
    },
    initiative: { id: "3", name: "Cloud Migration" },
    release: { id: "6", name: "v1.5" },
  },
  {
    id: "17",
    name: "AI Object Tracking",
    startAt: startOfMonth(addMonths(today, 10)),
    endAt: endOfMonth(addMonths(today, 11)),
    status: exampleStatuses[1],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "17",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=17",
      name: "Quentin Tarantino",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "6", name: "v1.5" },
  },
  {
    id: "18",
    name: "Real-time Language Translation",
    startAt: startOfMonth(addMonths(today, 11)),
    endAt: endOfMonth(addMonths(today, 12)),
    status: exampleStatuses[2],
    group: { id: "2", name: "Collaboration Tools" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "18",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=18",
      name: "Rachel Green",
    },
    initiative: { id: "2", name: "Real-time Collaboration" },
    release: { id: "7", name: "v1.6" },
  },
  {
    id: "19",
    name: "AI-Powered Video Summarization",
    startAt: startOfMonth(addMonths(today, 12)),
    endAt: endOfMonth(addMonths(today, 13)),
    status: exampleStatuses[0],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "19",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=19",
      name: "Samuel L. Jackson",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "7", name: "v1.6" },
  },
  {
    id: "20",
    name: "Blockchain-based Asset Licensing",
    startAt: startOfMonth(addMonths(today, 13)),
    endAt: endOfMonth(addMonths(today, 14)),
    status: exampleStatuses[1],
    group: { id: "3", name: "Cloud Infrastructure" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "20",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=20",
      name: "Tom Hanks",
    },
    initiative: { id: "3", name: "Cloud Migration" },
    release: { id: "7", name: "v1.6" },
  },
];

const earliestYear =
  exampleFeatures
    .map((feature) => feature.startAt.getFullYear())
    .sort()
    .at(0) ?? new Date().getFullYear();

const latestYear =
  exampleFeatures
    .map((feature) => feature.endAt.getFullYear())
    .sort()
    .at(-1) ?? new Date().getFullYear();

const CalendarExample = () => (
  <CalendarProvider>
    <CalendarDate>
      <CalendarDatePicker>
        <CalendarMonthPicker />
        <CalendarYearPicker start={earliestYear} end={latestYear} />
      </CalendarDatePicker>
      <CalendarDatePagination />
    </CalendarDate>
    <CalendarHeader />
    <CalendarBody features={exampleFeatures}>
      {({ feature }) => <CalendarItem key={feature.id} feature={feature} />}
    </CalendarBody>
  </CalendarProvider>
);

export { CalendarExample };
*/
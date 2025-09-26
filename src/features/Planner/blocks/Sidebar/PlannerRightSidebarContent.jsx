/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo } from 'react';
import {
    ChevronRight,
} from "lucide-react";

// Utilities
import * as utils from 'akashatools';
import { buildSelect } from '@/lib/utilities/input';
import usePlanner from '@/lib/hooks/usePlanner';
import { cn } from '@/lib/utilities/style';
import clsx from 'clsx';
import { addDays, addMonths, format, isSameMonth } from 'date-fns';

// Constants / Config
import {
    DATE_PICKER_OPTIONS,
} from '@/lib/config/constants';

// Data stores
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';

// Components
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import Nav from '@/components/Nav/Nav';
import DatePicker, { DateRangePicker } from '@/components/Calendar/DatePicker';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import CalendarSelector from '@/features/Planner/blocks/Calendar/CalendarSelector';
import DateInput from '@/components/Calendar/DateInput';
import { isValidDate } from '@/lib/utilities/time';
import { twMerge } from 'tailwind-merge';

const PlannerRightSidebarContent = () => {
    // Display upcoming events.
    // Ordered by proximity, lower = further away. 
    // Create inputs to set date range and filter order / asc | desc
    const today = new Date();
    const nextMonth = addMonths( new Date(), 1 );
    const [ month, setMonth ] = useState( nextMonth );

    const { workspaceId } = useGlobalStore();
    const {
        plannerData, setPlannerData,
        eventsData, setEventsData,
        selectedEvent, setSelectedEvent,
        upcomingEventsData, setUpcomingEventsData,
        upcomingEventsRange, setUpcomingEventsRange,
        calendarsData, setCalendarsData,
        selectedDate, setSelectedDate,
        loading: loadingPlanner, setLoading: setLoadingPlanner,
        error: errorPlanner, setError: setErrorPlanner,
    } = usePlannerStore();

    const {
        handleToggleActive
    } = usePlanner();

    // const bookedDays = eventsData && utils.val.isValidArray( eventsData, true )
    //     ? ( eventsData?.map( ( v ) => ( { from: new Date( v?.start ), to: new Date( v?.end ) } ) ) )
    //     : ( [] );

    const bookedDays = useMemo( () => {
        return eventsData && utils.val.isValidArray( eventsData, true )
            ? ( eventsData?.map( ( v ) => (
                new Date( v?.start )
                // { from: new Date( v?.start ), to: new Date( v?.end ) }
            ) ) )
            : ( [] );
    }, [ eventsData, workspaceId ] );

    return (
        <div className={ `bg-background text-foreground w-full flex flex-col flex-grow justify-stretch items-center` }>
            <DatePicker
                usePopover={ false }
                useSelect={ true }
                onSelect={ setSelectedDate }
                selectKey={ 'date' }
                selectValue={ selectedDate }
                mode={ `single` }
                disabled={ { dayOfWeek: [ 0, 6 ] } }
                selectedDate={ isValidDate( new Date( selectedDate ) ) ? new Date( selectedDate ) : new Date( Date.now() ) }
                setSelectedDate={ setSelectedDate }
                captionLayout={ `dropdown` }
                defaultMonth={ new Date( new Date().getFullYear(), new Date().getMonth() ) }
                startMonth={ new Date( 2024, 6 ) }
                endMonth={ new Date( 2026, 12 ) }
                showOutsideDays={ true }
                numberOfMonths={ 1 }
                pagedNavigation={ true }
                reverseMonths={ true }
                events={ eventsData && utils.val.isValidArray( eventsData, true )
                    ? ( eventsData?.map( ( v ) => ( new Date( v?.start ) ) ) )
                    : ( [] ) }
                modifiers={ {
                    booked: bookedDays
                } }
                bookedDays={ bookedDays }
                modifiersClassNames={ {
                    booked: twMerge(
                        `bg-sidebar-primary-foreground text-white rounded=lg`
                    )
                } }
                month={ month }
                onMonthChange={ setMonth }
                footer={
                    <>
                        { selectedDate
                            ? ( utils.val.isObject( selectedDate )
                                && selectedDate?.hasOwnProperty( 'from' )
                                && selectedDate?.hasOwnProperty( 'to' )
                                ? `${ new Date( selectedDate?.from ) } - ${ new Date( selectedDate?.to ) }`
                                : format( selectedDate, "PPP" )
                            )
                            : <span>Pick a date</span> }
                        <div>
                            <button
                                disabled={ isSameMonth( today, month ) }
                                onClick={ () => setMonth( today ) }
                            >
                                Go to Today
                            </button>
                        </div>
                    </>
                }
            />
            {/* <DateInput
                mode={ `single` }
                date={ selectedDate ? selectedDate : new Date( Date.now() ) }
                setDate={ setSelectedDate }
            /> */}
            <SidebarSeparator className="mx-0" />

            { utils.val.isValidArray( calendarsData, true ) && (
                <CalendarSelector
                    // setCalendars={ setCalendarsData }
                    onClickItem={ ( calendar ) => { handleToggleActive( calendar ); } }
                    selectedDate={ selectedDate } setSelectedDate={ setSelectedDate }
                />
            ) }
        </div>
    );
};

export default PlannerRightSidebarContent;

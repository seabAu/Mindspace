import { Button } from "@/components/ui/button";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import { stringAsColor } from "@/lib/utilities/color";
import { getPrettyDate, getPrettyTime, utcToLocalInputValue } from "@/lib/utilities/time";
import { cn } from "@/lib/utils";
import usePlannerStore from "@/store/planner.store";
import * as utils from 'akashatools';
import { differenceInHours, differenceInMinutes, formatDate, formatISO9075, formatRelative, isSameDay, subDays } from "date-fns";
import { ClockIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

const defaultEvents = [
    { _id: 1, title: "Morning Standup", start: "09:00", end: "09:30", color: "#3b82f6" },
    { _id: 2, title: "Design Sync", start: "11:00", end: "12:30", color: "#8b5cf6" },
];

const timeToMinutes = ( time ) => {
    if ( !time || typeof time !== "string" ) return 0;
    const [ hours, minutes ] = time.split( ":" ).map( Number );
    return hours * 60 + minutes;
};

export function TimelineViewWidget ( { selectedDate, onDateChange, timeBlocks = [], config = {
    startHour: 0,
    numHours: 24,
    pixelsPerHour: 40,
} } ) {

    const {
        eventsData, setEventsData,
        getEventByDate,
    } = usePlannerStore();

    const [ date, setDate ] = useState( selectedDate );
    const getEventsOnDate =
        useCallback(
            ( items, date ) => {
                return ( utils.val.isValidArray( items, true )
                    ? ( items?.filter( ( v, i ) => {
                        if ( v && v?.hasOwnProperty( 'start' ) ) {
                            /* const diff = differenceInHours(
                                new Date( date ).getTime(),
                                new Date( v?.start ).getTime(),
                            ); */
                            const sameDay = isSameDay(
                                new Date( date ),
                                new Date( v?.start ),
                            );
                            // return ( diff <= 24 );
                            // if ( Math.abs( diff ) <= 24 ) {
                            if ( sameDay ) {
                                // console.log( "handleGetTodayTasks :: t = ", v, " :: ", "sameDay = ", sameDay );
                                return v;
                            }
                        }
                        // else { return false; }
                    } ) )
                    : ( [] ) );
            }, [ date, eventsData, selectedDate ] );

    const [ events, setEvents ] = useState( getEventByDate( selectedDate ) );

    const hours = Array.from( { length: config?.numHours }, ( _, i ) => i + config?.startHour );
    const timeBlocksToRender = timeBlocks.length > 0 ? timeBlocks : [];
    const eventsToRender = useMemo( () => {
        return (
            getEventByDate( selectedDate )
        );
    }, [ selectedDate, eventsData, date, events ] );

    useEffect( () => {
        const formattedDate = new Date( selectedDate ).toISOString().split( "T" )[ 0 ];
        setDate( formattedDate );
        let dateEvents = getEventsOnDate( eventsData, formattedDate );
        // console.log( 'Timeline :: selectedDate updated :: selectedDate = ', formattedDate, " :: ", "dateEvents = ", dateEvents );
        setEvents( dateEvents );
    }, [ selectedDate ] );


    return (
        <div
            className={ `bg-muted/40 min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 10 ) }rem`,
            } }>
            <div className="h-full relative overflow-y-auto rounded-lg border bg-background">
                <div className="relative pl-10 pr-2 py-2">
                    { hours.map( ( hour, index ) => (
                        <div key={ hour } className={ twMerge(
                            `h-${ config?.pixelsPerHour / 4 } relative border-t`,
                            index % 2 === 0 ? "bg-muted/30" : ""
                        ) }
                        >
                            <div className="absolute -left-10 top-[-9px] text-xs text-muted-foreground w-9 text-right">
                                { hour % 12 === 0 ? 12 : hour % 12 } { hour < 12 || hour === 24 ? "AM" : "PM" }
                            </div>
                            <div className="h-px w-full absolute top-1/4 border-t border-dashed border-border/70"></div>
                            <div className="h-px w-full absolute top-1/2 border-t border-dashed border-border/70"></div>
                            <div className="h-px w-full absolute top-3/4 border-t border-dashed border-border/70"></div>
                        </div>
                    ) ) }


                    { utils.val.isValidArray( timeBlocksToRender, true ) && (
                        <div className="absolute top-2 left-10 right-2 bottom-2">
                            { timeBlocksToRender.map( ( item, index ) => {
                                const startMinutes = timeToMinutes( utcToLocalInputValue( item.startTime ) );
                                const endMinutes = timeToMinutes( utcToLocalInputValue( item.endTime ) );
                                if ( startMinutes >= endMinutes ) return null;
                                const duration = endMinutes - startMinutes;
                                const timelineStartMinutes = 6 * 60;
                                const pixelsPerHour = 80;
                                const top = ( ( startMinutes - timelineStartMinutes ) / 60 ) * pixelsPerHour;
                                const height = ( duration / 60 ) * pixelsPerHour;
                                const color = item?.color ?? stringAsColor( item?._id );

                                return (
                                    <div
                                        key={ item._id || index }
                                        className="absolute w-auto p-1.5 rounded-md text-white text-xs shadow-sm"
                                        style={ {
                                            top: `${ top }px`,
                                            height: `${ height - 2 }px`,
                                            backgroundColor: `${ color }CC`, // Hex color with 80% opacity
                                            borderColor: color,
                                            borderWidth: "1px",
                                        } }
                                    >
                                        <p className="font-bold">{ item.name || item.title }</p>
                                        <p className="opacity-80">
                                            { item.startTime } - { item.endTime }
                                        </p>
                                    </div>
                                );
                            } ) }
                        </div>
                    ) }

                    { utils.val.isValidArray( events, true ) && (
                        <div className="absolute top-2 left-10 right-2 bottom-2 z-1000">
                            <div className="grid grid-flow-col">
                                { events.map( ( item, index ) => {
                                    const startLocalized = new Date( new Date( item?.start ).getTime() - new Date( item?.start ).getTimezoneOffset() * 60000 );
                                    // const start = new Date( item?.start ).toISOString().split( "T" )[ 1 ];
                                    const start = new Date( item?.start ).getTime();
                                    const endLocalized = new Date( new Date( item?.end ).getTime() - new Date( item?.end ).getTimezoneOffset() * 60000 );
                                    // const end = new Date( item?.end ).toISOString().split( "T" )[ 1 ];
                                    const end = new Date( item?.end ).getTime();
                                    const startMinutes = timeToMinutes( String( new Date( item?.start ).toLocaleTimeString() ) );
                                    const endMinutes = timeToMinutes( String( new Date( item?.end ).toLocaleTimeString() ) );
                                    const color = stringAsColor( item?._id );
                                    /* console.log(
                                        "Timeline.jsx",
                                        "\n :: ", "eventsToRender = ", eventsToRender,
                                        "\n :: ", "item = ", item,
                                        "\n :: ", "start = ", start,
                                        "\n :: ", "end = ", end,
                                        "\n :: ", "startMinutes = ", startMinutes,
                                        "\n :: ", "endMinutes = ", endMinutes,
                                        "\n :: ", "color = ", color,
                                    ); */

                                    // if ( startMinutes >= endMinutes ) return null;
                                    const duration = Math.abs( endMinutes - startMinutes );
                                    const timelineStartMinutes = 6 * 60;
                                    // const pixelsPerHour = 20;
                                    const top = ( ( startMinutes - timelineStartMinutes ) / 60 ) * config?.pixelsPerHour;
                                    const height = ( duration / 60 ) * config?.pixelsPerHour;

                                    let timeUntil = differenceInMinutes( start, new Date() );
                                    let timeUntilHrs = Math.floor( timeUntil / 60 );
                                    let timeUntilMinutes = timeUntil % 60;
                                    let dur = Math.abs( differenceInMinutes( start, end ) );
                                    let durationHrs = Math.floor( dur / 60 );
                                    let durationMinutes = dur % 60;

                                    return (
                                        <Button
                                            // variant={ `outline` }
                                            key={ item._id || index }
                                            className={ `absolute w-auto p-1 rounded-md text-white text-xs hover:bg-[${ color }88] bg-[${ color }44] opacity-60 transition-all duration-200 ease-in-out col-span-1 hover:z-[2000]` }
                                            style={ {
                                                top: `${ top }px`,
                                                left: `${ index * 20 }px`,
                                                height: `${ height - 2 }px`,
                                                backgroundColor: `${ color }44`, // Hex color with 80% opacity
                                                borderColor: `${ color }88`,
                                                boxShadow: `2px 2px 2px 1px #000000CC`,
                                                borderWidth: "1px",
                                            } }
                                        >
                                            {/* <div className={ `flex-row flex-grow h-full w-full overflow-y-auto` }>
                                                <div className={ `flex-col` }>
                                                    <p className="text-xs font-bold text-left">{ item.title }</p>
                                                    <p className="text-xs font-normal text-left">{ item.description }</p>
                                                </div>

                                                <div className={ `flex-col` }>
                                                    <p className="opacity-80">
                                                        <div className={ `text-left font-bold text-lg` }>
                                                            <p className="text-xs font-bold text-left">{ getPrettyTime( new Date( startLocalized ) ) } - { getPrettyTime( new Date( endLocalized ) ) }</p>
                                                            <p className="text-xs font-normal text-left">{ `Starts in ${ differenceInMinutes( new Date().getTime(), new Date( item?.start ).getTime() ) }m` }</p>
                                                        </div>
                                                    </p>
                                                </div>
                                            </div> */}
                                            <div key={ `item-agenda-title-${ item?._id }` } className={ `col-span-4 text-lg leading-2 flex-row flex-nowrap gap-4 items-center justify-center` }>
                                                <ClockIcon />
                                                <div className={ `flex-col text-left` }>

                                                    <div className={ `text-lg` }>{ item?.title }</div>

                                                    <div className={ `flex-row gap-4 text-sm` }>
                                                        <div key={ `item-agenda-start-time-${ item?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                            { formatDate( new Date( item?.start ), 'pp' ) }
                                                        </div>
                                                        { `-` }
                                                        <div key={ `item-agenda-start-time-${ item?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                            { formatDate( new Date( item?.end ), 'pp' ) }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            { timeUntil > 0 && ( <div className={ `flex-col text-right` }>
                                                <div key={ `item-agenda-title-${ item?._id }` } className={ `col-span-2 text-sm leading-2` }>
                                                    <div key={ `item-agenda-start-date-${ item?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                        { `${ timeUntilHrs }H, ${ timeUntilMinutes }m from now` }
                                                    </div>
                                                </div>
                                                <div key={ `item-agenda-title-${ item?._id }` } className={ `col-span-2 text-sm leading-2` }>
                                                    <div key={ `item-agenda-start-time-${ item?._id }` } className={ `col-span-1 text-sm leading-2` }>
                                                        { `${ durationHrs }H, ${ durationMinutes }m long` }
                                                    </div>
                                                </div>
                                            </div> ) }
                                        </Button>
                                    );
                                } ) }
                            </div>
                        </div>
                    ) }


                </div>
            </div>
        </div>
    );
}

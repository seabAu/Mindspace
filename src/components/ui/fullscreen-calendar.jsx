
import * as React from "react";
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    startOfToday,
    startOfWeek,
} from "date-fns";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusCircleIcon,
    SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as utils from 'akashatools';
// import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar";

const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
];

export const Heading = ( { date, changeMonth, resetDate } ) => (
    <nav className="calendar--nav">
        <a onClick={ () => changeMonth( date.month() - 1 ) }>&#8249;</a>
        <h1 onClick={ () => resetDate() }>{ date.format( 'MMMM' ) } <small>{ date.format( 'YYYY' ) }</small></h1>
        <a onClick={ () => changeMonth( date.month() + 1 ) }>&#8250;</a>
    </nav>
);

export const Day = ( { currentDate, date, startDate, endDate, onClick } ) => {
    let className = [];

    if ( moment().isSame( date, 'day' ) ) {
        className.push( 'active' );
    }

    if ( date.isSame( startDate, 'day' ) ) {
        className.push( 'start' );
    }

    if ( date.isBetween( startDate, endDate, 'day' ) ) {
        className.push( 'between' );
    }

    if ( date.isSame( endDate, 'day' ) ) {
        className.push( 'end' );
    }

    if ( !date.isSame( currentDate, 'month' ) ) {
        className.push( 'muted' );
    }

    return (
        <span onClick={ () => onClick( date ) } currentDate={ date } className={ className.join( ' ' ) }>{ date.date() }</span>
    );
};

export const Days = ( { date, startDate, endDate, onClick } ) => {
    const thisDate = moment( date );
    const daysInMonth = moment( date ).daysInMonth();
    const firstDayDate = moment( date ).startOf( 'month' );
    const previousMonth = moment( date ).subtract( 1, 'month' );
    const previousMonthDays = previousMonth.daysInMonth();
    const nextsMonth = moment( date ).add( 1, 'month' );
    let days = [];
    let labels = [];

    for ( let i = 1; i <= 7; i++ ) {
        labels.push( <span className="label">{ moment().day( i ).format( 'ddd' ) }</span> );
    }

    for ( let i = firstDayDate.day(); i > 1; i-- ) {
        previousMonth.date( previousMonthDays - i + 2 );

        days.push(
            <Day key={ moment( previousMonth ).format( 'DD MM YYYY' ) } onClick={ ( date ) => onClick( date ) } currentDate={ date } date={ moment( previousMonth ) } startDate={ startDate } endDate={ endDate } />
        );
    }

    for ( let i = 1; i <= daysInMonth; i++ ) {
        thisDate.date( i );

        days.push(
            <Day key={ moment( thisDate ).format( 'DD MM YYYY' ) } onClick={ ( date ) => onClick( date ) } currentDate={ date } date={ moment( thisDate ) } startDate={ startDate } endDate={ endDate } />
        );
    }

    const daysCount = days.length;
    for ( let i = 1; i <= ( 42 - daysCount ); i++ ) {
        nextsMonth.date( i );
        days.push(
            <Day key={ moment( nextsMonth ).format( 'DD MM YYYY' ) } onClick={ ( date ) => onClick( date ) } currentDate={ date } date={ moment( nextsMonth ) } startDate={ startDate } endDate={ endDate } />
        );
    }

    return (
        <nav className="calendar--days">
            { labels.concat() }
            { days.concat() }
        </nav>
    );
};

export function FullScreenCalendar ( { data } ) {
    const today = startOfToday();
    const [ selectedDay, setSelectedDay ] = React.useState( today );
    const [ currentMonth, setCurrentMonth ] = React.useState(
        format( today, "MMM-yyyy" ),
    );
    const firstDayCurrentMonth = parse( currentMonth, "MMM-yyyy", new Date() );
    const isDesktop = useMediaQuery( "(min-width: 768px)" );

    const days = eachDayOfInterval( {
        start: startOfWeek( firstDayCurrentMonth ),
        end: endOfWeek( endOfMonth( firstDayCurrentMonth ) ),
    } );

    function previousMonth () {
        const firstDayNextMonth = add( firstDayCurrentMonth, { months: -1 } );
        setCurrentMonth( format( firstDayNextMonth, "MMM-yyyy" ) );
    }

    function nextMonth () {
        const firstDayNextMonth = add( firstDayCurrentMonth, { months: 1 } );
        setCurrentMonth( format( firstDayNextMonth, "MMM-yyyy" ) );
    }

    function goToToday () {
        setCurrentMonth( format( today, "MMM-yyyy" ) );
    }

    return (
        <div className="flex flex-1 flex-col">
            {/* Calendar Header */ }
            <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
                <div className="flex flex-auto">
                    <div className="flex items-center gap-4">
                        <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
                            <h1 className="p-1 text-xs uppercase text-muted-foreground">
                                { format( today, "MMM" ) }
                            </h1>
                            <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                                <span>{ format( today, "d" ) }</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-foreground">
                                { format( firstDayCurrentMonth, "MMMM, yyyy" ) }
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                { format( firstDayCurrentMonth, "MMM d, yyyy" ) } -{ " " }
                                { format( endOfMonth( firstDayCurrentMonth ), "MMM d, yyyy" ) }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <Button variant="outline" size="icon" className="hidden lg:flex">
                        <SearchIcon size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                    </Button>

                    <Separator orientation="vertical" className="hidden h-6 lg:block" />

                    <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
                        <Button
                            onClick={ previousMonth }
                            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
                            variant="outline"
                            size="icon"
                            aria-label="Navigate to previous month"
                        >
                            <ChevronLeftIcon size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                        </Button>
                        <Button
                            onClick={ goToToday }
                            className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
                            variant="outline"
                        >
                            Today
                        </Button>
                        <Button
                            onClick={ nextMonth }
                            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
                            variant="outline"
                            size="icon"
                            aria-label="Navigate to next month"
                        >
                            <ChevronRightIcon size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="hidden h-6 md:block" />
                    <Separator
                        orientation="horizontal"
                        className="block w-full md:hidden"
                    />

                    <Button className="w-full gap-2 md:w-auto">
                        <PlusCircleIcon size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                        <span>New Event</span>
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */ }
            <div className="lg:flex lg:flex-auto lg:flex-col">
                {/* Week Days Header */ }
                <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
                    <div className="border-r py-2.5">Sun</div>
                    <div className="border-r py-2.5">Mon</div>
                    <div className="border-r py-2.5">Tue</div>
                    <div className="border-r py-2.5">Wed</div>
                    <div className="border-r py-2.5">Thu</div>
                    <div className="border-r py-2.5">Fri</div>
                    <div className="py-2.5">Sat</div>
                </div>

                {/* Calendar Days */ }
                <div className="flex text-xs leading-6 lg:flex-auto">
                    <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
                        { days.map( ( day, dayIdx ) =>
                            !isDesktop ? (
                                <button
                                    onClick={ () => setSelectedDay( day ) }
                                    key={ dayIdx }
                                    type="button"
                                    className={ cn(
                                        isEqual( day, selectedDay ) && "text-primary-foreground",
                                        !isEqual( day, selectedDay ) &&
                                        !isToday( day ) &&
                                        isSameMonth( day, firstDayCurrentMonth ) &&
                                        "text-foreground",
                                        !isEqual( day, selectedDay ) &&
                                        !isToday( day ) &&
                                        !isSameMonth( day, firstDayCurrentMonth ) &&
                                        "text-muted-foreground",
                                        ( isEqual( day, selectedDay ) || isToday( day ) ) &&
                                        "font-semibold",
                                        "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                                    ) }
                                >
                                    <time
                                        dateTime={ format( day, "yyyy-MM-dd" ) }
                                        className={ cn(
                                            "ml-auto flex size-6 items-center justify-center rounded-full",
                                            isEqual( day, selectedDay ) &&
                                            isToday( day ) &&
                                            "bg-primary text-primary-foreground",
                                            isEqual( day, selectedDay ) &&
                                            !isToday( day ) &&
                                            "bg-primary text-primary-foreground",
                                        ) }
                                    >
                                        { format( day, "d" ) }
                                    </time>
                                    { data.filter( ( date ) => isSameDay( date.day, day ) ).length >
                                        0 && (
                                            <div>
                                                { data
                                                    .filter( ( date ) => isSameDay( date.day, day ) )
                                                    .map( ( date ) => (
                                                        <div
                                                            key={ date.day.toString() }
                                                            className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                                                        >
                                                            { date.events.map( ( event ) => (
                                                                <span
                                                                    key={ event.id }
                                                                    className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                                                />
                                                            ) ) }
                                                        </div>
                                                    ) ) }
                                            </div>
                                        ) }
                                </button>
                            ) : (
                                <div
                                    key={ dayIdx }
                                    onClick={ () => setSelectedDay( day ) }
                                    className={ cn(
                                        dayIdx === 0 && colStartClasses[ getDay( day ) ],
                                        !isEqual( day, selectedDay ) &&
                                        !isToday( day ) &&
                                        !isSameMonth( day, firstDayCurrentMonth ) &&
                                        "bg-accent/50 text-muted-foreground",
                                        "relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
                                        !isEqual( day, selectedDay ) && "hover:bg-accent/75",
                                    ) }
                                >
                                    <header className="flex items-center justify-between p-2.5">
                                        <button
                                            type="button"
                                            className={ cn(
                                                isEqual( day, selectedDay ) && "text-primary-foreground",
                                                !isEqual( day, selectedDay ) &&
                                                !isToday( day ) &&
                                                isSameMonth( day, firstDayCurrentMonth ) &&
                                                "text-foreground",
                                                !isEqual( day, selectedDay ) &&
                                                !isToday( day ) &&
                                                !isSameMonth( day, firstDayCurrentMonth ) &&
                                                "text-muted-foreground",
                                                isEqual( day, selectedDay ) &&
                                                isToday( day ) &&
                                                "border-none bg-primary",
                                                isEqual( day, selectedDay ) &&
                                                !isToday( day ) &&
                                                "bg-foreground",
                                                ( isEqual( day, selectedDay ) || isToday( day ) ) &&
                                                "font-semibold",
                                                "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                                            ) }
                                        >
                                            <time dateTime={ format( day, "yyyy-MM-dd" ) }>
                                                { format( day, "d" ) }
                                            </time>
                                        </button>
                                    </header>
                                    <div className="flex-1 p-2.5">
                                        { data
                                            .filter( ( event ) => isSameDay( event.day, day ) )
                                            .map( ( day ) => (
                                                <div key={ day.day.toString() } className="space-y-1.5">
                                                    { day.events.slice( 0, 1 ).map( ( event ) => (
                                                        <div
                                                            key={ event.id }
                                                            className="flex flex-col items-start gap-1 rounded-lg border bg-muted/50 p-2 text-xs leading-tight"
                                                        >
                                                            <p className="font-medium leading-none">
                                                                { event.name }
                                                            </p>
                                                            <p className="leading-none text-muted-foreground">
                                                                { event.time }
                                                            </p>
                                                        </div>
                                                    ) ) }
                                                    { day.events.length > 1 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            + { day.events.length - 1 } more
                                                        </div>
                                                    ) }
                                                </div>
                                            ) ) }
                                    </div>
                                </div>
                            ),
                        ) }
                    </div>

                    <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
                        { days.map( ( day, dayIdx ) => (
                            <button
                                onClick={ () => setSelectedDay( day ) }
                                key={ dayIdx }
                                type="button"
                                className={ cn(
                                    isEqual( day, selectedDay ) && "text-primary-foreground",
                                    !isEqual( day, selectedDay ) &&
                                    !isToday( day ) &&
                                    isSameMonth( day, firstDayCurrentMonth ) &&
                                    "text-foreground",
                                    !isEqual( day, selectedDay ) &&
                                    !isToday( day ) &&
                                    !isSameMonth( day, firstDayCurrentMonth ) &&
                                    "text-muted-foreground",
                                    ( isEqual( day, selectedDay ) || isToday( day ) ) &&
                                    "font-semibold",
                                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                                ) }
                            >
                                <time
                                    dateTime={ format( day, "yyyy-MM-dd" ) }
                                    className={ cn(
                                        "ml-auto flex size-6 items-center justify-center rounded-full",
                                        isEqual( day, selectedDay ) &&
                                        isToday( day ) &&
                                        "bg-primary text-primary-foreground",
                                        isEqual( day, selectedDay ) &&
                                        !isToday( day ) &&
                                        "bg-primary text-primary-foreground",
                                    ) }
                                >
                                    { format( day, "d" ) }
                                </time>
                                { data.filter( ( date ) => isSameDay( date.day, day ) ).length > 0 && (
                                    <div>
                                        { data
                                            .filter( ( date ) => isSameDay( date.day, day ) )
                                            .map( ( date ) => (
                                                <div
                                                    key={ date.day.toString() }
                                                    className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                                                >
                                                    { date.events.map( ( event ) => (
                                                        <span
                                                            key={ event.id }
                                                            className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                                        />
                                                    ) ) }
                                                </div>
                                            ) ) }
                                    </div>
                                ) }
                            </button>
                        ) ) }
                    </div>
                </div>
            </div>
        </div>
    );
}


const dummyEvents = [ {
    day: new Date( "2025-01-02" ),
    events: [
        { id: 1, name: "Q1 Planning Session", time: "10:00 AM", datetime: "2025-01-02T00:00", },
        { id: 2, name: "Team Sync", time: "2:00 PM", datetime: "2025-01-02T00:00", },
    ],
}, {
    day: new Date( "2025-01-07" ),
    events: [
        { id: 3, name: "Product Launch Review", time: "2:00 PM", datetime: "2025-01-07T00:00", },
        { id: 4, name: "Marketing Sync", time: "11:00 AM", datetime: "2025-01-07T00:00", },
        { id: 5, name: "Vendor Meeting", time: "4:30 PM", datetime: "2025-01-07T00:00", },
    ],
}, {
    day: new Date( "2025-01-10" ),
    events: [
        { id: 6, name: "Team Building Workshop", time: "11:00 AM", datetime: "2025-01-10T00:00", },
    ],
}, {
    day: new Date( "2025-01-13" ),
    events: [
        { id: 7, name: "Budget Analysis Meeting", time: "3:30 PM", datetime: "2025-01-14T00:00", },
        { id: 8, name: "Sprint Planning", time: "9:00 AM", datetime: "2025-01-14T00:00", },
        { id: 9, name: "Design Review", time: "1:00 PM", datetime: "2025-01-14T00:00", },
    ],
}, {
    day: new Date( "2025-01-16" ),
    events: [
        { id: 10, name: "Client Presentation", time: "10:00 AM", datetime: "2025-01-16T00:00", },
        { id: 11, name: "Team Lunch", time: "12:30 PM", datetime: "2025-01-16T00:00", },
        { id: 12, name: "Project Status Update", time: "2:00 PM", datetime: "2025-01-16T00:00", },
    ],
} ];

export function FullScreenCalendarRender ( { events } ) {
    return (
        <div className="flex h-screen flex-1 flex-col scale-90">
            { utils.val.isValidArray( events, true ) && ( <FullScreenCalendar data={ events } /> ) }
        </div>
    );
}


/* 'use strict';

  class Calendar extends React.Component {
      constructor ( props ) {
          super( props );

          this.state = {
              date: moment(),
              startDate: moment().subtract( 5, 'day' ),
              endDate: moment().add( 3, 'day' )
          };
      }

      function resetDate () {
          this.setState( {
              date: moment()
          } );
      }

      function changeMonth ( month ) {
          const { date } = this.state;

          date.month( month );

          this.setState(
              date
          );
      }

      function changeDate ( date ) {
          let { startDate, endDate } = this.state;

          if ( startDate === null || date.isBefore( startDate, 'day' ) || !startDate.isSame( endDate, 'day' ) ) {
              startDate = moment( date );
              endDate = moment( date );
          } else if ( date.isSame( startDate, 'day' ) && date.isSame( endDate, 'day' ) ) {
              startDate = null;
              endDate = null;
          } else if ( date.isAfter( startDate, 'day' ) ) {
              endDate = moment( date );
          }

          this.setState( {
              startDate,
              endDate
          } );
      }

      render () {
          const { date, startDate, endDate } = this.state;

          return (
              <div className="calendar">
                  <Heading date={ date } changeMonth={ ( month ) => this.changeMonth( month ) } resetDate={ () => this.resetDate() } />

                  <Days onClick={ ( date ) => this.changeDate( date ) } date={ date } startDate={ startDate } endDate={ endDate } />
              </div>
          );
      }
  }

  ReactDOM.render(
      <Calendar />,
      document.getElementById( 'calendar' )
  );

*/
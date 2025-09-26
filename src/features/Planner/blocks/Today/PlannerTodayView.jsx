import React, {
    useEffect,
    useState,
} from 'react';
import * as utils from 'akashatools';
import { isSameDay } from '@/lib/utilities/time';
import { PolarGanttContainer } from '@/features/Planner/components/PolarGantt/PolarGantt';
import usePlanner from '@/lib/hooks/usePlanner';

const TodayView = ( props ) => {
    // TODO :: This will show any todo's due today (or soon, if a range was configured), any events today or soon, any goals set, any reflections set to the future, and any reminders set that will trigger today. 
    const {
        title,
        // eventsData,
        // setEventsData,
        className = '',
        mode = 'single',
        children,
    } = props;

    const {
        eventsData, setEventsData
    } = usePlanner();

    const [ date, setDate ] = useState( new Date() );
    const [ time, setTime ] = useState( new Date() );

    useEffect( () => {
        let timerInterval = 1000;
        let locale = 'en';
        var timer = setInterval( () => {
            let d = new Date();
            const time = d.toLocaleTimeString( locale, {
                hour: 'numeric',
                hour12: true,
                minute: 'numeric',
                second: 'numeric',
            } );
            setDate( d );
            setTime( time );
        }, timerInterval );

        return function cleanup () {
            clearInterval( timer );
        };
    }, [] );

    const agendaData = [
        {
            start: '2023-05-20T03:00:00Z',
            end: '2023-05-20T09:00:00Z',
            label: 'Task 1',
            category: 'work',
        },
        {
            start: '2023-05-20T09:00:00Z',
            end: '2023-05-20T14:00:00Z',
            label: 'Task 2',
            category: 'personal',
        },
        {
            start: '2023-05-20T11:00:00Z',
            end: '2023-05-20T14:00:00Z',
            label: 'Task 3',
            category: 'work',
        },
        {
            start: '2023-05-20T12:00:00Z',
            end: '2023-05-20T18:00:00Z',
            label: 'Task 4',
            category: 'leisure',
        },
        {
            start: '2023-05-20T16:40:00Z',
            end: '2023-05-20T21:00:00Z',
            label: 'Task 5',
            category: 'personal',
        },
    ];

    return (
        <div
            className={ `plannerpage-today-container w-full h-full flex flex-col overflow-hidden` }>
            {/* 
                <Clock.Day
                    date={ date }
                    setDate={ setDate }
                    time={ time }
                    setTime={ setTime }
                    blocks={ [] }
                    options={ [] }
                /> */}
            <h1>Polar Gantt Chart</h1>
            <PolarGanttContainer
                classNames={ className }
                eventsData={ [
                    ...( eventsData
                        ? eventsData.filter( ( d, index ) =>
                            isSameDay(
                                new Date().toLocaleDateString(),
                                d?.start,
                            ),
                        )
                        : // {
                        //     var t = new Date();
                        //     if ( d?.start && d?.start.toDateString() == t.toDateString() ) { return true; }
                        //     return false;
                        // } )
                        [] ),
                    ...agendaData,
                ] }
                setEventsData={ setEventsData }
            />
        </div>
    );
};

export default TodayView;
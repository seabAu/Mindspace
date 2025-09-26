import React, { useEffect, useState, Suspense } from 'react';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useDate } from '../../lib/hooks/useTime';
import { Button } from '../ui/button';
import { twMerge } from 'tailwind-merge';

export const DateTime = ( props ) => {
    // const {
    //     day,
    //     hour,
    //     date,
    //     currDate,
    //     time,
    //     greeting,
    // } = useDate( {
    //     timerInterval,
    //     timerOn,
    //     locale
    // } );

    const {
        timerOn = true,
        useMilitaryTime = false,
        timerInterval = 1000,
        locale = 'en',
        returnValueOnly = false,
        iconHeight = 0.8,
        iconWidth = 0.8,
        className,
    } = props;

    const DateStringFormat = {
        // month: 'short',
        // weekday: 'long',
        // day: 'numeric',
        year: '2-digit',
        month: '2-digit',
        // weekday: 'short',
        day: '2-digit',
    };

    const TimeStringFormat = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    const [ date, setDate ] = useState( new Date() );
    const [ time, setTime ] = useState( new Date() );
    const [ hours, setHours ] = useState( new Date().getHours() );
    const [ minutes, setMinutes ] = useState( new Date().getMinutes() );
    const [ seconds, setSeconds ] = useState( new Date().getSeconds() );
    useEffect( () => {
        var timer = setInterval( () => {
            let d = new Date();
            const time = d.toLocaleTimeString( locale, {
                hour: 'numeric',
                hour12: true,
                minute: 'numeric',
                second: 'numeric'
            } );
            setDate( d );
            setTime( time );
            setHours( d.getHours() );
            setMinutes( d.getMinutes() );
            setSeconds( d.getSeconds() );
        }, timerInterval );

        return function cleanup () {
            clearInterval( timer );
        };
    }, [] );

    if ( returnValueOnly ) {
        return date.toLocaleTimeString( locale, {
            // month: 'short',
            // weekday: 'long',
            // day: 'numeric',
            year: '2-digit',
            month: '2-digit',
            weekday: 'short',
            day: '2-digit',
            hour: 'numeric',
            hour12: true,
            minute: 'numeric',
            second: 'numeric'
        } );
    }

    else {
        return (
            <Button
                className={ twMerge( `!h-[${ iconHeight.toString() }rem] !w-[${ iconWidth.toString() }] } aspect-square px-2 w-auto outline-transparent self-end h-full max-h-full overflow-hidden justify-center items-center !m-0 aspect-auto border`, className ) }
                variant={ `outline` }
                size={ `sm` }
            >
                <div className={ `flex flex-col max-w-30 m-0 gap-0 p-0 leading-tight` }>
                    <div className={ `text-primaryAlt-500 p-0 font-extrabold text-[--datetimeFontSize] text-xs` }>
                        { date.toLocaleTimeString( locale, DateStringFormat )?.split( ',' )[ 0 ] }
                    </div>
                    <div className={ `text-[--datetimeFontSize] text-[0.95rem] text-primaryAlt-500 p-0 font-extrabold ` }>
                        {/* { date.toLocaleTimeString( locale, TimeStringFormat ) } */ }
                        <div className='flex items-center gap-0.5 font-mono'>
                            <SlidingNumber value={ Math.floor( hours / ( useMilitaryTime ? 1 : 2 ) ) } padStart={ true } />
                            <span className='text-zinc-500'>:</span>
                            <SlidingNumber value={ minutes } padStart={ true } />
                            <span className='text-zinc-500'>:</span>
                            <SlidingNumber value={ seconds } padStart={ true } />
                        </div>
                    </div>
                </div>

            </Button>
        );
    }


};

export function DateTimeDisplay () {

    useEffect( () => {
        const interval = setInterval( () => {
            setHours( new Date().getHours() );
            setMinutes( new Date().getMinutes() );
            setSeconds( new Date().getSeconds() );
        }, 1000 );
        return () => clearInterval( interval );
    }, [] );

    return (
        <div className='flex items-center gap-0.5 font-mono'>
            <SlidingNumber value={ hours } padStart={ true } />
            <span className='text-zinc-500'>:</span>
            <SlidingNumber value={ minutes } padStart={ true } />
            <span className='text-zinc-500'>:</span>
            <SlidingNumber value={ seconds } padStart={ true } />
        </div>
    );
}

DateTime.Display = DateTimeDisplay;

export default DateTime;

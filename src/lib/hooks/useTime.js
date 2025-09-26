import { useEffect, useState } from "react";

export const useDate = (props) => {
    const {
        timerInterval = 1000,
        timerOn = true,
        locale = 'en',
    } = props;

    const [ date, setDate ] = useState( new Date() ); // Save the current date to be able to trigger an update

    useEffect( () => {
        const timer = setInterval( () => { // Creates an interval which will update the current data every minute
            // This will trigger a rerender every component that uses the useDate hook.
            setDate( new Date() );
        }, 60 * 1000 );
        return () => {
            clearInterval( timer ); // Return a funtion to clear the timer so that it will stop being called on unmount
        };
    }, [] );

    const day = date.toLocaleDateString( locale, { weekday: 'long' } );
    const currDate = `${ day }, ${ date.getDate() } ${ date.toLocaleDateString( locale, { month: 'long' } ) }\n\n`;

    const time = date.toLocaleTimeString( locale, { hour: 'numeric', hour12: true, minute: 'numeric', second: 'numeric' } );
    const hour = date.getHours();
    const greeting = `Good ${ ( hour < 12 && 'Morning' ) || ( hour < 17 && 'Afternoon' ) || 'Evening' }, `;


    return {
        day,
        hour,
        date,
        currDate,
        time,
        greeting,
    };
};
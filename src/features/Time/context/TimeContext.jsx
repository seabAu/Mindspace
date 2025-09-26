
import { createContext, useContext, useEffect, useState } from "react";

const TimeContext = createContext( undefined );

export function TimeProvider ( { children } ) {
    const [ now, setNow ] = useState( new Date() );

    useEffect( () => {
        const interval = setInterval( () => {
            setNow( new Date() );
        }, 1000 );

        return () => clearInterval( interval );
    }, [] );

    return <TimeContext.Provider value={ { now } }>{ children }</TimeContext.Provider>;
}

export function useTime () {
    const context = useContext( TimeContext );
    if ( context === undefined ) {
        throw new Error( "useTime must be used within a TimeProvider" );
    }
    return context;
}


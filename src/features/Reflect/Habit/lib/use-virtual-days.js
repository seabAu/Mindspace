
import { addDays, differenceInCalendarDays, isBefore, isAfter, startOfDay } from "date-fns";
import { useMemo, useRef, useState } from "react";

// Manages a virtualized day window (start date + day count) and ensures a target date is included.
export function useVirtualDays ( options = {} ) {
    const { initialDate = new Date(), initialDays = 28, batchSize = 14 } = options;

    const [ startDate, setStartDate ] = useState( startOfDay( addDays( initialDate, -Math.floor( initialDays / 2 ) ) ) );
    const [ daysCount, setDaysCount ] = useState( initialDays );

    const pendingScrollDateRef = useRef( null );

    const days = useMemo( () => {
        return Array.from( { length: daysCount }, ( _, i ) => addDays( startDate, i ) );
    }, [ startDate, daysCount ] );

    // Extend window to the left (past)
    const extendLeft = ( by = batchSize ) => {
        setStartDate( ( prev ) => addDays( prev, -by ) );
        setDaysCount( ( prev ) => prev + by );
    };

    // Extend window to the right (future)
    const extendRight = ( by = batchSize ) => {
        setDaysCount( ( prev ) => prev + by );
    };

    // Ensure a specific date is included in the current window; extend as needed.
    const ensureDateInRange = ( date ) => {
        const day = startOfDay( date );
        const endDate = addDays( startDate, daysCount - 1 );

        if ( isBefore( day, startDate ) ) {
            // extend left by enough batches
            const needed = Math.abs( differenceInCalendarDays( day, startDate ) );
            const batches = Math.ceil( needed / batchSize );
            setStartDate( ( prev ) => addDays( prev, -batches * batchSize ) );
            setDaysCount( ( prev ) => prev + batches * batchSize );
        } else if ( isAfter( day, endDate ) ) {
            // extend right by enough batches
            const needed = differenceInCalendarDays( day, endDate );
            const batches = Math.ceil( needed / batchSize );
            setDaysCount( ( prev ) => prev + batches * batchSize );
        }

        // Mark this date to scroll into view after state updates.
        pendingScrollDateRef.current = day;
    };

    const consumePendingScrollDate = () => {
        const d = pendingScrollDateRef.current;
        pendingScrollDateRef.current = null;
        return d;
    };

    return {
        days,
        startDate,
        daysCount,
        extendLeft,
        extendRight,
        ensureDateInRange,
        consumePendingScrollDate,
    };
}

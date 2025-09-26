"use client";

import { useMemo, memo } from "react";
import { VirtualizedGrid } from "./VirtualizedGrid";
import { getDayOfYear, getWeekOfYear, getDaysInMonth, isLeapYear, getDateForGridCell } from "../utilities/date-utils";
import { formatDateForTooltip, getOrdinalSuffix } from "../utilities/time-units";

const MAX_ITEMS = 128;
/**
 * Creates tooltip content for a grid cell
 * @param {number} index - Cell index
 * @param {number} total - Total number of cells
 * @param {boolean} isPast - Whether the cell is in the past
 * @param {boolean} isCurrent - Whether the cell is current
 * @param {boolean} isFuture - Whether the cell is in the future
 * @param {string} secondUnit - The second time unit
 * @param {string} firstUnit - The first time unit
 * @param {Date|null} cellDate - The date for this cell
 * @returns {React.ReactNode}
 */
const createTooltipContent = ( index, total, isPast, isCurrent, isFuture, secondUnit, firstUnit, cellDate ) => (
    <div className="items-center justify-center relative space-y-1 text-sm">
        <div className="font-semibold">
            { getOrdinalSuffix( index + 1 ) } { secondUnit.slice( 0, -1 ) }
            { firstUnit !== "Life" && cellDate ? ` (${ formatDateForTooltip( cellDate ) })` : "" }
        </div>
        <div>
            { isPast ? "Past" : isCurrent ? "Current" : "Future" } { secondUnit.slice( 0, -1 ).toLowerCase() }
        </div>
        <div>
            { total - index - 1 } { secondUnit.toLowerCase() } remaining
        </div>
    </div>
);

/**
 * @param {Object} props
 * @param {string} props.firstUnit
 * @param {string} props.secondUnit
 * @param {Date} props.currentDate
 * @param {number} props.age
 */
function TimeGridDisplayComponent ( { firstUnit, secondUnit, currentDate, age } ) {
    // Memoize the entire grid data calculation
    const gridData = useMemo(
        () => calculateGridData( firstUnit, secondUnit, currentDate, age ),
        [ firstUnit, secondUnit, currentDate, age ],
    );

    return (
        <div>
            <VirtualizedGrid items={ gridData.gridItems } columns={ gridData.columns } />

            { gridData.total > ( MAX_ITEMS || 100 ) && (
                <div className="text-sm text-gray-500 text-center mt-2">
                    Showing { gridData.total } { secondUnit.toLowerCase() }
                </div>
            ) }
        </div>
    );
}

/**
 * Calculate grid data based on time units - optimized for performance
 * @param {string} firstUnit
 * @param {string} secondUnit
 * @param {Date} currentDate
 * @param {number} age
 * @returns {Object}
 */
function calculateGridData ( firstUnit, secondUnit, currentDate, age ) {
    // Default values
    let total = 0;
    let current = 0;
    let columns = 10; // Default column count

    const now = new Date( currentDate );

    // Calculate based on the combination
    if ( firstUnit === "Hour" && secondUnit === "Minutes" ) {
        total = 60;
        current = now.getMinutes();
        columns = 10;
    } else if ( firstUnit === "Hour" && secondUnit === "Seconds" ) {
        total = 3600;
        current = now.getMinutes() * 60 + now.getSeconds();
        columns = 60;
    } else if ( firstUnit === "Day" && secondUnit === "Hours" ) {
        total = 24;
        current = now.getHours();
        columns = 8;
    } else if ( firstUnit === "Day" && secondUnit === "Minutes" ) {
        total = 24 * 60;
        current = now.getHours() * 60 + now.getMinutes();
        columns = 60;
    } else if ( firstUnit === "Week" && secondUnit === "Days" ) {
        total = 7;
        current = now.getDay();
        columns = 7;
    } else if ( firstUnit === "Week" && secondUnit === "Hours" ) {
        total = 7 * 24;
        current = now.getDay() * 24 + now.getHours();
        columns = 24;
    } else if ( firstUnit === "Month" && secondUnit === "Hours" ) {
        const daysInMonth = getDaysInMonth( now );
        total = daysInMonth * ( now.getDay() * 24 + now.getHours() );
        current = now.getDate() - 1;
        columns = 7;
    } else if ( firstUnit === "Month" && secondUnit === "Days" ) {
        const daysInMonth = getDaysInMonth( now );
        total = daysInMonth;
        current = now.getDate() - 1;
        columns = 7;
    } else if ( firstUnit === "Month" && secondUnit === "Weeks" ) {
        const daysInMonth = getDaysInMonth( now );
        total = Math.ceil( daysInMonth / 7 );
        current = Math.floor( ( now.getDate() - 1 ) / 7 );
        columns = Math.min( total, 4 );
    } else if ( firstUnit === "Year" && secondUnit === "Days" ) {
        const isLeapYearValue = isLeapYear( now.getFullYear() );
        total = isLeapYearValue ? 366 : 365;
        current = getDayOfYear( now );
        columns = 31;
    } else if ( firstUnit === "Year" && secondUnit === "Weeks" ) {
        total = 52;
        current = getWeekOfYear( now );
        columns = 13;
    } else if ( firstUnit === "Year" && secondUnit === "Months" ) {
        total = 12;
        current = now.getMonth();
        columns = 6;
    } else if ( firstUnit === "Decade" && secondUnit === "Years" ) {
        const decadeStart = Math.floor( now.getFullYear() / 10 ) * 10;
        total = 10;
        current = now.getFullYear() - decadeStart;
        columns = 5;
    } else if ( firstUnit === "Decade" && secondUnit === "Months" ) {
        total = 120;
        const decadeStart = Math.floor( now.getFullYear() / 10 ) * 10;
        const yearsPassed = now.getFullYear() - decadeStart;
        current = yearsPassed * 12 + now.getMonth();
        columns = 12;
    } else if ( firstUnit === "Decade" && secondUnit === "Weeks" ) {
        total = 500;
        const decadeStart = Math.floor( now.getFullYear() / 10 ) * 10;
        const yearsPassed = now.getFullYear() - decadeStart;
        current = yearsPassed * 52 + now.getMonth() / 4;
        columns = 12;
    } else if ( firstUnit === "Life" && secondUnit === "Years" ) {
        const lifeExpectancy = 80;
        total = lifeExpectancy;
        current = age;
        columns = 10;
    } else if ( firstUnit === "Life" && secondUnit === "Months" ) {
        const lifeExpectancy = 80 * 12;
        total = lifeExpectancy;
        current = age * 12 + now.getMonth();
        columns = 24;
    } else if ( firstUnit === "Life" && secondUnit === "Weeks" ) {
        const lifeExpectancy = 80 * 52;
        total = lifeExpectancy;
        current = age * 52 + getWeekOfYear( now );
        columns = 52;
    } else if ( firstUnit === "Life" && secondUnit === "Days" ) {
        const lifeExpectancy = 80 * 365;
        total = lifeExpectancy;
        current = age * 365 + getDayOfYear( now );
        columns = 52;
    }

    // Ensure we have reasonable defaults if the combination isn't handled
    if ( total === 0 ) {
        total = 12;
        current = 0;
        columns = 4;
    }

    // For large grids, limit the number of items to improve performance
    if ( total > 10000 ) {
        total = 10000;
        columns = Math.min( columns, 100 );
    }

    // Generate grid items with tooltip content - optimized to reduce object creation
    const gridItems = Array.from( { length: total }, ( _, i ) => {
        const isPast = i < current;
        const isCurrent = i === current;
        const isFuture = i > current;

        // Only calculate date for visible cells or when needed
        let cellDate = null;
        if ( i === current || ( i % 10 === 0 && i < current + 100 ) ) {
            try {
                cellDate = getDateForGridCell( currentDate, firstUnit, secondUnit, i );
            } catch ( e ) {
                // Fallback for complex cases
                cellDate = new Date( currentDate );
            }
        }

        // Create tooltip content
        const tooltipContent = createTooltipContent( i, total, isPast, isCurrent, isFuture, secondUnit, firstUnit, cellDate );

        return {
            id: i,
            isPast,
            isCurrent,
            isFuture,
            tooltipContent,
        };
    } );

    return { total, current, columns, gridItems };
}

// Memoize the component to prevent unnecessary re-renders
const TimeGridDisplay = memo( TimeGridDisplayComponent );
export default TimeGridDisplay;


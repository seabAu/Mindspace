import { format, isDate } from 'date-fns';

/**
 * Counts the number of entries per day in the data store
 * @param {Array} items - The data items
 * @returns {Object} - Object with dates as keys and counts as values
 */
export function countEntriesByDay ( items ) {
    const entriesByDay = {};

    if ( !items || !Array.isArray( items ) ) return entriesByDay;

    items.forEach( ( item ) => {
        if ( item && item.timeStamp ) {
            try {
                const date = new Date( item.timeStamp );

                // Check if date is valid
                if ( !isNaN( date.getTime() ) ) {
                    const dateKey = format( date, 'yyyy-MM-dd' );
                    entriesByDay[ dateKey ] = ( entriesByDay[ dateKey ] || 0 ) + 1;
                }
            } catch ( error ) {
                console.error( 'Invalid date in item:', item.timeStamp );
            }
        }
    } );

    return entriesByDay;
}

/**
 * Calculates a color on a gradient from light blue to light red based on count
 * @param {number} count - The count value
 * @param {number} minCount - The minimum count value
 * @param {number} maxCount - The maximum count value
 * @returns {string} - CSS color string
 */
export function getColorForCount ( count, minCount, maxCount ) {
    // Prevent division by zero
    if ( minCount === maxCount || maxCount <= minCount )
        return 'rgba(59, 130, 246, 0.3)'; // Default light blue

    // Normalize count between 0 and 1
    const normalizedCount = Math.max(
        0,
        Math.min( 1, ( count - minCount ) / ( maxCount - minCount ) ),
    );

    // Light blue (low) to light red (high)
    const r = Math.round( 59 + normalizedCount * ( 239 - 59 ) );
    const g = Math.round( 130 - normalizedCount * 62 );
    const b = Math.round( 246 - normalizedCount * 179 );

    return `rgba(${ r }, ${ g }, ${ b }, 0.3)`;
}

/**
 * Filters items by date
 * @param {Array} items - The data items
 * @param {Date} date - The date to filter by
 * @param {Date} endDate - Optional end date for range filtering
 * @returns {Array} - Filtered items
 */
export function filterItemsByDate ( items, date, endDate = null, debug = false ) {
    if ( debug === true )
        console.log(
            "dataUtils.js for stats section",
            " :: ", "filterItemsByDate",
            " :: ", "items = ", items,
            " :: ", "date = ", date,
            " :: ", "endDate = ", endDate,
        );
    let selectedDateTime = new Date( date );
    if (
        !items
        || !Array.isArray( items )
        || !selectedDateTime
        || !( selectedDateTime instanceof Date )
        || isNaN( selectedDateTime.getTime() )
    ) {
        return items || [];
    }

    const startOfDay = new Date( date );
    startOfDay.setHours( 0, 0, 0, 0 );

    let endOfDay;
    if ( endDate && new Date( endDate ) instanceof Date && !isNaN( endDate.getTime() ) ) {
        endOfDay = new Date( endDate );
        endOfDay.setHours( 23, 59, 59, 999 );
    } else {
        endOfDay = new Date( date );
        endOfDay.setHours( 23, 59, 59, 999 );
    }

    return items.filter( ( item ) => {
        if ( !item || !item?.timeStamp ) return false;
        const itemDate = new Date( item.timeStamp );
        // console.log(
        //   "dataUtils.js for stats section",
        //   "\n :: ", "items.filterByDate",
        //   "\n :: ", "item = ", item,
        //   "\n :: ", "item.timeStamp = ", new Date( item.timeStamp ),
        //   "\n :: ", "startOfDay = ", startOfDay,
        //   "\n :: ", "endOfDay = ", endOfDay,
        //   "\n :: ", "item is on selected date: ", itemDate >= startOfDay && itemDate <= endOfDay
        // );
        try {
            return (
                // !isNaN( itemDate ) &&
                itemDate >= startOfDay &&
                itemDate <= endOfDay
            );
        } catch ( error ) {
            return false;
        }
    } );
}

/**
 * Filters items by search term
 * @param {Array} items - The data items
 * @param {string} searchTerm - The search term
 * @returns {Array} - Filtered items
 */
export function filterItemsBySearchTerm ( items, searchTerm ) {
    if ( !items || !Array.isArray( items ) || !searchTerm ) return items || [];

    const term = searchTerm.toLowerCase();
    return items.filter(
        ( item ) =>
            item.dataKey?.toLowerCase().includes( term ) ||
            String( item.dataValue ).toLowerCase().includes( term ) ||
            ( item._metadata && item._metadata.toLowerCase().includes( term ) ),
    );
}

/**
 * Filters items by data type
 * @param {Array} items - The data items
 * @param {string} filterType - The data type to filter by
 * @returns {Array} - Filtered items
 */
export function filterItemsByType ( items, filterType ) {
    if ( !items || !Array.isArray( items ) || !filterType || filterType === 'all' )
        return items || [];

    return items.filter( ( item ) => item.dataType === filterType );
}


export function filterItemsByKey ( items, filterKey ) {
    if ( !items || !Array.isArray( items ) || !filterKey || filterKey === 'all' ) {
        return items || [];
    }

    return items.filter( ( item ) => item.dataKey === filterKey );
}

// Memoization cache for filterItems
const filterCache = new Map();
const CACHE_SIZE_LIMIT = 100;

/**
 * Combines multiple filters with caching for performance
 * @param {Array} items - The data items
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered items
 */
export function filterItems (
    items,
    {
        searchTerm = '',
        filterType = 'all',
        filterKey = 'all',
        selectedDate = null,
        selectedEndDate = null,
    } = {},
    debug = false,
) {
    if ( debug === true )
        console.log(
            "dataUtils.js for stats section",
            "\n :: ", "filterItems",
            "\n :: ", "items = ", items,
            "\n :: ", "searchTerm = ", searchTerm,
            "\n :: ", "filterType = ", filterType,
            "\n :: ", "selectedDate = ", selectedDate,
            "\n :: ", "selectedEndDate = ", selectedEndDate
        );

    if ( !isDate( selectedDate ) ) {
        // Check if selectedDate is a range instead of a date. 
        if ( selectedDate?.hasOwnProperty( 'to' ) ) {
            selectedEndDate = new Date( selectedDate?.from );
        }
        if ( selectedDate?.hasOwnProperty( 'from' ) ) {
            selectedDate = new Date( selectedDate?.to );
        }
    }

    if ( !items || !Array.isArray( items ) ) return [];
    // if ( !selectedDate || !selectedEndDate ) return [];

    // Create a cache key based on the filter parameters and items length
    const cacheKey = `${ searchTerm }|${ filterType }|${ filterKey }|${ new Date( selectedDate )?.toISOString() || 'null'
        }|${ new Date( selectedEndDate )?.toISOString() || 'null' }|${ items.length }`;

    // Check if we have a cached result
    if ( filterCache.has( cacheKey ) ) {
        return filterCache.get( cacheKey );
    }

    let result = [ ...items ];

    if ( selectedDate ) {
        result = filterItemsByDate( result, selectedDate, selectedEndDate );
    }

    if ( searchTerm ) {
        result = filterItemsBySearchTerm( result, searchTerm );
    }

    if ( filterType && filterType !== 'all' ) {
        result = filterItemsByType( result, filterType );
    }

    if ( filterKey && filterKey !== 'all' ) {
        result = filterItemsByKey( result, filterKey );
    }

    console.log( "dataUtils :: filterItems :: results = ", result );


    // Store the result in cache
    if ( filterCache.size >= CACHE_SIZE_LIMIT ) {
        // Remove the oldest entry if we've reached the limit
        const oldestKey = filterCache.keys().next().value;
        filterCache.delete( oldestKey );
    }

    filterCache.set( cacheKey, result );
    return result;
}

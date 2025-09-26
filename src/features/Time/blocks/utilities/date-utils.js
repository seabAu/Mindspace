// Cache for expensive calculations
const cache = {
    dayOfYear: new Map(),
    weekOfYear: new Map(),
    daysInMonth: new Map(),
    leapYear: new Map(),
    startOfTimeUnit: new Map(),
    dateForGridCell: new Map(),
};

/**
 * Calculate age from birthdate
 * @param {Date|string|number} birthdate
 * @returns {number}
 */
export function calculateAge ( birthdate ) {
    const today = new Date();
    const birthDate = new Date( birthdate );
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if ( m < 0 || ( m === 0 && today.getDate() < birthDate.getDate() ) ) {
        age--;
    }

    return age;
}

/**
 * Get day of year (0-indexed) with caching
 * @param {Date} date
 * @returns {number}
 */
export function getDayOfYear ( date ) {
    const key = date.toISOString().split( "T" )[ 0 ];

    if ( cache.dayOfYear.has( key ) ) {
        return cache.dayOfYear.get( key );
    }

    const start = new Date( date.getFullYear(), 0, 0 );
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const result = Math.floor( diff / oneDay ) - 1;

    cache.dayOfYear.set( key, result );
    return result;
}

/**
 * Get week of year (0-indexed) with caching
 * @param {Date} date
 * @returns {number}
 */
export function getWeekOfYear ( date ) {
    const key = date.toISOString().split( "T" )[ 0 ];

    if ( cache.weekOfYear.has( key ) ) {
        return cache.weekOfYear.get( key );
    }

    const start = new Date( date.getFullYear(), 0, 1 );
    const diff = date.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const result = Math.floor( diff / oneWeek );

    cache.weekOfYear.set( key, result );
    return result;
}

/**
 * Get days in month with caching
 * @param {Date} date
 * @returns {number}
 */
export function getDaysInMonth ( date ) {
    const key = `${ date.getFullYear() }-${ date.getMonth() }`;

    if ( cache.daysInMonth.has( key ) ) {
        return cache.daysInMonth.get( key );
    }

    const result = new Date( date.getFullYear(), date.getMonth() + 1, 0 ).getDate();

    cache.daysInMonth.set( key, result );
    return result;
}

/**
 * Check if year is leap year with caching
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear ( year ) {
    if ( cache.leapYear.has( year ) ) {
        return cache.leapYear.get( year );
    }

    const result = new Date( year, 1, 29 ).getMonth() === 1;

    cache.leapYear.set( year, result );
    return result;
}

/**
 * Get start of a time unit with caching
 * @param {Date} date
 * @param {string} unit
 * @returns {Date}
 */
export function getStartOfTimeUnit ( date, unit ) {
    const key = `${ date.toISOString() }-${ unit }`;

    if ( cache.startOfTimeUnit.has( key ) ) {
        return new Date( cache.startOfTimeUnit.get( key ) );
    }

    const result = new Date( date );

    switch ( unit.toLowerCase() ) {
        case "second":
            result.setMilliseconds( 0 );
            break;
        case "minute":
            result.setSeconds( 0, 0 );
            break;
        case "hour":
            result.setMinutes( 0, 0, 0 );
            break;
        case "day":
            result.setHours( 0, 0, 0, 0 );
            break;
        case "week":
            const day = result.getDay();
            result.setDate( result.getDate() - day );
            result.setHours( 0, 0, 0, 0 );
            break;
        case "month":
            result.setDate( 1 );
            result.setHours( 0, 0, 0, 0 );
            break;
        case "year":
            result.setMonth( 0, 1 );
            result.setHours( 0, 0, 0, 0 );
            break;
        case "decade":
            const year = result.getFullYear();
            const decadeStart = Math.floor( year / 10 ) * 10;
            result.setFullYear( decadeStart, 0, 1 );
            result.setHours( 0, 0, 0, 0 );
            break;
    }

    cache.startOfTimeUnit.set( key, result.getTime() );
    return result;
}

/**
 * Add a time unit to a date  result.getTime());
  return result;
}

/**
 * Add a time unit to a date
 * @param {Date} date
 * @param {number} amount
 * @param {string} unit
 * @returns {Date}
 */
export function addTimeUnit ( date, amount, unit ) {
    const result = new Date( date );

    switch ( unit.toLowerCase() ) {
        case "second":
            result.setSeconds( result.getSeconds() + amount );
            break;
        case "minute":
            result.setMinutes( result.getMinutes() + amount );
            break;
        case "hour":
            result.setHours( result.getHours() + amount );
            break;
        case "day":
            result.setDate( result.getDate() + amount );
            break;
        case "week":
            result.setDate( result.getDate() + amount * 7 );
            break;
        case "month":
            result.setMonth( result.getMonth() + amount );
            break;
        case "year":
            result.setFullYear( result.getFullYear() + amount );
            break;
        case "decade":
            result.setFullYear( result.getFullYear() + amount * 10 );
            break;
    }

    return result;
}

/**
 * Get date for a specific grid cell with caching
 * @param {Date} currentDate
 * @param {string} firstUnit
 * @param {string} secondUnit
 * @param {number} index
 * @returns {Date}
 */
export function getDateForGridCell ( currentDate, firstUnit, secondUnit, index ) {
    const key = `${ currentDate.toISOString() }-${ firstUnit }-${ secondUnit }-${ index }`;

    if ( cache.dateForGridCell.has( key ) ) {
        return new Date( cache.dateForGridCell.get( key ) );
    }

    // Remove 's' from the end of secondUnit to get singular form
    const secondUnitSingular = secondUnit.replace( /s$/, "" );

    // Get start of the first unit
    const startDate = getStartOfTimeUnit( currentDate, firstUnit.toLowerCase() );

    // Add the appropriate number of second units
    const result = addTimeUnit( startDate, index, secondUnitSingular.toLowerCase() );

    cache.dateForGridCell.set( key, result.getTime() );
    return result;
}

// Clear caches periodically to prevent memory leaks
setInterval( () => {
    cache.dayOfYear.clear();
    cache.weekOfYear.clear();
    cache.daysInMonth.clear();
    cache.startOfTimeUnit.clear();
    cache.dateForGridCell.clear();
    // Keep leapYear cache as it's small and doesn't change
}, 60000 ); // Clear every minute


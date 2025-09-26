// Define all available time units and their relationships
export const TIME_UNITS = {
    second: {
        id: "second",
        singular: "Second",
        plural: "Seconds",
        milliseconds: 1000,
        parent: "minute",
        children: [],
    },
    minute: {
        id: "minute",
        singular: "Minute",
        plural: "Minutes",
        milliseconds: 60 * 1000,
        parent: "hour",
        children: [ "second" ],
    },
    hour: {
        id: "hour",
        singular: "Hour",
        plural: "Hours",
        milliseconds: 60 * 60 * 1000,
        parent: "day",
        children: [ "minute", "second" ],
    },
    day: {
        id: "day",
        singular: "Day",
        plural: "Days",
        milliseconds: 24 * 60 * 60 * 1000,
        parent: "week",
        children: [ "hour", "minute", "second" ],
    },
    week: {
        id: "week",
        singular: "Week",
        plural: "Weeks",
        milliseconds: 7 * 24 * 60 * 60 * 1000,
        parent: "month",
        children: [ "day", "hour", "minute", "second" ],
    },
    month: {
        id: "month",
        singular: "Month",
        plural: "Months",
        milliseconds: 30 * 24 * 60 * 60 * 1000, // Approximation
        parent: "year",
        children: [ "week", "day", "hour", "minute", "second" ],
    },
    year: {
        id: "year",
        singular: "Year",
        plural: "Years",
        milliseconds: 365 * 24 * 60 * 60 * 1000, // Approximation
        parent: "decade",
        children: [ "month", "week", "day", "hour", "minute", "second" ],
    },
    decade: {
        id: "decade",
        singular: "Decade",
        plural: "Decades",
        milliseconds: 10 * 365 * 24 * 60 * 60 * 1000, // Approximation
        parent: "life",
        children: [ "year", "month", "week", "day", "hour", "minute", "second" ],
    },
    life: {
        id: "life",
        singular: "Life",
        plural: "Lives",
        milliseconds: 80 * 365 * 24 * 60 * 60 * 1000, // Standard 80-year lifespan
        parent: undefined,
        children: [ "decade", "year", "month", "week", "day", "hour", "minute", "second" ],
    },
};

/**
 * Get all available first units (containers)
 * @returns {string[]}
 */
export function getFirstUnitOptions () {
    return Object.values( TIME_UNITS ).map( ( unit ) => unit.singular );
}

/**
 * Get all available second units (contents)
 * @returns {string[]}
 */
export function getSecondUnitOptions () {
    return Object.values( TIME_UNITS ).map( ( unit ) => unit.plural );
}

/**
 * Find a unit by its singular or plural form
 * @param {string} name
 * @returns {Object|undefined}
 */
export function findUnitByName ( name ) {
    return Object.values( TIME_UNITS ).find( ( unit ) => unit.singular === name || unit.plural === name );
}

/**
 * Check if a combination is valid (first unit is larger than second unit)
 * @param {string} firstUnit
 * @param {string} secondUnit
 * @returns {boolean}
 */
export function isValidCombination ( firstUnit, secondUnit ) {
    const first = findUnitByName( firstUnit );
    const second = findUnitByName( secondUnit.replace( /s$/, "" ) );

    if ( !first || !second ) return false;

    // Check if second unit is a child of first unit
    return first.children?.includes( second.id ) || false;
}

/**
 * Find the nearest valid combination
 * @param {string} firstUnit
 * @param {string} secondUnit
 * @returns {[string, string]}
 */
export function findNearestValidCombination ( firstUnit, secondUnit ) {
    const first = findUnitByName( firstUnit );
    const second = findUnitByName( secondUnit.replace( /s$/, "" ) );

    if ( !first || !second ) {
        return [ "Year", "Months" ]; // Default fallback
    }

    // If valid, return as is
    if ( isValidCombination( firstUnit, secondUnit ) ) {
        return [ firstUnit, secondUnit ];
    }

    // If first unit is smaller than second unit, swap them
    if ( first.milliseconds < second.milliseconds ) {
        return [ second.singular, first.plural ];
    }

    // Find the largest child of first unit
    if ( first.children && first.children.length > 0 ) {
        const largestChild = first.children[ 0 ];
        return [ firstUnit, TIME_UNITS[ largestChild ].plural ];
    }

    // Fallback
    return [ "Year", "Months" ];
}

/**
 * Format a date for tooltip display
 * @param {Date} date
 * @returns {string}
 */
export function formatDateForTooltip ( date ) {
    return new Intl.DateTimeFormat( "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    } ).format( date );
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * @param {number} n
 * @returns {string}
 */
export function getOrdinalSuffix ( n ) {
    const s = [ "th", "st", "nd", "rd" ];
    const v = n % 100;
    return n + ( s[ ( v - 20 ) % 10 ] || s[ v ] || s[ 0 ] );
}


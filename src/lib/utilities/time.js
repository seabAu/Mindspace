// Time related functions

import moment from "moment";
import * as utils from 'akashatools';
import {
    differenceInSeconds,
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    differenceInMonths,
    differenceInYears,
    addYears,
    addMonths,
    isDate,
} from "date-fns";


// All valid timezones, courtesy of https://gist.github.com/timfee/35ab20dffacc8fe5be73407e1bf59328
// import timezones from './timezones.json';

// Helper function to get days in month
export function getDaysInMonth ( date ) {
    return new Date( date.getFullYear(), date.getMonth() + 1, 0 ).getDate();
}

export const isPastDue = ( dueDate ) => {
    const now = new Date();
    const tempDueDate = new Date( dueDate );
    return tempDueDate < now;
};

export function formatTimeDifference ( endDate, type, now ) {
    const [ start, end ] = type === "till" ? [ now, endDate ] : [ endDate, now ];

    const totalSeconds = Math.max( 0, differenceInSeconds( end, start ) );
    const years = differenceInYears( end, start );
    const months = differenceInMonths( end, addYears( start, years ) );
    const days = differenceInDays( end, addMonths( addYears( start, years ), months ) );
    const hours = differenceInHours( end, addMonths( addYears( start, years ), months ) ) % 24;
    const minutes = differenceInMinutes( end, addMonths( addYears( start, years ), months ) ) % 60;
    const seconds = totalSeconds % 60;

    return {
        total: totalSeconds * 1000,
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
    };
}

export function getPrettyDate ( date ) {
    if ( date === "Invalid Date" ) return new Date();
    // Check if date is valid. 
    if ( !isDate( date ) || !isDate( new Date( date ) ) ) return null;

    // console.log( "time.js :: getPrettyDate :: date = ", date );
    // Check if it's a range, ie { from: (date), to: (date) }
    if ( utils.val.isObject( date )
        && date?.hasOwnProperty( 'from' )
        && date?.hasOwnProperty( 'to' )
    ) {
        return {
            from: new Date( date?.from ).toISOString().split( "T" )[ 0 ],
            to: new Date( date?.to ).toISOString().split( "T" )[ 0 ]
        };
    }

    return new Date( date )?.toISOString().split( "T" )[ 0 ];
}

export function getPrettyTime ( date, useMilitaryTime = false, cutEnd = true ) {
    if ( date === "Invalid Date" ) return new Date();
    if ( useMilitaryTime ) {
        return new Date( date ).toISOString().split( "T" )[ 1 ].split( "." )[ 0 ];
    }
    else {
        let hours = date.getHours();
        let minutes = date.getMinutes();

        // Check whether AM or PM
        let newformat = hours >= 12 ? "PM" : "AM";

        // Find current hour in AM-PM Format
        hours = hours % 12;

        // To display "0" as "12"
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        return ( hours + ":" + minutes + " " + newformat );
    }
}

export function getPrettyDateTime ( date, useMilitaryTime = false, separator = 'at' ) {
    return (
        date && isDate( date )
            ? ( `${ getPrettyDate( new Date( date ) ) } ${ separator } ${ getPrettyTime( new Date( date ) ) }` )
            : ( `${ getPrettyDate( new Date( Date.now() ) ) } ${ separator } ${ getPrettyTime( new Date( Date.now() ) ) }` )
    );
}

export function prettyDateTime ( date_string ) {
    return moment( date_string ).format( 'MMM DD YYYY, h:mm a' );
}


export function isValidDate ( date ) {
    return date && Object.prototype.toString.call( date ) === "[object Date]" && !isNaN( date );
}

export function _getFormattedTime ( time ) {
    const date = new Date( time );
    const h = date.getHours();
    const m = date.getMinutes();

    return `${ h }:${ m }`;
}

export function daysBetween ( startDate, endDate ) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return ( treatAsUTC( endDate ) - treatAsUTC( startDate ) ) / millisecondsPerDay;
}

export function formatDate ( d ) {
    const date = new Date( d );
    var year = date.getFullYear().toString();
    var month = ( date.getMonth() + 101 ).toString().substring( 1 );
    var day = ( date.getDate() + 100 ).toString().substring( 1 );
    return year + '-' + month + '-' + day;
}

export const formatDateTime = ( iso, includeSeconds = false ) => {
    if ( iso && isValidDate( iso ) ) {
        const isoString = new Date( iso ).toISOString();
        let val = isoString.substring( 0, isoString.indexOf( 'T' ) + ( includeSeconds ? 9 : 6 ) );
        return val;
    }
    else {
        return formatDateTime( new Date( Date.now() ) );
    }
    // return iso;
};

Date.prototype.now = function () {
    let now = new Date( Date.now() );
    return now;
};

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = ( this.getMonth() + 1 ).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();

    return (
        yyyy +
        '-' +
        ( mm[ 1 ] ? mm : '0' + mm[ 0 ] ) +
        '-' +
        ( dd[ 1 ] ? dd : '0' + dd[ 0 ] )
    );
};

export function formatDateYYYYMMDD ( date ) {
    var d = new Date( date ),
        month = '' + ( d.getMonth() + 1 ),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if ( month.length < 2 ) month = '0' + month;
    if ( day.length < 2 ) day = '0' + day;
    return [ year, month, day ].join( '-' );
}

export function dateFormatYYYYMMDD ( date ) {
    if ( !( date instanceof Date ) ) {
        date = new Date( date );
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${ year }-${ month }-${ day }`;
}

export function minutesToHHMM ( minutes ) {
    const hours = Math.floor( minutes / 60 );
    const mins = Math.abs( minutes % 60 );
    return ( hours < 0 ? '-' : '+' ) + ( Math.abs( hours ) + '' ).padStart( 2, '0' ) + ':' + ( mins + '' ).padStart( 2, '0' );
}
// Function to calculate time zone offset
export function getTZOffset ( strTimeZone ) {
    //get current datetime in UTC
    var dateUTC = new Date();
    dateUTC.setUTCMilliseconds( 0 );
    dateUTC.setSeconds( 0 );

    //convert UTC datetime to particular timezone
    const optionsLocal = {
        timeZone: strTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    };
    var arrTZDate = dateUTC.toLocaleDateString( 'en-CA', optionsLocal ).split( "," );
    var arrDate = arrTZDate[ 0 ].split( "/" ).map( x => Number( x ) );
    var arrTime = arrTZDate[ 1 ].split( ":" ).map( x => Number( x ) );
    var dateTZ = new Date( arrDate[ 2 ], arrDate[ 0 ] - 1, arrDate[ 1 ], arrTime[ 0 ], arrTime[ 1 ], 0, 0 );

    //calculate the time difference & return in hour offset
    var tzDiff = dateTZ.getTime() - dateUTC.getTime();
    return tzDiff / ( 60 * 60 * 1000 );
}

export function formatDateTimezone (
    date,
    localeString = 'en-US',
    timeZone = 'America/New_York',
) {
    let tz = Intl.supportedValuesOf( 'timeZone' );
    if ( date && tz.includes( timeZone ) ) {
        const offset = getTimezoneOffset( timeZone );

        return date
            .toLocaleString( localeString, { timeZone: timeZone } )
            .split( ',' )[ 0 ];
    }
}

export const timezonesWithoffsets = () => {
    return Intl.supportedValuesOf( 'timeZone' ).map( ( timeZone ) => {
        const offset = new Intl.DateTimeFormat( 'en', { timeZone: timeZone, timeZoneName: 'shortOffset' } ).formatToParts().find( part => part.type === 'timeZoneName' ).value;
        const timeZoneAbbrivation = new Intl.DateTimeFormat( 'en', { timeZone: timeZone, timeZoneName: 'long' } ).formatToParts().find( part => part.type === 'timeZoneName' ).value;
        return `${ timeZone } - ${ timeZoneAbbrivation }(${ offset })`;
    } );
};

export function getTimezoneAbbreviation ( timeZone ) {
    return getFormattedTimezoneElement( timeZone, 'timeZoneName', 'short' );
}

export function getTimezoneOffset ( timeZone ) {
    return getFormattedTimezoneElement( timeZone, 'timeZoneName', 'longOffset' );
}

export function getFormattedTimezoneElement ( timeZone, name, value ) {
    return ( new Intl.DateTimeFormat( 'en', {
        [ name ]: value,
        timeZone
    } ).formatToParts().find( el => el.type === name ) || {} ).value;
}
/**
 * Parses a GMT offset string (e.g., "GMT-7", "GMT+5:30") into a total minute value.
 * @param {string} gmtString - The GMT offset string from Intl.DateTimeFormat.
 * @returns {number} The total offset in minutes (e.g., -420, 330).
 */
function parseGmtOffsetToMinutes ( gmtString ) {
    if ( !gmtString || !gmtString.startsWith( "GMT" ) ) {
        return 0;
    }
    if ( gmtString === "GMT" ) {
        return 0;
    }

    const cleaned = gmtString.replace( "GMT", "" ); // -> "-7", "+5:30"
    const sign = cleaned.startsWith( "-" ) ? -1 : 1;
    const parts = cleaned.substring( 1 ).split( ":" );

    const hours = Number.parseInt( parts[ 0 ], 10 ) || 0;
    const minutes = Number.parseInt( parts[ 1 ], 10 ) || 0;

    return ( hours * 60 + minutes ) * sign;
}

let cachedTimezones = null;

/**
 * Generates a list of all supported IANA timezones, sorted numerically by their UTC offset.
 * The result is cached after the first call for performance.
 * @returns {Array<{value: string, label: string, offset: string, numericOffset: number}>}
 */
export function getSortedTimezones () {
    if ( cachedTimezones ) {
        return cachedTimezones;
    }

    const timezones = Intl.supportedValuesOf( "timeZone" )
        .map( ( timeZone ) => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat( "en", {
                timeZone,
                timeZoneName: "longOffset", // "longOffset" is more reliable, e.g., GMT-07:00
            } );

            const parts = formatter.formatToParts( now );
            const offsetPart = parts.find( ( part ) => part.type === "timeZoneName" );
            const offsetString = offsetPart ? offsetPart.value : "GMT";

            // Get the long name for a more descriptive label
            const longNameFormatter = new Intl.DateTimeFormat( "en", {
                timeZone,
                timeZoneName: "long",
            } );
            const longNamePart = longNameFormatter.formatToParts( now ).find( ( part ) => part.type === "timeZoneName" );
            const longName = longNamePart ? longNamePart.value : "";

            const numericOffset = parseGmtOffsetToMinutes( offsetString );

            return {
                value: timeZone,
                label: `(${ offsetString }) ${ timeZone.replace( /_/g, " " ) }`,
                longLabel: `(${ offsetString }) ${ timeZone.replace( /_/g, " " ) } - ${ longName }`,
                offset: offsetString,
                numericOffset,
            };
        } );

    console.log( "time.js :: before sort ::  timezones = ", timezones );
    // Sort the array based on the numeric offset
    timezones.sort( ( a, b ) => {
        if ( a.numericOffset !== b.numericOffset ) {
            return a.numericOffset - b.numericOffset;
        }
        // If offsets are the same, sort alphabetically by name
        return a.value.localeCompare( b.value );
    } );

    console.log( "time.js :: after sort ::  timezones = ", timezones );
    cachedTimezones = timezones;
    return cachedTimezones;
}

export const LocalToCSTTime = ( newUtcDate, timezone ) => {
    const time = new Date( newUtcDate ).getTime();
    const offset = new Date( newUtcDate ).getTimezoneOffset() * 60000;

    console.log( "reminderFormDialog :: TriggerDatesInput :: LocalToCSTTime :: timezone = ", timezone, " :: ", "time = ", time, " :: ", "offset = ", offset );

    return new Date( time + offset );
};


/**
 * Converts a UTC ISO string or Date object to a local datetime string
 * suitable for the `value` of an <input type="datetime-local">.
 * @param {string | Date | null | undefined} utcDateInput - The UTC date (e.g., "2023-10-27T17:00:00.000Z").
 * @returns {string} A string in "YYYY-MM-DDTHH:mm" format representing the local time.
 */
export function utcToLocalInputValue ( utcDateInput ) {
    if ( !utcDateInput ) return "";
    const date = new Date( utcDateInput );
    if ( isNaN( date.getTime() ) ) return "";

    // getTimezoneOffset returns the difference in minutes between UTC and the host's local time.
    // It's positive if the local timezone is behind UTC (e.g., Americas) and negative if ahead (e.g., Asia).
    // We create a new Date object adjusted by this offset to correctly represent the local time.
    const localDate = new Date( date.getTime() - date.getTimezoneOffset() * 60000 );

    // Convert the adjusted date to an ISO string and slice it to the "YYYY-MM-DDTHH:mm" format.
    return localDate.toISOString().slice( 0, 16 );
}

/**
 * Converts a local datetime string from an <input type="datetime-local">
 * back to a full UTC ISO string for storage.
 * @param {string} localDateTimeString - The local datetime string from the input (e.g., "2023-10-27T12:00").
 * @returns {string | null} A UTC ISO string (e.g., "2023-10-27T17:00:00.000Z"), or null if input is invalid.
 */
export function localInputToUTCISO ( localDateTimeString ) {
    if ( !localDateTimeString ) return null;

    // When new Date() is passed a local datetime string, it's parsed as being in the local timezone.
    const date = new Date( localDateTimeString );
    if ( isNaN( date.getTime() ) ) return null;

    // .toISOString() correctly converts this local time to its UTC equivalent.
    return date.toISOString();
}



/**
 * Converts a UTC ISO string to a local datetime string for a specific timezone.
 * @param {string | Date | null} utcDateInput - The UTC date.
 * @param {string} timezone - The IANA timezone string (e.g., "America/New_York").
 * @returns {string} A string in "YYYY-MM-DDTHH:mm" format.
 */
export function utcToLocalInputValueTZ ( utcDateInput, timezone ) {
    if ( !utcDateInput ) return "";
    const date = new Date( utcDateInput );
    if ( isNaN( date.getTime() ) ) return "";

    try {
        const formatter = new Intl.DateTimeFormat( "en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23", // Use 24-hour format 00-23
        } );

        const parts = formatter.formatToParts( date );
        const partsMap = parts.reduce( ( acc, part ) => {
            acc[ part.type ] = part.value;
            return acc;
        }, {} );

        return `${ partsMap.year }-${ partsMap.month }-${ partsMap.day }T${ partsMap.hour }:${ partsMap.minute }`;
    } catch ( e ) {
        console.error( `Invalid timezone: ${ timezone }. Falling back to browser local time.` );
        const localDate = new Date( date.getTime() - date.getTimezoneOffset() * 60000 );
        return localDate.toISOString().slice( 0, 16 );
    }
}

/**
 * Converts a local datetime string (interpreted in a specific timezone) back to a UTC ISO string.
 * @param {string} localDateTimeString - The local datetime string from the input.
 * @param {string} timezone - The IANA timezone to interpret the string in.
 * @returns {string | null} A UTC ISO string.
 */
export function localInputToUTCISOTZ ( localDateTimeString, timezone ) {
    if ( !localDateTimeString ) return null;

    try {
        const [ datePart, timePart ] = localDateTimeString.split( "T" );
        if ( !datePart || !timePart ) return null;
        const [ year, month, day ] = datePart.split( "-" ).map( Number );
        const [ hour, minute ] = timePart.split( ":" ).map( Number );
        if ( [ year, month, day, hour, minute ].some( isNaN ) ) return null;

        // Create a timestamp assuming the input was UTC. This is our baseline.
        const assumedUtcTimestamp = Date.UTC( year, month - 1, day, hour, minute );

        // Find out what time `assumedUtcTimestamp` is in the target timezone.
        const formatter = new Intl.DateTimeFormat( "en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hourCycle: "h23",
        } );
        const parts = formatter.formatToParts( assumedUtcTimestamp ).reduce( ( acc, p ) => ( { ...acc, [ p.type ]: p.value } ), {} );

        // Calculate the difference between the user's input time and the formatted time.
        // This difference represents the timezone offset for that specific date and time.
        const dateInTz = Date.UTC(
            Number.parseInt( parts.year ),
            Number.parseInt( parts.month ) - 1,
            Number.parseInt( parts.day ),
            Number.parseInt( parts.hour ),
            Number.parseInt( parts.minute ),
        );
        const offset = assumedUtcTimestamp - dateInTz;

        // Apply the offset to the assumed UTC time to get the actual UTC time.
        const actualUtcTimestamp = assumedUtcTimestamp + offset;

        return new Date( actualUtcTimestamp ).toISOString();
    } catch ( e ) {
        console.error( `Error converting local time with timezone ${ timezone }:`, e );
        return new Date( localDateTimeString ).toISOString(); // Fallback
    }
}


export const humanFriendlyDateStr = ( iso8601 ) => {
    // Examples (using Node.js):

    // Get an ISO8601 date string using Date()
    // > new Date()
    // 2022-04-08T22:05:18.595Z

    // If it was earlier today, just show the time:
    // > humanFriendlyDateStr('2022-04-08T22:05:18.595Z')
    // '3:05 PM'

    // If it was during the past week, add the day:
    // > humanFriendlyDateStr('2022-04-07T22:05:18.595Z')
    // 'Thu 3:05 PM'

    // If it was more than a week ago, add the date
    // > humanFriendlyDateStr('2022-03-07T22:05:18.595Z')
    // '3/7, 2:05 PM'

    // If it was more than a year ago add the year
    // > humanFriendlyDateStr('2021-03-07T22:05:18.595Z')
    // '3/7/2021, 2:05 PM'

    // If it's sometime in the future return the full date+time:
    // > humanFriendlyDateStr('2023-03-07T22:05:18.595Z')
    // '3/7/2023, 2:05 PM'

    const datetime = new Date( Date.parse( iso8601 ) );
    const now = new Date();
    const ageInDays = ( now - datetime ) / 86400000;
    let str;

    // more than 1 year old?
    if ( ageInDays > 365 ) {
        str = datetime.toLocaleDateString( [], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        } );
        // more than 1 week old?
    } else if ( ageInDays > 7 ) {
        str = datetime.toLocaleDateString( [], {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        } );
        // more than 1 day old?
    } else if ( ageInDays > 1 ) {
        str = datetime.toLocaleDateString( [], {
            weekday: 'short',
            hour: 'numeric',
            minute: 'numeric',
        } );
        // some time today?
    } else if ( ageInDays > 0 ) {
        str = datetime.toLocaleTimeString( [], {
            timeStyle: 'short',
        } );
        // in the future?
    } else {
        str = datetime.toLocaleDateString( [], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        } );
    }
    return str;
};

/* Two methods can be used.

.toISOString(); - Fixed to GMT+0. Includes time, which should be removed later.
.toLocaleDateString('en-CA'); - Timezone can be specified. Defaults to system.
Note that en-CA is a locale, not a timezone. Canada uses the YYYY-MM-DD format.

In the following example, the system timezone is set to PDT (GMT-7)

const date = new Date('2023-04-08 GMT+09:00');
// Sat Apr 08 2023 00:00:00 GMT+0900 (한국 표준시)
// Fri Apr 07 2023 08:00:00 GMT-0700 (Pacific Daylight Time)

// Based on GMT+0 or UTC - time is substringed.
date.toISOString(); // '2023-04-07T15:00:00.000Z'
date.toISOString().substring(0, 10); // '2023-04-07'

// Based on GMT-7 - local timezone of the system
date.toLocaleDateString('en-CA'); // '2023-04-07'

// Based on GMT+9 - Asia/Seoul is GMT+9
date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // '2023-04-08'
// */


export function getDate ( dayString ) {
    const today = new Date();
    const year = today.getFullYear().toString();
    let month = ( today.getMonth() + 1 ).toString();

    if ( month.length === 1 ) {
        month = '0' + month;
    }

    return dayString.replace( 'YEAR', year ).replace( 'MONTH', month );
}

export function convert ( date ) {
    const d = Date.parse( date );
    const date_obj = new Date( d );
    return `${ date_obj.getFullYear() }-${ date_obj.toLocaleString( 'default', {
        month: '2-digit',
    } ) }-${ date_obj.toLocaleString( 'default', { day: '2-digit' } ) }`;
}

export const YYYY_MM_DD_Formatter = ( date, format = 'YYYY-MM-DD' ) => {
    const t = new Date( date );
    const y = t.getFullYear();
    const m = ( '0' + ( t.getMonth() + 1 ) ).slice( -2 );
    const d = ( '0' + t.getDate() ).slice( -2 );
    return format.replace( 'YYYY', y ).replace( 'MM', m ).replace( 'DD', d );
};

export function sameDay ( d1, d2 ) {
    return (
        d1.getUTCFullYear() == d2.getUTCFullYear() &&
        d1.getUTCMonth() == d2.getUTCMonth() &&
        d1.getUTCDate() == d2.getUTCDate()
    );
}

export function isSameDay ( date1, date2 ) {
    let D1 = new Date( date1 );
    let D2 = new Date( date2 );
    return (
        Math.abs( D1.getTime() - D2.getTime() ) < 86_400_000 &&
        D1.getDate() === D2.getDate()
    );
}

export const isToday = ( someDate ) => {
    const today = new Date();
    return (
        someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
    );
};

export function daysInMonth ( month, year ) {
    const daysInMonths = [ 31, ( year % 4 === 0 && ( year % 100 !== 0 || year % 400 === 0 ) )
        ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    return daysInMonths[ month - 1 ];
}

/** // format.d.ts excerpt explaining the accepted patterns for date and time functions. 
 * @name format
 * @alias formatDate
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
 *    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 * @param format - The string of tokens
 * @param options - An object with options
 *
 * @returns The formatted date string
 *
 * @throws `date` must not be Invalid Date
 * @throws `options.locale` must contain `localize` property
 * @throws `options.locale` must contain `formatLong` property
 * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */
// Date formatting and utility functions
export const d8 = {
    // Main date formatting function with customizable options
    format: ( date, format = 'YYYY-MM-DD' ) => {
        const d = new Date( date );
        const tokens = {
            YYYY: d.getFullYear(),
            YY: d.getFullYear().toString().slice( -2 ),
            MM: ( d.getMonth() + 1 ).toString().padStart( 2, '0' ),
            M: d.getMonth() + 1,
            DD: d.getDate().toString().padStart( 2, '0' ),
            D: d.getDate(),
            HH: d.getHours().toString().padStart( 2, '0' ),
            H: d.getHours(),
            mm: d.getMinutes().toString().padStart( 2, '0' ),
            m: d.getMinutes(),
            ss: d.getSeconds().toString().padStart( 2, '0' ),
            s: d.getSeconds(),
        };

        return format.replace(
            /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g,
            ( match ) => tokens[ match ],
        );
    },

    // Get month name
    getMonthName: ( date, format = 'long' ) => {
        return new Date( date ).toLocaleString( 'en-US', { month: format } );
    },

    // Get day name
    getDayName: ( date, format = 'long' ) => {
        return new Date( date ).toLocaleString( 'en-US', { weekday: format } );
    },

    // Get specific components
    getComponents: ( date ) => {
        const d = new Date( date );
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            date: d.getDate(),
            day: d.getDay(),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            seconds: d.getSeconds(),
            milliseconds: d.getMilliseconds(),
        };
    },

    // Get week number of the year
    getWeekNumber: ( date ) => {
        const d = new Date( date );
        d.setHours( 0, 0, 0, 0 );
        d.setDate( d.getDate() + 4 - ( d.getDay() || 7 ) );
        const yearStart = new Date( d.getFullYear(), 0, 1 );
        return Math.ceil( ( ( d - yearStart ) / 86400000 + 1 ) / 7 );
    },

    // Get remaining weeks in year
    getRemainingWeeks: ( date ) => {
        const d = new Date( date );
        const lastDay = new Date( d.getFullYear(), 11, 31 );
        return Math.ceil( ( lastDay - d ) / ( 7 * 24 * 60 * 60 * 1000 ) );
    },

    // Get remaining days in year
    getRemainingDays: ( date ) => {
        const d = new Date( date );
        const lastDay = new Date( d.getFullYear(), 11, 31 );
        return Math.ceil( ( lastDay - d ) / ( 24 * 60 * 60 * 1000 ) );
    },

    // Get days in month
    getDaysInMonth: ( date ) => {
        const d = new Date( date );
        return new Date( d.getFullYear(), d.getMonth() + 1, 0 ).getDate();
    },

    // Check if leap year
    isLeapYear: ( date ) => {
        const year = new Date( date ).getFullYear();
        return ( year % 4 === 0 && year % 100 !== 0 ) || year % 400 === 0;
    },

    // Get quarter of the year
    getQuarter: ( date ) => {
        return Math.floor( new Date( date ).getMonth() / 3 ) + 1;
    },

    // Format relative time (e.g., "2 days ago", "in 3 hours")
    getRelativeTime: ( date ) => {
        const diff = new Date() - new Date( date );
        const seconds = Math.abs( Math.floor( diff / 1000 ) );
        const minutes = Math.floor( seconds / 60 );
        const hours = Math.floor( minutes / 60 );
        const days = Math.floor( hours / 24 );
        const months = Math.floor( days / 30 );
        const years = Math.floor( months / 12 );

        const getPlural = ( num, word ) =>
            `${ num } ${ word }${ num === 1 ? '' : 's' }`;

        if ( years > 0 ) return getPlural( years, 'year' );
        if ( months > 0 ) return getPlural( months, 'month' );
        if ( days > 0 ) return getPlural( days, 'day' );
        if ( hours > 0 ) return getPlural( hours, 'hour' );
        if ( minutes > 0 ) return getPlural( minutes, 'minute' );
        return getPlural( seconds, 'second' );
    },

    sort: ( array, direction = -1, dateFieldName = '' ) => {
        utils.val.isValidArray( array, true )
            ? ( array.sort( ( a, b ) => (
                +( direction ) > 0
                    ? (
                        // a?.[ dateFieldName ] && isValidDate( a?.[ dateFieldName ] ) ? Date.parse( new Date( a?.[ dateFieldName ] ) ) - Date.parse( new Date( b?.[ dateFieldName ] ) ) : Date.parse( new Date( a?.[ dateFieldName ] ) ) - Date.parse( new Date( b?.[ dateFieldName ] ) )
                        ( Date.parse( ( a?.[ dateFieldName ] && isValidDate( a?.[ dateFieldName ] ) ) ? ( a?.[ dateFieldName ] ) : new Date( a?.[ dateFieldName ] ) ) )
                        - ( Date.parse( ( b?.[ dateFieldName ] && isValidDate( b?.[ dateFieldName ] ) ) ? ( b?.[ dateFieldName ] ) : new Date( b?.[ dateFieldName ] ) ) )
                    )
                    : (
                        ( Date.parse( ( b?.[ dateFieldName ] && isValidDate( b?.[ dateFieldName ] ) ) ? ( b?.[ dateFieldName ] ) : new Date( b?.[ dateFieldName ] ) ) )
                        - ( Date.parse( ( a?.[ dateFieldName ] && isValidDate( a?.[ dateFieldName ] ) ) ? ( a?.[ dateFieldName ] ) : new Date( a?.[ dateFieldName ] ) ) )
                    )
            ) ) )
            : ( array );
    },

    // Add time to date
    add: ( date, amount, unit ) => {
        const d = new Date( date );
        const units = {
            years: 'setFullYear',
            months: 'setMonth',
            days: 'setDate',
            hours: 'setHours',
            minutes: 'setMinutes',
            seconds: 'setSeconds',
        };

        if ( units[ unit ] ) {
            const currentValue = d[ units[ unit ].replace( 'set', 'get' ) ]();
            d[ units[ unit ] ]( currentValue + amount );
        }
        return d;
    },

    // Subtract time from date
    subtract: ( date, amount, unit ) => {
        return dateHelpers.add( date, -amount, unit );
    },
};

export function formatDateTimeInt ( date ) {
    return new Intl.DateTimeFormat( "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    } ).format( date );
}

export function formatDistanceToNow ( date ) {
    const now = new Date();
    const diffInSeconds = Math.floor( ( now.getTime() - date.getTime() ) / 1000 );

    if ( diffInSeconds < 60 ) {
        return "just now";
    }

    const diffInMinutes = Math.floor( diffInSeconds / 60 );
    if ( diffInMinutes < 60 ) {
        return `${ diffInMinutes } min${ diffInMinutes === 1 ? "" : "s" } ago`;
    }

    const diffInHours = Math.floor( diffInMinutes / 60 );
    if ( diffInHours < 24 ) {
        return `${ diffInHours } hour${ diffInHours === 1 ? "" : "s" } ago`;
    }

    const diffInDays = Math.floor( diffInHours / 24 );
    if ( diffInDays < 7 ) {
        return `${ diffInDays } day${ diffInDays === 1 ? "" : "s" } ago`;
    }

    const diffInWeeks = Math.floor( diffInDays / 7 );
    if ( diffInWeeks < 4 ) {
        return `${ diffInWeeks } week${ diffInWeeks === 1 ? "" : "s" } ago`;
    }

    const diffInMonths = Math.floor( diffInDays / 30 );
    if ( diffInMonths < 12 ) {
        return `${ diffInMonths } month${ diffInMonths === 1 ? "" : "s" } ago`;
    }

    const diffInYears = Math.floor( diffInDays / 365 );
    return `${ diffInYears } year${ diffInYears === 1 ? "" : "s" } ago`;
}




/////////////////////////////////



/**
 * Filters an array of objects based on date fields
 * @param {Object} params - The filter parameters
 * @param {Array} params.data - Array of objects to filter
 * @param {string} params.compareFieldName - Name of the date field to compare
 * @param {Date|string} [params.filterBeforeDate] - Optional date to filter before
 * @param {Date|string} [params.filterAfterDate] - Optional date to filter after
 * @returns {Array} - Filtered array of objects
 */
export function filterByDate ( {
    data,
    compareFieldName,
    filterBeforeDate,
    filterAfterDate
} ) {
    // Error checking
    if ( !Array.isArray( data ) ) {
        console.error( 'Error: data must be an array' );
        return [];
    }

    if ( !compareFieldName || typeof compareFieldName !== 'string' ) {
        console.error( 'Error: compareFieldName must be a valid string' );
        return [];
    }

    // Convert date strings to Date objects if needed
    let beforeDate = null;
    let afterDate = null;

    if ( filterBeforeDate ) {
        beforeDate = filterBeforeDate instanceof Date
            ? filterBeforeDate
            : new Date( filterBeforeDate );

        if ( isNaN( beforeDate.getTime() ) ) {
            console.error( 'Error: filterBeforeDate is not a valid date' );
            return [];
        }
    }

    if ( filterAfterDate ) {
        afterDate = filterAfterDate instanceof Date
            ? filterAfterDate
            : new Date( filterAfterDate );

        if ( isNaN( afterDate.getTime() ) ) {
            console.error( 'Error: filterAfterDate is not a valid date' );
            return [];
        }
    }

    // If neither date is provided, return the original data
    if ( !beforeDate && !afterDate ) {
        console.warn( 'Warning: No date filters provided, returning original data' );
        return [ ...data ];
    }

    return data.filter( item => {
        // Check if the item has the specified field
        if ( !item || typeof item !== 'object' || !( compareFieldName in item ) ) {
            return false;
        }

        // Get the date to compare
        const itemDate = item[ compareFieldName ] instanceof Date
            ? item[ compareFieldName ]
            : new Date( item[ compareFieldName ] );

        // Check if the date is valid
        if ( isNaN( itemDate.getTime() ) ) {
            return false;
        }

        // Filter based on which dates are provided
        if ( beforeDate && afterDate ) {
            // Between two dates
            return itemDate >= afterDate && itemDate <= beforeDate;
        } else if ( beforeDate ) {
            // Before a given date
            return itemDate <= beforeDate;
        } else {
            // After a given date
            return itemDate >= afterDate;
        }
    } );
}

/**
 * Filters an array of objects based on date fields (optimized for large arrays)
 * @param {Object} params - The filter parameters
 * @param {Array} params.data - Array of objects to filter
 * @param {string} params.compareFieldName - Name of the date field to compare
 * @param {Date|string} [params.filterBeforeDate] - Optional date to filter before
 * @param {Date|string} [params.filterAfterDate] - Optional date to filter after
 * @returns {Array} - Filtered array of objects
 */
export function filterByDates ( {
    data,
    compareFieldName,
    filterBeforeDate,
    filterAfterDate
} ) {
    // Error checking
    if ( !Array.isArray( data ) ) {
        console.error( 'Error: data must be an array' );
        return [];
    }

    if ( !compareFieldName || typeof compareFieldName !== 'string' ) {
        console.error( 'Error: compareFieldName must be a valid string' );
        return [];
    }

    // If neither date is provided, return the original data
    if ( !filterBeforeDate && !filterAfterDate ) {
        console.warn( 'Warning: No date filters provided, returning original data' );
        return [ ...data ];
    }

    // Convert date strings to Date objects if needed (do this once outside the loop)
    let beforeDate = null;
    let afterDate = null;

    if ( filterBeforeDate ) {
        beforeDate = filterBeforeDate instanceof Date
            ? filterBeforeDate
            : new Date( filterBeforeDate );

        if ( isNaN( beforeDate.getTime() ) ) {
            console.error( 'Error: filterBeforeDate is not a valid date' );
            return [];
        }
    }

    if ( filterAfterDate ) {
        afterDate = filterAfterDate instanceof Date
            ? filterAfterDate
            : new Date( filterAfterDate );

        if ( isNaN( afterDate.getTime() ) ) {
            console.error( 'Error: filterAfterDate is not a valid date' );
            return [];
        }
    }

    // Pre-determine the filter function based on which dates are provided
    // This avoids repeated condition checks inside the filter loop
    let filterFn;

    if ( beforeDate && afterDate ) {
        // Between two dates
        filterFn = ( itemDate ) => itemDate >= afterDate && itemDate <= beforeDate;
    } else if ( beforeDate ) {
        // Before a given date
        filterFn = ( itemDate ) => itemDate <= beforeDate;
    } else {
        // After a given date
        filterFn = ( itemDate ) => itemDate >= afterDate;
    }

    // Use a regular for loop instead of filter for better performance on large arrays
    const result = [];
    const len = data.length;

    for ( let i = 0; i < len; i++ ) {
        const item = data[ i ];

        // Check if the item has the specified field
        if ( !item || typeof item !== 'object' || !( compareFieldName in item ) ) {
            continue;
        }

        // Get the date to compare
        const itemDateValue = item[ compareFieldName ];
        if ( !itemDateValue ) continue;

        const itemDate = itemDateValue instanceof Date
            ? itemDateValue
            : new Date( itemDateValue );

        // Check if the date is valid
        if ( isNaN( itemDate.getTime() ) ) {
            continue;
        }

        // Apply the pre-determined filter function
        if ( filterFn( itemDate ) ) {
            result.push( item );
        }
    }

    return result;
}

/**
 * Validates and converts a date input to a Date object
 * @param {Date|string} dateInput - Date input to validate and convert
 * @param {string} paramName - Name of the parameter for error messages
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export function validateAndConvertDate ( dateInput, paramName ) {
    if ( !dateInput ) return null;

    const date = dateInput instanceof Date
        ? dateInput
        : new Date( dateInput );

    if ( isNaN( date.getTime() ) ) {
        console.error( `Error: ${ paramName } is not a valid date` );
        return null;
    }

    return date;
}

/**
 * Validates basic input parameters
 * @param {Array} data - Array of objects to filter
 * @param {string} compareFieldName - Name of the date field to compare
 * @returns {boolean} - Whether inputs are valid
 */
export function validateInputs ( data, compareFieldName ) {
    if ( !Array.isArray( data ) ) {
        console.error( 'Error: data must be an array' );
        return false;
    }

    if ( !compareFieldName || typeof compareFieldName !== 'string' ) {
        console.error( 'Error: compareFieldName must be a valid string' );
        return false;
    }

    return true;
}

/**
 * Extracts and validates a date from an object
 * @param {Object} item - Object containing the date field
 * @param {string} fieldName - Name of the date field
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export function extractValidDate ( item, fieldName ) {
    if ( !item || typeof item !== 'object' || !( fieldName in item ) ) {
        return null;
    }

    const dateValue = item[ fieldName ];
    if ( !dateValue ) return null;

    const date = dateValue instanceof Date
        ? dateValue
        : new Date( dateValue );

    return isNaN( date.getTime() ) ? null : date;
}

/**
 * Creates a date comparison function based on provided date boundaries
 * @param {Date|null} beforeDate - Upper date boundary (inclusive)
 * @param {Date|null} afterDate - Lower date boundary (inclusive)
 * @returns {Function} - Function that tests if a date is within boundaries
 */
export function createDateComparisonFunction ( beforeDate, afterDate ) {
    if ( beforeDate && afterDate ) {
        // Between two dates
        return ( date ) => date >= afterDate && date <= beforeDate;
    } else if ( beforeDate ) {
        // Before a given date
        return ( date ) => date <= beforeDate;
    } else if ( afterDate ) {
        // After a given date
        return ( date ) => date >= afterDate;
    } else {
        // No date filters
        return () => true;
    }
}

/**
 * Filters an array of objects based on date fields
 * @param {Object} params - The filter parameters
 * @param {Array} params.data - Array of objects to filter
 * @param {string} params.compareFieldName - Name of the date field to compare
 * @param {Date|string} [params.filterBeforeDate] - Optional date to filter before
 * @param {Date|string} [params.filterAfterDate] - Optional date to filter after
 * @returns {Array} - Filtered array of objects
 */
export function filterByDate2 ( {
    data,
    compareFieldName,
    filterBeforeDate,
    filterAfterDate
} ) {
    // Validate basic inputs
    if ( !validateInputs( data, compareFieldName ) ) {
        return [];
    }

    // Convert and validate date inputs
    const beforeDate = validateAndConvertDate( filterBeforeDate, 'filterBeforeDate' );
    const afterDate = validateAndConvertDate( filterAfterDate, 'filterAfterDate' );

    // If both dates are invalid after validation, return original data
    if ( !beforeDate && !afterDate ) {
        console.warn( 'Warning: No valid date filters provided, returning original data' );
        return [ ...data ];
    }

    // Create the appropriate date comparison function
    const isDateInRange = createDateComparisonFunction( beforeDate, afterDate );

    // Filter the data
    const result = [];
    const len = data.length;

    for ( let i = 0; i < len; i++ ) {
        const itemDate = extractValidDate( data[ i ], compareFieldName );

        // Skip items with invalid dates
        if ( !itemDate ) continue;

        // Add items with dates in the specified range
        if ( isDateInRange( itemDate ) ) {
            result.push( data[ i ] );
        }
    }

    return result;
}
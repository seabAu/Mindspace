import { RRule, RRuleSet } from "rrule";
import * as utils from 'akashatools';
import { format, isValid, addDays, isDate } from "date-fns";

// --- Recurrence & Next Trigger Calculation ---
const DAY_MAP = { SU: RRule.SU, MO: RRule.MO, TU: RRule.TU, WE: RRule.WE, TH: RRule.TH, FR: RRule.FR, SA: RRule.SA };

export const sortDates = ( dates, sortConfig = { direction: 'asc' } ) => {
    if ( utils.val.isValidArray( dates, true ) && dates[ 0 ] instanceof Date ) {
        return dates?.sort( ( a, b ) => {
            let valA = ( isDate( a ) ) ? new Date( a ) : new Date( 0 );
            let valB = ( isDate( b ) ) ? new Date( b ) : new Date( 0 );
            if ( valA < valB ) return sortConfig.direction === "asc" ? -1 : 1;
            if ( valA > valB ) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        } );
    }
    return dates;

};

export const getNextTrigger = ( reminder ) => {
    let nextTriggerDate;
    const triggerDates = reminder.triggerDates;
    if ( utils.val.isValidArray( triggerDates, true ) ) {
        if ( triggerDates.length > 1 ) {
            // More than 1 date selected. Get the closest by sorting and getting the 1st item. 

            const sortableDates = [ ...triggerDates ];
            const sortedDates = sortDates( sortableDates, { direction: 'asc' } );
            // sortableDates.sort( ( a, b ) => {
            //     let valA = ( isDate( a ) ) ? new Date( a ) : new Date( 0 );
            //     let valB = ( isDate( b ) ) ? new Date( b ) : new Date( 0 );
            //     if ( valA < valB ) return -1;
            //     if ( valA > valB ) return 1;
            //     return 0;
            // } );

            // Run through the sorted dates array and find which next-closest one is still in the future. It may have stale, older dates at the start that have already passed. 
            const today = new Date( Date.now() );
            sortedDates.forEach( ( d ) => {
                if ( nextTriggerDate === undefined || nextTriggerDate === null ) {
                    // Next trigger date not yet found. Required to avoid setting this date to the last one in the array.
                    if ( today < new Date( d ) ) {
                        // This date is after today (future).
                        nextTriggerDate = d;
                    }
                    else {
                        // This date is before today (past).
                    }
                }
            } );

            // nextTriggerDate = sortableDates[ 0 ];
        }
        else {
            // Only 1 item in array, just use that.
            nextTriggerDate = triggerDates[ 0 ];
        }
    }

    // console.log( 'notificationUtils :: getNextTrigger called :: reminder = ', reminder, ' :: ', 'nextTriggerDate = ', nextTriggerDate );

    return nextTriggerDate;
};

export function calculateNextTriggerTime ( reminder, fromDate = new Date() ) {
    if ( !reminder.isActive ) return null;

    const rruleSet = new RRuleSet();

    // Reminders now have an array of triggerDates, so get whatever the most-soonest (or if only 1, which is required)
    // const nextTriggerDate = new Date( reminder.triggerDate );
    const nextTriggerDate = getNextTrigger( reminder );

    // Add the initial triggerDateTime as a specific date
    rruleSet.rdate( nextTriggerDate );

    if ( reminder.showRecurrence && reminder.rrules && reminder.rrules.length > 0 ) {
        reminder.rrules.forEach( ( term ) => {
            try {
                const [ hours, minutes ] = term.startDate
                    ? term.startDate.split( ":" ).map( Number )
                    : [ nextTriggerDate.getHours(), nextTriggerDate.getMinutes() ];

                const ruleOptions = {
                    dtstart: nextTriggerDate, // Start from the base trigger or a relevant past date
                    // Consider setting tzinfo if timezones are a factor
                };

                switch ( term.ruleType ) {
                    case "specific":
                        if ( term.dateTime ) rruleSet.rdate( new Date( term.dateTime ) );
                        break;
                    case "daily":
                        ruleOptions.freq = RRule.DAILY;
                        ruleOptions.byhour = hours;
                        ruleOptions.byminute = minutes;
                        rruleSet.rrule( new RRule( ruleOptions ) );
                        break;
                    case "weekly":
                        ruleOptions.freq = RRule.WEEKLY;
                        ruleOptions.byweekday = term.onDays?.map( ( d ) => DAY_MAP[ d.toUpperCase() ] ).filter( Boolean );
                        ruleOptions.byhour = hours;
                        ruleOptions.byminute = minutes;
                        if ( ruleOptions.byweekday?.length > 0 ) {
                            rruleSet.rrule( new RRule( ruleOptions ) );
                        }
                        break;
                    case "hourly_on_days_range":
                        // This is more complex. RRule might not directly support "every X minutes within a time range on specific days".
                        // For simplicity, we'll interpret this as triggering at the start of each hour within the range.
                        // A more robust solution would involve multiple RRules or custom logic.
                        const [ startHour ] = term.startTime ? term.startTime.split( ":" ).map( Number ) : [ 0 ];
                        const [ endHour ] = term.endTime ? term.endTime.split( ":" ).map( Number ) : [ 23 ];
                        const byHourArr = [];
                        for ( let h = startHour; h <= endHour; h++ ) byHourArr.push( h );

                        ruleOptions.freq = RRule.WEEKLY; // Base it weekly to select days
                        ruleOptions.byweekday = term.onDays?.map( ( d ) => DAY_MAP[ d.toUpperCase() ] ).filter( Boolean );
                        ruleOptions.byhour = byHourArr;
                        ruleOptions.byminute = minutes || 0; // Typically on the hour, or specified minute
                        // Interval for hourly is tricky with RRule. This rule triggers ONCE per hour listed.
                        // True "every X minutes" within a range needs more complex handling.
                        if ( ruleOptions.byweekday?.length > 0 && byHourArr.length > 0 ) {
                            rruleSet.rrule( new RRule( ruleOptions ) );
                        }
                        break;
                    default:
                        break;
                }
            } catch ( e ) {
                console.error( "Error parsing recurrence term for rrule:", term, e );
            }
        } );
    }

    // Get all occurrences after 'fromDate'
    const occurrences = rruleSet.after( fromDate, true ); // inc=true to include if 'fromDate' is an occurrence
    return occurrences ? occurrences : null; // Returns the next occurrence Date object or null
}

// --- Check if a reminder should trigger NOW ---
export function shouldReminderTrigger ( reminder, currentTime = new Date() ) {
    if ( !reminder.isActive ) return false;

    const now = currentTime;
    // const reminderTriggerTime = new Date( reminder.triggerDateTime );
    const reminderTriggerDate = new Date( getNextTrigger( reminder ) );

    // Check base trigger time (within a small tolerance, e.g., 1 minute)
    const diffMinutes = ( now.getTime() - reminderTriggerDate.getTime() ) / 60000;
    if ( diffMinutes >= 0 && diffMinutes < 1 ) {
        // If it's not recurring or has no terms, it's a one-time trigger
        if ( !reminder.showRecurrence || !reminder.rrules || reminder.rrules.length === 0 ) {
            return true;
        }
    }

    if ( reminder.showRecurrence && reminder.rrules && reminder.rrules.length > 0 ) {
        const nextOccurrence = calculateNextTriggerTime( reminder, new Date( now.getTime() - 2 * 60 * 1000 ) ); // Check from 2 mins ago
        if ( nextOccurrence ) {
            const nextOccDiffMinutes = ( now.getTime() - nextOccurrence.getTime() ) / 60000;
            if ( nextOccDiffMinutes >= 0 && nextOccDiffMinutes < 1 ) {
                // Trigger if current time is within 1 min after calculated next occurrence
                return true;
            }
        }
    }
    return false;
}

// --- Time Ago Formatter ---
export function formatTimeAgo ( date ) {
    const seconds = Math.floor( ( new Date() - new Date( date ) ) / 1000 );
    let interval = seconds / 31536000;
    if ( interval > 1 ) return Math.floor( interval ) + " years ago";
    interval = seconds / 2592000;
    if ( interval > 1 ) return Math.floor( interval ) + " months ago";
    interval = seconds / 86400;
    if ( interval > 1 ) return Math.floor( interval ) + " days ago";
    interval = seconds / 3600;
    if ( interval > 1 ) return Math.floor( interval ) + " hours ago";
    interval = seconds / 60;
    if ( interval > 1 ) return Math.floor( interval ) + " minutes ago";
    if ( seconds < 10 ) return "just now";
    return Math.floor( seconds ) + " seconds ago";
}

// Helper to format recurrence terms for display
export function formatRecurrence ( reminder ) {
    if ( !reminder.showRecurrence || !reminder.rrules || reminder.rrules.length === 0 ) {
        return "Not recurring";
    }
    if ( reminder.rrules.length > 3 ) {
        return `${ reminder.rrules.length } rules active`;
    }
    return reminder.rrules
        .map( ( term ) => {
            switch ( term.ruleType ) {
                case "specific":
                    return `On ${ new Date( term.startDate ).toLocaleDateString() }`;
                case "daily":
                    return `Daily at ${ term.startDate }`;
                case "weekly":
                    return `Weekly on ${ term.onDays?.join( ", " ) } at ${ term.startDate }`;
                case "hourly_on_days_range":
                    return `Hourly (${ term.startTime }-${ term.endTime }) on ${ term.onDays?.join( ", " ) }`;
                default:
                    return "Custom";
            }
        } )
        .join( "; " );
}

import React from 'react';
/*  const RecurrenceRulesSchema = new Schema( {
        // rrule: 'FREQ=DAILY;COUNT=10;BYDAY=MO,TU,WE,TH,FR',
        enabled: { type: Boolean, default: false },
        periodicity: {
            // DAILY
            type: String,
            enum: {
                values: [ "HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY" ],
                message: "{VALUE} is not supported",
            },
            default: "DAILY",
        },
        interval: {
            type: String,
            enum: {
                values: [ 'SS', 'MN', 'HR', 'DY', 'WK', 'MO', 'YR' ],
                message: '{VALUE} is not supported'
            },
            default: "DY",
        },
        rules: [ {
            onDays: { type: String, enum: [ "sat", "sun", "mon", "tue", "wed", "thurs", "fri" ] },
            interval: { type: String, enum: [ "day", "week", "month", "year" ] },
            frequency: { type: Number, min: 1 },
        } ],
        start: { type: Date },
        end: { type: Date },
        freq: { type: Number },
        days: [ { type: Number } ], // MO,TU,WE,TH,FR; or 1,3,4,7 in which this is active.
        weeks: [ { type: Number } ], // 1, 2, 3, 4th weeks of month in which this is active.
        months: [ { type: Number } ], // Which months of year this is active.
        repeat: { type: Number }, // How many times it repeats
    } );
*/
const ReminderForm = () => {
    return (
        <div>

        </div>
    );
};

export default ReminderForm;

// Spoofed backend utility for habit tracking
import { format, subDays } from "date-fns";

// Generate a color based on habit name
const generateColorFromName = ( name ) => {
    let hash = 0;
    for ( let i = 0; i < name.length; i++ ) {
        hash = name.charCodeAt( i ) + ( ( hash << 5 ) - hash );
    }
    const hue = hash % 360;
    return `hsl(${ hue }, 70%, 60%)`;
};

// Sample habit types
const habitTypes = [
    "motor",
    "cognitive",
    "character",
    "health",
    "fitness",
    "finance",
    "career",
    "relationship",
    "social",
    "spirituality",
    "food",
    "mindset",
];

const inputTypes = [ "toggle", "value", "custom" ];

// Generate sample habits
const generateSampleHabits = () => {
    const habitNames = [
        "Morning Meditation",
        "Exercise",
        "Read for 30min",
        "Drink 8 glasses of water",
        "Take vitamins",
        "Journal writing",
        "Clean workspace",
        "Call family",
        "Practice guitar",
        "Meal prep",
        "Budget review",
        "Gratitude practice",
    ];

    return habitNames.map( ( name, index ) => {
        const inputType = inputTypes[ index % 3 ];
        const color = generateColorFromName( name );

        return {
            id: `habit_${ index + 1 }`,
            userId: "user_123",
            workspaceId: "workspace_456",
            title: name,
            description: `Description for ${ name }`,
            isActive: Math.random() > 0.2,
            isBadHabit: Math.random() > 0.8,
            color: color,
            habitType: habitTypes[ Math.floor( Math.random() * habitTypes.length ) ],
            importance: Math.floor( Math.random() * 10 ) + 1,
            progress: Math.floor( Math.random() * 100 ),
            inputType: inputType, // Added for our three types
            minValue: inputType === "value" ? ( Math.random() > 0.5 ? Math.floor( Math.random() * 5 ) : null ) : null,
            maxValue: inputType === "value" ? ( Math.random() > 0.5 ? Math.floor( Math.random() * 50 ) + 10 : null ) : null,
            difficulty: Math.floor( Math.random() * 7 ),
            priority: Math.floor( Math.random() * 7 ),
            activity: generateActivityData( inputType ),
        };
    } );
};

// Generate activity data for the last 30 days
const generateActivityData = ( inputType ) => {
    const activities = [];
    const today = new Date();

    for ( let i = 29; i >= 0; i-- ) {
        const date = subDays( today, i );
        let value, notes;

        switch ( inputType ) {
            case "toggle":
                value = Math.random() > 0.3 ? 1 : 0;
                notes = "";
                break;
            case "value":
                value = Math.floor( Math.random() * 20 ) + 1;
                notes = "";
                break;
            case "custom":
                value = 0;
                notes = Math.random() > 0.5 ? `Custom note for ${ format( date, "MMM dd" ) }` : "";
                break;
            default:
                value = 0;
                notes = "";
        }

        activities.push( {
            date: date.toISOString(),
            value,
            notes,
        } );
    }

    return activities;
};

// Mock API functions
const habits = generateSampleHabits();

export const api = {
    // Get all habits
    getHabits: async () => {
        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) ); // Simulate network delay
        return { success: true, data: habits };
    },

    // Get habit by ID
    getHabit: async ( id ) => {
        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
        const habit = habits.find( ( h ) => h.id === id );
        return { success: !!habit, data: habit };
    },

    // Create new habit
    createHabit: async ( habitData ) => {
        await new Promise( ( resolve ) => setTimeout( resolve, 200 ) );
        const newHabit = {
            ...habitData,
            id: `habit_${ Date.now() }`,
            userId: "user_123",
            workspaceId: "workspace_456",
            color: habitData.color || generateColorFromName( habitData.title ),
            activity: [],
        };
        habits.push( newHabit );
        return { success: true, data: newHabit };
    },

    // Update habit
    updateHabit: async ( id, updates ) => {
        await new Promise( ( resolve ) => setTimeout( resolve, 200 ) );
        const index = habits.findIndex( ( h ) => h.id === id );
        if ( index !== -1 ) {
            habits[ index ] = { ...habits[ index ], ...updates };
            return { success: true, data: habits[ index ] };
        }
        return { success: false, error: "Habit not found" };
    },

    // Update habit activity for a specific date
    updateHabitActivity: async ( habitId, date, value, notes = "" ) => {
        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
        const habit = habits.find( ( h ) => h.id === habitId );
        if ( !habit ) return { success: false, error: "Habit not found" };

        const dateStr = new Date( date ).toISOString();
        const activityIndex = habit.activity.findIndex(
            ( a ) => new Date( a.date ).toDateString() === new Date( date ).toDateString(),
        );

        if ( activityIndex !== -1 ) {
            habit.activity[ activityIndex ] = { date: dateStr, value, notes };
        } else {
            habit.activity.push( { date: dateStr, value, notes } );
        }

        return { success: true, data: habit };
    },

    // Delete habit
    deleteHabit: async ( id ) => {
        await new Promise( ( resolve ) => setTimeout( resolve, 200 ) );
        const index = habits.findIndex( ( h ) => h.id === id );
        if ( index !== -1 ) {
            habits.splice( index, 1 );
            return { success: true };
        }
        return { success: false, error: "Habit not found" };
    },
};

export { generateColorFromName };

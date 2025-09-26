import { format, subDays, addDays } from "date-fns";

// Helper functions for generating random data
const randomInt = ( min, max ) => Math.floor( Math.random() * ( max - min + 1 ) ) + min;
const randomFloat = ( min, max ) => Number.parseFloat( ( Math.random() * ( max - min ) + min ).toFixed( 2 ) );
const randomBool = () => Math.random() > 0.5;
const randomDate = ( start, end ) => new Date( start.getTime() + Math.random() * ( end.getTime() - start.getTime() ) );

// Arrays of sample data for various categories
const moods = [ "Happy", "Sad", "Anxious", "Excited", "Calm", "Tired", "Energetic", "Stressed", "Relaxed", "Content" ];
const activities = [
    "Running",
    "Walking",
    "Cycling",
    "Swimming",
    "Yoga",
    "Meditation",
    "Reading",
    "Cooking",
    "Cleaning",
    "Working",
    "Studying",
    "Socializing",
];
const foods = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Coffee",
    "Tea",
    "Water",
    "Fruit",
    "Vegetable",
    "Protein",
    "Carbs",
    "Dessert",
];
const places = [
    "Home",
    "Work",
    "Gym",
    "Park",
    "Cafe",
    "Restaurant",
    "Friend's house",
    "Family's house",
    "Store",
    "Mall",
    "Beach",
    "Mountains",
];
const people = [
    "Friend",
    "Family",
    "Colleague",
    "Partner",
    "Acquaintance",
    "Stranger",
    "Group",
    "Team",
    "Class",
    "Community",
];
const thoughts = [
    "I should exercise more",
    "Need to drink more water",
    "Feeling good about my progress",
    "Worried about that deadline",
    "Looking forward to the weekend",
    "Should call my parents",
    "Need to plan that trip",
    "Proud of what I accomplished today",
    "Feeling overwhelmed with tasks",
    "Grateful for the good weather",
];

// Generate a random string
const randomString = ( length = 10 ) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for ( let i = 0; i < length; i++ ) {
        result += chars.charAt( Math.floor( Math.random() * chars.length ) );
    }
    return result;
};

// Generate a random array
const randomArray = ( type, min = 1, max = 5 ) => {
    const length = randomInt( min, max );
    const result = [];

    for ( let i = 0; i < length; i++ ) {
        switch ( type ) {
            case "String":
                result.push( randomString( randomInt( 3, 10 ) ) );
                break;

            case "Number":
            case "Integer":
                result.push( randomInt( 0, 100 ) );
                break;
            case "Decimal":
                result.push( randomFloat( 0, 100 ) );
                break;
            case "Boolean":
                result.push( randomBool() );
                break;
            case "Date":
            case "DateTime":
            case "DateTimeLocal":
                result.push( randomDate( subDays( new Date(), 30 ), new Date() ) );
                break;
            case "Object":
                result.push( { key: randomString(), value: randomInt( 0, 100 ) } );
                break;
            default:
                result.push( randomString() );
        }
    }

    return result;
};

// Generate a random object
const randomObject = ( keys = 3 ) => {
    const result = {};
    const types = [ "String", "Number", "Boolean", "Date" ];

    for ( let i = 0; i < keys; i++ ) {
        const key = randomString( 5 );
        const type = types[ randomInt( 0, types.length - 1 ) ];

        switch ( type ) {
            case "String":
                result[ key ] = randomString( randomInt( 3, 10 ) );
                break;
            case "Number":
                result[ key ] = randomInt( 0, 100 );
                break;
            case "Boolean":
                result[ key ] = randomBool();
                break;
            case "Date":
                result[ key ] = randomDate( subDays( new Date(), 30 ), new Date() );
                break;
        }
    }

    return result;
};

// Generate data for specific daily log categories
const generateWellnessData = () => {
    const types = [ "mood", "energy", "stress", "sleep", "meditation" ];
    const type = types[ randomInt( 0, types.length - 1 ) ];

    switch ( type ) {
        case "mood":
            return {
                dataKey: "mood",
                dataType: "String",
                entrytype: "Wellness",
                dataValue: moods[ randomInt( 0, moods.length - 1 ) ],
                _metadata: "Daily mood tracking",
            };
        case "energy":
            return {
                dataKey: "energy",
                dataType: "Number",
                entrytype: "Wellness",
                dataValue: randomInt( 1, 10 ),
                _metadata: "Energy level on a scale of 1-10",
            };
        case "stress":
            return {
                dataKey: "stress",
                dataType: "Number",
                entrytype: "Wellness",
                dataValue: randomInt( 1, 10 ),
                _metadata: "Stress level on a scale of 1-10",
            };
        case "sleep":
            return {
                dataKey: "sleep",
                dataType: "Object",
                entrytype: "Wellness",
                dataValue: {
                    hours: randomFloat( 4, 10 ),
                    quality: randomInt( 1, 10 ),
                    deepSleep: randomFloat( 0.5, 4 ),
                },
                _metadata: "Sleep tracking data",
            };
        case "meditation":
            return {
                dataKey: "meditation",
                dataType: "Number",
                entrytype: "Wellness",
                dataValue: randomInt( 5, 60 ),
                _metadata: "Meditation duration in minutes",
            };
    }
};

const generateFitnessData = () => {
    const types = [ "steps", "workout", "heartRate", "weight", "bodyMeasurements" ];
    const type = types[ randomInt( 0, types.length - 1 ) ];

    switch ( type ) {
        case "steps":
            return {
                dataKey: "steps",
                dataType: "Number",
                entrytype: "Fitness",
                dataValue: randomInt( 1000, 20000 ),
                _metadata: "Daily step count",
            };
        case "workout":
            return {
                dataKey: "workout",
                dataType: "Object",
                entrytype: "Fitness",
                dataValue: {
                    activity: activities[ randomInt( 0, 2 ) ], // First 3 are exercise activities
                    duration: randomInt( 15, 120 ),
                    calories: randomInt( 100, 800 ),
                    intensity: randomInt( 1, 10 ),
                },
                _metadata: "Workout details",
            };
        case "heartRate":
            return {
                dataKey: "heartRate",
                dataType: "Array",
                entrytype: "Fitness",
                dataValue: Array.from( { length: randomInt( 3, 8 ) }, () => randomInt( 60, 180 ) ),
                _metadata: "Heart rate measurements throughout the day",
            };
        case "weight":
            return {
                dataKey: "weight",
                dataType: "Number",
                entrytype: "Fitness",
                dataValue: randomFloat( 50, 100 ),
                _metadata: "Weight in kg",
            };
        case "bodyMeasurements":
            return {
                dataKey: "bodyMeasurements",
                dataType: "Object",
                entrytype: "Fitness",
                dataValue: {
                    chest: randomFloat( 80, 120 ),
                    waist: randomFloat( 60, 100 ),
                    hips: randomFloat( 80, 120 ),
                    bodyFat: randomFloat( 10, 30 ),
                },
                _metadata: "Body measurements in cm and %",
            };
    }
};

const generateNutritionData = () => {
    const types = [ "meal", "water", "calories", "macros" ];
    const type = types[ randomInt( 0, types.length - 1 ) ];

    switch ( type ) {
        case "meal":
            return {
                dataKey: "meal",
                dataType: "Object",
                entrytype: "Nutrition",
                dataValue: {
                    type: foods[ randomInt( 0, 3 ) ], // First 4 are meal types
                    description: randomString( 20 ),
                    calories: randomInt( 200, 1000 ),
                },
                _metadata: "Meal tracking",
            };
        case "water":
            return {
                dataKey: "water",
                dataType: "Number",
                entrytype: "Nutrition",
                dataValue: randomFloat( 0.1, 4 ),
                _metadata: "Water intake in liters",
            };
        case "calories":
            return {
                dataKey: "calories",
                dataType: "Number",
                entrytype: "Nutrition",
                dataValue: randomInt( 1200, 3000 ),
                _metadata: "Total daily calorie intake",
            };
        case "macros":
            return {
                dataKey: "macros",
                dataType: "Object",
                entrytype: "Nutrition",
                dataValue: {
                    protein: randomInt( 50, 200 ),
                    carbs: randomInt( 100, 300 ),
                    fat: randomInt( 30, 100 ),
                    fiber: randomInt( 10, 40 ),
                },
                _metadata: "Macronutrient breakdown in grams",
            };
    }
};

const generateFinancialData = () => {
    const types = [ "expense", "income", "budget", "savings" ];
    const type = types[ randomInt( 0, types.length - 1 ) ];

    switch ( type ) {
        case "expense":
            return {
                dataKey: "expense",
                dataType: "Object",
                entrytype: "Financial",
                dataValue: {
                    category: [ "Food", "Transport", "Entertainment", "Bills", "Shopping" ][ randomInt( 0, 4 ) ],
                    amount: randomFloat( 5, 200 ),
                    description: randomString( 15 ),
                },
                _metadata: "Daily expense tracking",
            };
        case "income":
            return {
                dataKey: "income",
                dataType: "Number",
                entrytype: "Financial",
                dataValue: randomFloat( 50, 5000 ),
                _metadata: "Income received",
            };
        case "budget":
            return {
                dataKey: "budget",
                dataType: "Object",
                entrytype: "Financial",
                dataValue: {
                    food: randomFloat( 200, 500 ),
                    transport: randomFloat( 50, 200 ),
                    entertainment: randomFloat( 50, 300 ),
                    bills: randomFloat( 300, 1000 ),
                    savings: randomFloat( 100, 1000 ),
                },
                _metadata: "Monthly budget allocation",
            };
        case "savings":
            return {
                dataKey: "savings",
                dataType: "Number",
                entrytype: "Financial",
                dataValue: randomFloat( 100, 10000 ),
                _metadata: "Current savings amount",
            };
    }
};

const generateJournalData = () => {
    const types = [ "thought", "gratitude", "goal", "reflection" ];
    const type = types[ randomInt( 0, types.length - 1 ) ];

    switch ( type ) {
        case "thought":
            return {
                dataKey: "thought",
                dataType: "String",
                entrytype: "Journal",
                dataValue: thoughts[ randomInt( 0, thoughts.length - 1 ) ],
                _metadata: "Random thought of the day",
            };
        case "gratitude":
            return {
                dataKey: "gratitude",
                dataType: "Array",
                entrytype: "Journal",
                dataValue: Array.from( { length: randomInt( 1, 3 ) }, () => randomString( randomInt( 10, 30 ) ) ),
                _metadata: "Things I'm grateful for today",
            };
        case "goal":
            return {
                dataKey: "goal",
                dataType: "Object",
                entrytype: "Journal",
                dataValue: {
                    description: randomString( randomInt( 15, 40 ) ),
                    deadline: randomDate( new Date(), addDays( new Date(), 30 ) ),
                    progress: randomInt( 0, 100 ),
                },
                _metadata: "Personal goal tracking",
            };
        case "reflection":
            return {
                dataKey: "reflection",
                dataType: "String",
                entrytype: "Journal",
                dataValue: randomString( randomInt( 50, 200 ) ),
                _metadata: "End of day reflection",
            };
    }
};

// Main function to generate a large dataset
export const generateSampleData = ( count = 100 ) => {
    const data = [];
    const now = new Date();
    const startDate = subDays( now, 30 ); // Generate data for the last 30 days

    // Generate data points distributed across the time period
    for ( let i = 0; i < count; i++ ) {
        // Create a timeStamp somewhere in the last 30 days
        const timeStamp = randomDate( startDate, now );

        // Decide which category of data to generate
        const categories = [
            generateWellnessData,
            generateFitnessData,
            generateNutritionData,
            generateFinancialData,
            generateJournalData,
        ];

        const categoryFn = categories[ randomInt( 0, categories.length - 1 ) ];
        const dataPoint = categoryFn();

        data.push( {
            _id: `sample_${ i }_${ Date.now() }`,
            timeStamp,
            ...dataPoint,
        } );
    }

    // Sort by timeStamp
    return data.sort( ( a, b ) => new Date( a.timeStamp ) - new Date( b.timeStamp ) );
};

// Generate data for a specific day
export const generateDataForDay = ( date, count = 5 ) => {
    const data = [];
    const startOfDay = new Date( date );
    startOfDay.setHours( 0, 0, 0, 0 );

    const endOfDay = new Date( date );
    endOfDay.setHours( 23, 59, 59, 999 );

    for ( let i = 0; i < count; i++ ) {
        const timeStamp = randomDate( startOfDay, endOfDay );

        const categories = [
            generateWellnessData,
            generateFitnessData,
            generateNutritionData,
            generateFinancialData,
            generateJournalData,
        ];

        const categoryFn = categories[ randomInt( 0, categories.length - 1 ) ];
        const dataPoint = categoryFn();

        data.push( {
            _id: `day_${ format( date, "yyyyMMdd" ) }_${ i }_${ Date.now() }`,
            timeStamp,
            ...dataPoint,
        } );
    }

    return data.sort( ( a, b ) => new Date( a.timeStamp ) - new Date( b.timeStamp ) );
};

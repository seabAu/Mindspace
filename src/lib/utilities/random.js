
import axios from "axios";
import { DateTimeLocal, Decimal, ObjectArray, ObjectId } from "../config/types";

export const getDefaultValueForType = ( type ) => {
    switch ( type ) {
        case String:
            return "";
        case Number:
            return 0;
        case Boolean:
            return false;
        case Date:
        case DateTimeLocal:
            return new Date();
        case Decimal:
            return new Decimal( 0 );
        case ObjectId:
            return new ObjectId();
        case Array:
        case ObjectArray:
            return [];
        default:
            if ( type instanceof Object ) {
                return Object.fromEntries(
                    Object.entries( type ).map(
                        ( [ key, value ] ) => [
                            key,
                            getDefaultValueForType( value )
                        ]
                    )
                );
            }
            return null;
    }
};

export const generateRandomString = async ( length = 10 ) => {
    try {
        const response = await axios.get( `https://random-word-api.herokuapp.com/word?number=1` );
        return response.data[ 0 ];
    } catch ( error ) {
        console.error( "Error fetching random word:", error );
        return Math.random()
            .toString( 36 )
            .substring( 2, length + 2 );
    }
};

export const generateRandomNumber = ( min = 0, max = 100 ) => {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

export const generateRandomDate = ( start = new Date( 1970, 0, 1 ), end = new Date() ) => {
    return new Date( start.getTime() + Math.random() * ( end.getTime() - start.getTime() ) );
};

export const generateRandomBoolean = () => {
    return Math.random() < 0.5;
};

export const generateRandomDecimal = ( min = 0, max = 100, decimalPlaces = 2 ) => {
    const randomDecimal = Math.random() * ( max - min ) + min;
    return new Decimal( randomDecimal.toFixed( decimalPlaces ) );
};

export const generateRandomDateTimeLocal = () => {
    const randomDate = generateRandomDate();
    return new DateTimeLocal( randomDate );
};

export const generateRandomArray = async ( schema, length = 3 ) => {
    const result = [];
    for ( let i = 0; i < length; i++ ) {
        result.push( await generateRandomValueForType( schema.type[ 0 ] ) );
    }
    return result;
};

export const generateRandomObjectArray = async ( schema, length = 3 ) => {
    const result = [];
    for ( let i = 0; i < length; i++ ) {
        result.push( await generateRandomObject( schema.type[ 0 ] ) );
    }
    return new ObjectArray( result );
};

export const generateRandomObject = async ( schema ) => {
    const result = {};
    for ( const [ key, value ] of Object.entries( schema.type ) ) {
        result[ key ] = await generateRandomValueForType( value );
    }
    return result;
};

export const generateRandomObjectId = () => {
    return new ObjectId();
};

export const generateRandomValueForType = async ( schema ) => {
    if ( Array.isArray( schema.type ) ) {
        // Handle array types with specific content types
        const contentType = schema.type[ 0 ];
        return generateRandomArray( { type: contentType }, 3 );
    }

    if ( schema.type instanceof Object && !( schema.type.type || schema.type instanceof Function ) ) {
        // Handle nested object types
        return generateRandomObject( schema );
    }

    const actualType = schema.type?.type || schema.type;

    switch ( actualType ) {
        case String:
            if ( schema.enum ) {
                return schema.enum[ Math.floor( Math.random() * schema.enum.length ) ];
            }
            return await generateRandomString();
        case Number:
            return generateRandomNumber( schema.min, schema.max );
        case Date:
            return generateRandomDate();
        case Boolean:
            return generateRandomBoolean();
        case Array:
            return generateRandomArray( schema );
        case Object:
            return generateRandomObject( schema );
        case ObjectArray:
            return generateRandomObjectArray( schema );
        case DateTimeLocal:
            return generateRandomDateTimeLocal();
        case Decimal:
            return generateRandomDecimal( schema.min, schema.max, schema.decimalPlaces );
        case mongoose.Schema.Types.ObjectId:
        case ObjectId:
            return generateRandomObjectId();
        default:
            if ( actualType instanceof Object ) {
                return generateRandomObject( { type: actualType } );
            }
            return null;
    }
};

export const generateRandomData = async ( schema ) => {
    const result = {};
    for ( const [ key, value ] of Object.entries( schema ) ) {
        result[ key ] = await generateRandomValueForType( value );
    }
    return result;
};

export const generateRandomTasks = () => {
    const workspaceId = new ObjectId();
    const userId = new ObjectId();
    const todoListId = new ObjectId();

    // Create base tasks first
    const baseTasks = Array( 25 ).fill( null ).map( ( _, index ) => ( {
        _id: new ObjectId(),
        index,
        userId,
        workspaceId,
        todoList: todoListId,
        subtaskIds: [],
        groupId: null,
        fileIds: [],
        parentFolderId: null,
        prerequisites: [],
        title: `Task ${ index + 1 }`,
        description: `This is a detailed description for task ${ index + 1 }`,
        categories: [ `Category ${ Math.floor( index / 5 ) + 1 }` ],
        data: `Additional data for task ${ index + 1 }`,
        notes: [
            `Note 1 for task ${ index + 1 }`,
            `Note 2 for task ${ index + 1 }`
        ],
        difficulty: [ "none", "very low", "low", "medium", "high", "very high", "extreme", "?????" ][ Math.floor( Math.random() * 8 ) ],
        priority: [ "none", "low", "medium", "high", "urgent", "asap", "critical" ][ Math.floor( Math.random() * 7 ) ],
        status: [ "none", "new", "cancelled", "postponed", "waitingRequirements", "incomplete", "inProgress", "completed" ][ Math.floor( Math.random() * 8 ) ],
        completeness: Math.floor( Math.random() * 101 ),
        dueDate: new Date( Date.now() + ( Math.random() * 30 * 24 * 60 * 60 * 1000 ) ),
        estimatedDate: new Date( Date.now() + ( Math.random() * 60 * 24 * 60 * 60 * 1000 ) ),
        createdDate: new Date(),
        updatedDate: new Date(),
        settings: [
            { setting: "notification", value: "email" },
            { setting: "visibility", value: "public" }
        ],
        isPinned: Math.random() > 0.8,
        isRecurring: Math.random() > 0.8,
        recurrenceRules: [ '1D', '2D', '4D', '1W', '1M', '1Y' ][ Math.floor( Math.random() * 6 ) ],
        reminder: Math.random() > 0.7,
        completed: Math.random() > 0.7,
        inTrash: false
    } ) );

    // Add subtasks to 10 random tasks
    const tasksWithSubtasks = [ ...baseTasks ];
    for ( let i = 0; i < 10; i++ ) {
        const parentIndex = Math.floor( Math.random() * 25 );
        const subtaskCount = Math.floor( Math.random() * 3 ) + 1; // 1-3 subtasks

        for ( let j = 0; j < subtaskCount; j++ ) {
            const subtask = {
                ...baseTasks[ 0 ], // Clone structure from first task
                _id: new ObjectId(),
                index: baseTasks.length + ( i * subtaskCount ) + j,
                title: `Subtask ${ j + 1 } of Task ${ parentIndex + 1 }`,
                description: `This is a subtask of Task ${ parentIndex + 1 }`,
                parentTaskId: tasksWithSubtasks[ parentIndex ]._id
            };
            tasksWithSubtasks[ parentIndex ].subtaskIds.push( subtask._id );
            tasksWithSubtasks.push( subtask );
        }
    }

    // Add some tasks to different groups
    const groups = [ 'Development', 'Design', 'Marketing', 'Planning' ].map( name => ( {
        _id: new ObjectId(),
        name
    } ) );

    tasksWithSubtasks.forEach( task => {
        if ( Math.random() > 0.5 ) {
            task.groupId = groups[ Math.floor( Math.random() * groups.length ) ]._id;
        }
    } );

    return {
        tasks: tasksWithSubtasks,
        groups
    };
};

// Generate random position within chart bounds
export const getRandomPosition = () => {
    if ( !chartRef.current ) {
        return { x: 50, y: 50 }; // Default fallback
    }

    const chartWidth = chartSize.width;
    const chartHeight = chartSize.height;

    // Add padding to ensure images aren't placed too close to the edges
    const padding = imageSize / 2;

    // Generate random coordinates within the chart bounds
    const x = Math.floor( Math.random() * ( chartWidth - imageSize - padding * 2 ) ) + padding;
    const y = Math.floor( Math.random() * ( chartHeight - imageSize - padding * 2 ) ) + padding;

    return { x, y };
};

// Export the dummy data
// const dummyData = generateDummyTasks();
// console.log( JSON.stringify( dummyData, null, 2 ) );


/*  export {
        ObjectArray,
        DateTimeLocal,
        Decimal,
        ObjectId,
        generateRandomString,
        generateRandomNumber,
        generateRandomDate,
        generateRandomBoolean,
        generateRandomDecimal,
        generateRandomDateTimeLocal,
        generateRandomArray,
        generateRandomObjectArray,
        generateRandomObject,
        generateRandomObjectId,
        generateRandomValueForType,
        generateRandomData,
    };

    // export { ObjectArray, DateTimeLocal, Decimal, ObjectId }

    const generateRandomString = async ( length = 10 ) => {
        try {
            const response = await axios.get( `https://random-word-api.herokuapp.com/word?number=1` );
            return response.data[ 0 ];
        } catch ( error ) {
            console.error( "Error fetching random word:", error );
            return Math.random()
                .toString( 36 )
                .substring( 2, length + 2 );
        }
    };

    const generateRandomNumber = ( min = 0, max = 100 ) => {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    };

    const generateRandomDate = ( start = new Date( 1970, 0, 1 ), end = new Date() ) => {
        return new Date( start.getTime() + Math.random() * ( end.getTime() - start.getTime() ) );
    };

    const generateRandomBoolean = () => {
        return Math.random() < 0.5;
    };

    const generateRandomArray = async ( schema, length = 3 ) => {
        const result = [];
        for ( let i = 0; i < length; i++ ) {
            result.push( await generateRandomValueForType( schema.type[ 0 ] ) );
        }
        return result;
    };

    const generateRandomObject = async ( schema ) => {
        const result = {};
        for ( const [ key, value ] of Object.entries( schema.type ) ) {
            result[ key ] = await generateRandomValueForType( value );
        }
        return result;
    };

    const generateRandomValueForType = async ( schema ) => {
        switch ( schema.type ) {
            case String:
                if ( schema.enum ) {
                    return schema.enum[ Math.floor( Math.random() * schema.enum.length ) ];
                }
                return await generateRandomString();
            case Number:
                return generateRandomNumber( schema.min, schema.max );
            case Date:
                return generateRandomDate();
            case Boolean:
                return generateRandomBoolean();
            case Array:
                return generateRandomArray( schema );
            case Object:
                return generateRandomObject( schema );
            default:
                return null;
        }
    };

    export const generateRandomData = async ( schema ) => {
        const result = {};
        for ( const [ key, value ] of Object.entries( schema ) ) {
            result[ key ] = await generateRandomValueForType( value );
        }
        return result;
    }
*/
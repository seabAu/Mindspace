

export function reorder ( list, startIndex, endIndex ) {
    const result = Array.from( list );
    const [ removed ] = result.splice( startIndex, 1 );
    result.splice( endIndex, 0, removed );

    return result;
}


/**
 * Comprehensive array utility functions with robust error handling
 */

/**
 * Checks if a value is an array
 * @param {*} value - The value to check
 * @returns {boolean} - True if the value is an array, false otherwise
 */
export const isArray = ( value ) => {
    return Array.isArray( value );
};

/**
 * Checks if a value is a non-empty array
 * @param {*} value - The value to check
 * @returns {boolean} - True if the value is a non-empty array, false otherwise
 */
export const isNonEmptyArray = ( value ) => {
    return Array.isArray( value ) && value.length > 0;
};

/**
 * Safely gets an array (returns empty array if input is not an array)
 * @param {*} value - The value to convert to an array
 * @returns {Array} - The array or an empty array if input is invalid
 */
export const safeArray = ( value ) => {
    return Array.isArray( value ) ? value : [];
};

/**
 * Removes null, undefined, and invalid values from an array
 * @param {Array} array - The array to clean
 * @returns {Array} - The cleaned array
 */
export const cleanArray = ( array ) => {
    if ( !Array.isArray( array ) ) return [];
    return array.filter( item => item !== null && item !== undefined );
};

/**
 * Reorders an array by moving an item from one index to another
 * @param {Array} array - The array to reorder
 * @param {number} startIndex - The starting index of the item
 * @param {number} endIndex - The ending index where the item should be moved
 * @returns {Array} - The reordered array (new instance)
 */
export const reorderArray = ( array, startIndex, endIndex ) => {
    if ( !Array.isArray( array ) ) return [];

    // Create a copy of the array
    const result = [ ...array ];

    // Validate indices
    if (
        startIndex < 0 ||
        startIndex >= array.length ||
        endIndex < 0 ||
        endIndex >= array.length ||
        !Number.isInteger( startIndex ) ||
        !Number.isInteger( endIndex )
    ) {
        return result;
    }

    // Remove the item from the start position and insert at the end position
    const [ removed ] = result.splice( startIndex, 1 );
    result.splice( endIndex, 0, removed );

    return result;
};

/**
 * Adds an item to the end of an array
 * @param {Array} array - The array to add to
 * @param {*} item - The item to add
 * @returns {Array} - The new array with the item added (new instance)
 */
export const addItem = ( array, item ) => {
    if ( !Array.isArray( array ) ) return [ item ];
    return [ ...array, item ];
};

/**
 * Inserts an item at a specific index in an array
 * @param {Array} array - The array to insert into
 * @param {*} item - The item to insert
 * @param {number} index - The index to insert at
 * @returns {Array} - The new array with the item inserted (new instance)
 */
export const insertItem = ( array, item, index ) => {
    if ( !Array.isArray( array ) ) return [ item ];

    // Validate index
    const validIndex = !Number.isInteger( index ) || index < 0 ? 0 :
        index > array.length ? array.length : index;

    // Create a copy and insert the item
    const result = [ ...array ];
    result.splice( validIndex, 0, item );

    return result;
};

/**
 * Removes an item at a specific index from an array
 * @param {Array} array - The array to remove from
 * @param {number} index - The index to remove
 * @returns {Array} - The new array with the item removed (new instance)
 */
export const removeItem = ( array, index ) => {
    if ( !Array.isArray( array ) ) return [];

    // Validate index
    if (
        !Number.isInteger( index ) ||
        index < 0 ||
        index >= array.length
    ) {
        return [ ...array ];
    }

    // Create a copy and remove the item
    const result = [ ...array ];
    result.splice( index, 1 );

    return result;
};

/**
 * Removes specific items from an array based on a predicate function
 * @param {Array} array - The array to filter
 * @param {Function} predicate - Function that returns true for items to keep
 * @returns {Array} - The filtered array (new instance)
 */
export const removeWhere = ( array, predicate ) => {
    if ( !Array.isArray( array ) ) return [];
    if ( typeof predicate !== 'function' ) return [ ...array ];

    try {
        return array.filter( item => !predicate( item ) );
    } catch ( error ) {
        console.error( 'Error in removeWhere predicate:', error );
        return [ ...array ];
    }
};

/**
 * Gets the type of a value
 * @param {*} value - The value to check
 * @returns {string} - The type of the value
 */
export const getType = ( value ) => {
    if ( value === null ) return 'Null';
    if ( value === undefined ) return 'Undefined';
    if ( Array.isArray( value ) ) {
        if ( value.length === 0 ) return 'EmptyArray';
        if ( value.every( item => typeof item === 'object' && item !== null && !Array.isArray( item ) ) ) {
            return 'ObjectArray';
        }
        return 'Array';
    }

    const type = typeof value;
    return type.charAt( 0 ).toUpperCase() + type.slice( 1 );
};

/**
 * Gets the types of elements in an array
 * @param {Array} array - The array to analyze
 * @returns {Object} - Object containing type information
 */
export const getArrayElementTypes = ( array ) => {
    if ( !Array.isArray( array ) ) {
        return { isArray: false, types: [] };
    }

    if ( array.length === 0 ) {
        return { isArray: true, isEmpty: true, types: [] };
    }

    const types = [ ...new Set( array.map( item => getType( item ) ) ) ];

    return {
        isArray: true,
        isEmpty: false,
        length: array.length,
        types,
        isHomogeneous: types.length === 1,
        primaryType: types[ 0 ]
    };
};

/**
 * Chunks an array into smaller arrays of a specified size
 * @param {Array} array - The array to chunk
 * @param {number} size - The size of each chunk
 * @returns {Array} - Array of chunks
 */
export const chunkArray = ( array, size ) => {
    if ( !Array.isArray( array ) ) return [];

    const validSize = !Number.isInteger( size ) || size <= 0 ? 1 : size;
    const result = [];

    for ( let i = 0; i < array.length; i += validSize ) {
        result.push( array.slice( i, i + validSize ) );
    }

    return result;
};

/**
 * Creates a unique array by removing duplicate values
 * @param {Array} array - The array to deduplicate
 * @param {Function} [keyFn] - Optional function to generate keys for comparison
 * @returns {Array} - Array with duplicates removed
 */
export const uniqueArray = ( array, keyFn ) => {
    if ( !Array.isArray( array ) ) return [];

    if ( typeof keyFn === 'function' ) {
        const seen = new Set();
        return array.filter( item => {
            try {
                const key = keyFn( item );
                if ( seen.has( key ) ) return false;
                seen.add( key );
                return true;
            } catch ( error ) {
                console.error( 'Error in uniqueArray keyFn:', error );
                return false;
            }
        } );
    }

    return [ ...new Set( array ) ];
};

/**
 * Flattens a nested array structure
 * @param {Array} array - The array to flatten
 * @param {number} [depth=Infinity] - The maximum recursion depth
 * @returns {Array} - The flattened array
 */
export const flattenArray = ( array, depth = Infinity ) => {
    if ( !Array.isArray( array ) ) return [];

    const validDepth = !Number.isInteger( depth ) || depth < 0 ? Infinity : depth;

    try {
        return array.flat( validDepth );
    } catch ( error ) {
        // Fallback implementation for older environments
        if ( validDepth <= 0 ) return array.slice();

        return array.reduce( ( acc, item ) => {
            if ( Array.isArray( item ) && validDepth > 0 ) {
                return acc.concat( flattenArray( item, validDepth - 1 ) );
            }
            return acc.concat( item );
        }, [] );
    }
};

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array (new instance)
 */
export const shuffleArray = ( array ) => {
    if ( !Array.isArray( array ) ) return [];

    const result = [ ...array ];

    for ( let i = result.length - 1; i > 0; i-- ) {
        const j = Math.floor( Math.random() * ( i + 1 ) );
        [ result[ i ], result[ j ] ] = [ result[ j ], result[ i ] ];
    }

    return result;
};

/**
 * Groups array elements by a key
 * @param {Array} array - The array to group
 * @param {Function|string} keyFn - Function or property name to group by
 * @returns {Object} - Object with groups
 */
export const groupBy = ( array, keyFn ) => {
    if ( !Array.isArray( array ) ) return {};

    const getKey = typeof keyFn === 'function'
        ? keyFn
        : ( typeof keyFn === 'string' ? item => item?.[ keyFn ] : item => item );

    return array.reduce( ( result, item ) => {
        try {
            const key = getKey( item );
            // Skip items that produce invalid keys
            if ( key === null || key === undefined ) return result;

            if ( !result[ key ] ) {
                result[ key ] = [];
            }
            result[ key ].push( item );
            return result;
        } catch ( error ) {
            console.error( 'Error in groupBy:', error );
            return result;
        }
    }, {} );
};

/**
 * Finds the intersection of two or more arrays
 * @param {...Array} arrays - The arrays to intersect
 * @returns {Array} - Array containing elements present in all input arrays
 */
export const intersection = ( ...arrays ) => {
    const validArrays = arrays.filter( Array.isArray );

    if ( validArrays.length === 0 ) return [];
    if ( validArrays.length === 1 ) return [ ...validArrays[ 0 ] ];

    return validArrays.reduce( ( result, array ) => {
        return result.filter( item => array.includes( item ) );
    }, [ ...validArrays[ 0 ] ] );
};

/**
 * Creates a range array with numbers from start to end
 * @param {number} start - The start of the range
 * @param {number} end - The end of the range
 * @param {number} [step=1] - The step between numbers
 * @returns {Array} - The range array
 */
export const range = ( start, end, step = 1 ) => {
    // Validate inputs
    if ( !Number.isFinite( start ) || !Number.isFinite( end ) ) {
        return [];
    }

    const validStep = Number.isFinite( step ) && step !== 0 ? step : 1;
    const length = Math.max( Math.ceil( ( end - start ) / validStep ), 0 );

    return Array.from( { length }, ( _, i ) => start + i * validStep );
};

/**
 * Merges multiple arrays together
 * @param {...Array} arrays - The arrays to zip
 * @returns {Array} - Array of arrays where each sub-array contains elements from each input array
 */
export const merge = ( ...arrays ) => {
    const validArrays = arrays.filter( Array.isArray );

    if ( validArrays.length === 0 ) return [];

    const minLength = Math.min( ...validArrays.map( arr => arr.length ) );
    const result = [];

    for ( let i = 0; i < minLength; i++ ) {
        result.push( validArrays.map( arr => arr[ i ] ) );
    }

    return result;
};

// // Test the functions
// const testArray = [ 1, 2, 3, 4, 5 ];
// const mixedArray = [ 1, "string", { key: "value" }, [ 1, 2 ], null, undefined ];

// console.log( "isArray:", isArray( testArray ) );
// console.log( "isNonEmptyArray:", isNonEmptyArray( testArray ) );
// console.log( "cleanArray:", cleanArray( mixedArray ) );
// console.log( "reorderArray:", reorderArray( testArray, 0, 2 ) );
// console.log( "addItem:", addItem( testArray, 6 ) );
// console.log( "insertItem:", insertItem( testArray, 0, 2 ) );
// console.log( "removeItem:", removeItem( testArray, 2 ) );
// console.log( "getArrayElementTypes:", getArrayElementTypes( mixedArray ) );
// console.log( "chunkArray:", chunkArray( testArray, 2 ) );
// console.log( "uniqueArray:", uniqueArray( [ 1, 2, 2, 3, 4, 4, 5 ] ) );
// console.log( "flattenArray:", flattenArray( [ 1, [ 2, [ 3, 4 ], 5 ] ] ) );
// console.log( "shuffleArray:", shuffleArray( testArray ) );
// console.log( "groupBy:", groupBy( [
//     { name: "Alice", age: 25 },
//     { name: "Bob", age: 30 },
//     { name: "Charlie", age: 25 }
// ], "age" ) );
// console.log( "intersection:", intersection( [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ) );
// console.log( "range:", range( 1, 10, 2 ) );
// console.log( "zip:", zip( [ 1, 2, 3 ], [ 'a', 'b', 'c' ], [ true, false, true ] ) );



export function list ( items ) {
    return items.map( ( key ) => `'${ key }'` ).join( ', ' );
}

export function listKeys ( obj ) {
    return list( Object.keys( obj ) );
}

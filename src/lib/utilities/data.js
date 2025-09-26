// Utility functions centered around providing helpers for managing and transforming data related to databases, particularly MongoDB / Mongoose setups.
import * as utils from "akashatools";
import { DateTimeLocal } from "../config/types";
// import { ObjectId } from 'bson';
const debug = false;

/**
 * Utility functions for data validation and manipulation
 */

/**
 * Checks if a value is considered invalid (null, undefined, empty array, empty object, empty string)
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is invalid, false otherwise
 */

export const invalid = ( value ) => {
    // Check for null or undefined
    if ( value === null || value === undefined ) {
        return true;
    }

    // Check for empty string
    if ( typeof value === "string" && value.trim() === "" ) {
        return true;
    }

    // Check for empty array
    if ( Array.isArray( value ) && value.length === 0 ) {
        return true;
    }

    // Check for empty object (but not Date, RegExp, etc.)
    if ( typeof value === "object" && value.constructor === Object && Object.keys( value ).length === 0 ) {
        return true;
    }

    // Check for NaN
    if ( typeof value === "number" && isNaN( value ) ) {
        return true;
    }

    return false;
};

/**
 * Checks if a value is valid (opposite of isInvalid)
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is valid, false otherwise
 */
export const isValid = ( value ) => {
    return !isInvalid( value );
};

/**
 * Safely gets a nested property from an object
 * @param {Object} obj - The object to get the property from
 * @param {string} path - The dot-separated path to the property
 * @param {*} defaultValue - The default value to return if the property doesn't exist
 * @returns {*} The property value or default value
 */
export const safeGet = ( obj, path, defaultValue = null ) => {
    if ( !obj || typeof obj !== "object" ) {
        return defaultValue;
    }

    const keys = path.split( "." );
    let current = obj;

    for ( const key of keys ) {
        if ( current === null || current === undefined || !( key in current ) ) {
            return defaultValue;
        }
        current = current[ key ];
    }

    return current;
};

/**
 * Checks if an array contains valid data
 * @param {Array} arr - The array to check
 * @param {boolean} checkElements - Whether to check if elements are valid too
 * @returns {boolean} True if array is valid and optionally has valid elements
 */
export const isValidArray = ( arr, checkElements = false ) => {
    if ( !Array.isArray( arr ) || arr.length === 0 ) {
        return false;
    }

    if ( checkElements ) {
        return arr.every( ( element ) => isValid( element ) );
    }

    return true;
};

export const isObjectId = ( id ) => {
    const regexExp = /^[0-9a-fA-F]{24}$/;
    if ( regexExp.test( id ) ) return true;
    return false;
};

export const getDocumentById = ( data = [], id = '', returnFieldName ) => {
    let doc = null;
    if ( data && Array.isArray( data ) && data.length > 0 ) {
        doc = data.find( ( item ) => ( item?._id || item?.id === id ) );
    }
    return doc;
};

export const cleanDocument = ( data ) => {
    let dataTemp = { ...data };
    if ( utils.val.isObject( data ) ) {
        dataTemp = utils.ao.filterKeys( data, [ "_id" ] );
    }
    return dataTemp;
};

export const isArrSafe = ( arr = [] ) => (
    arr && Array.isArray( arr )
        ? ( arr.length > 0
            ? ( arr )
            : ( [] )
        )
        : ( [] )
);

export const arrSafeTernary = ( arr = [], fallback = [] ) => (
    isArrSafe( arr ) ? arr : fallback
);

export const arrSafeTernaryPair = ( arr = [], option1 = [], option2 = [] ) => (
    isArrSafe( arr ) ? option1 : option2
);

export const isObjectHasSafe = ( value, checkKey = '', fallbackValue = '' ) => (
    value
        && utils.val.isObject( value )
        && value?.hasOwnProperty( checkKey )
        && utils.val.isDefined( value?.[ checkKey ] )
        ? value?.[ checkKey ]
        : fallbackValue
);

export const isEmptyArr = ( value ) => ( ( Array.isArray( value ) && value.length === 0 ) );
export const isEmptyStr = ( value ) => ( ( typeof value === "string" && value.trim() === "" ) );

export const isInvalid = ( value ) => {
    if ( value === null || typeof value === "undefined" ) {
        return true;
    }
    if ( isEmptyStr( value ) ) {
        return true;
    }
    if ( isEmptyArr( value ) ) {
        return true;
    }
    // For objects, you might want to check for empty keys, but for this use case,
    // we'll consider an empty object `{}` as valid unless specified otherwise.
    return false;
};


/*  // Example usage:
    const nestedObject = {
        a: {
            b: {
                c: [
                    { thisisthekey: "value1" },
                    { thisisthekey: "value2" },
                    { thisisthekey: "value3" }
                ]
            }
        }
    };

    deepSet( nestedObject, "a.b.c[1]", "thisisthekey", "newValue" );
    console.log( JSON.stringify( nestedObject, null, 2 ) );
*/
export const arrayToString = ( value ) => (
    value && utils.val.isDefined( value )
        ? ( utils.val.isValidArray( value, true )
            // Already is an array, join then split to clean up.
            ? ( value?.join( ' ' )?.split( ', ' ).join( ', ' ) )
            // Not an array, but join it anyways. 
            : ( utils.val.isString( value )
                ? value?.split( '|' )?.join( ' ' )
                : ( '' ) ) )
        : ( 'N/A' )
);

export const stringToArray = ( value = '', separator = '|' ) => (
    value && utils.val.isDefined( value ) && utils.val.isString( value )
        ? ( value
            // ?.split( ',' )
            // ?.join( ' ' )
            ?.split( ' ' )
            ?.join( separator )
            ?.split( separator ) )
        : ( value )
);

// Function to deeply set a value in a nested object or array structure
/**
 * Recursively sets a value in a nested object or array structure at a specified path. 
 * Handles objects, arrays, and arrays of objects, even at arbitrary nested depths.
 * Supports string paths with dot notation and array indices enclosed in brackets (e.g., "a.b.c[2]").
 * The last item in the path array is used as the key/index to set the value.
 * 
 * @param {object} object The object or array to modify.
 * @param {string|array} path The path to the property to set. Can be an array or a string with dot/bracket notation.
 * @param {*} value The value to set at the specified path.
 * @returns {boolean} True if the value was successfully set, false otherwise.
 */
export function deepPathSet ( object, path, value ) {
    // Helper function to parse the string path into an array
    if ( debug === true ) console.log( "deepPathSet :: object = ", object, " :: ", "path = ", path, " :: ", "value = ", value );
    // function parsePath ( path ) {
    //     if ( Array.isArray( path ) ) {
    //         return path;
    //     }
    //     return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
    //         return isNaN( segment ) ? segment : Number( segment );
    //     } );
    // }
    // Helper function to parse the string path into an array
    function parsePath ( path ) {
        if ( Array.isArray( path ) ) {
            return path;
        }

        if ( utils.val.isString( path ) ) {
            return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
                return isNaN( segment ) ? segment : Number( segment );
            } );
        }
        else if ( utils.val.isNumber( path ) ) {
            // Given a number, likely an index, for some reason.
            return [ Number( path ) ];
        }
    }


    // Recursive function to navigate the object and set the value
    function recursiveSet ( obj, pathArray, value ) {
        if ( !obj || typeof obj !== 'object' ) {
            // return false; // If obj is not an object or array, return false
            if ( debug === true ) console.log( "deepPathSet :: not an object. :: obj = ", obj );
            return obj;
        }

        // Base case: If the pathArray has one element left, set the value
        // if ( pathArray.length === 1 ) {
        //     const key = pathArray[ 0 ];
        //     if ( Array.isArray( obj ) && typeof key === 'number' && obj.length > key ) {
        //         console.log( "deepPathSet :: Key is a number: ", key );
        //         obj[ key ] = value;
        //         // return true;
        //         return obj;
        //     } else if ( obj.hasOwnProperty( key ) ) {
        //         console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: obj = ", obj );
        //         obj[ key ] = value;
        //         // return true;
        //         return obj;
        //     }
        //     // return false;
        //     return obj;
        // }

        // Base case: If the pathArray is empty, set the key-value pair
        if ( pathArray.length === 1 ) {
            const key = pathArray[ 0 ];
            if ( debug === true ) console.log( "deepPathSet :: pathArray has 1 item left", " :: ", "key = ", key, " :: ", "obj = ", obj, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
            // if ( Array.isArray( obj ) ) {
            if ( utils.val.isValidArray( obj, true ) ) {
                if ( debug === true ) console.log( "deepPathSet :: obj is a valid array :: obj = ", obj, " :: ", "key = ", key );
                if ( typeof key === 'number' && obj.length >= key ) {
                    console.log( "deepPathSet :: Key is a number: ", key );
                    if ( obj.hasOwnProperty( key ) ) {
                        // Index exists, replace its value.
                        obj[ key ] = value;
                        return obj;
                    }
                    else {
                        // Index does not exist, append it.
                        obj = [
                            ...obj,
                            value
                        ];
                        return obj;
                    }
                }
                if ( debug === true ) console.log( "deepPathSet :: Test :: key is not a number or obj.length !>= key (else statement) :: obj = ", obj, " :: ", "key = ", key, " :: ", "value = ", value );
            }
            else if ( utils.val.isObject( obj ) ) {
                if ( debug === true ) console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: obj = ", obj, " :: ", "key = ", key, );
                if ( obj.hasOwnProperty( key ) ) {
                    // Key exists, replace its value.
                    if ( debug === true )
                        console.log( "deepPathSet :: Test :: item.hasOwnProperty :: obj = ", obj, " :: ", "key = ", key, " :: ", "value = ", value );
                    obj[ key ] = value;
                    // return true;
                    return obj;
                }
                else {
                    // Key does not exist, append it. 
                    // obj = {
                    //     ...obj,
                    //     [ key ]: value
                    // };
                    obj[ key ] = value;
                    return obj;
                }
                obj[ key ] = value;
                if ( debug === true ) console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: AFTER :: obj = ", obj, " :: ", "obj[ key ] = ", obj[ key ], " :: ", "key = ", key );
                // return true;
                return obj;
            }
            else {
            }
            // return false;
            return obj;
        }
        // else if ( pathArray.length === 0 && ( key === undefined || key === '' || key === null || key === false ) ) {
        //     console.log( "deepPathSet :: Test :: path is down to 1 item, and the key is not given. pathArray = ", pathArray, " :: ", "obj = ", obj, " :: ", "value = ", value );
        //     return recursiveSet( obj, [], pathArray[ 0 ], value );
        // }

        // Recursive case: Navigate deeper based on the first path segment
        const currentSegment = pathArray[ 0 ];

        if ( Array.isArray( obj ) ) {
            // Handle arrays
            if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is an array: obj = ", obj, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value, " :: ", "currentSegment = ", currentSegment );
            if ( typeof currentSegment === 'number' && obj.hasOwnProperty( currentSegment ) ) {
                if ( debug === true ) console.log( "deepPathSet :: Path recursion :: Current path segment is a number, so array index:", " :: ", "obj = ", obj, " :: ", "obj[currentSegment] = ", obj[ currentSegment ], " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                // return {
                //     ...obj,
                //     [ currentSegment ]: recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value )
                // };
                // return [
                //     ...obj,
                //     // [ currentSegment ]: recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value )
                //     recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value )
                // ];
                let result = recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
                if ( result ) {
                    obj[ currentSegment ] = result;
                }
                else {
                    obj[ currentSegment ] = result;
                }
                return obj;
                // return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
            }
            else {
                if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is not an array :: ", "obj = ", obj, " :: ", "obj[currentSegment] = ", obj[ currentSegment ], " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                for ( let item of obj ) {
                    // if ( recursiveSet( item, pathArray, value ) ) {
                    // return true;
                    return recursiveSet( obj[ item ], pathArray.slice( 1 ), value );
                    return {
                        ...obj,
                        [ currentSegment ]: recursiveSet( item, pathArray, value )
                    };
                    // }
                }
            }
        }
        else if ( utils.val.isObject( obj ) && obj.hasOwnProperty( currentSegment ) ) {
            // Object. And it has the current segment as a key. Go a level deeper.
            if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is an object: obj = ", obj, " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
            obj[ currentSegment ] = recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
            return obj;
            // return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
        }

        // return false; // Key not found
        return obj;
    }

    // Handle edge case: If path is not provided, return false
    if ( !path ) {
        // return false;
        return obj;
    }

    // const pathArray = parsePath( path );
    // return recursiveSet( object, pathArray, value );

    const pathArray = parsePath( path );
    let inputObj;
    if ( utils.val.isValidArray( object, true ) ) {
        inputObj = [ ...object ];
    }
    else if ( utils.val.isObject( object ) ) {
        inputObj = { ...object };
    }
    let result = recursiveSet( inputObj, pathArray, value );
    if ( debug === true ) console.log( "deepPathSet :: result after full process: ", result, " :: ", "inputObj = ", inputObj, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
    // return recursiveSet( inputObj, pathArray, key, value );
    return result;

}


export function deepPathSetWorking ( object, path, value ) {
    // Helper function to parse the string path into an array
    if ( debug === true ) console.log( "deepPathSet :: object = ", object, " :: ", "path = ", path, " :: ", "value = ", value );
    // function parsePath ( path ) {
    //     if ( Array.isArray( path ) ) {
    //         return path;
    //     }
    //     return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
    //         return isNaN( segment ) ? segment : Number( segment );
    //     } );
    // }
    // Helper function to parse the string path into an array
    function parsePath ( path ) {
        if ( Array.isArray( path ) ) {
            return path;
        }

        if ( utils.val.isString( path ) ) {
            return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
                return isNaN( segment ) ? segment : Number( segment );
            } );
        }
        else if ( utils.val.isNumber( path ) ) {
            // Given a number, likely an index, for some reason.
            return [ Number( path ) ];
        }
    }


    // Recursive function to navigate the object and set the value
    function recursiveSet ( obj, pathArray, value ) {
        if ( !obj || typeof obj !== 'object' ) {
            // return false; // If obj is not an object or array, return false
            if ( debug === true )
                console.log( "deepPathSet :: not an object. :: obj = ", obj );
            return obj;
        }

        // Base case: If the pathArray has one element left, set the value
        // if ( pathArray.length === 1 ) {
        //     const key = pathArray[ 0 ];
        //     if ( Array.isArray( obj ) && typeof key === 'number' && obj.length > key ) {
        //         console.log( "deepPathSet :: Key is a number: ", key );
        //         obj[ key ] = value;
        //         // return true;
        //         return obj;
        //     } else if ( obj.hasOwnProperty( key ) ) {
        //         console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: obj = ", obj );
        //         obj[ key ] = value;
        //         // return true;
        //         return obj;
        //     }
        //     // return false;
        //     return obj;
        // }

        // Base case: If the pathArray is empty, set the key-value pair
        if ( pathArray.length === 1 ) {
            const key = pathArray[ 0 ];
            if ( debug === true ) console.log( "deepPathSet :: pathArray has 1 item left: ", key, " :: ", "obj = ", obj, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
            // if ( Array.isArray( obj ) ) {
            if ( utils.val.isValidArray( obj, true ) ) {
                if ( debug === true ) console.log( "deepPathSet :: obj is a valid array :: obj = ", obj );
                if ( typeof key === 'number' && obj.length >= key ) {
                    if ( debug === true ) console.log( "deepPathSet :: Key is a number: ", key );
                    if ( obj.hasOwnProperty( key ) ) {
                        // Index exists, replace its value.
                        obj[ key ] = value;
                        return obj;
                    }
                    else {
                        // Index does not exist, append it.
                        obj = [
                            ...obj,
                            value
                        ];
                        return obj;
                    }
                }
                else {
                    // for ( const item of obj ) {
                    if ( debug === true ) console.log( "deepPathSet :: Test :: key is not a number or obj.length !>= key (else statement) :: obj = ", obj, " :: ", "key = ", key, " :: ", "value = ", value );
                    if ( obj && obj.hasOwnProperty( key ) ) {
                        // Key exists, replace its value.
                        if ( debug === true ) console.log( "deepPathSet :: Test :: item.hasOwnProperty :: obj = ", obj, " :: ", "key = ", key, " :: ", "value = ", value );
                        obj[ key ] = value;
                        // return true;
                        return obj;
                    }
                    else {
                        // Key does not exist, append it. 
                        obj = {
                            ...obj,
                            [ key ]: value
                        };
                        return obj;
                    }
                    // }
                }
            }
            else if ( utils.val.isObject( obj ) && obj.hasOwnProperty( key ) ) {
                if ( debug === true ) console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: obj = ", obj, " :: ", "key = ", key, );
                obj[ key ] = value;
                // return true;
                if ( debug === true ) console.log( "deepPathSet :: Test :: obj.hasOwnProperty :: AFTER :: obj = ", obj, " :: ", "obj[ key ] = ", obj[ key ], " :: ", "key = ", key );
                return obj;
            }
            // return false;
            return obj;
        }
        // else if ( pathArray.length === 0 && ( key === undefined || key === '' || key === null || key === false ) ) {
        //     console.log( "deepPathSet :: Test :: path is down to 1 item, and the key is not given. pathArray = ", pathArray, " :: ", "obj = ", obj, " :: ", "value = ", value );
        //     return recursiveSet( obj, [], pathArray[ 0 ], value );
        // }

        // Recursive case: Navigate deeper based on the first path segment
        const currentSegment = pathArray[ 0 ];

        if ( Array.isArray( obj ) ) {
            // Handle arrays
            if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is an array: obj = ", obj, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value, " :: ", "currentSegment = ", currentSegment );
            if ( typeof currentSegment === 'number' && obj.hasOwnProperty( currentSegment ) ) {
                if ( debug === true ) console.log( "deepPathSet :: Path recursion :: Current path segment is a number, so array index:", " :: ", "obj = ", obj, " :: ", "obj[currentSegment] = ", obj[ currentSegment ], " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                return {
                    ...obj,
                    [ currentSegment ]: recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value )
                };
                // return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
            }
            else {
                if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is not an array :: ", "obj = ", obj, " :: ", "obj[currentSegment] = ", obj[ currentSegment ], " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                for ( let item of obj ) {
                    // if ( recursiveSet( item, pathArray, value ) ) {
                    // return true;
                    return recursiveSet( obj[ item ], pathArray.slice( 1 ), value );
                    return {
                        ...obj,
                        [ currentSegment ]: recursiveSet( item, pathArray, value )
                    };
                    // }
                }
            }
        }
        else if ( utils.val.isObject( obj ) && obj.hasOwnProperty( currentSegment ) ) {
            // Object. And it has the current segment as a key. Go a level deeper.
            if ( debug === true ) console.log( "deepPathSet :: Path recursion :: object is an object: obj = ", obj, " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
            obj[ currentSegment ] = recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
            return obj;
            // return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), value );
        }

        // return false; // Key not found
        return obj;
    }

    // Handle edge case: If path is not provided, return false
    if ( !path ) {
        // return false;
        return obj;
    }

    // const pathArray = parsePath( path );
    // return recursiveSet( object, pathArray, value );

    const pathArray = parsePath( path );
    let inputObj = { ...object };
    let result = recursiveSet( inputObj, pathArray, value );
    if ( debug === true ) console.log( "deepPathSet :: result after full process: ", result, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
    // return recursiveSet( inputObj, pathArray, key, value );
    return result;

}


/**
 * Recursively sets a value in a nested object or array structure at a specified path. 
 * Handles objects, arrays, and arrays of objects, even at arbitrary nested depths.
 * Supports string paths with dot notation and array indices enclosed in brackets (e.g., "a.b.c[2].key").
 * If no path is provided, performs a broad search to locate the specified key and set its value.
 * 
 * @param {object} object The object or array to modify.
 * @param {string|array} path The path to the property to set. Can be an array or a string with dot/bracket notation.
 * @param {string} key The name of the key to search for.
 * @param {*} value The value to set at the specified path.
 * @returns {boolean} True if the value was successfully set, false otherwise.
 */

export function deepSet ( object, path, key, value ) {
    if ( debug === true ) console.log( "deepSet :: object = ", object, " :: ", "path = ", path, " :: ", "key = ", key, " :: ", "value = ", value );
    // Helper function to parse the string path into an array
    function parsePath ( path ) {
        if ( Array.isArray( path ) ) {
            return path;
        }

        if ( utils.val.isString( path ) ) {
            return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
                return isNaN( segment ) ? segment : Number( segment );
            } );
        }
        else if ( utils.val.isNumber( path ) ) {
            // Given a number, likely an index, for some reason.
            return [ Number( path ) ];
        }
    }

    // Recursive function to navigate the object and set the value
    function recursiveSet ( obj, pathArray, key, value ) {
        if ( !obj || typeof obj !== 'object' ) {
            return obj; // If obj is not an object or array, return false
        }

        // Base case: If the pathArray is empty, set the key-value pair
        if ( pathArray.length === 0 ) {
            if ( Array.isArray( obj ) ) {
                if ( typeof key === 'number' && obj.length > key ) {
                    if ( debug === true ) console.log( "deepSet :: Key is a number: ", key );
                    return obj[ key ] = value;
                }
                else {
                    for ( const item of obj ) {
                        if ( item && item.hasOwnProperty( key ) ) {
                            if ( debug === true ) console.log( "deepSet :: Test :: item.hasOwnProperty :: item = ", item );
                            item[ key ] = value;
                            // return true;
                            return item;
                        }
                    }
                }
            } else if ( obj.hasOwnProperty( key ) ) {
                if ( debug === true )
                    console.log( "deepSet :: Test :: obj.hasOwnProperty :: obj = ", obj );
                obj[ key ] = value;
                // return true;
                return obj;
            }
            // return false;
            return obj;
        }
        else if ( pathArray.length === 1 && ( key === undefined || key === '' || key === null || key === false ) ) {
            if ( debug === true )
                console.log( "Test :: path is down to 1 item, and the key is not given. pathArray = ", pathArray, " :: ", "key = ", key, " :: ", "obj = ", obj, " :: ", "value = ", value );
            return recursiveSet( obj, [], pathArray[ 0 ], value );
        }

        // Recursive case: Navigate deeper based on the first path segment
        const currentSegment = pathArray[ 0 ];

        if ( Array.isArray( obj ) ) {
            // Handle arrays
            if ( debug === true ) console.log( "deepSet :: Path recursion :: object is an array: obj = ", obj, " :: ", "currentSegment = ", currentSegment );
            if ( pathArray && ( key === undefined || key === '' || key === null || key === false ) ) {
                // Case where path is down to 1 item, and the key is not given; assume the last path item is the key we want. 
                if ( debug === true ) console.log( "Test :: path is down to 1 item, and the key is not given. pathArray = ", pathArray, " :: ", "key = ", key, " :: ", "obj = ", obj, " :: ", "currentSegment = ", currentSegment, " :: ", "value = ", value );
            }
            if ( typeof currentSegment === 'number' && obj[ currentSegment ] ) {
                // Current path segment is a number, so array index.
                if ( debug === true ) console.log( "deepSet :: Path recursion :: Current path segment is a number, so array index: obj = ", obj, " :: ", "obj[currentSegment] = ", obj[ currentSegment ], " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), key, value );
            } else {
                // Current path segment is a string, so object key.
                for ( const item of obj ) {
                    if ( debug === true ) console.log( "deepSet :: Path recursion :: Current path segment is a string, so object key: obj = ", obj, " :: ", "item = ", item, " :: ", "currentSegment = ", currentSegment, " :: ", "pathArray = ", pathArray, " :: ", "value = ", value );
                    if ( recursiveSet( item, pathArray, key, value ) ) {
                        // return true;
                        return recursiveSet( item, pathArray, key, value );
                    }
                }
            }
        }
        else if ( obj.hasOwnProperty( currentSegment ) ) {
            // Handle objects.
            if ( debug === true )
                console.log( "deepSet :: Path recursion :: object is an object: obj = ", obj, " :: ", "currentSegment = ", currentSegment, " :: ", "value = ", value );
            return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), key, value );
        }

        // return false; // Key not found
        return obj;
    }

    // Handle edge case: If path is not provided, perform a broad search
    if ( !path ) {
        return recursiveSet( object, [], key, value );
    }

    const pathArray = parsePath( path );
    let inputObj = { ...object };
    let result = recursiveSet( inputObj, pathArray, key, value );
    if ( debug === true ) console.log( "deepSet :: result after full process: ", result );
    // return recursiveSet( inputObj, pathArray, key, value );
    return result;
}

export function deepSet2 ( object, path, key, value ) {
    if ( debug === true )
        console.log( "deepSet :: object = ", object, " :: ", "path = ", path, " :: ", "key = ", key, " :: ", "value = ", value );
    // Helper function to parse the string path into an array
    function parsePath ( path ) {
        if ( Array.isArray( path ) ) {
            return path;
        }
        return path.split( /\.(?![^\[]*\])|\[(\d+)\]/ ).filter( Boolean ).map( segment => {
            return isNaN( segment ) ? segment : Number( segment );
        } );
    }

    // Recursive function to navigate the object and set the value
    function recursiveSet ( obj, pathArray, key, value ) {
        if ( !obj || typeof obj !== 'object' ) {
            return false; // If obj is not an object or array, return false
        }

        // Base case: If the pathArray is empty, set the key-value pair
        if ( pathArray.length === 0 ) {
            if ( Array.isArray( obj ) ) {
                for ( const item of obj ) {
                    if ( item && item.hasOwnProperty( key ) ) {
                        item[ key ] = value;
                        return true;
                    }
                }
            } else if ( obj.hasOwnProperty( key ) ) {
                obj[ key ] = value;
                return true;
            }
            return false;
        }

        // Recursive case: Navigate deeper based on the first path segment
        const currentSegment = pathArray[ 0 ];

        if ( Array.isArray( obj ) ) {
            // Handle arrays
            if ( typeof currentSegment === 'number' && obj[ currentSegment ] ) {
                return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), key, value );
            } else {
                for ( const item of obj ) {
                    if ( recursiveSet( item, pathArray, key, value ) ) {
                        return true;
                    }
                }
            }
        } else if ( obj.hasOwnProperty( currentSegment ) ) {
            return recursiveSet( obj[ currentSegment ], pathArray.slice( 1 ), key, value );
        }

        return false; // Key not found
    }

    // Handle edge case: If path is not provided, perform a broad search
    if ( !path ) {
        return recursiveSet( object, [], key, value );
    }

    const pathArray = parsePath( path );
    let result = recursiveSet( object, pathArray, key, value );
    if ( debug === true )
        console.log( "deepSet :: result after full process: ", result );
    return result;
}


// Source: https://1loc.dev/random/generate-a-random-string-from-given-characters/
// Example call: generateString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
export const generateString = ( length, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) =>
    Array( length )
        .fill( "" )
        .map( ( v ) => chars[ Math.floor( Math.random() * chars.length ) ] )
        .join( "" );

export const setNestedValue = ( obj, path, value ) => {
    if ( !obj || typeof obj !== "object" ) { return obj; }
    const keys = path.split( "." );
    const lastKey = keys.pop();
    const lastObj = keys.reduce( ( acc, key ) => {
        if ( acc[ key ] === undefined ) { acc[ key ] = {}; }
        return acc[ key ];
    }, obj );
    lastObj[ lastKey ] = value;
    return { ...obj };
};

export const getNestedValue = ( obj, path ) => {
    if ( !obj || typeof obj !== "object" ) { return undefined; }
    return path.split( "." ).reduce( ( acc, part ) => acc && acc[ part ], obj );
};

export const getDefaultValueForType = ( type ) => {
    switch ( type ) {
        case String:
            return "";
        case Number:
            return 0;
        case Date:
            return new Date();
        case Boolean:
            return false;
        case Array:
            return [];
        case Object:
            return {};
        default:
            return null;
    }
};

export const getType = ( value ) => {
    // More useful version of vanilla javascript's typeof.
    // Somewhat specialized to my applications as I deal with a lot of dynamic element construction based on the types of data passed in, but this can be expended.
    if ( value === undefined ) {
        return "undefined";
    } else if ( value === null ) {
        return "null";
    } else if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        if ( utils.val.isValidArray( value, true ) ) {
            // An array of what?
            let test = value[ 0 ];
            // Get the datatype of the array's element to see if it's a scalar array or object array.
            return `[${ getType( test ) }]`;
        } else {
            return "array";
        }
        // Value is a nested object array.
    } else if ( utils.val.isObject( value ) && !utils.val.isArray( value ) ) {
        // Value is an object.
        return "object";
    } else {
        // Value is a scalar of some kind. Dig into the specific type.
        if ( typeof value === "string" ) {
            // Value is a String.
            return "string";
        } else if ( utils.val.isNumber( value ) ) {
            // Value is a Number.
            return "number";
        } else if ( value === true || value === false ) {
            // Value is a Boolean.
            return "boolean";
        } else {
            return "invalid";
        }
    }
};

export const getValueType = ( value ) => {
    // More useful version of vanilla javascript's typeof.
    // Somewhat specialized to my applications as I deal with a lot of dynamic element construction based on the types of data passed in, but this can be expended.
    if ( value === undefined ) {
        return "undefined";
    }
    else if ( value === null ) {
        return "null";
    }
    else if ( value instanceof Date ) {
        // Date type value. 
        return "Date";
    }
    else if ( value instanceof DateTimeLocal ) {
        return "DateTimeLocal";
    }
    else if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        if ( utils.val.isValidArray( value, true ) ) {
            // An array of what?
            let test = value[ 0 ];
            // Get the datatype of the array's element to see if it's a scalar array or object array.
            return `[${ getType( test ) }]`;
        }
        else {
            return "Array";
        }
        // Value is a nested object array.
    }
    else if ( utils.val.isObject( value ) && !utils.val.isArray( value ) ) {
        // Value is an object.
        return "Object";
    } else {
        // Value is a scalar of some kind. Dig into the specific type.
        if ( typeof value === "string" ) {
            // Value is a String.
            return "String";
        }
        else if ( utils.val.isNumber( value ) ) {
            // Value is a Number.
            return "Number";
        }
        else if ( value === true || value === false || value === "true" || value === "false" ) {
            // Value is a Boolean.
            return "Boolean";
        } else {
            return "invalid";
        }
    }
};

export const getFieldType = ( value ) => {
    // More useful version of vanilla javascript's typeof.
    if ( value === undefined ) {
        return 'undefined';
    }
    else if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        if ( utils.val.isValidArray( value, true ) ) {
            let test = value[ 0 ];
            // Get the datatype of the array's element to see if it's a scalar array or object array.
            if ( typeof test === "object" ) {
                // Value is an array of nested objects.
                // return "list";
                return "data";
            } else if ( Array.isArray( test ) ) {
                // Value is an array of arrays.
                // return "list";
                return "data";
            } else if ( [ "string", "number", "boolean" ].includes( typeof test ) ) {
                // zValue is an array of scalars.
                return getFieldType( test );
            }
        } else {
            // Value is an empty array, but an array nonetheless.
            return "array";
        }
        // Value is a nested object array.
    } else if ( utils.val.isObject( value ) && !utils.val.isArray( value ) ) {
        // Value is an object.
        return "data";
    } else {
        // Value is a scalar of some kind. Dig into the specific type.
        // if (utils.val.isString(value)) {
        if ( typeof value === "string" ) {
            // Value is a String.
            return "text";
        } else if ( utils.val.isNumber( value ) ) {
            // Value is a Number.
            return "number";
            // } else if (utils.val.isBool(value)) {
        } else if ( value === true || value === false || value === "true" || value === "false" ) {
            // Value is a Boolean.
            return "checkbox";
        } else {
            // I dunno lol.
            // return '';
            return "invalid";
        }
    }
};


export const getArrayType = ( value ) => {
    let type;
    // Test the types of a given array and return what type of an array this is.
    if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        type = "array";
        if ( utils.val.isValidArray( value, true ) ) {
            // An array of what?
            let subtype;
            value.forEach( ( element, index ) => {
                let elementType = getType( element );
                if ( !subtype ) { subtype = elementType; }
                else if ( subtype ) {
                    if ( subtype !== "mixed" ) {
                        if ( elementType !== subtype ) {
                            subtype = "mixed";
                        }
                    }
                }
            } );
            return `[${ getType( test ) }]`;
        } else {
            return "array";
        }
        // Value is a nested object array.
    } else {
        // Value is not an array.
        type = "";
    }
    return type;
};


export const formatInputValue = ( e, fieldType = 'text' ) => {
    // if ( debug === true) console.log("utils.val.formatInputValue", "\n :: e = ", e, "\n :: fieldType = ", fieldType, );
    // Function exclusively for handling form inputs.
    return fieldType === `checkbox`
        ? e.target.checked
            ? e.target.checked === true
            : false
        : fieldType === `number`
            ? parseInt( e.target.value )
            : fieldType === `text`
                ? e.target.value
                : fieldType === `select` ? e
                    : fieldType === `date` ? ( new Date( e.target.value.split( "-" ) ).getTime() ) : e.target.value;
};

export const initializeModel = ( input ) => {
    // console.log("Data.js :: initializeModel() :: input = ", input);
    let model;

    if ( utils.val.isValidArray( input, true ) ) {
        model = utils.ao.cleanJSON( input[ 0 ] );
    } else if ( utils.val.isObject( input ) ) {
        model = utils.ao.cleanJSON( input );
    }
    // console.log("Data.js :: initializeModel() :: model: ", model);
    return model;
};

// Source: https://masteringjs.io/tutorials/fundamentals/enum
export function arrayToEnum ( input ) {
    const enumObject = {};
    for ( const val of input ) {
        enumObject[ val ] = val;
    }
    return Object.freeze( enumObject );
}

export const typeToInitialDefault = ( type, defaultValue ) => {
    // if (debug) console.log("Utils.data.typeToInitialDefault :: type = ", type, " :: defaultValue = ", defaultValue);


    return defaultValue
        ? defaultValue
        : type === "string"
            ? ""
            : type === "number"
                ? 0
                : type === "boolean"
                    ? false
                    : type === "date"
                        ? Date.now()
                        : type === "objectid"
                            ? {
                                _id: "",
                            }
                            : type === "object"
                                ? {}
                                : type === "array"
                                    ? []
                                    : type.includes( "[" ) && type.includes( "]" ) // type === "[string]"
                                        ? `[${ typeToInitialDefault( utils.str.replaceMultiple( type, { "[": "", "]": "" } ) ) }]`
                                        : // ? [""]
                                        // : type === "[number]"
                                        // ? [0]
                                        // : type === "[boolean]"
                                        // ? [false]
                                        // : type === "[date]"
                                        // ? [Date.now()]
                                        ""; // : schemaToFormModel(fieldSchema, initializeRandom);
};

export const dataType2fieldType = ( dataType ) => {
    // if (debug) console.log("Utils.data.dataType2fieldType :: dataType = ", dataType);
    const validInputTypes = [
        "button",
        "checkbox",
        "color",
        "date",
        "datetime-local",
        "email",
        "file",
        "hidden",
        "image",
        "month",
        "number",
        "password",
        "radio",
        "range",
        "reset",
        "search",
        "submit",
        "tel",
        "text",
        "time",
        "url",
        "week",
    ];

    return dataType === "string"
        ? "text"
        : dataType === "number"
            ? "number"
            : dataType === "boolean"
                ? "checkbox"
                : dataType === "date"
                    ? "date"
                    : dataType === "datetime"
                        ? "datetime-local"
                        : dataType === "objectid"
                            ? "text"
                            : dataType === "object"
                                ? "data"
                                : dataType === "array"
                                    ? "array"
                                    : dataType === "[string]"
                                        ? "[string]" // [""]
                                        : dataType === "[number]"
                                            ? "[number]" // [0]
                                            : dataType === "[boolean]"
                                                ? "[boolean]" // [false]
                                                : dataType === "[date]"
                                                    ? "[date]" // [Date.now()]
                                                    : "text"; // : schemaToFormModel(fieldSchema, initializeRandom);
};

export const generateRandom = ( type, length = 10, complexity ) => {
    // Set type to lowercase.
    if ( !type ) return "";
    type = type.toLowerCase();
    // let options = ["[string]", "[number]", "[boolean]", "[date]", "string", "number", "boolean", "date"];
    // let validTypes = ["string", "number", "boolean", "date"];
    // let validarrayTypes = ["array", "[array]", "[string]", "[number]", "[boolean]", "[date]"];
    // console.log("generateRandom called :: type = |", type, "| :: length = ", length, " :: complexity = ", complexity);
    if ( [ "[string]", "[number]", "[boolean]", "[date]", "array" ].includes( type ) ) {
        let nonarrayOptions = [ "string", "number", "boolean", "date" ];
        // if (debug) console.log(`generateRandom for array data = `, generateRandom(`${nonarrayOptions[Math.floor(Math.random() * nonarrayOptions.length)]}`, length, complexity));
    }
    return type === "string"
        ? ( Math.random() + 1 ).toString( 36 ).slice( 2, 7 ) // .substring(7) // [...array(30)].map(() => Math.random().toString(36)[2]).join("")
        : type === "number"
            ? Math.floor( Math.random() * ( length * length ) )
            : type === "boolean"
                ? Math.floor( Math.random() * 1 ) === 1
                : type === "date"
                    ? Date.now() - Math.floor( Math.random() ) * length
                    : // : type === "UUID"
                    // ? crypto.randomBytes(complexity).toString("hex")
                    type === "array"
                        ? Array( length + 1 )
                            .fill()
                            .map( () => {
                                let options = [ "string", "number", "boolean", "date" ];
                                return generateRandom( options[ Math.floor( Math.random() * options.length ) ], length );
                            } )
                        : type === "[array]"
                            ? [ ...Array( length + 1 ) ].map( () => {
                                let options = [ "[string]", "[number]", "[boolean]", "[date]" ];
                                return generateRandom( options[ Math.floor( Math.random() * options.length ) ], length );
                            } )
                            : type === "[string]"
                                ? [ ...Array( length + 1 ) ].map( () => generateRandom( "string", length ) )
                                : type === "[number]"
                                    ? [ ...Array( length + 1 ) ].map( () => generateRandom( "number", length ) )
                                    : type === "[boolean]"
                                        ? [ ...Array( length + 1 ) ].map( () => generateRandom( "boolean", length ) )
                                        : type === "[date]"
                                            ? [ ...Array( length + 1 ) ].map( () => generateRandom( "date", length ) )
                                            : 0;
    //{}; // schemaToModel( value )
};

export const createBasicUUID = ( complexity ) => {
    return crypto.randomBytes( complexity ).toString( "hex" );
};

// Initializes a value based on its type.
// export const typeToInitialDefault = (type, defaultValue) => {
// 	return defaultValue
// 		? defaultValue
// 		: type === "string"
// 		? ""
// 		: type === "number"
// 		? 0
// 		: type === "boolean"
// 		? false
// 		: type === "date"
// 		? Date.now()
// 		: type === "array"
// 		? []
// 		: schemaToModel(type);
// };

// Like schemaToModel, except that it produces a JSON model specifically geared towards generating a dynamic form.
export const schemaToFormModel = ( schema, initializeRandom = false ) => {
    if ( debug === true )
        console.log( `schemaToFormModel called :: schema = `, schema );
    // A model will be an object, with each key value pair having a nested object.
    let model = {};
    if ( utils.val.isArray( schema ) ) {
        // Use only the first item, if it has any.
        if ( utils.val.isValidArray( schema, true ) ) {
            let value = schema[ 0 ];
            let type = typeof value;
            let typeName = value.hasOwnProperty( "instance" ) ? value.instance : undefined;
            // If the testValue is an object, we need to run this recursively. Else, just return an array with a single value initialized inside it.
            if ( debug === true )
                console.log( `schemaToFormModel :: schema = `, schema, "\n :: value = ", value, "\n :: type = ", type, "\n :: typeName = ", typeName );
            model = [
                typeName === "string"
                    ? ""
                    : typeName === "number"
                        ? 0
                        : typeName === "boolean"
                            ? false
                            : typeName === "date"
                                ? Date.now()
                                : schemaToFormModel( value, initializeRandom ),
            ];
        } else {
            model = [];
        }
    } else if ( utils.val.isObject( schema ) ) {
        Object.keys( schema ).forEach( ( key, index ) => {
            let value = schema[ key ];
            if ( value ) {
                let type = value.hasOwnProperty( "type" ) ? value.type : "";
                let typeName = utils.ao.deepGetKey( value, "instance" );
                // let typeName = value.hasOwnProperty("instance") ? value.instance : undefined;
                if ( typeName ) typeName = typeName.toLowerCase();
                let options = utils.ao.deepGetKey( value, "options" );
                // Check for enums.
                // let enums = value.hasOwnProperty("enumValues") ? value.enumValues : undefined;
                let enums = utils.ao.deepGetKey( value, "enumValues" );
                // ['none', 'low', 'medium', 'high', 'urgent', 'asap', 'critical']
                // ['cancelled', 'postponed', 'waitingrequirements', 'incomplete', 'inprogress', 'completed']
                let defaultValue = utils.ao.has( value, "defaultValue" ) ? value.defaultValue : undefined;
                let initialValue;
                if ( debug === true ) console.log(
                    `schemaToFormModel :: schema = `,
                    schema,
                    "\n :: key = ",
                    key,
                    "\n :: value = ",
                    value,
                    "\n :: options = ",
                    options,
                    "\n :: enums = ",
                    enums,
                    "\n :: typeName = ",
                    typeName,
                    "\n :: defaultValue = ",
                    defaultValue,
                    "\n :: initialValue = ",
                    initialValue,
                );
                if ( typeof type === "object" && !Array.isArray( type ) ) {
                    // Nested schema, need to dig deeper.
                    initialValue = schemaToFormModel( type, initializeRandom );
                    if ( debug === true )
                        console.log(
                            `schemaToFormModel :: schema = `,
                            schema,
                            "\n :: key = ",
                            key,
                            "\n :: value = ",
                            value,
                            "\n :: Type is an object, ie a nested schema. Running this function recursively... ",
                            "\n\n :: Initialvalue is now = ",
                            initialValue,
                        );
                } else if ( Array.isArray( type ) ) {
                    // Type is an array of some kind.
                    initialValue = schemaToFormModel( type, initializeRandom );
                    if ( debug === true )
                        console.log(
                            `schemaToFormModel :: schema = `,
                            schema,
                            "\n :: key = ",
                            key,
                            "\n :: value = ",
                            value,
                            "\n :: Type is an array, ie a collection of typed data. Running this function recursively... ",
                            "\n\n :: Initialvalue is now = ",
                            initialValue,
                        );
                } else if ( typeName ) {
                    initialValue =
                        typeName === "string"
                            ? utils.ao.has( value, "default" )
                                ? value.default
                                : ""
                            : typeName === "number"
                                ? ( initialValue = defaultValue ? defaultValue : 0 )
                                : typeName === "boolean"
                                    ? ( initialValue = defaultValue ? defaultValue : false )
                                    : typeName === "date"
                                        ? ( initialValue = defaultValue ? defaultValue : Date.now() )
                                        : typeName === "array"
                                            ? ( initialValue = defaultValue ? defaultValue : [] )
                                            : schemaToFormModel( value, initializeRandom );
                }
                model[ key ] = initialValue;
                if ( initializeRandom ) {
                    if ( enums ) {
                        model[ key ] = enums[ Math.floor( Math.random() * enums.length ) ];
                    } else {
                        model[ key ] = generateRandom( typeName, 10, 10 );
                    }
                }
                if ( debug === true )
                    console.log(
                        `schemaToFormModel :: schema = `,
                        schema,
                        "\n :: key = ",
                        key,
                        "\n :: value = ",
                        value,
                        "\n :: After if-else chain: ",
                        "\n\n :: Initialvalue is now = ",
                        initialValue,
                        "\n :: initializeRandom = ",
                        initializeRandom,
                        "\n :: generateRandom(type, length, complexity) = ",
                        generateRandom( typeName, 10, 10 ),
                        "\n :: model[key] = ",
                        model[ key ],
                    );
            }
        } );
    }
    return model;
};

export const schemaToModel = ( schema, initializeRandom = false ) => {
    if ( debug === true ) console.log( `schemaToModel called :: schema = `, schema );
    // A model will be an object, with each key value pair having a nested object.
    let model = {};
    if ( utils.val.isArray( schema ) ) {
        // Use only the first item, if it has any.
        if ( utils.val.isValidArray( schema, true ) ) {
            let value = schema[ 0 ];
            let type = typeof value;
            let typeName = value.hasOwnProperty( "name" ) ? value.name : undefined;
            // If the testValue is an object, we need to run this recursively. Else, just return an array with a single value initialized inside it.
            if ( debug === true ) console.log( `schemaToModel :: schema = `, schema, "\n :: value = ", value, "\n :: type = ", type, "\n :: typeName = ", typeName );
            model = [
                typeName === "string" ? "" : typeName === "number" ? 0 : typeName === "boolean" ? false : typeName === "date" ? Date.now() : schemaToModel( value, initializeRandom ),
            ];
        } else {
            model = [];
        }
    } else if ( utils.val.isObject( schema ) ) {
        Object.keys( schema ).forEach( ( key, index ) => {
            let value = schema[ key ];
            let type = value.hasOwnProperty( "type" ) ? value.type : "";
            let typeName = type.hasOwnProperty( "name" ) ? type.name.toLowerCase() : undefined;
            // Check for enums.
            let enums = value.hasOwnProperty( "enum" ) ? value.enum : undefined;
            // ['none', 'low', 'medium', 'high', 'urgent', 'asap', 'critical']
            // ['cancelled', 'postponed', 'waitingrequirements', 'incomplete', 'inprogress', 'completed']
            if ( debug === true )
                console.log(
                    `schemaToModel :: schema = `,
                    schema,
                    "\n :: key = ",
                    key,
                    "\n :: value = ",
                    value,
                    "\n :: Type = ",
                    type,
                    "\n :: typeof Type = ",
                    typeof type,
                    "\n :: Array.isArray(type) = ",
                    Array.isArray( type ),
                    "\n :: Type.name = ",
                    type.name,
                    "\n :: typeName = ",
                    typeName,
                );
            let initialValue;
            if ( typeof type === "object" && !Array.isArray( type ) ) {
                // Nested schema, need to dig deeper.
                initialValue = schemaToModel( type, initializeRandom );
                if ( debug === true )
                    console.log(
                        `schemaToModel :: schema = `,
                        schema,
                        "\n :: key = ",
                        key,
                        "\n :: value = ",
                        value,
                        "\n :: Type is an object, ie a nested schema. Running this function recursively... ",
                        "\n\n :: Initialvalue is now = ",
                        initialValue,
                    );
            } else if ( Array.isArray( type ) ) {
                // Type is an array of some kind.
                initialValue = schemaToModel( type, initializeRandom );
                if ( debug === true )
                    console.log(
                        `schemaToModel :: schema = `,
                        schema,
                        "\n :: key = ",
                        key,
                        "\n :: value = ",
                        value,
                        "\n :: Type is an array, ie a collection of typed data. Running this function recursively... ",
                        "\n\n :: Initialvalue is now = ",
                        initialValue,
                    );
            } else if ( typeName ) {
                initialValue =
                    typeName === "string"
                        ? utils.ao.has( value, "default" )
                            ? value.default
                            : ""
                        : typeName === "number"
                            ? ( initialValue = utils.ao.has( value, "default" ) ? value.default : 0 )
                            : typeName === "boolean"
                                ? ( initialValue = utils.ao.has( value, "default" ) ? value.default : false )
                                : typeName === "date"
                                    ? ( initialValue = utils.ao.has( value, "default" ) ? value.default : Date.now() )
                                    : typeName === "array"
                                        ? ( initialValue = utils.ao.has( value, "default" ) ? value.default : [] )
                                        : schemaToModel( value, initializeRandom );
            }
            model[ key ] = initialValue;
            if ( initializeRandom ) {
                if ( enums ) {
                    model[ key ] = enums[ Math.floor( Math.random() * enums.length ) ];
                } else {
                    model[ key ] = generateRandom( typeName, 10, 10 );
                }
            }
            if ( debug === true )
                console.log(
                    `schemaToModel :: schema = `,
                    schema,
                    "\n :: key = ",
                    key,
                    "\n :: value = ",
                    value,
                    "\n :: After if-else chain: ",
                    "\n\n :: Initialvalue is now = ",
                    initialValue,
                    "\n :: initializeRandom = ",
                    initializeRandom,
                    "\n :: generateRandom(type, length, complexity) = ",
                    generateRandom( typeName, 10, 10 ),
                    "\n :: model[key] = ",
                    model[ key ],
                );
        } );
    }
    return model;
};

export function deepSearch ( object, key, predicate ) {
    if ( object.hasOwnProperty( key ) && predicate( key, object[ key ] ) === true ) {
        return object;
    }

    for ( let i = 0; i < Object.keys( object ).length; i++ ) {
        let value = object[ Object.keys( object )[ i ] ];
        if ( typeof value === "object" && value != null ) {
            let o = deepSearch( object[ Object.keys( object )[ i ] ], key, predicate );
            if ( o != null ) {
                return o;
            }
        }
    }
    return null;
}
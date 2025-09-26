/**
 * Enhanced array utility functions with method-style calling
 * Extends the Array prototype with utility methods
 */

// Safe prototype extension - only adds methods if they don't already exist
const safeExtendArrayPrototype = ( methodName, implementation ) => {
    if ( !Array.prototype[ methodName ] ) {
        Object.defineProperty( Array.prototype, methodName, {
            value: implementation,
            enumerable: false, // Don't show in for...in loops
            writable: true,
            configurable: true
        } );
    }
};

// Utility to safely execute a function with error handling
const safeExecute = ( fn, fallbackValue ) => {
    try {
        return fn();
    } catch ( error ) {
        console.error( `Array utility error: ${ error.message }` );
        return fallbackValue;
    }
};

// ===== Type Checking Methods =====

// Check if array is non-empty
safeExtendArrayPrototype( 'isNonEmpty', function () {
    return this.length > 0;
} );

// Clean array of null/undefined values
safeExtendArrayPrototype( 'clean', function () {
    return safeExecute( () => {
        return this.filter( item => item !== null && item !== undefined );
    }, [] );
} );

// ===== Array Manipulation Methods =====

// Reorder array by moving an item from one index to another
safeExtendArrayPrototype( 'reorder', function ( startIndex, endIndex ) {
    return safeExecute( () => {
        const result = [ ...this ];

        // Validate indices
        if (
            !Number.isInteger( startIndex ) ||
            !Number.isInteger( endIndex ) ||
            startIndex < 0 ||
            startIndex >= this.length ||
            endIndex < 0 ||
            endIndex >= this.length
        ) {
            return result;
        }

        const [ removed ] = result.splice( startIndex, 1 );
        result.splice( endIndex, 0, removed );

        return result;
    }, [ ...this ] );
} );

// Add an item to the end of the array
safeExtendArrayPrototype( 'add', function ( item ) {
    return safeExecute( () => {
        return [ ...this, item ];
    }, [ ...this ] );
} );

// Insert an item at a specific index
safeExtendArrayPrototype( 'insert', function ( item, index ) {
    return safeExecute( () => {
        // Validate index
        const validIndex = !Number.isInteger( index ) || index < 0 ? 0 :
            index > this.length ? this.length : index;

        const result = [ ...this ];
        result.splice( validIndex, 0, item );

        return result;
    }, [ ...this ] );
} );

// Remove an item at a specific index
safeExtendArrayPrototype( 'removeAt', function ( index ) {
    return safeExecute( () => {
        // Validate index
        if (
            !Number.isInteger( index ) ||
            index < 0 ||
            index >= this.length
        ) {
            return [ ...this ];
        }

        const result = [ ...this ];
        result.splice( index, 1 );

        return result;
    }, [ ...this ] );
} );

// Remove items based on a predicate function
safeExtendArrayPrototype( 'removeWhere', function ( predicate ) {
    return safeExecute( () => {
        if ( typeof predicate !== 'function' ) return [ ...this ];
        return this.filter( item => !predicate( item ) );
    }, [ ...this ] );
} );

// ===== Type Analysis Methods =====

// Get types of elements in the array
safeExtendArrayPrototype( 'getElementTypes', function () {
    return safeExecute( () => {
        if ( this.length === 0 ) {
            return { isEmpty: true, types: [] };
        }

        const getType = ( value ) => {
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

        const types = [ ...new Set( this.map( item => getType( item ) ) ) ];

        return {
            isEmpty: false,
            length: this.length,
            types,
            isHomogeneous: types.length === 1,
            primaryType: types[ 0 ]
        };
    }, { isEmpty: false, types: [ 'Unknown' ] } );
} );

// Check if all elements are of a specific type
safeExtendArrayPrototype( 'allOfType', function ( type ) {
    return safeExecute( () => {
        if ( this.length === 0 ) return false;

        const checkType = ( item, typeStr ) => {
            if ( typeStr === 'Array' ) return Array.isArray( item );
            if ( typeStr === 'Null' ) return item === null;
            if ( typeStr === 'Undefined' ) return item === undefined;
            return typeof item === typeStr.toLowerCase();
        };

        return this.every( item => checkType( item, type ) );
    }, false );
} );

// ===== Array Transformation Methods =====

// Chunk array into smaller arrays of specified size
safeExtendArrayPrototype( 'chunk', function ( size ) {
    return safeExecute( () => {
        const validSize = !Number.isInteger( size ) || size <= 0 ? 1 : size;
        const result = [];

        for ( let i = 0; i < this.length; i += validSize ) {
            result.push( this.slice( i, i + validSize ) );
        }

        return result;
    }, [] );
} );

// Create a unique array by removing duplicate values
safeExtendArrayPrototype( 'unique', function ( keyFn ) {
    return safeExecute( () => {
        if ( typeof keyFn === 'function' ) {
            const seen = new Set();
            return this.filter( item => {
                try {
                    const key = keyFn( item );
                    if ( seen.has( key ) ) return false;
                    seen.add( key );
                    return true;
                } catch ( error ) {
                    console.error( 'Error in unique keyFn:', error );
                    return false;
                }
            } );
        }

        return [ ...new Set( this ) ];
    }, [ ...this ] );
} );

// Flatten a nested array structure
safeExtendArrayPrototype( 'flatten', function ( depth = Infinity ) {
    return safeExecute( () => {
        const validDepth = !Number.isInteger( depth ) || depth < 0 ? Infinity : depth;

        try {
            return this.flat( validDepth );
        } catch ( error ) {
            // Fallback implementation for older environments
            const flattenHelper = ( arr, currentDepth ) => {
                if ( currentDepth <= 0 ) return arr.slice();

                return arr.reduce( ( acc, item ) => {
                    if ( Array.isArray( item ) && currentDepth > 0 ) {
                        return acc.concat( flattenHelper( item, currentDepth - 1 ) );
                    }
                    return acc.concat( item );
                }, [] );
            };

            return flattenHelper( this, validDepth );
        }
    }, [ ...this ] );
} );

// Shuffle array using Fisher-Yates algorithm
safeExtendArrayPrototype( 'shuffle', function () {
    return safeExecute( () => {
        const result = [ ...this ];

        for ( let i = result.length - 1; i > 0; i-- ) {
            const j = Math.floor( Math.random() * ( i + 1 ) );
            [ result[ i ], result[ j ] ] = [ result[ j ], result[ i ] ];
        }

        return result;
    }, [ ...this ] );
} );

// ===== Advanced Operations =====

// Group array elements by a key
safeExtendArrayPrototype( 'groupBy', function ( keyFn ) {
    return safeExecute( () => {
        const getKey = typeof keyFn === 'function'
            ? keyFn
            : ( typeof keyFn === 'string' ? item => item?.[ keyFn ] : item => item );

        return this.reduce( ( result, item ) => {
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
    }, {} );
} );

// Find intersection with other arrays
safeExtendArrayPrototype( 'intersect', function ( ...arrays ) {
    return safeExecute( () => {
        const validArrays = arrays.filter( Array.isArray );

        if ( validArrays.length === 0 ) return [ ...this ];

        return validArrays.reduce( ( result, array ) => {
            return result.filter( item => array.includes( item ) );
        }, [ ...this ] );
    }, [] );
} );

// Create a range array
Array.range = ( start, end, step = 1 ) => {
    return safeExecute( () => {
        // Validate inputs
        if ( !Number.isFinite( start ) || !Number.isFinite( end ) ) {
            return [];
        }

        const validStep = Number.isFinite( step ) && step !== 0 ? step : 1;
        const length = Math.max( Math.ceil( ( end - start ) / validStep ), 0 );

        return Array.from( { length }, ( _, i ) => start + i * validStep );
    }, [] );
};

// Zip with other arrays
safeExtendArrayPrototype( 'zip', function ( ...arrays ) {
    return safeExecute( () => {
        const validArrays = [ this, ...arrays.filter( Array.isArray ) ];

        if ( validArrays.length === 1 ) return this.map( item => [ item ] );

        const minLength = Math.min( ...validArrays.map( arr => arr.length ) );
        const result = [];

        for ( let i = 0; i < minLength; i++ ) {
            result.push( validArrays.map( arr => arr[ i ] ) );
        }

        return result;
    }, [] );
} );

// Sum array of numbers
safeExtendArrayPrototype( 'sum', function () {
    return safeExecute( () => {
        return this.reduce( ( sum, value ) => {
            const num = Number( value );
            return sum + ( Number.isFinite( num ) ? num : 0 );
        }, 0 );
    }, 0 );
} );

// Average of array of numbers
safeExtendArrayPrototype( 'average', function () {
    return safeExecute( () => {
        if ( this.length === 0 ) return 0;

        const sum = this.reduce( ( acc, value ) => {
            const num = Number( value );
            return acc + ( Number.isFinite( num ) ? num : 0 );
        }, 0 );

        return sum / this.length;
    }, 0 );
} );

// Find min value
safeExtendArrayPrototype( 'min', function () {
    return safeExecute( () => {
        if ( this.length === 0 ) return undefined;

        const validNumbers = this
            .map( value => Number( value ) )
            .filter( num => Number.isFinite( num ) );

        if ( validNumbers.length === 0 ) return undefined;
        return Math.min( ...validNumbers );
    }, undefined );
} );

// Find max value
safeExtendArrayPrototype( 'max', function () {
    return safeExecute( () => {
        if ( this.length === 0 ) return undefined;

        const validNumbers = this
            .map( value => Number( value ) )
            .filter( num => Number.isFinite( num ) );

        if ( validNumbers.length === 0 ) return undefined;
        return Math.max( ...validNumbers );
    }, undefined );
} );

// Count occurrences of values
safeExtendArrayPrototype( 'countBy', function ( keyFn ) {
    return safeExecute( () => {
        const getKey = typeof keyFn === 'function'
            ? keyFn
            : ( typeof keyFn === 'string' ? item => item?.[ keyFn ] : item => item );

        return this.reduce( ( result, item ) => {
            try {
                const key = getKey( item );
                // Skip items that produce invalid keys
                if ( key === null || key === undefined ) return result;

                result[ key ] = ( result[ key ] || 0 ) + 1;
                return result;
            } catch ( error ) {
                console.error( 'Error in countBy:', error );
                return result;
            }
        }, {} );
    }, {} );
} );

// Partition array into two arrays based on predicate
safeExtendArrayPrototype( 'partition', function ( predicate ) {
    return safeExecute( () => {
        if ( typeof predicate !== 'function' ) return [ [ ...this ], [] ];

        const truthy = [];
        const falsy = [];

        this.forEach( item => {
            try {
                if ( predicate( item ) ) {
                    truthy.push( item );
                } else {
                    falsy.push( item );
                }
            } catch ( error ) {
                console.error( 'Error in partition predicate:', error );
                falsy.push( item );
            }
        } );

        return [ truthy, falsy ];
    }, [ [ ...this ], [] ] );
} );

// Create a method to safely chain multiple operations
safeExtendArrayPrototype( 'chain', function () {
    const chainable = {
        value: [ ...this ],

        // Add all array methods to the chain
        clean () { chainable.value = chainable.value.clean(); return chainable; },
        reorder ( start, end ) { chainable.value = chainable.value.reorder( start, end ); return chainable; },
        add ( item ) { chainable.value = chainable.value.add( item ); return chainable; },
        insert ( item, index ) { chainable.value = chainable.value.insert( item, index ); return chainable; },
        removeAt ( index ) { chainable.value = chainable.value.removeAt( index ); return chainable; },
        removeWhere ( predicate ) { chainable.value = chainable.value.removeWhere( predicate ); return chainable; },
        chunk ( size ) { chainable.value = chainable.value.chunk( size ); return chainable; },
        unique ( keyFn ) { chainable.value = chainable.value.unique( keyFn ); return chainable; },
        flatten ( depth ) { chainable.value = chainable.value.flatten( depth ); return chainable; },
        shuffle () { chainable.value = chainable.value.shuffle(); return chainable; },

        // Terminal operations
        value () { return chainable.value; },
        toArray () { return [ ...chainable.value ]; }
    };

    return chainable;
} );

// ===== Utility to remove all extensions =====
Array.removeExtensions = () => {
    const methods = [
        'isNonEmpty', 'clean', 'reorder', 'add', 'insert', 'removeAt', 'removeWhere',
        'getElementTypes', 'allOfType', 'chunk', 'unique', 'flatten', 'shuffle',
        'groupBy', 'intersect', 'zip', 'sum', 'average', 'min', 'max', 'countBy',
        'partition', 'chain'
    ];

    methods.forEach( method => {
        if ( Array.prototype[ method ] ) {
            delete Array.prototype[ method ];
        }
    } );

    if ( Array.range ) delete Array.range;
    if ( Array.removeExtensions ) delete Array.removeExtensions;

    console.log( 'All array extensions have been removed.' );
};

// // Test the enhanced array methods
// const testArray = [ 1, 2, 3, 4, 5 ];
// const mixedArray = [ 1, "string", { key: "value" }, [ 1, 2 ], null, undefined ];

// console.log( "Original array:", testArray );
// console.log( "isNonEmpty:", testArray.isNonEmpty() );
// console.log( "clean:", mixedArray.clean() );
// console.log( "reorder:", testArray.reorder( 0, 2 ) );
// console.log( "add:", testArray.add( 6 ) );
// console.log( "insert:", testArray.insert( 0, 2 ) );
// console.log( "removeAt:", testArray.removeAt( 2 ) );
// console.log( "getElementTypes:", mixedArray.getElementTypes() );
// console.log( "allOfType (numbers):", testArray.allOfType( 'Number' ) );
// console.log( "allOfType (mixed):", mixedArray.allOfType( 'Number' ) );
// console.log( "chunk:", testArray.chunk( 2 ) );
// console.log( "unique:", [ 1, 2, 2, 3, 4, 4, 5 ].unique() );
// console.log( "flatten:", [ 1, [ 2, [ 3, 4 ], 5 ] ].flatten() );
// console.log( "shuffle:", testArray.shuffle() );

// const people = [
//     { name: "Alice", age: 25 },
//     { name: "Bob", age: 30 },
//     { name: "Charlie", age: 25 }
// ];

// console.log( "groupBy:", people.groupBy( "age" ) );
// console.log( "intersect:", [ 1, 2, 3 ].intersect( [ 2, 3, 4 ], [ 3, 4, 5 ] ) );
// console.log( "range:", Array.range( 1, 10, 2 ) );
// console.log( "zip:", [ 1, 2, 3 ].zip( [ 'a', 'b', 'c' ], [ true, false, true ] ) );
// console.log( "sum:", testArray.sum() );
// console.log( "average:", testArray.average() );
// console.log( "min:", testArray.min() );
// console.log( "max:", testArray.max() );
// console.log( "countBy:", [ 'a', 'b', 'a', 'c', 'b', 'a' ].countBy() );
// console.log( "partition:", testArray.partition( x => x % 2 === 0 ) );

// // Demonstrate chaining
// console.log( "Chaining example:",
//     [ 1, 2, 2, 3, null, 4, 4, 5 ]
//         .chain()
//         .clean()
//         .unique()
//         .add( 6 )
//         .removeWhere( x => x > 4 )
//         .value()
// );
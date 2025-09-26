import * as utils from 'akashatools';



/* 
    const person1 = {
        "firstName": "John",
        "lastName": "Doe",
        "age": 35
    };

    const person2 = {
        "firstName": "John",
        "lastName": "Doe",
        "age": 35,
    };
*/

// Filters through Data for any objects matching { key: value } and returns all non-matches.
export const remove = ( data = [], key = '', value = '' ) => {
    if ( utils.val.isValidArray( data, true ) ) {
        let temp = { ...data };
        return temp.filter( ( v, index ) => {
            if ( v.hasOwnProperty( key ) ) {
                if ( v[ key ] === value ) {
                    return false;
                }
            }
            return true;
        } );
    }
};

/* 
const input = [ {
    'title': "some title",
    'channel_id': '123we',
    'options': [ {
        'channel_id': 'abc',
        'image': 'http://asdasd.com/all-inclusive-block-img.jpg',
        'title': 'All-Inclusive',
        'options': [ {
            'channel_id': 'dsa2',
            'title': 'Some Recommends',
            'options': [ {
                'image': 'http://www.asdasd.com',
                'title': 'Sandals',
                'id': '1',
                'content': {}
            } ]
        } ]
    } ]
} ];

console.log( findNestedObj( input, 'id', '1' ) );
 */
export function findNestedObj ( entireObj, keyToFind, valToFind ) {
    let foundObj;
    JSON.stringify( entireObj, ( _, nestedValue ) => {
        if ( nestedValue && nestedValue[ keyToFind ] === valToFind ) {
            foundObj = nestedValue;
        }
        return nestedValue;
    } );
    return foundObj;
};

// Filters through Data for any objects with the same value in both the iObj and given obj's designated matchkey, and swaps them. 
export const replace = ( data = [], obj = {}, key = '', value = '' ) => {
    if ( utils.val.isValidArray( data, true ) && utils.val.isObject( obj ) ) {
        let temp = { ...data };
        return {
            ...temp.filter( ( v, index ) => {
                if ( v.hasOwnProperty( key ) && obj.hasOwnProperty( key ) ) {
                    if ( v[ key ] === obj[ key ] ) {
                        return false;
                    }
                }
                return true;
            } ),
            obj
        };
    }
};

// console.log( isDeepEqual( person1, person2 ) ); //true

export const isDeepEqual = ( object1, object2 ) => {

    const objKeys1 = Object.keys( object1 );
    const objKeys2 = Object.keys( object2 );

    if ( objKeys1.length !== objKeys2.length ) return false;

    for ( var key of objKeys1 ) {
        const value1 = object1[ key ];
        const value2 = object2[ key ];

        const isObjects = isObject( value1 ) && isObject( value2 );

        if ( ( isObjects && !isDeepEqual( value1, value2 ) ) ||
            ( !isObjects && value1 !== value2 )
        ) {
            return false;
        }
    }
    return true;
};

export const isObject = ( object ) => {
    return object != null && typeof object === "object";
};

// https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array // 
export const findElement = ( searchObj, searchKey ) => Object.keys( searchObj ).forEach( key => {
    if ( key === searchKey ) {
        preloadingImgObj = searchObj[ key ];
        return searchObj[ key ];
    }
    if ( typeof searchObj[ key ] === 'object' && searchObj[ key ] !== undefined && searchObj[ key ] !== null ) {
        return findElement( searchObj[ key ], searchKey );
    }
} );

export function deepSearchItems ( object, key, predicate ) {
    let ret = [];
    if ( object.hasOwnProperty( key ) && predicate( key, object[ key ] ) === true ) {
        ret = [ ...ret, object ];
    }
    if ( Object.keys( object ).length ) {
        for ( let i = 0; i < Object.keys( object ).length; i++ ) {
            let value = object[ Object.keys( object )[ i ] ];
            if ( typeof value === "object" && value != null ) {
                let o = this.deepSearchItems( object[ Object.keys( object )[ i ] ], key, predicate );
                if ( o != null && o instanceof Array ) {
                    ret = [ ...ret, ...o ];
                }
            }
        }
    }
    return ret;
}

export function deepSearch ( object, key, predicate ) {
    if ( object.hasOwnProperty( key ) && predicate( key, object[ key ] ) === true ) return object;

    for ( let i = 0; i < Object.keys( object ).length; i++ ) {
        const nextObject = object[ Object.keys( object )[ i ] ];
        if ( nextObject && typeof nextObject === "object" ) {
            let o = deepSearch( nextObject, key, predicate );
            if ( o != null ) return o;
        }
    }
    return null;
}

export function deepSearchByKey ( object, originalKey, originalValue, matches = [] ) {
    if ( object != null ) {
        if ( Array.isArray( object ) ) {
            for ( let arrayItem of object ) {
                deepSearchByKey( arrayItem, originalKey, originalValue, matches );
            }
        } else if ( typeof object == 'object' ) {
            for ( let key of Object.keys( object ) ) {
                if ( key == originalKey ) {
                    if ( object[ key ] == originalValue ) {
                        matches.push( object );
                    }
                } else {
                    deepSearchByKey( object[ key ], originalKey, originalValue, matches );
                }
            }
        }
    }

    return matches;
}

export const findByKey = ( obj, kee ) => {
    if ( kee in obj ) return obj[ kee ];
    for ( n of Object.values( obj ).filter( Boolean ).filter( v => typeof v === 'object' ) ) {
        let found = findByKey( n, kee );
        if ( found ) return found;
    }
};

export const findByProperty = ( obj, predicate ) => {
    if ( predicate( obj ) ) return obj;
    for ( n of Object.values( obj ).filter( Boolean ).filter( v => typeof v === 'object' ) ) {
        let found = findByProperty( n, predicate );
        if ( found ) return found;
    }
};

// find by value is going to be a little different;

export let findByValue = ( o, val ) => {
    if ( o === val ) return o;
    if ( o === NaN || o === Infinity || !o || typeof o !== 'object' ) return;
    if ( Object.values( o ).includes( val ) ) return o;
    for ( n of Object.values( o ) ) {
        const found = findByValue( n, val );
        if ( found ) return n;
    }
};
/* 
    then they can be used like this;

    const arry = [ { foo: 0 }, null, { bar: [ { baz: { nutherKey: undefined, needle: "gotcha!" } } ] } ];
    const obj = { alice: Infinity, bob: NaN, charlie: "string", david: true, ebert: arry };

    findByKey( obj, 'needle' );
    // 'gotcha!'

    findByProperty( obj, val => val.needle === 'gotcha!' );
    // { nutherKey: undefined, needle: "gotcha!" }

    findByValue( obj, 'gotcha!' );
    // { nutherKey: undefined, needle: "gotcha!" } 
// */

export function findObjects ( obj, targetProp, targetValue, finalResults ) {

    function getObject ( theObject ) {
        let result = null;
        if ( theObject instanceof Array ) {
            for ( let i = 0; i < theObject.length; i++ ) {
                getObject( theObject[ i ] );
            }
        }
        else {
            for ( let prop in theObject ) {
                if ( theObject.hasOwnProperty( prop ) ) {
                    console.log( prop + ': ' + theObject[ prop ] );
                    if ( prop === targetProp ) {
                        console.log( '--found id' );
                        if ( theObject[ prop ] === targetValue ) {
                            console.log( '----found porop', prop, ', ', theObject[ prop ] );
                            finalResults.push( theObject );
                        }
                    }
                    if ( theObject[ prop ] instanceof Object || theObject[ prop ] instanceof Array ) {
                        getObject( theObject[ prop ] );
                    }
                }
            }
        }
    }

    getObject( obj );

}


/* 
    mapObj2Obj(
        obj,
        {
            key1: key_01,
            key2: key_02,
            key3: key_03,
            key4: key_04,
        }
    );
*/
export const mapObj2Obj = ( obj, keys = {} ) => {

    const mapObj = ( obj, keys = {} ) => {
        let newObj = {};
        let objKeys = Object.keys( obj );
        let mapKeys = Object.keys( keys );
        mapKeys.forEach( ( fromKey, index ) => {
            // Value in the fromObj.
            let fromValue = obj[ fromKey ];

            // Storing the toKey in the value field.
            let toKey = keys[ fromKey ];

            // console.log( "mapObj2Obj(", obj, ", ", keys, ")", " :: ", "fromValue = ", fromValue, " :: ", "toKey = ", toKey, " :: ", "fromValue = ", fromValue );
            // Check if obj has this fromKey.
            if ( objKeys.includes( fromKey ) ) {
                // Yep! Set the value into the newObj with the new key name. 
                newObj[ toKey ] = fromValue;
            }

        } );

        // console.log( "mapObj2Obj :: obj = ", obj, " :: ", "newObj = ", newObj );
        return newObj;
    };

    if ( utils.val.isObject( obj ) ) {
        // console.log( "mapObj2Obj(", obj, ", ", keys, ")", " :: ", "object input :: obj = ", obj );
        return mapObj( obj, keys );
    }
    else if ( utils.val.isValidArray( obj, true ) ) {
        // Given an array instead for some reason.
        let arr = [];
        obj.forEach( ( o ) => {
            // console.log( "mapObj2Obj(", obj, ", ", keys, ")", " :: ", "array input :: o = ", o );
            arr.push(
                mapObj( o, keys )
            );
        } );

        return arr;
    }
};

export function objToString ( obj ) {
    if ( obj === undefined || obj === null ) return '(invalid obj)';
    let separator = '::';
    let str = '';
    for ( const [ p, val ] of Object.entries( obj ) ) {
        str += `${ p }${ separator }${ val }\n`;
    }
    return str;
}

// /Make an object a string that evaluates to an equivalent object;
//  Note that eval() seems tricky and sometimes you have to do
//  something like eval("a = " + yourString), then use the value
//  of a.
//
//  Also this leaves extra commas after everything, but JavaScript
//  ignores them.
export function convertToText ( obj ) {
    //create an array that will later be joined into a string.
    var string = [];

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if ( typeof ( obj ) == "object" && ( obj.join == undefined ) ) {
        string.push( "{" );
        for ( prop in obj ) {
            string.push( prop, ": ", convertToText( obj[ prop ] ), "," );
        };
        string.push( "}" );

        //is array
    } else if ( typeof ( obj ) == "object" && !( obj.join == undefined ) ) {
        string.push( "[" );
        for ( prop in obj ) {
            string.push( convertToText( obj[ prop ] ), "," );
        }
        string.push( "]" );

        //is function
    } else if ( typeof ( obj ) == "function" ) {
        string.push( obj.toString() );

        //all other values can be done with JSON.stringify
    } else {
        string.push( JSON.stringify( obj, null, 2 ) );
    }

    return string.join( "" );
}
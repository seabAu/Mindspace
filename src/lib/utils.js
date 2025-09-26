import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn ( ...inputs ) {
    return twMerge( clsx( inputs ) );
}

export const idGenerator = () => {
    var randomString = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 8; i++ ) {
        randomString += characters.charAt( Math.floor( Math.random() * characters.length ) );
    }
    return randomString;
};

export function syntaxHighlight ( json ) {
    if ( typeof json != 'string' ) {
        json = JSON.stringify( json, undefined, 2 );
    }
    json = json.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
    return json.replace( /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function ( match ) {
        var cls = 'number';
        if ( /^"/.test( match ) ) {
            if ( /:$/.test( match ) ) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if ( /true|false/.test( match ) ) {
            cls = 'boolean';
        } else if ( /null/.test( match ) ) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    } );
}

// Array.prototype.handleSlice = function () {
//     return this.slice( 1, 2 );
// };

// Array.prototype.handleShuffle = function () {
//     return this.concat().sort( () => Math.random() - 0.5 );
// };

export function handleShuffle ( arr ) {
    return arr.concat().sort( () => Math.random() - 0.5 );
}


const isDeepEqual = ( object1, object2 ) => {

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

const isObject = ( object ) => {
    return object != null && typeof object === "object";
};

export function handleLog ( arg ) {
    return console.log( `App current state is: ${ arg }` );
}
console.debug = function () {
    if ( !console.debugging ) return;
    console.log.apply( this, arguments );
};

console.debugging = true;
console.debug( 'Foo', { age: 41, name: 'Jhon Doe' } );

export const conditionalLog = ( condition, message ) => {
    const errorMessage = "the # is not even";
    for ( let number = 2; number <= 5; number++ ) {
        console.log( `the # is ${ number }` );
        console.assert( number % 2 === 0, "%o", { number, errorMessage } );
    }
    // output:
    // the # is 2
    // the # is 3
    // Assertion failed: {number: 3, errorMessage: "the # is not even"}
    // the # is 4
    // the # is 5
    // Assertion failed: {number: 5, errorMessage: "the # is not even"}
};

// window.log = function () { if ( this.console ) { console.log( Array.prototype.slice.call( arguments ) ); } };
// jQuery.fn.log = function ( msg ) { console.log( "%s: %o", msg, this ); return this; };
// // $(".classname").log(); 





export function miniKindOf ( val ) {
    if ( val === void 0 )
        return "undefined";
    if ( val === null )
        return "null";
    const type = typeof val;
    switch ( type ) {
        case "boolean":
        case "string":
        case "number":
        case "symbol":
        case "function": {
            return type;
        }
    }
    if ( Array.isArray( val ) )
        return "array";
    if ( isDate( val ) )
        return "date";
    if ( isError( val ) )
        return "error";
    const constructorName = ctorName( val );
    switch ( constructorName ) {
        case "Symbol":
        case "Promise":
        case "WeakMap":
        case "WeakSet":
        case "Map":
        case "Set":
            return constructorName;
    }
    return Object.prototype.toString.call( val ).slice( 8, -1 ).toLowerCase().replace( /\s/g, "" );
}

export function ctorName ( val ) {
    return typeof val.constructor === "function" ? val.constructor.name : null;
}

export function isError ( val ) {
    return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}

export function isDate ( val ) {
    if ( val instanceof Date )
        return true;
    return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
}

export function kindOf ( val ) {
    let typeOfVal = typeof val;
    {
        typeOfVal = miniKindOf( val );
    }
    return typeOfVal;
}

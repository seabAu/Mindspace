
export function convertCamelCaseToSentenceCase ( s ) {
    if ( s !== null && s !== undefined && s !== '' ) {
        let result = s.replace( /([A-Z]+)/g, " $1" ).replace( /([A-Z][a-z])/g, " $1" );
        result = result.split( '.' ).join( '' );
        return result.charAt( 0 ).toUpperCase() + result.slice( 1 );
    }
    return s;
}

export function caseCamelToSentence ( s ) {
    if ( s !== null && s !== undefined && s !== '' ) {
        let result = s.replace( /([A-Z]+)/g, " $1" ).replace( /([A-Z][a-z])/g, " $1" );
        result = result.split( '.' ).join( '' );
        return result.charAt( 0 ).toUpperCase() + result.slice( 1 );
    }
    return s;
}

export function prettyJSON ( json ) {
    if ( json ) {
        json = JSON.stringify( json, undefined, 4 );
        json = json.replace( /&/g, '&' ).replace( /</g, '<' ).replace( />/g, '>' );
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
}

export function cleanStringify ( object ) {
    if ( object && typeof object === 'object' ) {
        object = copyWithoutCircularReferences( [ object ], object );
    }
    return JSON.stringify( object );

    function copyWithoutCircularReferences ( references, object ) {
        var cleanObject = {};
        Object.keys( object ).forEach( function ( key ) {
            var value = object[ key ];
            if ( value && typeof value === 'object' ) {
                if ( references.indexOf( value ) < 0 ) {
                    references.push( value );
                    cleanObject[ key ] = copyWithoutCircularReferences( references, value );
                    references.pop();
                } else {
                    cleanObject[ key ] = '###_Circular_###';
                }
            } else if ( typeof value !== 'function' ) {
                cleanObject[ key ] = value;
            }
        } );
        return cleanObject;
    }
}
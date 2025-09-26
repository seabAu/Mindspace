// ARRAY PROTOTYPES
Array.prototype.coalesce = function () { return this.find( a => a !== null ); };
// [null, null, 1,2,3].coalesce();

Array.prototype.isValid = function () {
    return ( this && this !== null && this !== undefined ) && ( Array.isArray( this ) )
        ? ( checkLength
            ? ( this.length > 0 && this?.[ 0 ] !== undefined )
            : ( false )
        ) : ( false );
};

Array.prototype.last = function () { return this[ this.length - 1 ]; };


// Remove repeats
Array.prototype.unique = function () {
    return this.filter( ( el, index, array ) => array.indexOf( el ) === index );
};

// Pick a random item
Array.prototype.sample = function () {
    return this[ Math.floor( Math.random() * this.length ) ];
};

// Source: https://www.kirupa.com/html5/extending_built_in_objects_javascript.htm // 
Array.prototype.shuffle = function () {
    let input = this;

    for ( let i = input.length - 1; i >= 0; i-- ) {

        let randomIndex = Math.floor( Math.random() * ( i + 1 ) );
        let itemAtIndex = input[ randomIndex ];

        input[ randomIndex ] = input[ i ];
        input[ i ] = itemAtIndex;
    }
    return input;
};

// OBJECT PROTOTYPES
Object.prototype.keys = function () { return Object.keys( this ); };


// DATE PROTOTYPES
Date.prototype.now = function () {
    let now = new Date( Date.now() );
    return now;
};

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = ( this.getMonth() + 1 ).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();

    return (
        yyyy +
        '-' +
        ( mm[ 1 ] ? mm : '0' + mm[ 0 ] ) +
        '-' +
        ( dd[ 1 ] ? dd : '0' + dd[ 0 ] )
    );
};

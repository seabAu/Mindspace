
export function randRGBChannel () {
    return Math.floor( Math.random() * ( 256 + 1 ) );
}

export function rgbRand () {
    return [ randRGBChannel(), randRGBChannel(), randRGBChannel() ];
}

export function rgbToHex ( rgb ) {
    return ( ( 1 << 24 ) + ( rgb[ 0 ] << 16 ) + ( rgb[ 1 ] << 8 ) + rgb[ 2 ] ).toString( 16 ).slice( 1 );
}

export function randomColor () {
    return rgbToHex( rgbRand() );
}

export const stringToHue = ( string ) => {
    let hash = 0;
    for ( let i = 0; i < string.length; i++ ) {
        hash = string.charCodeAt( i ) + ( ( hash << 5 ) - hash );
        hash = hash & hash;
    }
    return hash % 360;
};

export const stringToColor = ( string, saturation = 100, lightness = 75 ) => {
    return `hsl(${ ( stringToHue( string ) ) }, ${ saturation }%, ${ lightness }%)`;
};

// For the sample on stackoverflow
export function colorByHashCode ( value ) {
    return "<span style='color:" + stringToColor( value ) + "'>" + value + "</span>";
}

export function hslToHex ( h, s, l ) {
    l /= 100;
    const a = s * Math.min( l, 1 - l ) / 100;
    const f = n => {
        const k = ( n + h / 30 ) % 12;
        const color = l - a * Math.max( Math.min( k - 3, 9 - k, 1 ), -1 );
        // convert to Hex and prefix "0" if needed
        return Math.round( 255 * color ).toString( 16 ).padStart( 2, '0' );
    };
    return `#${ f( 0 ) }${ f( 8 ) }${ f( 4 ) }`;
}

export function hslaToHex ( h, s, l, alpha ) {
    l /= 100;
    const a = s * Math.min( l, 1 - l ) / 100;
    const f = n => {
        const k = ( n + h / 30 ) % 12;
        const color = l - a * Math.max( Math.min( k - 3, 9 - k, 1 ), -1 );
        return Math.round( 255 * color ).toString( 16 ).padStart( 2, '0' );
        // convert to Hex and prefix "0" if needed
    };
    //alpha conversion
    alpha = Math.round( alpha * 255 ).toString( 16 ).padStart( 2, '0' );

    return `#${ f( 0 ) }${ f( 8 ) }${ f( 4 ) }${ alpha }`;
}

export function invertColor ( hex ) {
    if ( hex.indexOf( '#' ) === 0 ) {
        hex = hex.slice( 1 );
    }
    // convert 3-digit hex to 6-digits.
    if ( hex.length === 3 ) {
        hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ];
    }
    if ( hex.length !== 6 ) {
        throw new Error( 'Invalid HEX color.' );
    }
    // invert color components
    var r = ( 255 - parseInt( hex.slice( 0, 2 ), 16 ) ).toString( 16 ),
        g = ( 255 - parseInt( hex.slice( 2, 4 ), 16 ) ).toString( 16 ),
        b = ( 255 - parseInt( hex.slice( 4, 6 ), 16 ) ).toString( 16 );
    // pad each with zeros and return
    return '#' + padZero( r ) + padZero( g ) + padZero( b );
}

export function padZero ( str, len ) {
    len = len || 2;
    var zeros = new Array( len ).join( '0' );
    return ( zeros + str ).slice( -len );
}

export function stringAsColor ( string, saturation = 100, lightness = 50, alpha ) {
    let hash = 0;
    for ( let i = 0; i < string.length; i++ ) {
        hash = string.charCodeAt( i ) + ( ( hash << 5 ) - hash );
        hash = hash & hash;
    }
    // const hslToHex = function ( h, s, l ) {
    //     l /= 100;
    //     const a = s * Math.min( l, 1 - l ) / 100;
    //     const f = n => {
    //         const k = ( n + h / 30 ) % 12;
    //         const color = l - a * Math.max( Math.min( k - 3, 9 - k, 1 ), -1 );
    //         return Math.round( 255 * color ).toString( 16 ).padStart( 2, '0' );
    //     };
    //     return [ '#', f( 0 ), f( 8 ), f( 4 ) ].join( '' );
    // };
    if ( alpha ) return hslaToHex( Math.abs( hash % 360 ), saturation, lightness, alpha );
    else return hslToHex( Math.abs( hash % 360 ), saturation, lightness );
}

// var my_hex = '#' + colorRand();
// var my_rgb = 'rgb(' + randRGBChannel() + ',' + randRGBChannel() + ',' + randRGBChannel() + ')';

/**
 * Generates a Tailwind CSS background gradient class from an array of hex colors
 * @param {string[]} colors - Array of hex color codes (e.g., ["#FF0000", "#00FF00", "#0000FF"])
 * @param {string} direction - Direction of the gradient (default: "to-r" for right)
 * @returns {string} Tailwind CSS class for the gradient
 */
export function createGradientFromColors ( colors, direction = "to-r" ) {
    if ( !colors || colors.length === 0 ) {
        return "bg-gray-100";
    }

    if ( colors.length === 1 ) {
        return `bg-[${ colors[ 0 ] }]`;
    }

    // Calculate the position for each color in the gradient
    const positions = colors.map( ( _, index ) => {
        // For n colors, position each at: 0%, 100/(n-1)%, 200/(n-1)%, ..., 100%
        return Math.round( ( index / ( colors.length - 1 ) ) * 100 );
    } );

    // Create the gradient stops
    const gradientStops = colors
        .map( ( color, index ) => {
            return `${ color } ${ positions[ index ] }%`;
        } )
        .join( ", " );

    // Return the Tailwind CSS class
    return `bg-gradient-${ direction } from-[${ colors[ 0 ] }] to-[${ colors[ colors.length - 1 ] }] bg-[linear-gradient(${ direction === "to-r" ? "90deg" : "180deg" },${ gradientStops })]`;
}

/**
 * Generates a Tailwind CSS text gradient class from an array of hex colors
 * @param {string[]} colors - Array of hex color codes
 * @param {string} direction - Direction of the gradient (default: "to-r" for right)
 * @returns {string} Tailwind CSS class for the text gradient
 */
export function createTextGradientFromColors ( colors, direction = "to-r" ) {
    if ( !colors || colors.length === 0 ) {
        return "text-gray-900";
    }

    if ( colors.length === 1 ) {
        return `text-[${ colors[ 0 ] }]`;
    }

    // Calculate positions as in the background gradient function
    const positions = colors.map( ( _, index ) => {
        return Math.round( ( index / ( colors.length - 1 ) ) * 100 );
    } );

    // Create the gradient stops
    const gradientStops = colors
        .map( ( color, index ) => {
            return `${ color } ${ positions[ index ] }%`;
        } )
        .join( ", " );

    // Return the Tailwind CSS class for text gradient
    return `bg-clip-text text-transparent bg-gradient-${ direction } from-[${ colors[ 0 ] }] to-[${ colors[ colors.length - 1 ] }] bg-[linear-gradient(${ direction === "to-r" ? "90deg" : "180deg" },${ gradientStops })]`;
}

/**
 * Generates a Tailwind CSS border gradient class from an array of hex colors
 * @param {string[]} colors - Array of hex color codes
 * @param {string} direction - Direction of the gradient (default: "to-r" for right)
 * @param {number} borderWidth - Width of the border (default: 1)
 * @returns {string} Tailwind CSS class for the border gradient
 */
export function createBorderGradientFromColors ( colors, direction = "to-r", borderWidth = 1 ) {
    if ( !colors || colors.length === 0 ) {
        return "border border-gray-200";
    }

    if ( colors.length === 1 ) {
        return `border-[${ borderWidth }px] border-[${ colors[ 0 ] }]`;
    }

    // Calculate positions as in the background gradient function
    const positions = colors.map( ( _, index ) => {
        return Math.round( ( index / ( colors.length - 1 ) ) * 100 );
    } );

    // Create the gradient stops
    const gradientStops = colors
        .map( ( color, index ) => {
            return `${ color } ${ positions[ index ] }%`;
        } )
        .join( ", " );

    // Return the Tailwind CSS class for border gradient
    // Note: This requires additional styling to work properly with borders
    return `border-[${ borderWidth }px] border-transparent bg-clip-border bg-gradient-${ direction } from-[${ colors[ 0 ] }] to-[${ colors[ colors.length - 1 ] }] bg-[linear-gradient(${ direction === "to-r" ? "90deg" : "180deg" },${ gradientStops })]`;
}


// Source: https://graphicdesign.stackexchange.com/questions/83866/generating-a-series-of-colors-between-two-colors
// Returns a single rgb color interpolation between given rgb color
// based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
export function interpolateColor ( color1, color2, factor ) {
    if ( arguments.length < 3 ) {
        factor = 0.5;
    }
    let result = color1.slice();
    for ( let i = 0; i < 3; i++ ) {
        result[ i ] = Math.round( result[ i ] + factor * ( color2[ i ] - color1[ i ] ) );
    }
    return result;
};

// Source: https://graphicdesign.stackexchange.com/questions/83866/generating-a-series-of-colors-between-two-colors
// My function to interpolate between two colors completely, returning an array
export function interpolateColors ( color1, color2, steps ) {
    let stepFactor = 1 / ( steps - 1 ),
        interpolatedColorArray = [];

    color1 = color1.match( /\d+/g ).map( Number );
    color2 = color2.match( /\d+/g ).map( Number );

    for ( let i = 0; i < steps; i++ ) {
        interpolatedColorArray.push( interpolateColor( color1, color2, stepFactor * i ) );
    }

    return interpolatedColorArray;
}

// Example: let colorArray = interpolateColors("rgb(94, 79, 162)", "rgb(247, 148, 89)", 5);

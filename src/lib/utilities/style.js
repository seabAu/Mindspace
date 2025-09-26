import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn ( ...inputs ) {
    return twMerge( clsx( inputs ) );
}

// Source: https://stackoverflow.com/questions/48760274/get-all-css-root-variables-in-array-using-javascript-and-change-the-values
export function getAllStyleVariables () {
    return (
        Array.from( document.styleSheets )
            .filter(
                sheet =>
                    sheet.href === null || sheet.href.startsWith( window.location.origin )
            )
            .reduce(
                ( acc, sheet ) =>
                ( acc = [
                    ...acc,
                    ...Array.from( sheet.cssRules ).reduce(
                        ( def, rule ) =>
                        ( def =
                            rule.selectorText === ":root"
                                ? [
                                    ...def,
                                    ...Array.from( rule.style ).filter( name =>
                                        name.startsWith( "--" )
                                    )
                                ]
                                : def ),
                        []
                    )
                ] ),
                []
            )
    );
}

// could pass in an array of specific stylesheets for optimization
export function getAllCSSVariableNames ( styleSheets = document.styleSheets ) {
    var cssVars = [];
    // loop each stylesheet
    for ( var i = 0; i < styleSheets.length; i++ ) {
        // loop stylesheet's cssRules
        try { // try/catch used because 'hasOwnProperty' doesn't work
            for ( var j = 0; j < styleSheets[ i ].cssRules.length; j++ ) {
                try {
                    // loop stylesheet's cssRules' style (property names)
                    for ( var k = 0; k < styleSheets[ i ].cssRules[ j ].style.length; k++ ) {
                        let name = styleSheets[ i ].cssRules[ j ].style[ k ];
                        // test name for css variable signiture and uniqueness
                        if ( name.startsWith( '--' ) && cssVars.indexOf( name ) == -1 ) {
                            cssVars.push( name );
                        }
                    }
                } catch ( error ) { }
            }
        } catch ( error ) { }
    }
    return cssVars;
}


// Usage: // 
// var cssVars = getAllCSSVariableNames();
// console.log( ':root variables', getElementCSSVariables( cssVars, document.documentElement ) );
export function getElementCSSVariables ( allCSSVars, element = document.body, pseudo ) {
    var elStyles = window.getComputedStyle( element, pseudo );
    var cssVars = {};
    for ( var i = 0; i < allCSSVars.length; i++ ) {
        let key = allCSSVars[ i ];
        let value = elStyles.getPropertyValue( key );
        if ( value ) { cssVars[ key ] = value; }
    }
    return cssVars;
}
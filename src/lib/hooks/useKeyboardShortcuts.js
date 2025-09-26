"use client";

import { useEffect, useRef } from "react";

export function useKeyboardShortcuts ( shortcuts, options = {} ) {
    const { enabled = true, preventDefault = true, ignoreInputs = true, timeout = 1000 } = options;

    const keysPressed = useRef( [] );
    const timer = useRef( null );

    useEffect( () => {
        if ( !enabled ) return;

        const handleKeyDown = ( e ) => {
            // Skip if in an input, textarea, or contentEditable element when ignoreInputs is true
            if (
                ignoreInputs &&
                ( e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable )
            ) {
                return;
            }

            // Handle modifier keys
            const key = e.key.toLowerCase();
            const modifiers = [];

            if ( e.ctrlKey ) modifiers.push( "ctrl" );
            if ( e.metaKey ) modifiers.push( "meta" );
            if ( e.altKey ) modifiers.push( "alt" );
            if ( e.shiftKey ) modifiers.push( "shift" );

            // If there are modifiers, create a combined key
            const fullKey = modifiers.length > 0 ? [ ...modifiers, key ].join( "+" ) : key;

            // Add key to the sequence
            keysPressed.current.push( fullKey );

            // Check if the sequence matches any shortcuts
            const sequence = keysPressed.current.join( " " );

            for ( const [ shortcutSequence, callback ] of Object.entries( shortcuts ) ) {
                if ( sequence === shortcutSequence || keysPressed.current.join( " " ).endsWith( shortcutSequence ) ) {
                    if ( preventDefault ) {
                        e.preventDefault();
                    }
                    callback( e );
                    keysPressed.current = [];
                    return;
                }
            }

            // Reset sequence after a delay
            clearTimeout( timer.current );
            timer.current = setTimeout( () => {
                keysPressed.current = [];
            }, timeout );
        };

        window.addEventListener( "keydown", handleKeyDown );
        return () => {
            window.removeEventListener( "keydown", handleKeyDown );
            clearTimeout( timer.current );
        };
    }, [ enabled, shortcuts, preventDefault, ignoreInputs, timeout ] );

    // Method to manually clear the current key sequence
    const clearKeySequence = () => {
        keysPressed.current = [];
        clearTimeout( timer.current );
    };

    return { clearKeySequence };
}

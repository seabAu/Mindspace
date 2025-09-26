

/**
 * Custom hook for localStorage operations with error handling
 * @returns {Object} localStorage utility functions
 */
const useLocalStorage = () => {
    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Stored value or default value
     */
    const GetLocal = ( key, defaultValue = null ) => {
        try {
            if ( typeof window === "undefined" ) return defaultValue;

            const item = localStorage.getItem( key );
            if ( item === null ) return defaultValue;

            try {
                return JSON.parse( item );
            } catch {
                return item; // Return as string if not JSON
            }
        } catch ( error ) {
            console.error( `[v0] useLocalStorage: Error getting ${ key }:`, error );
            return defaultValue;
        }
    };

    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    const SetLocal = ( key, value ) => {
        try {
            if ( typeof window === "undefined" ) return false;

            const serializedValue = typeof value === "string" ? value : JSON.stringify( value );
            localStorage.setItem( key, serializedValue );
            return true;
        } catch ( error ) {
            console.error( `[v0] useLocalStorage: Error setting ${ key }:`, error );
            return false;
        }
    };

    /**
     * Remove item from localStorage with error handling
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    const DeleteLocal = ( key ) => {
        try {
            if ( typeof window === "undefined" ) return false;

            localStorage.removeItem( key );
            return true;
        } catch ( error ) {
            console.error( `[v0] useLocalStorage: Error deleting ${ key }:`, error );
            return false;
        }
    };

    /**
     * Check if key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Existence status
     */
    const HasLocal = ( key ) => {
        try {
            if ( typeof window === "undefined" ) return false;
            return localStorage.getItem( key ) !== null;
        } catch ( error ) {
            console.error( `[v0] useLocalStorage: Error checking ${ key }:`, error );
            return false;
        }
    };

    /**
     * Clear all localStorage items
     * @returns {boolean} Success status
     */
    const ClearLocal = () => {
        try {
            if ( typeof window === "undefined" ) return false;
            localStorage.clear();
            return true;
        } catch ( error ) {
            console.error( "[v0] useLocalStorage: Error clearing localStorage:", error );
            return false;
        }
    };

    return {
        GetLocal,
        SetLocal,
        DeleteLocal,
        HasLocal,
        ClearLocal,
    };
};

export default useLocalStorage;

// import React, { useCallback, useEffect, useState } from 'react';

// export const useLocalStorage = ( key, initialValue ) => {
//     // State to store our value
//     // Pass initial state function to useState so logic is only executed once
//     const [ storedValue, setStoredValue ] = useState( () => {
//         if ( typeof window === "undefined" ) {
//             return initialValue;
//         }
//         try {
//             const item = window.localStorage.getItem( key );
//             return item ? JSON.parse( item ) : initialValue;
//         } catch ( error ) {
//             console.log( error );
//             return initialValue;
//         }
//     } );

//     // Return a wrapped version of useState's setter function that ...
//     // ... persists the new value to localStorage.
//     const setValue = ( value ) => {
//         try {
//             // Allow value to be a function so we have same API as useState
//             const valueToStore = value instanceof Function ? value( storedValue ) : value;
//             setStoredValue( valueToStore );
//             if ( typeof window !== "undefined" ) {
//                 window.localStorage.setItem( key, JSON.stringify( valueToStore ) );
//             }
//         } catch ( error ) {
//             console.log( error );
//         }
//     };

//     const SetLocal = ( key, value ) => {
//         console.log( "useLocalStorage :: Saving local storage: {", key, " :: ", ", ", value, "}" );
//         localStorage.setItem(
//             key,
//             value,
//         );
//     };

//     const GetLocal = ( key ) => {
//         let value = localStorage.getItem( key );
//         console.log( "GetLocal :: Fetching local storage key: ", key, " :: ", "value = ", value );
//         if ( value ) {
//             return value;
//         }
//         else {
//             // Return null instead of undefined as an indicator of error.
//             return null;
//         }
//     };

//     const DeleteLocal = ( key ) => {
//         console.log( "DeleteLocal :: Deleting local storage key: ", key );
//         localStorage.removeItem( key );
//     };


//     // const handleGetPageView = ( routeStr, fallbackStr = '' ) => {
//     //     // Handles fetching the sub-route from local storage on component mount.
//     //     let t = localStorage.getItem( ROUTES_TASK_PAGE );
//     //     if ( !t || t === '' ) { return 'list'; }
//     //     return t;
//     // };

//     return {
//         SetLocal,
//         GetLocal,
//         DeleteLocal,
//         storedValue,
//         setValue,
//     };
// };

// export default useLocalStorage;


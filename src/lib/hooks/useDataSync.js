"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as utils from "akashatools";
import { invalid } from "@/lib/utilities/data";

/**
 * A custom hook to manage multiple, independent, periodic sync operations with advanced triggering.
 * @param {Array<object>} configs - An array of sync configuration objects.
 * Each config can include:
 * - key: unique identifier
 * - interval: check interval in ms
 * - valueToWatch: value to monitor
 * - syncFunction: async function to fetch data
 * - onSyncSuccess: callback on successful sync
 * - onSyncFailure: callback on sync failure
 * - onSyncPrereqFailure: callback when prerequisites fail
 * - prerequisites: array of values that must be valid
 * - triggerOnChange: array of values that trigger immediate sync when changed
 * - triggerOnPage: {path: string, callback: function} - trigger when on specific page
 */
export function useDataSync ( configs = [] ) {
    const configsRef = useRef( configs );
    const isSyncingRef = useRef( new Map() );
    const previousValuesRef = useRef( new Map() );
    const [ syncLoading, setSyncLoading ] = useState( false );
    const [ syncError, setSyncError ] = useState( null );
    const [ currentPath, setCurrentPath ] = useState( "" );

    useEffect( () => {
        if ( typeof window !== "undefined" ) {
            setCurrentPath( window.location.pathname );

            const handleRouteChange = () => {
                setCurrentPath( window.location.pathname );
            };

            window.addEventListener( "popstate", handleRouteChange );
            return () => window.removeEventListener( "popstate", handleRouteChange );
        }
    }, [] );

    // On every render, update the ref to the latest configs object.
    useEffect( () => {
        configsRef.current = configs;
    } );

    const performSync = useCallback( async ( config ) => {
        const { key, valueToWatch, syncFunction, onSyncSuccess, onSyncFailure, onSyncPrereqFailure, prerequisites } = config;

        // Check prerequisites first
        let canProceed = true;
        if ( prerequisites !== null && utils.val.isValidArray( prerequisites, true ) ) {
            prerequisites.forEach( ( req ) => {
                if ( !utils.val.isDefined( req ) ) {
                    canProceed = false;
                }
            } );
        }

        if ( !canProceed ) {
            console.log( `useDataSync.js :: sync for ${ key } :: prerequisite values not valid:`, prerequisites );

            if ( onSyncPrereqFailure && typeof onSyncPrereqFailure === "function" ) {
                try {
                    await onSyncPrereqFailure( prerequisites );
                } catch ( error ) {
                    console.error( `useDataSync.js :: onSyncPrereqFailure failed for ${ key }:`, error );
                }
            }
            return;
        }

        // Check if already syncing
        if ( isSyncingRef.current.get( key ) ) {
            return;
        }

        if ( invalid( valueToWatch ) ) {
            try {
                isSyncingRef.current.set( key, true );
                setSyncLoading( true );
                console.log( `Periodic Sync (${ key }): Invalid value detected. Re-syncing...` );

                if ( syncFunction ) {
                    const data = await syncFunction();
                    if ( onSyncSuccess ) onSyncSuccess( data );
                    console.log( `Periodic Sync (${ key }): Sync successful.` );
                }
            } catch ( error ) {
                console.error( `Periodic Sync (${ key }): Sync failed.`, error );
                setSyncError( error );

                if ( onSyncFailure && typeof onSyncFailure === "function" ) {
                    try {
                        await onSyncFailure( error );
                    } catch ( handlerError ) {
                        console.error( `useDataSync.js :: onSyncFailure handler failed for ${ key }:`, handlerError );
                    }
                }
            } finally {
                isSyncingRef.current.set( key, false );
                setSyncLoading( false );
            }
        }
    }, [] );

    useEffect( () => {
        configs.forEach( ( config ) => {
            const { key, triggerOnChange } = config;

            if ( triggerOnChange && utils.val.isValidArray( triggerOnChange, true ) ) {
                const currentValues = triggerOnChange.map( ( val ) => val );
                const previousValues = previousValuesRef.current.get( key ) || [];

                // Check if any trigger values have changed
                const hasChanged = currentValues.some( ( val, index ) => {
                    return val !== previousValues[ index ];
                } );

                if ( hasChanged && previousValues.length > 0 ) {
                    console.log( `useDataSync.js :: Trigger value changed for ${ key }, performing immediate sync` );
                    performSync( config );
                }

                // Update previous values
                previousValuesRef.current.set( key, currentValues );
            }
        } );
    }, [ configs, performSync ] );

    useEffect( () => {
        configs.forEach( ( config ) => {
            const { key, triggerOnPage } = config;

            if ( triggerOnPage && triggerOnPage.path && triggerOnPage.callback ) {
                const { path, callback } = triggerOnPage;

                // Check if current path matches or is a subpath
                if ( currentPath.startsWith( path ) ) {
                    console.log( `useDataSync.js :: Page trigger activated for ${ key } on path ${ currentPath }` );

                    if ( typeof callback === "function" ) {
                        try {
                            callback( currentPath );
                        } catch ( error ) {
                            console.error( `useDataSync.js :: Page trigger callback failed for ${ key }:`, error );
                        }
                    }
                }
            }
        } );
    }, [ currentPath, configs ] );

    useEffect( () => {
        const intervalIds = [];

        configs.forEach( ( config ) => {
            const { key, interval } = config;

            if ( !key ) {
                console.error( "Periodic Sync: A unique 'key' is required for each sync configuration." );
                return;
            }

            const checkAndSync = async () => {
                const currentConfig = configsRef.current.find( ( c ) => c.key === key );
                if ( !currentConfig ) {
                    return;
                }

                await performSync( currentConfig );
            };

            // Perform initial check
            checkAndSync();

            // Set up periodic check
            const timerId = setInterval( checkAndSync, interval );
            intervalIds.push( timerId );
        } );

        return () => {
            intervalIds.forEach( clearInterval );
        };
    }, [ performSync ] );

    return {
        syncLoading,
        setSyncLoading,
        syncError,
        setSyncError,
        currentPath, // Expose current path for debugging
    };
}

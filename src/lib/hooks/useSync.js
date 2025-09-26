import { useEffect, useRef, useCallback, useState } from "react";
import { isInvalid } from "../utilities/data";
import * as utils from 'akashatools';

/**
 * A custom hook to manage multiple, independent, periodic sync operations.
 * @param {Array<object>} configs - An array of sync configuration objects.
 */
/**
 * A custom hook to periodically check a value and re-sync it via an API call if it's invalid.
 * @param {object} options - The options for the hook.
 * @param {*} options.valueToWatch - The value to monitor for invalidity.
 * @param {number} options.interval - The interval in milliseconds to perform the check.
 * @param {() => Promise<*>} options.syncFunction - The async function to call to fetch fresh data.
 * @param {(data: *) => void} options.onSyncSuccess - The callback to call with the new data.
 */
export function useSync ( configs = [] ) {
    const configsRef = useRef( configs );
    const isSyncingRef = useRef( new Map() );
    // Use a ref to store the syncing status for each task independently.
    const [ syncLoading, setSyncLoading ] = useState( false );
    const [ syncError, setSyncError ] = useState( null );

    // On every render, update the ref to the latest configs object.
    // This does NOT trigger the main effect.
    useEffect( () => {
        configsRef.current = configs;
    } );

    useEffect( () => {
        // This effect runs only ONCE on component mount.
        // It sets up the intervals and the cleanup logic.
        const intervalIds = [];

        // Use the initial configs to set up the timers.
        // The callback for each timer will read the LATEST configs from the ref.
        configs.forEach( ( config ) => {
            const { key, interval } = config;

            if ( !key ) {
                console.error( "Periodic Sync: A unique 'key' is required for each sync configuration." );
                return;
            }

            const checkAndSync = async () => {
                // Inside the interval, always read the LATEST config from the ref.
                // This gives us access to the current `valueToWatch` without needing it as a dependency.
                const currentConfig = configsRef.current.find( ( c ) => c.key === key );
                if ( !currentConfig ) {
                    // This config may have been dynamically removed.
                    return;
                }

                const { valueToWatch, syncFunction, onSyncSuccess } = currentConfig;
                const prerequisites = currentConfig && currentConfig.hasOwnProperty( 'prerequisites' ) ? currentConfig.prerequisites : null;
                const emptyPermitted = currentConfig && currentConfig.hasOwnProperty( 'emptyPermitted' ) ? currentConfig.emptyPermitted : false;



                let canProceed = true;
                if ( prerequisites !== null && utils.val.isValidArray( prerequisites, true ) ) {
                    // Check and make sure each prerequisite value is valid. 
                    prerequisites.forEach( ( req ) => {
                        if ( ( !utils.val.isDefined( req ) || !!req === false )
                            || ( !utils.val.isDefined( req ) && ( emptyPermitted || utils.val.isBlank( req ) ) ) ) {
                            canProceed = false;
                            console.log( "useSync.js :: sync for valueconfig ", currentConfig, " :: ", "prerequisite values not valid, aborting: ", prerequisites );
                            return;
                        }
                    } );
                }

                if ( !canProceed ) {
                    console.log( "useSync.js :: sync for valueconfig ", currentConfig, " :: ", "prerequisite values not valid, aborting: ", prerequisites );
                    return;
                }

                // Check the specific lock for this task.
                if ( isSyncingRef.current.get( key ) ) {
                    return;
                }

                if ( isInvalid( valueToWatch ) ) {
                    try {
                        isSyncingRef.current.set( key, true );
                        console.log( `Periodic Sync (${ key }): Invalid value detected. Re-syncing...` );
                        if ( syncFunction ) {
                            const data = await syncFunction();
                            // The onSyncSuccess function is also from the latest ref, so it's always up-to-date.
                            if ( onSyncSuccess ) onSyncSuccess( data );
                            console.log( `Periodic Sync (${ key }): Sync successful.` );
                        }
                    } catch ( error ) {
                        console.error( `Periodic Sync (${ key }): Sync failed.`, error );
                    } finally {
                        isSyncingRef.current.set( key, false );
                    }
                }
            };

            // Perform an initial check for this specific config.
            checkAndSync();

            // Set up the periodic check and store its ID.
            const timerId = setInterval( checkAndSync, interval );
            intervalIds.push( timerId );
        } );

        // The cleanup function will run when the component unmounts.
        return () => {
            intervalIds.forEach( clearInterval );
        };
    }, [] ); // <-- The empty dependency array is the key to fixing the infinite loop.


    return {
        syncLoading,
        setSyncLoading,
        syncError,
        setSyncError,
    };
}
import { useEffect, useRef } from 'react';
import { useUpdateQueueStore } from '@/store/update-queue-store';

// interface BatchUpdateOptions {
//   interval?: number;
//   onProcessStart?: () => void;
//   onProcessComplete?: () => void;
//   onProcessError?: ( error: any ) => void;
//   processingFn?: ( updates: any[] ) => Promise<void>;
//   enabled?: boolean;
// }

export function useBatchUpdates ( options ) {
    const {
        interval = 5000,
        onProcessStart,
        onProcessComplete,
        onProcessError,
        processingFn,
        enabled = true,
    } = options;

    const {
        pendingUpdates,
        isProcessing,
        processUpdates,
        setProcessingInterval,
        addUpdate,
        clearQueue,
    } = useUpdateQueueStore();

    const timerRef = useRef( null );

    // Set the processing interval
    useEffect( () => {
        setProcessingInterval( interval );
    }, [ interval, setProcessingInterval ] );

    // Set up the processing timer
    useEffect( () => {
        if ( !enabled ) return;

        const processQueue = async () => {
            if ( pendingUpdates.length === 0 || isProcessing ) return;

            try {
                onProcessStart?.();

                if ( processingFn ) {
                    await processingFn( pendingUpdates );
                    clearQueue();
                } else {
                    await processUpdates();
                }

                onProcessComplete?.();
            } catch ( error ) {
                onProcessError?.( error );
                console.error( 'Error processing updates:', error );
            }
        };

        // Set up the interval
        timerRef.current = setInterval( processQueue, interval );

        // Clean up on unmount
        return () => {
            if ( timerRef.current ) {
                clearInterval( timerRef.current );
            }
        };
    }, [
        enabled,
        isProcessing,
        interval,
        processUpdates,
        processingFn,
        clearQueue,
        onProcessStart,
        onProcessComplete,
        onProcessError,
        pendingUpdates,
    ] );

    return {
        pendingUpdates,
        isProcessing,
        addUpdate,
        processNow: processUpdates,
        clearQueue,
    };
}

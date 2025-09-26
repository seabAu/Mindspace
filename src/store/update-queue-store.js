import { create } from "zustand";

/* export interface UpdateItem {
    doctype: string
    doc: any
    time: number
    _deleted?: boolean
}

interface UpdateQueueState {
    pendingUpdates: UpdateItem[]
    isProcessing: boolean
    processingInterval: number

    // Actions
    addUpdate: (doctype: string, doc: any) => void
    processUpdates: () => Promise<void>
    setProcessingInterval: (interval: number) => void
    clearQueue: () => void
} */

export const useUpdateQueueStore = create( ( set, get ) => ( {
    pendingUpdates: [],
    isProcessing: false,
    processingInterval: 5000, // Default to 5 seconds

    addUpdate: ( doctype, doc ) => {
        const { pendingUpdates } = get();
        const now = Date.now();

        // Check if this document is already in the queue
        const existingIndex = pendingUpdates.findIndex( ( item ) => item.doctype === doctype && item.doc.id === doc.id );

        if ( existingIndex >= 0 ) {
            // Update existing item
            const updatedQueue = [ ...pendingUpdates ];
            updatedQueue[ existingIndex ] = {
                ...updatedQueue[ existingIndex ],
                doc,
                time: now,
            };
            set( { pendingUpdates: updatedQueue } );
        } else {
            // Add new item
            set( {
                pendingUpdates: [ ...pendingUpdates, { doctype, doc, time: now } ],
            } );
        }
    },

    processUpdates: async () => {
        const { pendingUpdates, isProcessing } = get();

        // Don't process if already processing or no updates
        if ( isProcessing || pendingUpdates.length === 0 ) return;

        set( { isProcessing: true } );

        try {
            // Group updates by doctype for batch processing
            const updatesByType = pendingUpdates.reduce(
                ( acc, update ) => {
                    if ( !acc[ update.doctype ] ) {
                        acc[ update.doctype ] = [];
                    }
                    acc[ update.doctype ].push( update );
                    return acc;
                },
                {},
            );

            // Process each group of updates
            for ( const [ doctype, updates ] of Object.entries( updatesByType ) ) {
                // This is where you would call your API
                console.log( `Processing ${ updates.length } updates for ${ doctype }` );

                // Simulate API call
                await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
            }

            // Clear the queue after successful processing
            set( { pendingUpdates: [], isProcessing: false } );
        } catch ( error ) {
            console.error( "Error processing updates:", error );
            set( { isProcessing: false } );
        }
    },

    setProcessingInterval: ( interval ) => {
        set( { processingInterval: interval } );
    },

    clearQueue: () => {
        set( { pendingUpdates: [] } );
    },
} ) );

/*  // https://v0.dev/chat/collecting-updates-with-zustand-WLXgr2ztuz4 // 
    const useBatchUpdateStore = create( ( set, get ) => ( {
        pendingUpdates: [],
        isProcessing: false,

        // Add or update an item in the pending updates array
        addUpdate: ( doctype, doc ) => {
            set( ( state ) => {
                const existingIndex = state.pendingUpdates.findIndex(
                    ( item ) => item.doctype === doctype && item.doc._id === doc._id,
                );

                const newUpdate = {
                    doctype,
                    doc,
                    time: new Date().toISOString(),
                };

                if ( existingIndex >= 0 ) {
                    // Update existing item
                    const updatedArray = [ ...state.pendingUpdates ];
                    updatedArray[ existingIndex ] = newUpdate;
                    return { pendingUpdates: updatedArray };
                } else {
                    // Add new item
                    return { pendingUpdates: [ ...state.pendingUpdates, newUpdate ] };
                }
            } );
        },

        // Process updates in batch
        processUpdates: async ( updateFn ) => {
            const { pendingUpdates, isProcessing } = get();

            if ( isProcessing || pendingUpdates.length === 0 ) return;

            set( { isProcessing: true } );

            try {
                // Create a copy of the pending updates to process
                const updatesToProcess = [ ...pendingUpdates ];

                // Call the update function with the updates to process
                await updateFn( updatesToProcess );

                // After successful processing, remove these updates from the pending list
                set( ( state ) => ( {
                    pendingUpdates: state.pendingUpdates.filter(
                        ( update ) =>
                            !updatesToProcess.some(
                                ( processed ) => processed.doctype === update.doctype && processed.doc._id === update.doc._id,
                            ),
                    ),
                    isProcessing: false,
                } ) );
            } catch ( error ) {
                console.error( "Error processing batch updates:", error );
                set( { isProcessing: false } );
            }
        },

        // Clear all pending updates
        clearUpdates: () => {
            set( { pendingUpdates: [] } );
        },
    } ) );

    export default useBatchUpdateStore

 */
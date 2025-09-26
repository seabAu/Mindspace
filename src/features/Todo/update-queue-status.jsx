import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import * as utils from 'akashatools';

// interface UpdateQueueStatusProps {
//   pendingUpdates: number
//   isProcessing: boolean
// }

export function UpdateQueueStatus ( { pendingUpdates, isProcessing } ) {
    const [ visible, setVisible ] = useState( false );

    // Show the status when there are pending updates or processing is happening
    useEffect( () => {
        if ( pendingUpdates > 0 || isProcessing ) {
            setVisible( true );

            // Hide after 3 seconds of no activity
            const timer = setTimeout( () => {
                if ( !isProcessing && pendingUpdates === 0 ) {
                    setVisible( false );
                }
            }, 3000 );

            return () => clearTimeout( timer );
        }
    }, [ pendingUpdates, isProcessing ] );

    if ( !visible ) return null;

    return (
        <div className="fixed bottom-2 right-2 z-50">
            <Badge variant="secondary" className="px-2 py-1 text-xs flex items-center gap-1">
                { isProcessing
                    ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            { `Syncing...` }
                        </>
                    )
                    : pendingUpdates > 0
                        ? (
                            <>
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                { pendingUpdates } { pendingUpdates === 1 ? "change" : "changes" } pending
                            </>
                        )
                        : (
                            <>
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Saved
                            </>
                        ) }
            </Badge>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import EnhancedTimeGrid from "./EnhancedTimeGrid";
import TimeGrid from "./TimeGridDisplay";

function TimeGridView ( { selectedDate, setSelectedDate, children }, ...props ) {
    const [ isLoading, setIsLoading ] = useState( true );

    // Simulate a short loading time to allow the browser to render the UI first
    useEffect( () => {
        const timer = setTimeout( () => {
            setIsLoading( false );
        }, 100 );

        return () => clearTimeout( timer );
    }, [] );

    return (
        <main className="min-h-screen min-w-full w-full">
            { isLoading ? (
                <div className="flex items-center justify-center h-screen">
                    <Skeleton className="w-full max-w-3xl h-[60vh] mx-auto" />
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-screen">
                    <EnhancedTimeGrid selectedDate={ selectedDate } setSelectedDate={ setSelectedDate } { ...props } />
                </div>
            ) }
            { children }
        </main>
    );
}

export default TimeGridView


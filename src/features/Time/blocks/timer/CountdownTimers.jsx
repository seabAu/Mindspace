// Generated here: //
// https://v0.dev/chat/timer-dashboard-ROBHHP5X26t // 


import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PomodoroTimerCreationCard } from "@/features/Time/blocks/timer/TimerCreationCard";
import { TimeProvider } from "@/features/Time/context/TimeContext";
import { PomodoroTimer } from "@/features/Time/blocks/timer/PomodoroTimer";

export function CountdownTimers ( { timerSize = 32 } ) {
    const [ timers, setTimers ] = React.useState( [] );

    useEffect( () => {
        const storedTimers = localStorage.getItem( "timers" );
        if ( storedTimers ) {
            setTimers( JSON.parse( storedTimers, ( key, value ) => ( key === "endDate" ? new Date( value ) : value ) ) );
        } else {
            // Default timers
            const defaultTimers = [
                {
                    id: "1",
                    name: "2025",
                    endDate: new Date( 2025, 0, 1 ), // January 1st, 2025
                    type: "till",
                },
                {
                    id: "2",
                    name: "Since ChatGPT",
                    endDate: new Date( 2022, 10, 30 ), // November 30, 2022
                    type: "from",
                },
            ];
            setTimers( defaultTimers );
            localStorage.setItem( "timers", JSON.stringify( defaultTimers ) );
        }

        // Enable View Transitions API
        document.documentElement.classList.add( "view-transition" );
    }, [] );

    useEffect( () => {
        localStorage.setItem( "timers", JSON.stringify( timers ) );
    }, [ timers ] );

    const handleCreateTimer = ( newTimer ) => {
        const timerWithId = {
            ...newTimer,
            id: Date.now().toString(),
        };
        setTimers( ( prevTimers ) => {
            const updatedTimers = [ ...prevTimers, timerWithId ];
            localStorage.setItem( "timers", JSON.stringify( updatedTimers ) );
            return updatedTimers;
        } );
    };

    const handleDeleteTimer = ( id ) => {
        setTimers( ( prevTimers ) => {
            const updatedTimers = prevTimers.filter( ( timer ) => timer.id !== id );
            localStorage.setItem( "timers", JSON.stringify( updatedTimers ) );
            return updatedTimers;
        } );
    };

    return (
        <TimeProvider>
            <div className={ `min-h-screen bg-background py-2 w-[${ String( timerSize ) }rem] h-[${ String( timerSize ) }rem]` }>
                <motion.div
                    className={ `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-items-center content-center` }
                    layout
                >
                    <AnimatePresence>
                        { timers.map( ( timer ) => (
                            <motion.div
                                key={ timer.id }
                                layout
                                initial={ { opacity: 0, scale: 0.8 } }
                                animate={ { opacity: 1, scale: 1 } }
                                exit={ { opacity: 0, scale: 0.8 } }
                                transition={ { duration: 0.3 } }
                            >
                                <PomodoroTimer { ...timer } onDelete={ handleDeleteTimer } />
                            </motion.div>
                        ) ) }
                    </AnimatePresence>
                    <PomodoroTimerCreationCard timerSize={ timerSize } onCreateTimer={ handleCreateTimer } />
                </motion.div>
            </div>
        </TimeProvider>
    );
}


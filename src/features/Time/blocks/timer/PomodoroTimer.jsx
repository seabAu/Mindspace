import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatTimeDifference } from "@/lib/utilities/time";
import { useTime } from "../../context/TimeContext";

export function PomodoroTimer ( { id, name, endDate, type, onDelete } ) {
    const { now } = useTime();
    const [ showDelete, setShowDelete ] = React.useState( false );
    const [ isHovered, setIsHovered ] = React.useState( false );

    const timeLeft = React.useMemo( () => formatTimeDifference( endDate, type, now ), [ endDate, type, now ] );
    const isExpired = type === "till" && timeLeft.total <= 0;

    const renderTimeUnit = ( value, label ) => {
        return (
            <div className="flex justify-center w-[160px]">
                <span className="flex-1 text-4xl font-bold tabular-nums text-right pr-1">
                    { value.toString().padStart( 2, "0" ) }
                </span>
                <span className="flex-1 text-sm font-medium text-left pl-1 self-end pb-1">{ label }</span>
            </div>
        );
    };

    const renderTimeUnits = () => {
        const units = [
            { value: timeLeft.years, label: "YEARS" },
            { value: timeLeft.months, label: "MONTHS" },
            { value: timeLeft.days, label: "DAYS" },
            { value: timeLeft.hours, label: "HOURS" },
            { value: timeLeft.minutes, label: "MINUTES" },
            { value: timeLeft.seconds, label: "SECONDS" },
        ];

        if ( isExpired ) {
            return units
                .slice( 2, 6 )
                .map( ( unit ) => <React.Fragment key={ unit.label }>{ renderTimeUnit( 0, unit.label ) }</React.Fragment> );
        }

        let startIndex = 0;
        if ( timeLeft.years > 0 ) {
            startIndex = 0;
        } else if ( timeLeft.months > 0 ) {
            startIndex = 1;
        } else {
            startIndex = 2;
        }

        const unitsToShow = units.slice( startIndex, startIndex + 4 );

        return unitsToShow.map( ( unit ) => (
            <React.Fragment key={ unit.label }>{ renderTimeUnit( unit.value, unit.label ) }</React.Fragment>
        ) );
    };

    return (
        <motion.div
            layout
            whileHover={ {
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                transition: { duration: 0.3, ease: "easeInOut" },
            } }
            transition={ { type: "spring", stiffness: 300, damping: 25 } }
        >
            <Card
                className={ `w-[280px] h-[280px] rounded-3xl relative ${ isExpired && !isHovered ? "opacity-50" : "" } transition-opacity duration-200` }
                onMouseEnter={ () => {
                    setShowDelete( true );
                    setIsHovered( true );
                } }
                onMouseLeave={ () => {
                    setShowDelete( false );
                    setIsHovered( false );
                } }
                style={ { viewTransitionName: `timer-${ id }` } }
            >
                <CardContent className="p-4 h-full">
                    <div className="absolute top-4 left-6 right-4">
                        <div className="flex items-center">
                            <div className={ `w-1.5 h-1.5 rounded-full mr-2 ${ type === "till" ? "bg-red-500" : "bg-green-500" }` }></div>
                            <h2 className="text-sm text-muted-foreground truncate font-mono uppercase">{ name }</h2>
                        </div>
                        <p
                            className={ `text-xs text-muted-foreground mt-1 font-mono uppercase transition-opacity duration-200 ${ isHovered ? "opacity-100" : "opacity-0" }` }
                        >
                            { type === "till" ? "Until: " : "Since: " }
                            { endDate.toLocaleString( undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            } ) }
                        </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col -space-y-1">{ renderTimeUnits() }</div>
                    </div>
                </CardContent>

                <AnimatePresence>
                    { showDelete && (
                        <motion.div
                            initial={ { opacity: 0, scale: 0.8 } }
                            animate={ { opacity: 1, scale: 1 } }
                            exit={ { opacity: 0, scale: 0.8 } }
                            transition={ { duration: 0.2 } }
                            className="absolute -top-3 -left-3 z-10"
                        >
                            <Button variant="destructive" size="icon" className="rounded-full" onClick={ () => onDelete( id ) }>
                                <X className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ) }
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}


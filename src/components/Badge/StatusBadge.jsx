
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
// import StatusBadge from "./status-badge"

export function StatusBadgeRender ( { allStatuses } ) {
    const statusOrder = [ "draft", "in-progress", "in-review", "completed" ];
    const [ statuses, setStatuses ] = useState( allStatuses ?? statusOrder );

    const handleStatusChange = ( index, newStatus ) => {
        setStatuses( ( prev ) => {
            const updated = [ ...prev ];
            updated[ index ] = newStatus;
            return updated;
        } );
    };

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-8 bg-white p-8">
            { statuses.map( ( status, index ) => (
                <StatusBadge key={ index } status={ status } onStatusChange={ ( newStatus ) => handleStatusChange( index, newStatus ) } statusOrder={ statusOrder } />
            ) ) }
        </div>
    );
}


export function StatusBadge ( { status, onStatusChange, statusOrder, className } ) {
    const [ isHovered, setIsHovered ] = useState( false );

    const variants = {
        draft: {
            icon: ( props ) => <Circle { ...props } className="size-4 stroke-[3]" strokeDasharray="4 4" />,
            text: "Draft",
            colors: "bg-gray-50 text-gray-700",
        },
        "in-progress": {
            icon: ( props ) => (
                <svg { ...props } viewBox="0 0 24 24" fill="none" className="size-4 stroke-[3]">
                    <circle cx="12" cy="12" r="9" className="stroke-current" strokeDasharray="4 4" />
                    <path d="M12 12 A 9 9 0 0 1 12 3" className="stroke-current" />
                </svg>
            ),
            text: "In-progress",
            colors: "bg-orange-50 text-orange-700",
        },
        "in-review": {
            icon: ( props ) => (
                <svg { ...props } viewBox="0 0 24 24" fill="none" className="size-4 stroke-[3]">
                    <circle cx="12" cy="12" r="9" className="stroke-current" strokeDasharray="4 4" />
                    <path d="M12 12 A 9 9 0 1 1 12 3" className="stroke-current" />
                </svg>
            ),
            text: "In-review",
            colors: "bg-blue-50 text-blue-700",
        },
        completed: {
            icon: ( props ) => <CheckCircle { ...props } className="size-4 stroke-[3]" />,
            text: "Completed",
            colors: "bg-green-50 text-green-700",
        },
    };

    const handleClick = () => {
        if ( onStatusChange ) {
            const currentIndex = statusOrder.indexOf( status );
            const nextIndex = ( currentIndex + 1 ) % statusOrder.length;
            onStatusChange( statusOrder[ nextIndex ] );
        }
    };

    const currentVariant = variants[ status ];

    return (
        <motion.div
            initial={ { scale: 0.95, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            whileHover={ { scale: 1.05 } }
            whileTap={ { scale: 0.95 } }
            onHoverStart={ () => setIsHovered( true ) }
            onHoverEnd={ () => setIsHovered( false ) }
            onClick={ handleClick }
            transition={ {
                type: "spring",
                stiffness: 400,
                damping: 20,
            } }
            className={ cn(
                "inline-flex items-center gap-2 rounded-full shadow-sm transition-colors cursor-pointer",
                isHovered ? "px-3 py-1" : "p-1.5",
                currentVariant.colors,
                className,
            ) }
        >
            { currentVariant.icon( {} ) }
            <AnimatePresence>
                { isHovered && (
                    <motion.span
                        initial={ { opacity: 0, width: 0 } }
                        animate={ { opacity: 1, width: "auto" } }
                        exit={ { opacity: 0, width: 0 } }
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        { currentVariant.text }
                    </motion.span>
                ) }
            </AnimatePresence>
        </motion.div>
    );
}


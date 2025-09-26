import { memo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} props.content
 */
function TimeTooltipComponent ( { children, content } ) {
    return (
        <TooltipProvider delayDuration={ 300 }>
            <Tooltip>
                <TooltipTrigger asChild>{ children }</TooltipTrigger>
                <TooltipContent sideOffset={ 5 } className="max-w-xs">
                    { content }
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Memoize the component to prevent unnecessary re-renders
// export const TimeTooltip = memo( TimeTooltipComponent )
export const TimeTooltip = TimeTooltipComponent


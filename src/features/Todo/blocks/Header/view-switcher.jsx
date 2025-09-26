
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import useTasksStore from "@/store/task.store";
import * as utils from 'akashatools';
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { TODO_VIEWS_CONFIG } from "@/lib/config/config";

export function ViewSwitcher () {
    const navigate = useNavigate();
    const { currentView, setCurrentView } = useTasksStore();

    return (
        <div className="flex items-center space-x-0.5">
            <TooltipProvider>
                { TODO_VIEWS_CONFIG?.map( ( view, index ) => (
                    <Tooltip key={ view?.value }>
                        <TooltipTrigger asChild
                            className={ twMerge(
                                index === 0 && 'rounded-l-full',
                                index === TODO_VIEWS_CONFIG.length - 1 && 'rounded-r-full',
                            ) }>
                            <Button
                                variant={ currentView === view?.value ? "default" : "outline" }
                                size="sm"
                                className="h-7 px-4 py-2 text-xs"
                                onClick={ () => {
                                    setCurrentView( view?.value );
                                    navigate( `./../${ view?.value }` );
                                } }
                            >
                                { view?.icon }
                                <span className="sr-only md:not-sr-only md:ml-1">{ view?.label }</span>
                            </Button>
                        </TooltipTrigger>
                        { view?.label && ( <TooltipContent>
                            <p className="text-xs">{ view?.label } View</p>
                        </TooltipContent> ) }
                    </Tooltip>
                ) ) }
            </TooltipProvider>
        </div>
    );
}

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import * as utils from 'akashatools';
import { LucideFilter } from "lucide-react";

const TaskFilters = ( {
    classNames = '',
    statusOptions,
    priorityOptions,
    difficultyOptions,
    activeStatusFilters,
    activePriorityFilters,
    activeDifficultyFilters,
    setStatusFilters,
    setPriorityFilters,
    setDifficultyFilters,
    popoverTrigger,
} ) => {
    return (
        <div className="task-filters flex">
            <Popover>
                <PopoverTrigger asChild>
                    { popoverTrigger ? popoverTrigger : ( <Button
                        className={ `px-4 py-3 m-0 rounded-xl focus:outline-none h-6 w-auto focus-within:outline-none focus-visible:outline-none ${ classNames }` }
                        variant="outline"
                    >
                        <LucideFilter className={ `p-0 m-0 !size-4` } />
                    </Button> ) }
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <FilterSection
                            title="Status"
                            options={ statusOptions }
                            activeFilters={ activeStatusFilters }
                            setFilters={ setStatusFilters }
                        />
                        <FilterSection
                            title="Priority"
                            options={ priorityOptions }
                            activeFilters={ activePriorityFilters }
                            setFilters={ setPriorityFilters }
                        />
                        <FilterSection
                            title="Difficulty"
                            options={ difficultyOptions }
                            activeFilters={ activeDifficultyFilters }
                            setFilters={ setDifficultyFilters }
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};


const FilterSection = ( props ) => {
    const {
        title,
        options,
        activeFilters,
        setFilters,
    } = props;

    return (
        <div className="mb-4">
            <h3 className="font-semibold mb-2">{ title }</h3>
            { options.map( ( option ) => (
                <div key={ option } className="flex items-center space-x-2 mb-1">
                    <Checkbox
                        id={ `${ title }-${ option }` }
                        checked={ activeFilters.includes( option ) }
                        onCheckedChange={ ( checked ) => {
                            if ( checked ) {
                                setFilters( [ ...activeFilters, option ] );
                            } else {
                                setFilters( activeFilters.filter( ( filter ) => filter !== option ) );
                            }
                        } }
                    />
                    <Label htmlFor={ `${ title }-${ option }` }>{ option }</Label>
                </div>
            ) ) }
        </div>
    );
};


TaskFilters.Section = FilterSection;

export default TaskFilters


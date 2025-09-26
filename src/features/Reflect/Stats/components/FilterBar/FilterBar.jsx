import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import DataKeyDropdown from "../DataForm/DataKeyDropdown";

const FilterBar = ( {
    searchTerm = "",
    onSearchChange,
    filterOptions = [],
    selectedTypeFilter = "",
    onTypeFilterChange,
    selectedKeyFilter = "",
    onKeyFilterChange,
    className = "",
    searchPlaceholder = "Search...",
    filterPlaceholder = "Filter",
    filterIcon = <Filter className={ `h-4 w-4 mr-1` } />,
    clearFiltersButton = <></>,
} ) => {
    return (
        <div className={ `flex flex-1 py-0 justify-center items-center space-x-2 ${ className }` }>
            { filterOptions.length > 0 && (
                <Select value={ selectedTypeFilter } onValueChange={ onTypeFilterChange }>
                    <SelectTrigger className={ `w-40 h-8 text-white text-xs` }>
                        { filterIcon }
                        <SelectValue placeholder={ filterPlaceholder } className={ `` } />
                    </SelectTrigger>
                    <SelectContent className={ `text-white` }>
                        { filterOptions.map( ( option ) => (
                            <SelectItem key={ option.value } value={ option.value }>
                                { option.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            ) }

            <div className={ `` }>
                <DataKeyDropdown
                    isFilter={ true }
                    value={ selectedKeyFilter }
                    onChange={ onKeyFilterChange }
                    onBlur={ () => validateAndSetErrors() }
                    error={ {} }
                />
            </div>

            <div className="relative flex-1">
                <Search className={ `h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2` } />
                <Input
                    placeholder={ searchPlaceholder }
                    value={ searchTerm }
                    onChange={ ( e ) => onSearchChange( e.target.value ) }
                    className="pl-8 h-8 text-white text-sm"
                />
                { searchTerm && searchTerm?.length > 0 && (
                    <X className={ twMerge(
                        `h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400`,
                        `hover:text-primary-purple-200/40`
                    ) } />
                ) }
            </div>

            {/* Clear filters button */ }
            { clearFiltersButton ? clearFiltersButton : <></> }

        </div>
    );
};

export default React.memo( FilterBar )


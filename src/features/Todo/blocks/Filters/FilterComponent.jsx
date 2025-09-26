// Create a new file for the filter component with more compact styling

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Filter } from "lucide-react";
import * as utils from 'akashatools';

export function FilterComponent ( { onFiltersChange, availableFields } ) {
    const [ filters, setFilters ] = useState( [] );
    const [ newFilterField, setNewFilterField ] = useState( availableFields[ 0 ] );
    const [ newFilterValue, setNewFilterValue ] = useState( "" );
    const [ isAdding, setIsAdding ] = useState( false );

    const addFilter = () => {
        if ( !newFilterValue.trim() ) return;

        const newFilter = {
            id: `filter-${ Date.now() }`,
            field: newFilterField,
            value: newFilterValue,
        };

        const updatedFilters = [ ...filters, newFilter ];
        setFilters( updatedFilters );
        onFiltersChange( updatedFilters );
        setNewFilterValue( "" );
        setIsAdding( false );
    };

    const removeFilter = ( id ) => {
        const updatedFilters = filters.filter( ( filter ) => filter.id !== id );
        setFilters( updatedFilters );
        onFiltersChange( updatedFilters );
    };

    const formatFieldName = ( field ) => {
        return field.charAt( 0 ).toUpperCase() + field.slice( 1 );
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            { filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mr-1">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    { filters.map( ( filter ) => (
                        <Badge key={ filter.id } variant="secondary" className="h-6 text-xs px-1.5 gap-1">
                            <span className="font-medium">{ formatFieldName( filter.field ) }:</span> { filter.value }
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1 -mr-1"
                                onClick={ () => removeFilter( filter.id ) }
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ) ) }
                </div>
            ) }

            { isAdding ? (
                <div className="flex items-center gap-1">
                    <Select value={ newFilterField } onValueChange={ setNewFilterField }>
                        <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                            { availableFields.map( ( field ) => (
                                <SelectItem key={ field } value={ field } className="text-xs">
                                    { formatFieldName( field ) }
                                </SelectItem>
                            ) ) }
                        </SelectContent>
                    </Select>

                    <Input
                        value={ newFilterValue }
                        onChange={ ( e ) => setNewFilterValue( e.target.value ) }
                        placeholder="Filter value..."
                        className="h-7 w-32 text-xs"
                        onKeyDown={ ( e ) => {
                            if ( e.key === "Enter" ) addFilter();
                            if ( e.key === "Escape" ) setIsAdding( false );
                        } }
                    />

                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={ addFilter }>
                        <Plus className="h-3 w-3" />
                    </Button>

                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={ () => setIsAdding( false ) }>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={ () => setIsAdding( true ) }>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Filter
                </Button>
            ) }
        </div>
    );
}

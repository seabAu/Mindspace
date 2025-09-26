

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";

export function DynamicArrayInput ( { label, items = [], onAdd, onRemove, onItemChange, renderItem } ) {
    const handleItemChange = ( index, fieldOrValue, value ) => {
        const newItems = [ ...items ];
        if ( typeof newItems[ index ] === "object" && newItems[ index ] !== null ) {
            newItems[ index ] = { ...newItems[ index ], [ fieldOrValue ]: value };
        } else {
            newItems[ index ] = fieldOrValue;
        }
        onChange( newItems );
    };

    const addItem = () => {
        onChange( [ ...items, defaultItem ] );
    };

    const removeItem = ( index ) => {
        onChange( items.filter( ( _, i ) => i !== index ) );
    };

    return (
        <div className="space-y-2">
            { label && <Label className="text-xs">{ label }</Label> }
            <div className="space-y-2">
                { items && Array.isArray( items ) && items?.length > 0 && items.map( ( item, index ) => (
                    <div key={ index } className="flex items-start gap-2">
                        <div className="flex-grow">{ renderItem( item, index, onItemChange ) }</div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={ () => onRemove( index ) }
                            className="h-9 w-9 shrink-0 mt-0.5"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) ) }
            </div>
            <Button type="button" variant="outline" size="sm" onClick={ onAdd } className="h-8 bg-transparent">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
        </div>
    );
}

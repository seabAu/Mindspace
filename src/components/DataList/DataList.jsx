import { cn } from "@/lib/utils";
import { useState } from "react";

export function DataList ( { children, className, ...props } ) {
    return (
        <div className={ cn( "grid gap-2", className ) } { ...props }>
            { children }
        </div>
    );
}

export function DataListItem ( { label, value, editable = false, onEdit, editComponent, className, ...props } ) {
    const [ isEditing, setIsEditing ] = useState( false );

    const handleDoubleClick = () => {
        if ( editable ) {
            setIsEditing( true );
        }
    };

    const handleSave = ( newValue ) => {
        if ( onEdit ) {
            onEdit( newValue );
        }
        setIsEditing( false );
    };

    const handleCancel = () => {
        setIsEditing( false );
    };

    return (
        <div className={ cn( "grid grid-cols-12 gap-4 py-2", className ) } onDoubleClick={ handleDoubleClick } { ...props }>
            <div className="col-span-3 font-medium text-sm text-muted-foreground">{ label }</div>
            <div className="col-span-8">
                { isEditing && editComponent ? (
                    cloneElement( editComponent, {
                        value,
                        onSave: handleSave,
                        onCancel: handleCancel,
                    } )
                ) : (
                    <div className={ cn( "text-sm", editable && "cursor-pointer hover:bg-muted/50 p-1 rounded" ) }>{ value }</div>
                ) }
            </div>
        </div>
    );
}


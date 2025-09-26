import { useState, forwardRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArrayOfTypeInput from "./ArrayOfTypeInput";

const ArrayTypeSelector = forwardRef( ( { value = [], onChange, onClear, compact = true, onKeyDown }, ref ) => {
    const [ arrayType, setArrayType ] = useState( "String" );
    const [ showTypeSelector, setShowTypeSelector ] = useState( !Array.isArray( value ) || value.length === 0 );

    const handleTypeSelect = ( type ) => {
        setArrayType( type );
        setShowTypeSelector( false );

        // Initialize with empty array if not already an array
        if ( !Array.isArray( value ) ) {
            onChange( [] );
        }
    };

    return (
        <div className="space-y-1">
            { showTypeSelector ? (
                <div className="space-y-1">
                    <Select value={ arrayType } onValueChange={ handleTypeSelect }>
                        <SelectTrigger className={ `text-xs bg-gray-700 border-gray-600 text-white ${ compact ? "h-6" : "h-8" }` }>
                            <SelectValue placeholder="Array Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            { [
                                { value: "String", label: "String[]" },
                                { value: "Number", label: "Number[]" },
                                { value: "Boolean", label: "Boolean[]" },
                                { value: "Date", label: "Date[]" },
                                { value: "Mixed", label: "Mixed[]" },
                            ].map( ( item ) => (
                                <SelectItem value={ item.value } className={ `text-xs` }>
                                    { item.label }
                                </SelectItem>
                            ) ) }
                            {/* <SelectItem value="String" className="text-xs">
                                String[]
                            </SelectItem>
                            <SelectItem value="Number" className="text-xs">
                                Number[]
                            </SelectItem>
                            <SelectItem value="Boolean" className="text-xs">
                                Boolean[]
                            </SelectItem>
                            <SelectItem value="Date" className="text-xs">
                                Date[]
                            </SelectItem>
                            <SelectItem value="Mixed" className="text-xs">
                                Mixed[]
                            </SelectItem> */}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <ArrayOfTypeInput
                    value={ value }
                    onChange={ onChange }
                    arrayType={ arrayType }
                    compact={ compact }
                    ref={ ref }
                    onKeyDown={ onKeyDown }
                />
            ) }
        </div>
    );
} );

ArrayTypeSelector.displayName = "ArrayTypeSelector";

export default ArrayTypeSelector;

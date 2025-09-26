import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import DataValueInput from "./DataValueInput";

const ArrayOfTypeInput = forwardRef(
    ( { value = [], onChange, arrayType = "String", compact = true, onKeyDown }, ref ) => {
        const [ newItem, setNewItem ] = useState( "" );

        const addItem = () => {
            let typedValue;

            switch ( arrayType ) {
                case "String":
                    typedValue = String( newItem );
                    break;
                case "Number":
                    typedValue = Number( newItem );
                    break;
                case "Boolean":
                    typedValue = Boolean( newItem === "true" || newItem === "1" || newItem === "yes" );
                    break;
                case "Date":
                    typedValue = new Date( newItem );
                    break;
                case "Mixed":
                    try {
                        typedValue = JSON.parse( newItem );
                    } catch ( e ) {
                        typedValue = String( newItem );
                    }
                    break;
                default:
                    typedValue = String( newItem );
            }

            onChange( [ ...value, typedValue ] );
            setNewItem( "" );
        };

        const removeItem = ( index ) => {
            const newArray = [ ...value ];
            newArray.splice( index, 1 );
            onChange( newArray );
        };

        const updateItem = ( index, newValue ) => {
            const newArray = [ ...value ];
            newArray[ index ] = newValue;
            onChange( newArray );
        };

        const handleKeyDown = ( e ) => {
            if ( e.key === "Enter" && ( e.ctrlKey || e.metaKey ) ) {
                e.preventDefault();
                addItem();
            }

            if ( onKeyDown ) {
                onKeyDown( e );
            }
        };

        return (
            <div className="space-y-1">
                <div className="text-xs text-gray-400 mb-1">Array of { arrayType }</div>

                { Array.isArray( value ) && value.length > 0 && (
                    <div className="space-y-1 mb-2">
                        { value.map( ( item, index ) => (
                            <div key={ index } className="flex items-center space-x-1">
                                <div className="flex-grow">
                                    <DataValueInput
                                        dataType={ arrayType }
                                        value={ item }
                                        onChange={ ( newValue ) => updateItem( index, newValue ) }
                                        compact={ compact }
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={ `flex-shrink-0 text-red-500 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
                                    onClick={ () => removeItem( index ) }
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                            </div>
                        ) ) }
                    </div>
                ) }

                <div className="flex items-center space-x-1">
                    <div className="flex-grow">
                        <DataValueInput
                            dataType={ arrayType }
                            value={ newItem }
                            onChange={ setNewItem }
                            compact={ compact }
                            ref={ ref }
                            onKeyDown={ handleKeyDown }
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={ `flex-shrink-0 text-green-500 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
                        onClick={ addItem }
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        );
    },
);

ArrayOfTypeInput.displayName = "ArrayOfTypeInput";

export default ArrayOfTypeInput;

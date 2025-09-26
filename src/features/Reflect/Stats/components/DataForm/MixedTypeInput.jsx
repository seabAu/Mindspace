import { forwardRef } from 'react';
import { MixedInput } from './DataTypeInputs';

const MixedTypeInput = forwardRef(
    ( { value, onChange, onClear, compact = true, onKeyDown }, ref ) => {
        return (
            <MixedInput
                value={ value }
                onChange={ onChange }
                onClear={ onClear }
                compact={ compact }
                ref={ ref }
                onKeyDown={ onKeyDown }
            />
        );
    },
);

MixedTypeInput.displayName = 'MixedTypeInput';

export default MixedTypeInput;

/* import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StringInput, NumberInput, BooleanInput, DateInput, ObjectInput, ArrayInput } from "./DataTypeInputs";
import { DATA_TYPES } from "../../../../lib/config/config";

const MixedTypeInput = ( { value, onChange, onClear } ) => {
  // Determine the initial type based on the value
  const getValueType = ( val ) => {
    console.log( "MixedTypeInput :: getValueType :: val = ", val, " :: ", "typeof val = ", typeof val );
    if ( val === null || val === undefined ) return "string";
    if ( typeof val === "string" ) return "string";
    if ( typeof val === "number" ) return "number";
    if ( typeof val === "boolean" ) return "boolean";
    if ( val instanceof Date ) return "date";
    if ( Array.isArray( val ) ) return "array";
    if ( typeof val === "object" ) return "object";
    return "string";
  };

  const [ valueType, setValueType ] = useState( getValueType( value ) );

  // Update the value type when the value changes externally
  useEffect( () => {
    setValueType( getValueType( value ) );
  }, [ value ] );

  // Convert the value when the type changes
  const handleTypeChange = ( newType ) => {
    setValueType( newType );

    // Convert the value to the new type
    let convertedValue;
    switch ( newType ) {
      case "string":
        convertedValue = value !== null && value !== undefined ? String( value ) : "";
        break;
      case "number":
        convertedValue = Number( value ) || 0;
        break;
      case "boolean":
        convertedValue = Boolean( value );
        break;
      case "date":
        convertedValue = value instanceof Date ? value : new Date();
        break;
      case "array":
        convertedValue = Array.isArray( value ) ? value : [];
        break;
      case "object":
        convertedValue = typeof value === "object" && !Array.isArray( value ) && value !== null ? value : {};
        break;
      default:
        convertedValue = "";
    }

    onChange( convertedValue );
  };

  // Render the appropriate input based on the current type
  const renderInput = () => {
    switch ( valueType ) {
      case "string":
        return <StringInput value={ value } onChange={ onChange } onClear={ onClear } />;
      case "number":
        return <NumberInput value={ value } onChange={ onChange } onClear={ onClear } />;
      case "boolean":
        return <BooleanInput value={ value } onChange={ onChange } />;
      case "date":
        return <DateInput value={ value } onChange={ onChange } onClear={ onClear } />;
      case "array":
        return <ArrayInput value={ value } onChange={ onChange } onClear={ onClear } />;
      case "object":
        return <ObjectInput value={ value } onChange={ onChange } onClear={ onClear } />;
      default:
        return <StringInput value={ value } onChange={ onChange } onClear={ onClear } />;
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex space-x-1 mb-1">
        <Select value={ valueType } onValueChange={ handleTypeChange }>
          <SelectTrigger className="h-6 text-xs bg-gray-700 border-gray-600 text-white w-24">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            { DATA_TYPES.map( ( o ) => ( <SelectItem key={ o?.value } value={ o?.value }>{ o?.label }</SelectItem> ) )
            }
          </SelectContent>
        </Select>
      </div>
      { renderInput() }
    </div>
  );
};

export default MixedTypeInput;
 */

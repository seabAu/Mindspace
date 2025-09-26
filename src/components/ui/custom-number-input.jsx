"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

export function CustomNumberInput ( { value, onChange, min, max, step = 1, disabled, placeholder } ) {
    const handleIncrement = () => {
        const numericValue = Number( value ) || 0;
        const newValue = numericValue + step;
        if ( max === undefined || newValue <= max ) {
            onChange( newValue );
        }
    };

    const handleDecrement = () => {
        const numericValue = Number( value ) || 0;
        const newValue = numericValue - step;
        if ( min === undefined || newValue >= min ) {
            onChange( newValue );
        }
    };

    const handleChange = ( e ) => {
        const val = e.target.value;
        if ( val === "" ) {
            onChange( null );
            return;
        }
        const num = Number( val );
        if ( !isNaN( num ) && ( min === undefined || num >= min ) && ( max === undefined || num <= max ) ) {
            onChange( num );
        } else if ( !isNaN( num ) && min !== undefined && num < min ) {
            onChange( min );
        } else if ( !isNaN( num ) && max !== undefined && num > max ) {
            onChange( max );
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={ handleDecrement }
                disabled={ disabled || ( min !== undefined && ( Number( value ) || 0 ) <= min ) }
            >
                <MinusIcon className="h-4 w-4" />
            </Button>
            <Input
                type="number"
                value={ value === null || value === undefined ? "" : value }
                onChange={ handleChange }
                min={ min }
                max={ max }
                step={ step }
                className="w-20 text-center h-8"
                disabled={ disabled }
                placeholder={ placeholder }
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={ handleIncrement }
                disabled={ disabled || ( max !== undefined && ( Number( value ) || 0 ) >= max ) }
            >
                <PlusIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}

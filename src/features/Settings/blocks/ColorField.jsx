
"use client";

import { useState, useCallback } from "react";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Color field component for selecting and displaying colors
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.value - Current color value (hex)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Color field component
 */
export default function ColorField ( { label, value, onChange, className = "" } ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ inputValue, setInputValue ] = useState( value || "" );

    // console.log( "ColorField :: value = ", value );
    /**
     * Validates hex color format
     * @param {string} hex - Hex color string
     * @returns {boolean} Whether the hex is valid
     */
    const isValidHex = useCallback( ( hex ) => {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test( hex );
    }, [] );

    /**
     * Handles input change with validation
     * @param {string} newValue - New input value
     */
    const handleInputChange = useCallback(
        ( newValue ) => {
            setInputValue( newValue );

            if ( newValue === "" || isValidHex( newValue ) ) {
                onChange( newValue );
            }
        },
        [ onChange, isValidHex ],
    );

    /**
     * Handles color picker change
     * @param {Event} event - Color input change event
     */
    const handleColorChange = useCallback(
        ( event ) => {
            const newColor = event.target.value;
            setInputValue( newColor );
            onChange( newColor );
        },
        [ onChange ],
    );

    /**
     * Clears the color value
     */
    const handleClear = useCallback( () => {
        setInputValue( "" );
        onChange( "" );
    }, [ onChange ] );

    /**
     * Predefined color palette
     */
    const colorPalette = [
        "#000000",
        "#ffffff",
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
        "#ffa500",
        "#800080",
        "#008000",
        "#ffc0cb",
        "#a52a2a",
        "#808080",
        "#000080",
        "#008080",
        "#800000",
        "#808000",
        "#c0c0c0",
        "#ff6347",
    ];

    return (
        <div className={ `space-y-1 ${ className }` }>
            <Label className="text-xs font-medium">{ label }</Label>
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <Input
                        type="text"
                        value={ inputValue }
                        onChange={ ( e ) => handleInputChange( e.target.value ) }
                        placeholder="#000000"
                        className="h-7 text-xs font-mono"
                    />
                </div>

                <Popover open={ isOpen } onOpenChange={ setIsOpen }>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-2 bg-transparent"
                            style={ {
                                backgroundColor: value && isValidHex( value ) ? value : "transparent",
                                borderColor: value && isValidHex( value ) ? value : "hsl(var(--border))",
                            } }
                        >
                            { !value || !isValidHex( value ) ? <Palette className="h-3 w-3" /> : null }
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Color Picker</Label>
                                { value && (
                                    <Button variant="ghost" size="sm" onClick={ handleClear } className="h-6 w-6 p-0">
                                        <X className="h-3 w-3" />
                                    </Button>
                                ) }
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="color"
                                    value={ value && isValidHex( value ) ? value : "#000000" }
                                    onChange={ handleColorChange }
                                    className="w-full h-8 rounded border cursor-pointer"
                                />

                                <div className="grid grid-cols-5 gap-1">
                                    { colorPalette.map( ( color ) => (
                                        <button
                                            key={ color }
                                            type="button"
                                            className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                                            style={ {
                                                backgroundColor: color,
                                                borderColor: value === color ? "hsl(var(--ring))" : "hsl(var(--border))",
                                            } }
                                            onClick={ () => {
                                                setInputValue( color );
                                                onChange( color );
                                            } }
                                            title={ color }
                                        />
                                    ) ) }
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Hex Value</Label>
                                <Input
                                    type="text"
                                    value={ inputValue }
                                    onChange={ ( e ) => handleInputChange( e.target.value ) }
                                    placeholder="#000000"
                                    className="h-7 text-xs font-mono"
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            { inputValue && !isValidHex( inputValue ) && <p className="text-[10px] text-red-500">Invalid hex color format</p> }
        </div>
    );
}


/* import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export default function ColorField ( { label, value, onChange } ) {
    const [ local, setLocal ] = useState( value || "" );
    const rafRef = useRef( null );

    useEffect( () => {
        setLocal( value || "" );
    }, [ value ] );

    const isValid = !local || HEX_REGEX.test( local );

    function emit ( hex ) {
        if ( !onChange ) return;
        if ( rafRef.current ) cancelAnimationFrame( rafRef.current );
        // Batch updates to one per frame to reduce lag while dragging
        rafRef.current = requestAnimationFrame( () => {
            onChange( hex );
        } );
    }

    function handleTextChange ( e ) {
        const v = e.target.value;
        setLocal( v );
        if ( HEX_REGEX.test( v ) ) {
            emit( v );
        }
    }

    function handlePickerChange ( e ) {
        const v = e.target.value;
        setLocal( v );
        emit( v );
    }

    return (
        <div className="space-y-1">
            <Label className="text-xs font-medium">{ label }</Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    className="w-8 h-8 rounded-md cursor-pointer"
                    value={ local || "#000000" }
                    onChange={ handlePickerChange }
                    onInput={ handlePickerChange }
                />
                <Input
                    value={ local }
                    onChange={ handleTextChange }
                    placeholder="#RRGGBB"
                    className={ `h-7 text-xs ${ isValid ? "" : "border-destructive" }` }
                    spellCheck={ false }
                    inputMode="text"
                />
            </div>
            { !isValid && (
                <p className="text-[10px] text-destructive mt-0.5">Enter a valid hex color (#RGB or #RRGGBB)</p>
            ) }
        </div>
    );
}
 */
"use client";

import { SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Select } from "@/components/ui/select";

import React, { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, AlignLeft, AlignJustify } from "lucide-react";
import { format, isDate, isValid } from "date-fns";
import ArrayTypeSelector from "./ArrayTypeSelector";
import DateTimeClockPicker from "./DateTimeClockPicker";
import TimeRangeInput, { TimeInput } from "./TimeInput";

export const StringInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    const [ useTextarea, setUseTextarea ] = useState( false );

    return (
        <div className="relative w-full">
            <div className="absolute right-8 top-0 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className={ compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0" }
                    onClick={ () => setUseTextarea( !useTextarea ) }
                >
                    { useTextarea ? <AlignLeft className="h-3 w-3" /> : <AlignJustify className="h-3 w-3" /> }
                </Button>
            </div>

            { useTextarea ? (
                <Textarea
                    value={ value || "" }
                    onChange={ ( e ) => onChange( e.target.value ) }
                    className={ `pr-16 border-gray-600 text-white text-sm min-h-[60px] ${ compact ? "text-xs" : "" }` }
                    ref={ ref }
                    onKeyDown={ onKeyDown }
                />
            ) : (
                <Input
                    value={ value || "" }
                    onChange={ ( e ) => onChange( e.target.value ) }
                    className={ `pr-16 border-gray-600 text-white text-sm ${ compact ? "h-6 text-xs" : "h-8" }` }
                    ref={ ref }
                    onKeyDown={ onKeyDown }
                />
            ) }

            <Button
                variant="ghost"
                size="icon"
                className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
                onClick={ onClear }
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
} );

StringInput.displayName = "StringInput";

export const NumberInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => (
    <div className="relative w-full">
        <Input
            type="number"
            value={ value || "" }
            onChange={ ( e ) => onChange( Number( e.target.value ) ) }
            className={ `pr-8 border-gray-600 text-white text-sm ${ compact ? "h-6 text-xs" : "h-8" }` }
            ref={ ref }
            onKeyDown={ onKeyDown }
        />
        <Button
            variant="ghost"
            size="icon"
            className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
            onClick={ onClear }
        >
            <X className="h-3 w-3" />
        </Button>
    </div>
) );

NumberInput.displayName = "NumberInput";

export const BooleanInput = forwardRef( ( { value, onChange, dataType, className, compact = true, onKeyDown }, ref ) => (
    <div className={ `flex items-center ${ compact ? "h-6" : "h-8" }` }>
        <Checkbox
            checked={ Boolean( value ) }
            onCheckedChange={ onChange }
            className="border-gray-600"
            ref={ ref }
            onKeyDown={ onKeyDown }
        />
    </div>
) );

BooleanInput.displayName = "BooleanInput";

export const DateInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    // Ensure we have a valid date or null
    const parseDate = ( dateValue ) => {
        if ( !dateValue ) return null;

        const parsedDate = new Date( dateValue );
        return isValid( parsedDate ) ? parsedDate : null;
    };

    const [ date, setDate ] = React.useState( parseDate( value ) );

    React.useEffect( () => {
        setDate( parseDate( value ) );
    }, [ value ] );

    const handleSelect = ( newDate ) => {
        setDate( newDate );
        onChange( newDate );
    };

    const handleClear = () => {
        setDate( null );
        if ( onClear ) onClear();
    };

    const handleDateTimeSelect = ( newDate, newTime ) => {
        console.log( `DateInput :: handleDateTimeSelect :: Selected: ${ newDate } at ${ newTime }` );
        let d = new Date( newDate );
        if ( newTime ) d.setTime( newTime );
        handleSelect( d );
    };

    return (
        <div className="relative w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={ `w-full justify-start text-left font-normal pr-8 border-gray-600 text-white ${ compact ? "h-6 text-xs" : "h-8 text-sm" }` }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        { date && isValid( date ) ? format( date, "PP" ) : <span>Pick a date</span> }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-sextary-800 border-gray-700">
                    {/* <DateTimeClockPicker
            selectedDate={ date }
            setSelectedDate={ setDate }
            selectedTime={ time }
            setSelectedTime={ setTime }
            events={ [] }
            onSelectDateTime={ ( date, time ) => handleDateTimeSelect( date, time ) }
          /> */}
                    <Calendar
                        mode="single"
                        selected={ date }
                        onSelect={ handleSelect }
                        initialFocus
                        className="text-white bg-sextary-600 !m-0"
                        // startMonth={ new Date( new Date().getFullYear() - 5, new Date().getMonth(), 0 ) }
                        // endMonth={ new Date( 2025, 9 ) }
                        defaultMonth={ new Date( Date.now() ) }
                    />
                </PopoverContent>
            </Popover>
            <Button
                variant="ghost"
                size="icon"
                className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
                onClick={ handleClear }
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
} );

DateInput.displayName = "DateInput";

export const DateTimeInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    const handleClear = () => {
        if ( onClear ) onClear();
    };

    // console.log( "Stats feature :: DateTimeInput :: value = ", value );
    return (
        <>
            {
                value && isValid( value )
                    ? (
                        <DateTimeClockPicker
                            value={ new Date( value || new Date( Date.now() ) ) }
                            onChange={ onChange }
                            onClear={ handleClear }
                            compact={ compact }
                            maxClockWidth={ 180 }
                            maxClockHeight={ 180 }
                        />
                    )
                    : (
                        <></>
                    )
            }
        </>
    );
} );

DateTimeInput.displayName = "DateTimeInput";

export const TimeOnlyInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    return (
        <TimeInput value={ value } onChange={ onChange } onClear={ onClear } compact={ compact } onKeyDown={ onKeyDown } ref={ ref } />
    );
} );

TimeOnlyInput.displayName = "TimeOnlyInput";

export const TimeRangeOnlyInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    return (
        <TimeRangeInput
            dataType={ dataType }
            className={ className }
            value={ value }
            onChange={ onChange }
            onClear={ onClear }
            compact={ compact }
            onKeyDown={ onKeyDown }
            ref={ ref }
        />
    );
} );

TimeRangeOnlyInput.displayName = "TimeRangeOnlyInput";

export const ObjectInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => (
    <div className="relative w-full">
        <Textarea
            value={ typeof value === "object" && value !== null ? JSON.stringify( value, null, 2 ) : "" }
            onChange={ ( e ) => {
                try {
                    onChange( JSON.parse( e.target.value ) );
                } catch ( error ) {
                    onChange( e.target.value );
                }
            } }
            className={ `pr-8 border-gray-600 text-white min-h-[60px] ${ compact ? "text-xs" : "text-sm" }` }
            ref={ ref }
            onKeyDown={ onKeyDown }
        />
        <Button
            variant="ghost"
            size="icon"
            className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
            onClick={ onClear }
        >
            <X className="h-3 w-3" />
        </Button>
    </div>
) );

ObjectInput.displayName = "ObjectInput";

export const ArrayInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    return (
        <ArrayTypeSelector
            dataType={ dataType }
            className={ className }
            value={ value }
            onChange={ onChange }
            onClear={ onClear }
            compact={ compact }
            ref={ ref }
            onKeyDown={ onKeyDown }
        />
    );
} );

ArrayInput.displayName = "ArrayInput";

export const ObjectIdInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => (
    <div className="relative w-full">
        <Input
            value={ value || "" }
            onChange={ ( e ) => onChange( e.target.value ) }
            className={ `pr-8 border-gray-600 text-white ${ compact ? "h-6 text-xs" : "h-8 text-sm" }` }
            placeholder="ObjectId"
            ref={ ref }
            onKeyDown={ onKeyDown }
        />
        <Button
            variant="ghost"
            size="icon"
            className={ `absolute right-0 top-0 p-0 ${ compact ? "h-6 w-6" : "h-8 w-8" }` }
            onClick={ onClear }
        >
            <X className="h-3 w-3" />
        </Button>
    </div>
) );

ObjectIdInput.displayName = "ObjectIdInput";

export const MixedInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    const [ inputType, setInputType ] = useState(
        typeof value === "string"
            ? "string"
            : typeof value === "number"
                ? "number"
                : typeof value === "boolean"
                    ? "boolean"
                    : Array.isArray( value )
                        ? "array"
                        : value instanceof Date
                            ? "date"
                            : "object",
    );

    const renderInput = () => {
        switch ( inputType ) {
            case "string":
                return (
                    <StringInput
                        dataType={ dataType }
                        className={ className }
                        value={ value }
                        onChange={ onChange }
                        onClear={ onClear }
                        compact={ compact }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    />
                );
            case "number":
                return (
                    <NumberInput
                        dataType={ dataType }
                        className={ className }
                        value={ value }
                        onChange={ onChange }
                        onClear={ onClear }
                        compact={ compact }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    />
                );
            case "boolean":
                return <BooleanInput value={ value } onChange={ onChange } compact={ compact } ref={ ref } onKeyDown={ onKeyDown } />;
            case "date":
                return (
                    <DateInput
                        dataType={ dataType }
                        className={ className }
                        value={ value }
                        onChange={ onChange }
                        onClear={ onClear }
                        compact={ compact }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    />
                );
            case "array":
                return (
                    <ArrayInput
                        dataType={ dataType }
                        className={ className }
                        value={ value }
                        onChange={ onChange }
                        onClear={ onClear }
                        compact={ compact }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    />
                );
            case "object":
            default:
                return (
                    <ObjectInput
                        dataType={ dataType }
                        className={ className }
                        value={ value }
                        onChange={ onChange }
                        onClear={ onClear }
                        compact={ compact }
                        ref={ ref }
                        onKeyDown={ onKeyDown }
                    />
                );
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex space-x-1 mb-1">
                <Select value={ inputType } onValueChange={ setInputType }>
                    <SelectTrigger className={ `text-xs border-gray-600 text-white ${ compact ? "h-5" : "h-7" }` }>
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-sextary-800 border-gray-700 text-white">
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            { renderInput() }
        </div>
    );
} );

MixedInput.displayName = "MixedInput";

export const CustomInput = forwardRef( ( { value, onChange, dataType, className, onClear, compact = true, onKeyDown }, ref ) => {
    // Similar to MixedInput but could have additional customization options
    return (
        <MixedInput value={ value } onChange={ onChange } onClear={ onClear } compact={ compact } ref={ ref } onKeyDown={ onKeyDown } />
    );
} );

CustomInput.displayName = "CustomInput";

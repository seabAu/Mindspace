'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import * as utils from 'akashatools';
import { getSortedTimezones } from '@/lib/utilities/time';

/**
 * Convert UTC datetime to local datetime string for datetime-local input
 * @param {string|Date} utcDateTime - UTC datetime
 * @param {string} timezone - Target timezone (e.g., 'America/Chicago')
 * @returns {string} Local datetime string in YYYY-MM-DDTHH:mm format
 */
const utcToLocalInputValue = ( utcDateTime, timezone = 'America/Chicago' ) => {
    if ( !utcDateTime ) return '';

    try {
        const utcDate = new Date( utcDateTime );
        if ( isNaN( utcDate.getTime() ) ) return '';

        const formatter = new Intl.DateTimeFormat( 'en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        } );

        const parts = formatter.formatToParts( utcDate );
        const year = parts.find( ( p ) => p.type === 'year' ).value;
        const month = parts.find( ( p ) => p.type === 'month' ).value;
        const day = parts.find( ( p ) => p.type === 'day' ).value;
        const hour = parts.find( ( p ) => p.type === 'hour' ).value;
        const minute = parts.find( ( p ) => p.type === 'minute' ).value;

        return `${ year }-${ month }-${ day }T${ hour }:${ minute }`;
    } catch ( error ) {
        console.error( 'Error converting UTC to local input value:', error );
        return '';
    }
};

/**
 * Convert local datetime input to UTC ISO string
 * @param {string} localDateTime - Local datetime string from input
 * @param {string} timezone - Source timezone (e.g., 'America/Chicago')
 * @returns {string} UTC ISO string
 */
const localInputToUTC = ( localDateTime, timezone = 'America/Chicago' ) => {
    if ( !localDateTime ) return null;

    try {
        const [ datePart, timePart ] = localDateTime.split( 'T' );
        const [ year, month, day ] = datePart.split( '-' ).map( Number );
        const [ hour, minute ] = timePart.split( ':' ).map( Number );

        const localDateString = `${ year }-${ String( month ).padStart(
            2,
            '0',
        ) }-${ String( day ).padStart( 2, '0' ) }T${ String( hour ).padStart(
            2,
            '0',
        ) }:${ String( minute ).padStart( 2, '0' ) }:00`;

        const tempDate = new Date( localDateString );
        const utcTime = tempDate.getTime();
        const utcDate = new Date( utcTime );

        const targetTimezoneDate = new Date(
            utcDate.toLocaleString( 'en-US', { timeZone: timezone } ),
        );
        const utcDateForComparison = new Date(
            utcDate.toLocaleString( 'en-US', { timeZone: 'UTC' } ),
        );
        const offset =
            targetTimezoneDate.getTime() - utcDateForComparison.getTime();

        const correctedUtcDate = new Date( utcTime - offset );
        return correctedUtcDate.toISOString();
    } catch ( error ) {
        console.error( 'Error converting local input to UTC:', error );
        return null;
    }
};

export function DateTimePickerLocal ( {
    value,
    timezone,
    onChange,
    onChangeTimezone,
    classNames,
    ...props
} ) {
    const localValue = utcToLocalInputValue( value, timezone );

    const handleChange = ( e ) => {
        // const newUtcValue = localInputToUTC( e.target.value, timezone );
        const newUtcValue = new Date( e.target.value ).getTime();
        if ( onChange ) {
            onChange( newUtcValue );
        }
    };

    return (
        <Input
            type='datetime-local'
            className={ `${ classNames }` }
            value={ utcToLocalInputValue( localValue, timezone ) }
            onChange={ handleChange }
            { ...props }
        />
    );
}

export function TriggerDatesInput ( {
    dates,
    timezone,
    onChange,
    onChangeTimezone,
    classNames,
    ...props
} ) {
    const timezones = useMemo( () => getSortedTimezones(), [] );

    const handleDateChange = ( index, newUtcDate ) => {
        const newDates = [ ...( dates || [] ) ];
        if ( newUtcDate ) {
            newDates[ index ] = newUtcDate;
            onChange( newDates );
        }
    };

    const addDate = () => {
        const newDates = [ ...( dates || [] ), new Date().toISOString() ];
        onChange( newDates );
    };

    const removeDate = ( index ) => {
        const newDates = ( dates || [] ).filter( ( _, i ) => i !== index );
        onChange( newDates );
    };

    return (
        <div className='space-y-3'>
            <Label className='font-medium'>Specific Trigger Dates</Label>
            <div className='p-2 border rounded-lg bg-muted/20'>
                { ( dates || [] ).map( ( date, index ) => (
                    <div
                        key={ index }
                        className='grid grid-cols-[1fr_auto] items-center gap-2'>
                        <DateTimePickerLocal
                            value={ date }
                            onChange={ ( newUtcDate ) =>
                                handleDateChange( index, newUtcDate )
                            }
                            timezone={ timezone }
                            onChangeTimezone={ onChangeTimezone }
                            required
                            { ...props }
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={ () => removeDate( index ) }
                            className='text-destructive hover:bg-destructive/10'>
                            <Minus className='h-4 w-4' />
                            <span className='sr-only'>Remove date</span>
                        </Button>
                    </div>
                ) ) }
                { ( !dates || dates.length === 0 ) && (
                    <p className='text-sm text-muted-foreground text-center py-2'>
                        No specific trigger dates added.
                    </p>
                ) }

                <div className='grid grid-cols-2 items-center gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={ addDate }
                        className='mt-2 bg-transparent col-span-1'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Date & Time
                    </Button>

                    <div className='grid col-span-1 grid-cols-4 gap-4 justify-center items-center'>
                        <Label
                            htmlFor='timezone'
                            className='text-right col-span-1'>
                            Timezone
                        </Label>
                        <Select
                            name='timezone'
                            value={ timezone }
                            onValueChange={ ( v ) => onChangeTimezone( v ) }>
                            <SelectTrigger
                                className={ `w-full flex-1 col-span-3` }>
                                <SelectValue placeholder='Select timezone' />
                            </SelectTrigger>
                            <SelectContent className={ `` }>
                                { timezones &&
                                    utils.val.isValidArray( timezones, true ) &&
                                    timezones
                                        .sort( ( a, b ) => a.offset - b.offset )
                                        .map( ( type ) => (
                                            <SelectItem
                                                key={ type?.value }
                                                value={ type?.value }>
                                                { type?.label }
                                            </SelectItem>
                                        ) ) }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as utils from 'akashatools';

export function TriggerDatesInput ( { dates, onChange } ) {
    const handleDateChange = ( index, date ) => {
        const newDates = [ ...dates ];
        newDates[ index ] = date ? date.toISOString() : null;
        onChange( newDates.filter( ( d ) => d !== null ) );
    };

    const addDate = () => {
        onChange( [ ...( dates || [] ), new Date().toISOString() ] );
    };

    const removeDate = ( index ) => {
        onChange( ( dates || [] ).filter( ( _, i ) => i !== index ) );
    };

    return (
        <div className="space-y-2">
            <Label>Specific Trigger Dates</Label>
            <p className="text-xs text-muted-foreground">
                For one-off reminders or specific additional dates for recurring ones.
            </p>
            { ( dates || [] ).map( ( dateStr, index ) => (
                <div key={ index } className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={ "outline" }
                                className={ cn( "w-full justify-start text-left font-normal h-9", !dateStr && "text-muted-foreground" ) }
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                { dateStr ? format( new Date( dateStr ), "PPP" ) : <span>Pick a date</span> }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={ dateStr ? new Date( dateStr ) : undefined }
                                onSelect={ ( newDate ) => handleDateChange( index, newDate ) }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button type="button" variant="ghost" size="icon" onClick={ () => removeDate( index ) } className="h-9 w-9">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ) ) }
            <Button type="button" variant="outline" size="sm" onClick={ addDate }>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Specific Date
            </Button>
        </div>
    );
}
 */

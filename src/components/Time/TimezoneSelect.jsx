import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const TimezoneSelect = ( {
    value,
    defaultValue = 'utc-5',
    onValueChange,
} ) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
                value={ value }
                defaultValue={ defaultValue }
                onValueChange={ ( value ) => {
                    if ( onValueChange ) onValueChange( value );
                } }>
                <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="utc-12">International Date Line West (UTC-12)</SelectItem>
                    <SelectItem value="utc-11">Samoa Standard Time (UTC-11)</SelectItem>
                    <SelectItem value="utc-10">Hawaii-Aleutian Standard Time (UTC-10)</SelectItem>
                    <SelectItem value="utc-9">Alaska Standard Time (UTC-9)</SelectItem>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc-4">Atlantic Time (UTC-4)</SelectItem>
                    <SelectItem value="utc-3">Argentina Standard Time (UTC-3)</SelectItem>
                    <SelectItem value="utc-2">South Georgia Time (UTC-2)</SelectItem>
                    <SelectItem value="utc-1">Azores Time (UTC-1)</SelectItem>
                    <SelectItem value="utc+0">Greenwich Mean Time (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+2">Eastern European Time (UTC+2)</SelectItem>
                    <SelectItem value="utc+3">Moscow Time (UTC+3)</SelectItem>
                    <SelectItem value="utc+4">Gulf Standard Time (UTC+4)</SelectItem>
                    <SelectItem value="utc+5">Pakistan Standard Time (UTC+5)</SelectItem>
                    <SelectItem value="utc+5.5">Indian Standard Time (UTC+5:30)</SelectItem>
                    <SelectItem value="utc+6">Bangladesh Standard Time (UTC+6)</SelectItem>
                    <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                    <SelectItem value="utc+9">Japan Standard Time (UTC+9)</SelectItem>
                    <SelectItem value="utc+10">Australian Eastern Standard Time (UTC+10)</SelectItem>
                    <SelectItem value="utc+11">Solomon Islands Time (UTC+11)</SelectItem>
                    <SelectItem value="utc+12">New Zealand Standard Time (UTC+12)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default TimezoneSelect;
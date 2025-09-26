import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomNumberInput } from "@/components/ui/custom-number-input";
import { Trash2 } from "lucide-react";
import { RULE_TYPES, DAYS_OF_WEEK, INTERVAL_UNITS } from "@/features/Remind/lib/config";
import * as utils from 'akashatools';

export function IndividualRuleForm ( { rule, onChange, onRemove } ) {
    const [ localRule, setLocalRule ] = useState( rule );

    useEffect( () => {
        setLocalRule( rule );
    }, [ rule ] );

    const handleChange = ( field, value ) => {
        const updatedRule = { ...localRule, [ field ]: value };
        if ( field === "ruleType" ) {
            if ( value === "onDay" ) {
                updatedRule.interval = undefined;
                updatedRule.value = undefined;
                if ( !updatedRule.onDays ) updatedRule.onDays = [];
            } else if ( value === "every" ) {
                updatedRule.onDays = undefined;
                if ( !updatedRule.interval ) updatedRule.interval = INTERVAL_UNITS[ 2 ].value;
                if ( updatedRule.value === undefined ) updatedRule.value = 1;
            }
        }
        setLocalRule( updatedRule );
        onChange( updatedRule );
    };

    const handleDayChange = ( dayValue, checked ) => {
        const currentDays = localRule.onDays || [];
        const newDays = checked ? [ ...currentDays, dayValue ] : currentDays.filter( ( d ) => d !== dayValue );
        handleChange( "onDays", newDays );
    };

    return (
        <div className="p-3 border rounded-md space-y-3 bg-muted/30 relative">
            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={ onRemove }>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <div className="space-y-1">
                <Label htmlFor={ `ruleType-${ rule.id }` }>Rule Type</Label>
                <Select value={ localRule.ruleType || "" } onValueChange={ ( value ) => handleChange( "ruleType", value ) }>
                    <SelectTrigger id={ `ruleType-${ rule.id }` }>
                        <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                        { RULE_TYPES.map( ( rt ) => (
                            <SelectItem key={ rt.value } value={ rt.value }>
                                { rt.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </div>

            { localRule.ruleType === "onDay" && (
                <div className="space-y-1">
                    <Label>On Days</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        { DAYS_OF_WEEK.map( ( day ) => (
                            <div key={ day.value } className="flex items-center space-x-2">
                                <Checkbox
                                    id={ `day-${ rule.id }-${ day.value }` }
                                    checked={ ( localRule.onDays || [] ).includes( day.value ) }
                                    onCheckedChange={ ( checked ) => handleDayChange( day.value, checked ) }
                                />
                                <Label htmlFor={ `day-${ rule.id }-${ day.value }` } className="font-normal text-sm">
                                    { day.label }
                                </Label>
                            </div>
                        ) ) }
                    </div>
                </div>
            ) }

            { localRule.ruleType === "every" && (
                <>
                    <div className="space-y-1">
                        <Label htmlFor={ `interval-${ rule.id }` }>Interval Unit</Label>
                        <Select value={ localRule.interval || "" } onValueChange={ ( value ) => handleChange( "interval", value ) }>
                            <SelectTrigger id={ `interval-${ rule.id }` }>
                                <SelectValue placeholder="Select interval unit" />
                            </SelectTrigger>
                            <SelectContent>
                                { INTERVAL_UNITS.map( ( unit ) => (
                                    <SelectItem key={ unit.value } value={ unit.value }>
                                        { unit.label }
                                    </SelectItem>
                                ) ) }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={ `value-${ rule.id }` }>Interval Value (Every X)</Label>
                        <CustomNumberInput value={ localRule.value } onChange={ ( num ) => handleChange( "value", num ) } min={ 1 } />
                    </div>
                </>
            ) }
        </div>
    );
}

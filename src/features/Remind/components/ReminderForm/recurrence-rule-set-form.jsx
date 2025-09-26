import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CustomNumberInput } from "@/components/ui/custom-number-input";
import { IndividualRuleForm } from "./individual-rule-form";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as utils from 'akashatools';

export function RecurrenceRuleSetForm ( { ruleSet, onChange, onRemove } ) {
    const [ localRuleSet, setLocalRuleSet ] = useState( ruleSet );

    useEffect( () => {
        setLocalRuleSet( ruleSet );
    }, [ ruleSet ] );

    const handleChange = ( field, value ) => {
        const updatedSet = { ...localRuleSet, [ field ]: value };
        setLocalRuleSet( updatedSet );
        onChange( updatedSet );
    };

    const handleStartTimeChange = ( part, value ) => {
        const currentHour = localRuleSet.startTime?.hour === undefined ? null : localRuleSet.startTime.hour;
        const currentMinute = localRuleSet.startTime?.minute === undefined ? null : localRuleSet.startTime.minute;

        const newTime = {
            hour: part === "hour" ? value : currentHour,
            minute: part === "minute" ? value : currentMinute,
        };
        if ( newTime.hour === null && newTime.minute === null ) {
            handleChange( "startTime", null );
        } else {
            handleChange( "startTime", newTime );
        }
    };

    const handleIndividualRuleChange = ( index, updatedRule ) => {
        const newRules = [ ...( localRuleSet.rules || [] ) ];
        newRules[ index ] = updatedRule;
        handleChange( "rules", newRules );
    };

    const addIndividualRule = () => {
        const newRule = { id: `rule-${ Date.now() }-${ Math.random() }`, ruleType: "every", interval: "day", value: 1 };
        handleChange( "rules", [ ...( localRuleSet.rules || [] ), newRule ] );
    };

    const removeIndividualRule = ( index ) => {
        const newRules = ( localRuleSet.rules || [] ).filter( ( _, i ) => i !== index );
        handleChange( "rules", newRules );
    };

    return (
        <div className="p-4 border rounded-lg space-y-4 bg-card shadow relative">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-md">Recurrence Pattern</h4>
                <Button type="button" variant="ghost" size="icon" onClick={ onRemove } className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id={ `enabled-${ localRuleSet.id }` }
                    checked={ localRuleSet.enabled || false }
                    onCheckedChange={ ( checked ) => handleChange( "enabled", checked ) }
                />
                <Label htmlFor={ `enabled-${ localRuleSet.id }` }>Enable this pattern</Label>
            </div>

            { localRuleSet.enabled && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Start Time (HH:MM)</Label>
                            <div className="flex gap-2 items-center">
                                <CustomNumberInput
                                    value={ localRuleSet.startTime?.hour }
                                    onChange={ ( val ) => handleStartTimeChange( "hour", val ) }
                                    min={ 0 }
                                    max={ 23 }
                                    placeholder="HH"
                                />
                                <span>:</span>
                                <CustomNumberInput
                                    value={ localRuleSet.startTime?.minute }
                                    onChange={ ( val ) => handleStartTimeChange( "minute", val ) }
                                    min={ 0 }
                                    max={ 59 }
                                    placeholder="MM"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Optional. If blank, uses reminder creation time.</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={ `count-${ localRuleSet.id }` }>Repeat Count</Label>
                            <CustomNumberInput
                                value={ localRuleSet.count }
                                onChange={ ( val ) => handleChange( "count", val ) }
                                min={ 1 }
                                placeholder="Forever"
                            />
                            <p className="text-xs text-muted-foreground">Optional. If blank, repeats indefinitely.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Pattern Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={ "outline" }
                                        className={ cn(
                                            "w-full justify-start text-left font-normal h-9",
                                            !localRuleSet.startDate && "text-muted-foreground",
                                        ) }
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        { localRuleSet.startDate ? (
                                            format( new Date( localRuleSet.startDate ), "PPP" )
                                        ) : (
                                            <span>Pick a date</span>
                                        ) }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={ localRuleSet.startDate ? new Date( localRuleSet.startDate ) : undefined }
                                        onSelect={ ( date ) => handleChange( "startDate", date?.toISOString() ) }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1">
                            <Label>Pattern End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={ "outline" }
                                        className={ cn(
                                            "w-full justify-start text-left font-normal h-9",
                                            !localRuleSet.endDate && "text-muted-foreground",
                                        ) }
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        { localRuleSet.endDate ? (
                                            format( new Date( localRuleSet.endDate ), "PPP" )
                                        ) : (
                                            <span>Pick an end date</span>
                                        ) }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={ localRuleSet.endDate ? new Date( localRuleSet.endDate ) : undefined }
                                        onSelect={ ( date ) => handleChange( "endDate", date?.toISOString() ) }
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">Optional. If blank, pattern can run indefinitely.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Individual Rules for this Pattern</Label>
                        { ( localRuleSet.rules || [] ).map( ( rule, index ) => (
                            <IndividualRuleForm
                                key={ rule.id || index }
                                rule={ rule }
                                onChange={ ( updatedRule ) => handleIndividualRuleChange( index, updatedRule ) }
                                onRemove={ () => removeIndividualRule( index ) }
                            />
                        ) ) }
                        <Button type="button" variant="outline" size="sm" onClick={ addIndividualRule } className="mt-2">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Rule to Pattern
                        </Button>
                    </div>
                </>
            ) }
        </div>
    );
}

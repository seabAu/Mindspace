
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { generateColorFromName } from "../../lib/backendSpoofAPI";
import { Switch } from "@/components/ui/switch";
import { stringAsColor } from "@/lib/utilities/color";
import * as utils from 'akashatools';

const HabitForm = ( { onSubmit, onCancel, habit = null } ) => {
    const [ formData, setFormData ] = useState( {
        ...( utils.val.isDefined( habit ) && utils.val.isObject( habit ) ? habit : {} ),
        title: habit?.title || "",
        description: habit?.description || "",
        habitType: habit?.habitType || "none",
        inputType: habit?.inputType || "toggle",
        importance: habit?.importance || 5,
        difficulty: habit?.difficulty || 3,
        priority: habit?.priority || 3,
        color: habit?.color || "",
        isActive: habit?.isActive ?? true,
        isBadHabit: habit?.isBadHabit || false,
        minValue: habit?.minValue || "",
        maxValue: habit?.maxValue || "",
    } );

    const handleSubmit = ( e ) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            color: formData.color || stringAsColor( formData.title || '' ),
            minValue: formData.inputType === "value" && formData.minValue ? parseFloat( formData.minValue ) : null,
            maxValue: formData.inputType === "value" && formData.maxValue ? parseFloat( formData.maxValue ) : null,
        };

        console.log( "HabitForm :: handleSubmit :: submitData = ", submitData );
        onSubmit( submitData );
    };

    const handleChange = ( field, value ) => {
        setFormData( ( prev ) => ( { ...prev, [ field ]: value } ) );
    };

    return (
        <Dialog open={ true } onOpenChange={ onCancel }>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg">{ habit ? "Edit Habit" : "Create New Habit" }</DialogTitle>
                </DialogHeader>

                <form onSubmit={ handleSubmit } className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="title" className="text-sm">Habit Name *</Label>
                            <Input
                                id="title"
                                value={ formData.title }
                                onChange={ ( e ) => handleChange( "title", e.target.value ) }
                                placeholder="e.g., Morning meditation"
                                required
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="inputType" className="text-sm">Input Type *</Label>
                            <Select value={ formData.inputType } onValueChange={ ( value ) => handleChange( "inputType", value ) }>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="toggle">Toggle</SelectItem>
                                    <SelectItem value="value">Value</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Textarea
                            id="description"
                            value={ formData.description }
                            onChange={ ( e ) => handleChange( "description", e.target.value ) }
                            placeholder="Describe your habit..."
                            rows={ 2 }
                            className="text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="habitType" className="text-sm">Category</Label>
                            <Select value={ formData.habitType } onValueChange={ ( value ) => handleChange( "habitType", value ) }>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="health">Health</SelectItem>
                                    <SelectItem value="fitness">Fitness</SelectItem>
                                    <SelectItem value="mindset">Mindset</SelectItem>
                                    <SelectItem value="career">Career</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="color" className="text-sm">Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={ formData.color || generateColorFromName( formData.title ) }
                                onChange={ ( e ) => handleChange( "color", e.target.value ) }
                                className="h-8"
                            />
                        </div>
                    </div>

                    { formData.inputType === "value" && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="minValue" className="text-sm">Min Value</Label>
                                <Input
                                    id="minValue"
                                    type="number"
                                    value={ formData.minValue }
                                    onChange={ ( e ) => handleChange( "minValue", e.target.value ) }
                                    className="h-8 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="maxValue" className="text-sm">Max Value</Label>
                                <Input
                                    id="maxValue"
                                    type="number"
                                    value={ formData.maxValue }
                                    onChange={ ( e ) => handleChange( "maxValue", e.target.value ) }
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    ) }

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="importance" className="text-sm">Importance (1-10)</Label>
                            <Input
                                id="importance"
                                type="number"
                                min="1"
                                max="10"
                                value={ formData.importance }
                                onChange={ ( e ) => handleChange( "importance", parseInt( e.target.value ) ) }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="difficulty" className="text-sm">Difficulty (0-6)</Label>
                            <Input
                                id="difficulty"
                                type="number"
                                min="0"
                                max="6"
                                value={ formData.difficulty }
                                onChange={ ( e ) => handleChange( "difficulty", parseInt( e.target.value ) ) }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="priority" className="text-sm">Priority (0-6)</Label>
                            <Input
                                id="priority"
                                type="number"
                                min="0"
                                max="6"
                                value={ formData.priority }
                                onChange={ ( e ) => handleChange( "priority", parseInt( e.target.value ) ) }
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Switch
                                size={ 4 }
                                id={ 'habit-isActive' }
                                key={ `habit-isActive` }
                                className="h-3 w-3"
                                checked={ formData.isActive }
                                placeholder={ "Is Active" }
                                defaultChecked={ formData.isActive }
                                onCheckedChange={ ( checked ) => handleChange( "isActive", checked ) }
                            />
                            {/* <Checkbox
                                id="isActive"
                                checked={ formData.isActive }
                                onCheckedChange={ ( checked ) => handleChange( "isActive", checked ) }
                                className="h-3 w-3"
                            /> */}
                            <Label htmlFor="isActive" className="text-sm">Active</Label>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Switch
                                size={ 4 }
                                id={ 'habit-isBadHabit' }
                                key={ `habit-isBadHabit` }
                                className="h-3 w-3"
                                placeholder={ "Bad Habit?" }
                                checked={ formData.isBadHabit }
                                defaultChecked={ formData.isBadHabit }
                                onCheckedChange={ ( checked ) => handleChange( "isBadHabit", checked ) }
                            />
                            {/* <Checkbox
                                id="isBadHabit"
                                checked={ formData.isBadHabit }
                                onCheckedChange={ ( checked ) => handleChange( "isBadHabit", checked ) }
                                className="h-3 w-3"
                            /> */}
                            <Label htmlFor="isBadHabit" className="text-sm">Bad Habit</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={ onCancel } size="sm">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" onClick={ ( e ) => { e.stopPropagation(); } }>
                            { habit ? "Update" : "Create" }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default HabitForm;

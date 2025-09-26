
import { useState } from "react";
import { Check, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function EditableTextField ( { value, onSave, onCancel } ) {
    const [ inputValue, setInputValue ] = useState( value || "" );

    return (
        <div className="flex items-center gap-2">
            <Input value={ inputValue } onChange={ ( e ) => setInputValue( e.target.value ) } className="h-8" autoFocus />
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ () => onSave( inputValue ) }>
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ onCancel }>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function EditableTextareaField ( { value, onSave, onCancel } ) {
    const [ inputValue, setInputValue ] = useState( value || "" );

    return (
        <div className="flex flex-col gap-2">
            <Textarea
                value={ inputValue }
                onChange={ ( e ) => setInputValue( e.target.value ) }
                className="min-h-[100px]"
                autoFocus
            />
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={ onCancel }>
                    Cancel
                </Button>
                <Button size="sm" onClick={ () => onSave( inputValue ) }>
                    Save
                </Button>
            </div>
        </div>
    );
}

export function EditableNumberField ( { value, onSave, onCancel, min = 0, max = 100, step = 1 } ) {
    const [ inputValue, setInputValue ] = useState( value || min );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <Slider
                    value={ [ inputValue ] }
                    min={ min }
                    max={ max }
                    step={ step }
                    onValueChange={ ( values ) => setInputValue( values[ 0 ] ) }
                    className="flex-1"
                />
                <span className="w-12 text-center">{ inputValue }</span>
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={ onCancel }>
                    Cancel
                </Button>
                <Button size="sm" onClick={ () => onSave( inputValue ) }>
                    Save
                </Button>
            </div>
        </div>
    );
}

export function EditableSelectField ( { value, onSave, onCancel, options } ) {
    const [ inputValue, setInputValue ] = useState( value || "" );

    return (
        <div className="flex items-center gap-2">
            <Select value={ inputValue } onValueChange={ setInputValue }>
                <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    { options.map( ( option ) => (
                        <SelectItem key={ option.value } value={ option.value }>
                            { option.label }
                        </SelectItem>
                    ) ) }
                </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ () => onSave( inputValue ) }>
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ onCancel }>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function EditableBooleanField ( { value, onSave, onCancel } ) {
    const [ inputValue, setInputValue ] = useState( value || false );

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Switch checked={ inputValue } onCheckedChange={ setInputValue } />
                <Label>{ inputValue ? "Yes" : "No" }</Label>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ () => onSave( inputValue ) }>
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ onCancel }>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function EditableField ( { value, onChange, placeholder, isTextarea = false } ) {
    const [ isEditing, setIsEditing ] = useState( false );

    const handleSave = () => {
        setIsEditing( false );
    };

    return (
        <div className="relative group">
            { isEditing ? (
                <div className="flex items-center">
                    { isTextarea ? (
                        <Textarea
                            value={ value }
                            onChange={ ( e ) => onChange( e.target.value ) }
                            placeholder={ placeholder }
                            className="w-full"
                        />
                    ) : (
                        <Input
                            value={ value }
                            onChange={ ( e ) => onChange( e.target.value ) }
                            placeholder={ placeholder }
                            className="w-full"
                        />
                    ) }
                    <Button onClick={ handleSave } size="icon" variant="ghost" className="ml-2">
                        <Check className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="min-h-[2.5rem] p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    { value ? (
                        isTextarea ? (
                            <p className="whitespace-pre-wrap">{ value }</p>
                        ) : (
                            <h3 className="text-lg font-semibold">{ value }</h3>
                        )
                    ) : (
                        <span className="text-gray-400">{ placeholder }</span>
                    ) }
                </div>
            ) }
            { !isEditing && (
                <Button
                    onClick={ () => setIsEditing( true ) }
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            ) }
        </div>
    );
}

/*  // Usage

    function renderContentEditable ( item, key ) {
        switch ( item ) {
            case "img":
                return <ImageUpload key={ key } image={ image } onUpload={ handleImageUpload } />;
            case "title":
                return <EditableField key={ key } value={ title } onChange={ setTitle } placeholder="Enter title" />;
            case "description":
                return ( <EditableField
                        key={ key }
                        value={ description }
                        onChange={ setDescription }
                        placeholder="Enter description"
                        isTextarea
                    /> );
            default:
                return null;
        }
    }

    ...

        <div className="space-y-6 max-w-2xl mx-auto">
            { selectedTemplate.layout.map( ( item, index ) => {
            if ( Array.isArray( item ) ) {
                return (
                <div key={ index } className="flex space-x-4">
                    { item.map( ( subItem, subIndex ) => (
                    <div key={ subIndex } className="flex-1">
                        { renderContentEditable( subItem ) }
                    </div>
                    ) ) }
                </div>
                );
            }
            return renderContentEditable( item, index );
            } ) }
        </div>
*/
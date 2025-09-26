import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // If needed for some fields
import { useToast } from "@/hooks/use-toast";
import { DATA_TYPE_CONFIG } from "../../lib/config";
// import { DATA_TYPE_CONFIG } from "@/lib/data-store"; // Import the config

export function GenericDocumentFormDialogWrapper ( { open, onOpenChange, onDocumentCreated, dataType } ) {
    const [ formData, setFormData ] = useState( {} );
    const [ isSubmitting, setIsSubmitting ] = useState( false );
    const { toast } = useToast();

    const config = DATA_TYPE_CONFIG[ dataType ];
    const fields = config?.fields || [];
    const fetchUrl = config?.fetchUrl;

    useEffect( () => {
        // Initialize formData based on fields
        const initialData = {};
        fields.forEach( ( field ) => {
            initialData[ field.name ] = field.type === "checkbox" ? false : "";
        } );
        setFormData( initialData );
    }, [ fields, open ] ); // Reset form when modal opens or fields change

    if ( !config ) {
        // This should ideally not happen if dataType is always valid
        console.error( "Invalid dataType for GenericDocumentFormDialogWrapper:", dataType );
        return null;
    }

    const handleChange = ( e ) => {
        const { name, value, type, checked } = e.target;
        setFormData( ( prev ) => ( { ...prev, [ name ]: type === "checkbox" ? checked : value } ) );
    };

    const handleSubmit = async ( e ) => {
        e.preventDefault();
        if ( !fetchUrl ) {
            toast( {
                title: "Error",
                description: "Configuration error: No API endpoint defined for this data type.",
                variant: "destructive",
            } );
            return;
        }
        setIsSubmitting( true );
        try {
            const response = await fetch( fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( formData ),
            } );
            if ( !response.ok ) {
                const errorData = await response.json().catch( () => ( {} ) );
                throw new Error( errorData.message || `Failed to create ${ dataType }` );
            }
            const newDocument = await response.json();
            toast( {
                title: `${ dataType } Created`,
                description: `${ dataType } "${ newDocument[ config.titleField ] || "Item" }" has been successfully created.`,
            } );
            onDocumentCreated( newDocument ); // Pass the full new document
            onOpenChange( false ); // Close modal
        } catch ( error ) {
            console.error( `Error creating ${ dataType }:`, error );
            toast( { title: "Error", description: `Could not create ${ dataType }. ${ error.message }`, variant: "destructive" } );
        } finally {
            setIsSubmitting( false );
        }
    };

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New { dataType }</DialogTitle>
                    <DialogDescription>Fill in the details for the new { dataType }.</DialogDescription>
                </DialogHeader>
                <form onSubmit={ handleSubmit }>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        { fields.map( ( field ) => (
                            <div key={ field.name } className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={ field.name } className="text-right">
                                    { field.label }
                                </Label>
                                { field.type === "textarea" ? (
                                    <Textarea
                                        id={ field.name }
                                        name={ field.name }
                                        value={ formData[ field.name ] || "" }
                                        onChange={ handleChange }
                                        placeholder={ field.placeholder }
                                        required={ field.required }
                                        className="col-span-3"
                                    />
                                ) : (
                                    <Input
                                        id={ field.name }
                                        name={ field.name }
                                        type={ field.type || "text" }
                                        value={ formData[ field.name ] || "" }
                                        onChange={ handleChange }
                                        placeholder={ field.placeholder }
                                        required={ field.required }
                                        className="col-span-3"
                                    />
                                ) }
                            </div>
                        ) ) }
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={ isSubmitting }>
                            { isSubmitting ? "Creating..." : `Create ${ dataType }` }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

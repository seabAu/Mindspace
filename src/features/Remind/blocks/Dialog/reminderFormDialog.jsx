import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, PlusCircle, Trash2 } from "lucide-react";
import * as utils from 'akashatools';

import { GenericDocumentFormDialogWrapper } from "../../components/FormDialog/GenericFormDialog";
import { DAYS_OF_WEEK, NOTIFICATION_TYPES, RECURRENCE_TERM_TYPES } from "@/lib/config/constants";
import { DATA_TYPE_CONFIG } from "../../lib/config";
import { useToast } from "@/hooks/use-toast";
import useReminderStore from "@/store/reminder.store";
import useGlobalStore from "@/store/global.store";
import useMessage from "@/lib/hooks/useMessage";
import { getSortedTimezones } from "@/lib/utilities/time";
import { getNextTrigger } from "../../lib/notificationUtils";
import { getValidationErrorMessage, isValidEmail, isValidPhoneNumber } from "@/lib/utilities/validation";
import { addHours, subHours } from "date-fns";

const validateRecurrenceTerm = ( term ) => {
    const errors = [];
    if ( !term.ruleType ) {
        errors.push( "Type is required" );
    }
    if ( term.ruleType === "specific" && !term.startDate ) {
        errors.push( "Date and time is required for specific reminders" );
    }
    if ( term.ruleType === "daily" && !term.time ) {
        errors.push( "Time is required for daily reminders" );
    }
    if ( term.ruleType === "weekly" ) {
        if ( !term.time ) errors.push( "Time is required for weekly reminders" );
        if ( !term.onDays || term.onDays.length === 0 ) {
            errors.push( "At least one day must be selected for weekly reminders" );
        }
    }
    if ( term.ruleType === "hourly_on_days_range" ) {
        if ( !term.onDays || term.onDays.length === 0 ) {
            errors.push( "At least one day must be selected for hourly reminders" );
        }
        if ( !term.startTime || !term.endTime ) {
            errors.push( "Start and end times are required for hourly reminders" );
        }
        if ( term.startTime && term.endTime && term.startTime >= term.endTime ) {
            errors.push( "End time must be after start time" );
        }
        if ( term.interval && ( term.interval < 1 || term.interval > 720 ) ) {
            errors.push( "Interval must be between 1 and 720 minutes" );
        }
    }
    return errors;
};
const validateAllRecurrenceTerms = ( terms ) => {
    const allErrors = [];
    terms.forEach( ( term, index ) => {
        const termErrors = validateRecurrenceTerm( term );
        if ( termErrors.length > 0 ) {
            allErrors.push( `Term ${ index + 1 }: ${ termErrors.join( ", " ) }` );
        }
    } );
    return allErrors;
};

export function ReminderFormDialogWrapper ( { open, onOpenChange } ) {
    const {
        addReminder,
        updateReminder,
        reminderToEdit,
        clearReminderToEdit,
        reminderToClone,
        clearReminderToClone
    } = useReminderStore();

    const {
        workspaceId,
        user,
        getDataOfType,
    } = useGlobalStore();

    const {
        handleCreateReminder,
        handleUpdateReminder,
    } = useMessage();

    const timezones = useMemo( () => getSortedTimezones(), [] );

    const initialFormState = {
        userId: user?.id ?? null,
        workspaceId: workspaceId,
        docType: "",
        docId: "",
        title: "",
        // triggerDates: [ new Date( Date.now() ).toISOString() ],
        triggerDates: [],
        showRecurrence: false,
        rrules: [],
        isActive: true,
        inTrash: false,
        isEnabled: true,
        notificationType: "alert",
        message: "",
        timezone: "America/New_York",
    };

    const [ formData, setFormData ] = useState( initialFormState );
    const [ documents, setDocuments ] = useState( [] );
    const [ isLoadingDocs, setIsLoadingDocs ] = useState( false );
    const [ isSubmitting, setIsSubmitting ] = useState( false );
    const [ isGenericDocModalOpen, setIsGenericDocModalOpen ] = useState( false );
    const [ docTypeForGenericModal, setDocTypeForGenericModal ] = useState( "" );
    const [ validationErrors, setValidationErrors ] = useState( {} );

    const { toast } = useToast();

    const onFieldChange = ( name, value ) => {
        setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) );
    };

    const validateNotificationContact = ( type, contact ) => {
        if ( !contact || !contact.trim() ) {
            if ( type === "email" || type === "sms" ) {
                return getValidationErrorMessage( type === "sms" ? "phone" : "email", contact );
            }
            return null;
        }
        if ( type === "email" && !isValidEmail( contact ) ) {
            return getValidationErrorMessage( "email", contact );
        }
        if ( type === "sms" && !isValidPhoneNumber( contact ) ) {
            return getValidationErrorMessage( "phone", contact );
        }
        return null;
    };

    useEffect( () => {
        const currentReminder = reminderToEdit || reminderToClone;
        if ( currentReminder ) {
            setFormData( {
                ...currentReminder,
                docType: currentReminder.docType || "",
                docId: currentReminder.docId || "",
                title: currentReminder.title || "",
                message: currentReminder.message || "",
                notificationContact: currentReminder.notificationContact || "",
                triggerDates: utils.val.isValidArray( currentReminder.triggerDates, true ) ? currentReminder.triggerDates : [],
                showRecurrence: currentReminder.showRecurrence || ( currentReminder.rrules && currentReminder.rrules.length > 0 ),
                rrules: currentReminder.rrules || [],
                notificationType: currentReminder.notificationType || "alert",
                timezone: currentReminder.timezone || "America/New_York",
            } );
            if ( currentReminder.docType && DATA_TYPE_CONFIG[ currentReminder.docType ]?.fetchUrl ) {
                fetchDocuments( currentReminder.docType );
            }
        } else {
            setFormData( initialFormState );
            setDocuments( [] );
        }
    }, [ reminderToEdit, reminderToClone, open ] );

    const fetchDocuments = useCallback(
        async ( docType ) => {
            setIsLoadingDocs( true );
            const docData = getDataOfType( docType );
            if ( docData && utils.val.isValidArray( docData, true ) ) {
                setDocuments( docData );
            } else {
                setDocuments( [] );
            }
            setIsLoadingDocs( false );
        },
        [ getDataOfType ]
    );

    useEffect( () => {
        if ( formData.docType ) {
            fetchDocuments( formData.docType );
            const currentReminder = reminderToEdit || reminderToClone;
            if ( !currentReminder || ( currentReminder && currentReminder.docType !== formData.docType ) ) {
                setFormData( ( prev ) => ( { ...prev, docId: "", title: "" } ) );
            }
        } else {
            setDocuments( [] );
        }
    }, [ formData.docType, fetchDocuments, reminderToEdit, reminderToClone ] );

    const handleInputChange = ( e ) => {
        const { name, value, type, checked } = e.target;
        onFieldChange( name, type === "checkbox" ? checked : value );
        if ( validationErrors[ name ] ) {
            setValidationErrors( ( prev ) => ( { ...prev, [ name ]: null } ) );
        }
        if ( name === "notificationContact" ) {
            const error = validateNotificationContact( formData.notificationType, value );
            setValidationErrors( ( prev ) => ( { ...prev, notificationContact: error } ) );
        }
        if ( name === "notificationType" ) {
            const error = validateNotificationContact( value, formData.notificationContact );
            setValidationErrors( ( prev ) => ( { ...prev, notificationContact: error } ) );
        }
        if ( name === "docType" ) {
            onFieldChange( "docId", "" );
            onFieldChange( "docURL", "" );
        }
    };

    const handleSelectChange = ( name, value ) => {
        if ( name === 'notificationType' ) {
            if ( value === 'sms' || value === 'email' ) {
                onFieldChange( "notificationContact", "" );
            }
        }
        setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) );
    };

    const handleDataTypeChange = ( value ) => {
        setFormData( ( prev ) => ( { ...prev, docType: value, docId: "", title: "" } ) );
    };

    const handleDocumentChange = ( value ) => {
        if ( value === "add_new" ) {
            setDocTypeForGenericModal( formData.docType );
            setIsGenericDocModalOpen( true );
        } else {
            const selectedDoc = documents.find( ( doc ) => doc._id === value );
            const titleField = DATA_TYPE_CONFIG[ formData.docType ]?.titleField || "title";
            setFormData( ( prev ) => ( {
                ...prev,
                docId: value,
                title: selectedDoc ? selectedDoc[ titleField ] : "",
            } ) );
        }
    };

    const handleGenericDocCreated = ( newDocument ) => {
        const titleField = DATA_TYPE_CONFIG[ formData.docType ]?.titleField || "title";
        setDocuments( ( prevDocs ) => [ ...prevDocs, newDocument ] );
        setFormData( ( prev ) => ( {
            ...prev,
            docId: newDocument._id,
            title: newDocument[ titleField ],
        } ) );
        setIsGenericDocModalOpen( false );
    };

    const addRecurrenceTerm = () => {
        setFormData( ( prev ) => ( {
            ...prev,
            rrules: [
                ...prev.rrules,
                {
                    ruleType: "onDay",
                    startDate: "",
                    startTime: "",
                    onDays: [],
                    startTime: "",
                    endTime: "",
                    interval: 60
                },
            ],
        } ) );
    };

    const updateRecurrenceTerm = ( index, field, value ) => {
        setFormData( ( prev ) => {
            const newTerms = [ ...prev.rrules ];
            newTerms[ index ] = { ...newTerms[ index ], [ field ]: value };
            if ( field === "ruleType" ) {
                const termType = value;
                const currentTerm = newTerms[ index ];
                if ( termType !== "specific" ) currentTerm.startDate = "";
                if ( termType !== "daily" && termType !== "weekly" ) currentTerm.startTime = "";
                if ( termType !== "weekly" && termType !== "hourly_on_days_range" ) currentTerm.onDays = [];
                if ( termType !== "hourly_on_days_range" ) {
                    currentTerm.startTime = "";
                    currentTerm.endTime = "";
                    currentTerm.interval = 60;
                }
            }
            return { ...prev, rrules: newTerms };
        } );
    };

    const handleRecurrenceDayToggle = ( termIndex, dayValue ) => {
        setFormData( ( prev ) => {
            const newTerms = [ ...prev.rrules ];
            const term = newTerms[ termIndex ];
            const currentDays = term.onDays || [];
            if ( currentDays.includes( dayValue ) ) {
                term.onDays = currentDays.filter( ( d ) => d !== dayValue );
            } else {
                term.onDays = [ ...currentDays, dayValue ];
            }
            return { ...prev, rrules: newTerms };
        } );
    };

    const removeRecurrenceTerm = ( index ) => {
        setFormData( ( prev ) => ( {
            ...prev,
            rrules: prev.rrules.filter( ( _, i ) => i !== index ),
        } ) );
    };

    const handleModalClose = () => {
        onOpenChange( false );
        clearReminderToEdit();
        clearReminderToClone();
    };

    const handleSubmit = async ( e ) => {
        e.preventDefault();

        if ( !formData.docId && !formData.title && DATA_TYPE_CONFIG[ formData.docType ]?.fetchUrl ) {
            toast( {
                title: "Validation Error",
                description: "Please select or create an associated item.",
                variant: "destructive",
            } );
            return;
        }

        if ( formData.showRecurrence && formData.rrules.length > 0 ) {
            const recurrenceErrors = validateAllRecurrenceTerms( formData.rrules );
            if ( recurrenceErrors.length > 0 ) {
                toast( {
                    title: "Recurrence Validation Error",
                    description: recurrenceErrors.join( "\n" ),
                    variant: "destructive",
                    duration: 7000,
                } );
                return;
            }
        }

        setIsSubmitting( true );
        let dataToSubmit = { ...formData };
        if ( !dataToSubmit.showRecurrence ) {
            dataToSubmit.rrules = [];
        }

        if ( utils.val.isValidArray( dataToSubmit.triggerDates, true ) ) {
            const nextTriggerDate = getNextTrigger( dataToSubmit );
            dataToSubmit.isActive = new Date() < new Date( nextTriggerDate );
        } else {
            dataToSubmit.isActive = false;
        }

        let result;
        if ( reminderToEdit ) {
            result = await handleUpdateReminder( reminderToEdit._id, dataToSubmit );
            if ( utils.val.isObject( result ) ) {
                updateReminder( result._id, result );
            }
        } else {
            result = await handleCreateReminder( dataToSubmit );
            if ( utils.val.isObject( result ) ) {
                addReminder( result );
            }
        }
        setIsSubmitting( false );
        if ( result ) {
            handleModalClose();
        }
    };

    const handleAddArrayItem = ( name, value ) => {
        setFormData( ( prev ) => ( {
            ...prev,
            [ name ]: [ ...(
                utils.val.isValidArray( formData?.[ name ], true ) ? ( formData?.[ name ] ) : []
            ), value ]
        } ) );
    };

    const handleDeleteArrayItem = ( name, index ) => {
        let currItems = [ ...( utils.val.isValidArray( formData?.[ name ], true ) ? ( formData?.[ name ] ) : [] ) ];
        currItems.splice( index, 1 );
        setFormData( ( prev ) => ( {
            ...prev,
            [ name ]: currItems
        } ) );
    };

    return (
        <>
            <Dialog
                open={ open }
                onOpenChange={ ( isOpen ) => {
                    if ( !isGenericDocModalOpen ) {
                        if ( !isOpen ) handleModalClose();
                        else onOpenChange( true );
                    }
                } }
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            { reminderToEdit ? "Edit Reminder" : reminderToClone ? "Clone Reminder" : "Create New Reminder" }
                        </DialogTitle>
                        <DialogDescription>
                            { reminderToEdit
                                ? "Update the details."
                                : reminderToClone
                                    ? "Modify details for the new reminder."
                                    : "Fill in the details." }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={ handleSubmit }>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="docType" className="text-right">
                                    Data Type
                                </Label>
                                <Select name="docType" value={ formData.docType } onValueChange={ handleDataTypeChange }>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select data type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        { Object.keys( DATA_TYPE_CONFIG ).map( ( type ) => (
                                            <SelectItem key={ type } value={ type }>
                                                { type }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            { formData.docType && DATA_TYPE_CONFIG[ formData.docType ]?.fetchUrl && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="docId" className="text-right">
                                        { formData.docType }
                                    </Label>
                                    <Select
                                        name="docId"
                                        value={ formData.docId }
                                        onValueChange={ handleDocumentChange }
                                        disabled={ isLoadingDocs || !formData.docType }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue
                                                placeholder={ isLoadingDocs ? `Loading ${ formData.docType }s...` : `Select ${ formData.docType }` }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="add_new">--- Add New { formData.docType } ---</SelectItem>
                                            { documents.map( ( doc ) => (
                                                <SelectItem key={ doc._id } value={ doc._id }>
                                                    { doc[ DATA_TYPE_CONFIG[ formData.docType ]?.titleField || "title" ] }
                                                </SelectItem>
                                            ) ) }
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) }

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Item Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={ formData.title }
                                    onChange={ handleInputChange }
                                    className="col-span-3"
                                    placeholder="Title of item to be reminded of"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="timezone" className="text-right">
                                    Timezone
                                </Label>
                                <Select
                                    name="timezone"
                                    value={ formData.timezone }
                                    onValueChange={ ( v ) => handleSelectChange( "timezone", v ) }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        { timezones && utils.val.isValidArray( timezones, true ) && timezones.map( ( type ) => (
                                            <SelectItem key={ type?.value } value={ type?.value }>
                                                { type?.label }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>


                            <TriggerDatesInput
                                dates={ formData?.triggerDates || [] }
                                onChange={ ( newDates ) => setFormData( ( prev ) => ( { ...prev, triggerDates: newDates } ) ) }
                                timezone={ formData?.timezone || "America/New_York" }
                            />

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notificationType" className="text-right">
                                    Notify Via
                                </Label>
                                <Select
                                    name="notificationType"
                                    value={ formData.notificationType }
                                    onValueChange={ ( v ) => handleSelectChange( "notificationType", v ) }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select notification type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        { NOTIFICATION_TYPES.map( ( type ) => (
                                            <SelectItem key={ type.value } value={ type.value }>
                                                { type.label }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            { formData?.notificationType && [ 'sms', 'email', 'push' ].includes( formData?.notificationType ) && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="notificationContact" className="text-right">
                                        { formData.notificationType === "email" ? "Email Address" : "Phone Number" }
                                        <span className="text-destructive ml-1">*</span>
                                    </Label>
                                    <Input
                                        type={ formData.notificationType === 'sms' ? 'tel' : 'email' }
                                        id="notificationContact"
                                        name="notificationContact"
                                        required
                                        value={ formData.notificationContact }
                                        onChange={ handleInputChange }
                                        className="col-span-3"
                                        placeholder="Contact address to be notified at"
                                    />
                                </div>
                            ) }

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="message" className="text-right">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={ formData.message }
                                    onChange={ handleInputChange }
                                    className="col-span-3"
                                    placeholder="Optional message"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Active</Label>
                                <div className="col-span-3 flex items-center">
                                    <Checkbox
                                        id="isActive"
                                        name="isActive"
                                        checked={ formData.isActive }
                                        onCheckedChange={ ( checked ) => handleSelectChange( "isActive", checked ) }
                                    />
                                    <Label htmlFor="isActive" className="ml-2 font-normal">
                                        Is this reminder activated by default?
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Enabled</Label>
                                <div className="col-span-3 flex items-center">
                                    <Checkbox
                                        id="isEnabled"
                                        name="isEnabled"
                                        checked={ formData.isEnabled }
                                        onCheckedChange={ ( checked ) => handleSelectChange( "isEnabled", checked ) }
                                    />
                                    <Label htmlFor="isEnabled" className="ml-2 font-normal">
                                        Is this reminder enabled by default?
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Trash</Label>
                                <div className="col-span-3 flex items-center">
                                    <Checkbox
                                        id="inTrash"
                                        name="inTrash"
                                        checked={ formData.inTrash }
                                        onCheckedChange={ ( checked ) => handleSelectChange( "inTrash", checked ) }
                                    />
                                    <Label htmlFor="inTrash" className="ml-2 font-normal">
                                        Is this reminder in the trashbin by default?
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Recurring</Label>
                                <div className="col-span-3 flex items-center">
                                    <Checkbox
                                        id="showRecurrence"
                                        name="showRecurrence"
                                        checked={ formData.showRecurrence }
                                        onCheckedChange={ ( checked ) => handleSelectChange( "showRecurrence", checked ) }
                                    />
                                    <Label htmlFor="showRecurrence" className="ml-2 font-normal">
                                        Enable complex recurrence rules
                                    </Label>
                                </div>
                            </div>

                            { formData.showRecurrence && (
                                <div className="col-span-1 space-y-3 p-3 border rounded-md">
                                    { formData.rrules.map( ( term, index ) => (
                                        <div key={ index } className="p-3 border rounded space-y-2 bg-muted/50 relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={ () => removeRecurrenceTerm( index ) }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor={ `termType-${ index }` }>Rule Type</Label>
                                                    <Select value={ term.ruleType } onValueChange={ ( v ) => updateRecurrenceTerm( index, "ruleType", v ) }>
                                                        <SelectTrigger id={ `termType-${ index }` }>
                                                            <SelectValue placeholder="Select rule type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            { RECURRENCE_TERM_TYPES.map( ( rt ) => (
                                                                <SelectItem key={ rt.value } value={ rt.value }>
                                                                    { rt.label }
                                                                </SelectItem>
                                                            ) ) }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                { term.ruleType === "specific" && (
                                                    <div>
                                                        <Label htmlFor={ `termDateTime-${ index }` }>Date & Time</Label>
                                                        <Input
                                                            id={ `termDateTime-${ index }` }
                                                            type="datetime-local"
                                                            value={ term.startDate }
                                                            onChange={ ( e ) => updateRecurrenceTerm( index, "startDate", e.target.value ) }
                                                        />
                                                    </div>
                                                ) }
                                                { ( term.ruleType === "daily" || term.ruleType === "weekly" ) && (
                                                    <div>
                                                        <Label htmlFor={ `termTime-${ index }` }>Time</Label>
                                                        <Input
                                                            id={ `termTime-${ index }` }
                                                            type="time"
                                                            value={ term.startTime }
                                                            onChange={ ( e ) => updateRecurrenceTerm( index, "startTime", e.target.value ) }
                                                        />
                                                    </div>
                                                ) }
                                            </div>
                                            { ( term.ruleType === "weekly" || term.ruleType === "hourly_on_days_range" ) && (
                                                <div>
                                                    <Label>Days of Week</Label>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        { DAYS_OF_WEEK.map( ( day ) => (
                                                            <Button
                                                                key={ day.value }
                                                                type="button"
                                                                variant={ term.onDays?.includes( day.value ) ? "default" : "outline" }
                                                                size="sm"
                                                                onClick={ () => handleRecurrenceDayToggle( index, day.value ) }
                                                            >
                                                                { day.label }
                                                            </Button>
                                                        ) ) }
                                                    </div>
                                                </div>
                                            ) }
                                            { term.ruleType === "hourly_on_days_range" && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <Label htmlFor={ `termStartTime-${ index }` }>Start Time</Label>
                                                        <Input
                                                            id={ `termStartTime-${ index }` }
                                                            type="time"
                                                            value={ term.startTime }
                                                            onChange={ ( e ) => updateRecurrenceTerm( index, "startTime", e.target.value ) }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={ `termEndTime-${ index }` }>End Time</Label>
                                                        <Input
                                                            id={ `termEndTime-${ index }` }
                                                            type="time"
                                                            value={ term.endTime }
                                                            onChange={ ( e ) => updateRecurrenceTerm( index, "endTime", e.target.value ) }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={ `termInterval-${ index }` }>Interval (mins)</Label>
                                                        <Input
                                                            id={ `termInterval-${ index }` }
                                                            type="number"
                                                            value={ term.interval }
                                                            min="1"
                                                            max="720"
                                                            onChange={ ( e ) => updateRecurrenceTerm( index, "interval", Number.parseInt( e.target.value ) ) }
                                                        />
                                                    </div>
                                                </div>
                                            ) }
                                        </div>
                                    ) ) }
                                    <Button type="button" variant="outline" onClick={ addRecurrenceTerm } className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Recurrence Rule
                                    </Button>
                                </div>
                            ) }
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={ isSubmitting || isLoadingDocs }
                            >
                                { isSubmitting
                                    ? reminderToEdit
                                        ? "Updating..."
                                        : "Creating..."
                                    : reminderToEdit
                                        ? "Update Reminder"
                                        : reminderToClone
                                            ? "Create Clone"
                                            : "Create Reminder" }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            { isGenericDocModalOpen && formData.docType && (
                <GenericDocumentFormDialogWrapper
                    open={ isGenericDocModalOpen }
                    onOpenChange={ setIsGenericDocModalOpen }
                    onDocumentCreated={ handleGenericDocCreated }
                    docType={ formData.docType }
                />
            ) }
        </>
    );
}

// ** REFINED UTILITY FUNCTIONS **

/**
 * Converts a UTC date string to the format required by datetime-local input,
 * adjusted for the user's local timezone.
 *
 * @param {string} utcIsoString The UTC ISO string from the state.
 * @returns {string} A string formatted as "YYYY-MM-DDTHH:mm" in the user's local time.
 */
function utcToLocalInputFormat ( utcIsoString ) {
    if ( !utcIsoString ) return '';
    const date = new Date( utcIsoString );
    const offset = date.getTimezoneOffset() * 60000; // Get offset in milliseconds
    const localDate = new Date( date.getTime() - offset );
    return localDate.toISOString().slice( 0, 16 );
}

/**
 * Converts a local time string from a datetime-local input to a UTC ISO string.
 * This is the crucial step for saving the value correctly.
 *
 * @param {string} localInputString The string from the datetime-local input ("YYYY-MM-DDTHH:mm").
 * @returns {string} The UTC ISO string.
 */
function localInputToUTCISO ( localInputString ) {
    if ( !localInputString ) return '';
    const localDate = new Date( localInputString );
    const offset = localDate.getTimezoneOffset() * 60000;
    const utcDate = new Date( localDate.getTime() + offset );
    return utcDate.toISOString();
}

/**
 * A wrapper around the native <input type="datetime-local"> that correctly
 * handles conversion between UTC (for state management) and local time (for display).
 *
 * @param {{
* value: string;
* onChange: (utcIsoString: string) => void;
* } & React.ComponentProps<typeof Input>} props
*/
export function DateTimePickerLocal ( { value, onChange, ...props } ) {
    // Convert the incoming UTC value to a string for the input element.
    const localValue = utcToLocalInputFormat( value );

    const handleChange = ( e ) => {
        // Convert the input's local time string back to a UTC ISO string.
        // var arrTZDate = dateUTC.toLocaleDateString( 'en-CA', optionsLocal ).split( "," );
        // var arrDate = arrTZDate[ 0 ].split( "/" ).map( x => Number( x ) );
        // var arrTime = arrTZDate[ 1 ].split( ":" ).map( x => Number( x ) );
        // var dateTZ = new Date( arrDate[ 2 ], arrDate[ 0 ] - 1, arrDate[ 1 ], arrTime[ 0 ], arrTime[ 1 ], 0, 0 );
        let newDateTime = new Date( e.target.value );
        let localHours = new Date( localValue ).getHours();
        let newHours = newDateTime.getHours();

        if ( localHours < 12 && newHours >= 12 ) {
            newDateTime = subHours( newDateTime, 12 );
        }
        else if ( localHours >= 12 && newHours < 12 ) {
            newDateTime = addHours( newDateTime, 12 );
        }

        console.log( "e.target.value = ", e.target.value );
        // const newUtcValue = localInputToUTCISO( e.target.value );
        if ( onChange ) {
            // onChange( e.target.value );
            onChange( newDateTime );
        }
    };

    return (
        <Input
            type="datetime-local"
            // value={ new Date( value ).toISOString().slice( 0, 16 ) }
            value={ localValue || new Date() }
            onChange={ handleChange }
            { ...props }
        />
    );
}

export function TriggerDatesInput ( { dates, timezone, onChange, ...props } ) {
    const timezones = useMemo( () => getSortedTimezones(), [] );

    const handleDateChange = ( index, newUtcDate ) => {
        const newDates = [ ...( dates || [] ) ];
        if ( newUtcDate ) {
            let currentHours = new Date( newDates[ index ] ).getHours();
            let newDateTime = new Date( newUtcDate );
            let newHours = newDateTime.getHours();

            if ( currentHours < 12 && newHours >= 12 ) {
                newDateTime = subHours( newDateTime, 12 );
            }
            else if ( currentHours >= 12 && newHours < 12 ) {
                newDateTime = addHours( newDateTime, 12 );
            }

            // newDates[ index ] = newUtcDate;
            newDates[ index ] = newDateTime;
            onChange( newDates );
        }
    };

    const addDate = () => {
        const newDates = [ ...( dates || [] ), utcToLocalInputFormat( new Date().toISOString() ) ];
        onChange( newDates );
    };

    const removeDate = ( index ) => {
        const newDates = ( dates || [] ).filter( ( _, i ) => i !== index );
        onChange( newDates );
    };

    return (
        <div className="space-y-3">
            <Label className="font-medium">Specific Trigger Dates</Label>
            <div className="p-2 border rounded-lg bg-muted/20">
                { ( dates || [] ).map( ( date, index ) => (
                    <div key={ index } className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <DateTimePickerLocal
                            value={ new Date( date ).toISOString() }
                            onChange={ ( newUtcDate ) => handleDateChange( index, newUtcDate ) }
                            required
                            { ...props }
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={ () => removeDate( index ) }
                            className="text-destructive hover:bg-destructive/10"
                        >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Remove date</span>
                        </Button>
                    </div>
                ) ) }
                { ( !dates || dates.length === 0 ) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No specific trigger dates added.</p>
                ) }
                <div className="grid grid-cols-2 items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={ addDate }
                        className="mt-2 bg-transparent col-span-1"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Date & Time
                    </Button>
                    <div className="grid col-span-1 grid-cols-4 gap-4 justify-center items-center">
                        <Label htmlFor="timezone" className="text-right col-span-1">
                            Timezone
                        </Label>
                        <Select
                            name="timezone"
                            value={ timezone }
                            onValueChange={ ( v ) => console.log( 'Timezone change:', v ) }
                        >
                            <SelectTrigger className="w-full flex-1 col-span-3">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                { timezones && utils.val.isValidArray( timezones, true ) && timezones.map( ( type ) => (
                                    <SelectItem key={ type?.value } value={ type?.value }>
                                        { type?.label }
                                    </SelectItem>
                                ) ) }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">Times are shown in your local timezone but saved in UTC.</p>
        </div>
    );
}
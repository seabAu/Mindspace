import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecurrenceRuleSetForm } from "./recurrence-rule-set-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NOTIFICATION_TYPES, REMINDER_DOC_TYPES, DEFAULT_TIMEZONE } from "@/features/Remind/lib/config.js";
import useReminderStore from "@/store/reminder.store";
import useGlobalStore from "@/store/global.store";
import { timezonesWithoffsets } from "@/lib/utilities/time";
import * as utils from 'akashatools';
import { caseCamelToSentence } from "@/lib/utilities/string";

function getFormattedElement ( timeZone, name, value ) {
    return ( new Intl.DateTimeFormat( 'en', {
        [ name ]: value,
        timeZone
    } ).formatToParts().find( el => el.type === name ) || {} ).value;
}

const timezones = Intl.supportedValuesOf( 'timeZone' ).map( ( timeZone ) => {
    const offset = new Intl.DateTimeFormat( 'en', { timeZone: timeZone, timeZoneName: 'shortOffset' } ).formatToParts().find( part => part.type === 'timeZoneName' ).value;
    const timeZoneAbbrivation = new Intl.DateTimeFormat( 'en', { timeZone: timeZone, timeZoneName: 'shortOffset' } ).formatToParts().find( part => part.type === 'timeZoneName' ).value;
    return {
        offset: offset,
        label: `${ timeZone } - ${ timeZoneAbbrivation } (${ offset })`,
        // label: timeZone,
        value: timeZone,
    };
} );

// [
//     { value: "UTC", label: "UTC" },
//     { value: "America/New_York", label: "Eastern Time (ET)" },
//     { value: "America/Chicago", label: "Central Time (CT)" },
//     { value: "America/Denver", label: "Mountain Time (MT)" },
//     { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
//     { value: "Europe/London", label: "London (GMT/BST)" },
// ];

export function ReminderFormFields ( { reminder, onFieldChange, onRRuleSetChange, addRRuleSet, removeRRuleSet } ) {
    const {
        addReminder,
        updateReminder,
        reminderToEdit,
        clearReminderToEdit,
        reminderToClone,
        clearReminderToClone
    } = useReminderStore();

    const {
        data,
        getData,
        getDataOfType: getDocumentsByType,
        reloadData
    } = useGlobalStore();
    // const refData = getData();

    // const getDocumentsByType = useReminderStore( ( state ) => state.getDocumentsByType );
    const [ associatedDocs, setAssociatedDocs ] = useState( [] );

    useEffect( () => {
        if ( reminder.docType ) {
            setAssociatedDocs( getDocumentsByType( reminder.docType ) );
        } else {
            setAssociatedDocs( [] );
        }
    }, [ reminder.docType, getDocumentsByType ] );

    const handleInputChange = ( fieldName, value ) => {
        onFieldChange( fieldName, value );
        if ( fieldName === "docType" ) {
            // Reset docId and docURL if docType changes
            // Only reset docId if there is no match for it in the current list of available docs. 
            let docId = reminder?.docId;
            let doc = associatedDocs?.find( ( doc ) => ( doc?._id === docId ) );
            if ( !doc ) {
                // onFieldChange( "docId", "" );
            }
            // onFieldChange( "docId", "" );
            onFieldChange( "docURL", "" );
        }
    };

    const handleAssociatedDocChange = ( selectedDocId ) => {
        const selectedDoc = associatedDocs.find( ( doc ) => doc._id === selectedDocId );
        if ( selectedDoc ) {
            onFieldChange( "docId", selectedDoc._id );
            onFieldChange( "docURL", selectedDoc?.url || `/docs/${ reminder.docType?.toLowerCase() }/${ selectedDoc._id }` );
        } else {
            onFieldChange( "docId", "" );
            onFieldChange( "docURL", "" );
        }
    };

    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4 custom-scrollbar">
            {/* Basic Info */ }
            <div className="space-y-1">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    value={ reminder.title || "" }
                    onChange={ ( e ) => handleInputChange( "title", e.target.value ) }
                    required
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    value={ reminder.message || "" }
                    onChange={ ( e ) => handleInputChange( "message", e.target.value ) }
                />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                { [
                    { field: "isActive", label: "Active (will run)" },
                    { field: "isEnabled", label: "Enabled (can be activated)" },
                    { field: "isPinned", label: "Pinned" },
                ].map( ( { field, label } ) => (
                    <div key={ field } className="flex items-center space-x-2">
                        <Switch
                            id={ field }
                            checked={ reminder[ field ] || false }
                            onCheckedChange={ ( checked ) => handleInputChange( field, checked ) }
                        />
                        <Label htmlFor={ field } className="font-normal text-sm">
                            { label }
                        </Label>
                    </div>
                ) ) }
            </div>

            <div className="space-y-1">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                    value={ reminder.timezone || DEFAULT_TIMEZONE }
                    onValueChange={ ( value ) => handleInputChange( "timezone", value ) }
                >
                    <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        { timezones.map( ( tz ) => (
                            <SelectItem key={ tz.value } value={ tz.value }>
                                { tz.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </div>

            <TriggerDatesInput
                dates={ reminder.triggerDates || [] }
                onChange={ ( newDates ) => onFieldChange( "triggerDates", newDates ) }
            />

            <div className="flex items-center space-x-2">
                <Switch
                    id="isRecurring"
                    checked={ reminder.isRecurring || false }
                    onCheckedChange={ ( checked ) => handleInputChange( "isRecurring", checked ) }
                />
                <Label htmlFor="isRecurring">Is Recurring?</Label>
            </div>

            { reminder.isRecurring && (
                <div className="space-y-3 pl-2 border-l-2 ml-2">
                    <Label className="text-md font-semibold">Recurrence Patterns</Label>
                    { ( reminder.rrules || [] ).map( ( ruleSet, index ) => (
                        <RecurrenceRuleSetForm
                            key={ ruleSet.id || index }
                            ruleSet={ ruleSet }
                            onChange={ ( updatedSet ) => onRRuleSetChange( index, updatedSet ) }
                            onRemove={ () => removeRRuleSet( index ) }
                        />
                    ) ) }
                    <Button type="button" variant="outline" onClick={ addRRuleSet }>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Recurrence Pattern
                    </Button>
                </div>
            ) }

            <div className="space-y-1">
                <Label htmlFor="notificationType">Notification Type</Label>
                <Select
                    value={ reminder.notificationType || "toast" }
                    onValueChange={ ( value ) => handleInputChange( "notificationType", value ) }
                >
                    <SelectTrigger id="notificationType">
                        <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                        { NOTIFICATION_TYPES.map( ( nt ) => (
                            <SelectItem key={ nt.value } value={ nt.value }>
                                { nt.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="notificationContact">Notification Contact (Email/Phone)</Label>
                <Input
                    id="notificationContact"
                    value={ reminder.notificationContact || "" }
                    onChange={ ( e ) => handleInputChange( "notificationContact", e.target.value ) }
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="docType">Associated Document Type</Label>
                <Select value={ reminder?.docType || "" } onValueChange={ ( value ) => handleInputChange( "docType", value ) }>
                    <SelectTrigger id="docType">
                        <SelectValue placeholder="Select document type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        { REMINDER_DOC_TYPES.map( ( dt ) => (
                            <SelectItem key={ dt.value } value={ dt.value }>
                                { dt.label }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </div>

            { reminder?.docType && associatedDocs && utils.val.isValidArray( associatedDocs, true ) && (
                <div className="space-y-1">
                    <Label htmlFor="associatedDoc">Select { reminder.docType }</Label>
                    <Select value={ reminder.docId || "" } onValueChange={ handleAssociatedDocChange }>
                        <SelectTrigger id="associatedDoc">
                            <SelectValue placeholder={ `Select a ${ reminder.docType }...` } />
                        </SelectTrigger>
                        <SelectContent>
                            { associatedDocs.map( ( doc ) => (
                                <SelectItem key={ doc._id } value={ doc._id }>
                                    { doc.title }
                                </SelectItem>
                            ) ) }
                        </SelectContent>
                    </Select>
                </div>
            ) }
            {/* Hidden input for docURL for now, can be made visible if manual editing is needed */ }
            <input type="hidden" value={ reminder.docURL || "" } readOnly />
        </div>
    );
}

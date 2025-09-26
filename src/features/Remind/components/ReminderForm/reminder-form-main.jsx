import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ReminderFormFields } from "./reminder-form-fields";
// import { DEFAULT_TIMEZONE } from "@/config/formConstants";
import { DEFAULT_TIMEZONE } from "@/features/Remind/lib/config";
import * as utils from 'akashatools';
import { isValidEmail, isValidPhoneNumber } from "@/lib/utilities/validation";

const generateClientSideId = ( prefix = "item" ) => `${ prefix }-${ Date.now() }-${ Math.random().toString( 36 ).substr( 2, 9 ) }`;

const initialReminderState = {
    title: "",
    message: "",
    isActive: true,
    isEnabled: true,
    isPinned: false,
    triggerDates: [],
    isRecurring: false,
    rrules: [],
    timezone: DEFAULT_TIMEZONE,
    notificationType: "toast",
    notificationContact: "",
    docId: "",
    docType: "",
    docURL: "",
};

// Use forwardRef to allow parent to call submit handler
export const ReminderFormMain = forwardRef( ( { onSave, onChange, onCancel, initialData }, ref ) => {
    const [ reminder, setReminder ] = useState(
        initialData ? { ...initialReminderState, ...initialData } : initialReminderState,
    );

    useEffect( () => {
        setReminder( initialData ? { ...initialReminderState, ...initialData } : initialReminderState );
    }, [ initialData ] );

    const handleFieldChange = ( fieldName, value ) => {
        setReminder( ( prev ) => ( { ...prev, [ fieldName ]: value } ) );
    };

    const handleRRuleSetChange = ( index, updatedSet ) => {
        setReminder( ( prev ) => {
            const newRrules = [ ...( prev.rrules || [] ) ];
            newRrules[ index ] = updatedSet;
            return { ...prev, rrules: newRrules };
        } );
    };

    const addRRuleSet = () => {
        const newSet = {
            id: generateClientSideId( "rset" ),
            enabled: true,
            startTime: { hour: 9, minute: 0 },
            rules: [ { id: generateClientSideId( "rule" ), ruleType: "every", interval: "day", value: 1 } ],
            startDate: new Date().toISOString(),
            count: null,
        };
        setReminder( ( prev ) => ( { ...prev, rrules: [ ...( prev.rrules || [] ), newSet ] } ) );
    };

    const removeRRuleSet = ( index ) => {
        setReminder( ( prev ) => ( { ...prev, rrules: ( prev.rrules || [] ).filter( ( _, i ) => i !== index ) } ) );
    };

    /* const internalHandleSubmit = () => {
        if ( !reminder.title ) {
            alert( "Title is required." );
            return false; // Indicate submission failure
        }
        const reminderToSave = {
            ...reminder,
            rrules: ( reminder.rrules || [] ).map( ( rset ) => {
                const { id, ...restOfRSet } = rset;
                return {
                    ...restOfRSet,
                    rules: ( restOfRSet.rules || [] ).map( ( rule ) => {
                        const { id: ruleId, ...restOfRule } = rule;
                        return restOfRule;
                    } ),
                };
            } ),
        };
        onSave( reminderToSave );
        return true; // Indicate submission success
    }; */


    const internalHandleSubmit = () => {
        if ( !reminder.title ) {
            alert( "Title is required." );
            return false;
        }

        // Validate notification contact based on type
        if ( reminder.notificationType === "email" ) {
            if ( !reminder.notificationContact ) {
                alert( "Email address is required for email notifications." );
                return false;
            }
            if ( !isValidEmail( reminder.notificationContact ) ) {
                alert( "Please enter a valid email address." );
                return false;
            }
        }

        if ( reminder.notificationType === "sms" ) {
            if ( !reminder.notificationContact ) {
                alert( "Phone number is required for SMS notifications." );
                return false;
            }
            if ( !isValidPhoneNumber( reminder.notificationContact ) ) {
                alert( "Please enter a valid phone number." );
                return false;
            }
        }

        const reminderToSave = {
            ...reminder,
            rrules: ( reminder.rrules || [] ).map( ( rset ) => {
                const { id, ...restOfRSet } = rset;
                return {
                    ...restOfRSet,
                    rules: ( restOfRSet.rules || [] ).map( ( rule ) => {
                        const { id: ruleId, ...restOfRule } = rule;
                        return restOfRule;
                    } ),
                };
            } ),
        };
        onSave( reminderToSave );
        return true;
    };

    // Expose submit handler to parent via ref
    useImperativeHandle( ref, () => ( {
        submitForm: internalHandleSubmit,
    } ) );

    return (
        // The form tag is implicit; submission is handled via ref or prop chain
        // No <form> tag here, as the Dialog's button will trigger submission.
        <ReminderFormFields
            reminder={ reminder }
            onFieldChange={ handleFieldChange }
            onRRuleSetChange={ handleRRuleSetChange }
            addRRuleSet={ addRRuleSet }
            removeRRuleSet={ removeRRuleSet }
        />
    );
} );

ReminderFormMain.displayName = "ReminderFormMain"; // for DevTools

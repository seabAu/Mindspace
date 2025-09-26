// https://github.com/mohammedmohsin203/Notion-Clone-7/blob/main/components/providers/ModalProvider.jsx // 
import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
import {
    DIALOG_TYPE_CLOSE_ICONS,
    DIALOG_TYPE_CLOSE_NAMES,
    DIALOG_TYPE_DESCRIPTIONS,
    DIALOG_TYPE_ICONS,
    DIALOG_TYPE_NAMES,
    DIALOG_TYPE_SUBMIT_NAMES,
    DIALOG_TYPES,
    TODO_DIFFICULTY_OPTIONS,
    TODO_PRIORITY_OPTIONS,
    TODO_STATUS_OPTIONS,
    TYPE_DIALOG_CONFIG,
} from '@/lib/config/config.js';
import { DATE_PICKER_OPTIONS } from '@/lib/config/constants.js';
import FormGenerator from '@/components/Form/FormGenerator';
import { Button } from '@/components/ui/button';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import useGlobalStore from '@/store/global.store';


export const FormDialogWrapper = ( {
    debug = false,
    useOverlay = true,
    initialData,
    data, setData,
    refData,
    dataSchema,
    simplifiedDataSchema,
    useSimplifiedSchema = true,
    dialogOpen, setDialogOpen,
    handleSubmit,
    handleChange,
    handleClose,
    dialogType = 'add',
    dataType, // Name of type of data being represented.   
    dialogTrigger,
    submitButton,
    customFields,
    layout = [],
    classNames,
    dialogClassNames,
    contentClassNames,
    initialDataAutofillRandom = false,
    useMultiSelectForObjectIds = false,
    useSlidersForNumbers = true,
    useSwitchesForBoolean = true,
    useBadgesForStringArrays = true,
    useDateRangeForDateArrays = true,
    useRadialForDecimals = true,
    showAllFieldsByDefault = true,
    showSidebar = true,
    showData = true,
    showOptional = true,
    showFormModel = false,
    showFormData = true,
    showFormSchema = false,
    children,
    ...props
} ) => {
    const {
        schemas, getSchema, setSchemas, fetchSchemas,
        getData, getDataOfType,
    } = useGlobalStore();
    const [ formData, setFormData ] = useState( utils.val.isDefined( data ) ? data : {} );
    // const [ formSchema, setFormSchema ] = useState( utils.val.isDefined( dataSchema ) ? dataSchema : {} );

    let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }`;
    let description = `${ dataType ? utils.str.toCapitalCase( dataType ) : `Event` }`;

    if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
        // Undefined / null input data. Assume we need to create initial data for a new document. 
        dataSchema = getSchema( dataType );
        // setFormSchema( dataSchema );
    }

    // If useSimplifiedSchema is true and we have a simplifiedDataSchema provided, sort and filter the main schema by that. 
    if ( useSimplifiedSchema && simplifiedDataSchema && utils.val.isObject( simplifiedDataSchema ) ) {
        // console.log( 'FormDialogWrapper :: simplifiedDataSchema = ', simplifiedDataSchema, " :: ", "dataSchema = ", dataSchema, " :: ", "useSimplifiedSchema = ", useSimplifiedSchema );
        // let newSchema = Object.keys( simplifiedDataSchema ).map( ( fieldName, fieldIndex ) => {
        //     let fieldSchemaSettings = simplifiedDataSchema?.[ fieldName ];
        //     let fieldSchema = dataSchema?.[ fieldName ];
        //     if ( fieldSchema && utils.val.isDefined( fieldSchema ) ) {
        //         let adjustedSchema = {
        //             ...( utils.val.isDefined( fieldSchemaSettings ) ? fieldSchemaSettings : {} ),
        //             ...fieldSchema
        //         };
        //         return adjustedSchema;
        //     }
        // } );
        let newSchema = {};
        Object.keys( simplifiedDataSchema ).forEach( ( fieldName, fieldIndex ) => {
            let fieldSchemaSettings = simplifiedDataSchema?.[ fieldName ];
            let fieldSchema = dataSchema?.[ fieldName ];
            if ( fieldSchema && utils.val.isDefined( fieldSchema ) ) {
                let adjustedSchema;
                if ( utils.val.isValidArray( fieldSchema, true ) ) {
                    adjustedSchema = [ {
                        ...fieldSchema[ 0 ],
                        ...( utils.val.isDefined( fieldSchemaSettings ) ? fieldSchemaSettings : {} ),
                    } ];
                }
                else if ( utils.val.isObject( fieldSchema ) ) {
                    adjustedSchema = {
                        ...fieldSchema,
                        ...( utils.val.isDefined( fieldSchemaSettings ) ? fieldSchemaSettings : {} ),
                    };
                }
                newSchema[ fieldName ] = adjustedSchema;
            }
        } );

        if ( newSchema ) {
            // console.log( 'FormDialogWrapper :: simplifiedDataSchema = ', simplifiedDataSchema, " :: ", "dataSchema = ", dataSchema, " :: ", "useSimplifiedSchema = ", useSimplifiedSchema, " :: ", "newSchema = ", newSchema );
            dataSchema = newSchema;
            // setFormSchema( dataSchema );
        }
    }

    // if ( debug === true )
    //     console.log( 'ModalProvider :: FormDialogWrapper :: buildDialogWrapper :: args = ', "\n :: ", "data = ", data,
    //         "\n :: ", "setData = ", setData, // For onchange
    //         "\n :: ", "dataSchema = ", dataSchema,
    //         "\n :: ", "dialogOpen = ", dialogOpen,
    //         "\n :: ", "setDialogOpen = ", setDialogOpen,
    //         "\n :: ", "handleSubmit = ", handleSubmit,
    //         "\n :: ", "handleChange = ", handleChange,
    //         "\n :: ", "handleClose = ", handleClose,
    //         "\n :: ", "dialogType = ", dialogType,
    //         "\n :: ", "dataType = ", dataType, // Name of type of data being represented.
    //         "\n :: ", "getSchema( dataType ) = ", getSchema( dataType ),
    //     );

    if ( !refData ) refData = getData();
    return (
        <Dialog
            title={ title }
            open={ dialogOpen }
            // isOpen={ dialogOpen || !!data }
            onClose={ () => handleClose() }
            onOpenChange={ () => { setDialogOpen( !dialogOpen ); } }
            // onOpenChange={ setDialogOpen }
            className={ `flex flex-col rounded-xl justify-start items-stretch relative !min-w-[60vw] !max-w-[60vw] !w-[60vw] ` }
        >

            { dialogTrigger && ( <DialogTrigger asChild>
                <Button
                    className={ `select-none` }
                    variant='outline'>
                    { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }{ `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                </Button>
            </DialogTrigger> ) }

            { useOverlay && ( <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } /> ) }

            <DialogContent
                className={ twMerge(
                    // `absolute z-[1000] `,
                    // `w-full min-w-[50vw] max-w-[50vw] h-[80vh] min-h-[80vh] flex flex-col overflow-hidden p-4`,
                    // `overflow-auto`,
                    `p-4 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200`,
                    `flex flex-col max-h-modal w-full sm:max-w-[${ 100 }%] max-h-modal rounded-xl`,
                    `w-full !min-w-[60vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 525 }px] max-h-modal flex flex-col`,
                    `transition-all ease-in-out duration-200`,
                    `overflow-hidden overflow-y-auto`,
                    contentClassNames,
                ) }
            >

                <DialogHeader className={ `sticky h-12 w-full flex-col justify-stretch items-start` }>
                    <DialogTitle>{ `${ title }` }</DialogTitle>
                    <DialogDescription>{ `${ description }` }</DialogDescription>
                </DialogHeader>

                <div className={ `flex flex-col gap-2` }>
                    { children }
                    { dataSchema && utils.val.isObject( dataSchema ) && (
                        <FormGenerator
                            debug={ !!debug }
                            // model={ logFormModel }
                            // data={ initialData }
                            data={ data }
                            setData={ setData }
                            refData={ refData }
                            schema={ dataSchema }
                            // schema={ formSchema ?? dataSchema }
                            initialData={ initialData }
                            // onChange={ ( name, value ) => {
                            //     // const { name, value } = e.target;
                            //     if ( data && Object.keys( data ).includes( name ) ) {
                            //         if ( handleChange ) { handleChange( name, value, data, setData ); }
                            //         else { setData( { ...data, [ name ]: value } ); }
                            //         setFormData( { ...formData, [ name ]: value } );
                            //     }
                            // } }
                            onChange={ ( name, value ) => {
                                // const { name, value } = e.target;
                                if ( data && Object.keys( data ).includes( name ) ) {
                                    if ( handleChange ) { handleChange( name, value, data, setData ); }
                                    else { setData( { ...data, [ name ]: value } ); }
                                    setFormData( { ...formData, [ name ]: value } );
                                }
                            } }
                            onUpdate={ ( updatedFormData ) => {
                                if ( updatedFormData && Object.keys( updatedFormData ).length > 0 ) {
                                    console.log( "FormDialogWrapper :: onUpdate event called :: updatedFormData = ", updatedFormData );
                                    setFormData( updatedFormData );
                                    setData( updatedFormData );
                                }
                            } }
                            // onCancel={ () => handleCancel() }
                            onSubmit={ ( data ) => handleSubmit( data ) }
                            showFormModel={ showFormModel ?? true }
                            showFormData={ showFormData ?? true }
                            showFormSchema={ showFormSchema ?? true }
                            showAllFieldsByDefault={ showAllFieldsByDefault ?? true }
                            showSidebar={ showSidebar ?? true }
                            showData={ showData ?? true }
                            showOptional={ showOptional ?? true }
                            customFields={ customFields }
                            initialDataAutofillRandom
                            useInitialData={ false }
                            useMultiSelectForObjectIds={ useMultiSelectForObjectIds }
                            useSlidersForNumbers={ useSlidersForNumbers }
                            useSwitchesForBoolean={ useSwitchesForBoolean }
                            useBadgesForStringArrays={ useBadgesForStringArrays }
                            useDateRangeForDateArrays={ useDateRangeForDateArrays }
                            useRadialForDecimals={ useRadialForDecimals }
                            submitButton={ submitButton }
                        />
                    ) }
                </div>

                <DialogFooter className={ `sm:justify-start` }>
                    <div className={ `flex flex-row gap-2 w-full justify-between items-stretch` }>
                        <DialogClose>
                            <Button
                                variant={ `destructive` }
                                className={ `px-6 py-2 rounded-lg bg-bodyprimary` }
                                onClick={ () => {
                                    if ( handleClose ) { handleClose(); }
                                    else {
                                        setData( null );
                                        setFormData( null );
                                        setDialogOpen( false );
                                    }
                                } }
                            >
                                <X />
                                { `${ [ ...DIALOG_TYPE_CLOSE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                            </Button>
                        </DialogClose>

                        <DialogClose>
                            { submitButton ??
                                <Button
                                    type='submit'
                                    className={ twMerge(
                                        // Base styles
                                        'relative inline-flex items-center border px-4 py-2 text-sm font-semibold transition-colors focus:z-10 focus:outline-none focus:ring-1',

                                        // Light-mode focus state
                                        'focus:border-teal-500 focus:ring-teal-500',

                                        // Dark-mode focus state
                                        'dark:focus:border-teal-400 dark:focus:ring-teal-400',
                                        true
                                            ? // Selected / hover states
                                            'border-teal-500 bg-teal-500 text-white hover:bg-teal-600'
                                            : // Unselected / hover state
                                            'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',

                                        true &&
                                        // Dark-mode unselected state (selected is the same)
                                        'dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
                                    ) }
                                    onClick={ () => {
                                        console.log(
                                            'ModalProvider :: FormDialogWrapper :: submit button :: handleSubmit :: initialData = ', initialData, ' :: ', 'data = ', data
                                        );
                                        handleSubmit(
                                            data ?? initialData,
                                            handleSubmit,
                                            dialogType,
                                            dataType
                                        );
                                    } }>
                                    { [ ...DIALOG_TYPE_CLOSE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                    { `${ [ ...DIALOG_TYPE_SUBMIT_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                </Button> }
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

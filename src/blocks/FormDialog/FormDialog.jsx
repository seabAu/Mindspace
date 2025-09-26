// The form that is rendered inside the FormDialogWrapper parent component. 
// The content is passed in using the useDialog hook in FormDialogWrapper.jsx.


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
import { useDialog } from '@/lib/providers/DialogContext';


export const FormDialog = ( {
    debug = false,
    initialData,
    data, setData,
    dataSchema,
    handleSubmit,
    handleChange,
    handleClose,
    dataType, // Name of type of data being represented.   
    classNames,
    dialogClassNames,
    contentClassNames,
    children,
    ...props
} ) => {
    const { getSchema, getData } = useGlobalStore();
    const refData = getData();
    const [ formData, setFormData ] = useState( utils.val.isDefined( data ) ? data : {} );

    if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
        // Undefined / null input data. Assume we need to create initial data for a new document. 
        dataSchema = getSchema( dataType );
    }

    if ( debug === true )
        console.log( 'FormDialog :: FormDialogWrapper :: buildDialogWrapper :: args = ', "\n :: ", "data = ", data,
            "\n :: ", "setData = ", setData, // For onchange
            "\n :: ", "dataSchema = ", dataSchema,
            "\n :: ", "handleSubmit = ", handleSubmit,
            "\n :: ", "handleChange = ", handleChange,
            "\n :: ", "handleClose = ", handleClose,
            "\n :: ", "dataType = ", dataType, // Name of type of data being represented.
            "\n :: ", "getSchema( dataType ) = ", getSchema( dataType ),
        );

    return (
        <div className={ `flex flex-col gap-2` }>
            { dataSchema && utils.val.isObject( dataSchema ) && (
                <FormGenerator
                    debug={ !!debug }
                    data={ data }
                    setData={ setData }
                    refData={ refData }
                    schema={ dataSchema }
                    initialData={ initialData }
                    onChange={ ( e ) => {
                        const { name, value } = e.target;
                        if ( data && Object.keys( data ).includes( name ) ) {
                            if ( handleChange ) { handleChange( name, value, data, setData ); }
                            else { setData( { ...data, [ name ]: value } ); }
                            setFormData( { ...formData, [ name ]: value } );
                        }
                    } }
                    onCancel={ () => handleCancel() }
                    onSubmit={ ( data ) => handleSubmit( data ) }
                    showFormModel={ true }
                    showFormData={ true }
                    showFormSchema={ true }
                />
            ) }
        </div>
    );
};



export const useTaskDialog = () => { };

export const useLogDialog = () => { };

export const useEventDialog = ( {
    initialData, data, setData,
    dataSchema,
    handleSubmit,
    handleChange,
    handleClose,
    dialogType,
    dataType,
    dialogTrigger,
    debug = false,
    ...props
} ) => {
    const { handleOpenDialog } = useDialog();

    const openCreateEventDialog = () => {
        handleOpenDialog( {
            dialogType: dialogType ?? 'add',
            dataType: dataType ?? 'event',
            trigger: ( dialogTrigger ?? <></> ),
            overlay: true,
            onCloseCallback: () => { handleClose(); },
            onOpenCallback: () => { },
            content: (
                <FormDialog
                    data={ data }
                    setData={ setData }
                    dataType={ dataType }
                    dataSchema={ dataSchema }
                    initialData={ initialData }
                    handleSubmit={ handleSubmit }
                    handleChange={ handleChange }
                    handleClose={ handleClose }
                    debug={ debug }
                    { ...props }
                />
            ),
        } );
    };

    const openEditEventDialog = ( initialData ) => {
        openDialog();
    };

    if ( dialogType === 'add' ) { }

    // const renderDialog = () => {
    //     switch ( dialogType ) {
    //         case "create":
    //             openCreateEventDialog();
    //         case "edit":
    //             openEditEventDialog();
    //         case "view":
    //         case "delete":
    //         default:
    //             break;
    //     }
    // };

    return { openCreateEventDialog, openEditEventDialog };
}



/*  These examples demonstrate handling dialog states dynamically with the reducer and showcase integrations with the buildDialog function for creating, editing, deleting, and viewing documents. Each example uses appropriate handlers to ensure a clean, reusable, and robust implementation.
*/
import { useCallback, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import API from '../services/api';
import { ToastAction } from '@/components/ui/toast';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import DatePicker, { DateRangePicker } from '@/components/Calendar/DatePicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormGenerator from '@/components/Form/FormGenerator';
import { ArrowBigUpIcon, Delete, Edit, FileQuestion, FolderOpen, Plus, X } from 'lucide-react';
import { buildSelect } from '@/lib/utilities/input.js';
import { twMerge } from 'tailwind-merge';
import { DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from '@/lib/config/config';
import { DATE_PICKER_OPTIONS } from '@/lib/config/constants';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import useGlobalStore from '@/store/global.store';

const DataDialog = ( {
    data,
    setData, // For onChange
    initialData, // For onChange
    refData,
    dataSchema,
    dialogOpen,
    setDialogOpen,
    handleSubmit,
    handleChange,
    handleClose,
    handleClear,
    dialogType = 'add',
    dataType = 'file', // Name of type of data being represented.
    dialogTrigger,
    formOptions = {
        customFields: {},
        showData: true,
        showFormData: true,
        showOptional: true,
        showFormModel: true,
        showFormSchema: true,
        useRadialForDecimals: true,
        useSlidersForNumbers: true,
        useSwitchesForBoolean: true,
        showAllFieldsByDefault: true,
        initialDataAutofillRandom: true,
        useMultiSelectForObjectIds: true,
        useBadgesForStringArrays: true,
        useDateRangeForDateArrays: true,
    },
    debug = false,
} ) => {

    // TODO :: Populate this with all relevant routes for the different datatypes, just like getData and getSchema.
    // Will need to make a directory system of sorts at some point. 





    const refRoutes = {};






    const { schemas, getSchema, getData } = useGlobalStore();


    let dataTypeName = utils.str.toCapitalCase( dataType );
    let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataTypeName }`;
    let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dataTypeName }`;

    if ( !utils.val.isDefined( data ) ) {
        // Undefined / null input data. Assume we need to create initial data for a new document. 
        if ( dialogType === 'add' ) { data = initialData; }
        else if ( dialogType === 'edit' ) { data = initialData; }
        else if ( dialogType === 'view' ) { data = initialData; }
    }

    if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
        // Undefined / null input data. Assume we need to create initial data for a new document. 
        dataSchema = getSchema( dataType );
    }

    if ( debug === TextTrackCueList )
        console.log( 'DataDialog :: buildDialog :: args = ',
            "\n :: ", "data = ", data,
            "\n :: ", "setData = ", setData, // For onchange
            "\n :: ", "initialData = ", initialData,
            "\n :: ", "dataSchema = ", dataSchema,
            "\n :: ", "dialogOpen = ", dialogOpen,
            "\n :: ", "setDialogOpen = ", setDialogOpen,
            "\n :: ", "handleSubmit = ", handleSubmit,
            "\n :: ", "handleChange = ", handleChange,
            "\n :: ", "handleClose = ", handleClose,
            "\n :: ", "dialogType = ", dialogType,
            "\n :: ", "dataType = ", dataType, // Name of type of data being represented.
            "\n :: ", "getSchema( dataType ) = ", getSchema( dataType ),
        );

    let allData = getData();
    let allSchemas = schemas;

    return (
        <Dialog
            title={ title }
            open={ dialogOpen }
            isOpen={ dialogOpen || !!data }
            onClose={ () => handleClose() }
            onOpenChange={ setDialogOpen } // onOpenChange={ () => { setDialogOpen( true ); } }
            className={ `flex flex-col !min-w-[60vw] !max-w-[60vw] !w-[60vw]` }
        >
            { dialogTrigger && dialogTrigger }

            <DialogOverlay />

            <DialogContent
                className={ twMerge(
                    // `absolute z-[1000] `,
                    // `w-full min-w-[50vw] max-w-[50vw] h-[80vh] min-h-[80vh] flex flex-col overflow-hidden p-4`,
                    // `overflow-auto`,
                    `w-full !min-w-[60vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 525 }px] max-h-modal flex flex-col`,
                    `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 `,

                ) }
            >
                <DialogHeader className={ `` }>
                    <DialogTitle className={ `` }>{ `${ title }` }</DialogTitle>
                    <DialogDescription className={ `` }>{ `${ description }` }</DialogDescription>
                </DialogHeader>
                <div className={ `flex flex-col gap-2` }>
                    { data && dataSchema && utils.val.isObject( dataSchema ) && (
                        <FormGenerator
                            debug={ debug }
                            refData={ allData }
                            refSchemas={ schemas }
                            refRoutes={ refRoutes }
                            data={ data }
                            setData={ setData }
                            schema={ dataSchema }
                            initialData={ initialData }
                            onChange={ ( key, value ) => {
                                if ( data && Object.keys( data ).includes( key ) ) { setData( { ...data, [ key ]: value } ); }
                            } }
                            onCancel={ () => handleCancel() }
                            onSubmit={ handleSubmit }
                            { ...{
                                ...( formOptions?.submitButton ? { submitButton: formOptions?.submitButton } : {} ),
                                ...( formOptions?.customFields ? { customFields: formOptions?.customFields } : {} ),
                                ...( formOptions?.showFormModel ? { showFormModel: formOptions?.showFormModel } : {} ),
                                ...( formOptions?.showFormData ? { showFormData: formOptions?.showFormData } : {} ),
                                ...( formOptions?.showFormSchema ? { showFormSchema: formOptions?.showFormSchema } : {} ),
                                ...( formOptions?.layout ? { layout: formOptions?.layout } : {} ),
                                ...( formOptions?.showData ? { showData: formOptions?.showData } : {} ),
                                ...( formOptions?.showOptional ? { showOptional: formOptions?.showOptional } : {} ),
                                ...( formOptions?.showAllFieldsByDefault ? { showAllFieldsByDefault: formOptions?.showAllFieldsByDefault } : {} ),
                                ...( formOptions?.initialDataAutofillRandom ? { initialDataAutofillRandom: formOptions?.initialDataAutofillRandom } : {} ),
                                ...( formOptions?.useMultiSelectForObjectIds ? { useMultiSelectForObjectIds: formOptions?.useMultiSelectForObjectIds } : {} ),
                                ...( formOptions?.useSlidersForNumbers ? { useSlidersForNumbers: formOptions?.useSlidersForNumbers } : {} ),
                                ...( formOptions?.useSwitchesForBoolean ? { useSwitchesForBoolean: formOptions?.useSwitchesForBoolean } : {} ),
                                ...( formOptions?.useBadgesForStringArrays ? { useBadgesForStringArrays: formOptions?.useBadgesForStringArrays } : {} ),
                                ...( formOptions?.useDateRangeForDateArrays ? { useDateRangeForDateArrays: formOptions?.useDateRangeForDateArrays } : {} ),
                                ...( formOptions?.useRadialForDecimals ? { useRadialForDecimals: formOptions?.useRadialForDecimals } : {} ),
                            } }
                            { ...formOptions }
                        />
                    ) }
                </div>
                <DialogFooter className='sm:justify-start'>
                    <DialogClose>
                        <Button
                            onClick={ () => {
                                console.log(
                                    "DataDialog",
                                    " :: ", "submit button",
                                    " :: ", "handleCancel",
                                    " :: ", "initialData = ", initialData,
                                    " :: ", "data = ", data,
                                );
                            } }>
                            { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( 'close' ) ] }
                            { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( 'close' ) ] }` }
                        </Button>
                    </DialogClose>
                </DialogFooter>
                <DialogFooter className='sm:justify-start'>
                    <DialogClose className={ `w-full justify-between rounded-xl shadow-3xl shadow-primary-100` } asChild>
                        <Button
                            variant={ `outline` }
                            onClick={ () => {
                                console.log(
                                    "DataDialog",
                                    " :: ", "handleSubmit Button",
                                    " :: ", "initialData = ", initialData,
                                    " :: ", "data = ", data,
                                );
                                handleSubmit( initialData );
                            } }>
                            { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                            { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                        </Button>
                    </DialogClose>
                    <Button
                        className={ `self-end rounded-xl shadow-3xl shadow-primary-100` }
                        variant={ `destructive` }
                        onClick={ () => {
                            console.log(
                                "DataDialog",
                                " :: ", "handleClose Button",
                                " :: ", "initialData = ", initialData,
                                " :: ", "data = ", data,
                            );
                            if ( handleClose ) handleClose();
                        } }>
                        <X />{ `Cancel` }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DataDialog;

/*  const { useReducer } = require( "react" );

    const CloseDialogExample = () => {
        const [ dialogState, dispatch ] = useReducer( dialogReducer, {
            isOpen: true,
            viewType: 'view',
            data: { title: 'Sample Document', description: 'Read-only mode' },
        } );

        const handleClose = () => {
            dispatch( { type: 'DIALOG_CLOSE' } );
        };

        return buildDialog(
            dialogState.data,
            () => { },
            { title: { type: 'string', required: true }, description: { type: 'string' } },
            dialogState.isOpen,
            () => handleClose(),
            () => { },
            () => { },
            () => handleClose(),
            'view',
            'view',
            'Document',
        );
    };


    const CreateDialogExample = () => {
        const [ dialogState, dispatch ] = useReducer( dialogReducer, {
            isOpen: false,
            viewType: 'none',
            data: null,
        } );

        const handleCreateNew = () => {
            handleDialogAction( {
                dispatch,
                type: 'DIALOG_CREATE',
                payload: { title: '', description: '', status: 'draft' },
            } );
        };

        const handleSubmitCreate = async ( data ) => {
            await handleCreateSubmit( {
                apiFunction: createDocument,
                data,
                successCallback: ( newDoc ) => {
                    console.log( 'Created:', newDoc );
                    dispatch( { type: 'DIALOG_CLOSE' } );
                },
                errorCallback: ( err ) => console.error( 'Error creating document:', err ),
            } );
        };

        return buildDialog(
            dialogState.data,
            ( data ) => handleChange( { data, setData: ( newData ) => dispatch( { type: 'DIALOG_CREATE', payload: newData } ), name: 'title', value: data.title } ),
            {
                title: { type: 'string', required: true },
                description: { type: 'string', required: false },
            },
            dialogState.isOpen,
            ( open ) => dispatch( { type: open ? 'DIALOG_CREATE' : 'DIALOG_CLOSE' } ),
            handleSubmitCreate,
            handleChange,
            () => dispatch( { type: 'DIALOG_CLOSE' } ),
            'add',
            'add',
            'Document',
        );
    };


    const DeleteDialogExample = ( { document } ) => {
        const [ dialogState, dispatch ] = useReducer( dialogReducer, {
            isOpen: false,
            viewType: 'none',
            data: null,
        } );

        const handleDeleteStart = () => {
            handleDialogAction( {
                dispatch,
                type: 'DIALOG_DELETE',
                payload: document,
            } );
        };

        const handleSubmitDelete = async () => {
            await handleDeleteSubmit( {
                apiFunction: deleteDocument,
                id: document._id,
                successCallback: () => {
                    console.log( 'Deleted:', document._id );
                    dispatch( { type: 'DIALOG_CLOSE' } );
                },
                errorCallback: ( err ) => console.error( 'Error deleting document:', err ),
            } );
        };

        return buildDialog(
            dialogState.data,
            () => { },
            { confirmation: { type: 'boolean', required: true } },
            dialogState.isOpen,
            ( open ) => dispatch( { type: open ? 'DIALOG_DELETE' : 'DIALOG_CLOSE' } ),
            handleSubmitDelete,
            () => { },
            () => dispatch( { type: 'DIALOG_CLOSE' } ),
            'delete',
            'delete',
            'Document',
        );
    };
*/


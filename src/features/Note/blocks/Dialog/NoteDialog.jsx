
import React, { useEffect, useMemo, useState } from 'react';
import { DIALOG_TYPES } from '@/lib/config/config';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import useNotes from '@/lib/hooks/useNotes';
import useNotesStore from '@/store/note.store';
import { useFormDialog } from '@/lib/providers/FormDialogContext';
import FormGenerator from '@/components/Form/FormGenerator';

// const NoteDialog = ( props ) => {
//     const {
//         dataSchema,
//         dialogOpen = false,
//         setDialogOpen = () => { },
//         data,
//         setData = () => { },
//         initialData,
//         handleClose = () => { },
//         handleSubmit = () => { },
//         handleChange = () => { },
//         dialogType = 'add',
//         dialogDataType = 'file',
//         dialogTrigger,
//     } = props;

//     const { getSchema } = useGlobalStore();
//     const { openDialog } = useFormDialog();

//     // Open dialog when dialogOpen prop changes to true
//     useEffect( () => {
//         if ( dialogOpen ) {
//             openDialog( {
//                 type: dialogType,
//                 dataType: dialogDataType,
//                 data: data,
//                 schema: dataSchema || getSchema( dialogDataType ),
//                 initialValues: initialData,
//                 onSubmitFn: ( data ) => {
//                     handleSubmit( data );
//                     setDialogOpen( false );
//                 },
//                 onChangeFn: handleChange,
//                 onCloseFn: () => {
//                     handleClose();
//                     setDialogOpen( false );
//                 }
//             } );
//         }
//     }, [ dialogOpen ] ); // Only depend on dialogOpen to prevent loops

//     return <>{ dialogTrigger }</>;
// };

// export default NoteDialog;



const NoteDialog = ( props ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 
    const {
        refData = {},
        dataSchema,
        dialogOpen = true,
        setDialogOpen = () => { },
        data,
        setData = () => { },
        initialData,
        handleClose = () => { },
        handleSubmit = () => { },
        handleChange = () => { },
        dialogType = 'add',
        dialogDataType = 'file',
        dialogTrigger,
    } = props;

    const {
        // Debug state
        debug,
        setDebug,
        // Fetch requests state
        getSchema,
        getData,
    } = useGlobalStore();

    // React data-fetch hooks.
    const {
        // VARIABLES
        fileSchema,
        folderSchema,
        handleBuildNoteDialog,
        handleGetSchemas,
        getSchemaForDataType,
        buildDialog,
        // handleChange,
    } = useNotes();

    const {
        // FUNCTIONS
        createDialog,
        // prepareDialogConfig,
        // applyDialogConfig,
    } = useFormDialog();

    const constructDialog = () => {
        return (
            dialogType && utils.val.isString( dialogType )
            && DIALOG_TYPES.includes( dialogType.toString().toLowerCase() )
            && ( <div className="content-body mx-auto h-auto w-full justify-center items-center">
                { ( dialogOpen ) && data && buildDialog( {
                    data: data,
                    setData: setData,
                    initialData: initialData,
                    refData: getData(),
                    dialogOpen: dialogOpen,
                    setDialogOpen: setDialogOpen,
                    dataSchema: dataSchema ?? getSchema( dialogDataType ),
                    dialogTrigger: dialogTrigger,
                    handleSubmit: handleSubmit,
                    handleChange: handleChange,
                    handleClose: handleClose,
                    dataType: dialogDataType,
                    dialogType: dialogType,
                    debug: debug,
                } ) }
            </div> )
        );
    };

    return ( <>{ constructDialog() }</> );
};


export default NoteDialog;




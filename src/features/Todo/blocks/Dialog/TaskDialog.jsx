import React, { useCallback, useEffect, useState } from 'react';
import useTask from '@/lib/hooks/useTask';
import * as utils from 'akashatools';
import { DIALOG_TYPES } from '@/lib/config/config';
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';
import { CLOSE_KEYBOARD_SHORTCUT } from '@/lib/config/constants';

const TaskDialog = ( props ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 
    const {
        data,
        setData = () => { },
        dataSchema,
        initialData,
        dialogType,
        dataType = 'task',
        dialogOpen,
        setDialogOpen = () => { },
        handleClose = () => { },
        handleSubmit = () => { },
        handleUpdate = () => { },
        handleChange = () => { },
        dialogTrigger,
        debug,
    } = props;

    const {
        getData, reloadData,
        schemas, getSchema, fetchSchemas,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();


    const {
        buildDialog,
    } = useTask();


    console.log( "TaskDialog rendering :: props = ", props );

    // Helper to close the dialog.
    const close = useCallback( () => {
        // handleClose();
    }, [ dialogOpen, setDialogOpen, handleClose ] );

    // Adds a keyboard shortcut to toggle the dialog.
    useEffect( () => {
        const handleKeyDown = ( e ) => {
            if ( e.key === CLOSE_KEYBOARD_SHORTCUT && ( e?.metaKey || e?.ctrlKey ) ) {
                e.preventDefault();
                close();
            }
        };

        window.addEventListener( "keydown", handleKeyDown );
        return () => window.removeEventListener( "keydown", handleKeyDown );
    }, [ close ] );

    const constructDialog = () => {
        console.log( "TaskDialog :: constructDialog :: getData() = ", getData() );
        return (
            dialogType && utils.val.isString( dialogType ) &&
            DIALOG_TYPES.includes( dialogType.toString().toLowerCase() ) &&
            ( <div className={ `content-body mx-auto h-auto w-full justify-center items-center` }>
                { ( dialogOpen ) && data && (
                    buildDialog( {
                        data: data,
                        refData: getData() ?? refData,
                        setData: setData,
                        initialData: initialData,
                        dataSchema: dataSchema ?? getSchema( dataType ?? 'task' ),
                        dialogOpen: ( !!dialogOpen === true || !!dialogOpen === true ),
                        setDialogOpen: setDialogOpen,
                        handleSubmit: handleSubmit,
                        handleChange: handleChange,
                        handleUpdate: handleUpdate,
                        handleClose: handleClose,
                        dialogType: dialogType ?? 'add',
                        dataType: dataType ?? 'task',
                        debug: debug,
                        dialogTrigger,
                    } ) ) }
            </div> )
        );
    };

    return ( <div className={ `h-full w-full flow-root flex flex-col justify-start items-stretch gap-4 relative overflow-hidden` }>
        { constructDialog() }
    </div> );
};

const TaskDialogContainer = ( props ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 
    const {
        debug = false,
        dialogTrigger,
        dataSchema,
        dialogOpen = false, setDialogOpen = () => { },
        data = {}, setData = () => { },
        handleClose = () => { },
        handleSubmit = () => { },
        handleChange = () => { },
        dialogType = 'add',
        dataType = 'task',
    } = props;

    const { buildTaskDialog } = useTask();
    console.log( "TaskDialogContainer rendering :: props = ", props );

    return (
        <>
            {/* <div className="content-body h-full w-full justify-center items-center overflow-hidden p-0 m-0 gap-0"> */ }
            { dialogOpen && (
                buildDialog( {
                    data,
                    setData, // For onchange
                    refData: getData() ?? refData,
                    dataSchema,
                    dialogOpen,
                    setDialogOpen,
                    handleSubmit,
                    handleChange,
                    handleClose,
                    dialogType,
                    dataType, // Name of type of data being represented.
                    dialogTrigger,
                    debug,
                } )
            ) }
            {/* </div> */ }
        </>
    );
};

TaskDialog.Container = TaskDialogContainer;

export default TaskDialog;

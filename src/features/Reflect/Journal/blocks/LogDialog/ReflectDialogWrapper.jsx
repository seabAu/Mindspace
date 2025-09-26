import React from 'react';
import usePlanner from '@/lib/hooks/usePlanner';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import ReflectDialog from './ReflectDialog';
import useReflect from '@/lib/hooks/useReflect';

const ReflectDialogWrapper = () => {
    const {
        // DIALOG MENUS
        selected, setSelected,
        dialogType, setDialogType,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogData, setDialogData,
        dialogInitialData, setDialogInitialData,
        gotoDate, setGotoDate,
        showGotoDialog, setShowGotoDialog,
        open, setOpen,
        simplifiedForm, setSimplifiedForm,
        handleGetSchemas,
        getSchemaForDataType,
        buildDialog,

        handleChange,
        handleCancel,
        handleCreateStart,
        handleCreateSubmit,

        handleEditStart,
        handleEditSubmit,
    } = useReflect();

    const {
        // Debug state
        debug,
        setDebug,
        // Fetch requests state
        getSchema,
        getData,
    } = useGlobalStore();

    // console.log( 
    //     "PlannerDialogWrapper :: Required values: ",
    //     "\n :: ", "dialogData = ", dialogData,
    //     "\n :: ", "setDialogData = ", setDialogData,
    //     "\n :: ", "dialogInitialData = ", dialogInitialData,
    //     "\n :: ", "dialogDataSchema = ", dialogDataSchema,
    //     "\n :: ", "dialogType = ", dialogType,
    //     "\n :: ", "handleChange = ", handleChange,
    //     "\n :: ", "handleCancel = ", handleCancel,
    // );

    return (
        <>
            { dialogType === 'add' && dialogDataType !== 'none' && (
                <ReflectDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    // refData={ allData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogDataSchema ?? getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, dialogDataType ?? 'event' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) }

            {/* Edit Dialog */ }
            { dialogType === 'edit' && dialogDataType !== 'none' && (
                <ReflectDialog
                    data={ dialogData }
                    // refData={ allData }
                    setData={ setDialogData } // { setSelectedEvent }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogDataSchema ?? getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, dialogDataType ?? 'event' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) }

            {/* Open Dialog */ }
            { open === true && dialogDataType !== 'none' && (
                <ReflectDialog
                    data={ dialogData ?? selected }
                    // refData={ allData }
                    setData={ setDialogData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogDataSchema ?? getSchema( dialogDataType ) }
                    dialogOpen={ dialogType === 'view' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'view' ) }
                    // handleSubmit={ handleCancel }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'view' }
                    dataType={ dialogDataType }
                    debug={ debug }
                />
            ) }

        </>
    );
};

export default ReflectDialogWrapper;

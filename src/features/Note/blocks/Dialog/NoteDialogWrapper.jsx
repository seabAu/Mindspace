
import React, { useEffect, useState } from 'react';
import { DIALOG_TYPES } from '@/lib/config/config';
import usePlannerStore from '@/store/planner.store';
import useGlobalStore from '@/store/global.store';
import usePlanner from '@/lib/hooks/usePlanner';
import * as utils from 'akashatools';
import useNotes from '@/lib/hooks/useNotes';
import useNotesStore from '@/store/note.store';
import NoteDialog from './NoteDialog';


const NoteDialogWrapper = ( props ) => {
    const {
        dialogProps,
    } = props;

    const {
        // Debug state
        debug, setDebug,
        // Fetch requests state
        getData,
        schemas, getSchema,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        notesData,
        recentNotesData,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();

    // React data-fetch hooks.
    const {
        handleNodeCreate,
        handleNodeUpdate,
        handleChange,
        handleCancel,

        // GETTERS / SETTERS
        dialogData, setDialogData,
        dialogSchema, setDialogSchema,
        dialogType, setDialogType,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
    } = useNotes();

    return (
        <>

            { dialogType === 'add' && dialogDataType === 'file' && (
                // Create File Dialog
                <NoteDialog
                    data={ dialogData }
                    setData={ setDialogData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogSchema ?? getSchema( 'note' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleNodeCreate( data, 'file' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dialogDataType={ dialogDataType ?? 'file' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'edit' && dialogDataType === 'file' && (
                // Edit File Dialog
                <NoteDialog
                    data={ dialogData }
                    setData={ setDialogData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogSchema ?? getSchema( 'note' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleNodeUpdate( data, 'file' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dialogDataType={ dialogDataType ?? 'file' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'add' && dialogDataType === 'folder' && (
                // Create Folder Dialog
                <NoteDialog
                    data={ dialogData }
                    setData={ setDialogData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogSchema ?? getSchema( 'note' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleNodeCreate( data, 'folder' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'add' }
                    dialogDataType={ dialogDataType ?? 'folder' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'edit' && dialogDataType === 'folder' && (
                // Edit Folder Dialog
                <NoteDialog
                    data={ dialogData }
                    setData={ setDialogData }
                    initialData={ dialogInitialData }
                    setInitialData={ setDialogInitialData }
                    dataSchema={ dialogSchema ?? getSchema( 'note' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleNodeUpdate( data, 'folder' ); } }
                    handleChange={ handleChange }
                    handleClose={ handleCancel }
                    dialogType={ dialogType ?? 'edit' }
                    dialogDataType={ dialogDataType ?? 'folder' }
                    debug={ debug }
                />
            ) }
        </>
    );
};

export default NoteDialogWrapper;

import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import useNotes from '@/lib/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, FilePlus, FolderPlus, RefreshCcw, RefreshCwIcon, Save, Trash } from 'lucide-react';
import Content from '@/components/Page/Content';
import useNotesStore from '@/store/note.store';
import ExplorerBreadcrumbs from './ExplorerBreadcrumbs';
import useGlobalStore from '@/store/global.store';
import { ROUTES_NOTE_PAGE, ROUTES_NOTES } from '@/lib/config/constants';
import { Separator } from '@/components/ui/separator';
import NoteDialogWrapper from '../../Dialog/NoteDialogWrapper';

const ExplorerNavHeader = ( props ) => {
    const {
        useNav = true,
        useButtons = true,
        useBreadcrumbs = true,
        useRefresh = true,
        view, setView,
        children,
    } = props;

    const workspaceId = useGlobalStore( ( state ) => state.workspaceId );
    const user = useGlobalStore( ( state ) => state.user );
    const schemas = useGlobalStore( ( state ) => state.schemas );

    const {
        notesActiveFile,
        notesActiveFolder,
        notesDirectoryPath,
        notesDirectoryTree,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();

    const {
        // VARIABLES
        fileSchema,
        folderSchema,
        buildDialog,
        handleBuildNoteDialog,
        handleGetSchemas,
        getSchemaForDataType,
        handleGetFolders,
        handleGetFiles,

        // HANDLER FUNCTIONS
        handleSort,
        handleChange,
        handleCancel,
        handleSaveFile,
        handleGoBack,
        handleCreateNote,
        handleOpenFile,
        handleOpenFolder,
        handleOpenFolderContents,
        handleGetFolderContents,
        handleCreateFile,
        handleCreateFolder,
        handleEditFile,
        handleEditFolder,
        handleEditFolderStart,
        handleEditFileStart,
        handleCreateFolderStart,
        handleCreateFileStart,
        handleEditFolderSubmit,
        handleCreateFolderSubmit,
        handleEditFileSubmit,
        handleCreateFileSubmit,
        handleEditCancel,
        handleCreateCancel,
        handleDeleteFile,
        handleDeleteFolder,
        handleInputChange,
        handleFetchNotesDirectoryTree,
        handleFetchRecentNotes,
        handleChangeNode,
        handleChangeActiveFile,
        handleChangeActiveFolder,

        // Extra notes logic
        fetchRecentNotesOnWorkspaceChange,
        updateFolderContents,
        updateFileContents,
        fetchTreeOnRequest,
        handleChangesToDirectoryPath,

        // GETTERS / SETTERS
        dialogDataType, setDialogDataType,
        dialogSchema, setDialogSchema,
        dialogData, setDialogData,
        dialogInitialData, setDialogInitialData,
        modalType, setModalType,
        topFolder, setTopFolder,
        enableSave, setEnableSave,
        isCreatingFolder, setIsCreatingFolder,
        isEditingFolder, setIsEditingFolder,
        folderData, setFolderData,
        isCreatingFile, setIsCreatingFile,
        isEditingFile, setIsEditingFile,
        fileData, setFileData,
        folderInlineRename, setFolderInlineRename,
        // view, setView, handleSetView, handleGetView,
    } = useNotes();

    const buttonClassNames = `savebtn rounded-md px-2 py-1 rounded-lg items-center justify-center outline-none focus-within:outline-none focus-visible:outline-none focus:outline-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`;

    const buildEditorTopButtons = useCallback(
        () => {
            return (
                <div className={ `flex flex-row items-center justify-between w-full min-w-full max-w-full  px-4` }>
                    { useButtons === true && (
                        <div className={ `flex flex-row items-start justify-between` }>
                            <Button
                                key={ `notes-page-header-controls-btn-${ 'back' }` }
                                className={ buttonClassNames }
                                size='xs'
                                variant={ `ghost` }
                                onClick={ () => {
                                    handleGoBack();
                                } }
                            >
                                <ArrowBigLeft className={ `p-0 m-0` } />
                            </Button>

                            <Button
                                key={ `notes-page-header-controls-btn-${ 'newfile' }` }
                                className={ buttonClassNames }
                                size='xs'
                                variant={ `ghost` }
                                onClick={ () => {
                                    console.log( "DirectoryTree :: Folder :: New File Btn clicked. Creating a new file under the folder with id = ", notesActiveFolder );
                                    // handleCreateFile( element );
                                    handleCreateFileStart( notesActiveFolder?.parentId );
                                } }
                            >
                                <FilePlus className={ `p-0 m-0` } />
                            </Button>

                            <Button
                                key={ `notes-page-header-controls-btn-${ 'newfolder' }` }
                                className={ buttonClassNames }
                                size='xs'
                                variant={ `ghost` }
                                // className={ `p-0 right-0 absolute` }
                                onClick={ () => {
                                    // 
                                    console.log( "DirectoryTree :: Folder :: Create New Folder Btn clicked." );
                                    handleCreateFolderStart( notesActiveFolder?.parentId );
                                } }
                            >
                                <FolderPlus className={ `p-0 m-0` } />
                            </Button>

                            <Button
                                key={ `notes-page-header-controls-btn-${ 'savefile' }` }
                                className={ buttonClassNames }
                                size='xs'
                                variant={ `ghost` }
                                onClick={ () => {
                                    handleSaveFile( notesActiveFile );
                                } }
                            >
                                <Save className={ `p-0 m-0` } />
                            </Button>

                            <Button
                                key={ `notes-page-header-controls-btn-${ 'deletefile' }` }
                                className={ buttonClassNames }
                                size='xs'
                                variant={ `ghost` }
                                onClick={ () => {
                                    handleDeleteFile( notesActiveFile?._id );
                                } }
                            >
                                <Trash className={ `p-0 m-0` } />
                            </Button>
                        </div>
                    ) }

                    { useBreadcrumbs === true /* && utils.val.isValidArray( notesDirectoryPath, true ) */ && (
                        <ExplorerBreadcrumbs
                            title={ "Currently open note's title goes here." }
                            path={ notesDirectoryPath }
                            tree={ notesDirectoryTree } />
                    ) }

                    { useRefresh === true && utils.val.isValidArray( notesDirectoryTree, true ) && (
                        <>
                            <Button
                                variant={ 'outline' }
                                size={ 'xs' }
                                // className={ `!h-9 rounded-xl border border-[${ 0.125 }rem] border-dashed` }
                                className={ `px-4 py-2 m-0 ${ buttonClassNames }` }
                                onClick={
                                    () => {
                                        setLoadingNotes( true );
                                        handleFetchRecentNotes( workspaceId );
                                        handleFetchNotesDirectoryTree( workspaceId );
                                        setLoadingNotes( false );
                                    }
                                }
                            >
                                <RefreshCcw className={ `p-0 m-0 size-6 hover:animate-rotate transition-all` } />
                            </Button>
                        </>
                    ) }
                </div>
            );
        }
        , [ notesActiveFile, notesActiveFolder, notesDirectoryPath ] );

    return (
        <Content.Header className={ `rounded-xl flex !flex-row justify-start items-center w-full` }>
            <div className={ `flex flex-col w-full h-min justify-stretch items-stretch` }>
                { useNav === true && ( <div className={ `flex flex-row w-full h-9 justify-center items-center` }>
                    { ROUTES_NOTES.map( ( btn, index ) => {
                        return (
                            <Button
                                key={ `notes-page-views-btn-${ btn }-${ index }` }
                                className={ `focus:outline-none px-6 py-1` }
                                variant={ `${ view === btn ? 'default' : 'ghost' }` }
                                size={ `xs` }
                                onClick={ () => {
                                    handleSetView( btn );
                                } }
                            >
                                { utils.str.toCapitalCase( btn ) }
                            </Button>
                        );
                    } ) }
                </div> ) }
                <Separator />
                { ( buildEditorTopButtons( useButtons, useBreadcrumbs, useRefresh ) ) }
            </div>
        </Content.Header>
    );
};

export default ExplorerNavHeader;
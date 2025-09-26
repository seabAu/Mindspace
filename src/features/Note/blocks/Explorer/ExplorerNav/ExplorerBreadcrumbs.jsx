import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { findNodeByAbsolutePath } from '@/lib/utilities/note';
import useNotes from '@/lib/hooks/useNotes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilesIcon, Folders, FoldersIcon } from 'lucide-react';
import EditorBreadcrumbs from '../EditorBreadcrumbs';
import useNotesStore from '@/store/note.store';

const ExplorerBreadcrumbs = ( props ) => {
    const {
        title,
        path, setPath,
        tree, setTree,
        children,
    } = props;

    const {
        notesActiveFile,
        notesActiveFolder,
        notesDirectoryPath,
        notesDirectoryTree,
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
        view, setView,
    } = useNotes();

    const buildDirectoryBreadcrumbs =
        useCallback(
            ( path ) => {
                let relativePath = [];
                let elements = [];
                // console.log( "useNotes", " :: ", "buildDirectoryBreadcrumbs", " :: ", "path = ", path, " :: ", "tree = ", tree, " :: ", "path = ", path, " :: ", "notesData = ", notesData );
                if ( utils.val.isValidArray( path, true ) ) {
                    path.forEach( ( p, index ) => {
                        let id = p?._id;
                        let title = p?.title;
                        let type = p?.type;
                        relativePath.push( id );
                        let node = findNodeByAbsolutePath(
                            tree,
                            relativePath
                        );
                        // console.log( "useNotes", " :: ", "buildDirectoryBreadcrumbs", " :: ", "path = ", path, " :: ", "relativePath = ", relativePath, " :: ", "node = ", node, " :: ", "tree = ", tree );
                        if ( node && utils.ao.hasAll( node, [ '_id', 'title' ] ) ) {
                            // Detect type of node.
                            let isFolder = ( node.hasOwnProperty( 'folderContents' ) | node.hasOwnProperty( 'fileContents' ) );

                            // Case: Breadcrumb for top level of directory: 
                            if ( node?.parentId === null ) {
                                // Top folder.
                                elements.push(
                                    <div
                                        key={ `notes-page-directory-breadcrumbs-${ index }-${ id }` }
                                        className={ `path-breadcrumbs-homenode` }
                                    >
                                        <div
                                            className={ `path-breadcrumbs-item text-brand-washedBlue hover:text-quaternaryHighlight focus:outline-none focus-within:outline-none focus-visible:outline-none cursor-pointer` }
                                            onClick={
                                                () => {
                                                    // Send to top of directory ( _id === null )
                                                    // setView( 'explorer' );
                                                    handleChangeNode( node );
                                                }
                                            }
                                        >
                                            { `🧠` }
                                        </div>
                                    </div>
                                );
                            }

                            // Title
                            // Will have a tooltip with hover-over-copy on the ID
                            elements.push(
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className={ `path-breadcrumbs-item text-brand-washedBlue hover:text-quaternaryHighlight focus:outline-none focus-within:outline-none focus-visible:outline-none cursor-pointer flex flex-row flex-nowrap gap-2` }
                                                onClick={ () => { handleChangeNode( node ); } }
                                            >
                                                { isFolder
                                                    ? ( <FoldersIcon className={ `size-6 max-h-min self-center` } /> )
                                                    : ( <FilesIcon className={ `size-6 max-h-min self-center` } /> )
                                                }
                                                { node?.title }
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <button
                                                onClick={ () => { navigator.clipboard.writeText( node?._id ); } }
                                            >
                                                <p className={ `path-breadcrumbs-node-id` }>
                                                    { node?._id }
                                                </p>
                                            </button>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        }
                    } );
                }

                return (
                    <div className={ `path-breadcrumbs-container !w-full h-auto flex flex-row text-nowrap whitespace-nowrap !flex-nowrap items-center justify-center gap-2 rounded-[${ 0.25 }rem]` }>
                        <EditorBreadcrumbs.Responsive
                            className={ `` }
                            elements={ elements }
                        />
                    </div>
                );
            }
            , [ path, tree ] );

    return (
        <>
            { ( buildDirectoryBreadcrumbs( notesDirectoryPath ) ) }
        </>
    );
};

export default ExplorerBreadcrumbs;
import React, { useContext, createContext, useEffect, useState, useCallback } from 'react';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import useNotes from '@/lib/hooks/useNotes';
import * as utils from 'akashatools';
import { deepMirrorNodes, deepUpdateNode, findAbsolutePath, findNodeByAbsolutePath } from '@/lib/utilities/note';
import { AiOutlineFile, AiOutlineFolderOpen } from 'react-icons/ai';
import useNotesStore from '@/store/note.store';
import useGlobalStore from '@/store/global.store';
import { FileContextMenu, FolderContextMenu } from '@/features/Note/blocks/Explorer/ExplorerContextMenu';
import { twMerge } from 'tailwind-merge';

const ExplorerView = ( props ) => {
    const {
        notes, setNotes,
        classNames,
        gridClassNames,
        nodeClassNames,
        layout,
    } = props;

    // Used for figuring out at what level are we viewing the explorer window. 
    // Ideally works just like windows explorer. :D

    const {
        debug, setDebug,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchTree, setRequestFetchTree,
        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        notesRecentFiles, setNotesRecentFiles,
        notesActiveFile, setNotesActiveFile,
        notesActiveFolder, setNotesActiveFolder,
        notesActiveFolderContents, setNotesActiveFolderContents,
        notesDirectoryTree, setNotesDirectoryTree,
        notesDirectoryPath, setNotesDirectoryPath,
        fetchNotesDirectoryTree, setNotesDirectoryPathBack,
        findObjectByPath,
        findPathById,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();

    // React data-fetch hooks.
    const {
        // VARIABLES
        fileSchema,
        folderSchema,
        handleBuildNoteDialog,

        // HANDLER FUNCTIONS
        handleSaveFile,
        handleGoBack,
        handleCreateNote,
        handleOpenFile,
        handleOpenFolder,
        handleOpenFolderContents,
        handleCreateFile,
        handleCreateFolder,
        handleEditFile,
        handleEditFolder,
        handleEditFolderStart,
        handleEditFileStart,
        handleCreateFolderStart,
        handleCreateFileStart,
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
        enableSave, setEnableSave,
        folderData, setFolderData,
        fileData, setFileData,
        folderInlineRename, setFolderInlineRename,
    } = useNotes();

    const [ topFolder, setTopFolder ] = useState( null );
    const [ explorerView, setExplorerView ] = useState( 'default' );
    const [ selectedNode, setSelectedNode ] = useState( null );
    const explorerViewTypes = [
        'icons-xl',
        'icons-lg',
        'icons-md',
        'icons-sm',
        'tiles',
        'list',
        'content',
        'details',
    ];

    const setExplorer = ( view ) => {
        // Sets the layout type for the explorer.
        if ( view && explorerViewTypes.includes( view ) ) { setExplorerView( view ); }
    };

    useEffect( () => {
        console.log( "NotesPage.jsx :: Explorer :: Active Folder changed :: notesActiveFolder = ", notesActiveFolder );
    }, [ notesActiveFolder ] );

    const [ iconSize, setIconSize ] = useState( 12 );
    const explorerItemStyles = {
        height: `${ iconSize / 4 }rem`,
        width: `${ iconSize / 4 }rem`,
        padding: `0.125rem`,
    };

    const gridStyles = {
        // display: `grid`,
        // gridGap: `0.25rem`,
        // gridAutoRows: `auto`,
        // height: `100%`,
        // gridTemplateColumns: `repeat(12, minmax(1fr, 1fr))`,
        // display: `grid`,
        gridGap: `0.025rem`,
        gap: `0.025rem`,
        // gridAutoColumns: `2.5rem`,
        grid: `2rem`,
        gridAuto: `2rem 2rem`,
        // gridTemplateColumns: `span 1 / span 1`,
        gridTemplate: `repeat(12, minmax(auto, 1fr))`,
        // gridTemplateRows: `repeat(12, minmax(0, 1fr))`,
    };

    const gridItemRowStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridTemplateColumns: `span 1 / span 1`,
        gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
    };

    const buildExplorerItems = ( contents ) => {
        let elements = [];
        // console.log( "NotesPage.jsx :: Explorer :: buildExplorerItems :: contents = ", contents );

        if ( utils.val.isValidArray( contents, true ) ) {
            contents.forEach( ( item, index ) => {
                let isFolder = (
                    item?.hasOwnProperty( 'folderContents' )
                    |
                    item?.hasOwnProperty( 'fileContents' )
                );

                // console.log( "Notes Explorer :: item = ", item, " :: ", "a ", `${ isFolder ? 'FOLDER' : 'FILE' }` );
                let node = (
                    <div
                        // className={ `note-container flex flex-col flex-nowrap justify-center items-center w-24 text-center flex-shrink cursor-pointer hover:bg-header py-2 rounded-xl transition-shadow shadow-Neutrals/neutrals-10 hover:shadow-lg select-none` }
                        className={ twMerge(
                            `note-container flex flex-col flex-nowrap justify-center items-center w-20 text-center flex-shrink cursor-pointer hover:bg-header py-2 rounded-xl transition-shadow shadow-Neutrals/neutrals-10 hover:shadow-lg select-none`,
                            ( selectedNode && selectedNode.hasOwnProperty( '_id' ) && item?._id === selectedNode?._id )
                                ? `border-white/60`
                                : `border-transparent`
                            ,
                            nodeClassNames,
                        ) }
                        key={ `note-explorer-item-${ index }` }
                        /* onClick={ () => {
                            if ( isFolder ) {
                                // handleChangeNode( item );
                                // handleOpenFolder( item );
                                handleChangeActiveFolder( item );
                            }
                            else {
                                // handleChangeNode( item );
                                // handleOpenFile( item );
                                handleChangeActiveFile( item );
                            }
                        } } */
                        onClick={ () => ( setSelectedNode( item ) ) }
                        onDoubleClick={
                            () => (
                                isFolder
                                    ? handleChangeActiveFolder( item )
                                    : handleChangeActiveFile( item )
                            ) }
                    >
                        <div className={ `note-icon justify-between items-stretch` }>
                            { isFolder
                                ? ( <AiOutlineFolderOpen style={ explorerItemStyles } /> )
                                : ( <AiOutlineFile style={ explorerItemStyles } /> ) }
                        </div>
                        <div className={ `note-header` }>
                            <div className={ `note-title text-wrap break-all max-w-full text-ellipsis` }>
                                { item?.title }
                            </div>
                        </div>
                        <div className={ `note-content` }>
                            {/* <div className={ `note-desc` }>
                            { item?.description }
                        </div> */}
                        </div>
                        <div className={ `note-footer` }>
                        </div>
                    </div>
                );

                if ( isFolder ) {
                    elements.push(
                        <FolderContextMenu
                            data={ item }
                            setActiveFolder={ handleChangeActiveFolder }
                            handleCreateFolderStart={ handleCreateFolderStart }
                            handleEditFolderStart={ handleEditFolderStart }
                            handleCreateFileStart={ handleCreateFileStart }
                            handleDeleteFolder={ handleDeleteFolder }
                            className={ `` }
                        >
                            { node }
                        </FolderContextMenu>
                    );
                }
                else {
                    elements.push(
                        <FileContextMenu
                            data={ item }
                            setActiveFile={ handleChangeActiveFile }
                            handleEditFileStart={ handleEditFileStart }
                            handleDeleteFile={ handleDeleteFile }
                            className={ `` }
                        >
                            { node }
                        </FileContextMenu>
                    );
                }
            } );
        }

        return (
            <div
                className={ twMerge(
                    `notes-explorer-container mx-auto my-auto h-full w-full flex-wrap flex-grow max-w-full flex justify-start items-start bg-muted/50 rounded-xl `,
                    // `grid grid-cols-12 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-4 2xl:grid-cols-6 gap-2`,
                    gridClassNames
                ) }
                style={ gridStyles }
            >
                { elements }
            </div>
        );
    };

    return (
        <div
            // className={ `notes-page-explorer-container grid-flow-row-dense w-full h-full min-w-full min-h-full flex flex-grow justify-stretch items-start` }
            className={ twMerge(
                `notes-page-explorer-container`,
                `flex w-full min-w-full justify-start items-start flex-row p-2`,
                // `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6`,
                classNames
            ) }
        >
            { notesActiveFolder
                && notesActiveFolderContents
                && utils.val.isValidArray( notesActiveFolderContents, true )
                && ( buildExplorerItems( notesActiveFolderContents ) ) }
        </div>
    );
};

export default ExplorerView;

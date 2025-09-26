import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import { v4 as uuid } from "uuid";

import notesService, {
    getNotes,
    getDirectoryTree,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    getRecentNotes,
    searchNotes,
    getFiles,
    getFolders,
    createFile,
    createFolder,
    updateFile,
    updateFolder,
    deleteFile,
    deleteFolder,
    getFile,
    getFolder,
    getRecentFiles,
    fetchDirectoryTree,
    fetchTree,
} from './../services/notesService.js';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Delete, Edit, FileQuestion, FolderOpen, Plus, ArrowBigLeft, File, FilePlus, Files, Folder, FolderPlus, Folders, Save, Trash, RefreshCwIcon } from 'lucide-react';
import * as utils from 'akashatools';
import { deepMirrorNodes, deepUpdateNode, findAbsolutePath, findNodeByAbsolutePath, getPathIds } from '@/lib/utilities/note.js';
import { twMerge } from 'tailwind-merge';
import useTasksStore from '@/store/task.store.js';
import useNotesStore from '@/store/note.store.js';
import useGlobalStore from '@/store/global.store.js';
import useError from './useError.js';
import { DIALOG_TYPE_DESCRIPTIONS, DIALOG_TYPE_ICONS, DIALOG_TYPE_NAMES, DIALOG_TYPES } from '../config/config.js';
import FormGenerator from '@/components/Form/FormGenerator.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import EditorBreadcrumbs from '@/features/Note/blocks/Explorer/EditorBreadcrumbs.jsx';
import { validateSubmittedData } from '../utilities/input.js';
import { ROUTES_NOTE_PAGE } from '../config/constants.js';
import { useFormDialog } from '../providers/FormDialogContext.jsx';
// import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import { arrSafeTernary } from '../utilities/data.js';
import { buildDirectoryTree } from '@/features/Note/lib/utilities/buildDirectoryTree.js';


const buildPathFromArray = ( pathArray ) => {
    return Array.isArray( pathArray ) ? pathArray : [];
};

const getParentPath = ( path ) => {
    return Array.isArray( path ) && path.length > 1 ? path.slice( 0, -1 ) : [];
};

const findItemByPath = ( items, targetPath ) => {
    if ( !Array.isArray( items ) || !Array.isArray( targetPath ) ) return null;
    return items.find(
        ( item ) =>
            Array.isArray( item.path ) &&
            item.path.length === targetPath.length &&
            item.path.every( ( segment, index ) => segment === targetPath[ index ] ),
    );
};

const findItemsByParentPath = ( items, parentPath ) => {
    if ( !Array.isArray( items ) ) return [];
    const parentPathLength = Array.isArray( parentPath ) ? parentPath.length : 0;

    return items.filter( ( item ) => {
        if ( !Array.isArray( item.path ) || item.path.length !== parentPathLength + 1 ) return false;

        // Check if this item's path starts with the parent path
        for ( let i = 0; i < parentPathLength; i++ ) {
            if ( item.path[ i ] !== parentPath[ i ] ) return false;
        }
        return true;
    } );
};

const useNotes = ( useSuccessToast = false ) => {
    const {
        debug,
        schemas,
        getSchema,
        data, setData,
        getData,
        user,
        workspaceId,
    } = useGlobalStore();

    const {
        // Data for the active file.
        getNoteById,
        createNote: createNoteState,
        addNote: addNoteState,
        updateNote: updateNoteState,
        deleteNote: deleteNoteState,
        cloneNote: cloneNoteState,
        getNotesByTag: getNotesByTagState,
        getPinnedNotes: getPinnedNotesState,
        getRecentNotes: getRecentNotesState,
        searchNotes: searchNotesState,

        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        filesData, setFilesData,
        foldersData, setFoldersData,

        // The active file, reflected in the note editor.
        notesActiveFile, setNotesActiveFile,
        notesActiveNode, setNotesActiveNode,

        // The active folder, reflected in the dropdown sidebar and which folder is open in the explorer view.
        notesActiveFolder, setNotesActiveFolder,
        notesActiveFolderContents, setNotesActiveFolderContents,
        setNotesDirectoryPath, setNotesDirectoryPathBack,

        // Boolean flag controls
        requestFetchTree, setRequestFetchTree,

        // Full directory tree
        notesDirectoryTree, setNotesDirectoryTree,

        notesRecentFiles, setNotesRecentFiles,

        notesDirectoryPath,
        fetchNotesDirectoryTree,
        fetchNotesForActiveWorkspace,
        findObjectByPath,
        findPathById,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();

    const {
        error, setError,
        loading, setLoading,
        handleError,
        handleErrorCallback,
        handleSuccessCallback,
    } = useError( useSuccessToast );

    const {
        dialogInitialData, setDialogInitialData,
        dialogDataType, setDialogDataType,
        dialogSchema, setDialogSchema,
        dialogType, setDialogType,
        dialogData, setDialogData,
        isOpen,
    } = useFormDialog();

    if ( debug === true )
        console.log( 'useNotes :: USENOTES RE-RENDER' );

    const [ view, setView ] = useState( 'explorer' ); // 'explorer' | 'editor' | 'properties'
    const [ noteSchema, setNoteSchema ] = useState( null );
    const [ stickyNoteSchema, setStickyNoteSchema ] = useState( null );
    const [ enableSave, setEnableSave ] = useState( false ); // Toggles saving buttons in modals

    const handleGetView = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_NOTE_PAGE );
        if ( !t || t === '' ) { return 'explorer'; }
        return t;
    };

    // const [ view, setView ] = useState( handleGetView() );
    // setView( handleGetView() );
    const handleSetView = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        // navigate( t );
        setView( t );
        localStorage.setItem( ROUTES_NOTE_PAGE, t );
    };

    // Usehook state variables.
    // const [ directory, setDirectory ] = useState( [] );
    // const [ notes, setNotes ] = useState( [] );
    // const [ error, setError ] = useState( null );
    // const [ loading, setLoading ] = useState( false );

    // useEffect( () => {
    //     console.log( "useNotes :: error useEffect triggered :: error = ", error );
    //     if ( error ) {
    //         toast( "API Error", {
    //             description: error,
    //             action: (
    //                 <ToastAction altText="OK">
    //                     { `OK` }
    //                 </ToastAction>
    //             ),
    //         } );
    //         setError( null );
    //     }
    // }, [ error ] );

    // Fetch data schema on component mount
    const handleGetSchemas = () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            setNoteSchema( getSchemaForDataType( 'note' ) );
            setStickyNoteSchema( getSchemaForDataType( 'stickynote' ) );
        }
    };

    const getSchemaForDataType = ( type ) => {
        switch ( type ) {
            case 'note':
                return getSchema( 'note' );
            case 'stickynote':
                return getSchema( 'stickynote' );
            case 'recentnote':
                return getSchema( 'recentnote' );
            case 'recentstickynote':
                return getSchema( 'recentstickynote' );
            default:
                return null;
        }
    };

    const handleGetAllNotes = async () => {
        try {
            const response = await notesService.getNotes( {
                workspaceId,
            } );

            if ( response && Array.isArray( response ) ) {
                const files = response.filter( ( item ) => item.itemType === "file" );
                const folders = response.filter( ( item ) => item.itemType === "folder" );

                setFilesData( files );
                setFoldersData( folders );
                setNotesData( response );

                // const directoryTree = buildDirectoryTree( response );
                // setNotesDirectoryTree( directoryTree || [] );
                return response;
            }
            return [];
        } catch ( error ) {
            handleError( error );
            return [];
        }
    };

    const handleRefreshNotes = async () => {
        setLoadingNotes( true );
        await handleGetAllNotes(); // Populates all notes data. 
        await handleGetDirectoryTree();
        await handleGetRecentNotes();
        setLoadingNotes( false );
    };

    const handleGetDirectoryTree = async () => {
        console.log( "useNotes.js :: handleGetDirectoryTree called." );
        try {
            const response = await notesService.getDirectoryTree( { userId: user?.id || null, workspaceId: workspaceId } );
            const tree = [
                // ...( response.hasOwnProperty( 'orphanedNotes' ) ? response?.orphanedNotes : [] ),
                ...( response.hasOwnProperty( 'tree' ) ? response?.tree : [] ),
            ];

            // if ( response && typeof response === "object" ) {
            //     if ( response.hasOwnProperty( 'orphanedNotes' ) ) {
            //         console.log( "useNotes.js :: handleGetDirectoryTree :: response.orphanedNotes = ", response?.orphanedNotes );
            //         tree = tree.concat( response.orphanedNotes );
            //     }
            //     if ( response.hasOwnProperty( 'tree' ) ) {
            //         console.log( "useNotes.js :: handleGetDirectoryTree :: response.tree = ", response?.tree );
            //         // tree = [ ...arrSafeTernary( tree ), ...response.tree ];
            //         tree = tree.concat( response.tree );
            //     }
            // }

            console.log( "useNotes.js :: handleGetDirectoryTree :: response = ", response, " :: ", "tree = ", tree );
            setNotesDirectoryTree( tree || [] );
            return tree;
        } catch ( error ) {
            handleError( error );
            return [];
        }
    };

    const handleGetRecentNotes = async () => {
        try {
            const response = await notesService.getRecentNotes( { userId: user?.id || null, workspaceId: workspaceId } );
            setRecentNotesData( response || [] );
            return response;
        } catch ( error ) {
            handleError( error );
            return [];
        }
    };

    const handleSaveFile = async ( id, updates ) => {
        // if ( !fileData || !fileData._id ) return;
        if ( !id || !updates ) return;

        // Find the right node.
        let node = notesData?.find( ( n ) => n._id === id );
        if ( !node ) {
            console.error( "ERROR: useNotes.js :: handleSaveFile :: node not found for id = ", id );
            return;
        }

        try {
            const updatedFile = await notesService.updateNote( {
                ...node,
                ...updates,
                // _id: node._id,
                // content: node.content,
                // title: node.title,
                openedAt: new Date().toISOString(),
            } );

            console.log( "useNotes :: handleSaveFile :: updated file =", updatedFile );

            // Refresh directory tree to reflect changes
            await handleGetDirectoryTree();

            toast.success( "File saved successfully" );
            return updatedFile;
        } catch ( error ) {
            console.error( "useNotes :: handleSaveFile :: error =", error );
            handleError( error );
            toast.error( "Failed to save file" );
            return null;
        }
    };

    const handleBuildDirectoryTree = ( notesData ) => {
        if ( !Array.isArray( notesData ) || notesData.length === 0 ) {
            return [];
        }

        const nodeMap = new Map();
        const rootNodes = [];

        // Create a map of all nodes with content arrays
        for ( const note of notesData ) {
            const nodeData = {
                ...note,
                contents: [], // This will hold child nodes
                isExpanded: note.isActive || false,
            };
            nodeMap.set( note._id, nodeData );
        }

        // Build the tree structure using parentId relationships
        for ( const note of notesData ) {
            const nodeData = nodeMap.get( note._id );

            if ( !note.parentId || note.path.length === 1 ) {
                // Root level item (no parentId or path length of 1)
                rootNodes.push( nodeData );
            } else {
                // Find parent and add to its content array
                const parent = nodeMap.get( note.parentId );
                if ( parent ) {
                    parent.contents.push( nodeData );
                } else {
                    // Parent not found, treat as root
                    rootNodes.push( nodeData );
                }
            }
        }

        // Recursive function to sort content arrays
        const sortContent = ( nodes ) => {
            nodes.forEach( ( node ) => {
                if ( node.contents && node.contents.length > 0 ) {
                    node.contents.sort( ( a, b ) => {
                        // Folders first
                        if ( a.itemType === "folder" && b.itemType === "file" ) return -1;
                        if ( a.itemType === "file" && b.itemType === "folder" ) return 1;
                        // Then by title
                        return a.title.localeCompare( b.title );
                    } );
                    sortContent( node.contents );
                }
            } );
        };

        // Sort root nodes (folders first, then files)
        rootNodes.sort( ( a, b ) => {
            if ( a.itemType === "folder" && b.itemType === "file" ) return -1;
            if ( a.itemType === "file" && b.itemType === "folder" ) return 1;
            return a.title.localeCompare( b.title );
        } );

        sortContent( rootNodes );
        return rootNodes;
    };

    const handleBuildTreeFromCurrentData = () => {
        if ( utils.val.isValidArray( notesData, true ) ) {
            const tree = handleBuildDirectoryTree( notesData );
            setNotesDirectoryTree( tree );
            return tree;
        }
        return [];
    };

    /////////////

    const handleGetFolders = async () => {
        const res = await getFolders( {
            workspaceId,
            handleError: handleError,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log(
            'useNotes.jsx :: Fetching folders data for new workspaceId :: folders = ',
            res,
        );
        if ( res && utils.val.isValidArray( res, true ) ) {
            setFoldersData( res );
            return res;
        }
        else {
            return null;
        }
    };

    const handleGetFiles = async () => {
        const res = await getFiles( {
            workspaceId,
            handleError: handleError,
            successCallback: handleSuccessCallback,
            errorCallback: handleErrorCallback,
        } );
        console.log(
            'useNotes.jsx :: Fetching files data for new workspaceId :: files = ',
            res,
        );
        if ( res && utils.val.isValidArray( res, true ) ) {
            setFilesData( res );
            return res;
        }
        else {
            return null;
        }
    };

    const handleGoBack = () => {
        // Go up one level.
        // setNotesDirectoryPathBack();
        /* let parentFolder = utils.ao.deepSearch(
            notesDirectoryTree,
            'parentId',
            ( k, v ) => k === '_id' && v === notesDirectoryPath[ notesDirectoryPath.length - 1 ],
            true,
        );

        console.log( 'useNotes.js :: Notes :: handleGoBack :: new Parent folder = ', parentFolder, ' :: ', 'notesDirectoryPath = ', notesDirectoryPath, ' :: ', 'notesDirectoryTree = ', notesDirectoryTree );
        setNotesActiveFolder( parentFolder ); */
        // let activeFolder = utils.val.isValidArray( node, true ) ? node[ 0 ] : node;


        /* if ( notesActiveFolder.hasOwnProperty( 'parentId' ) ) {
            let newPath = findAbsolutePath( node, notesActiveFolder?.parentId );
            let node = findNodeByAbsolutePath( notesDirectoryTree, newPath );
            setNotesDirectoryPath( newPath );

            // Set current active file to null.
            setNotesActiveFile( null );
        }
        else if ( utils.val.isObject( node ) ) {
            if ( notesActiveFile.hasOwnProperty( '_id' ) ) {
                let newPath = findAbsolutePath( notesDirectoryTree, node?._id );
                setNotesDirectoryPath( newPath );
            }
            setView( 'editor' );
        } */


        // TODO :: Explore achieving the directoryTree structure using a flat array of files and folders, and traverse up and down the tree by looking at content and parent IDs. 
        // For breadcrumbs, to get the previous crumbs, keep finding each node by the previous node's parentId, up the chain. 
        if ( utils.val.isValidArray( notesDirectoryPath, true ) ) {
            if ( notesDirectoryPath.length > 1 ) {
                let newPath = [ ...notesDirectoryPath ];
                newPath.pop();
                /* const handleRemoveItem = ( index ) => {
                    notesDirectoryPath.splice( notesDirectoryTree?.length, 1 );
                    const [movedTask] = updatedTasks.splice(fromIndex, 1);
                    updatedTasks.splice(toIndex, 0, movedTask);
                }; */


                // let newPath = findAbsolutePath( node, notesActiveFolder?.parentId );
                setNotesDirectoryPath( newPath );
                console.log(
                    'useNotes.js',
                    ' :: ', 'handleGoBack',
                    // ' :: ', 'node = ', node,
                    ' :: ', 'newPath = ', newPath,
                    ' :: ', 'notesDirectoryPath = ', notesDirectoryPath,
                    ' :: ', 'notesDirectoryTree = ', notesDirectoryTree,
                    ' :: ', 'notesActiveFile = ', notesActiveFile,
                    ' :: ', 'notesActiveFolder = ', notesActiveFolder,
                );

                /* let relativePath = utils.val.isValidArray( newPath, true )
                    ? ( newPath?.map( ( v, i ) => ( v?._id ) ) )
                    : ( [ newPath ]?.map( ( v, i ) => ( v?._id ) ) ); */
                let pathIds = getPathIds( newPath, "_id" );
                // let node = findNodeByAbsolutePath( notesDirectoryTree, newPath );
                let node = findNodeByAbsolutePath( notesDirectoryTree, pathIds );

                console.log(
                    'useNotes.js',
                    ' :: ', 'handleGoBack',
                    ' :: ', 'node = ', node,
                    ' :: ', 'newPath = ', newPath,
                    ' :: ', 'notesDirectoryPath = ', notesDirectoryPath,
                    ' :: ', 'notesDirectoryTree = ', notesDirectoryTree,
                    ' :: ', 'notesActiveFile = ', notesActiveFile,
                    ' :: ', 'notesActiveFolder = ', notesActiveFolder,
                );

                handleChangeNode( node );
            }
        }
        else {
            // Path is empty, set folder to top of folder tree. 
            console.log(
                'useNotes.js',
                ' :: ', 'handleGoBack',
                ' :: ', 'case: path is empty',
                ' :: ', 'notesDirectoryPath = ', notesDirectoryPath,
                ' :: ', 'notesDirectoryTree = ', notesDirectoryTree,
                ' :: ', 'notesActiveFile = ', notesActiveFile,
                ' :: ', 'notesActiveFolder = ', notesActiveFolder,
            );
        }
    };

    // // // // // // // // // //
    // MODAL CONTROL FUNCTIONS //
    // // // // // // // // // //

    const handleCancel = () => {
        console.log( 'useNotes.js :: handleCancel triggered. :: dialogData = ', dialogData, ' :: ', 'dialogType = ', dialogType, ' :: ', 'dialogDataType = ', dialogDataType );
        setDialogDataType( 'none' );
        setDialogType( 'none' );
        setDialogInitialData( null );
        setDialogData( null );
        setDialogSchema( null );
        setEnableSave( false );
    };

    const handleCreateNote = async ( data, itemType = 'file' ) => {
        try {
            const newNote = {
                title: data.title || "New Note",
                content: data.content || "",
                itemType: "file",
                subType: "txt",
                path: data.path || [ data.title || "New Note" ],
                workspaceId: workspaceId,
                ...data,
            };

            const result = await notesService.createNote( newNote );
            if ( result ) {
                console.log( "Note created:", result );
                setNotesActiveFile( result );
                await handleGetDirectoryTree();
                toast.success( "Note created successfully" );
                return result;
            }
        } catch ( error ) {
            console.error( "Failed to create note:", error );
            handleError( error );
            toast.error( "Failed to create note" );
        }
    };

    const handleNodeCreate = async ( data, itemType = 'file' ) => {
        console.log( 'useNotes.js :: handleNodeCreate :: data = ', data, " :: ", "itemType = ", itemType );
        let result;
        try {
            let validatedData = {
                path: [
                    // ...( data.path || [] ).slice( 0, -1 ),
                    ...( data?.path || [] ),
                    {
                        // value: data?.parentId || randParentId,
                        value: data?.parentId || null,
                        title: data.title
                    } ],
                workspaceId: workspaceId,
                ...data,
            };

            if ( !utils.val.isDefined( validatedData?.parentId ) || validatedData?.parentId === "" ) {
                validatedData[ 'parentId' ] = null;
            }
            if ( !utils.val.isDefined( validatedData?.path ) || validatedData?.path?.length === 0 ) {
                delete validatedData[ 'path' ];
            }

            switch ( itemType ) {
                case 'file':
                    validatedData = {
                        ...validatedData,
                        title: data.title || "New Note",
                        content: data.content || "",
                        itemType: "file",
                        subType: "txt",
                    };
                    break;

                case 'folder':
                    validatedData = {
                        ...validatedData,
                        title: data.title || "New Folder",
                        contents: data.contents || [],
                        itemType: "folder",
                        subType: "folder",
                    };
                    break;
                case 'asset':
                    validatedData = {
                        ...validatedData,
                        title: data.title || "New Asset",
                        // contents: data.contents || [],
                        itemType: "asset",
                        subType: "image",
                    };
                    break;
                case 'note':
                    validatedData = {
                        ...validatedData,
                        title: data.title || "New StickyNote",
                        content: data.content || "",
                        itemType: "note",
                        subType: "sticky",
                    };
                    break;
                default:
                    break;
            }

            result = await notesService.createNote( validatedData );
            console.log( 'useNotes.js :: handleNodeCreate :: data = ', data, " :: ", "itemType = ", itemType, " :: ", "validatedData = ", validatedData, " :: ", "result = ", result );

            if ( utils.val.isDefined( result ) ) {
                handleCancel();
                return result;
            }
            else {
                return null;
            }
        } catch ( error ) {
            console.error( "Failed to create file:", error );
            handleError( error );
        }
    };

    const handleNodeUpdate = async ( data, itemType = 'file' ) => {
        console.log( 'useNotes.js :: handleNodeUpdate :: data = ', data, " :: ", "itemType = ", itemType );
        try {
            const updatedNode = await notesService.updateNote( {
                id: data?._id,
                data: {
                    ...data,
                    id: data?._id,
                    title: data?.title,
                    content: data?.content,
                    contents: data?.contents,
                    // path: [ ...( data.path || [] ).slice( 0, -1 ), { value: data?.parentId, title: data.title } ],
                }
            } );

            await handleGetDirectoryTree();
            handleCancel();
            switch ( updatedNode?.itemType ) {
                case 'file':
                    toast.success( "File updated successfully" );
                    break;
                case 'folder':
                    toast.success( "Folder updated successfully" );
                    break;
                case 'asset':
                    toast.success( "Asset updated successfully" );
                    break;
                case 'note':
                    toast.success( "Note updated successfully" );
                    break;
                default:
                    break;
            }
            return updatedNode;
        } catch ( error ) {
            console.error( "Failed to update file:", error );
            handleError( error );
            toast.error( "Failed to update file" );
        }
    };

    const handleNodeDelete = async ( id, itemType = 'file' ) => {
        console.log( 'useNotes.js :: handleNodeDelete :: id = ', id, " :: ", "itemType = ", itemType );
        if ( !folderId ) return;

        if ( window.confirm( "Are you sure you want to delete this folder and all its contents?" ) ) {
            try {
                await notesService.deleteNote( { id: folderId } );
                await handleGetDirectoryTree();

                // Clear active folder if it was deleted
                if ( notesActiveFolder && notesActiveFolder._id === folderId ) {
                    setNotesActiveFolder( null );
                }

                toast.success( "Folder deleted successfully" );
            } catch ( error ) {
                console.error( "Error deleting folder:", error );
                handleError( error );
                toast.error( "Failed to delete folder" );
            }
        }
    };


    const handleNodeRename = async ( id, title, itemType = 'file' ) => {
        console.log(
            'useNotes.js',
            ' :: ', 'handleNodeRename',
            ' :: ', 'id = ', id,
            " :: ", "title = ", title,
            " :: ", "itemType = ", itemType,
        );
        if ( id ) {
            let node = getNodeById( id );
            if ( node ) {
                try {
                    node = { ...node, title: title };
                    let result = await handleNodeUpdate( node, itemType );
                    // handleNodeUpdate handles all state manipulation, so we can leave this here. 

                    if ( result && utils.val.isObject( result ) ) return result;
                    else return null;
                } catch ( error ) {
                    console.error( 'useNotes :: handleNodeRename :: An error was encountered renaming this note: ', error.message );
                }
            }
        }

        return null;
    };

    const handleNodeSelect = ( node ) => {
        // console.log( 'useNotes.js :: handleNodeSelect :: node = ', node );
        if ( node ) {
            setNotesActiveNode( node );
            handleNodePathUpdate( [ ...( node?.path || [] ), {
                value: node?._id,
                title: node?.title,
            } ] );
            if ( node?.itemType === 'file' ) setView( 'editor' );
            else if ( node?.itemType === 'folder' ) setView( 'explorer' );
            else setView( 'explorer' );
        }
        else {
            setNotesActiveNode( null );
            handleNodePathUpdate( [] );
            setView( 'explorer' );
        }
    };

    const handleNodePathUpdate = ( path ) => {
        // console.log( 'useNotes.js :: handleNodePathUpdate :: path = ', path );
        setNotesDirectoryPath( path );
    };

    const handleChange = ( field, value, data, setData ) => {
        console.log( "useTask :: handleChange :: args: [", field, value, data, setData, "]" );
        if ( data && setData ) setData( { ...data, [ field ]: value } );
        // else setDialogData( { ...dialogData, [ field ]: value } );
        setDialogData( ( prev ) => ( { ...arrSafeTernary( prev ), [ field ]: value } ) );
    };

    const handleSort = useCallback( ( items, dir = 1 ) => {
        return ( utils.val.isValidArray( items, true )
            ? ( items?.sort( ( a, b ) => (
                ( dir === 1 // Ascending
                    ? ( a?.index - b?.index )
                    : ( dir === -1 // Descending
                        ? ( b?.index - a?.index )
                        : ( dir === 0 ?? true )
                    )
                )
            ) ) )
            : ( items ) );
    }, [] );

    const handleInputChange = (
        e,
        data, setData = () => { },
        // isEdit = false,
        // setEditData = () => { },
        // setCreateData = () => { }
    ) => {
        const { id, name, value } = e.target;
        // console.log( "WorkspaceGrid :: handleInputChange :: e.target = ", e.target.id, " :: ", "name = ", name, " :: ", "value = ", value, " :: ", "isEdit = ", isEdit );

        if ( setData && data ) {
            console.log( 'useNotes.js :: handleInputChange :: setData = ', setData, ' :: ', 'data = ', data );
            setData( { ...data, [ name ]: value } );
        }

        // Lastly, set enableSave to true if not already.
        if ( !enableSave ) setEnableSave( true );
    };


    // // // // // // //
    // API ENDPOINTS //
    // // // // // // //


    const buildDialog = ( {
        data,
        setData, // For onchange
        initialData,
        refData,
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'add',
        dataType = 'file', // Name of type of data being represented.
        dialogTrigger,
        debug = false,
    } ) => {
        return (
            <FormDialogWrapper
                debug={ debug }
                useOverlay={ true }
                initialData={ initialData }
                data={ data }
                setData={ setData }
                refData={ refData }
                dataSchema={ dataSchema }
                dialogOpen={ dialogOpen }
                setDialogOpen={ setDialogOpen }
                handleSubmit={ handleSubmit }
                handleChange={ handleChange }
                handleClose={ handleClose }
                dialogType={ dialogType }
                dataType={ dataType }
                dialogTrigger={ dialogTrigger }
                classNames={ '' }
                dialogClassNames={ '' }
                contentClassNames={ '' }
            />
        );
    };

    const handleBuildNoteDialog = ( {
        initialData, setInitialData,
        dialogOpen = false, setDialogOpen = () => { },
        mode = 'add',
        docName = '',
        dataType = 'file',
    } ) => {
        console.log(
            'useNotes :: handleBuildNoteDialog :: ',
            '\n initialData = ', initialData,
            '\n setInitialData = ', setInitialData,
            '\n dialogOpen = ', dialogOpen,
            '\n setDialogOpen = ', setDialogOpen,
            '\n mode = ', mode,
            '\n docName = ', docName,
            '\n dataType = ', dataType,
        );
        /* 
        const init = {
            _id: '6759a76e7a65b6ee9d3efaf5',
            parentId: '6759a5b07a65b6ee9d3efa41',
            workspaceId: '63f1e9128bcd5a42d28b4563',
            categories: [],
            title: 'New File',
            content: 'File content goes here',
            data: '',
            logo: '',
            icon: '',
            inTrash: false,
            openedAt: '2024-12-11T14:53:34.622Z',
            createdAt: '2024-12-11T14:53:34.622Z',
            updatedAt: '2024-12-11T14:53:34.622Z',
            __v: 0,
            description: 'a',
        };
        */

        let refData;
        // let allData = getData();
        if ( !refData ) refData = getData();

        let dataSchema;
        if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            dataSchema = getSchema( dataType );
        }

        return (
            <Dialog
                open={ dialogOpen }
                isOpen={ dialogOpen || !!initialData }
                onClose={ () => { setDialogOpen( false ); } }
                onOpenChange={ () => { setDialogOpen( !dialogOpen ); } }
                className={ `flex flex-col !min-w-[60vw] !max-w-[60vw] !w-[60vw]` }
                title={ `${ mode === 'add' ? 'Create' : 'Edit' } new ${ docName }` }
            // defaultOpen={true}
            >
                <DialogOverlay />
                {/* <DialogTrigger asChild>
                    <Button
                        className={ `select-none` }
                        variant='outline'>
                        { mode === 'add' ? <Plus /> : <Edit /> }
                    </Button>
                </DialogTrigger> */}

                {/* <DialogContent className='sm:max-w-[425px]'> */ }
                <DialogContent
                    className={ twMerge(
                        // `absolute z-[1000] `,
                        `w-full min-w-[70vw] max-w-[70vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 425 }px] max-h-modal flex flex-col `,
                        `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 `
                    ) }
                >
                    <DialogHeader>
                        <DialogTitle>{ `${ mode === 'add' ? 'Create' : 'Edit' } ${ docName }` }</DialogTitle>
                        <DialogDescription>
                            { `${ mode === 'add' ? 'Create a new' : 'Edit an existing' } ${ docName }` }
                        </DialogDescription>
                    </DialogHeader>
                    <div className={ `flex flex-col gap-2` }>
                        { dataSchema && utils.val.isObject( dataSchema ) && (
                            <FormGenerator
                                debug={ false }
                                // model={ logFormModel }
                                // data={ initialData }
                                // data={ initialData }
                                dataType={ dataType }
                                setData={ setInitialData }
                                refData={ refData }
                                // initialData={ logFormData }
                                initialData={ initialData }
                                // dialogType={ dialogType }
                                // dataType={ dataType }
                                schema={ dataSchema }
                                customFields={ {
                                    "content": {
                                        dataType: "string",
                                        fieldType: "markdown"
                                    },
                                } }
                                submitButton={
                                    <DialogClose asChild>
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
                                            onClick={ ( e ) => {
                                                e.preventDefault();
                                                handleSubmitRouting( mode, dataType );
                                            } }>
                                            { mode === 'add' ? 'Create' : 'Save' }
                                        </Button>
                                    </DialogClose>
                                }
                                onChange={ ( e ) => {
                                    const { name, value } = e.target;
                                    console.log(
                                        'useNotes :: buildNotesDialog ==> FormGenerator :: onChange triggered :: name, value = ',
                                        name,
                                        value,
                                    );
                                    if ( data && Object.keys( data ).includes( name ) ) {
                                        if ( handleChange ) handleChange( name, value, data, setData );
                                        setEventsData( { ...data, [ name ]: value } );
                                    }
                                } }
                                // onCancel={ () => handleCancel() }
                                onSubmit={ ( data ) => handleSubmitRouting( mode, dataType ) }
                                inputMaxWidth={ 10 }
                                inputMaxHeight={ 32 }
                                showFormModel={ true }
                                showFormData={ true }
                                showFormSchema={ true }
                            />
                        ) }

                        {/* 
                        <div className='flex flex-col justify-between items-start p-0 m-0 gap-0 w-full'>
                            <Label
                                htmlFor={ `title` }
                                className='text-right h-3'>
                                Title
                            </Label>
                            <Input
                                type='text'
                                id={ `title` }
                                name={ `title` }
                                defaultValue={ initialData?.title ? initialData?.title : '' }
                                className='w-full'
                                onChange={ ( e ) => {
                                    handleInputChange( e, initialData, setInitialData );
                                } }
                            />
                        </div>

                        { dataType === 'file' && (
                            <>
                                <div className='flex flex-col justify-between items-start p-0 m-0 gap-0 w-full'>
                                    <Label
                                        htmlFor={ `description` }
                                        className='text-right h-3'>
                                        Description
                                    </Label>
                                    <Input
                                        type='text'
                                        id={ `description` }
                                        name={ `description` }
                                        defaultValue={ initialData?.description ? initialData?.description : '' }
                                        className='w-full'
                                        onChange={ ( e ) => {
                                            handleInputChange( e, initialData, setInitialData );
                                        } }
                                    />
                                </div>

                                <div className='flex flex-col justify-between items-start p-0 m-0 gap-0 w-full'>
                                    <Label
                                        htmlFor={ `content` }
                                        className='text-right h-3'>
                                        Content
                                    </Label>
                                    <Textarea
                                        type='text'
                                        id={ `content` }
                                        name={ `content` }
                                        defaultValue={
                                            initialData?.content
                                                ? initialData?.content
                                                : ''
                                        }
                                        className='w-full'
                                        onChange={ ( e ) => {
                                            handleInputChange( e, initialData, setInitialData );
                                        } }
                                    />
                                </div>
                            </>
                        ) } */}
                        {/* 
                        <QuillEditor
                            className={ `flex flex-col w-full h-full mx-auto rounded-[${ 0.25 }rem]` }
                            value={ notesActiveFile?.content }
                            setValue={ ( data ) => {
                                // Store the data in the content. 
                                setNotesActiveFile( {
                                    ...notesActiveFile,
                                    content: data
                                } );
                            } }
                            content={ notesActiveFile?.content }
                            setContent={ ( data ) => {
                                // Store the data in the content. 
                                if ( notesActiveFile?.content && notesActiveFile?.content !== data ) {
                                    console.log( "useNotes :: QuillEditor :: setContent :: data = ", data );
                                    setNotesActiveFile( {
                                        ...notesActiveFile,
                                        content: data
                                    } );
                                }
                            } }
                        />
                        */}
                        {/* <QuillEditor
                            className={ `w-full max-h-96 mx-auto rounded-[${ 0.25 }rem] ` }
                            content={ initialData?.content }
                            setContent={ ( data ) => {
                                // Store the data in the content. 
                                console.log( "useNotes :: buildDialog :: QuillEditor :: setContent :: data = ", data );
                                // handleInputChange( data, initialData, setInitialData );
                                setInitialData( {
                                    ...initialData,
                                    content: data
                                } );
                            } }
                        /> */}

                    </div>
                    <DialogFooter className='sm:justify-start'>
                        {/* 
                        <DialogClose asChild>
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
                                    handleSubmitRouting( mode, dataType );
                                } }>
                                { mode === 'add' ? 'Create' : 'Save' }
                            </Button>
                        </DialogClose>
                        */}
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        );
    };

    // Helper function for fetching data when workspaceId changes
    const fetchRecentNotesOnWorkspaceChange = useCallback( () => {
        // On workspace ID change, fetch events and other data.
        if ( utils.val.isValid( workspaceId ) ) {
            handleGetRecentNotes();
            handleGetDirectoryTree();
        }
    }, [ workspaceId, handleGetRecentNotes, handleGetDirectoryTree ] );

    // Fetch notes or tree data if `requestFetchTree` changes
    const fetchTreeOnRequest = useCallback( () => {
        if ( requestFetchTree ) {
            console.log( "useNotes :: fetchTreeOnRequest = ", fetchTreeOnRequest );
            setRequestFetchTree( false );
            if ( utils.val.isValid( workspaceId ) ) {
                handleGetDirectoryTree();
            }
        }
    }, [ requestFetchTree, workspaceId ] );

    // Monitor directory path changes for updates
    const handleChangesToDirectoryPath = useCallback( () => {
        console.log( 'useNotes :: Directory Path changed :: notesDirectoryPath = ', notesDirectoryPath );
        if ( utils.val.isValidArray( notesDirectoryTree, true ) ) {
            let parentFolder = utils.ao.deepSearch( notesDirectoryTree, '_id', () => { }, true );
            console.log( 'ParentFolder:', parentFolder );
        }
    }, [ notesDirectoryPath, notesDirectoryTree ] );

    return {
        // VARIABLES
        noteSchema, setNoteSchema,
        stickyNoteSchema, setStickyNoteSchema,
        buildDialog,
        handleBuildNoteDialog,
        handleGetSchemas,
        getSchemaForDataType,

        // HANDLER FUNCTIONShandleGetView
        handleSetView,
        handleGetSchemas,
        getSchemaForDataType,
        handleGetAllNotes,
        handleRefreshNotes,
        handleGetDirectoryTree,
        handleGetRecentNotes,
        handleSaveFile,
        handleBuildDirectoryTree,
        handleBuildTreeFromCurrentData,
        handleGoBack,
        handleCancel,
        handleCreateNote,
        handleNodeCreate,
        handleNodeUpdate,
        handleNodeDelete,
        handleNodeRename,
        handleNodeSelect,
        handleNodePathUpdate,
        handleChange,
        handleSort,
        handleInputChange,
        buildDialog,
        handleBuildNoteDialog,
        fetchRecentNotesOnWorkspaceChange,
        fetchTreeOnRequest,
        handleChangesToDirectoryPath,

        // GETTERS / SETTERS
        dialogData, setDialogData,
        dialogSchema, setDialogSchema,
        dialogType, setDialogType,
        dialogDataType, setDialogDataType,
        dialogInitialData, setDialogInitialData,
        enableSave, setEnableSave,
        view, setView, handleGetView, handleSetView,


        handleGetAllNotes,
        handleGetDirectoryTree,
        handleGetRecentNotes,
        handleSaveFile,
        handleNodeCreate,
        handleNodeUpdate,
        handleNodeDelete,
        handleNodeRename,
        handleNodeSelect,
        handleNodePathUpdate,
        handleBuildDirectoryTree,
        handleBuildTreeFromCurrentData,
    };
};

export default useNotes;


/* 
    const buildDialog2 = ( {
        data,
        setData,
        refData,
        dataSchema,
        dialogOpen,
        setDialogOpen,
        handleSubmit,
        handleChange,
        handleClose,
        dialogType = 'none',
        dialogDataType = 'none', // Name of type of data being represented.
        dialogTrigger,
    } ) => {
        let title = `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dialogDataType ? utils.str.toCapitalCase( dialogDataType ) : `None` }`;
        let description = `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] } ${ dialogDataType ? utils.str.toCapitalCase( dialogDataType ) : `None` }`;

        if ( !utils.val.isDefined( data ) ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            if ( dialogType === 'add' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'edit' ) { data = dialogData ?? dialogInitialData; }
            else if ( dialogType === 'view' ) { data = dialogData ?? dialogInitialData; }
        }

        if ( !utils.val.isDefined( dataSchema ) || Object.keys( dataSchema ).length === 0 ) {
            // Undefined / null input data. Assume we need to create initial data for a new document. 
            dataSchema = getSchema( dialogDataType );
        }

        if ( utils.ao.has( data, "workspaceId" ) && data?.workspaceId === null ) {
            data.workspaceId = workspaceId;
        }

        console.log( 'useNotes :: buildDialog :: args = ',
            "\n :: ", "data = ", data,
            "\n :: ", "setData = ", setData, // For onchange
            "\n :: ", "dataSchema = ", dataSchema,
            "\n :: ", "dialogOpen = ", dialogOpen,
            "\n :: ", "setDialogOpen = ", setDialogOpen,
            "\n :: ", "handleSubmit = ", handleSubmit,
            "\n :: ", "handleChange = ", handleChange,
            "\n :: ", "handleClose = ", handleClose,
            "\n :: ", "dialogType = ", dialogType,
            "\n :: ", "dialogDataType = ", dialogDataType, // Name of type of data being represented.
            "\n :: ", "getSchema( dialogDataType ) = ", getSchema( dialogDataType ),
        );

        if ( !refData ) refData = getData();
        return (
            <>
                <Dialog
                    open={ dialogOpen }
                    isOpen={ dialogOpen || !!data }
                    onClose={ handleClose }
                    title={ title }
                    onOpenChange={ setDialogOpen }
                    className={ `flex flex-col !min-w-[60vw] !max-w-[60vw] !w-[60vw]` }
                >

                    { dialogTrigger && ( <DialogTrigger asChild>
                        <Button
                            className={ `select-none` }
                            variant='outline'>
                            { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }{ `${ [ ...DIALOG_TYPE_NAMES ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                        </Button>
                    </DialogTrigger> ) }

                    <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />

                    <DialogContent
                        className={ twMerge(
                            `w-full !min-w-[60vw] h-[80vh] min-h-[80vh] sm:max-w-[${ 525 }px] max-h-modal flex flex-col`,
                            `overflow-hidden p-4 overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 `
                        ) }
                    >
                        <DialogHeader>
                            <DialogTitle>{ `${ title }` }</DialogTitle>
                            <DialogDescription>{ `${ description }` }</DialogDescription>
                        </DialogHeader>
                        <div className={ `flex flex-col gap-2` }>
                            { dataSchema && utils.val.isObject( dataSchema ) && (
                                <FormGenerator
                                    debug={ false }
                                    // model={ logFormModel }
                                    // data={ initialData }
                                    data={ data }
                                    setData={ setData }
                                    refData={ refData }
                                    dataType={ dataType }
                                    // initialData={ logFormData }
                                    initialData={ data }
                                    schema={ dataSchema }
                                    onChange={ ( e ) => {
                                        const { name, value } = e.target;
                                        console.log(
                                            'useNotes :: buildDialog ==> FormGenerator :: onChange triggered :: name, value = ',
                                            name,
                                            value,
                                        );
                                        if ( data && Object.keys( data ).includes( name ) ) {
                                            if ( handleChange ) handleChange( name, value, data, setData );
                                            setEventsData( { ...data, [ name ]: value } );
                                        }
                                    } }
                                    onSubmit={ ( data ) => handleSubmit( data ) }
                                    inputMaxWidth={ 10 }
                                    inputMaxHeight={ 32 }
                                    showFormModel={ true }
                                    showFormData={ true }
                                    showFormSchema={ true }
                                />
                            ) }
                        </div>
                        <DialogFooter className='sm:justify-start'>
                            <DialogClose>
                                <Button
                                    type='submit'
                                    onClick={ () => {
                                        console.log(
                                            'useNotes :: submit button :: handleSubmit',
                                            " :: ", "data = ", data
                                        );
                                        handleSubmitRouting( data, dialogDataType );
                                    } }>
                                    { [ ...DIALOG_TYPE_ICONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }
                                    { `${ [ ...DIALOG_TYPE_DESCRIPTIONS ][ DIALOG_TYPES.indexOf( dialogType ) ] }` }
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    };
*/
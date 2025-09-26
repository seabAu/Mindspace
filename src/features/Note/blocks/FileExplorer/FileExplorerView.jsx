import React, { useEffect, useMemo, useState } from 'react';
import FileExplorerTree from "./FileExplorerTree";
import FileExplorer from "./FileExplorer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import * as utils from 'akashatools';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useNotes from "@/lib/hooks/useNotes";
import useGlobalStore from "@/store/global.store";
import useNotesStore from "@/store/note.store";
import { CONTENT_HEADER_HEIGHT } from '@/lib/config/constants';
import { getNodeAtPath } from '@/lib/utilities/note';
import { NotesEditor } from '../Editor/NotesEditor';
import { arrSafeTernary } from '@/lib/utilities/data';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle } from 'lucide-react';



// Add sorting utility function
const sortTreeNodes = ( nodes ) => {
    return [ ...nodes ].sort( ( a, b ) => {
        // Folders always come before files
        if ( a.itemType === "folder" && b.itemType === "file" ) return -1;
        if ( a.itemType === "file" && b.itemType === "folder" ) return 1;

        // Within the same itemType, sort alphabetically (case-insensitive)
        if ( ( a && a?.hasOwnProperty( 'title' ) ) && ( b && b?.hasOwnProperty( 'title' ) ) ) {
            return a.title.toLowerCase().localeCompare( b.title.toLowerCase() );
        }
        else {
            return 1;
        }
    } );
};

// Apply initial sorting to the sample data
const applySortingToTree = ( nodes ) => {
    if ( utils.val.isValidArray( nodes, true ) ) {
        return sortTreeNodes(
            nodes.map( ( node ) => ( {
                ...node,
                content: node.content ? applySortingToTree( node.content ) : undefined,
            } ) ),
        );
    }
};

// const sortedInitialData = applySortingToTree( initialData );

export default function FileExplorerTreeView ( {
    data,
    selectedNode,
    selectedNodeId,

    onNodeSelect,
    onNodeCreate,
    onNodeUpdate,
    onNodeRename,
    onNodeDelete,

    onPathUpdate = () => { },
    path, setPath,
    setContent
}, ...props ) {

    const {
        debug, setDebug,
        schemas, getSchema,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchTree, setRequestFetchTree,
        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        notesRecentFiles, setNotesRecentFiles,
        notesActiveNode, setNotesActiveNode,
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
        handleGetSchemas,
        getSchemaForDataType,
        buildDialog,

        // HANDLER FUNCTIONS
        handleChange,
        handleCancel,
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
        dialogSchema, setDialogSchema,
        dialogData, setDialogData,
        dialogType, setDialogType,
        dialogDataType, setDialogDataType,
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


    // const [ treeData, setTreeData ] = useState( utils.val.isValidArray( data, true ) ? data : sortedInitialData );
    const [ treeData, setTreeData ] = useState( utils.val.isValidArray( notesDirectoryTree, true ) ? applySortingToTree( notesDirectoryTree ) : [] );

    const [ editorOpen, setEditorOpen ] = useState( false );
    const [ selectedFile, setSelectedFile ] = useState( null );
    const [ selectedFiles, setSelectedFiles ] = useState( [] );
    const [ currentPath, setCurrentPath ] = useState( null );

    // Helper function to generate unique IDs
    // const generateId = () => Math.random().toString( 36 ).substr( 2, 9 );
    const generateId = () => utils.rand.randString( 36 );

    const getParentIdOfCurrentPath = ( path ) => {
        return ( path && Array.isArray( path ) ? path?.[ path?.length - 1 ]?.value || null : null );
    };

    // Helper function to find a node by ID
    const findNodeById = ( nodes, id ) => {
        for ( const node of nodes ) {
            if ( node?._id === id ) return node;
            if ( node?.content ) {
                const found = findNodeById( node?.content, id );
                if ( found ) return found;
            }
        }
        return null;
    };

    const handleUpdateSelectedNode = ( name, value ) => {
        setNotesActiveNode( { ...( utils.val.isObject( selectedFile ) ? selectedFile : {} ), [ name ]: value } );
    };

    // Helper function to update tree data
    const updateTreeData = (
        nodes,
        updater,
    ) => {
        return updater( nodes );
    };

    const handlePathUpdate1 = ( path = [] ) => {
        const pathNode = findNodeById( treeData, currentPath[ currentPath.length - 1 ]?.value );
        // console.log( 'FileExplorerView :: handlePathUpdate :: treeData = ', treeData, ' :: ', 'currentPath = ', currentPath, ' :: ', 'path = ', path, " :: ", "findNodeById result :: pathNode = ", pathNode );
        if ( pathNode ) setCurrentPath( path );
        // setEditorOpen( false ); // Reset editor
        // setSelectedFile( null );
        // if ( onPathUpdate ) onPathUpdate( path );

    };

    const handleNodeSelect1 = ( node ) => {
        // console.log( 'FileExplorerView :: handleNodeSelect :: node = ', node );
        // setSelectedFile( node );
        setNotesActiveNode( null );
        setNotesActiveNode( node );
        // handlePathUpdate( node?.path || [] );
        if ( onNodeSelect ) onNodeSelect( node );
        // if ( onPathUpdate ) { handlePathUpdate( [ ...( node?.path || [] ), { value: node?.path, title: node?.title } ] ); }
        // if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeClick1 = ( node ) => {
        // console.log( 'FileExplorer :: handleNodeClick :: node = ', node );
        if ( node.itemType === "folder" ) {
            toggleFolder( node._id );
        }
        setSelectedNode( node._id );
        if ( onNodeSelect ) onNodeSelect( node );
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeOpen1 = ( node ) => {
        // console.log( 'FileExplorerView :: handleNodeOpen :: node = ', node );
        if ( node.itemType === 'file' ) setEditorOpen( true );
        else if ( node.itemType === 'folder' ) setEditorOpen( false );
        else if ( node.itemType === 'note' ) setEditorOpen( true );
        else if ( node.itemType === 'asset' ) setEditorOpen( false );
        // setSelectedFile( node );
        setNotesActiveNode( null );
        setNotesActiveNode( node );
        if ( onNodeSelect ) onNodeSelect( node );
        if ( onPathUpdate ) onPathUpdate( node?.path );
        handlePathUpdate( node?.path );
        // if ( onPathUpdate ) {
        //     onPathUpdate( [ ...( node?.path || [] ), {
        //         value: node?._id,
        //         title: node?.title,
        //     } ] );
        // }
        // else {
        //     handlePathUpdate( [ ...( node?.path || [] ), {
        //         value: node?._id,
        //         title: node?.title,
        //     } ] );
        // }
    };

    const handlePathUpdate = ( path = [] ) => {
        setCurrentPath( path );
        // setEditorOpen( false ); // Reset editor
        // setSelectedFile( null );
        // if ( onPathUpdate ) onPathUpdate( path );

        const pathNode = findNodeById( treeData, path[ path.length - 1 ]?.value );
        // console.log( 'FileExplorerView :: handlePathUpdate :: treeData = ', treeData, ' :: ', 'currentPath = ', currentPath, " :: ", "findNodeById result :: pathNode = ", pathNode );
    };

    const handleNodeSelect = ( node ) => {
        // console.log( 'FileExplorerView :: handleNodeSelect :: node = ', node );
        // setSelectedFile( node );
        setNotesActiveNode( null );
        setNotesActiveNode( node );
        // handlePathUpdate( node?.path || [] );
        handlePathUpdate( [ ...( node?.path || [] ), {
            value: node?._id,
            // _id: node?._id,
            title: node?.title,
        } ] );
        if ( onNodeSelect ) onNodeSelect( node );
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeClick = ( node ) => {
        // console.log( 'FileExplorer :: handleNodeClick :: node = ', node );
        if ( node.itemType === "folder" ) {
            toggleFolder( node._id );
        }
        setSelectedNode( node._id );
        if ( onNodeSelect ) onNodeSelect( node );
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeOpen = ( node ) => {
        // console.log( 'FileExplorerView :: handleNodeDoubleClick :: node = ', node );
        // setSelectedFile( node );
        if ( notesActiveNode?._id !== node?._id ) {
            // Don't update when clicking a node we already have open
            setNotesActiveNode( null );
            setNotesActiveNode( node );
            handlePathUpdate( [ ...( node?.path || [] ), {
                value: node?._id,
                // _id: node?._id,
                title: node?.title,
            } ] );
            if ( onNodeSelect ) onNodeSelect( node );
            // if ( onPathUpdate ) onPathUpdate( node?.path );
        }
    };

    const handleNodeCreate = async ( parentId, name, itemType ) => {
        const newNode = {
            _id: generateId(),
            title: name,
            itemType: itemType,
            subType: ( itemType === 'folder' ? 'folder' : 'txt' ),
            parentId: parentId || null,
            // content: itemType === "folder" ? [] : '',
            contents: [],
            content: '',
        };

        let result;
        if ( onNodeCreate ) {
            result = await onNodeCreate( newNode, itemType );
        }

        // Automatically select the newly created node
        setSelectedFile( newNode );
        setEditorOpen( true );

        setTreeData( ( prevData ) => {
            if ( !parentId ) {
                // Add to root and sort
                const newData = [ ...arrSafeTernary( prevData ), newNode ];
                return sortTreeNodes( newData );
            }

            // Add to specific parent folder and sort that folder's content
            const addToParent = ( nodes ) => {
                return nodes.map( ( node ) => {
                    if ( node._id === parentId ) {
                        const updatedChildren = [ ...( node?.children || [] ), newNode ];
                        let sortedChildren = sortTreeNodes( updatedChildren );
                        return {
                            ...node,
                            children: sortedChildren,
                            contents: sortedChildren,
                        };
                    }
                    if ( node.contents ) {
                        return {
                            ...node,
                            contents: addToParent( node.contents ),
                        };
                    }
                    return node;
                } );
            };

            return addToParent( prevData );
        } );
    };

    const handleNodeRename = ( nodeId, newName ) => {
        // Update the server and the node in notesData.


        // Run through the full directory tree and update the local nested document. 

        setTreeData( ( prevData ) => {
            const renameNode = ( nodes ) => {
                return nodes.map( ( node ) => {
                    if ( node._id === nodeId ) {
                        return { ...node, title: newName };
                    }
                    if ( node.contents ) {
                        return {
                            ...node,
                            contents: renameNode( node.contents ),
                        };
                    }
                    return node;
                } );
            };

            // After renaming, we need to re-sort the tree to maintain order
            const renamedData = renameNode( prevData );

            // Re-sort the entire tree structure
            const reSortTree = ( nodes ) => {
                return sortTreeNodes(
                    nodes.map( ( node ) => ( {
                        ...node,
                        contents: node.contents ? reSortTree( node.contents ) : undefined,
                    } ) ),
                );
            };

            return reSortTree( renamedData );
        } );

        // Update selected file if it was renamed
        if ( selectedFile?._id === nodeId ) {
            // setSelectedFile( { ...selectedFile, title: newName } );
            handleUpdateSelectedNode( 'title', newName );
        }
    };

    const handleNodeDelete = ( nodeId ) => {
        setTreeData( ( prevData ) => {
            const deleteNode = ( nodes ) => {
                return nodes.filter( ( node ) => {
                    if ( node._id === nodeId ) {
                        return false;
                    }
                    if ( node.contents ) {
                        node.contents = deleteNode( node.contents );
                    }
                    return true;
                } );
            };

            return deleteNode( prevData );
        } );

        // Clear selected file if it was deleted
        if ( selectedFile?._id === nodeId ) {
            // setSelectedFile( null );
            setNotesActiveNode( null );
            setEditorOpen( false );
        }
    };

    // // Handle folder navigation
    // const navigateToFolder = ( folder ) => {
    //     if ( folder.itemType === "folder" ) {
    //         setCurrentPath( [ ...folder.parentId, folder.title ] );
    //         setSelectedFiles( [] );
    //     }
    // };

    // // Handle breadcrumb navigation
    // const navigateToBreadcrumb = ( index ) => {
    //     setCurrentPath( currentPath.slice( 0, index + 1 ) );
    //     setSelectedFiles( [] );
    // };

    const treeDataAtPath = useMemo( () => {
        if ( currentPath ) {
            // const nodeAtPath = getNodeAtPath( treeData, currentPath );
            const pathNode = findNodeById( treeData, currentPath[ currentPath.length - 1 ]?.value );
            // console.log( 'FileExplorerView :: treeDataAtPath :: treeData = ', treeData, ' :: ', 'currentPath = ', currentPath, " :: ", "pathNode = ", pathNode );

            if (
                pathNode?.hasOwnProperty( 'contents' )
                && pathNode?.contents
                && Array.isArray( pathNode?.contents )
                && pathNode?.contents.length > 0
            ) {
                return pathNode?.contents;
            }
            return [];
            // if ( pathNode?.itemType === 'file' ) {
            //     return [];
            // }
            // else if ( pathNode?.itemType === 'folder' ) {
            //     return [];
            // }
            // else {
            //     return [];
            // }
        }
        return [];

    }, [ currentPath, data, selectedNodeId ] );

    const buildFileExplorerContent = () => {
        if ( editorOpen && notesActiveNode?.itemType === 'file' ) {
            return (
                <div className={ `relative overflow-auto flex-grow h-full w-full border` }>

                    <Button
                        key={ `notes-file-explorer-editor-view` }
                        className={ `px-1 py-1 ` }
                        size={ `icon` }
                        variant={ `ghost` }
                        onClick={ () => {
                            // console.log( "FileExplorerView :: Back button from editor clicked." );
                            setEditorOpen( false );
                            // setSelectedFile( null );
                            setNotesActiveNode( null );
                        } }
                    >
                        <ArrowLeftCircle className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
                    </Button>
                    {/* { notesActiveNode && notesActiveNode?.hasOwnProperty( 'content' ) && (
                        <NotesEditor
                            // onContentUpdate={ ( value ) => {
                            //     if ( value && value !== notesActiveNode?.content ) {
                            //         onNodeUpdate( notesActiveNode?._id || notesActiveNode?.id, { content: value } );
                            //     }
                            // } }
                            // onContentClear={ () => {
                            //     if ( notesActiveNode && notesActiveNode?.hasOwnProperty( 'content' ) && notesActiveNode?.itemType === 'file' ) {
                            //         onNodeUpdate( notesActiveNode?._id || notesActiveNode?.id || { content: "" } );
                            //     }
                            // } }

                            activeNode={ notesActiveNode }
                            setActiveNode={ setNotesActiveNode }
                            content={ notesActiveNode?.content || "No content found?" }
                            onContentUpdate={ ( data ) => {
                                // console.log( "FileExplorerView :: NotesEditor :: onContentUpdate :: data = ", data );
                                // Update local.
                                setNotesActiveNode( { ...notesActiveNode, content: data } );

                                // Update server.
                                onNodeUpdate( { ...notesActiveNode, content: data }, notesActiveNode?.itemType );
                            } }
                            onContentClear={ () => {
                                // console.log( "FileExplorerView :: NotesEditor :: onContentClear :: notesActiveNode.content = ", notesActiveNode?.content );
                                // Update local.
                                setNotesActiveNode( { ...notesActiveNode, content: "" } );

                                // Update server.
                                onNodeUpdate( { ...notesActiveNode, content: "" }, notesActiveNode?.itemType );
                            } }
                        />
                    ) } */}
                </div>

            );
        }
        else {
            return (
                <FileExplorer
                    data={ notesActiveNode?.contents || treeData?.contents }
                    fullTree={ treeData || [] }
                    // selectedNodeId={ selectedFile?._id || null }
                    selectedNodeId={ notesActiveNode?._id || null }
                    onNodeOpen={ handleNodeOpen }
                    onNodeSelect={ handleNodeSelect }
                    // onNodeCreate={ handleNodeCreate }
                    onNodeCreate={ onNodeCreate }
                    // onNodeUpdate={ handleNodeUpdate }
                    onNodeUpdate={ onNodeUpdate }
                    onNodeRename={ handleNodeRename }
                    onNodeDelete={ handleNodeDelete }
                    onPathUpdate={ handlePathUpdate }
                    path={ currentPath }
                    setPath={ setCurrentPath }
                />
            );
        }
    };

    const buildFileDetails = ( file ) => {
        return (
            <div className="gap-2 w-full overflow-hidden">
                <h3 className="text-lg font-semibold">File Details</h3>

                <Separator />

                { file ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm">{ file?.title }</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Type:</span>
                            <span className="text-sm capitalize">{ file?.itemType }</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Subtype:</span>
                            <span className="text-sm capitalize">{ file?.subType }</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">ID:</span>
                            <span className="text-sm font-mono text-muted-foreground">{ file?._id }</span>
                        </div>
                        { file?.parentId && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Parent ID:</span>
                                <span className="text-sm font-mono text-muted-foreground">{ file?.parentId }</span>
                            </div>
                        ) }
                        { file?.itemType === "folder" && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Contents:</span>
                                <span className="text-sm">{ file?.contents?.length || 0 } items</span>
                            </div>
                        ) }
                        { file?.itemType === "file" && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Content:</span>
                                <p className="text-sm">{ file?.content || "" }</p>
                            </div>
                        ) }
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Select a file or folder to view details</p>
                        <p className="text-sm mt-2">Right-click items for context menu options</p>
                    </div>
                ) }
            </div>
        );
    };

    useEffect( () => {
        setTreeData( utils.val.isValidArray( notesDirectoryTree, true ) ? applySortingToTree( notesDirectoryTree ) : [] );
    }, [ notesDirectoryTree ] );

    return (
        <ResizablePanelGroup
            direction="horizontal"
        >
            <ResizablePanel
                defaultSize={ 25 }
                // className={ `relative !overflow-hidden w-full h-full min-h-full max-h-full !px-1` }
                // className={ `flex w-full items-start justify-center !p-1 overflow-hidden h-full min-h-full max-h-full !h-[100vh] !min-h-[100vh] !max-h-[100%] ` }
                className={ `!h-[100%] !min-h-[100%] !max-h-[100%] w-full !items-stretch !justify-start rounded-xl relative flex flex-col !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] ` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem`,
                } }
            >
                <div className={ `h-full flex-grow !px-2 items-center justify-start text-left relative` }>
                    <FileExplorerTree
                        data={ treeData || [] }
                        fullTree={ treeData || [] }
                        selectedNodeId={ notesActiveNode?._id || null }
                        onNodeOpen={ handleNodeOpen }
                        onNodeSelect={ handleNodeSelect }
                        // onNodeCreate={ handleNodeCreate }
                        onNodeCreate={ onNodeCreate }
                        onNodeUpdate={ onNodeUpdate }
                        onNodeRename={ handleNodeRename }
                        onNodeDelete={ handleNodeDelete }
                        onPathUpdate={ handlePathUpdate }
                        path={ currentPath }
                        setPath={ setCurrentPath }
                    />
                </div>
                {/* <div className={ `bottom-0 left-0 right-0 !overflow-hidden absolute bg-background m-4` }>
                    { buildFileDetails( selectedFile ) }
                </div> */}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={ 75 }
                // className={ `flex w-full items-start justify-center !p-1 overflow-hidden h-full min-h-full max-h-full !h-[90vh] !min-h-[90vh] !max-h-[100%] ` }
                // className={ `!h-[100%] !min-h-[100%] !max-h-[100%] w-full !items-stretch !justify-start rounded-xl !px-2` }
                className={ `!h-[100%] !min-h-[100%] !max-h-[100%] w-full !items-stretch !justify-start rounded-xl relative flex flex-col !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] w-full !items-stretch !justify-start rounded-xl !px-2 overflow-hidden` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem`,
                } }
            >
                <div className={ `flex flex-col w-full flex-grow h-full overflow-hidden` }>
                    <div className={ `relative overflow-auto flex-grow h-full overflow-hidden` }>
                        { buildFileExplorerContent() }
                    </div>
                    { notesActiveNode && ( <div className={ `relative flex-shrink h-min` }>
                        { buildFileDetails( notesActiveNode ) }
                    </div> ) }
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

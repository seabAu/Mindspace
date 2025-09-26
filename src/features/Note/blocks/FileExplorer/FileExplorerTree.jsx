// import { FileTree, itemType FileTreeNode } from "./components/file-tree"

import { useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    File,
    Folder,
    FolderOpen,
    Edit,
    Trash2,
    FileText,
    FolderPlus,
    X,
    Check,
    MinusIcon,
    PlusIcon,
    PlusCircleIcon,
    MinusCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import * as utils from 'akashatools';
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import { arrSafeTernary } from "@/lib/utilities/data";
import useNotesStore from "@/store/note.store";

// Add sorting utility function
const sortTreeNodes = ( nodes ) => {
    return [ ...nodes ].sort( ( a, b ) => {
        // Folders always come before files
        if ( a.itemType === "folder" && b.itemType === "file" ) return -1;
        if ( a.itemType === "file" && b.itemType === "folder" ) return 1;

        // Within the same itemType, sort alphabetically (case-insensitive)
        return a?.title?.toLowerCase().localeCompare( b?.title?.toLowerCase() );
    } );
};

// Apply initial sorting to the sample data
const applySortingToTree = ( nodes ) => {
    return sortTreeNodes(
        nodes.map( ( node ) => ( {
            ...node,
            contents: node.contents ? applySortingToTree( node.contents ) : undefined,
        } ) ),
    );
};

// const sortedInitialData = applySortingToTree( initialData );

export default function FileExplorerTree ( {
    data,
    fullTree = [],
    selectedNodeId,
    onNodeOpen = () => { },
    onNodeSelect = () => { },
    onNodeCreate = () => { },
    onNodeUpdate = () => { },
    onNodeRename = () => { },
    onNodeDelete = () => { },
    onPathUpdate = () => { },
    path, setPath,
} ) {
    const { getNoteById, createNote } = useNotesStore();

    const [ expandAllFolders, setExpandAllFolders ] = useState( false );
    const [ expandedFolders, setExpandedFolders ] = useState( new Set() );
    const [ selectedNode, setSelectedNode ] = useState( selectedNodeId || null );
    const [ hoveredFolder, setHoveredFolder ] = useState( null );
    const [ inlineInput, setInlineInput ] = useState( {
        parentId: null,
        itemType: null,
        title: "",
    } );
    const [ renameState, setRenameState ] = useState( {
        nodeId: null,
        value: "",
    } );

    const currentPath = useMemo( () => ( path ), [ path, selectedNodeId, onPathUpdate ] );

    // Update selected node when prop changes
    useEffect( () => {
        if ( selectedNodeId !== undefined ) {
            setSelectedNode( selectedNodeId );
            // onPathUpdate( path );
        }
    }, [ selectedNodeId ] );

    const toggleFolder = ( parentId ) => {
        setExpandedFolders( ( prev ) => {
            const newSet = new Set( arrSafeTernary( prev ) );
            if ( newSet.has( parentId ) ) {
                newSet.delete( parentId );
            } else {
                newSet.add( parentId );
            }
            return newSet;
        } );
    };

    // const toggleAllFolders = ( mode = true ) => {
    //     sortTreeNodes( node.contents || [] ).map( ( child ) => renderNode( child, depth + 1 ) );
    //     setExpandedFolders( ( prev ) => {
    //         const newSet = new Set( prev );
    //         if ( newSet.has( parentId ) ) {
    //             newSet.delete( parentId );
    //         } else {
    //             newSet.add( parentId );
    //         }
    //         return newSet;
    //     } );
    // };

    const handleNodeClick = ( node ) => {
        // console.log( 'FileExplorer :: handleNodeClick :: node = ', node );
        if ( node.itemType === "folder" ) {
            toggleFolder( node._id );
        }
        if ( onNodeSelect ) onNodeSelect( node );
        // if ( onNodeOpen ) onNodeOpen( node );
    };

    const handleNodeDoubleClick = ( node ) => {
        // console.log( 'FileExplorer :: handleNodeDoubleClick :: node = ', node );
        // handleNodeClick( node );
        if ( onNodeOpen ) onNodeOpen( node );
    };

    const startInlineCreate = ( parentNode, itemType ) => {
        // If creating in a folder, make sure it's expanded
        let parentId = parentNode?._id;
        if ( parentId ) {
            setExpandedFolders( ( prev ) => new Set( [ ...arrSafeTernary( prev ), parentId ] ) );
        }

        let path = [];
        // const parent = getNoteById( parentId );
        if ( parentNode ) {
            path = [
                ... ( parentNode?.path || [] ),
                {
                    value: parentNode?._id,
                    title: parentNode?.title || parentNode?._id,
                }
            ];
        }

        setInlineInput( {
            parentId: parentId,
            itemType: itemType,
            path: path || [],
            title: "",
        } );

        // console.log( "FileExplorerTree :: startInlineCreate :: new note = ", {
        //     parentId: parentId,
        //     itemType: itemType,
        //     path: path || [],
        //     title: "",
        // }, " :: ", "parent = ", parent );
    };

    const confirmInlineCreate = async () => {
        if ( inlineInput.title.trim() && inlineInput.itemType ) {
            if ( onNodeCreate ) {
                // onNodeCreate?.(
                //     inlineInput.parentId,
                //     inlineInput.title.trim(),
                //     inlineInput.itemType
                // );
                // console.log( "FileExplorerTree.jsx :: confirmInlineCreate :: inlineInput = ", inlineInput );
                let result = await onNodeCreate( inlineInput, inlineInput.itemType );
            }
            setInlineInput( { parentId: null, itemType: null, title: "" } );
        }
    };

    const cancelInlineCreate = () => {
        setInlineInput( { parentId: null, itemType: null, title: "" } );
    };

    const startRename = ( nodeId, currentName ) => {
        setRenameState( { nodeId, title: currentName } );
    };

    const confirmRename = () => {
        if ( renameState.title.trim() && renameState.nodeId ) {
            if ( onNodeRename ) onNodeRename?.( renameState.nodeId, renameState.title.trim() );
            setRenameState( { nodeId: null, title: "" } );
        }
    };

    const cancelRename = () => {
        setRenameState( { nodeId: null, title: "" } );
    };

    const handleDelete = ( nodeId ) => {
        if ( onNodeDelete ) onNodeDelete?.( nodeId );
    };

    const renderInlineInput = ( parentId, depth ) => {
        if ( inlineInput.parentId !== parentId || !inlineInput.itemType ) return null;

        return (
            <div className="flex items-center gap-1 py-1 px-2 text-sm" style={ { paddingLeft: `${ depth * 12 + 20 }px` } }>
                <div className="h-4 w-4" />
                { inlineInput.itemType === "folder" ? (
                    <Folder className="h-4 w-4 text-blue-500" />
                ) : (
                    <File className="h-4 w-4 text-gray-500" />
                ) }
                <Input
                    title={ inlineInput.title }
                    onChange={ ( e ) => {
                        // console.log( "FileExplorerTree :: title onChange for new note :: title = ", e.target.value );
                        setInlineInput( ( prev ) => ( { ...arrSafeTernary( prev ), title: e.target.value } ) );
                    } }
                    onKeyDown={ ( e ) => {
                        if ( e.key === "Enter" ) {
                            confirmInlineCreate();
                        } else if ( e.key === "Escape" ) {
                            cancelInlineCreate();
                        }
                    } }
                    // onBlur={ cancelInlineCreate }
                    className="h-6 text-xs border-none shadow-none p-0 focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={ `New ${ inlineInput.itemType }` }
                    autoFocus
                />
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={ () => ( confirmInlineCreate() ) }>
                    <Check className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={ cancelInlineCreate }>
                    <X className="h-3 w-3" />
                </Button>
            </div>
        );
    };

    const renderNode = ( node, depth = 0 ) => {
        // console.log( "FileExplorerTree :: renderNode :: node = ", node, " :: ", "depth = ", depth );
        const isExpanded = expandedFolders.has( node._id );
        const isSelected = selectedNode === node._id;
        const hasChildren = node.contents && node.contents.length > 0;
        const isHovered = hoveredFolder === node._id;
        const isRenaming = renameState.nodeId === node._id;

        return (
            <div /* key={ `explorer-tree-node-${ node._id }-${ node?.itemType }` } */>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            className={ cn(
                                "flex items-center gap-1 py-1 px-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm group",
                                isSelected && "bg-primary/10 text-primary border-l-2 border-primary",
                                !isSelected && "hover:bg-accent hover:text-accent-foreground",
                                "select-none relative transition-colors duration-150",
                            ) }
                            style={ { paddingLeft: `${ depth * 12 + 8 }px` } }
                            onClick={ () => !isRenaming && handleNodeClick( node ) }
                            onDoubleClick={ () => !isRenaming && handleNodeDoubleClick( node ) }

                            onMouseEnter={ () => node.itemType === "folder" && setHoveredFolder( node._id ) }
                            onMouseLeave={ () => setHoveredFolder( null ) }
                        >
                            { node.itemType === "folder" ? (
                                <>
                                    <Collapsible open={ isExpanded }>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                                { hasChildren || inlineInput.parentId === node._id ? (
                                                    isExpanded ? (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronRight className="h-3 w-3" />
                                                    )
                                                ) : (
                                                    <div className="h-3 w-3" />
                                                ) }
                                            </Button>
                                        </CollapsibleTrigger>
                                    </Collapsible>
                                    { isExpanded ? (
                                        <FolderOpen className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <Folder className="h-4 w-4 text-blue-500" />
                                    ) }
                                </>
                            ) : (
                                <>
                                    <div className="h-4 w-4" />
                                    <File className="h-4 w-4 text-gray-500" />
                                </>
                            ) }

                            { isRenaming ? (
                                <Input
                                    value={ renameState.value }
                                    onChange={ ( e ) => setRenameState( ( prev ) => ( { ...prev, value: e.target.value } ) ) }
                                    onKeyDown={ ( e ) => {
                                        if ( e.key === "Enter" ) {
                                            confirmRename();
                                        } else if ( e.key === "Escape" ) {
                                            cancelRename();
                                        }
                                    } }
                                    onBlur={ cancelRename }
                                    className="h-6 text-xs border-none shadow-none p-0 focus-visible:ring-1 focus-visible:ring-ring flex-1"
                                    autoFocus
                                />
                            ) : (
                                <span className="truncate flex-1">{ node.title }</span>
                            ) }

                            {/* Hover actions for folders */ }
                            { node.itemType === "folder" && isHovered && !isRenaming && (
                                <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0"
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            startInlineCreate( node, "file" );
                                        } }
                                        title="New File"
                                    >
                                        <FileText className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0"
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            startInlineCreate( node, "folder" );
                                        } }
                                        title="New Folder"
                                    >
                                        <FolderPlus className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) }
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        { node.itemType === "folder" && (
                            <>
                                <ContextMenuItem onClick={ () => startInlineCreate( node, "file" ) }>
                                    <FileText className="h-4 w-4 mr-2" />
                                    New File
                                </ContextMenuItem>
                                <ContextMenuItem onClick={ () => startInlineCreate( node, "folder" ) }>
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    New Folder
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                            </>
                        ) }
                        <ContextMenuItem onClick={ () => startRename( node._id, node.title ) }>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={ () => handleDelete( node._id ) } className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                {/* Inline input for creating new items */ }
                { node.itemType === "folder" && renderInlineInput( node._id, depth ) }

                {/* Children */ }
                { node.itemType === "folder" && ( hasChildren || inlineInput.parentId === node._id ) && (
                    <Collapsible open={ isExpanded || expandAllFolders }>
                        <CollapsibleContent>
                            { sortTreeNodes( node.contents || [] ).map( ( child ) => renderNode( child, depth + 1 ) ) }
                        </CollapsibleContent>
                    </Collapsible>
                ) }
            </div>
        );
    };

    return (
        <div className={ `overflow-y-hidden relative w-full h-full min-h-full max-h-full !px-1 border rounded-xl` }>
            <div
                className={ `pr-1 !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden pb-24` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT * 2 ) }rem`,
                } }>
                {/* Header with create buttons */ }
                <div className="flex items-center justify-between px-2 border-b">
                    <span className="text-sm font-medium">Explorer</span>
                    <div className="flex gap-1 justify-center items-center h-full gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 aspect-square p-0 items-center justify-center self-center"
                            onClick={ () => setExpandAllFolders( false ) }
                            title="Collapse All"
                        >
                            { !expandAllFolders ? ( <MinusIcon className="h-3 w-3" /> ) : ( <MinusCircleIcon className="h-3 w-3" /> ) }
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 aspect-square p-0 items-center justify-center self-center"
                            onClick={ () => setExpandAllFolders( true ) }
                            title="Expand All"
                        >
                            { expandAllFolders ? ( <PlusIcon className="h-3 w-3" /> ) : ( <PlusCircleIcon className="h-3 w-3" /> ) }
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 aspect-square p-0 items-center justify-center self-center"
                            onClick={ () => {
                                let parentNode = currentPath?.[ currentPath?.length - 1 ];
                                if ( parentNode ) startInlineCreate( parentNode, "file" );
                                else startInlineCreate( { _id: null, title: "Root", parentId: null, path: [] }, "file" );
                            } }
                            title="New File"
                        >
                            <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 aspect-square p-0 items-center justify-center self-center"
                            onClick={ () => {
                                let parentNode = currentPath?.[ currentPath?.length - 1 ];
                                if ( parentNode ) startInlineCreate( parentNode, "folder" );
                                else startInlineCreate( { _id: null, parentId: null, path: [] }, "folder" );
                            } }
                            title="New Folder"
                        >
                            <FolderPlus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* File tree */ }
                <div className={ `!min-h-full !max-h-full !h-full overflow-auto` }>
                    {/* Root level inline input */ }
                    { renderInlineInput( null, 0 ) }
                    { sortTreeNodes( data ).map( ( node ) => renderNode( node ) ) }
                </div>
            </div>
        </div>
    );
}

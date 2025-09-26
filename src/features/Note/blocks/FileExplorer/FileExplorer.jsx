
import { useCallback, useMemo, useState } from "react";
import {
    ChevronRight,
    FileText,
    Folder,
    Grid,
    ImageIcon,
    List,
    MoreVertical,
    Plus,
    Search,
    Upload,
    File,
    FileIcon as FilePdf,
    FileImage,
    FileCode,
    Download,
    Trash2,
    Edit,
    Move,
    Eye,
    X,
    FolderPlusIcon,
    CopyIcon,
    FileQuestion,
    Slash,
    FilePlusIcon,
    ArrowBigLeftIcon,
} from "lucide-react";
import { format, isDate } from "date-fns";
import * as utils from 'akashatools';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { getNodeAtPath } from "@/lib/utilities/note";
import { arrSafeTernary, isArrSafe, isInvalid } from "@/lib/utilities/data";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";
import useNotesStore from "@/store/note.store";
import { NotesEditor } from "../Editor/NotesEditor";

/* // Types
itemType FileType = "folder" | "pdf" | "image" | "txt" | "code" | "other";

interface FileItem {
    id;
    name;
    itemType;
    size;
    items?;
    updatedAt;
    parentId[];
} */


// Helper function to format dates
const formatDate = ( date ) => {
    const now = new Date();
    const yesterday = new Date( now );
    yesterday.setDate( yesterday.getDate() - 1 );

    if ( isDate( date ) && new Date( date ).toDateString() === now.toDateString() ) {
        return "Today";
    } else if ( new Date( date ).toDateString() === yesterday.toDateString() ) {
        return "Yesterday";
    } else {
        return format( new Date( date ), "MMM d, yyyy" );
    }
};

// Helper function to get file icon
const getFileIcon = ( itemType, subType ) => {
    switch ( itemType ) {
        case "folder":
            return <Folder className="h-5 w-5 text-blue-500" />;
        case "file":
            switch ( subType ) {
                case "pdf":
                    return <FilePdf className="h-5 w-5 text-red-500" />;
                case "image":
                    return <FileImage className="h-5 w-5 text-green-500" />;
                case "txt":
                    return <FileText className="h-5 w-5 text-yellow-500" />;
                case "code":
                    return <FileCode className="h-5 w-5 text-purple-500" />;
                default:
                    return <File className="h-5 w-5 text-gray-500" />;
            }
        default:
            return <File className="h-5 w-5 text-gray-500" />;
    }
};

export default function FileExplorer ( {
    data,
    fullTree = [],
    selectedNodeId = null,
    onNodeOpen = () => { },
    onNodeSelect = () => { },
    onNodeCreate = () => { },
    onNodeUpdate = () => { },
    onNodeRename = () => { },
    onNodeDelete = () => { },
    onPathUpdate = () => { },
    path = [ "Home" ], setPath,
} ) {
    const {
        getNoteById,
        createNote,
        notesActiveNode, setNotesActiveNode,
    } = useNotesStore();

    const [ files, setFiles ] = useState( data );
    const [ selectedFiles, setSelectedFiles ] = useState( [] );
    const [ viewMode, setViewMode ] = useState( "list" );
    // const [ currentPath, setCurrentPath ] = useState( path );
    const [ searchQuery, setSearchQuery ] = useState( "" );
    const [ editorOpen, setEditorOpen ] = useState( false );

    // Modals state
    const [ uploadModalOpen, setUploadModalOpen ] = useState( false );

    const [ newFolderModalOpen, setNewFolderModalOpen ] = useState( false );
    const [ newFileModalOpen, setNewFileModalOpen ] = useState( false );
    const [ renameModalOpen, setRenameModalOpen ] = useState( false );
    const [ deleteModalOpen, setDeleteModalOpen ] = useState( false );
    const [ moveModalOpen, setMoveModalOpen ] = useState( false );
    const [ previewModalOpen, setPreviewModalOpen ] = useState( false );
    const [ activeFile, setActiveFile ] = useState( null );

    // Upload progress simulation
    const [ uploadProgress, setUploadProgress ] = useState( 0 );
    const [ uploadingFile, setUploadingFile ] = useState( "" );

    // New folder name
    const [ newFolderName, setNewFolderName ] = useState( "" );
    const [ newFileName, setNewFileName ] = useState( "" );

    const currentPath = useMemo( () => ( path ), [ path, selectedNodeId, onPathUpdate ] );


    // Helper function to find a node by ID
    const findNodeById = ( nodes, id ) => {
        for ( const node of nodes ) {
            if ( node?._id === id ) return node;
            if ( node?.contents ) {
                const found = findNodeById( node?.contents, id );
                if ( found ) return found;
            }
        }
        return null;
    };

    // Filter files based on current parentId and search query
    const getFilteredFiles = useCallback(
        () => {
            let fileList = data;
            if ( Array.isArray( fileList ) && fileList.length > 0 ) {
                fileList = fileList[ 0 ];
            }

            // fileList = findNodeById( data, currentPath?.[ currentPath.length - 1 ]?.value );

            if ( fileList?.hasOwnProperty( 'contents' ) && Array.isArray( fileList?.contents ) && fileList?.contents?.length > 0 ) {
                fileList = fileList.contents;
            }
            // console.log( "FileExplorer :: filteredFiles :: data = ", data, " :: ", "fileList = ", fileList );


            if ( Array.isArray( fileList ) && fileList.length > 0 ) {
                return (
                    fileList?.filter( ( file ) => {
                        // const pathMatch = JSON.stringify( file.parentId ) === JSON.stringify( currentPath );
                        const pathMatch = file.path?.join( '/' ) === currentPath?.slice( 0, currentPath?.length - 1 )?.join( '/' );
                        const searchMatch = searchQuery === "" || file.title.toLowerCase().includes( searchQuery.toLowerCase() );
                        return pathMatch && searchMatch;
                    } )
                );
            }
            else {
                return [];
            }
        }
        , [ path, currentPath, data, files ]
    );

    const filteredFiles = useMemo( () => ( getFilteredFiles() ), [ path, currentPath, data, files ] );

    // console.log( "FileExplorer :: data = ", data, " :: ", "files = ", files, " :: ", "data = ", data );


    // Handle file/folder selection
    const toggleSelection = ( id ) => {
        setSelectedFiles( ( prev ) => ( prev.includes( id ) ? prev.filter( ( fileId ) => fileId !== id ) : [ ...prev, id ] ) );
    };

    // Handle select all
    const toggleSelectAll = () => {
        if ( selectedFiles.length === filteredFiles.length ) {
            setSelectedFiles( [] );
        } else {
            setSelectedFiles( filteredFiles.map( ( file ) => file._id ) );
        }
    };

    const handleNodeClick = ( node ) => {
        // Handle selecting the item.
        // console.log( 'FileExplorer :: handleNodeClick :: node = ', node );

        toggleSelection( node?._id );
        if ( onNodeSelect ) onNodeSelect( node );
        // if ( node.itemType === "folder" ) {
        //     setActiveFile( node );
        //     // setSelectedFiles( [] );
        // }
        else if ( node.itemType === 'file' ) {

        }
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeDoubleClick = ( node ) => {
        // Handle opening the item.
        // console.log( 'FileExplorer :: handleNodeDoubleClick :: node = ', node );

        // if ( node.itemType === "folder" ) {
        setActiveFile( node );
        setSelectedFiles( [] );
        if ( onNodeOpen ) onNodeOpen( node );
        if ( onNodeSelect ) onNodeSelect( node );
        // }
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    const handleNodeDoubleClick1 = ( node ) => {
        // Handle opening the item.
        // console.log( 'FileExplorer :: handleNodeDoubleClick :: node = ', node );

        // if ( node.itemType === "folder" ) {
        // setActiveFile( node );
        setSelectedFiles( [] );
        if ( node?.itemType === 'file' ) setEditorOpen( true );
        else if ( node?.itemType === 'folder' ) setEditorOpen( false );
        else if ( node?.itemType === 'note' ) setEditorOpen( true );
        else if ( node?.itemType === 'asset' ) setEditorOpen( false );
        else setEditorOpen( false );
        if ( onNodeOpen ) onNodeOpen( node );
        // if ( onNodeSelect ) onNodeSelect( node );
        // }
        if ( onPathUpdate ) onPathUpdate( node?.path );
    };

    /* const handleNodeClick = ( node ) => {
        // console.log( 'FileExplorer :: handleNodeClick :: node = ', node );
        
        if ( node.itemType === "folder" ) {
            toggleFolder( node._id );
        }
        if ( onNodeSelect ) onNodeSelect( node );
    };

    const handleNodeDoubleClick = ( node ) => {
        handleNodeClick( node );
        if ( onNodeOpen ) onNodeOpen( node );
    }; */

    // Handle folder navigation
    const navigateToFolder = ( folder ) => {
        if ( folder.itemType === "folder" ) {
            let newPath = [ ...folder.path ];
            // setCurrentPath( newPath );
            if ( onPathUpdate ) onPathUpdate( newPath );
            setSelectedFiles( [] );
        }
    };

    // Handle breadcrumb navigation
    const navigateToBreadcrumb = ( id ) => {
        // setCurrentPath( currentPath.slice( 0, index + 1 ) );
        let index = currentPath.findIndex( ( pathToken ) => ( pathToken?.value === id ) );
        let node = findNodeById( fullTree, id );
        // if ( currentPath.includes( id ) ) {
        // console.log( 'FileExplorer :: handlePathUpdate -> navigateToBreadcrumb :: id = ', id, ' :: ', 'index = ', index, ' :: ', 'currentPath = ', currentPath, ' :: ', 'fullTree = ', fullTree, ' :: ', 'node = ', node );

        // if ( utils.val.isDefined( index ) ) {
        //     // handleNodeClick( node );
        //     if ( onNodeOpen ) onNodeOpen( { ...node, path: [ ...( node?.path || [] ), { value: node?.path, title: node?.title } ] } );
        //     // if ( node && node?.path && Array.isArray( node?.path ) ) {
        //     //     if ( onPathUpdate ) onPathUpdate( ...( node?.path || [] ), { value: node?.path, title: node?.title } );
        //     // }

        //     // let newPath = currentPath.slice( 0, index + 1 );
        //     // setCurrentPath( newPath );
        //     // if ( onPathUpdate ) onPathUpdate( newPath );

        //     // TEST :: Get node at this location.
        //     // const nodeAtPath = getNodeAtPath( data, newPath );

        //     setSelectedFiles( [] );
        // }
        if ( index && index > 0 ) {
            let newPath = currentPath.slice( 0, index + 1 );
            // setCurrentPath( newPath );
            if ( onPathUpdate ) onPathUpdate( newPath );
            // if ( onNodeOpen ) onNodeOpen( { ...node, path: [ ...( node?.path || [] ), { value: node?.path, title: node?.title } ] } );
            if ( onNodeOpen ) onNodeOpen( node );

            // TEST :: Get node at this location.
            // const nodeAtPath = getNodeAtPath( data, newPath );

            setSelectedFiles( [] );
        }
    };

    const handleGoBack = ( path ) => {
        // If applicable, go up 1 level in the path array. 
        if ( path && path?.length > 0 ) {
            // let newPath = path?.slice( 0, path?.length - 1 );
            let newPath = [ ...path ];
            newPath.pop();

            let pathHeadId = newPath?.[ newPath.length - 1 ]?.value || newPath?.[ newPath.length - 1 ]?._id;
            // Use pathHeadId to get the element at this endpoint. Pass that node's path parameter into setNotesActiveNode.
            if ( pathHeadId ) {
                let newNode = findNodeById( fullTree, pathHeadId );
                if ( newNode ) {
                    setNotesActiveNode( newNode );
                }
            }

            // navigateToBreadcrumb( pathHeadId );
            onPathUpdate( newPath );
            setSelectedFiles( [] );
            setActiveFile( null );
        }
    };

    // Handle file actions
    const handleFileAction = ( action, file ) => {
        // setActiveFile( file );

        switch ( action ) {

            case "open":
                handleNodeDoubleClick( file );
                // if ( file.itemType === "folder" ) {
                //     // navigateToFolder( file );
                // } else {
                //     // setPreviewModalOpen( true );
                // }
                break;
            case "preview":
                setPreviewModalOpen( true );
                setActiveFile( node );
                if ( file.itemType === "folder" ) {
                    // navigateToFolder( file );
                    handleNodeDoubleClick( file );
                } else {
                    setPreviewModalOpen( true );
                }
                break;
            case "select":
                handleNodeClick( file );
                break;
            case "rename":
                setNewFileName( file.title );
                setRenameModalOpen( true );
                break;
            case "move":
                setMoveModalOpen( true );
                break;
            case "delete":
                setDeleteModalOpen( true );
                break;
            case "preview":
                setPreviewModalOpen( true );
                break;
            case "download:file":
                break;
            case "download:zip":
                setPreviewModalOpen( true );
                break;
            default:
                break;
        }
    };

    // Handle bulk actions
    const handleBulkAction = ( action ) => {
        switch ( action ) {
            case "delete":
                setDeleteModalOpen( true );
                break;
            case "move":
                setMoveModalOpen( true );
                break;
            default:
                break;
        }
    };

    // Simulate file upload
    const simulateUpload = ( fileName ) => {
        setUploadingFile( fileName );
        setUploadProgress( 0 );

        const interval = setInterval( () => {
            setUploadProgress( ( prev ) => {
                if ( prev >= 100 ) {
                    clearInterval( interval );

                    createNewFile( {
                        title: fileName,
                        itemType: 'file',
                        subType: 'txt'
                    } );
                    setUploadModalOpen( false );
                    setUploadingFile( "" );
                    return 0;
                }
                return prev + 10;
            } );
        }, 300 );
    };

    const getParentIdOfCurrentPath = ( path ) => {
        return ( path && Array.isArray( path ) ? path?.[ path?.length - 1 ]?.value || null : null );
    };

    const createNewFile = async ( fileData ) => {

        if ( fileData?.title?.trim() === "" ) return;

        const parentId = getParentIdOfCurrentPath( currentPath );

        // Add the new file to the list
        let newFile = {
            // id: Date.now().toString(),
            ...fileData,
            title: fileData?.title || 'New Note',
            // parentId: currentPath,
            parentId: parentId,
        };

        // Run newFile through the createNode state function to get only valid data out. 
        newFile = createNote( newFile, parentId );

        // Send to server. 
        let result = await onNodeCreate( newFile, newFile?.itemType );
        if ( result ) {
            // console.log( "FileExplorer.exe :: createNewFile :: newFile = ", newFile, " :: ", "result after onNodeCreate = ", result );

        }

        setFiles( ( prev ) => [ ...( arrSafeTernary( prev, [] ) ), newFile ] );
        setNewFileName( "" );
        setNewFileModalOpen( false );
    };

    // Create new folder
    const createNewFolder = async ( folderData ) => {
        if ( folderData?.title?.trim() === "" ) return;

        const parentId = currentPath?.[ currentPath?.length - 1 ] || null;
        let newFolder = {
            // id: Date.now().toString(),
            title: folderData?.title,
            itemType: "folder",
            subType: "folder",
            size: "",
            contents: [],
            updatedAt: new Date(),
            parentId: parentId,
            path: currentPath,
            ...folderData
        };

        // Run newFile through the createNode state function to get only valid data out. 
        newFolder = createNote( newFolder, parentId );

        // Call API endpoint handler.
        let result = await onNodeCreate( newFolder, 'folder' );
        // console.log( "FileExplorer.exe :: createNewFolder :: newFolder = ", newFolder, " :: ", "result after onNodeCreate = ", result );

        if ( result ) {
            // Update local state
            setFiles( ( prev ) => [ ...arrSafeTernary( prev, [] ), result ] );
        }

        setNewFolderName( "" );
        setNewFolderModalOpen( false );
    };

    // Rename file/folder
    const renameFile = async () => {
        if ( !activeFile || newFileName.trim() === "" ) return;

        // Call API endpoint handler.
        let result = await onNode( newFolder, 'folder' );
        if ( result ) {
            // Update local state
            setFiles( ( prev ) => arrSafeTernary( prev, [] ).map( ( file ) => ( file._id === activeFile._id ? { ...file, title: newFileName } : file ) ) );
        }

        setRenameModalOpen( false );
        setActiveFile( null );
    };

    // Delete file/folder
    const deleteFiles = () => {
        if ( selectedFiles.length > 0 ) {
            setFiles( ( prev ) => prev.filter( ( file ) => !selectedFiles.includes( file._id ) ) );
            setSelectedFiles( [] );
        } else if ( activeFile ) {
            setFiles( ( prev ) => prev.filter( ( file ) => file._id !== activeFile._id ) );
            setActiveFile( null );
        }

        setDeleteModalOpen( false );
    };

    const buildBreadcrumbs = ( path ) => {
        if ( path && utils.val.isValidArray( path, true ) ) {

            return (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    { path?.map( ( pathToken, index ) => (
                        <div key={ index } className="flex items-center">
                            { index > 0 && <Slash className={ `size-4 aspect-square p-0` } /> }
                            <button
                                // onClick={ () => navigateToBreadcrumb( index ) }
                                onClick={ () => navigateToBreadcrumb( pathToken?.value ) }
                                className={ `hover:text-primary ${ index === path.length - 1 ? "font-medium text-primary" : "" }` }
                            >
                                { pathToken?.title || caseCamelToSentence( pathToken?.value ) }
                            </button>
                        </div>
                    ) ) }
                </div>
            );
        }
        else {
            return (
                <Slash className={ `size-4 aspect-square p-0` } />
            );
        }
    };

    const buildEmptyExplorerContentArea = () => {
        // To reduce redundant code.
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3">
                    <Folder className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No files found</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                    { searchQuery
                        ? `No results found for "${ searchQuery }". Try a different search term.`
                        : "This folder is empty. Upload a file or create a new folder." }
                </p>
                <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" onClick={ () => setNewFolderModalOpen( true ) }>
                        <Plus className="size-4 aspect-square" />
                        New Folder
                    </Button>
                    <Button size="sm" onClick={ () => setUploadModalOpen( true ) }>
                        <Upload className="size-4 aspect-square" />
                        Upload File
                    </Button>
                </div>
            </div>
        );
    };

    const buildBulkActionsToolbar = ( items ) => {
        return (
            selectedFiles.length > 0 ? (
                <div className="bg-muted/50 flex items-start justify-start">

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={ () => handleBulkAction( "download" ) }>
                            <Download className="size-4 aspect-square" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={ () => handleBulkAction( "move" ) }>
                            <Move className="size-4 aspect-square" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={ () => handleBulkAction( "delete" ) }>
                            <Trash2 className="size-4 aspect-square" />

                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={ () => setSelectedFiles( [] ) }>
                            <X className="size-4 aspect-square" />
                            <span className="sr-only">Deselect</span>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            { selectedFiles.length } item{ selectedFiles.length !== 1 ? "s" : "" } selected
                        </span>
                    </div>
                </div>
            )
                : ( <></> )
        );
    };

    return (
        <Card className="h-full w-full shadow-md">
            <CardHeader className="p-2 border-b">
                <div className="flex flex-col w-full md:flex-row md:items-center md:justify-stretch md:space-y-0 gap-2 flex-wrap">
                    <div className="flex flex-row items-start gap-2 w-full">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {/* New / Upload buttons */ }
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Button variant="outline" size="icon" className={ `rounded-lg` } onClick={ () => handleGoBack( currentPath ) }>
                                    <ArrowBigLeftIcon className="aspect-square size-4" />
                                </Button>

                                <Button variant="outline" size="icon" className={ `rounded-lg` } onClick={ () => setNewFolderModalOpen( true ) }>
                                    <FolderPlusIcon className="aspect-square size-4" />
                                </Button>

                                <Button variant="outline" size="icon" className={ `rounded-lg` } onClick={ () => setNewFileModalOpen( true ) }>
                                    <FilePlusIcon className="aspect-square size-4" />
                                </Button>


                                <Button variant="outline" size="icon" className={ `rounded-lg` } onClick={ () => setUploadModalOpen( true ) }>
                                    <Upload className="aspect-square size-4" />
                                </Button>
                            </div>

                            {/* Tab buttons */ }
                            <div className="hidden md:flex border rounded-md">
                                <Button
                                    variant={ viewMode === "list" ? "secondary" : "ghost" }
                                    size="icon"
                                    className="rounded-r-none"
                                    onClick={ () => setViewMode( "list" ) }
                                >
                                    <List className="size-4 aspect-square" />
                                    <span className="sr-only">List view</span>
                                </Button>
                                <Button
                                    variant={ viewMode === "grid" ? "secondary" : "ghost" }
                                    size="icon"
                                    className="rounded-l-none"
                                    onClick={ () => setViewMode( "grid" ) }
                                >
                                    <Grid className="size-4 aspect-square" />
                                    <span className="sr-only">Grid view</span>
                                </Button>
                            </div>
                        </div>
                        {/* Search Input */ }
                        <div className="relative items-center space-x-2 text-sm w-full md:w-auto flex-grow">
                            <Search className="absolute left-2 top-3 size-4 aspect-square text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search files..."
                                className="self-center w-full !m-0 pl-8 md:max-w-[200px] lg:max-w-[300px]"
                                value={ searchQuery }
                                onChange={ ( e ) => setSearchQuery( e.target.value ) }
                            />
                        </div>
                        { buildBulkActionsToolbar( selectedFiles ) }

                    </div>

                    {/* Breadcrumbs */ }
                    { currentPath && buildBreadcrumbs( currentPath ) }

                </div>
            </CardHeader>

            { notesActiveNode && notesActiveNode?.itemType === 'file' && notesActiveNode?.hasOwnProperty( 'content' ) && (
                <NotesEditor
                    activeNode={ notesActiveNode }
                    setActiveNode={ setNotesActiveNode }
                    content={ notesActiveNode?.content || "No content found?" }
                    onContentUpdate={ ( data ) => {
                        // console.log( "FileExplorer :: NotesEditor :: onContentUpdate :: data = ", data );

                        // Update local.
                        setNotesActiveNode( { ...notesActiveNode, content: data } );

                        // Update server.
                        onNodeUpdate( { ...notesActiveNode, content: data }, notesActiveNode?.itemType );
                    } }
                    onContentClear={ () => {
                        // console.log( "FileExplorer :: NotesEditor :: onContentClear :: notesActiveNode.content = ", notesActiveNode?.content );

                        // Update local.
                        setNotesActiveNode( { ...notesActiveNode, content: "" } );

                        // Update server.
                        onNodeUpdate( { ...notesActiveNode, content: "" }, notesActiveNode?.itemType );
                    } }
                />
            ) }
            {/* Main content area */ }
            <CardContent
                className="!p-0 flex-col flex-grow !h-full"
            >
                <Tabs
                    value={ viewMode }
                    onValueChange={ ( value ) => setViewMode( value ) }
                    className={ `relative !p-0 flex flex-col !h-full !min-h-full !max-h-full w-full !items-stretch !justify-start rounded-xl overflow-hidden` }
                >

                    {/* List View */ }
                    <TabsContent
                        value="list"
                        className={ `!p-0 !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] w-full !items-stretch !justify-start rounded-xl overflow-auto !h-full !min-h-full !max-h-full ` }
                        style={ {
                            '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem`,
                        } }
                    >
                        {/* { filteredFiles && Array.isArray( filteredFiles ) && filteredFiles.length > 0 ? ( */ }
                        { data ? (
                            <Table className={ `!overflow-auto !p-0` }>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={ selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 }
                                                onCheckedChange={ toggleSelectAll }
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead className="w-[300px]">Name</TableHead>
                                        <TableHead className="">Size</TableHead>
                                        <TableHead className="">Modified</TableHead>
                                        <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    { data && Array.isArray( data ) && data.length > 0 && data.map( ( node ) => (
                                        <TableRow key={ node._id } className={ selectedFiles.includes( node._id ) ? "bg-muted/50" : "" }>

                                            <TableCell>
                                                <Checkbox
                                                    checked={ selectedFiles.includes( node._id ) }
                                                    onCheckedChange={ () => toggleSelection( node._id ) }
                                                    aria-label={ `Select ${ node.title }` }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                    onClick={ () => handleFileAction( "select", node ) }
                                                    onDoubleClick={ () => handleFileAction( "open", node ) }

                                                >
                                                    { getFileIcon( node.itemType, node?.subType ? node?.subType : 'none' ) }
                                                    <span className="font-medium">{ node.title }</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                { node.itemType === "folder" ? `${ node?.contents?.length } item${ node?.contents?.length !== 1 ? "s" : "" }` : node?.size }
                                            </TableCell>

                                            <TableCell>
                                                { formatDate( node.updatedAt ) }
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="size-4 aspect-square" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                            { node.itemType === "folder" ? (
                                                                <>
                                                                    <Folder className="size-4 aspect-square" />
                                                                    Open
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="size-4 aspect-square" />
                                                                    Preview
                                                                </>
                                                            ) }
                                                        </DropdownMenuItem> */}

                                                        { ( node.itemType === "file" || node.itemType === 'asset' ) && (
                                                            <DropdownMenuItem onClick={ () => handleFileAction( "download:file", node ) }>
                                                                <Download className="size-4 aspect-square" />
                                                                Download
                                                            </DropdownMenuItem>
                                                        ) }

                                                        { node.itemType === "folder" && (
                                                            <DropdownMenuItem onClick={ () => handleFileAction( "download:zip", node ) }>
                                                                <Download className="size-4 aspect-square" />
                                                                Download as ZIP
                                                            </DropdownMenuItem>
                                                        ) }

                                                        <DropdownMenuSeparator />

                                                        { node.itemType === "file" && (
                                                            <>
                                                                <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                                    <File className="size-4 aspect-square" />
                                                                    Open File
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={ () => handleFileAction( "preview", node ) }>
                                                                    <Eye className="size-4 aspect-square" />
                                                                    Preview
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) }


                                                        { node.itemType === "folder" && (
                                                            <>
                                                                <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                                    <Folder className="size-4 aspect-square" />
                                                                    Open
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) }

                                                        <DropdownMenuItem onClick={ () => {
                                                            if ( node.itemType === 'folder' ) {
                                                                createNewFolder( { ...node, title: node.title } );
                                                            }
                                                            else {
                                                                createNewFile( { ...node, title: node.title } );
                                                            }
                                                        } }>
                                                            <CopyIcon className="size-4 aspect-square" />
                                                            Clone
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={ () => handleFileAction( "rename", node ) }>
                                                            <Edit className="size-4 aspect-square" />
                                                            Rename
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={ () => handleFileAction( "move", node ) }>
                                                            <Move className="size-4 aspect-square" />
                                                            Move
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            onClick={ () => handleFileAction( "delete", node ) }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="size-4 aspect-square" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>

                                        </TableRow>
                                    ) ) }
                                </TableBody>
                            </Table>
                        ) : (
                            buildEmptyExplorerContentArea()
                        ) }
                    </TabsContent>

                    {/* Grid View  */ }
                    <TabsContent value="grid" className="m-0">
                        { data ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                                { data && Array.isArray( data ) && data.map( ( node ) => (
                                    <div
                                        key={ node._id }
                                        className={ `relative group rounded-lg border bg-card p-2 transition-all hover:shadow-md ${ selectedFiles.includes( node._id ) ? "ring-2 ring-primary" : ""
                                            }` }
                                    >
                                        <div className="absolute top-2 right-2">
                                            <Checkbox
                                                checked={ selectedFiles.includes( node._id ) }
                                                onCheckedChange={ () => toggleSelection( node._id ) }
                                                aria-label={ `Select ${ node.title }` }
                                            />
                                        </div>

                                        <div
                                            className="flex flex-col items-center p-4 cursor-pointer"
                                            onClick={ () => handleFileAction( "select", node ) }
                                            onDoubleClick={ () => handleFileAction( "open", node ) }
                                        >
                                            <div className="mb-2 text-4xl">{ getFileIcon( node.itemType, node?.subType ? node?.subType : 'none' ) }</div>
                                            <div className="text-center">
                                                <p className="font-medium truncate w-full max-w-[120px]">{ node.title }</p>
                                                <p className="text-xs text-muted-foreground">
                                                    { node.itemType === "folder" ? `${ node.items } item${ node.items !== 1 ? "s" : "" }` : node.size }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="size-4 aspect-square" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {/* <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                        { node.itemType === "folder" ? (
                                                            <>
                                                                <Folder className="size-4 aspect-square" />
                                                                Open
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="size-4 aspect-square" />
                                                                Preview
                                                            </>
                                                        ) }
                                                    </DropdownMenuItem> */}

                                                    { node.itemType === "file" && (
                                                        <>
                                                            <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                                <File className="size-4 aspect-square" />
                                                                Open File
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={ () => handleFileAction( "preview", node ) }>
                                                                <Eye className="size-4 aspect-square" />
                                                                Preview
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) }


                                                    { node.itemType === "folder" && (
                                                        <>
                                                            <DropdownMenuItem onClick={ () => handleFileAction( "open", node ) }>
                                                                <Folder className="size-4 aspect-square" />
                                                                Open
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) }


                                                    { ( node.itemType === "folder" || node.itemType === "file" ) && (
                                                        <DropdownMenuItem onClick={ () => handleFileAction( "download", node ) }>
                                                            <Download className="size-4 aspect-square" />
                                                            Download
                                                        </DropdownMenuItem>
                                                    ) }

                                                    { node.itemType === "folder" && (
                                                        <DropdownMenuItem onClick={ () => handleFileAction( "download", node ) }>
                                                            <Download className="size-4 aspect-square" />
                                                            Download as ZIP
                                                        </DropdownMenuItem>
                                                    ) }

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem onClick={ () => handleFileAction( "rename", node ) }>
                                                        <Edit className="size-4 aspect-square" />
                                                        Rename
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={ () => handleFileAction( "move", node ) }>
                                                        <Move className="size-4 aspect-square" />
                                                        Move
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={ () => handleFileAction( "delete", node ) }
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="size-4 aspect-square" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        ) : (
                            buildEmptyExplorerContentArea()
                        ) }
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* <CardFooter className={ `p-0` }>
                { buildBulkActionsToolbar( selectedFiles ) }
            </CardFooter> */}

            {/* Upload Modal */ }
            <Dialog open={ uploadModalOpen } onOpenChange={ setUploadModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                        <DialogDescription>Drag and drop a file or click to browse.</DialogDescription>
                    </DialogHeader>

                    <div
                        className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={ () => {
                            if ( !uploadingFile ) {
                                simulateUpload( "New Document.pdf" );
                            }
                        } }
                    >
                        <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-1">Drag and drop your file here or click to browse</p>
                            <p className="text-xs text-muted-foreground">Supports PDF, DOCX, JPG, PNG, and more</p>
                        </div>
                    </div>

                    { uploadingFile && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{ uploadingFile }</span>
                                <span className="text-sm text-muted-foreground">{ uploadProgress }%</span>
                            </div>
                            <Progress value={ uploadProgress } className="h-2" />
                        </div>
                    ) }

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setUploadModalOpen( false ) }>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New File Modal */ }
            <Dialog open={ newFileModalOpen } onOpenChange={ setNewFileModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New File</DialogTitle>
                        <DialogDescription>Enter a name for your new file.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="File Name"
                                value={ newFileName }
                                onChange={ ( e ) => setNewFileName( e.target.value ) }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setNewFileModalOpen( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ () => createNewFile( {
                            title: newFileName,
                            itemType: 'file',
                            subType: 'txt',
                            path: currentPath,
                            parentId: getParentIdOfCurrentPath( currentPath ),
                        } ) }>Create File</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* New Folder Modal */ }
            <Dialog open={ newFolderModalOpen } onOpenChange={ setNewFolderModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>Enter a name for your new folder.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Folder Name"
                                value={ newFolderName }
                                onChange={ ( e ) => setNewFolderName( e.target.value ) }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setNewFolderModalOpen( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ () => createNewFolder( {
                            title: newFolderName,
                            itemType: 'folder',
                            subType: 'folder',
                            path: currentPath,
                            parentId: getParentIdOfCurrentPath( currentPath ),
                        } ) }>Create Folder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Modal */ }
            <Dialog open={ renameModalOpen } onOpenChange={ setRenameModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename { activeFile?.itemType === "folder" ? "Folder" : "File" }</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your { activeFile?.itemType === "folder" ? "folder" : "file" }.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Input
                                placeholder={ activeFile?.itemType === "folder" ? "Folder Name" : "File Name" }
                                value={ newFileName }
                                onChange={ ( e ) => setNewFileName( e.target.value ) }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setRenameModalOpen( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ renameFile }>Rename</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */ }
            <Dialog open={ deleteModalOpen } onOpenChange={ setDeleteModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            { selectedFiles.length > 0
                                ? `Are you sure you want to delete ${ selectedFiles.length } selected item${ selectedFiles.length !== 1 ? "s" : "" }?`
                                : `Are you sure you want to delete "${ activeFile?.title }"?` }
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setDeleteModalOpen( false ) }>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={ deleteFiles }>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Move Modal */ }
            <Dialog open={ moveModalOpen } onOpenChange={ setMoveModalOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move { selectedFiles.length > 0 ? "Items" : activeFile?.title }</DialogTitle>
                        <DialogDescription>Select a destination folder.</DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[200px] rounded-md border p-4">
                        <div className="space-y-2">
                            <div
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                                onClick={ () => {
                                    // Move logic would go here
                                    setMoveModalOpen( false );
                                } }
                            >
                                <Folder className="h-5 w-5 text-blue-500" />
                                <span>Home</span>
                            </div>

                            { utils.val.isValidArray( files, true ) && files
                                ?.filter( ( file ) => file.itemType === "folder" )
                                ?.map( ( folder ) => (
                                    <div
                                        key={ folder._id }
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                                        onClick={ () => {
                                            // Move logic would go here
                                            setMoveModalOpen( false );
                                        } }
                                    >
                                        <Folder className="h-5 w-5 text-blue-500" />
                                        <span>{ folder.title }</span>
                                    </div>
                                ) ) }
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => setMoveModalOpen( false ) }>
                            Cancel
                        </Button>
                        <Button onClick={ () => setMoveModalOpen( false ) }>Move Here</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Modal */ }
            <Dialog open={ previewModalOpen } onOpenChange={ setPreviewModalOpen }>
                <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } onClick={ ( e ) => {
                    e.preventDefault();
                    setPreviewModalOpen( false );
                } } />

                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            { getFileIcon( activeFile?.itemType || "other", activeFile?.subType || "other" ) }
                            { activeFile?.title && ( <span className="ml-2">{ activeFile?.title }</span> ) }
                            { activeFile?.description && ( <span className="ml-2">{ activeFile?.description }</span> ) }
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
                        { activeFile?.itemType === "asset" ? (
                            <>
                                { activeFile?.subType === "image" ? (
                                    <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                        <span className="sr-only">Image preview</span>
                                    </div>
                                ) : activeFile?.subType === "pdf" ? (
                                    <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                                        <FilePdf className="h-16 w-16 text-red-500" />
                                        <span className="sr-only">PDF preview</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                                        { !isInvalid( activeFile?.content )
                                            ? (
                                                <p className={ `text-sm text-wrap font-sans font-normal` }>
                                                    { activeFile.content }
                                                </p>
                                            )
                                            : ( <FileText className="h-16 w-16 text-muted-foreground" /> ) }
                                        <span className="sr-only">File preview</span>
                                    </div>
                                ) }
                            </>
                        )
                            : ( activeFile?.itemType === "file"
                                ? (
                                    <>
                                        <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                                            { !isInvalid( activeFile?.content )
                                                ? (
                                                    <div className="w-full h-[300px] flex items-start justify-start p-4">
                                                        <p className={ `text-sm text-wrap font-sans font-normal` }>
                                                            { activeFile.content }
                                                        </p>
                                                    </div>
                                                )
                                                : ( <FileText className="h-16 w-16 text-muted-foreground" /> ) }
                                            <span className="sr-only">File preview</span>
                                        </div>
                                    </>
                                )
                                : (
                                    <>
                                        <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                                            <FileQuestion className="h-16 w-16 text-muted-foreground" />
                                            <span className="sr-only">Unknown File</span>
                                        </div>
                                    </>
                                )
                            ) }
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <Badge variant="outline" className="mr-2">
                                { activeFile?.size || "Unknown size" }
                            </Badge>
                            <Badge variant="outline">{ formatDate( activeFile?.updatedAt || new Date() ) }</Badge>
                        </div>

                        <Button onClick={ () => setPreviewModalOpen( false ) }>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

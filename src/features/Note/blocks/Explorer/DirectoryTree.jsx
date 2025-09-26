import React, { useContext, createContext, useEffect, useState, useCallback } from 'react';

import {
    BookHeartIcon,
    BookOpen,
    ChevronRight,
    Delete,
    Edit,
    File,
    FileIcon,
    FilePlus,
    Folder,
    FolderIcon,
    FolderPlus,
    MoreHorizontal,
    MoreHorizontalIcon,
    Plus,
    SquareArrowOutUpLeftIcon
} from "lucide-react";
import * as utils from 'akashatools';
import axios from "axios";

import useNotes from '@/lib/hooks/useNotes';
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

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';

import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AiOutlineFolder, AiOutlineFolderOpen } from 'react-icons/ai';
import { Textarea } from '@/components/ui/textarea';
import { twMerge } from 'tailwind-merge';
import useNotesStore from '@/store/note.store';
import useGlobalStore from '@/store/global.store';
import { FileContextMenu, FolderContextMenu } from './ExplorerContextMenu';
import NoteDialog from '../Dialog/NoteDialog';

const DirectoryTree = ( props ) => {
    const {
        item,
    } = props;

    const [ name, ...items ] = Array.isArray( item ) ? item : [ item ];
    const [ subDirectories, setSubDirectories ] = React.useState( [] );

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
        dialogType, setDialogType,
        topFolder, setTopFolder,
        enableSave, setEnableSave,
        isCreatingFolder, setIsCreatingFolder,
        isEditingFolder, setIsEditingFolder,
        folderData, setFolderData,
        isCreatingFile, setIsCreatingFile,
        isEditingFile, setIsEditingFile,
        fileData, setFileData,
        folderInlineRename, setFolderInlineRename,
        view, setView, handleGetView, handleSetView,
    } = useNotes();

    const [ branchActive, setBranchActive ] = useState(
        item
            && utils.val.isObject( item )
            && item?.hasOwnProperty( 'isActive' )
            ? item?.isActive === true
            : false
    );

    if ( debug === true )
        console.log( "DirectoryTree :: item = ", item, " :: ", "branchActive = ", branchActive, item?.isActive );

    // RENDERING FUNCTIONS // 
    const buildBranch =
        useCallback(
            ( element ) => {
                if ( utils.val.isObject( element ) ) {
                    // Is a valid object. 
                    // console.log( "DirectoryTree :: BuildBranch :: element = ", element );
                    let {
                        _id,
                        parentId,
                        workspaceId: thisWorkspaceId,
                        fileContents,
                        folderContents,
                        title,
                        data,
                        categories,
                        icon,
                        bannerUrl,
                        createdAt,
                        updatedAt,
                        inTrash,
                        settings,

                        state,
                        isActive,
                        url,
                        items: subItems
                    } = element;

                    let isFolder = (
                        element?.hasOwnProperty( 'folderContents' )
                        |
                        element?.hasOwnProperty( 'fileContents' )
                    );

                    // if ( utils.val.isValidArray( folderContents, true ) ) {
                    if ( isFolder ) {
                        // There are subitems. 

                        // An easy way to force-open the full path to the currently active file and folder: 
                        // Cast entire directory tree from this point down to JSON string, and see if the active
                        //  _id is in there. If so, set it to open.
                        let idIsInBranch = JSON.stringify( [
                            ...(
                                utils.val.isValidArray( fileContents, true )
                                    ? fileContents
                                    : [ fileContents ]
                            ),
                            ...(
                                utils.val.isValidArray( folderContents, true )
                                    ? folderContents
                                    : [ folderContents ]
                            )
                        ] ).toLowerCase().includes( _id );

                        if ( idIsInBranch || isActive ) {
                            isActive = true;
                        }

                        // RENDERING A FOLDER
                        return (
                            <div
                                id={ `notes-folder-${ workspaceId }-${ parentId }-${ _id }` }
                                key={ `notes-folder-${ workspaceId }-${ parentId }-${ _id }` }
                                className={ `flex flex-grow flex-col w-full` }
                            >
                                <Collapsible
                                    isOpen={ branchActive }
                                    className={ twMerge(
                                        // `group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90 py-0 m-0`,
                                        branchActive
                                            ? ``
                                            : ``
                                    ) }
                                    // open={ branchActive }
                                    onOpenChange={ setBranchActive }
                                    defaultOpen={ branchActive }
                                >
                                    <div className={ `h-6 flex flex-row flex-nowrap p-0 m-0 min-w-full max-w-full w-full` }>
                                        <FolderContextMenu
                                            data={ element }
                                            // setData={ set }

                                            isEditing={ isEditingFolder }
                                            setIsEditing={ setIsEditingFolder }

                                            isCreating={ isCreatingFolder }
                                            setIsCreating={ setIsCreatingFolder }

                                            // Handler functions
                                            setActiveFolder={ handleChangeActiveFolder }
                                            handleCreateFileStart={ ( id ) => { handleCreateFileStart( id ); } }
                                            handleCreateFolderStart={ ( id ) => { handleCreateFolderStart( id ); } }
                                            handleEditFolderStart={ ( data ) => { handleEditFolderStart( data ); } }
                                            handleDeleteFolder={ handleDeleteFolder }
                                            classNames={ `!w-full` }
                                        >
                                            <CollapsibleTrigger
                                                className={ twMerge(
                                                    `w-full min-w-fit max-w-fit group/collapsible  py-0 m-0`,
                                                ) }
                                                onClick={ () => {
                                                    setBranchActive( !branchActive );
                                                    handleOpenFolder( element );
                                                } }
                                                /* onDoubleClick={ () => {
                                                    setBranchActive( !branchActive );
                                                } } */
                                                asChild
                                            >
                                                <SidebarMenuButton
                                                    className={ `h-6 py-0 pl-1 px-0 gap-[0.125rem]` }
                                                >
                                                    <ChevronRight className={ twMerge(
                                                        `p-0 transition-transform ${ branchActive ? 'rotate-0' : 'rotate-0' }`,
                                                        branchActive
                                                            ? `rotate-90 `
                                                            : ``
                                                    ) } />
                                                    { branchActive
                                                        ? ( <AiOutlineFolderOpen /> )
                                                        : ( <AiOutlineFolder /> ) }
                                                    { title }
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                        </FolderContextMenu>
                                    </div>

                                    {/* Collapsible nested documents; subfiles and subfolders */ }
                                    <CollapsibleContent className={ `w-full` }>
                                        { utils.val.isValidArray( folderContents, true ) && (
                                            <SidebarMenuSub className={ `w-full gap-0 py-0 pr-1 m-0` }>
                                                { folderContents
                                                    .sort( ( a, b ) => ( a?.updatedOn ? ( new Date( a?.updatedOn ).getSeconds() < new Date( b?.updatedOn ).getSeconds() ) : ( a ) ) )
                                                    .map( ( subItem, index ) => {
                                                        return (
                                                            <DirectoryTree
                                                                key={ `directory-tree-folder-${ subItem?._id ? subItem?._id : index }` }
                                                                item={ subItem }
                                                            />
                                                        );
                                                    } ) }
                                            </SidebarMenuSub>
                                        ) }

                                        { utils.val.isValidArray( fileContents, true ) && (
                                            <SidebarMenuSub className={ `w-full gap-0 py-0 pr-1 m-0` }>
                                                { fileContents
                                                    .sort( ( a, b ) => ( a?.updatedOn ? ( new Date( a?.updatedOn ).getSeconds() < new Date( b?.updatedOn ).getSeconds() ) : ( a ) ) )
                                                    .map( ( subItem, index ) => {
                                                        return (
                                                            <DirectoryTree
                                                                key={ `directory-tree-file-${ subItem?._id ? subItem?._id : index }` }
                                                                item={ subItem }
                                                            />
                                                        );
                                                    } ) }
                                            </SidebarMenuSub>
                                        ) }
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        );
                    }
                    else {

                        // console.log( "FILE :: ", element, title );
                        return (
                            <SidebarMenuButton
                                id={ `notes-file-${ workspaceId }-${ parentId }-${ _id }` }
                                key={ `notes-file-${ workspaceId }-${ parentId }-${ _id }` }
                                isActive={ state === true }
                                className={ `data-[active=true]:bg-transparent w-full h-6 py-0 pl-1 ${ notesActiveFile?._id === element?._id ? 'bg-tertiary' : '' }` }
                                onClick={ () => {
                                    // CLicking the file sets the active file to this file.
                                    setBranchActive( !branchActive );
                                    handleOpenFile( element );
                                } }
                            >
                                <FileContextMenu
                                    data={ element }
                                    // setData={ set }

                                    isEditing={ isEditingFolder }
                                    setIsEditing={ setIsEditingFolder }

                                    isCreating={ isCreatingFolder }
                                    setIsCreating={ setIsCreatingFolder }

                                    // Handler functions
                                    setNotesActiveFile={ handleChangeActiveFile }
                                    handleEditFileStart={ ( data ) => handleEditFileStart( data ) }
                                    handleDeleteFile={ handleDeleteFile }
                                    classNames={ `!w-full` }
                                >
                                    {/* RENDERING A FILE */ }
                                    <SidebarMenuButton className={ `h-6 py-0 px-0 gap-[0.125rem]` }>
                                        { branchActive
                                            ? ( <BookOpen
                                                className={ `` }
                                            /> )
                                            : ( <BookHeartIcon
                                                className={ `` }
                                            /> ) }
                                        { title }
                                    </SidebarMenuButton>

                                </FileContextMenu>

                            </SidebarMenuButton>
                        );
                    }
                }
            }
            , []
        );

    // console.log( "TREE :: items = ", items, " :: ", "item = ", item );

    return (
        <>
            { branchActive !== null && branchActive !== undefined && ( <SidebarMenuItem
                className={
                    `${ // item?.isActive
                    // || 
                    item?._id === notesActiveFile?._id
                        || item?._id === notesActiveFolder?._id
                        ? `bg-primary-800`
                        : ``
                    }`
                }
                onDoubleClick={ () => {
                    let isFolder = ( item?.hasOwnProperty( 'folderContents' ) | item?.hasOwnProperty( 'fileContents' ) );
                    setBranchActive( !branchActive );
                    if ( isFolder ) handleChangeActiveFolder( item );
                    else handleChangeActiveFile( item );
                    // isFolder
                    //     ? handleChangeActiveFolder( item )
                    //     : handleChangeActiveFile( item )
                } }
            /* onDoubleClick={ () => {
                setBranchActive( !branchActive );
            } } */
            >
                { item && utils.val.isValid( item )
                    ? ( buildBranch( item ) )
                    : ( <></> ) }
            </SidebarMenuItem> ) }

            <>
                {/* Create File Dialog */ }
                {/* { isCreatingFile === true && ( */ }
                {/* { dialogType === 'add' && (
                    <NoteDialog
                        data={ dialogData }
                        setData={ setDialogData }
                        dataSchema={ getSchemaForDataType( 'file' ) }
                        dialogOpen={ dialogType === 'add' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                        handleSubmit={ ( data ) => { handleCreateFileSubmit( data ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'add' }
                        dataType={ dialogDataType ?? 'file' }
                        debug={ debug }
                    />
                ) } */}

                {/* Edit File Dialog */ }
                {/* { isEditingFile === true && ( */ }
                {/* { dialogType === 'edit' && (
                    <NoteDialog
                        data={ dialogData }
                        setData={ setDialogData }
                        dataSchema={ getSchemaForDataType( 'file' ) }
                        dialogOpen={ dialogType === 'edit' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                        handleSubmit={ ( data ) => { handleEditFileSubmit( data ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType }
                        dataType={ dialogDataType ?? 'file' }
                        debug={ debug }
                    />
                ) } */}

                {/* Create Folder Dialog */ }
                {/* { isCreatingFolder === true && ( */ }
                {/* { dialogType === 'add' && (
                    <NoteDialog
                        data={ dialogData }
                        setData={ setDialogData }
                        dataSchema={ getSchemaForDataType( 'folder' ) }
                        dialogOpen={ dialogType === 'add' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                        handleSubmit={ ( data ) => { handleCreateFolderSubmit( data ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'add' }
                        dataType={ dialogDataType ?? 'folder' }
                        debug={ debug }
                    />
                ) } */}

                {/* Edit Folder Dialog */ }
                {/* { isEditingFolder === true && ( */ }
                {/* { dialogType === 'edit' && (
                    <NoteDialog
                        data={ dialogData }
                        setData={ setDialogData }
                        dataSchema={ getSchemaForDataType( 'folder' ) }
                        dialogOpen={ dialogType === 'edit' }
                        setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                        handleSubmit={ ( data ) => { handleEditFolderSubmit( data ); } }
                        handleChange={ handleChange }
                        handleClose={ handleCancel }
                        dialogType={ dialogType ?? 'edit' }
                        dataType={ dialogDataType ?? 'folder' }
                        debug={ debug }
                    />
                ) } */}
                {/* 
                { isCreatingFile && handleBuildNoteDialog(
                    fileData,               // initialData,
                    setFileData,            // setInitialData,
                    isCreatingFile,         // dialogOpen = false,
                    handleCreateFileStart,  // setDialogOpen = () => { },
                    'add',                  // mode = 'add',
                    'File',                 // docName = '',
                    'file'                  // type
                ) }

                { isEditingFile && handleBuildNoteDialog(
                    fileData,               // initialData,
                    setFileData,            // setInitialData,
                    isEditingFile,          // dialogOpen = false,
                    handleEditFileStart,    // setDialogOpen = () => { },
                    'edit',                 // mode = 'add',
                    'File',                 // docName = '',
                    'file'                  // type
                ) }

                { isCreatingFolder && handleBuildNoteDialog(
                    folderData,             // initialData,
                    setFolderData,          // setInitialData,
                    isCreatingFolder,       // dialogOpen = false,
                    setIsCreatingFolder,    // setDialogOpen = () => { },
                    'edit',                 // mode = 'add',
                    'Folder',               // docName = '',
                    'folder'                // type
                ) }

                { isEditingFolder && handleBuildNoteDialog(
                    folderData,             // initialData,
                    setFolderData,          // setInitialData,
                    isEditingFolder,        // dialogOpen = false,
                    setIsEditingFolder,     // setDialogOpen = () => { },
                    'edit',                 // mode = 'add',
                    'Folder',               // docName = '',
                    'folder'                // type
                ) } */}
            </>
        </>
    );
};

// Recursive Tree Component
const Node = ( { node } ) => {
    const [ isExpanded, setIsExpanded ] = useState( false );

    const toggleExpand = () => setIsExpanded( !isExpanded );

    // Check if the node has children (folderContents or fileContents)
    const hasChildren = node?.folderContents?.length > 0 || node?.fileContents?.length > 0;

    return (
        <div style={ { marginLeft: "20px" } }>
            <div
                style={ {
                    display: "flex",
                    alignItems: "center",
                    cursor: hasChildren ? "pointer" : "default",
                    fontWeight: hasChildren ? "bold" : "normal",
                } }
                onClick={ hasChildren ? toggleExpand : null }
            >
                { hasChildren && (
                    <span style={ { marginRight: "8px" } }>
                        { isExpanded ? "▼" : "▶" }
                    </span>
                ) }
                <span>{ node?.title }</span>
            </div>

            { isExpanded && (
                <div style={ { marginLeft: "10px" } }>
                    {/* Render folder contents */ }
                    { node?.folderContents?.map( ( childFolder ) => (
                        <TreeNode key={ childFolder?._id } node={ childFolder } />
                    ) ) }

                    {/* Render file contents */ }
                    { node?.fileContents?.map( ( file ) => (
                        <div
                            key={ file?._id }
                            style={ {
                                marginLeft: "20px",
                                fontStyle: "italic",
                                color: "gray",
                            } }
                        >
                            { file.title }
                        </div>
                    ) ) }
                </div>
            ) }
        </div>
    );
};

DirectoryTree.Node = Node;

export default DirectoryTree;


/*  const FileModal = ( { isOpen, onClose } ) => {
        const createFile = useStore( state => state.createFile );
        const workspaceId = useStore( state => state.activeWorkspaceId );

        const [ title, setTitle ] = useState( "" );
        const [ content, setContent ] = useState( "" );
        const [ parentId, setParentId ] = useState( null );

        const handleSubmit = async () => {
            try {
                await createFile( { title, content, parentId, workspaceId } );
                setTitle( "" );
                setContent( "" );
                setParentId( null );
                onClose();
            } catch ( err ) {
                console.error( "Error creating file:", err );
            }
        };

        return (
            <Dialog
                open={ isOpen }
                onClose={ onClose }
                title="Create New File"
            >
                <div className="space-y-4">
                    <Input
                        label="File Name"
                        placeholder="Enter file name"
                        value={ title }
                        onChange={ e => setTitle( e.target.value ) }
                    />
                    <Textarea
                        label="File Content"
                        placeholder="Enter file content"
                        value={ content }
                        onChange={ e => setContent( e.target.value ) }
                    />
                    <Input
                        label="Parent Folder ID (Optional)"
                        placeholder="Parent Folder ID"
                        value={ parentId || "" }
                        onChange={ e => setParentId( e.target.value ) }
                    />
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={ onClose }>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={ handleSubmit }
                            disabled={ !title || !content }
                        >
                            Create File
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    };

    const FolderModal = ( { isOpen, onClose } ) => {
        const createFolder = useFolderStore( state => state.createFolder );
        const workspaceId = useFolderStore( state => state.activeWorkspaceId );

        const [ title, setTitle ] = useState( "" );
        const [ parentId, setParentId ] = useState( null );

        const handleSubmit = async () => {
            try {
                await createFolder( { title, parentId, workspaceId } );
                setTitle( "" );
                setParentId( null );
                onClose();
            } catch ( err ) {
                console.error( "Error creating folder:", err );
            }
        };

        return (
            <Dialog
                open={ isOpen }
                onClose={ onClose }
                title="Create New Folder"
            >
                <div className="space-y-4">
                    <Input
                        label="Folder Name"
                        placeholder="Enter folder name"
                        value={ title }
                        onChange={ e => setTitle( e.target.value ) }
                    />
                    <Input
                        label="Parent Folder ID (Optional)"
                        placeholder="Parent Folder ID"
                        value={ parentId || "" }
                        onChange={ e => setParentId( e.target.value ) }
                    />
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={ onClose }>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={ handleSubmit }
                            disabled={ !title }
                        >
                            Create Folder
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    };
*/
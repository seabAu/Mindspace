import React, { useContext, createContext, useEffect, useState } from 'react';

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
import useGlobalStore from '@/store/global.store';
import useNotesStore from '@/store/note.store';
import { twMerge } from 'tailwind-merge';

const CONTEXT_TRIGGER_CLASSNAMES = `flex items-center justify-start text-xs p-0 m-0 h-min overflow-visible border-[0.1rem] !hover:border-[0.1rem] border-dashed border-transparent hover:border-washed-blue-300 hover:border-sextary-200 rounded-xl`;

export const ContextMenuWrapper = ( {
    // State and setState
    debugInput = false,
    data = {},
    setData = () => { },
    isOpen = false,
    setIsOpen = () => { },

    // Handler functions
    options = [],
    setActiveFile = () => { },
    // handleEditFileStart = () => { },
    // handleDeleteFile = () => { },
    classNames,
    children,
} ) => {

    return (
        <ContextMenu
            modal={ false }
            // open={ }
            // isOpen={  }
            onOpenChange={ () => {

            } }
            className={ `${ classNames } h-auto overflow-visible flex p-0 m-0` }
        >
            <ContextMenuTrigger
                className={ `flex items-center justify-start text-xs p-0 m-0 h-min overflow-visible hover:border hover:border-dashed ${ classNames }` }
            >

                {
                    children ? ( children ) : ( <MoreHorizontalIcon /> )
                }

            </ContextMenuTrigger>

            <ContextMenuContent
                className="w-64"
                onCloseAutoFocus={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onCloseAutoFocus triggered." );
                } }
                onEscapeKeyDown={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onEscapeKeyDown triggered." );
                } }
                onPointerDownOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onPointerDownOutside triggered." );
                } }
                onFocusOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onFocusOutside triggered." );
                } }
                onInteractOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onInteractOutside triggered." );
                } }
            >

                <ContextMenuItem
                    onClick={ () => {
                        setActiveFile( data );
                        console.log( "DirectoryTree :: Open file button clicked" );
                    } }
                >
                    <SquareArrowOutUpLeftIcon />
                    <span>Open</span>
                </ContextMenuItem>

                <ContextMenuItem
                    onClick={ () => {
                        handleEditFileStart( { ...data } );
                        console.log( "DirectoryTree :: Rename File button clicked" );
                    } }
                >
                    <Edit />
                    <span>Rename</span>
                </ContextMenuItem>

                <ContextMenuItem
                    onClick={ () => {
                        handleEditFileStart( data );
                        console.log( "DirectoryTree :: Edit file button clicked" );
                    } }
                >
                    <Edit />
                    <span>Edit</span>
                </ContextMenuItem>

                <ContextMenuItem
                    onClick={ () => {
                        handleDeleteFile( data );
                        console.log( "DirectoryTree :: Delete file button clicked" );
                    } }
                >
                    <Delete />
                    <span>Delete</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuSub>
                    <ContextMenuSubTrigger inset>
                        More Tools
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem>
                            Save As...
                            <ContextMenuShortcut>
                                ⇧⌘S
                            </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem>
                            Create Shortcut...
                        </ContextMenuItem>
                        <ContextMenuItem>
                            Name Window...
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>
                            Developer Tools
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>

            </ContextMenuContent>
        </ContextMenu>
    );
};

export const ExplorerContextMenu = ( props ) => {
    const {
        controls,
    } = props;

    const {
        debug,
        setDebug,
        workspaceId,
        setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchTree,
        setRequestFetchTree,
        notesData,
        setNotesData,
        recentNotesData,
        setRecentNotesData,
        notesDirectoryTree,
        setNotesDirectoryTree,
    } = useNotesStore();

    const {
        handleNodeCreate,
        handleNodeUpdate,
        handleNodeDelete,
        handleNodeRename,
        handleNodeSelect,
        handleRefreshNotes,
    } = useNotes();

    return (
        <div>

        </div>
    );
};


export const FileContextMenu = ( {
    // State and setState
    debugInput = false,
    data = {},
    setData,

    // Handler functions
    setActiveFile = () => { },
    handleEditFileStart = () => { },
    handleDeleteFile = () => { },
    classNames,
    children,
} ) => {

    return (
        <ContextMenu
            modal={ false }
            // open={ }
            // isOpen={  }
            onOpenChange={ () => {

            } }
            className={ `${ classNames } h-auto overflow-visible flex p-0 m-0` }
        >
            <ContextMenuTrigger
                className={ twMerge(
                    CONTEXT_TRIGGER_CLASSNAMES,
                    classNames,
                ) }
            >
                { children ? ( children ) : ( <MoreHorizontalIcon /> ) }
            </ContextMenuTrigger>

            <ContextMenuContent
                className="w-64"
                onCloseAutoFocus={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onCloseAutoFocus triggered." );
                } }
                onEscapeKeyDown={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onEscapeKeyDown triggered." );
                } }
                onPointerDownOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onPointerDownOutside triggered." );
                } }
                onFocusOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onFocusOutside triggered." );
                } }
                onInteractOutside={ () => {
                    if ( debugInput ) console.log( "FileContextMenu :: onInteractOutside triggered." );
                } }
            >

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        setActiveFile( data );
                        console.log( "DirectoryTree :: Open file button clicked" );
                    } }
                >
                    <SquareArrowOutUpLeftIcon className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Open</span>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        handleEditFileStart( { ...data } );
                        console.log( "DirectoryTree :: Rename File button clicked" );
                    } }
                >
                    <Edit className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Rename</span>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        handleEditFileStart( data );
                        console.log( "DirectoryTree :: Edit file button clicked" );
                    } }
                >
                    <Edit className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Edit</span>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        handleDeleteFile( data );
                        console.log( "DirectoryTree :: Delete file button clicked" );
                    } }
                >
                    <Delete className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Delete</span>
                </ContextMenuItem>

            </ContextMenuContent>
        </ContextMenu>
    );
};

export const FolderContextMenu = ( {
    // State and setState
    debugInput = false,
    data = {},
    setData,

    isEditing = false,
    setIsEditing,

    isCreating = false,
    setIsCreating,

    // Handler functions
    setActiveFolder = () => { },
    handleCreateFolderStart = () => { },
    handleEditFolderStart = () => { },
    handleCreateFileStart = () => { },
    handleDeleteFolder = () => { },
    classNames,
    children,
} ) => {

    return (
        <ContextMenu
            modal={ false }
            onOpenChange={ () => {

            } }
            classNames={ `h-auto overflow-visible flex p-0 m-0 ${ classNames }` }
        >
            <ContextMenuTrigger
                // className={ `flex items-center justify-start text-xs p-0 m-0 h-min overflow-visible hover:border hover:border-dashed ${ classNames }` }
                // className={ `flex items-center justify-start text-xs p-0 m-0 h-min overflow-visible border-[0.05rem] !hover:border-[0.05rem] border-dashed border-transparent hover:border-s-sextary-100 rounded-xl ${ classNames }` }
                className={ twMerge(
                    CONTEXT_TRIGGER_CLASSNAMES,
                    classNames,
                ) }
            >
                { children ? ( children ) : ( <MoreHorizontalIcon /> ) }
            </ContextMenuTrigger>

            <ContextMenuContent
                className="w-64"
                onCloseAutoFocus={ () => {
                    if ( debugInput ) console.log( "FolderContextMenu :: onCloseAutoFocus triggered." );
                } }
                onEscapeKeyDown={ () => {
                    if ( debugInput ) console.log( "FolderContextMenu :: onEscapeKeyDown triggered." );
                } }
                onPointerDownOutside={ () => {
                    if ( debugInput ) console.log( "FolderContextMenu :: onPointerDownOutside triggered." );
                } }
                onFocusOutside={ () => {
                    if ( debugInput ) console.log( "FolderContextMenu :: onFocusOutside triggered." );
                } }
                onInteractOutside={ () => {
                    if ( debugInput ) console.log( "FolderContextMenu :: onInteractOutside triggered." );
                } }
            >

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        setActiveFolder( data );
                        console.log( "DirectoryTree :: Open file button clicked" );
                    } }
                >
                    <SquareArrowOutUpLeftIcon className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Open</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        // handleCreateFileStart();
                        if ( handleCreateFileStart ) {
                            handleCreateFileStart( data?.parentId ? data?.parentId : null );
                        }
                        console.log( "DirectoryTree :: New File button clicked :: data = ", data, " :: ", "parentId = ", data?.parentId );
                    } }
                >
                    <Edit className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Rename</span>
                    <ContextMenuShortcut>
                    </ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        if ( handleEditFolderStart ) {
                            handleEditFolderStart( data );
                        }
                        // handleStartEdit( data );
                        console.log( "DirectoryTree :: Edit folder button clicked :: data = ", data, " :: ", "parentId = ", data?.parentId );
                    } }
                >
                    <Edit className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Edit</span>
                    <ContextMenuShortcut>
                    </ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    inset
                    className={ `w-full gap-4 !px-2 !py-1 h-8` }
                    onClick={ () => {
                        if ( handleDeleteFolder ) { handleDeleteFolder( data ); }
                        console.log( "DirectoryTree :: Delete folder button clicked :: data = ", data, " :: ", "parentId = ", data?.parentId );
                    } }
                >
                    <Delete className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                    <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>Delete Folder</span>
                    <ContextMenuShortcut>
                    </ContextMenuShortcut>
                </ContextMenuItem>


                <ContextMenuSub>
                    <ContextMenuSubTrigger inset>
                        New
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">

                        <ContextMenuItem
                            inset
                            className={ `w-full gap-4 !px-2 !py-1 h-8` }
                            onClick={ () => {
                                if ( handleCreateFileStart ) {
                                    handleCreateFileStart( data?.parentId ? data?.parentId : null );
                                }
                                console.log( "DirectoryTree :: New File button clicked :: data = ", data, " :: ", "parentId = ", data?.parentId );
                            } }
                        >
                            <FilePlus className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                            <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>New File</span>
                            <ContextMenuShortcut>⇧⌘D</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem
                            inset
                            className={ `w-full gap-4 !px-2 !py-1 h-8` }
                            onClick={ () => {
                                if ( handleCreateFolderStart ) {
                                    handleCreateFolderStart( data?.parentId ? data?.parentId : null );
                                }
                                console.log( "DirectoryTree :: New Folder button clicked :: data = ", data, " :: ", "parentId = ", data?.parentId );
                            } }
                        >
                            <FolderPlus className={ `w-auto text-base whitespace-nowrap !p-0 !m-0` } />
                            <span className={ `w-full text-base whitespace-nowrap !p-0 !m-0` }>New Folder</span>
                            <ContextMenuShortcut>⇧⌘F</ContextMenuShortcut>
                        </ContextMenuItem>

                    </ContextMenuSubContent>
                </ContextMenuSub>

            </ContextMenuContent>
        </ContextMenu>
    );
};


export default ExplorerContextMenu;

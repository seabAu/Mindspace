import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import * as utils from 'akashatools';
import { cn } from "@/lib/utils";

export function FileExplorerNav ( { items } ) {
    const [ openFolders, setOpenFolders ] = useState( {} );

    const toggleFolder = ( id ) => {
        setOpenFolders( ( prev ) => ( { ...prev, [ id ]: !prev[ id ] } ) );
    };

    const renderItem = ( item, level = 0 ) => {
        const isOpen = openFolders[ item.id ];
        const hasItems = item.items && item.items.length > 0;

        return (
            <div key={ item.id } className="relative">
                <button
                    onClick={ () => hasItems && toggleFolder( item.id ) }
                    className={ cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5",
                        isOpen && "text-white",
                    ) }
                    style={ { paddingLeft: `${ ( level + 1 ) * 12 }px` } }
                >
                    { hasItems ? (
                        <span className="flex items-center gap-2">
                            <ChevronRight className={ cn( "h-3.5 w-3.5 transition-transform", isOpen && "rotate-90" ) } />
                            { isOpen ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" /> }
                        </span>
                    ) : (
                        <File className="ml-5.5 h-4 w-4" />
                    ) }
                    <span>{ item.name }</span>
                    { item.path && <span className="ml-auto text-xs text-gray-500">{ item.path }</span> }
                </button>
                { hasItems && isOpen && (
                    <div className="relative">{ item?.items?.map( ( subItem ) => renderItem( subItem, level + 1 ) ) }</div>
                ) }
            </div>
        );
    };

    return (
        <div className="w-72 overflow-hidden rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
            <div className="space-y-0.5">{ items.map( ( item ) => renderItem( item ) ) }</div>
        </div>
    );
}




import { FileExplorerNav } from "@/components/file-explorer-nav";

const fileStructure = [
    {
        id: "app",
        name: "app",
        type: "folder",
        items: [
            {
                id: "layout",
                name: "layout.js",
                type: "file",
            },
            {
                id: "marketing",
                name: "(marketing)",
                type: "folder",
                items: [
                    {
                        id: "about",
                        name: "about",
                        type: "folder",
                        path: "/about",
                        items: [
                            {
                                id: "about-page",
                                name: "page.js",
                                type: "file",
                            },
                        ],
                    },
                    {
                        id: "blog",
                        name: "blog",
                        type: "folder",
                        path: "/blog",
                        items: [
                            {
                                id: "blog-page",
                                name: "page.js",
                                type: "file",
                            },
                        ],
                    },
                ],
            },
            {
                id: "shop",
                name: "(shop)",
                type: "folder",
                items: [
                    {
                        id: "account",
                        name: "account",
                        type: "folder",
                        path: "/account",
                        items: [
                            {
                                id: "account-page",
                                name: "page.js",
                                type: "file",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const FileExplorerNavRender = ( props ) => {
    const {
        structure,
        children,
    } = props;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black p-8">
            <FileExplorerNav items={ structure ?? fileStructure } />
        </div>
    );
};

export default FileExplorerNavRender;


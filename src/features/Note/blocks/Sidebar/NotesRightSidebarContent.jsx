
import React, { useContext, createContext, useEffect, useState, useId, useMemo } from 'react';
import useNotes from '@/lib/hooks/useNotes';
import {
    RefreshCwIcon,
} from "lucide-react";

// Utilities
import * as utils from 'akashatools';

// Data stores
import useGlobalStore from '@/store/global.store';
import useNotesStore from '@/store/note.store';

// Components
import Nav from '@/components/Nav/Nav';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { CONTENT_HEADER_HEIGHT, ROUTE_NOTES_ACTIVE_FILE_NAME } from '@/lib/config/constants';
import { buildSelect } from '@/lib/utilities/input';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import ExplorerNavHeader from '../Explorer/ExplorerNav/ExplorerNavHeader';
import { twMerge } from 'tailwind-merge';

const NotesRightSidebarContent = () => {
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
        handleChangeNode,
        handleNodeCreate,
        handleNodeUpdate,
        handleNodeDelete,
        handleNodeRename,
        handleNodeSelect,
        handleRefreshNotes,
    } = useNotes();

    const {
        GetLocal,
        SetLocal,
    } = useLocalStorage();

    return (
        <div
            className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !p-0` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem`,
            } }>
            { notesData
                && utils.val.isValidArray( notesData, true )
                && notesActiveNode && notesActiveNode?._id
                && buildSelect( {
                    placeholder: 'All Files',
                    opts: notesData.map( ( f, index ) => ( { name: f?.title, value: f?._id } ) ),
                    value: notesActiveNode?._id,
                    initialData: notesActiveNode?._id,
                    key: '_id',
                    handleChange: ( key, value ) => {
                        console.log( "notesData select input :: notesData = ", notesData, " :: ", "key = ", key, " :: ", "value = ", value );
                        if ( value ) {
                            // Find the file whose _id matches value and set the active file to it. 
                            let file = notesData?.filter( ( f, i ) => f?._id === value );
                            // if ( utils.val.isObject( file ) ) {
                            console.log( "notesData select input :: notesData = ", notesData, " :: ", "key = ", key, " :: ", "value = ", value, " :: ", "file = ", file?.[ 0 ] );

                            if ( file && utils.val.isValidArray( file, true ) ) {
                                console.log( "notesData select input :: notesData = ", notesData, " :: ", "key = ", key, " :: ", "value = ", value, " :: ", "file = ", file?.[ 0 ] );
                                // setNotesActiveNode( file?.[ 0 ] );
                                handleChangeNode( file?.[ 0 ] );
                            }
                        }
                    },
                    className: '',
                    multiple: false
                } ) }


            <div className={ `flex flex-row w-full justify-stretch rounded-[${ 0.25 }rem]` }>
                <ExplorerNavHeader useNav={ false } useButtons={ true } useBreadcrumbs={ false } useRefresh={ true } />

            </div>

            <QuillEditor
                // className={ `flex flex-col w-full mx-auto rounded-[${ 0.25 }rem]` }
                classNames={ twMerge(
                    `text-editor w-full h-full max-h-full min-h-full relative gap-2 p-0 flex flex-col items-stretch justify-stretch`,
                    `z-0 rounded-[${ 0.25 }rem] flex flex-col items-stretch justify-start w-full rounded-xl`,
                    // `!min-h-fit !max-h-full !h-[75vh] overflow-hidden`,
                ) }
                content={ notesActiveNode && utils.val.isObject( notesActiveNode ) ? notesActiveNode?.content : '' }
                setContent={ ( data ) => {
                    // Store the data in the content. 
                    if ( notesActiveNode?.content && notesActiveNode?.content !== data ) {
                        console.log( "NotesPage :: QuillEditor :: setContent :: data = ", data );
                        if ( notesActiveNode && utils.val.isObject( notesActiveNode ) ) {
                            setNotesActiveNode( {
                                ...notesActiveNode,
                                content: data
                            } );
                            SetLocal( ROUTE_NOTES_ACTIVE_FILE_NAME, {
                                ...notesActiveNode,
                                content: data
                            } );
                        }
                    }
                } }
            />
        </div>
    );
};

export default NotesRightSidebarContent;

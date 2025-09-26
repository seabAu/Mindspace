import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import QuillEditor from '@/features/Note/blocks/QuillEditor/QuillEditor';
import clsx from 'clsx';
import useNotes from '@/lib/hooks/useNotes';
import { Button } from '@/components/ui/button';
import * as utils from 'akashatools';
import {
    ArrowBigLeft,
    File,
    FilePlus,
    Files,
    Folder,
    FolderPlus,
    Folders,
    LucideLayoutGrid,
    RefreshCcw,
    RefreshCwIcon,
    Save,
    Trash,
} from 'lucide-react';
import {
    deepMirrorNodes,
    deepUpdateNode,
    findAbsolutePath,
    findNodeByAbsolutePath,
    recursiveNotesMigration,
} from '@/lib/utilities/note';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { AiOutlineFile, AiOutlineFolderOpen } from 'react-icons/ai';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import Droplist from '@/components/Droplist';
import Content from '@/components/Page/Content';
import useNotesStore from '@/store/note.store';
import useGlobalStore from '@/store/global.store';
// import { FileContextMenu, FolderContextMenu } from '@/features/Note/blocks/Explorer/ExplorerContextMenu';
// import EditorBreadcrumbs from '@/components/Breadcrumbs/EditorBreadcrumbs';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CONTENT_HEADER_HEIGHT,
    ROUTE_NOTES_ACTIVE_FILE_NAME,
    ROUTES_NOTE_PAGE,
    ROUTES_NOTES,
} from '@/lib/config/constants';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import Nav from '@/components/Nav/Nav';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { SetLocal } from '@/lib/utilities/local';

export const NotesEditor = ( {
    activeNode = null,
    content = '',
    onContentSave = () => { },
    onContentUpdate = () => { },
    onContentClear = () => { },
}, ...props ) => {
    const {
        requestFetchTree, setRequestFetchTree,
        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        notesActiveNode, setNotesActiveNode,
        loading: loadingNotes, setLoading: setLoadingNotes,
        error: errorNotes, setError: setErrorNotes,
    } = useNotesStore();

    // const [ noteContent, setNoteContent ] = useState( activeNode && activeNode?.hasOwnProperty( 'content' ) && activeNode?.content ? activeNode?.content : '' );
    const [ noteContent, setNoteContent ] = useState( content || '' );

    useEffect( () => {
        if ( content ) {
            setNoteContent( content );
        }
    }, [ content ] );

    const handleSetContent = ( data ) => {
        // Store the data in the content.
        if (
            // activeNode &&
            // utils.val.isObject( activeNode ) &&
            // activeNode?.content &&
            // activeNode?.content !== data
            noteContent && noteContent !== data
        ) {
            console.log( "NotesPage :: QuillEditor :: setContent :: data = ", data );
            const updatedNode = {
                ...activeNode,
                content: data,
            };
            // setNotesActiveNode( updatedNode );
            SetLocal( ROUTE_NOTES_ACTIVE_FILE_NAME, updatedNode );
            setNoteContent( data );
            onContentUpdate( data );
        }
    };

    console.log( "NotesEditor :: activeNode = ", activeNode, " :: ", "notesActiveNode = ", notesActiveNode );

    return (
        <ResizablePanelGroup
            direction='horizontal'
            className='h-full max-w-md rounded-xl md:min-w-[100%] p-0 overflow-hidden'>
            <ResizablePanel defaultSize={ 75 }>
                <Card className='h-full max-h-full items-start justify-center p-2 py-4 relative overflow-auto rounded-xl'>
                    <QuillEditor
                        // className={ `flex flex-col items-stretch justify-start w-full h-full rounded-xl ` }
                        content={
                            // activeNode &&
                            //     utils.val.isObject( activeNode ) &&
                            //     activeNode?.content
                            //     ? activeNode?.content
                            //     : 'No content found.'
                            content || 'No content found.'
                        }
                        setContent={ handleSetContent }
                        useSaveButton={ true }
                        handleSave={ ( data ) => { onContentUpdate( data ); } }
                        handleClear={ () => onContentClear() }
                    />
                </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={ 25 }>
                <div className='flex h-full items-start justify-center p-2 relative overflow-auto'>
                    {/* <div className="flex h-full items-center justify-center p-2"> */ }
                    <Markdown
                        className={ `flex flex-col w-full h-full mx-auto rounded-xl` }
                        remarkPlugins={ [ remarkGfm ] }
                        setContent={ handleSetContent }
                    >
                        { content }
                    </Markdown>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

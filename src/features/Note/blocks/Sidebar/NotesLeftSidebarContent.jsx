import React, { useEffect, useState } from 'react';
import useNotes from '@/lib/hooks/useNotes';

// Utilities
import * as utils from 'akashatools';

// Data stores
import useGlobalStore from '@/store/global.store';
import useNotesStore from '@/store/note.store';

// Components
import Nav from '@/components/Nav/Nav';
import { RefreshCwIcon } from 'lucide-react';

const NotesLeftSidebarContent = () => {
    const {
        debug, setDebug,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        notesDirectoryTree,
        recentNotesData, setRecentNotesData,
        notesActiveNode, setNotesActiveNode,
    } = useNotesStore();

    const {
        handleGetAllNotes,
        handleGetDirectoryTree,
        handleGetRecentNotes,
        handleNodeCreate,
        handleNodeUpdate,
        handleNodeDelete,
        handleNodeRename,
        handleNodeSelect,
        handleRefreshNotes,
        handleNodePathUpdate,
    } = useNotes();

    return (
        <div className={ `w-full !overflow-auto !max-h-full h-auto block justify-start place-items-start` }>
            {/* { utils.val.isValidArray( notesDirectoryTree, true ) && (
                <Nav.Directory
                    label={ 'Notes' }
                    headerBtns={ [ {
                        index: 0,
                        enabled: true,
                        // name: 'refresh',
                        // label: 'refresh',
                        icon: ( <RefreshCwIcon className={ `text-xl` } /> ),
                        type: 'button',
                        onClick: () => {
                            setRequestFetchTree( true );
                        }
                    }
                    ] }
                    items={ notesDirectoryTree }
                /> ) } */}

            { utils.val.isValidArray( recentNotesData, true ) && (
                <Nav.List
                    label={ 'Recent Files' }
                    items={ recentNotesData }
                    maxShow={ 25 }
                    onClickItem={ ( item ) => { setNotesActiveNode( item ); } }
                />
            ) }
        </div>
    );
};

export default NotesLeftSidebarContent;

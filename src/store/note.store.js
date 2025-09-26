
import {
    devtools,
    subscribeWithSelector,
    combine,
    persist
} from 'zustand/middleware';
import { create } from 'zustand';
import * as utils from 'akashatools';
import API from '@/lib/services/api';
import { findAbsolutePath, findNodeByAbsolutePath, updateNodeWithNewFileOrFolder } from '@/lib/utilities/note';
import useGlobalStore from './global.store';
import { ZUSTAND_NOTES_STORE_DIRECTORY_NAME, ZUSTAND_NOTES_STORE_STORAGE_NAME } from '@/lib/config/constants';
import { FILE_TYPES } from '@/lib/config/config';
import { stringAsColor } from '@/lib/utilities/color';

const generateRandomNode = ( path = [], parentId = '' ) => {
    let id = utils.rand.randString( 32 );
    return {
        _id: `file-${ id }`,
        title: `${ utils.rand.randString( 32 ) }`,
        itemType: 'file',
        subType: FILE_TYPES[ Math.floor( Math.random( 0, FILE_TYPES.length ) ) ],
        path: [ ...( path && Array.isArray( path ) && path?.length > 0 ? path : [] ), parentId ],
        parentId: parentId,
        updatedAt: new Date(
            Math.floor( Math.random( new Date().getFullYear() - 2, new Date().getFullYear() + 2 ) ),
            Math.floor( Math.random( 1, 12 ) ),
            Math.floor( Math.random( 1, 30 ) ),
        )
    };
};

// ALL data for notes
const createNoteDataSlice = ( set, get, api ) => ( {
    // Notes Data
    notesData: null,
    setNotesData: ( notesData ) => set( () => ( { notesData } ) ),

    // Actions
    addNote: ( newNote ) => {
        set( ( state ) => ( {
            notesData: [ ...state.notesData, newNote ],
        } ) );

        return newNote;
    },

    createNote: ( note, parentId = null ) => {
        const workspaceId = useGlobalStore.getState().workspaceId;
        const user = useGlobalStore.getState().user;

        // If given a parentId, find that note, copy its path, and add the parentId to that array to set as the new note's path array.
        let path = [];
        if ( parentId ) {
            const parent = get().getNoteById( parentId );
            if ( parent ) {
                path = [ ... ( parent?.path || [] ), {
                    value: parentId,
                    title: parent?.title || parent?._id,
                } ];
            }
        }

        const newNote = {
            // id: Date.now().toString(),
            date: note.date || new Date(),
            parentId: note.parentId || parentId,
            userId: note.userId || user?.id,
            workspaceId: workspaceId,
            title: note.title || "New Note",
            banner: note.banner || "",
            logo: note.logo || "",
            icon: note.icon || "",
            content: note.content || "",
            contents: note.contents || [],
            color: note.color || stringAsColor( note?.title || utils.rand.randString( 8 ) ),
            // position: note.position || { x: Math.random() * 300, y: Math.random() * 200 },
            size: note.size || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: note.isPinned || false,
            inTrash: note.inTrash || false,
            isActive: note.isActive || true,
            tags: note.tags || [],
            categories: note.categories || [],
            metadata: new Map(),
            path: path || [],
            subType:
                note?.title && note?.title.length > 0
                    ? ( ( note?.title.endsWith( ".pdf" )
                        || note?.title.endsWith( ".jpg" )
                        || note?.title.endsWith( ".png" ) )
                        ? ( "image" )
                        : ( note?.title.endsWith( ".docx" )
                            || note?.title.endsWith( ".txt" )
                            ? ( "txt" )
                            : ( note?.title.endsWith( ".js" )
                                || note?.title.endsWith( ".ts" )
                                ? ( "code" )
                                : ( note?.title.endsWith( ".rar" ) || note?.title.endsWith( ".zip" )
                                    ? ( "folder" )
                                    : ( note?.title.endsWith( ".md" )
                                        ? ( "markdown" )
                                        : ( note?.title.endsWith( ".json" )
                                            ? ( "json" )
                                            : ( note?.title.endsWith( ".html" )
                                                ? ( "html" )
                                                : ( "custom" ) ) ) ) ) ) ) )
                    : ( 'custom' ),
            itemType:
                note?.title && note?.title.length > 0
                    ? ( ( note?.title.endsWith( ".pdf" )
                        || note?.title.endsWith( ".jpg" )
                        || note?.title.endsWith( ".png" ) )
                        ? ( "asset" )
                        : ( note?.title.endsWith( ".docx" )
                            || note?.title.endsWith( ".txt" )
                            || note?.title.endsWith( ".md" )
                            || note?.title.endsWith( ".json" )
                            || note?.title.endsWith( ".html" )
                            || note?.title.endsWith( ".js" )
                            || note?.title.endsWith( ".ts" )
                            ? ( "file" )
                            : ( note?.title.endsWith( ".rar" )
                                || note?.title.endsWith( ".zip" )
                                ? "folder"
                                : "folder" ) ) )
                    : ( 'custom' ),
            ...note,
        };

        return newNote;
    },

    updateNote: ( id, updates ) => {
        set( ( state ) => ( {
            notesData: state.notesData.map( ( note ) =>
                note._id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note,
            ),
        } ) );
    },

    deleteNote: ( id ) => {
        set( ( state ) => ( {
            notesData: state.notesData.filter( ( note ) => note._id !== id ),
            notesActiveNode: state.notesActiveNode === id ? null : state.notesActiveNode,
        } ) );
    },

    cloneNote: ( id ) => {
        const note = get().notesData.find( ( n ) => n._id === id );
        if ( note ) {
            const duplicate = {
                ...note,
                id: Date.now().toString(),
                title: `${ note.title } (Copy)`,
                position: {
                    x: note.position.x + 20,
                    y: note.position.y + 20,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            set( ( state ) => ( {
                notesData: [ ...state.notesData, duplicate ],
            } ) );

            return duplicate;
        }
    },

    getNoteById: ( id ) => {
        const { notesData } = get();
        return notesData.find( ( item ) => item?._id === id ) || null;
    },

    // Utility functions
    getNotesByTag: ( tag ) => {
        return get().notesData.filter( ( note ) => note.tags.includes( tag ) );
    },

    getPinnedNotes: () => {
        return get().notesData.filter( ( note ) => note.isPinned );
    },

    getRecentNotes: ( limit = 5 ) => {
        return get()
            .notesData.sort( ( a, b ) => new Date( b.updatedAt ) - new Date( a.updatedAt ) )
            .slice( 0, limit );
    },

    searchNotes: ( query, caseInsensitive = true, sort = false ) => {
        const lowerQuery = caseInsensitive ? query.toLowerCase() : query;
        return get().notesData.filter(
            ( note ) =>
                note?.title?.toLowerCase().includes( lowerQuery ) ||
                note?.content?.toLowerCase().includes( lowerQuery ) ||
                note?.tags?.some( ( tag ) => tag?.toLowerCase()?.includes( lowerQuery ) ),
        );
    },


    togglePin: ( id ) => {
        set( ( state ) => ( {
            notesData: state.notesData.map( ( note ) =>
                note._id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() } : note,
            ),
        } ) );
    },

    clearAllNotes: () => {
        if ( confirm( "Are you sure you want to delete ALL notes? This cannot be undone." ) ) {
            set( { notesData: [], notesActiveNode: null } );
        }
    },

    clearNoteData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( {
            notesData: [],
            recentNotesData: [],
            notesActiveNode: null,
            stickyNotesData: [],
            notesDirectoryTree: [],
        } );
    },

    // Backup and sync functions
    backupToServer: async ( workspaceId ) => {
        try {
            const { notesData } = get();
            const backupData = {
                notesData,
                timestamp: new Date().toISOString(),
                version: "1.0",
            };

            await notesService.createNote( {
                workspaceId,
                path: [ "sticky-notes-backup", `backup-${ Date.now() }` ],
                itemType: "file",
                subType: "json",
                title: `Sticky Notes Backup ${ new Date().toLocaleDateString() }`,
                content: JSON.stringify( backupData, null, 2 ),
                tags: [ "backup", "sticky-notes" ],
                categories: [ "system" ],
            } );

            set( { lastBackup: new Date().toISOString() } );
            return true;
        } catch ( error ) {
            console.error( "Failed to backup to server:", error );
            throw error;
        }
    },

    restoreFromServer: async ( backupContent ) => {
        try {
            const backupData = JSON.parse( backupContent );
            if ( backupData.notes && Array.isArray( backupData.notes ) ) {
                set( {
                    notes: backupData.notes,
                    selectedNote: null,
                    lastBackup: backupData.timestamp,
                } );
                return true;
            }
            throw new Error( "Invalid backup format" );
        } catch ( error ) {
            console.error( "Failed to restore from server:", error );
            throw error;
        }
    },

    exportToJSON: () => {
        const { notesData } = get();
        const exportData = {
            notesData,
            timestamp: new Date().toISOString(),
            version: "1.0",
        };

        const blob = new Blob( [ JSON.stringify( exportData, null, 2 ) ], {
            type: "application/json",
        } );

        const url = URL.createObjectURL( blob );
        const a = document.createElement( "a" );
        a.href = url;
        a.download = `sticky-notes-${ new Date().toISOString().split( "T" )[ 0 ] }.json`;
        document.body.appendChild( a );
        a.click();
        document.body.removeChild( a );
        URL.revokeObjectURL( url );
    },

    importFromJSON: ( file ) => {
        return new Promise( ( resolve, reject ) => {
            const reader = new FileReader();
            reader.onload = ( e ) => {
                try {
                    const importData = JSON.parse( e.target.result );
                    if ( importData.notesData && Array.isArray( importData.notesData ) ) {
                        set( {
                            notesData: importData.notesData,
                            notesActiveNode: null,
                        } );
                        resolve( importData.notesData.length );
                    } else {
                        reject( new Error( "Invalid file format" ) );
                    }
                } catch ( error ) {
                    reject( error );
                }
            };
            reader.onerror = () => reject( new Error( "Failed to read file" ) );
            reader.readAsText( file );
        } );
    },

    // Array of recently accessed files in Notes.
    recentNotesData: null,
    setRecentNotesData: ( recentNotesData ) => {
        set( () => ( { recentNotesData } ) );
    },
} );

// ALL data for notes
const createScratchpadDataSlice = ( set, get, api ) => ( {
    // Notes Data
    stickyNotesData: [
        {
            id: "1",
            title: "Shopping List",
            content: "Milk\nEggs\nBread\nCheese\nApples",
            date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
            folder: "notes",
        },
        {
            id: "2",
            title: "Meeting Notes",
            content: "Discuss project timeline\nReview quarterly goals\nAssign new tasks",
            date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
            folder: "notes",
        },
        {
            id: "3",
            title: "Ideas",
            content: "App concept for productivity\nNew workout routine\nWeekend trip planning",
            date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
            folder: "notes",
        },
        {
            id: "4",
            title: "Books to Read",
            content: "1. Atomic Habits\n2. Deep Work\n3. The Psychology of Money\n4. Project Hail Mary",
            date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
            folder: "notes",
        },
        {
            id: "5",
            title: "Travel Plans",
            content: "Flight on May 15th\nHotel reservation\nPlaces to visit:\n- Museum\n- Beach\n- Downtown",
            date: new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDay() ),
            folder: "notes",
        }
    ],
    setStickyNotesData: ( stickyNotesData ) => {
        set( () => ( { stickyNotesData } ) );
    },

    // Array of recently accessed files in Notes.
    stickyNotesGroupsData: [],
    setStickyNotesGroupsData: ( stickyNotesGroupsData ) => {
        set( () => ( { stickyNotesGroupsData } ) );
    },

    // Array of recently accessed files in Notes.
    recentStickyNotesData: [],
    setRecentStickyNotesData: ( recentStickyNotesData ) => {
        set( () => ( { recentStickyNotesData } ) );
    },

    // Dynamically get all current groups/folders for stickynotes
    getFoldersOfStickyNotes: () => {
        const { stickyNotesData, setStickyNotesGroupsData } = get();
        let folders = [ "all" ];
        if ( utils.val.isValidArray( stickyNotesData, true ) ) {
            stickyNotesData.forEach( ( note ) => {
                if ( note?.folder ) {
                    let folder = note?.folder;
                    if ( !folders.includes( folder ) ) {
                        folders.push( folder );
                    }
                }
            } );
        }

        // setStickyNotesGroupsData( folders );
        return folders;
    },
} );

const createNoteDirectorySlice = ( set, get, api ) => ( {
    // Full directory tree for files and folders
    notesDirectoryTree: null,
    setNotesDirectoryTree: ( notesDirectoryTree ) =>
        set( () => ( { notesDirectoryTree } ) ),
    fetchNotesDirectoryTree: async () => {
        const workspaceId = useGlobalStore.getState().workspaceId;
        if ( !workspaceId ) {
            console.error( "Workspace ID is required." );
            return;
        }
        try {
            set( { loading: true, error: null } );
            const response = await API.get( `/api/app/note/path/explorer?workspaceId=${ workspaceId }` );
            console.log( "note.store.js :: fetchNotesDirectoryTree :: response = ", response );
            set( { notesDirectoryTree: response.data.data } );
        } catch ( err ) {
            set( { error: err.response?.data?.message || "Error fetching notes tree" } );
        } finally {
            set( { loading: false } );
        }
    },

    notesDirectoryPath: (
        localStorage.getItem( ZUSTAND_NOTES_STORE_DIRECTORY_NAME )
            ? JSON.parse(
                localStorage.getItem(
                    ZUSTAND_NOTES_STORE_DIRECTORY_NAME,
                )
            )
            : []
    ),

    // notesDirectoryPath: JSON.parse( localStorage.getItem( 'mindspace-app-notes-directory-path' ) ) || [],
    // setNotesDirectoryPath: ( path ) => {
    //     localStorage.setItem( 'mindspace-app-notes-directory-path', JSON.stringify( path ) );
    //     set( () => ( { notesDirectoryPath: path } ) );
    // },

    setNotesDirectoryPath: ( path ) => {
        // Save to localstorage.
        localStorage.setItem(
            ZUSTAND_NOTES_STORE_DIRECTORY_NAME,
            JSON.stringify( path )
        );
        console.log( "note.store.js :: setNotesDirectoryPath :: path = ", path );
        set( () => ( { notesDirectoryPath: path } ) );
    },

    setNotesDirectoryPathBack: () => {
        const { notesDirectoryPath } = get();
        if ( utils.val.isValidArray( notesDirectoryPath, true ) ) {
            if ( notesDirectoryPath.length > 1 ) {
                // let newPath = notesDirectoryPath.pop();
                let newPath = [ ...notesDirectoryPath ];
                newPath.pop();
                set( () => ( { notesDirectoryPath: newPath } ) );
            }
        }
    },

    findObjectByPath: ( path ) => {
        const { notesDirectoryTree } = get();
        if ( !notesDirectoryTree ) {
            console.error( "Directory tree is not loaded." );
            return null;
        }
        return findNodeByAbsolutePath( notesDirectoryTree, path );
    },

    findPathById: ( targetId ) => {
        const { notesDirectoryTree } = get();
        if ( !notesDirectoryTree ) {
            console.error( "Directory tree is not loaded." );
            return null;
        }
        return findAbsolutePath( notesDirectoryTree, targetId );
    },
} );

const createNoteFolderSlice = ( set, get, api ) => ( {
    // Folders Data
    foldersData: null,
    setFoldersData: ( foldersData ) => set( () => ( { foldersData } ) ),

    // The currently open / active folder (top of directory ID)
    notesActiveFolder: null,
    setNotesActiveFolder: ( notesActiveFolder ) =>
        set( () => ( { notesActiveFolder } ) ),

    notesActiveFolderContents: [],
    setNotesActiveFolderContents: ( notesActiveFolderContents ) =>
        set( () => ( { notesActiveFolderContents } ) ),

} );

const createNoteFileSlice = ( set, get, api ) => ( {
    // Files Data
    filesData: null,
    setFilesData: ( filesData ) => set( () => ( { filesData } ) ),

    // The currently open file / document
    notesActiveFile: null,
    setNotesActiveFile: ( notesActiveFile ) => set( () => ( { notesActiveFile } ) ),

    // Recently accessed files.
    notesRecentFiles: null,
    setNotesRecentFiles: ( notesRecentFiles ) =>
        set( () => ( { notesRecentFiles } ) ),

} );

const createSelectedNodeSlice = ( set, get, api ) => ( {
    notesActiveNode: false,
    setNotesActiveNode: ( notesActiveNode ) =>
        set( () => ( { notesActiveNode } ) ),
} );

const createRequestSlice = ( set, get, api ) => ( {
    // Fetch request variables
    requestFetchTree: false,
    setRequestFetchTree: ( requestFetchTree ) =>
        set( () => ( { requestFetchTree } ) ),
} );


const createDebugSlice = ( set, get, api ) => ( {
    // Fetch result helper variables
    loading: false,
    setLoading: ( loading ) => set( () => ( { loading } ) ),

    error: null,
    setError: ( error ) => set( () => ( { error } ) ),
} );


const useNotesStore = create(
    // devtools( ( set, get, api ) => ( {  } ),
    devtools(
        persist(
            ( ...a ) => ( {
                // Combine other sub-store slices. 
                ...createNoteDataSlice( ...a ),
                ...createScratchpadDataSlice( ...a ),
                ...createNoteDirectorySlice( ...a ),
                ...createSelectedNodeSlice( ...a ),
                ...createNoteFolderSlice( ...a ),
                ...createNoteFileSlice( ...a ),
                ...createRequestSlice( ...a ),
                ...createDebugSlice( ...a ),
            } ),
            {
                name: [ ZUSTAND_NOTES_STORE_STORAGE_NAME ],
                partialize: ( state ) => ( {
                    notesData: state.notesData,
                    recentNotesData: state.recentNotesData,
                    notesActiveNode: state.notesActiveNode,
                    stickyNotesData: state.stickyNotesData,
                    recentStickyNotesData: state.recentStickyNotesData,
                    stickyNotesGroupsData: state.stickyNotesGroupsData,
                    // foldersData: state.foldersData,
                    // notesActiveFolder: state.notesActiveFolder,
                    // notesActiveFolderContents: state.notesActiveFolderContents,
                    // filesData: state.filesData,
                    // notesActiveFile: state.notesActiveFile,
                    // notesRecentFiles: state.notesRecentFiles,
                } ),
                getStorage: () => localStorage
            }
        )
    ),
);


export default useNotesStore;

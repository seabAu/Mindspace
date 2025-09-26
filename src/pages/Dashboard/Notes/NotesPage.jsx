import React, { useContext, createContext, useEffect, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import useNotes from '@/lib/hooks/useNotes';
import { Button } from '@/components/ui/button';
import * as utils from 'akashatools';
import { ArrowBigLeft, File, FilePlus, Files, Folder, FolderPlus, Folders, LucideLayoutGrid, RefreshCcw, RefreshCwIcon, Save, Trash } from 'lucide-react';
import Droplist from '@/components/Droplist';
import Content from '@/components/Page/Content';
import useNotesStore from '@/store/note.store';
import useGlobalStore from '@/store/global.store';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTENT_HEADER_HEIGHT, ROUTE_NOTES_ACTIVE_FILE_NAME, ROUTES_NOTE_PAGE, ROUTES_NOTES } from '@/lib/config/constants';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import NoteDialog from '@/features/Note/blocks/Dialog/NoteDialog';
import PropertiesView from '@/features/Note/blocks/Details/PropertiesView';
import { Separator } from '@/components/ui/separator';
import NoteDialogWrapper from '@/features/Note/blocks/Dialog/NoteDialogWrapper';
import Nav from '@/components/Nav/Nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { NotepadWidget } from '@/features/Dashboard/blocks/widgets/Notepad';
import FileExplorerTreeView from '@/features/Note/blocks/FileExplorer/FileExplorerView';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { buttonListToSchema } from '@/lib/utilities/nav';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { NotesEditor } from '@/features/Note/blocks/Editor/NotesEditor';
import { twMerge } from 'tailwind-merge';
import useNotification from '@/lib/hooks/useNotification';


const NotesPage = ( props ) => {

    const {
        useNavBar = true,
        useButtons = true,
        useBreadcrumbs = true,
        useRefresh = true,
        children,
    } = props;

    const {
        debug, setDebug,
        schemas,
        workspaceId, setWorkspaceId,
        data, getData,
    } = useGlobalStore();

    const {
        requestFetchTree, setRequestFetchTree,
        notesData, setNotesData,
        recentNotesData, setRecentNotesData,
        notesActiveNode, setNotesActiveNode,
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
        // view, setView, handleSetView, handleGetView,

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
        handleBuildDirectoryTree,
        handleBuildTreeFromCurrentData,
    } = useNotes();

    const {
        GetLocal,
        SetLocal,
    } = useLocalStorage();

    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    let allData = getData();

    const path = pathname?.split( '/' );
    const endpoint = path?.[ path.indexOf( 'notes' ) + 1 ];
    // console.log( "PlannerPage :: pathname = ", endpoint );

    const handleGetView = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = localStorage.getItem( ROUTES_NOTE_PAGE );
        if ( !t || t === '' ) { return endpoint ?? 'explorer'; }
        return t;
    };

    const [ view, setView ] = useState( handleGetView() ?? endpoint ); // 'explorer' | 'editor' | 'properties'

    // const [ view, setView ] = useState( handleGetView() );
    // setView( handleGetView() );
    const handleSetView = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        setView( t );
        localStorage.setItem( ROUTES_NOTE_PAGE, t );
    };

    useEffect( () => {
        setView( endpoint );
    }, [ endpoint ] );

    const buttonClassNames = `savebtn rounded-md px-2 py-1 rounded-lg items-center justify-center outline-none focus-within:outline-none focus-visible:outline-none focus:outline-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`;

    const buildEditorTopButtons = useCallback(
        () => {
            return (
                <div className={ `flex flex-grow w-full flex-row h-8 justify-between items-center` }>
                    <div className={ `flex flex-row flex-shrink items-center justify-between w-1/4 px-4` }>

                        { useButtons === true && (
                            <div className={ `flex flex-row items-start justify-between` }>
                                <Button
                                    key={ `notes-page-header-controls-btn-${ 'savefile' }` }
                                    className={ `px-1 py-1 ${ buttonClassNames }` }
                                    size={ `xs` }
                                    variant={ `ghost` }
                                    onClick={ () => { handleSaveFile( notesActiveNode ); } }
                                >
                                    <Save className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
                                </Button>

                                <Button
                                    key={ `notes-page-header-controls-btn-${ 'deletefile' }` }
                                    className={ `px-1 py-1 ${ buttonClassNames }` }
                                    size={ `xs` }
                                    variant={ `ghost` }
                                    onClick={ () => { handleNodeDelete( notesActiveNode?._id ); } }
                                >
                                    <Trash className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
                                </Button>

                                { useRefresh === true && (
                                    <>
                                        <Button
                                            variant={ 'outline' }
                                            size={ 'xs' }
                                            // className={ `!h-9 rounded-xl border border-[${ 0.125 }rem] border-dashed` }
                                            className={ `px-4 py-2 m-0 ${ buttonClassNames }` }
                                            onClick={ handleRefreshNotes }
                                        >
                                            <RefreshCcw className={ `p-0 m-0 size-6 hover:animate-rotate transition-all` } />
                                        </Button>
                                    </>
                                ) }
                            </div>
                        ) }

                        {/* { useBreadcrumbs === true && (
                            <ExplorerBreadcrumbs
                                title={ "Currently open note's title goes here." }
                                path={ notesDirectoryPath }
                                tree={ notesDirectoryTree } />
                        ) } */}
                    </div>

                    <div className={ `flex flex-row flex-grow items-center justify-center w-3/4 max-w-3/4 px-4` }>
                        <ButtonGroup
                            parentRoute={ `./notes` }
                            containerClassNames={ `mx-4 my-4 !hover:bg-transparent !border-transparent` }
                            dropdownMenuClassNames={ `bg-transparent hover:bg-transparent !p-0 m-0` }
                            dropdownTriggerClassNames={ `` }
                            dropdownContentClassNames={ `` }
                            buttonClassNames={ `!h-full` }
                            // buttons={ plannerBtns }
                            buttons={ buttonListToSchema( ROUTES_NOTES, endpoint, ( value ) => { handleSetView( value ); } ) }
                            activeValue={ view }
                            setActiveValue={ setView }
                            dropdownTriggerIcon={ <LucideLayoutGrid className={ `p-1 h-8` } /> }
                            responsiveMode={ 'dropdown' }
                            responsiveBreakpoint={ 980 }
                            rounded={ false }
                        />
                    </div>

                </div>
            );
        }
        , [ notesActiveNode, notesDirectoryPath, notesDirectoryTree ] );

    useEffect( () => {
        setView( endpoint );
    }, [ endpoint ] );

    // Make sure to preload schemas. 
    useEffect( () => {
        // Load schema on component mount.
        /* if ( !utils.val.isDefined( fileSchema ) || !utils.val.isDefined( folderSchema ) ) {
            handleGetSchemas();
        } */

        handleGetSchemas();
    }, [ schemas ] );

    useEffect( () => {
        // On workspace ID change, fetch events and other data.
        console.log( "NotesPage :: useEffect for fetchRecentNotesOnWorkspaceChange triggered :: trigger param values = ", workspaceId );
        fetchRecentNotesOnWorkspaceChange();
    }, [ workspaceId ] );

    useEffect( () => {
        console.log( "NotesPage :: useEffect for fetchTreeOnRequest triggered :: trigger param values = ", workspaceId, requestFetchTree );
        fetchTreeOnRequest();
    }, [ workspaceId, requestFetchTree ] );

    return (
        <Content.Container
            // className={ `!h-[100%] !min-h-[100%] !max-h-[100%] w-full !items-stretch !justify-start rounded-xl gap-2` }
            className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !px-2` }
            // className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] !overflow-hidden !items-start !justify-start rounded-[${ 0.25 }rem] p-0 m-0 gap-0 mx-auto my-auto max-w-full ` }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem` } }
            centered={ false }
        >

            <Content.Header className={ `rounded-xl border !h-min` }>
                {/* <ExplorerNavHeader
                    useNav={ true }
                    useButtons={ true }
                    useBreadcrumbs={ true }
                    useRefresh={ true }
                    view={ view }
                    setView={ setView }
                    handleGetView={ handleGetView }
                    handleSetView={ handleSetView }
                /> */}
                <Content.Header className={ `rounded-xl flex !flex-row justify-between items-center w-full h-8` }>
                    { ( buildEditorTopButtons( useButtons, useBreadcrumbs, useRefresh ) ) }
                </Content.Header>
            </Content.Header>

            <Content.Body
                // className={ `h-full !overflow-hidden` }
                className={ twMerge(
                    // `sticky`,
                    // `relative flex flex-col gap-2 !min-h-full !h-full !max-h-full !min-w-full !w-full !max-w-full !overflow-hidden`,
                    // `!h-[92.5vh] !max-h-[92.5vh] !min-h-[92.5vh]`,
                    `min-h-[calc(90vh_-_var(--header-height))] h-[calc(90vh_-_var(--header-height))] !max-h-[calc(90vh_-_var(--header-height))]`,
                ) }
                // style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 5 ) }rem` } }
                centered={ false }
            >
                <>
                    {/* <div className={ `!h-[90vh] !min-h-[90vh] !max-h-[100%] w-full rounded-xl gap-2 overflow-hidden` }> */ }
                    <Routes>

                        <Route path={ `scratchPad` } element={ <NotepadWidget /> } />

                        <Route
                            path={ `explorer` }
                            element={
                                <FileExplorerTreeView
                                    data={ notesDirectoryTree }
                                    // setContent={ setNotesData }
                                    selectedNode={ notesActiveNode }
                                    onNodeCreate={ handleNodeCreate }
                                    onNodeUpdate={ handleNodeUpdate }
                                    onNodeDelete={ handleNodeDelete }
                                    onNodeRename={ handleNodeRename }
                                    onNodeSelect={ handleNodeSelect }
                                // onPathUpdate={ handleNodePathUpdate }
                                />
                            }
                        />

                        <Route path={ `editor` } element={
                            <NotesEditor
                                activeNode={ notesActiveNode }
                                setActiveNode={ setNotesActiveNode }
                                content={ notesActiveNode?.content || "No content found?" }
                                onContentUpdate={ ( data ) => {
                                    console.log( "NotesPage :: NotesEditor :: onContentUpdate :: data = ", data );
                                    // Update local.
                                    setNotesActiveNode( { ...notesActiveNode, content: data } );

                                    // Update server.
                                    handleNodeUpdate( { ...notesActiveNode, content: data }, notesActiveNode?.itemType );
                                } }
                                onContentClear={ () => {
                                    console.log( "NotesPage :: NotesEditor :: onContentClear :: notesActiveNode.content = ", notesActiveNode?.content );
                                    // Update local.
                                    setNotesActiveNode( { ...notesActiveNode, content: "" } );

                                    // Update server.
                                    handleNodeUpdate( { ...notesActiveNode, content: "" }, notesActiveNode?.itemType );
                                } }
                            />
                        } />

                        <Route path={ `stickyNotes` } element={ <NotepadWidget /> } />

                    </Routes>
                </>
            </Content.Body>

            <NoteDialogWrapper />
        </Content.Container>
    );
};


export default NotesPage;

/*
    <Button
        key={ `notes-page-header-controls-btn-${ 'back' }` }
        className={ `px-1 py-1 ${ buttonClassNames }` }
        size={ `xs` }
        variant={ `ghost` }
        onClick={ () => {
            handleGoBack();
        } }
    >
        <ArrowBigLeft className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
    </Button> 
    
    <Button
        key={ `notes-page-header-controls-btn-${ 'newfile' }` }
        className={ `px-1 py-1 ${ buttonClassNames }` }
        size={ `xs` }
        variant={ `ghost` }
        onClick={ () => {
            console.log( "DirectoryTree :: Folder :: New File Btn clicked. Creating a new file under the folder with id = ", notesActiveNode );
            // handleCreateFile( element );
            handleCreateFileStart( notesActiveNode?.parentId );
        } }
    >
        <FilePlus className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
    </Button>

    <Button
        key={ `notes-page-header-controls-btn-${ 'newfolder' }` }
        className={ `px-1 py-1 ${ buttonClassNames }` }
        // className={ `p-0 right-0 absolute ${ buttonClassNames }` }
        size={ `xs` }
        variant={ `ghost` }
        onClick={ () => {
            console.log( "DirectoryTree :: Folder :: Create New Folder Btn clicked." );
            handleCreateFolderStart( notesActiveNode?.parentId );
        } }
    >
        <FolderPlus className={ `size-auto aspect-square stroke-[0.2rem] p-0 m-0` } />
    </Button> 
*/

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useTask from '@/lib/hooks/useTask';
import * as utils from 'akashatools';
import { Button } from '@/components/ui/button';
import { EllipsisIcon, LucideFilter, LucideLayoutGrid, Plus, PlusCircleIcon, RefreshCcw, Box, House, PanelsTopLeft, LucideNotebookTabs, LucideNotebookPen, Database } from 'lucide-react';
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Content from '@/components/Page/Content';
import { CONTENT_HEADER_HEIGHT, ROUTES_TASK_PAGE, tasksUpcomingDate } from '@/lib/config/constants';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/Loader/Spinner';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { isPastDue } from '@/lib/utilities/time';
import { twMerge } from 'tailwind-merge';
import { ScrollAreaThumb, ScrollAreaViewport, Scrollbar } from '@radix-ui/react-scroll-area';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { addDays, differenceInHours } from 'date-fns';
// import TaskDialogWrapper from '@/features/Task/components/Dialog/TaskDialogWrapper';

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBatchUpdates } from '@/lib/hooks/useBatchUpdates';
import { useHotkeys } from 'react-hotkeys-hook';
import { KanbanView } from '@/features/Todo/views/kanban-view';
import { DetailedListView } from '@/features/Todo/views/detailed-list-view';
import { BasicListView } from '@/features/Todo/views/basic-list-view';
import { TableView } from '@/features/Todo/views/table-view';
import { CalendarView } from '@/features/Todo/views/calendar-view';
import { ViewSwitcher } from '@/features/Todo/blocks/Header/view-switcher';
import { UpdateQueueStatus } from '@/features/Todo/update-queue-status';
import { TodoDialog } from '@/features/Todo/blocks/Dialog/task-dialog';
import TodoDataTableView from '@/features/Todo/blocks/DataTable/TodoDataTableView';
import TaskDialog from '@/features/Todo/blocks/Dialog/TaskDialog';
import TaskDialogWrapper from '@/features/Todo/blocks/Dialog/TaskDialogWrapper';
import NotesDrawer from '@/features/Todo/components/NotesDrawer/NotesDrawer';
// import { updateTask } from '@/features/Task/lib/api';
// import { deleteTask } from '@/features/Todo/lib/actions/kanban-actions';

const TodoPage = ( props ) => {
    const {
        settings,
        options,
        classNames,
    } = props;
    const { GetLocal, SetLocal } = useLocalStorage();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    let endpoint = path?.[ path.indexOf( 'task' ) + 1 ];
    // console.log( "TodoPage => TasksContainer :: props = ", props );

    const {
        debug, setDebug,
        data, setData, getData,
        schemas, getSchema,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    let allData = getData();

    const {
        // Values
        setGroupByFieldMode, groupByFieldMode,
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
        columns, setColumns,
        columnOrder, setColumnOrder,
        showEmptyGroups, setShowEmptyGroups,
        groups, setGroups,
        createGroup, addGroup, updateGroup, deleteGroup,
        customGroups, setCustomGroups,
        groupByField, setGroupByField,
        currentView, setCurrentView,
        todoLists, setTodoLists,
        activeListId, setActiveListId,
        getTaskById,
        addSubTask,
        createTask, addTask, updateTask, deleteTask,

        // Functions
        initColumns, // Initialize task groups on original load.
        buildTaskColumns, // Old, unused.
        buildTaskGroupsData, /// Re-initialize the task groups after a change.
        buildTaskGroups,
        filteredColumns, setFilteredColumns, getFilteredColumns,
        getFilteredTaskColumns,
    } = useTasksStore();

    const {
        // VARIABLES
        // HANDLER FUNCTIONS
        handleInitializeTodoData,
        handleFetchTodoData,
        handleClearTodoData,
        taskData, setTaskData,
        initializeNewTask,
        // handleInitializeTaskGroups,
        DatePickerOptions: DATE_PICKER_OPTIONS,
        handleSyncData,
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTodayTasks,
        handleGetTasksDueBy,
        handleSort,
        handleOpenTaskNotes,
        handleFetchTasks,
        handleFetchTodoLists,
        handleFetchTodoListGroups,
        handleClone,
        // handleDelete,
        handleDeleteTask,
        handleDeleteStart,
        handleDeleteSubmit,
        handleCreateTask,
        handleCreateSubmit,
        handleCreateStart,
        handleUpdateTask,
        handleEditStart,
        handleEditSubmit,
        handleCancel,
        handleToggleComplete,
        // handleEditChange,
        buildTaskDialog,
        handleChange,
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleSubmitRouting,
        handleCreateTaskGroup,
        handleUpdateTaskGroup,
        handleDeleteTaskGroup,

        // GETTERS / SETTERS
        dialogInitialData, setDialogInitialData,
        taskColumns, setTaskColumns,
        taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        isEditing, setIsEditing,
        isCreating, setIsCreating,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogSchema, setDialogSchema,
        notesOpen, setNotesOpen,
        notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        filters, setFilters,
        sort, setSort,

        // SCHEMA
        taskSchema, setTaskSchema,
        taskListSchema, setTaskListSchema,
        taskListGroupSchema, setTaskListGroupSchema,
        goalSchema, setGoalSchema,
        handleGetSchemas,
        getSchemaForDataType,
        loading, setLoading,
        error, setError,
        loadingTasks, setLoadingTasks,
        errorTasks, setErrorTasks,
    } = useTask();

    // const filteredColumns = getFilteredColumns();

    const handleGetPageView = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = GetLocal( ROUTES_TASK_PAGE );
        endpoint = (
            utils.val.isValidArray( path, true )
                ? ( path.length > path.indexOf( 'todo' )
                    ? ( path?.[ path.indexOf( 'todo' ) + 1 ] )
                    : ( path?.[ path.indexOf( 'todo' ) ] ) )
                : ( null )
        );
        if ( !t || t === '' ) { return endpoint ?? 'list'; }
        return t;
    };

    const [ pageView, setPageView ] = useState( handleGetPageView );
    const [ activeStatusFilters, setActiveStatusFilters ] = useState( [] );
    const [ activePriorityFilters, setActivePriorityFilters ] = useState( [] );
    const [ activeDifficultyFilters, setActiveDifficultyFilters ] = useState( [] );
    const [ tasksLocalData, setTasksLocalData ] = useState( null );

    const [ isAddTaskDialogOpen, setIsAddTaskDialogOpen ] = useState( false );
    const [ selectedColumnId, setSelectedColumnId ] = useState( null );

    const overdueTasks = useMemo( () => ( handleGetOverdueTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const todayDueTasks = useMemo( () => ( handleGetTodayTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const upcomingDueTasks = useMemo( () => ( handleGetTasksDueBy( tasksLocalData, addDays( new Date( Date.now() ), tasksUpcomingDate ) ) ), [ tasksLocalData ] );
    const pinnedTasks = useMemo( () => ( handleGetPinnedTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const currentTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => !isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData ] );
    const pastDueTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData ] );

    // Set up batch updates
    const { pendingUpdates, isProcessing } = useBatchUpdates( {
        interval: 3000, // Process updates every 3 seconds
        onProcessComplete: () => {
            console.log( 'Updates processed successfully' );
        },
    } );

    // Add keyboard shortcut for adding a task
    useHotkeys( 'ctrl+shift+k', ( event ) => {
        event.preventDefault();
        setSelectedColumnId( null );
        setIsAddTaskDialogOpen( true );
    } );

    // Get the active list
    const activeList = todoLists?.find( ( list ) => list._id === activeListId ) || {};

    useEffect( () => {
        // Load schemas
        if ( schemas && utils.val.isObject( schemas ) ) {
            if ( taskSchema === null ) setTaskSchema( getSchema( 'task' ) );
            if ( taskListSchema === null ) setTaskListSchema( getSchema( 'todoList' ) );
            if ( taskListGroupSchema === null ) setTaskListGroupSchema( getSchema( 'todoListGroup' ) );
            if ( goalSchema === null ) setGoalSchema( getSchema( 'goal' ) );
        }
    }, [] );

    useEffect( () => {
        // Load schema on component mount.
        handleGetSchemas();
    }, [ schemas ] );
    
    useEffect( () => {
        // Initialize data on component mount.
        handleInitializeTodoData();

        // On groupByFieldMode change, update columns.
        // initColumns();
        buildTaskGroupsData();
    }, [] );

    useEffect( () => {
        // Re-fetch data on changing active list Id.
        // handleClearTodoData();
        handleFetchTodoData();
    }, [ workspaceId ] );


    useEffect( () => {
        // if ( tasksData && customGroups ) setGroups( buildTaskGroups( tasksData, customGroups ) );
        setGroups( buildTaskGroups( tasksData, customGroups ) );
    }, [ customGroups, tasksData ] );

    let refData = getData();

    useEffect( () => {
        if ( dialogOpen ) { }
        if ( isCreating ) setDialogType( 'add' );
        if ( isEditing ) setDialogType( 'edit' );
    }, [ dialogOpen, isCreating, isEditing ] );

    const handleClickTask = ( t ) => {
        // Opens the notes and a summary in an aside / sheet view.
        setNotesOpen( true );
        setNotesContent( { ...t } );
    };

    const filteredTasks =
        useMemo( () =>
        ( utils.val.isValidArray( tasksLocalData, true )
            ? ( tasksLocalData?.filter( ( task ) =>
                ( activeStatusFilters.length === 0 || activeStatusFilters.includes( task?.status ) )
                && ( activePriorityFilters.length === 0 || activePriorityFilters.includes( task?.priority ) )
                && ( activeDifficultyFilters.length === 0 || activeDifficultyFilters.includes( task?.difficulty ) )
            ) )
            : ( [] )
        )
            , [
                activeStatusFilters,
                activePriorityFilters,
                activeDifficultyFilters,
                tasksLocalData,
                // tasksData,
            ] );

    useEffect( () => {
        console.log( "TodoPage :: On tasksData update :: tasksData = ", tasksData );
        if ( utils.val.isValidArray( tasksData, true ) ) {
            setTasksLocalData( tasksData );
        }
    }, [ tasksData ] );

    const updateTodoGroup = async ( data ) => {
        let result = await handleUpdateTaskGroup( data );
        if ( result ) {
            updateGroup( result?._id ?? data?._id, result );
        }
    };

    const createTodoGroup = async ( data ) => {
        let newColumn = createGroup( data );
        let result = await handleCreateTaskGroup( newColumn );
        // if ( result ) addGroup( result );
    };

    const deleteTodoGroup = async ( id ) => {
        if ( id ) {
            let result = await handleDeleteTaskGroup( id, false );
            if ( result ) { deleteGroup( id ); }
        }
    };

    return (
        <Content.Container
            className={ `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] overflow-hidden !px-2` }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT - 2.5 ) }rem` } }
            centered={ false }
        >

            <Content.Header className={ `!flex-shrink !justify-center !items-center w-full flex flex-row h-min border space-x-2 space-y-2` }>
                {/* Nav buttons */ }
                <div className='todo-page-header-widgets relative w-full m-2'>
                    {/* Banner image */ }
                    { activeList?.bannerImage && (
                        <div
                            className='absolute inset-0 h-16 bg-cover bg-center opacity-30'
                            style={ {
                                backgroundImage: `url(${ activeList.bannerImage })`,
                                backgroundSize: 'cover',
                            } }
                        />
                    ) }

                    <div className='flex flex-col gap-2 justify-between w-full sticky'>
                        <div className='flex flex-shrink items-center justify-start'>
                            <h1 className='text-lg font-bold'>
                                { activeList?.title || 'Tasks' }
                                {/* TODO :: Add a title edit button here. */ }
                            </h1>
                        </div>

                        <div className='flex w-full items-center justify-start sticky gap-2'>
                            {/* Top bar with controls */ }
                            <div className='flex flex-shrink items-center justify-start'>
                                <Button
                                    size={ 'sm' }
                                    variant={ 'ghost' }
                                    className={ `px-2 py-2 m-0 focus:outline-none !h-7 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                                    onClick={ () => {
                                        handleCreateStart( {}, 'task' );
                                        setSelectedColumnId( null );
                                        setIsAddTaskDialogOpen( true );
                                    } } // Open dialog and init edit. 
                                >
                                    <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                                    <h6 className={ `text-center self-center object-center w-full text-base` }>{ ` New ` }</h6>
                                </Button>

                                {/* <Button
                                    size={ 'sm' }
                                    variant={ 'ghost' }
                                    className={ `px-2 py-2 m-0 focus:outline-none !h-7 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                                    onClick={ () => { handleCreateStart( {}, 'task' ); } } // Open dialog and init edit. 
                                >
                                    <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                                    <h6 className={ `text-center self-center object-center w-full text-base` }>{ ` New ` }</h6>
                                </Button> */}

                                <Button
                                    size={ 'xs' }
                                    variant={ 'ghost' }
                                    className={ `px-4 py-3 m-0 focus:outline-none self-center w-auto focus-within:outline-none focus-visible:outline-none border !h-7` }
                                    onClick={ ( e ) => { e.preventDefault(); setGroupByFieldMode( !groupByFieldMode ); } }
                                >
                                    { groupByFieldMode
                                        ? ( <LucideNotebookTabs className={ `p-0 m-0 !size-4` } /> )
                                        : ( <LucideNotebookPen className={ `p-0 m-0 !size-4` } /> ) }
                                </Button>

                                <Button
                                    size={ 'xs' }
                                    variant={ 'ghost' }
                                    className={ `px-4 py-3 m-0 focus:outline-none self-center w-auto focus-within:outline-none focus-visible:outline-none border rounded-r-full !h-7` }
                                    onClick={ () => {
                                        handleSyncData();
                                    } }
                                >
                                    <RefreshCcw className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                                </Button>
                            </div>

                            <ViewSwitcher />

                        </div>
                    </div>
                </div>
                {/* 
                <TaskStats
                    tasksLocalData={ tasksLocalData }
                    filteredTasks={ filteredTasks }
                    currentTasks={ currentTasks }
                    pastDueTasks={ pastDueTasks }
                    overdueTasks={ overdueTasks }
                    todayDueTasks={ todayDueTasks }
                    upcomingDueTasks={ upcomingDueTasks }
                    pinnedTasks={ pinnedTasks }
                /> */}

            </Content.Header>

            <div className={ `relative content-body-container !w-full !min-w-full !max-w-full !overflow-hidden` }>

                <Content.Body
                    className={ twMerge(
                        // `sticky`,
                        `relative flex flex-col gap-2 !min-h-full !h-full !max-h-full !min-w-full !w-full !max-w-full !overflow-hidden`,
                        `!h-[92.5vh] !max-h-[92.5vh] !min-h-[92.5vh]`,
                        "bg-background",
                        `min-h-[calc(90vh_-_var(--header-height))] h-[calc(90vh_-_var(--header-height))] !max-h-[calc(90vh_-_var(--header-height))]`,
                    ) }
                    style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem` } }
                    centered={ false }
                >
                    <div className={ `flex-1 flex flex-col overflow-x-auto overflow-y-hidden overflow-hidden !h-[92.5vh] !max-h-[92.5vh] !min-h-[92.5vh] sticky gap-2` }>

                        <ScrollArea
                            className={ twMerge(
                                `scroll-area-container task-interface-container !w-full !max-w-full !p-0 mb-16 gap-0`,
                                `rounded-[${ 0.5 }rem] relative inset-0 border-2 border-primary-purple-50/10`,
                                // `h-[92.5vh] !max-h-[92.5vh] !min-h-[92.5vh]`,
                                `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] !px-2`,
                            ) }
                        >
                            {/* { renderCurrentView() } */ }
                            {/* { utils.val.isValidArray( filteredColumns ) && ( */ }
                            { filteredColumns && (
                                <TodoPageViews
                                    currentView={ currentView }
                                    tasks={ tasksLocalData }
                                    setTasks={ setTasksLocalData }
                                    columns={ columns }
                                    setColumns={ setColumns }
                                    filteredColumns={ filteredColumns }
                                    onCreateTodoGroup={ ( data ) => handleCreateTaskGroup( data ) }
                                    onUpdateTodoGroup={ ( data ) => handleUpdateTaskGroup( data ) }
                                    onDeleteTodoGroup={ ( data ) => handleDeleteTaskGroup( id, true ) }
                                    onAddTask={ () => setIsAddTaskDialogOpen( true ) }
                                    onCreateTask={ async ( data ) => {
                                        let result = await handleCreateTask( data );
                                        if ( result ) addTask( result, null );
                                    } }
                                    addTask={ addTask }
                                    createTask={ createTask }
                                    // onCreateTaskSubmit={ }
                                    // onUpdateTaskInit={ }
                                    // onUpdateTaskSubmit={ }
                                    onDeleteTask={ async ( data ) => {
                                        deleteTask( data?._id );
                                        let result = await handleDeleteTask( data );
                                    } }
                                    deleteTask={ deleteTask }
                                    onUpdateTask={ async ( data, key, value ) => {
                                        let result = await handleUpdateTask( { ...data, [ key ]: value } );
                                        if ( result ) {
                                            updateTask( data?._id, result );
                                        }
                                    } }
                                    updateTask={ updateTask }
                                    onMoveSubtask={ async ( taskId, currentParentId, newParentTaskId ) => {
                                        let task = getTaskById( taskId );
                                        let currentParentTask = getTaskById( parentTaskId );
                                        let newParentTask = getTaskById( newParentId );

                                        // Update the parent ID in the changed task.
                                        task = { ...task, parentTaskId: newParentTaskId };
                                        let taskResult = await handleUpdateTask( task );
                                        updateTask( taskId, taskResult ?? task );

                                        // Update the subtasks array in the current and new parent tasks, if applicable.
                                        // Remove from current parent's subTaskIds array.
                                        if ( currentParentTask ) {
                                            currentParentTask = { subtaskIds: currentParentTask?.subtaskIds?.filter( ( id ) => id !== taskId ) };
                                            let currentParentResult = await handleUpdateTask( currentParentTask );
                                            updateTask( currentParentTask?._id, currentParentResult );
                                        }

                                        // Add to new parent's subTaskIds array.
                                        if ( newParentTask ) {
                                            newParentTask = { subtaskIds: [ ...newParentTask?.subtaskIds, taskId ] };
                                            let newParentResult = await handleUpdateTask( newParentTask );
                                            updateTask( currentParentTask?._id, newParentResult );
                                        }
                                    } }
                                    onCreateSubTask={ async ( data, parentTaskId ) => {
                                        let result = await handleCreateTask( { ...data, parentKeyId: parentTaskId } );
                                        if ( result ) addSubTask( result );
                                    } }
                                />
                            ) }

                            <ScrollBar orientation="horizontal" />
                            <Scrollbar orientation="vertical" />

                        </ScrollArea>

                        {/* </div> */ }

                        <TodoDialog
                            open={ isAddTaskDialogOpen }
                            onOpenChange={ setIsAddTaskDialogOpen }
                            groupId={ selectedColumnId }
                        />

                        {/* Show update queue status */ }
                        <UpdateQueueStatus
                            pendingUpdates={ pendingUpdates.length }
                            isProcessing={ isProcessing }
                        />
                    </div>


                </Content.Body>
            </div>

            { <NotesDrawer
                isOpen={ notesOpen }
                onOpen={ () => {
                    // setNotesContent( selectedTask );
                    setNotesOpen( true );
                } }
                onClose={ () => {
                    // setNotesContent( null );
                    setNotesOpen( false );
                } }
                task={ notesContent }
                setTask={ ( t ) => { setNotesContent( t ); } }
                onDeleteNotes={ ( notes ) => {
                    if ( handleUpdateTask ) handleUpdateTask( { ...notesContent, notes: [ '' ] } );
                } }
                onUpdateNotes={ ( notes ) => {
                    // let t = { ...notesContent, notes: notes };
                    if ( handleUpdateTask ) handleUpdateTask( { ...notesContent, notes: notes } );
                } }
            /> }

            <TaskDialogWrapper />

            { dialogType === 'add' && (
                <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, 'task' ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ dialogDataType ?? 'task' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'edit' && (
                <TaskDialog
                    data={ dialogData ?? selectedTask }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, 'task' ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType ?? 'task' }
                    debug={ debug }
                />
            ) }

        </Content.Container>
    );
};

const TaskStats = ( props ) => {
    const {
        tasksLocalData = [],
        filteredTasks = [],
        currentTasks = [],
        pastDueTasks = [],
        upcomingTasks = [],
        pinnedTasks = [],
    } = props;

    return (
        <>
            <div className={ `w-full flex flex-row flex-grow` }>
                <h2 className={ `text-sm h-min font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ tasksLocalData?.length } Tasks (${ filteredTasks?.length })` }
                </h2>
                <h2 className={ `text-sm h-min font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ upcomingTasks?.length } Upcoming` }
                </h2>
                <h2 className={ `text-sm h-min font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ currentTasks?.length } Current` }
                </h2>
                <h2 className={ `text-sm h-min font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ pastDueTasks?.length } Past-Due` }
                </h2>
                <h2 className={ `text-sm h-min font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ pinnedTasks?.length } Pinned` }
                </h2>
            </div>
        </>
    );
};

const TodoPageViews = ( props ) => {
    const {
        currentView,
        // tasks, setTasks,
        // columns, setColumns,
        // filteredColumns,
        // onCreateTodoGroup,
        // onUpdateTodoGroup,
        // onDeleteTodoGroup,
        // onCreateSubTask,
        // onMoveSubtask,
        // onCreateTaskInit, onCreateTaskSubmit,
        // onUpdateTaskInit, onUpdateTaskSubmit,
        // onDeleteTask,
    } = props;

    // Memoize the current view component to prevent unnecessary re-renders
    const renderCurrentView = useCallback( () => {
        switch ( currentView ) {
            case 'kanban': return ( <KanbanView { ...props } /> );
            case 'detailed-list': return ( <DetailedListView { ...props } /> );
            case 'basic-list': return ( <BasicListView { ...props } /> );
            case 'data-table': return ( <TodoDataTableView { ...props } /> );
            case 'table': return ( <TableView { ...props } /> );
            case 'calendar': return ( <CalendarView { ...props } /> );
            default: return ( <KanbanView { ...props } /> );
        }
    }, [ currentView ] );

    return (
        <>{ renderCurrentView() }</>
    );
};


export default TodoPage;

/* useEffect( () => {
    console.table( {
        "Component: ": "::: USETASK ::: ",
        "tasksData": tasksData,
        "selectedTask": selectedTask,
        "filters": filters,
        "taskList": taskList,
        "dialogOpen": dialogOpen,
        "dialogData": dialogData,
        "dialogInitialData": dialogInitialData,
        "dialogType": dialogType,
        "dialogSchema": dialogSchema,
        "dataModel": dataModel,
        "confirmed": confirmed,
        "isEditing": isEditing,
        "isCreating": isCreating,
        "taskSchema": taskSchema,
        "taskListSchema": taskListSchema,
        "goalSchema": goalSchema,
        "notesOpen": notesOpen,
        "notesContent": notesContent,
        "isDrawerOpen": isDrawerOpen,
        "visibleColumns": visibleColumns,
        "sort": sort,
    }, [ 'name', 'value' ] );
}, [
    tasksData,
    selectedTask,
    filters,
    taskList,
    dialogOpen,
    dialogData,
    dialogInitialData,
    dialogType,
    dialogSchema,
    dataModel,
    confirmed,
    isEditing,
    isCreating,
    taskSchema,
    taskListSchema,
    goalSchema,
    notesOpen,
    notesContent,
    isDrawerOpen,
    visibleColumns,
    sort,
] ); */

/*  <Routes>
        <Route
            path={ '' }
            element={
                <TaskList
                    tasks={ tasksLocalData }
                    setTasks={ setTasksLocalData }
                    // tasks={ filteredTasks }
                    // setTasks={ setTasksLocalData }
                    fetchTasks={ handleFetchTasks }
                    updateTask={ handleUpdateTask }
                    createTask={ handleCreateTask }
                    deleteTask={ handleDeleteStart }
                    reorderTasks={ handleBulkReorderTasks }
                    onClickTask={ handleClickTask }
                    activeFilters={ {
                        status: activeStatusFilters,
                        priority: activePriorityFilters,
                        difficulty: activeDifficultyFilters,
                    } }
                    layout={ [] }
                    options={ [] }
                    classNames={ `` }
                    { ...props }
                />
            }
        />

        <Route
            path={ 'today' }
            element={
                <TaskList
                    tasks={ tasksLocalData }
                    setTasks={ setTasksLocalData }
                    pastDueTasks={ pastDueTasks }
                    // reorderTasks={ handleReorderTasks }
                    reorderTasks={ handleBulkReorderTasks }
                    updateTask={ handleUpdateTask }
                    createTask={ handleCreateTask }
                    deleteTask={ handleDeleteTask }
                    fetchTasks={ handleFetchTasks }
                    onClickTask={ handleClickTask }
                    groupBy={ 'dueDate' }
                    activeFilters={ {
                        status: activeStatusFilters,
                        priority: activePriorityFilters,
                        difficulty: activeDifficultyFilters,
                    } }
                />
            }
        />

        <Route
            path={ 'list' }
            element={
                <TaskList
                    tasks={ tasksLocalData }
                    setTasks={ setTasksLocalData }
                    pastDueTasks={ pastDueTasks }
                    // reorderTasks={ handleReorderTasks }
                    reorderTasks={ handleBulkReorderTasks }
                    updateTask={ handleUpdateTask }
                    createTask={ handleCreateTask }
                    deleteTask={ handleDeleteTask }
                    fetchTasks={ handleFetchTasks }
                    onClickTask={ handleClickTask }
                    groupBy={ 'status' }
                    activeFilters={ {
                        status: activeStatusFilters,
                        priority: activePriorityFilters,
                        difficulty: activeDifficultyFilters,
                    } }
                />
            }
        />

        <Route
            path={ 'table' }
            element={
                // <TaskTableView
                <TaskTableRender
                    // tasks={ filteredTasks }
                    tasks={ tasksLocalData }
                    setTasks={ setTasksLocalData }
                    loadTasks={ handleFetchTasks }
                    // reorderTasks={ handleReorderTasks }
                    reorderTasks={ handleBulkReorderTasks }
                    updateTask={ handleUpdateTask }
                    createTask={ handleCreateStart }
                    deleteTask={ handleDeleteTask }
                    fetchTasks={ handleFetchTasks }
                    onClickTask={ handleClickTask }
                    groupBy={ 'status' }
                    activeFilters={ {
                        status: activeStatusFilters,
                        priority: activePriorityFilters,
                        difficulty: activeDifficultyFilters,
                    } }
                />
            }
        />

        <Route
            path={ 'kanban' }
            element={
                // <KanbanBoard
                <KanbanRender
                    // tasks={ filteredTasks }
                    tasks={ tasksLocalData }
                    setTasks={ setTasksLocalData }
                    loadTasks={ handleFetchTasks }
                    // reorderTasks={ handleReorderTasks }
                    reorderTasks={ handleBulkReorderTasks }
                    updateTask={ handleUpdateTask }
                    createTask={ handleCreateTask }
                    deleteTask={ handleDeleteTask }
                    fetchTasks={ handleFetchTasks }
                    onClickTask={ handleClickTask }
                    activeFilters={ {
                        status: activeStatusFilters,
                        priority: activePriorityFilters,
                        difficulty: activeDifficultyFilters,
                    } }
                />
            }
        />

    </Routes>
*/


/* <TaskFilters
    classNames={ `max-h-12 min-h-6 m-0 !self-center ` }
    statusOptions={ TODO_STATUS_OPTIONS }
    priorityOptions={ TODO_PRIORITY_OPTIONS }
    difficultyOptions={ TODO_DIFFICULTY_OPTIONS }
    activeStatusFilters={ activeStatusFilters }
    activePriorityFilters={ activePriorityFilters }
    activeDifficultyFilters={ activeDifficultyFilters }
    setStatusFilters={ setActiveStatusFilters }
    setPriorityFilters={ setActivePriorityFilters }
    setDifficultyFilters={ setActiveDifficultyFilters }
    popoverTrigger={
        <Button
            className={ `px-4 py-3 m-0 focus:outline-none !h-7 w-auto focus-within:outline-none focus-visible:outline-none border-y self-center ` }
            variant={ 'ghost' }
        >
            <LucideFilter className={ `p-0 m-0 h-full !size-5` } />
        </Button>
    }
/> */

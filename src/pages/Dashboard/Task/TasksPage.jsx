import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useTask from '@/lib/hooks/useTask';
import * as utils from 'akashatools';
import { Button } from '@/components/ui/button';
import { EllipsisIcon, LucideFilter, LucideLayoutGrid, Plus, PlusCircleIcon, RefreshCcw, Box, House, PanelsTopLeft } from 'lucide-react';
// import { buildSelect } from '@/lib/utilities/input';
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { buildButtonGroup, buttonListToSchema } from '@/lib/utilities/nav';
import Content from '@/components/Page/Content';
import { CONTENT_HEADER_HEIGHT, ROUTES_TASK, ROUTES_TASK_PAGE, tasksUpcomingDate } from '@/lib/config/constants';
import ButtonGroup from '@/components/Button/ButtonGroup';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Spinner, SpinnerCSS } from '@/components/Loader/Spinner';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import TasksContainer from '@/features/Task/TasksContainer';
import Tasks from '@/features/Task/components/List';
import TaskDialog from '@/features/Task/components/Dialog/TaskDialog';
import TaskFilters from '@/features/Task/components/Filters/TaskFilters';
import KanbanBoard from '@/features/Task/components/Kanban/KanbanBoard';
import TaskGanttView from '@/features/Task/components/Gantt/TaskGanttView';
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from '@/lib/config/config';
import { isPastDue } from '@/lib/utilities/time';
import { twMerge } from 'tailwind-merge';
import { ScrollAreaThumb, ScrollAreaViewport, Scrollbar } from '@radix-ui/react-scroll-area';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { addDays, differenceInHours } from 'date-fns';
import TaskList from '@/features/Task/components/List/TaskList';
import NotesDrawer from '@/features/Task/blocks/NotesDrawer/NotesDrawer';
import TaskTableRender from '@/features/Task/components/Table/TaskTableRender';
import TaskDialogWrapper from '@/features/Task/components/Dialog/TaskDialogWrapper';

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KanbanRender from '@/features/Task/components/Kanban/Kanban';


const TasksPage = ( props ) => {
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
    // console.log( "TasksPage => TasksContainer :: props = ", props );

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
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
    } = useTasksStore();

    const {
        // VARIABLES
        // HANDLER FUNCTIONS
        DatePickerOptions: DATE_PICKER_OPTIONS,
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTodayTasks,
        handleGetTasksDueBy,
        handleSort,
        handleOpenTaskNotes,
        handleFetchTasks,
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

        // GETTERS / SETTERS
        dialogInitialData, setDialogInitialData,
        dialogSchema, setDialogSchema,
        taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        isEditing, setIsEditing,
        isCreating, setIsCreating,
        dialogData, setDialogData,
        notesOpen, setNotesOpen,
        notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        sort, setSort,
        filters, setFilters,

        // SCHEMA
        taskSchema, setTaskSchema,
        taskListSchema, setTaskListSchema,
        goalSchema, setGoalSchema,
        // taskDataSchema,
        handleGetSchemas,
        getSchemaForDataType,
        // tasks,
        loading, setLoading,
        error, setError,
        loadingTasks, setLoadingTasks,
        errorTasks, setErrorTasks,
        // fetchTasks,
        // fetchTasksByDateRange,
        // fetchTasksByDueDate,
        // fetchRecurringTasks,
        // fetchTasksByFilter,
        // createTask,
        // fetchTask,
        // updateTask,
        // deleteTask,
    } = useTask();

    // Make sure to preload schemas. 
    // useEffect( () => {
    //     handleGetSchemas();
    // }, [ schemas ] );

    useEffect( () => {
        // Load schema on component mount.
        handleGetSchemas();
        /* console.log( "TasksPage :: taskSchema :: schemas updated :: schemas = ", [
            schemas,
            taskSchema,
            taskListSchema,
            goalSchema,
        ] ); */
    }, [ schemas ] );
    let refData = getData();

    useEffect( () => {
        if ( dialogOpen ) { }
        if ( isCreating ) setDialogType( 'add' );
        if ( isEditing ) setDialogType( 'edit' );
    }, [ dialogOpen, isCreating, isEditing ] );

    useEffect( () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            if ( taskSchema === null ) setTaskSchema( getSchema( 'task' ) );
            if ( taskListSchema === null ) setTaskListSchema( getSchema( 'todoList' ) );
            if ( goalSchema === null ) setGoalSchema( getSchema( 'goal' ) );
            console.log(
                "TasksPage",
                " :: ", "Schemas just changed",
                " :: ", "taskSchema = ", taskSchema,
                " :: ", "taskListSchema = ", taskListSchema,
                " :: ", "goalSchema = ", goalSchema,
            );
        }
    }, [] );

    /* useEffect( () => {
        if ( schemas && utils.val.isObject( schemas ) ) {
            if ( taskSchema === null ) setTaskSchema( getSchema( 'task' ) );
            if ( taskListSchema === null ) setTaskListSchema( getSchema( 'todoList' ) );
            if ( goalSchema === null ) setGoalSchema( getSchema( 'goal' ) );
            // console.log( "TasksPage :: Schemas just changed :: taskSchema = ", taskSchema, " :: ", "taskListSchema = ", taskListSchema, " :: ", "goalSchema = ", goalSchema );
        }
    }, [
        taskSchema,
        taskListSchema,
        goalSchema
    ] ); */

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

    const handleGetPageView = () => {
        // Handles fetching the sub-route from local storage on component mount.
        let t = GetLocal( ROUTES_TASK_PAGE );
        endpoint = (
            utils.val.isValidArray( path, true )
                ? ( path.length > path.indexOf( 'task' )
                    ? ( path?.[ path.indexOf( 'task' ) + 1 ] )
                    : ( path?.[ path.indexOf( 'task' ) ] ) )
                : ( null )
        );
        if ( !t || t === '' ) { return endpoint ?? 'list'; }
        return t;
    };


    const [ pageView, setPageView ] = useState( handleGetPageView );
    const [ activeStatusFilters, setActiveStatusFilters ] = useState( [] );
    const [ activePriorityFilters, setActivePriorityFilters ] = useState( [] );
    const [ activeDifficultyFilters, setActiveDifficultyFilters ] = useState( [] );
    // const [ currentTasks, setCurrentTasks ] = useState( [] );
    // const [ pastDueTasks, setPastDueTasks ] = useState( [] );
    // const [ filteredTasks, setFilteredTasks ] = useState( [] );
    // const [ filteredTasks, setFilteredTasks ] = useState( [] );
    const [ tasksLocalData, setTasksLocalData ] = useState( null );

    const overdueTasks = useMemo( () => ( handleGetOverdueTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const todayDueTasks = useMemo( () => ( handleGetTodayTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const upcomingDueTasks = useMemo( () => ( handleGetTasksDueBy( tasksLocalData, addDays( new Date( Date.now() ), tasksUpcomingDate ) ) ), [ tasksLocalData ] );
    const pinnedTasks = useMemo( () => ( handleGetPinnedTasks( tasksLocalData ) ), [ tasksLocalData ] );
    const currentTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => !isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData ] );
    const pastDueTasks = useMemo( () => ( tasksLocalData?.filter( ( task ) => isPastDue( task?.timestampDue ?? task?.dueDate ) ) ), [ tasksLocalData ] );

    const handleClickTask = ( t ) => {
        // Opens the notes and a summary in an aside / sheet view.
        setNotesOpen( true );
        setNotesContent( { ...t } );
    };

    // const filteredTasks = tasksLocalData.filter(
    //     ( task ) =>
    //         ( activeStatusFilters.length === 0 || activeStatusFilters.includes( task?.status ) )
    //         &&
    //         ( activePriorityFilters.length === 0 || activePriorityFilters.includes( task?.priority ) )
    //         &&
    //         ( activeDifficultyFilters.length === 0 || activeDifficultyFilters.includes( task?.difficulty )
    //         ) );
    // const getFilteredTasks =
    //     useCallback(
    //         ( ts ) => {
    //             if ( utils.val.isValidArray( ts, true ) ) {
    //                 return (
    //                     ts?.filter( ( task ) =>
    //                         ( activeStatusFilters.length === 0 || activeStatusFilters.includes( task?.status ) )
    //                         && ( activePriorityFilters.length === 0 || activePriorityFilters.includes( task?.priority ) )
    //                         && ( activeDifficultyFilters.length === 0 || activeDifficultyFilters.includes( task?.difficulty ) )
    //                     )
    //                 );
    //             }
    //         }
    //     [ activeStatusFilters, activePriorityFilters, activeDifficultyFilters ] )
    //     // , [ tasksData ] )
    //     ;

    const handleSetPageView = ( t ) => {
        // Handles changing the sub-route. Saves it to the local storage. 
        setPageView( t );
        SetLocal( ROUTES_TASK_PAGE, t );
        // localStorage.setItem( ROUTES_TASK_PAGE, t );
    };

    useEffect( () => { setPageView( endpoint ); }, [ endpoint ] );

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
        console.log( "TasksPage :: On tasksData update :: tasksData = ", tasksData );
        if ( utils.val.isValidArray( tasksData, true ) ) {
            // let sortedTasks = handleSort( tasksData, sort );
            setTasksLocalData( tasksData );
        }
    }, [ tasksData ] );

    /*  const initTaskGroups = ( ts ) => {
            if ( utils.val.isValidArray( ts, true ) ) {
                const current = ts?.filter( ( task ) => !isPastDue( task?.dueDate ) );
                setCurrentTasks( current );
                const pastDue = ts?.filter( ( task ) => isPastDue( task?.dueDate ) );
                setPastDueTasks( pastDue );
                // const filtered = getFilteredTasks( ts );
                // setFilteredTasks( getFilteredTasks( tasksData ) );
                // setFilteredTasks( filtered );
                // console.log( "TasksPage :: [tasksData, tasksLocalData] updated :: initTaskGroups(ts) called :: tasksData = ", tasksData, " :: ", "ts = ", ts, " :: ", "tasksLocalData = ", tasksLocalData, " :: ", "current = ", current, " :: ", "pastDue = ", pastDue, " :: ", "filtered = ", filtered );
            }
        }; 
        
        useEffect( () => {
            console.log( "TasksPage :: tasksLocalData updated :: tasksLocalData = ", tasksLocalData );
            initTaskGroups( tasksLocalData );
        }, [ tasksLocalData ] );
    */

    const handleUpdateTasks = useCallback( ( updatedTask ) => {
        // let updatedTask = updateTask( { ...task, ...updates } );
        // let updatedTasks = tasksLocalData?.map( ( t, i ) => ( t?._id === updatedTask?._id ? { ...updatedTask, index: i } : { ...t, index: i } ) );
        // setTasks( updatedTasks );
        // setTasksLocalData( updatedTasks );
        // setTasksData( ( prevTasks ) => prevTasks.map( ( task ) => ( task._id === taskId ? { ...task, ...updatedTask } : task ) ) );
        setTasksData( tasksData?.map( ( task ) => ( task?._id === taskId ? { ...task, ...updatedTask } : task ) ) );
    }, [] );

    const createTask = async ( newTask ) => {
        const createdTask = handleCreateTask( newTask );
        setTasksLocalData( ( prevTasks ) => [ ...prevTasks, createdTask ] );
    };

    /* useEffect( () => {
        console.table( {
            'tasksData': tasksData,
            'isEditing': isEditing,
            'isCreating': isCreating,
            'currentTasks': currentTasks,
            'pastDueTasks': pastDueTasks,
            'filteredTasks': filteredTasks,
            'tasksLocalData': tasksLocalData,
            'activeStatusFilters': activeStatusFilters,
            'activePriorityFilters': activePriorityFilters,
            'activeDifficultyFilters': activeDifficultyFilters,
        }, [ 'name', 'value' ],
        );
    }, [
        tasksData,
        isEditing,
        isCreating,
        currentTasks,
        pastDueTasks,
        filteredTasks,
        tasksLocalData,
        activeStatusFilters,
        activePriorityFilters,
        activeDifficultyFilters,
    ] );
 */

    return (
        <Content.Container
            className={ `!w-full !min-w-full !max-w-full !h-full !max-h-full !min-h-full rounded-[${ 0.25 }rem] overflow-auto !items-start !justify-stretch !p-0 !m-0 !gap-1 mx-auto my-auto max-w-full !px-2` }
            centered={ false }
        >

            <Content.Header className={ `!flex-shrink justify-start items-center w-full flex flex-row h-8 max-h-8 border` }>
                {/* Nav buttons */ }
                <div className={ `w-auto flex flex-row !h-6` }>
                    <Button
                        size={ 'sm' }
                        variant={ 'ghost' }
                        className={ `px-2 py-2 m-0 focus:outline-none !h-7 w-auto focus-within:outline-none focus-visible:outline-none justify-center items-center border rounded-l-full self-center` }
                        onClick={ () => { handleCreateStart( {}, 'task' ); } } // Open dialog and init edit. 
                    >
                        <PlusCircleIcon className={ `p-0 m-0 h-full !size-5` } />
                        <h6 className={ `text-center self-center object-center w-full text-base` }>{ ` New ` }</h6>
                    </Button>

                    <TaskFilters
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
                    />

                    <Button
                        size={ 'xs' }
                        variant={ 'ghost' }
                        className={ `px-4 py-3 m-0 focus:outline-none self-center w-auto focus-within:outline-none focus-visible:outline-none border rounded-r-full !h-7` }
                        onClick={ () => { handleFetchTasks(); } }
                    >
                        <RefreshCcw className={ `p-0 m-0 !size-4 hover:animate-rotate transition-all` } />
                    </Button>

                </div>

                {/* <div className={ `new-task-button w-full h-6 border rounded-full overflow-hidden items-center justify-center` }> */ }
                <ButtonGroup
                    parentRoute={ `./task` }
                    containerClassNames={ `` }
                    dropdownMenuClassNames={ `bg-transparent m-0` }
                    dropdownTriggerClassNames={ `` }
                    dropdownContentClassNames={ `` }
                    // buttons={ taskPageNavBtns }
                    buttons={ buttonListToSchema( ROUTES_TASK, pageView, handleSetPageView ) }
                    activeValue={ pageView }
                    setActiveValue={ setPageView }
                    dropdownTriggerIcon={ <LucideLayoutGrid /> }
                    responsiveBreakpoint={ 980 }
                    // responsiveMode={ 'wrap' }
                    responsiveMode={ 'dropdown' }
                />

            </Content.Header>

            <div className={ `relative content-body-container !w-full !min-w-full !max-w-full !h-[90vh] !max-h-[90vh] !min-h-[90vh] ${ classNames } !overflow-hidden` }>

                <Content.Body
                    // className={ `flex flex-col gap-2 justify-center items-center h-full w-full max-w-full px-1` }
                    className={ twMerge(
                        // `sticky`,
                        `relative flex flex-col gap-2 !min-h-full !h-full !max-h-full !min-w-full !w-full !max-w-full`,
                        // " min-h-svh flex-1 flex-col bg-background p-0 sticky",
                        "bg-background/60",
                        // "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
                        // `min-h-full max-h-full max-w-full w-full flex flex-col`,
                        // `border border-[${ 0.5 }rem] border-solid border-2 rounded-[${ 0.25 }rem] flex flex-grow justify-start items-start h-full w-full max-w-full min-w-full p-2`,
                        // `overflow-y-auto overflow-x-auto`,
                        `!h-full !w-full`,
                    ) }
                    centered={ false }
                >
                    { tasksLocalData && utils.val.isValidArray( tasksLocalData, true )
                        ? ( <ScrollArea
                            className={ twMerge(
                                `scroll-area-container task-interface-container !w-full !max-w-full !min-h-[90vh] !h-full !max-h-full !p-2 mb-0 gap-0`,
                                `rounded-[${ 0.5 }rem] relative inset-0`,
                                `border-[0.200rem] border-primary-purple-50/10`,
                            ) }
                        >
                            <TaskStats
                                tasksLocalData={ tasksLocalData }
                                filteredTasks={ filteredTasks }
                                currentTasks={ currentTasks }
                                pastDueTasks={ pastDueTasks }
                                overdueTasks={ overdueTasks }
                                todayDueTasks={ todayDueTasks }
                                upcomingDueTasks={ upcomingDueTasks }
                                pinnedTasks={ pinnedTasks }
                            />
                            <Routes>

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

                                {/* Table-list view */ }
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

                                {/* </ScrollAreaViewport> */ }
                            </Routes>

                            <Scrollbar orientation="horizontal" />
                            <Scrollbar orientation="vertical" />

                        </ScrollArea>
                        )
                        : ( <Spinner
                            variant={ 'orbit' }
                            size={ 'xl' }
                            color={ 'currentColor' }
                            overlay={ true }
                            className={ `` }
                        /> ) }


                </Content.Body>
            </div>

            {/* <Content.Footer className={ `flex flex-shrink !h-8 rounded-[${ 0.25 }rem]` }> */ }

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

            {/* <TaskDialogWrapper /> */ }
            {/* </Content.Footer> */ }
            { dialogType === 'add' && isCreating && ( <TaskDialog
                data={ dialogData ?? {} }
                setData={ setDialogData }
                refData={ refData }
                dataSchema={ getSchema( 'task' ) }
                dialogOpen={ dialogOpen }
                setDialogOpen={ setDialogOpen }
                handleSubmit={ ( data ) => { handleCreateSubmit( data, 'task' ); } }
                handleChange={ handleChange }
                handleClose={ () => { handleCancel(); } }
                dialogType={ 'add' }
                dataType={ 'task' }
                debug={ debug }
            /> ) }

            { dialogType === 'edit' && isEditing && ( <TaskDialog
                data={ dialogData ?? selectedTask }
                setData={ setDialogData }
                refData={ refData }
                dataSchema={ getSchema( 'task' ) }
                dialogOpen={ dialogOpen }
                setDialogOpen={ setDialogOpen }
                handleSubmit={ ( data ) => { handleEditSubmit( data, 'task' ); } }
                handleChange={ handleChange }
                handleClose={ () => { handleCancel(); } }
                dialogType={ 'edit' }
                dataType={ 'task' }
                debug={ debug }
            /> ) }

            <>
                {/* </Content.Footer> */ }
                {/* { dialogType === 'add' && ( <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'add' || isCreating === true }
                    setDialogOpen={ ( open ) => {
                        if ( open ) { setDialogType( 'add' ); }
                        else { setDialogType( 'none' ); handleCancel(); }
                    } }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ dialogType ?? 'add' }
                    dataType={ 'task' }
                    debug={ debug }
                /> ) }

                { dialogType === 'edit' && ( <TaskDialog
                    data={ dialogData ?? selectedTask }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'edit' || isEditing === true }
                    setDialogOpen={ ( open ) => {
                        if ( open ) { setDialogType( 'edit' ); }
                        else { setDialogType( 'none' ); handleCancel(); }
                    } }
                    handleSubmit={ ( data ) => { handleEditSubmit( data ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ 'task' }
                    debug={ debug }
                /> ) } */}

                {/* Gantt Chart View */ }
                {/* <Route
                    path={ 'gantt' }
                    element={
                        <TaskGanttView
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
                            activeFilters={ {
                                status: activeStatusFilters,
                                priority: activePriorityFilters,
                                difficulty: activeDifficultyFilters,
                            } }
                        />
                    }
                /> */}

                {/* 
                <Route
                    path={ 'custom' }
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
                            activeFilters={ setTasksData }
                            layout={ [] }
                            options={ [] }
                            classNames={ `` }
                            { ...props }
                        />
                    }
                />

                <Route
                    path={ 'pinned' }
                    element={
                        <TaskList
                            tasks={ handleGetPinnedTasks( tasksLocalData ) }
                            setTasks={ setTasksLocalData }
                            loadTasks={ handleFetchTasks }
                            pastDueTasks={ pastDueTasks }
                            // reorderTasks={ handleReorderTasks }
                            reorderTasks={ handleBulkReorderTasks }
                            updateTask={ handleUpdateTask }
                            createTask={ handleCreateTask }
                            deleteTask={ handleDeleteTask }
                            fetchTasks={ handleFetchTasks }
                            // groupBy={ 'isPinned' }
                            activeFilters={ {
                                status: activeStatusFilters,
                                priority: activePriorityFilters,
                                difficulty: activeDifficultyFilters,
                            } }
                        />
                    }
                />
                */}

                {/* Datatable view with live cell entry */ }
                {/* <Route
                    path={ 'data' }
                    element={
                        <Tasks
                            tasks={ tasksLocalData }
                            setTasks={ setTasksLocalData }
                            // reorderTasks={ handleReorderTasks }
                            reorderTasks={ handleBulkReorderTasks }
                            layout={ [] }
                            options={ [] }
                            activeFilters={ {
                                status: activeStatusFilters,
                                priority: activePriorityFilters,
                                difficulty: activeDifficultyFilters,
                            } }
                            { ...props }
                        />
                    }
                /> */}

                {/* <Route
                    path={ 'custom' }
                    element={
                        <TasksContainer
                            tasks={ filteredTasks }
                            setTasks={ setTasksLocalData }
                            fetchTasks={ handleFetchTasks }
                            updateTask={ handleUpdateTask }
                            createTask={ handleCreateTask }
                            deleteTask={ handleDeleteStart }
                            reorderTasks={ handleReorderTasks }
                            // activeFilters={ setTasksData }
                            layout={ [] }
                            options={ [] }
                            classNames={ `` }
                            { ...props }
                        />
                    }
                /> */}
                {/* 
                    <Route
                        path={ 'today' }
                        element={
                            <Tasks
                                tasks={ handleGetTodayTasks( tasksLocalData ) }
                                setTasks={ setTasksLocalData }
                                // reorderTasks={ handleReorderTasks }
                                reorderTasks={ handleBulkReorderTasks }
                                layout={ [] }
                                options={ [] }
                                activeFilters={ {
                                    status: activeStatusFilters,
                                    priority: activePriorityFilters,
                                    difficulty: activeDifficultyFilters,
                                } }
                                { ...props }
                            />
                        }
                    />

                    <Route
                        path={ 'kanban' }
                        element={
                            <TaskViews
                                tasks={ tasksData }
                                setTasks={ setTasksData }
                                updateTask={ handleUpdateTask }
                                activeFilters={ setTasksData }
                                reorderTasks={ handleReorderTasks }
                                layout={ [] }
                                options={ [] }
                                { ...props }
                            />
                        }
                    />
                */}
            </>

            {/* <div className={ `w-full rounded-xl bg-muted/50 flex flex-col justify-center items-center ` }>
                    <div className={ `h-max w-full max-w-3xl rounded-xl bg-muted/50 flex flex-col justify-center items-stretch` }>
                        <div className={ `task-page-container flex flex-col items-stretch justify-stretch flex-grow` }>
                            <Tasks
                                tasks={ tasksData }
                            />
                        </div>
                    </div>
                </div>
            */}

        </Content.Container>
    );
};

const TaskTabs = ( props ) => {
    const {
        tasksLocalData = [],
        filteredTasks = [],
        currentTasks = [],
        pastDueTasks = [],
    } = props;

    return (
        <Tabs defaultValue="tab-1">
            <ScrollArea>

                <TooltipProvider delayDuration={ 0 }>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <TabsTrigger value="tab-1">
                                    <House
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={ 16 }
                                        strokeWidth={ 2 }
                                        aria-hidden="true"
                                    />
                                    Overview
                                </TabsTrigger>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="px-2 py-1 text-xs">
                            Overview
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={ 0 }>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <TabsTrigger value="tab-2" className="group">
                                    <PanelsTopLeft
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={ 16 }
                                        strokeWidth={ 2 }
                                        aria-hidden="true"
                                    />
                                    Projects
                                    <span className="relative">
                                        <PanelsTopLeft size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                        <Badge
                                            // className="ms-1.5 min-w-5 bg-primary/15 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                                            variant="secondary"
                                            className="absolute -top-2.5 left-full min-w-4 -translate-x-1.5 border-background px-0.5 text-[10px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50"
                                        >
                                            3
                                        </Badge>
                                    </span>
                                </TabsTrigger>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="px-2 py-1 text-xs">
                            Projects
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={ 0 }>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <TabsTrigger value="tab-3" className="group">
                                    <Box
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={ 16 }
                                        strokeWidth={ 2 }
                                        aria-hidden="true"
                                    />
                                    Packages
                                    <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
                                        New
                                    </Badge>
                                </TabsTrigger>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="px-2 py-1 text-xs">
                            Packages
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TabsList className="mb-3">

                </TabsList>

                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grow rounded-lg border border-border text-start">
                <TabsContent value="tab-1">
                    <p className="p-4 pt-1 text-center text-xs text-muted-foreground">Content for Tab 1</p>
                    <p className="px-4 py-1.5 text-xs text-muted-foreground">Content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab-2">
                    <p className="p-4 pt-1 text-center text-xs text-muted-foreground">Content for Tab 2</p>
                    <p className="px-4 py-1.5 text-xs text-muted-foreground">Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab-3">
                    <p className="p-4 pt-1 text-center text-xs text-muted-foreground">Content for Tab 3</p>
                    <p className="px-4 py-1.5 text-xs text-muted-foreground">Content for Tab 3</p>
                </TabsContent>
            </div>

        </Tabs>
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
            <div className={ `w-full h-full flex flex-row max-w-full px-4 py-0 top-0 content-center justify-between items-center grid grid-flow-col grid-cols-5` }>
                <h2 className={ `rounded-xl text-lg font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ tasksLocalData?.length } Tasks (${ filteredTasks?.length })` }
                </h2>
                <h2 className={ `rounded-xl text-lg font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ upcomingTasks?.length } Upcoming` }
                </h2>
                <h2 className={ `rounded-xl text-lg font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ currentTasks?.length } Current` }
                </h2>
                <h2 className={ `rounded-xl text-lg font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ pastDueTasks?.length } Past-Due` }
                </h2>
                <h2 className={ `rounded-xl text-lg font-bold text-Neutrals/neutrals-8 text-center justify-center items-center col-span-1 w-full` }>
                    { `${ pinnedTasks?.length } Pinned` }
                </h2>
            </div>
        </>
    );
};


export default TasksPage;

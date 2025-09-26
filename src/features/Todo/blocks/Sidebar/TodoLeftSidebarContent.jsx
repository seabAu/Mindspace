import React, {
    useContext,
    createContext,
    useEffect,
    useState,
    useId,
    useMemo,
} from 'react';
import {
    HashRouter,
    Navigate,
    Route,
    Router,
    Routes,
    useNavigate,
    useParams,
} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Edit,
    Trash,
    Calendar,
    List,
    Home,
    FileText,
    Settings,
    Upload,
    LayoutGrid,
    PlusSquare,
    MinusSquare,
    Copy,
} from 'lucide-react';

// Utilities
import * as utils from 'akashatools';

// Data stores
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';

import Nav from '@/components/Nav/Nav';
import { Spinner } from '@/components/Loader/Spinner';
import { Badge } from '@/components/ui/badge';
import { MdKeyboardControlKey } from 'react-icons/md';
import TaskDialog from '@/features/Todo/blocks/Dialog/TaskDialog';
import { formatDate } from '@/lib/utilities/time';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import useTask from '@/lib/hooks/useTask';
import { CONTENT_HEADER_HEIGHT } from '@/lib/config/constants';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import Collapse from '@/components/Collapsible/Collapse';

// Date picker options

// interface TodoListWithIcon {
//   id: number
//   name: string
//   isActive: boolean
//   icon?: string
//   bannerImage?: string
// }

export function TodoLeftSidebarContent () {
    const {
        workspaceId,
        debug,
        setDebug,
        schemas,
        getSchema,
        data,
        setData,
        getData,
        user,
        setUser,
        notifications,
        setNotifications,
        activeNotifications,
        setActiveNotifications,
        addNotification,
        dismissNotification,
        reminders,
        setReminders,
        activeReminders,
        setActiveReminders,
    } = useGlobalStore();

    const {
        todoLists: originalTodoLists,
        activeListId,
        setActiveList,
        createTodoList,
        addTodoList,
        updateTodoList,
        deleteTodoList,
        getAllTasks,
        requestFetchTasks,
        setRequestFetchTasks,
        selectedTask,
        setSelectedTask,
        tasksData,
        setTasksData,
        fetchTasks,
    } = useTasksStore();

    const {
        // VARIABLES
        taskData,
        setTaskData,
        initializeNewTask,
        // initialTaskData, setInitialTaskData,
        dialogInitialData,
        setDialogInitialData,
        DatePickerOptions: DATE_PICKER_OPTIONS,

        // HANDLER FUNCTIONS
        handleSort,
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTasksDueBy,
        handleGetTodayTasks,
        handleOpenTaskNotes,
        handleFetchTasks,
        handleClone,
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
        buildDialog,
        handleChange,
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleSubmitRouting,
        handleCreateTodoList,
        handleUpdateTodoList,
        handleDeleteTodoList,
        handleCreateTaskGroup,
        handleUpdateTaskGroup,
        handleDeleteTaskGroup,

        // GETTERS / SETTERS
        taskColumns,
        setTaskColumns,
        taskList,
        setTaskList,
        dialogOpen,
        setDialogOpen,
        dialogType,
        setDialogType,
        dataModel,
        setFormDataModel,
        confirmed,
        setConfirmed,
        dialogData,
        setDialogData,
        dialogDataType,
        setDialogDataType,
        dialogSchema,
        setDialogSchema,
        notesOpen,
        setNotesOpen,
        notesContent,
        setNotesContent,
        isDrawerOpen,
        setIsDrawerOpen,
        visibleColumns,
        setVisibleColumns,
        sort,
        setSort,
        filters,
        setFilters,

        // SCHEMA
        taskSchema,
        setTaskSchema,
        taskListSchema,
        setTaskListSchema,
        goalSchema,
        setGoalSchema,
        handleGetSchemas,
        getSchemaForDataType,
        loading,
        setLoading,
        error,
        setError,
        loadingTasks,
        setLoadingTasks,
        errorTasks,
        setErrorTasks,
    } = useTask();

    let refData = getData();

    // Convert todo lists to include icon and banner image and add "All Lists" option
    const allListsTodoList = {
        _id: null,
        title: 'All Lists',
        category: 'All',
        index: 0,
        tags: [],
        filters: [],
        isActive: activeListId !== null ? false : true,
        icon: 'layout-grid',
        bannerImage: '',
    };
    const todoLists = [
        allListsTodoList,
        ...( utils.val.isValidArray( originalTodoLists, true )
            ? originalTodoLists
            : [] ),
        /* .map( ( list ) => ( {
            ...list,
            icon: list.icon || "list",
            bannerImage: list.bannerImage || "",
        } ) ) */
    ];

    // Get the active list
    const activeList = utils.val.isValidArray( todoLists, true )
        ? todoLists?.find( ( list ) => list?._id === activeListId ) || todoLists[ 0 ]
        : allListsTodoList;

    const defaultTodoList = useMemo( () => ( {
        workspaceId: workspaceId,
        // index: utils.val.isValidArray( todoLists, true ) ? todoLists?.length + 1 : 0,
        // order: utils.val.isValidArray( todoLists, true ) ? todoLists?.length + 1 : 0,
        title: 'New Todo List',
        description: '',
        category: '',
        tags: [],
        filters: [],
        icon: 'list',
        bannerImage: '',
    } ), [ originalTodoLists ] );

    // Update the todoLists initialization to include "All Lists" option
    const [ isCollapsed, setIsCollapsed ] = useState( false );
    const [ isAddDialogOpen, setIsAddDialogOpen ] = useState( false );
    const [ isEditDialogOpen, setIsEditDialogOpen ] = useState( false );
    // const [ newListName, setNewListName ] = useState( '' );
    // const [ newListIcon, setNewListIcon ] = useState( 'list' );
    // const [ newListBannerImage, setNewListBannerImage ] = useState( '' );
    const [ newListData, setNewListData ] = useState( defaultTodoList );
    const [ editingList, setEditingList ] = useState( null );
    const [ dateRange, setDateRange ] = useState( '7' ); // Default to 7 days
    const [ upcomingTasks, setUpcomingTasks ] = useState( [] );

    const pinnedTasks = handleGetPinnedTasks( tasksData );
    const overdueTasks = handleGetOverdueTasks( tasksData );
    const todayDueTasks = handleGetTodayTasks( tasksData );
    const upcomingDueTasks = handleGetTasksDueBy(
        tasksData,
        addDays( new Date( Date.now() ), 28 ),
    );

    let tasksControls = [
        {
            enabled: true,
            index: 0,
            id: 'context-menu-item-task-update',
            key: 'context-menu-item-task-update',
            type: 'button',
            // shortcut: '⌘⇧U',
            name: 'editTask',
            label: 'Edit Task ',
            icon: <PlusSquare className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Task nav list :: context :: edit task :: item = ',
                    item,
                );
                handleEditStart( item, 'task' );
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 1,
            id: 'context-menu-item-task-clone',
            key: 'context-menu-item-task-clone',
            type: 'button',
            shortcut: (
                <>
                    <MdKeyboardControlKey />
                    { `C` }
                </>
            ),
            name: 'cloneTask',
            label: 'Clone Task ',
            icon: <Copy className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Task nav list :: context :: clone task :: item = ',
                    item,
                );
                handleClone( item );
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 2,
            id: 'context-menu-item-task-delete',
            key: 'context-menu-item-task-delete',
            type: 'button',
            // shortcut: '⌘⇧D',
            name: 'deleteTask',
            label: 'Delete Task',
            icon: <MinusSquare className='fa fa-2x control-button-icon icon' />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log(
                    'Task nav list :: context :: delete task :: item = ',
                    item,
                );
                if ( item && utils.val.isObject( item ) ) {
                    if ( item?._id ) {
                        handleDeleteTask( item );
                    }
                }
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
    ];

    // Update upcoming tasks when date range or active list changes
    useEffect( () => {
        const allTasks = getAllTasks();
        const today = new Date();
        today.setHours( 0, 0, 0, 0 );

        const cutoffDate = addDays( today, Number.parseInt( dateRange ) );

        const filtered = allTasks?.filter( ( task ) => {
            if ( !task?.timestampDue ) return false;

            try {
                const taskDate = new Date( task?.timestampDue );
                // Check if date is valid
                if ( isNaN( taskDate.getTime() ) ) return false;

                // Filter by active list ID (if not "All Lists")
                if ( activeListId !== 0 && task?.todoListId !== activeListId )
                    return false;

                return taskDate >= today && taskDate <= cutoffDate;
            } catch ( error ) {
                return false;
            }
        } );

        // Sort by due date
        if ( utils.val.isValidArray( filtered, true ) ) {
            filtered.sort( ( a, b ) => {
                if ( !a.timestampDue || !b.timestampDue ) return 0;
                return (
                    new Date( a.timestampDue ).getTime() -
                    new Date( b.timestampDue ).getTime()
                );
            } );
        }

        setUpcomingTasks( filtered );
    }, [ dateRange, getAllTasks, activeListId ] );

    const onCreateTodoList = async () => {
        if ( newListData?.hasOwnProperty( 'title' ) && newListData?.title?.trim() ) {
            // In a real app, you would upload the banner image to a server
            // and get back a URL. For now, we'll just store the file name.
            // let newTodoList = createTodoList( newListName, newListIcon, newListBannerImage );
            let newTodoList = createTodoList( newListData );
            let result = await handleCreateTodoList( newListData );

            if ( result ) {
                // addTodoList( result );
                setNewListData( defaultTodoList );
                // setNewListName( '' );
                // setNewListIcon( 'list' );
                // setNewListBannerImage( '' );
                setIsAddDialogOpen( false );
            }
            else {
                console.error( "onCreateTodoList :: Error creating new todo list. ", result );
            }
        }
    };

    const onUpdateTodoList = async ( data ) => {
        if ( data && data?.title.trim() ) {
            // updateTodoList(
            //     data?.id || data?._id,
            //     data?.title,
            //     data?.icon || 'list',
            //     data?.bannerImage || '',
            // );
            let result = await handleUpdateTodoList( data );
            if ( result ) {
                updateTodoList( data?.id || data?._id, result );
            }
            else {
                setEditingList( null );
                setIsEditDialogOpen( false );
            }

        }
    };

    const handleFileChange = ( e, isEdit = false ) => {
        const file = e.target.files?.[ 0 ];
        if ( file ) {
            // In a real app, you would upload this file to a server
            // For now, we'll just store the file name
            if ( isEdit && editingList ) {
                setEditingList( {
                    ...editingList,
                    bannerImage: file.name,
                } );
            } else {
                // setNewListBannerImage( file.name );
                setNewListData( {
                    ...newListData,
                    bannerImage: file
                } );
            }
        }
    };

    // Get icon component based on icon name
    const getIconComponent = (
        iconName,
        className = 'aspect-square !size-5 !stroke-2',
    ) => {
        switch ( iconName ) {
            case 'home':
                return <Home className={ className } />;
            case 'list':
                return <List className={ className } />;
            case 'file':
                return <FileText className={ className } />;
            case 'settings':
                return <Settings className={ className } />;
            case 'calendar':
                return <Calendar className={ className } />;
            case 'layout-grid':
                return <LayoutGrid className={ className } />;
            default:
                return <List className={ className } />;
        }
    };

    return (
        <>
            <Collapse
                label={
                    <div className='p-1 flex w-full justify-between items-center'>
                        <h3 className='font-medium text-base'>
                            Todo Lists
                        </h3>
                    </div>
                }
                defaultOpen={ true }
                className={ `group/collapsible` }
            >
                <SidebarGroupContent>
                    <SidebarMenu>
                        <div
                            className={ `flex flex-col items-stretch justify-stretch w-full` }>
                            { todoLists.map( ( list ) => (
                                <Button
                                    key={ list?._id }
                                    variant={
                                        list?._id === activeList?._id
                                            ? 'outline'
                                            : 'ghost'
                                    }
                                    className={ cn(
                                        'w-full justify-start h-8 border-l',
                                        isCollapsed ? 'px-2' : 'px-3',
                                    ) }
                                    onClick={ () => {
                                        console.log(
                                            'todos sidebar :: list._id = ',
                                            list._id,
                                        );
                                        setActiveList( list?._id );
                                    } }>
                                    { getIconComponent( list.icon ) }
                                    { !isCollapsed && (
                                        <span className='ml-2 truncate'>
                                            { list.title }
                                        </span>
                                    ) }

                                    { !isCollapsed &&
                                        list?._id === activeList?._id && (
                                            <div className='ml-auto flex items-center'>
                                                {/* Only show edit button for custom lists (not "All Lists") */ }
                                                { list?._id !== null && (
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-5 w-5'
                                                        onClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            setEditingList(
                                                                list,
                                                            );
                                                            setIsEditDialogOpen(
                                                                true,
                                                            );
                                                        } }>
                                                        <Edit className='h-3 w-3' />
                                                    </Button>
                                                ) }

                                                {/* Only show delete button for custom lists (not "All Lists") */ }
                                                { list?._id !== null &&
                                                    todoLists.length >
                                                    2 && (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-5 w-5 text-destructive'
                                                            onClick={ ( e ) => {
                                                                e.stopPropagation();
                                                                handleDeleteTodoList( list?._id );
                                                            } }>
                                                            <Trash className='h-3 w-3' />
                                                        </Button>
                                                    ) }
                                            </div>
                                        ) }
                                </Button>
                            ) ) }
                            <Button
                                variant='ghost'
                                className={ cn(
                                    'w-full justify-start h-8 mt-1',
                                    isCollapsed ? 'px-2' : 'px-3',
                                ) }
                                onClick={ () => setIsAddDialogOpen( true ) }>
                                <Plus className='h-4 w-4' />
                                { !isCollapsed && (
                                    <span className='ml-2'>Add List</span>
                                ) }
                            </Button>
                        </div>
                    </SidebarMenu>
                </SidebarGroupContent>
            </Collapse>

            <Separator className='my-2' />

            <Collapse
                label={
                    <div className='p-2 flex justify-between items-center'>
                        <h3 className='font-medium text-sm'>
                            Upcoming Tasks
                        </h3>
                    </div>
                }
                defaultOpen={ true }
                className={ `group/collapsible` }
            >
                <SidebarGroupContent>
                    <SidebarMenu>
                        <div
                            className={ cn(
                                'space-y-1',
                                isCollapsed && 'hidden',
                            ) }>
                            <div className='flex justify-between items-center'>
                                <Select
                                    value={ dateRange }
                                    onValueChange={ setDateRange }>
                                    <SelectTrigger className='h-6 w-28 text-xs'>
                                        <SelectValue placeholder='Select range' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        { DATE_PICKER_OPTIONS.map( ( option ) => (
                                            <SelectItem
                                                key={ option?.value }
                                                value={ option?.value }
                                                className='text-xs py-0.5'>
                                                { option?.name }
                                            </SelectItem>
                                        ) ) }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1 mt-1'>
                                { utils.val.isValidArray( upcomingTasks ) &&
                                    upcomingTasks?.length > 0 ? (
                                    upcomingTasks.map( ( task ) => (
                                        <div
                                            key={ task._id }
                                            className='flex items-start space-x-1 py-0.5 px-1 rounded hover:bg-muted/50'>
                                            <Checkbox
                                                checked={ task.isCompleted }
                                                className='h-3 w-3 mt-0.5'
                                            />
                                            <div className='flex-1 min-w-0'>
                                                <div className='text-xs font-medium truncate'>
                                                    { task.title }
                                                </div>
                                                <div className='text-xs text-muted-foreground flex items-center'>
                                                    <Calendar className='h-3 w-3 mr-0.5' />
                                                    { task.timestampDue &&
                                                        format(
                                                            new Date(
                                                                task.timestampDue,
                                                            ),
                                                            'MMM d',
                                                        ) }
                                                </div>
                                            </div>
                                        </div>
                                    ) )
                                ) : (
                                    <div className='text-xs text-muted-foreground py-1'>
                                        No upcoming tasks
                                    </div>
                                ) }
                            </div>
                        </div>
                    </SidebarMenu>
                </SidebarGroupContent>
            </Collapse>

            { utils.val.isValidArray( tasksData, true ) ? (
                <div className={ `w-full flex flex-col justify-stretch items-center` }>
                    <Nav.List
                        label={
                            <>
                                <div className={ `text-auto shadow-primary-950 shadow-md font-bold text-nowrap` }>{ `Pinned Tasks` }</div>
                                <Badge
                                    variant={ 'primary' }
                                    className={ `!bg-transparent !text-primary-500` }>
                                    { pinnedTasks?.length }
                                </Badge>
                            </>
                        }
                        useLoader={ false }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ true }
                        items={ pinnedTasks || [] }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => a?.index - b?.index }
                        activeItem={ selectedTask }
                        className={ `!justify-stretch p-0 m-0 !w-full` }
                        itemClassname={ `!p-0` }
                        onClickItem={ ( item ) => {
                            console.log(
                                'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                handleGetPinnedTasks( tasksData ),
                                ' :: ',
                                'onClickItem triggered :: item = ',
                                item,
                            );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        subtitleRender={ ( item ) =>
                            formatDate( item?.timestampDue )
                        }
                    />

                    <Nav.List
                        label={
                            <>
                                <div className={ `text-auto shadow-primary-950 shadow-md font-bold text-nowrap` }>{ `Tasks Due Today` }{ ' ' }</div>
                                <Badge
                                    variant={ 'primary' }
                                    className={ `!bg-transparent !text-primary-500` }>
                                    { todayDueTasks?.length }
                                </Badge>
                            </>
                        }
                        useLoader={ false }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ todayDueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => a?.index - b?.index }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log(
                                'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                handleGetPinnedTasks( tasksData ),
                                ' :: ',
                                'onClickItem triggered :: item = ',
                                item,
                            );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={
                            <>
                                <div className={ `text-auto shadow-primary-950 shadow-md font-bold text-nowrap` }>{ `Upcoming Due Tasks` }{ ' ' }</div>
                                <Badge
                                    variant={ 'primary' }
                                    className={ `!bg-transparent !text-primary-500` }>
                                    { upcomingDueTasks?.length }
                                </Badge>
                            </>
                        }
                        useLoader={ false }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ upcomingDueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => a?.index - b?.index }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log(
                                'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                handleGetPinnedTasks( tasksData ),
                                ' :: ',
                                'onClickItem triggered :: item = ',
                                item,
                            );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={
                            <>
                                <div className={ `text-auto shadow-primary-950 shadow-md font-bold text-nowrap` }>{ `Overdue Tasks` }{ ' ' }</div>
                                <Badge
                                    variant={ 'primary' }
                                    className={ `!bg-transparent !text-primary-500` }>
                                    { overdueTasks?.length }
                                </Badge>
                            </>
                        }
                        useLoader={ false }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ overdueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => a?.index - b?.index }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log(
                                'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                handleGetPinnedTasks( tasksData ),
                                ' :: ',
                                'onClickItem triggered :: item = ',
                                item,
                            );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={
                            <>
                                <div className={ `text-auto shadow-primary-950 shadow-md font-bold text-nowrap` }>{ `All Tasks` }{ ' ' }</div>
                                <Badge
                                    variant={ 'primary' }
                                    className={ `!bg-transparent !text-primary-500` }>
                                    { tasksData?.length }
                                </Badge>
                            </>
                        }
                        useLoader={ false }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ tasksData }
                        maxShow={ 15 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => a?.index - b?.index }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log(
                                'Dashboard :: Tasks sidebar dropdown list :: items = ',
                                tasksData,
                                ' :: ',
                                'onClickItem triggered :: item = ',
                                item,
                            );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />
                </div>
            ) : (
                <></>
            ) }

            { dialogType === 'add' && (
                <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () =>
                        setDialogType( dialogType !== 'none' ? 'none' : 'add' )
                    }
                    handleSubmit={ ( data ) => {
                        handleCreateSubmit( data, 'task' );
                    } }
                    handleChange={ handleChange }
                    handleClose={ () => {
                        handleCancel();
                    } }
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
                    dataSchema={ getSchema( dialogDataType ?? 'task' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () =>
                        setDialogType( dialogType !== 'none' ? 'none' : 'edit' )
                    }
                    handleSubmit={ ( data ) => {
                        handleEditSubmit( data, dialogDataType ?? 'task' );
                    } }
                    handleChange={ handleChange }
                    handleClose={ () => {
                        handleCancel();
                    } }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType ?? 'task' }
                    debug={ debug }
                />
            ) }

            <Dialog
                open={ isAddDialogOpen }
                onOpenChange={ setIsAddDialogOpen }>
                <DialogContent className='max-w-xs p-3 overflow-hidden'>
                    <DialogHeader className='space-y-1'>
                        <DialogTitle className='text-base'>
                            Add New List
                        </DialogTitle>
                    </DialogHeader>
                    <div className='space-y-2 py-2'>
                        <div className='space-y-1'>
                            <label className='text-xs font-medium'>
                                List Name
                            </label>
                            <Input
                                placeholder='List name'
                                value={ newListData?.title || 'New Todo List' }
                                onChange={ ( e ) => setNewListData( {
                                    ...newListData,
                                    title: e.target.value
                                } ) }
                                className='h-6 text-xs'
                            />
                        </div>

                        <div className='space-y-1'>
                            <label className='text-xs font-medium'>Icon</label>
                            <Select
                                value={ newListData?.icon || 'list' }
                                onValueChange={ ( value ) => ( setNewListData( {
                                    ...newListData,
                                    icon: value
                                } ) ) }>
                                <SelectTrigger className='h-6 text-xs'>
                                    <SelectValue placeholder='Select icon' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value='list'
                                        className='text-xs py-0.5'>
                                        <div className='flex items-center'>
                                            <List className='h-3 w-3 mr-1' />
                                            <span>List</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='home'
                                        className='text-xs py-0.5'>
                                        <div className='flex items-center'>
                                            <Home className='h-3 w-3 mr-1' />
                                            <span>Home</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='file'
                                        className='text-xs py-0.5'>
                                        <div className='flex items-center'>
                                            <FileText className='h-3 w-3 mr-1' />
                                            <span>File</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='calendar'
                                        className='text-xs py-0.5'>
                                        <div className='flex items-center'>
                                            <Calendar className='h-3 w-3 mr-1' />
                                            <span>Calendar</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='settings'
                                        className='text-xs py-0.5'>
                                        <div className='flex items-center'>
                                            <Settings className='h-3 w-3 mr-1' />
                                            <span>Settings</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-1'>
                            <label className='text-xs font-medium'>
                                Banner Image
                            </label>
                            <div className='flex items-center space-x-1'>
                                <Button
                                    variant='outline'
                                    className='h-6 text-xs'
                                    onClick={ () =>
                                        document
                                            .getElementById( 'banner-upload' )
                                            ?.click()
                                    }>
                                    <Upload className='h-3 w-3 mr-1' />
                                    Upload Image
                                </Button>
                                <Input
                                    id='banner-upload'
                                    type='file'
                                    accept='image/*'
                                    className='hidden'
                                    onChange={ ( e ) => handleFileChange( e ) }
                                />
                                { newListData?.bannerImage && (
                                    <span className='text-xs max-w-[120px] truncate overflow-hidden text-ellipsis'>
                                        { newListData?.bannerImage }
                                    </span>
                                ) }
                            </div>
                        </div>
                    </div>
                    <DialogFooter className='pt-1'>
                        <Button
                            variant='outline'
                            className='h-6 text-xs'
                            onClick={ () => setIsAddDialogOpen( false ) }>
                            Cancel
                        </Button>
                        <Button
                            className='h-6 text-xs'
                            onClick={ onCreateTodoList }>
                            Add List
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={ isEditDialogOpen }
                onOpenChange={ setIsEditDialogOpen }>
                <DialogContent className='max-w-xs p-3 overflow-hidden'>
                    <DialogHeader className='space-y-1'>
                        <DialogTitle className='text-base'>
                            Edit List
                        </DialogTitle>
                    </DialogHeader>
                    { editingList && (
                        <div className='space-y-2 py-2'>
                            <div className='space-y-1'>
                                <label className='text-xs font-medium'>
                                    List Name
                                </label>
                                <Input
                                    placeholder='List title'
                                    value={ editingList.title }
                                    onChange={ ( e ) =>
                                        setEditingList( {
                                            ...editingList,
                                            title: e.target.value,
                                        } )
                                    }
                                    className='h-6 text-xs'
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs font-medium'>
                                    Icon
                                </label>
                                <Select
                                    value={ editingList.icon || 'list' }
                                    onValueChange={ ( value ) =>
                                        setEditingList( {
                                            ...editingList,
                                            icon: value,
                                        } )
                                    }>
                                    <SelectTrigger className='h-6 text-xs'>
                                        <SelectValue placeholder='Select icon' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value='list'
                                            className='text-xs py-0.5'>
                                            <div className='flex items-center'>
                                                <List className='h-3 w-3 mr-1' />
                                                <span>List</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value='home'
                                            className='text-xs py-0.5'>
                                            <div className='flex items-center'>
                                                <Home className='h-3 w-3 mr-1' />
                                                <span>Home</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value='file'
                                            className='text-xs py-0.5'>
                                            <div className='flex items-center'>
                                                <FileText className='h-3 w-3 mr-1' />
                                                <span>File</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value='calendar'
                                            className='text-xs py-0.5'>
                                            <div className='flex items-center'>
                                                <Calendar className='h-3 w-3 mr-1' />
                                                <span>Calendar</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem
                                            value='settings'
                                            className='text-xs py-0.5'>
                                            <div className='flex items-center'>
                                                <Settings className='h-3 w-3 mr-1' />
                                                <span>Settings</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs font-medium'>
                                    Banner Image
                                </label>
                                <div className='flex items-center space-x-1'>
                                    <Button
                                        variant='outline'
                                        className='h-6 text-xs'
                                        onClick={ () =>
                                            document
                                                .getElementById(
                                                    'edit-banner-upload',
                                                )
                                                ?.click()
                                        }>
                                        <Upload className='h-3 w-3 mr-1' />
                                        Upload Image
                                    </Button>
                                    <Input
                                        id='edit-banner-upload'
                                        type='file'
                                        accept='image/*'
                                        className='hidden'
                                        onChange={ ( e ) =>
                                            handleFileChange( e, true )
                                        }
                                    />
                                    { editingList.bannerImage && (
                                        <span className='text-xs max-w-[120px] truncate overflow-hidden text-ellipsis'>
                                            { editingList.bannerImage }
                                        </span>
                                    ) }
                                </div>
                            </div>
                        </div>
                    ) }
                    <DialogFooter className='pt-1'>
                        <Button
                            variant='outline'
                            className='h-6 text-xs'
                            onClick={ () => setIsEditDialogOpen( false ) }>
                            Cancel
                        </Button>
                        <Button
                            className='h-6 text-xs'
                            onClick={ () => { onUpdateTodoList( editingList ); } }>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

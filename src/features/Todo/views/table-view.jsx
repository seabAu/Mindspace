import { useState, useCallback, useMemo, useEffect } from "react";
import useTasksStore from "@/store/task.store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    ChevronDown,
    ChevronRight,
    GripVertical,
    Pin,
    Trash,
    Calendar,
    Clock,
    Plus,
    User,
    Tag,
    ChevronsUp,
    ChevronsDown,
    Edit,
    PinOff,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWindowSize } from "@/lib/hooks/useWindowSize";
import { TodoDialog } from "@/features/Todo/blocks/Dialog/task-dialog";
import { FilterComponent } from "@/features/Todo/blocks/Filters/FilterComponent";
import * as utils from 'akashatools';
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from "@/lib/config/config";
import { buildSelect } from "@/lib/utilities/input";
import { caseCamelToSentence } from "@/lib/utilities/string";
import useTask from "@/lib/hooks/useTask";
import { StatusSelect } from "@/features/Todo/components/Fields/StatusSelect";

export function TableView ( { onAddTask, onUpdateTask, defaultCollapsedMode = 'all', filteredColumns2 = [] } ) {
    const {
        toggleTaskCompletion,
        toggleTaskPinned,
        activeListId,
        addSubTask,
        getSubtasksOfTask,
        getTopLevelTasks,
        getTasksWithSubtasks,

        tasksData, setTasksData,
        columns, setColumns,
        groups, setGroups,
        customGroups, setCustomGroups,
        buildTaskGroupsData,
        buildTaskGroups,
        columnOrder, columnOrderMap,
        getFilteredColumns,
        groupByField, groupByFieldMode,
        tags, setTags, getTags,
        getAllTags, initTags,
        getTaskById,
        createTask, addTask, updateTask, deleteTask,
        moveTask,
        createGroup, addGroup, updateGroup, deleteGroup,
        reorderColumns,
    } = useTasksStore();

    const {
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleBulkUpdateTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleReorderTasks,
        handleOpenTaskNotes,
        // handleReorder,
        handleDragSimpleTaskEnd,
        handleDragGroupedTaskEnd,
    } = useTask();

    const [ expandedTasks, setExpandedTasks ] = useState( {} );
    const [ expandedGroups, setExpandedGroups ] = useState( {} );
    const [ expandedAllGroups, setExpandedAllGroups ] = useState( false );
    const [ isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen ] = useState( false );
    const [ selectedParentId, setSelectedParentId ] = useState( null );
    const [ newSubtaskTitle, setNewSubtaskTitle ] = useState( "" );
    const [ isAddColumnDialogOpen, setIsAddColumnDialogOpen ] = useState( false );
    const [ newColumnTitle, setNewColumnTitle ] = useState( "" );
    const [ isTaskDialogOpen, setIsTaskDialogOpen ] = useState( false );
    const [ selectedTask, setSelectedTask ] = useState( null );
    const [ filters, setFilters ] = useState( [] );
    const [ filteredTasks, setFilteredTasks ] = useState( [] );

    // Get window size for responsive columns
    const { width } = useWindowSize();
    const filteredColumns = getFilteredColumns();
    // console.log( "TableView :: groups = ", groups, " :: ", "filteredColumns = ", filteredColumns );

    // Determine visible columns based on screen width
    const getVisibleColumns = useCallback( () => {
        if ( width < 640 ) return 3; // Mobile: minimal columns
        if ( width < 1024 ) return 5; // Tablet: medium columns
        return 7; // Desktop: all columns
    }, [ width ] );

    const visibleColumns = getVisibleColumns();

    const initializeExpandedGroups = () => {
        if ( defaultCollapsedMode ) {
            switch ( defaultCollapsedMode ) {
                case 'all':
                    toggleAllGroups( true );
                    break;
                case 'first':
                    // Collapse all, then open the top one.
                    toggleAllGroups( false );
                    const firstColumnId = filteredColumns.find( ( c ) => ( c?.index === 0 ) )?.id;
                    toggleGroupExpansion( firstColumnId );
                    break;
                case 'none':
                    toggleAllGroups( false );
                    break;
                default:
                    // Assume we want them all expanded by default as a fallback option.
                    toggleAllGroups( true );
                    break;
            }
        }
    };

    // Get all tasks
    // const tasksData = useMemo( () => getAllTasks(), [ getAllTasks ] );

    // Apply filters to tasks
    /* useEffect( () => {
        if ( filters.length === 0 ) {
            setFilteredTasks( tasksData.filter( ( task ) => ( task?.todoListId === activeListId ) ) );
            return;
        }

        const filtered = tasksData
            .filter( ( task ) => ( task?.todoListId === activeListId ) )
            .filter( ( task ) => {
                return filters.every( ( filter ) => {
                    const value = filter.value.toLowerCase();

                    switch ( filter.field ) {
                        case "title":
                            return task?.title.toLowerCase().includes( value );
                        case "description":
                            return task?.description?.toLowerCase().includes( value ) || false;
                        case "status":
                            return task?.status?.toLowerCase().includes( value ) || false;
                        case "priority":
                            return task?.priority?.toLowerCase().includes( value ) || false;
                        case "tags":
                            return task?.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) );
                        case "assignee":
                            return task?.user?.name.toLowerCase().includes( value ) || false;
                        default:
                            return true;
                    }
                } );
            } );

        setFilteredTasks( filtered );
    }, [ filters, tasksData, activeListId ] ); */

    // Group tasks by status
    /* const tasksByStatus = useMemo( () => {
        const grouped = {};

        // Create an entry for each group
        if ( utils.val.isValidArray( columns, true ) ) {

            columns?.forEach( ( group ) => {
                if ( group && group?.hasOwnProperty( 'id' ) ) {
                    grouped[ group?.id.toString() ] = [];
                }
            } );

            // Only include top-level tasks (not subtasks)
            filteredTasks
                .filter( ( task ) => ( task?.todoListId === activeListId ) )
                .filter( ( task ) => !task?.parentTaskId )
                .forEach( ( task ) => {
                    // Find the group this task belongs to
                    const group = columns?.find( ( col ) => col.tasks.some( ( t ) => t.id === task?._id ) );

                    if ( group ) {
                        const groupId = group?._id.toString();
                        if ( !grouped[ groupId ] ) {
                            grouped[ groupId ] = [];
                        }
                        grouped[ groupId ].push( task );
                    }
                } );

            // Sort tasks within each group
            Object.keys( grouped ).forEach( ( groupId ) => {
                grouped[ groupId ].sort( ( a, b ) => {
                    // Pinned tasks first
                    if ( a.isPinned && !b.isPinned ) return -1;
                    if ( !a.isPinned && b.isPinned ) return 1;

                    // Then by due date (if available)
                    if ( a.timestampDue && b.timestampDue ) {
                        return new Date( a.timestampDue ).getTime() - new Date( b.timestampDue ).getTime();
                    }

                    return 0;
                } );
            } );

        }

        return grouped;
    }, [ filteredTasks, columns ] ); */

    // Get subtasks for a given parent task
    const getSubtasks = useCallback(
        ( parentTaskId ) => {
            // return getSubtasksOfTask().filter( ( task ) => task?.parentTaskId === parentTaskId );
            return getSubtasksOfTask( parentTaskId );
        },
        [ getSubtasksOfTask, tasksData ],
    );

    // Toggle group expansion
    const toggleGroupExpansion = ( groupId ) => {
        setExpandedGroups( ( prev ) => ( {
            ...prev,
            [ groupId ]: !prev[ groupId ],
        } ) );
    };

    // Toggle expand/collapse all groups
    const toggleAllGroups = ( mode ) => {
        const expanded = {};
        if ( groups && utils.val.isValidArray( groups, true ) ) {
            groups.forEach( ( group ) => {
                if ( mode === true ) expanded[ group?._id ] = true; // Toggle expanded
                else if ( mode === false ) expanded[ group?._id ] = false; // Toggle collapsed
                else expanded[ group?._id ] = mode; // Flip expanded state. 
            } );
            setExpandedGroups( expanded );
            setExpandedAllGroups( mode );
        }
    };

    const toggleExpanded = ( taskId ) => {
        setExpandedTasks( ( prev ) => ( {
            ...prev,
            [ taskId ]: !prev[ taskId ],
        } ) );
    };

    const toggleColumnExpanded = ( groupId ) => {
        setExpandedGroups( ( prev ) => ( {
            ...prev,
            [ groupId ]: !prev[ groupId ],
        } ) );
    };


    const handleAddSubtask = async () => {
        if ( !selectedParentId || !newSubtaskTitle.trim() ) return;

        // Find the parent task. 
        const parentTask = getTaskById( selectedParentId );

        // Create new subtask document.
        let newSubTask = {
            title: newSubtaskTitle,
            parentTaskId: selectedParentId,
            todoListId: activeListId,
            todoListGroupId: parentTask.todoListGroupId ?? null,
            workspaceId: parentTask.workspaceId,
            user: parentTask.user,
            userId: parentTask.userId,
        };

        let newSubTaskData = createTask( selectedParentId, newSubTask );

        // Send to server.
        let result = await handleCreateTask( newSubTaskData );
        if ( result ) {
            // Success, close and revert values.
            addSubTask( selectedParentId, newSubTaskData );
            setNewSubtaskTitle( "" );
            setIsAddSubtaskDialogOpen( false );
        }
        else {
            // Something went wrong.
            console.error( "Error occurred when creating a new subtask." );
        }
    };

    const handleAddColumn = () => {
        if ( !newColumnTitle.trim() ) return;

        addGroup( { title: newColumnTitle } );
        setNewColumnTitle( "" );
        setIsAddColumnDialogOpen( false );
    };

    const handleEdit = ( task ) => {
        setSelectedTask( task );
        setIsTaskDialogOpen( true );
    };

    const handleDelete = async ( task ) => {
        // Update the data store.
        deleteTask( task._id );

        // Update the server after. 
        let deletedTask = await handleDeleteTask( task );
    };

    const handleChange = async ( task, name, value ) => {
        // TODO :: Implement the queued updating system here. Add these changes to the queue and begin the timer if it's not running already. 
        console.log( "Table-view :: handleChange :: task, name, value = ", task, name, value );
        if ( task && name && task?.hasOwnProperty( name ) ) {
            updateTask( task?._id, { ...task, [ name ]: value } );
            const result = await handleUpdateTask( { ...task, [ name ]: value } );
            console.log( "Todo :: table-view :: handleChange :: ", task, name, value, " :: ", "result = ", result );
        }
    };

    // Apply filters to tasks
    useEffect( () => {
        // Initialize the collapsed / expanded groups based on passed props. 
        initializeExpandedGroups();
    }, [ filters, tasksData, activeListId ] ); // Only depend on filters and tasksData

    // // Get sorted tasks for this group
    // const sortedTasks = useMemo( () => {
    //     if ( !utils.val.isValidArray( group?.taskIds, true ) ) return [];

    //     return group.taskIds
    //         .map( ( taskId ) => getTaskById( taskId ) )
    //         .filter( Boolean )
    //         .sort( ( a, b ) => {
    //             // First try to sort by todoListGroupIndex
    //             if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
    //                 return a.todoListGroupIndex - b.todoListGroupIndex;
    //             }
    //             // Fall back to index if todoListGroupIndex is not available
    //             return ( a.index || 0 ) - ( b.index || 0 );
    //         } );
    // }, [ group?.taskIds, getTaskById ] );

    // Render a task row with its subtasks
    const renderTaskRow =
        useCallback(
            ( task, index, groupId ) => {
                const subtasks = getSubtasks( task?._id );
                const isExpanded = expandedTasks[ task?._id ];

                if ( task?.hasOwnProperty( '_id' ) ) {
                    return (
                        <Draggable
                            key={ task?._id }
                            index={ task?.index }
                            draggableId={ task?._id }
                        >
                            { ( provided, snapshot ) => (
                                <div
                                    ref={ provided.innerRef }
                                    { ...provided.dragHandleProps }
                                    { ...provided.draggableProps }
                                    className={ `${ snapshot.isDragging ? "opacity-70" : "" }` }
                                >
                                    <div className="bg-card rounded-md border shadow-sm mb-1">
                                        {/* Task Row */ }
                                        <div className="p-1.5 flex items-center space-x-1">
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={ () => toggleExpanded( task?._id ) }>
                                                { isExpanded
                                                    ? <ChevronDown className="h-3 w-3" />
                                                    : <ChevronRight className="h-3 w-3" />
                                                }
                                            </Button>

                                            <div className="cursor-grab active:cursor-grabbing">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            <Checkbox
                                                checked={ task?.isCompleted }
                                                onCheckedChange={ () => toggleTaskCompletion( task?._id ) }
                                                className="h-4 w-4"
                                            />

                                            {/* Title - Always visible */ }
                                            <div className="flex-1 font-medium text-xs cursor-pointer" onDoubleClick={ () => handleEdit( task ) }>
                                                <span className={ task?.isCompleted ? "line-through text-muted-foreground" : "" }>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={ `h-5 w-5 ${ task?.isPinned ? "text-amber-500" : "text-muted-foreground" }` }
                                                        onClick={ () => toggleTaskPinned( task?._id ) }
                                                    >
                                                        { task?.isPinned ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" /> }
                                                    </Button>

                                                    { task?.title }
                                                </span>
                                            </div>

                                            {/* Visible groups based on screen width */ }
                                            { visibleColumns >= 4 && (
                                                <div className="w-24 flex-shrink-0">
                                                    { task?.timestampDue && (
                                                        <div className="flex items-center text-xs">
                                                            <Calendar className="h-3 w-3 mr-0.5" />
                                                            <span>{ format( new Date( task?.timestampDue ), "MMM d" ) }</span>
                                                        </div>
                                                    ) }
                                                </div>
                                            ) }

                                            { visibleColumns >= 5 && (
                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                    <StatusSelect
                                                        placeholder={ 'Priority' }
                                                        fieldName={ `priority` }
                                                        options={ TODO_PRIORITY_OPTIONS }
                                                        selected={ task?.priority ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( task, 'priority', value ) ) }
                                                    />
                                                </div>
                                            ) }

                                            { visibleColumns >= 6 && (
                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                    <StatusSelect
                                                        placeholder={ 'Difficulty' }
                                                        fieldName={ `difficulty` }
                                                        options={ TODO_DIFFICULTY_OPTIONS }
                                                        selected={ task?.difficulty ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( task, 'difficulty', value ) ) }
                                                    />
                                                </div>
                                            ) }

                                            { visibleColumns >= 7 && (
                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                    <StatusSelect
                                                        placeholder={ 'Status' }
                                                        fieldName={ `status` }
                                                        options={ TODO_STATUS_OPTIONS }
                                                        selected={ task?.status ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( task, 'status', value ) ) }
                                                    />
                                                </div>
                                            ) }

                                            {/* Action buttons - always visible */ }
                                            <div className="flex items-center space-x-0.5">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-5 w-5 text-primary"
                                                    onClick={ () => handleEdit( task ) }
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 text-destructive"
                                                    onClick={ () => handleDelete( task ) }
                                                >
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */ }
                                        <AnimatePresence>
                                            { isExpanded && (
                                                <motion.div
                                                    initial={ { height: 0, opacity: 0 } }
                                                    animate={ { height: "auto", opacity: 1 } }
                                                    exit={ { height: 0, opacity: 0 } }
                                                    transition={ { duration: 0.2 } }
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-1.5 pt-0 border-t">
                                                        {/* Hidden groups that appear in dropdown */ }
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                            { visibleColumns < 4 && (
                                                                <div>
                                                                    <h4 className="text-xs font-medium">Due Date</h4>
                                                                    <Input
                                                                        type="datetime-local"
                                                                        value={ task?.timestampDue ? new Date( task?.timestampDue ).toISOString().slice( 0, 16 ) : "" }
                                                                        onChange={ ( e ) => {
                                                                            const date = e.target.value ? new Date( e.target.value ) : null;
                                                                            updateTask( task?._id, { timestampDue: date } );
                                                                        } }
                                                                        className="h-6 text-xs"
                                                                    />
                                                                </div>
                                                            ) }

                                                            { visibleColumns < 5 && (
                                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                                    <StatusSelect
                                                                        placeholder={ 'Priority' }
                                                                        fieldName={ `priority` }
                                                                        options={ TODO_PRIORITY_OPTIONS }
                                                                        selected={ task?.priority ?? 'none' }
                                                                        onSelect={ ( value ) => ( handleChange( task, 'priority', value ) ) }
                                                                    />
                                                                </div>
                                                            ) }

                                                            { visibleColumns < 6 && (
                                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                                    <StatusSelect
                                                                        placeholder={ 'Difficulty' }
                                                                        fieldName={ `difficulty` }
                                                                        options={ TODO_DIFFICULTY_OPTIONS }
                                                                        selected={ task?.difficulty ?? 'none' }
                                                                        onSelect={ ( value ) => ( handleChange( task, 'difficulty', value ) ) }
                                                                    />
                                                                </div>
                                                            ) }

                                                            { visibleColumns < 7 && (
                                                                <div className={ `items-center justify-center h-full gap-4` }>
                                                                    <StatusSelect
                                                                        placeholder={ 'Status' }
                                                                        fieldName={ `status` }
                                                                        options={ TODO_STATUS_OPTIONS }
                                                                        selected={ task?.status ?? 'none' }
                                                                        onSelect={ ( value ) => ( handleChange( task, 'status', value ) ) }
                                                                    />
                                                                </div>
                                                            ) }



                                                            <div>
                                                                <h4 className="text-xs font-medium">Description</h4>
                                                                <textarea
                                                                    value={ task?.description || "" }
                                                                    onChange={ ( e ) => updateTask( task?._id, { description: e.target.value } ) }
                                                                    placeholder="Add a description..."
                                                                    className="min-h-[60px] text-xs w-full rounded-sm border border-input bg-transparent px-1.5 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                />
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-medium">Assignee</h4>
                                                                <div className="flex items-center space-x-1">
                                                                    { task?.user ? (
                                                                        <>
                                                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                                                <User className="h-3 w-3" />
                                                                            </div>
                                                                            <span className="text-xs">{ task?.user.name }</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">Unassigned</span>
                                                                    ) }
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-medium">Tags</h4>
                                                                <div className="flex flex-wrap gap-0.5">
                                                                    { utils.val.isValidArray( task?.tags, true ) && task?.tags.length > 0 ? (
                                                                        task?.tags.map( ( tag ) => (
                                                                            <Badge
                                                                                key={ tag.id }
                                                                                style={ { backgroundColor: tag.color } }
                                                                                className="text-xs py-0 px-1"
                                                                            >
                                                                                { tag.name }
                                                                            </Badge>
                                                                        ) )
                                                                    ) : (
                                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                                            <Tag className="h-3 w-3 mr-0.5" />
                                                                            <span>No tags</span>
                                                                        </div>
                                                                    ) }
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-medium">Created</h4>
                                                                <div className="text-xs flex items-center text-muted-foreground">
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    { format( new Date( task?.createdAt ), "PPP" ) }
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Subtasks */ }
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="text-xs font-medium">Subtasks</h4>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-5 text-xs px-1.5"
                                                                    onClick={ () => {
                                                                        setSelectedParentId( task?._id );
                                                                        setIsAddSubtaskDialogOpen( true );
                                                                    } }
                                                                >
                                                                    <Plus className="h-3 w-3 mr-0.5" />
                                                                    Add Subtask
                                                                </Button>
                                                            </div>

                                                            { subtasks.length > 0 ? (
                                                                <div className="pl-3 border-l-2 border-muted">
                                                                    <Droppable
                                                                        droppableId={ task?._id }
                                                                        type={ task?._id }
                                                                        key={ task?._id }
                                                                    >
                                                                        { ( provided ) => (
                                                                            <div
                                                                                ref={ provided.innerRef }
                                                                                { ...provided.droppableProps }
                                                                                className="space-y-1"
                                                                            >
                                                                                { utils.val.isValidArray( subtasks, true ) &&
                                                                                    subtasks.map(
                                                                                        ( subtask, subtaskIndex ) => (
                                                                                            <Draggable
                                                                                                key={ subtask?._id }
                                                                                                index={ subtask?.index }
                                                                                                draggableId={ `task-${ subtask?._id }` }
                                                                                            >
                                                                                                { ( provided, snapshot ) => (
                                                                                                    <div
                                                                                                        ref={ provided.innerRef }
                                                                                                        { ...provided.dragHandleProps }
                                                                                                        { ...provided.draggableProps }
                                                                                                        className={ `flex-1 text-xs cursor-pointer active:cursor-grabbing ${ snapshot.isDragging ? "opacity-70" : "" }` }
                                                                                                    >
                                                                                                        <div className="bg-muted/30 rounded-md p-1 flex items-center space-x-1">
                                                                                                            <div className="cursor-grab active:cursor-grabbing">
                                                                                                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                                                                                                            </div>

                                                                                                            <Checkbox
                                                                                                                checked={ subtask.isCompleted }
                                                                                                                onCheckedChange={ () => toggleTaskCompletion( subtask?._id ) }
                                                                                                                className="h-3 w-3"
                                                                                                            />

                                                                                                            <span className={ subtask.isCompleted ? "line-through text-muted-foreground" : "" }>
                                                                                                                { subtask.title }
                                                                                                            </span>

                                                                                                            <Button
                                                                                                                variant="ghost"
                                                                                                                size="icon"
                                                                                                                className="h-5 w-5 text-destructive"
                                                                                                                onClick={ () => handleEdit( subtask ) }
                                                                                                            >
                                                                                                                <Edit className="h-3 w-3" />
                                                                                                            </Button>
                                                                                                            <Button
                                                                                                                variant="ghost"
                                                                                                                size="icon"
                                                                                                                className="h-5 w-5 text-destructive"
                                                                                                                onClick={ () => handleDelete( subtask?._id ) }
                                                                                                            >
                                                                                                                <Trash className="h-3 w-3" />
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) }
                                                                                            </Draggable>
                                                                                        ) ) }
                                                                                { provided.placeholder }
                                                                            </div>
                                                                        ) }
                                                                    </Droppable>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-muted-foreground">No subtasks</div>
                                                            ) }
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) }
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) }
                        </Draggable>
                    );
                }
            },
            [
                expandedTasks,
                getSubtasks,
                toggleTaskCompletion,
                toggleTaskPinned,
                updateTask,
                deleteTask,
                visibleColumns
            ],
        );

    return (
        <div className="p-2">
            <div className="flex flex-row flex-wrap items-center gap-4 mb-4">
                <Button onClick={ onAddTask } className="h-7 text-xs px-2">
                    Add Task
                </Button>

                <Button variant="outline" className="h-7 text-xs px-2" onClick={ () => setIsAddColumnDialogOpen( true ) }>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Table
                </Button>

                {/* <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={ expandAllColumns } title="Expand all tables">
                        <ChevronsDown className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={ collapseAllColumns }
                        title="Collapse all tables"
                    >
                        <ChevronsUp className="h-3 w-3" />
                    </Button>
                </div> */}

                <FilterComponent
                    onFiltersChange={ ( newFilters ) => setFilters( newFilters ) }
                    availableFields={ [ "title", "description", "status", "priority", "tags", "assignee" ] }
                />
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className={ `size-7 aspect-square px-2 py-1` } onClick={ () => ( toggleAllGroups( !expandedAllGroups ) ) } title={ `${ expandedAllGroups ? 'Collapse' : 'Expand' } all groups` }>
                        { expandedAllGroups
                            ? ( <ChevronsDown className={ `size-4 aspect-square p-0 stroke-2` } /> )
                            : ( <ChevronsUp className={ `size-4 aspect-square p-0 stroke-2` } /> ) }
                    </Button>
                </div>
            </div>

            <DragDropContext
                onDragEnd={ handleDragGroupedTaskEnd }
            >
                <div className="space-y-3">
                    { utils.val.isValidArray( groups, true ) &&
                        groups
                            ?.sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) )
                            ?.map( ( group ) => (
                                <>
                                    { group?.hasOwnProperty( '_id' ) && ( <Droppable
                                        droppableId={ group?._id }
                                        isCombineEnabled={ true }
                                        type="task"
                                    >
                                        { ( provided, snapshot ) => (
                                            <div key={ group?._id } className="rounded-md border p-2">
                                                {/* <div
                                                    className={ `flex items-center p-2 bg-muted/30 rounded-l-[0.25rem] bg-muted/30 cursor-pointer bg-sextary-400/40 last:border-b-0 ${ expandedGroups[ group?._id ] === true ? 'border-l-8 border-y rounded-md border-l-bodysecondary' : '' }` }

                                                    onClick={ () => toggleGroupExpansion( group?._id ) }
                                                >
                                                    { expandedGroups[ group?._id ]
                                                        ? ( <ChevronDown className={ `size-4` } /> )
                                                        : ( <ChevronRight className={ `size-4` } /> ) }

                                                    <div className="flex items-center gap-4">
                                                        <span className="font-medium">{ group.title }</span>
                                                        <span className=" text-xs text-muted-foreground">
                                                            ({ group?.taskIds?.length } { group?.taskIds.length === 1 ? "task" : "tasks" })
                                                        </span>
                                                    </div>
                                                </div> */}
                                                <div className="flex items-center justify-between mb-2 cursor-pointer"
                                                    onDoubleClick={ () => {
                                                        toggleColumnExpanded( group?._id );
                                                    } }
                                                    onClick={ () => toggleGroupExpansion( group?._id ) }
                                                >
                                                    <h3 className="text-sm font-medium flex items-center">
                                                        { ( expandedGroups[ group?._id ] || snapshot.isDraggingOver )
                                                            ? ( <ChevronDown className="h-4 w-4 mr-1" /> )
                                                            : ( <ChevronRight className="h-4 w-4 mr-1" /> ) }
                                                        { group.title }
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({ groups?.taskIds?.length || 0 } tasks)
                                                    </span>
                                                </div>

                                                {/* This group is expanded; render the tasks inside it. */ }
                                                { expandedGroups[ group?._id ] && (
                                                    <div
                                                        ref={ provided.innerRef }
                                                        { ...provided.droppableProps }
                                                        className="space-y-1"
                                                    >
                                                        { utils.val.isValidArray( group?.taskIds, true ) && (
                                                            group.taskIds
                                                                ?.map( ( taskId ) => getTaskById( taskId ) )
                                                                ?.filter( Boolean )
                                                                ?.sort( ( a, b ) => {
                                                                    // First try to sort by todoListGroupIndex
                                                                    if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                                                                        return a.todoListGroupIndex - b.todoListGroupIndex;
                                                                    }
                                                                    // Fall back to index if todoListGroupIndex is not available
                                                                    return ( a.index || 0 ) - ( b.index || 0 );
                                                                } )
                                                                ?.map( ( task, index ) => (
                                                                    renderTaskRow( task, task?.index, group?._id )
                                                                ) )
                                                        ) }
                                                        { provided.placeholder }
                                                    </div>
                                                ) }
                                            </div>
                                        ) }
                                    </Droppable> ) }
                                </>
                            ) ) }
                </div>
            </DragDropContext>

            {/* Add Subtask Dialog */ }
            <Dialog open={ isAddSubtaskDialogOpen } onOpenChange={ setIsAddSubtaskDialogOpen }>
                <DialogContent className="max-w-xs p-3">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-base">Add Subtask</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <div className="space-y-1">
                            <Input
                                placeholder="Subtask title"
                                value={ newSubtaskTitle }
                                onChange={ ( e ) => setNewSubtaskTitle( e.target.value ) }
                                onKeyDown={ ( e ) => {
                                    if ( e.key === "Enter" ) handleAddSubtask();
                                } }
                                className="h-6 text-xs"
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-1">
                        <Button variant="outline" className="h-6 text-xs" onClick={ () => setIsAddSubtaskDialogOpen( false ) }>
                            Cancel
                        </Button>
                        <Button className="h-6 text-xs" onClick={ handleAddSubtask }>
                            Add Subtask
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Column Dialog */ }
            <Dialog open={ isAddColumnDialogOpen } onOpenChange={ setIsAddColumnDialogOpen }>
                <DialogContent className="max-w-xs p-3">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-base">Add New Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Table Title</label>
                            <Input
                                placeholder="Enter table title..."
                                value={ newColumnTitle }
                                onChange={ ( e ) => setNewColumnTitle( e.target.value ) }
                                onKeyDown={ ( e ) => {
                                    if ( e.key === "Enter" ) handleAddColumn();
                                } }
                                className="h-6 text-xs"
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-1">
                        <Button variant="outline" className="h-6 text-xs" onClick={ () => setIsAddColumnDialogOpen( false ) }>
                            Cancel
                        </Button>
                        <Button className="h-6 text-xs" onClick={ handleAddColumn }>
                            Add Table
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Task Dialog */ }
            <TodoDialog
                open={ isTaskDialogOpen }
                onOpenChange={ setIsTaskDialogOpen }
                task={ selectedTask }
            />
        </div>
    );
}


/*  const handleDragEnd = useCallback(
        ( result ) => {
            const { destination, source, draggableId, type } = result;

            // If there's no destination or the item was dropped back to its original position
            if ( !destination ) {
                return;
            }

            const taskId = draggableId;
            const task = getTaskById( taskId );
            const parentTaskId = task?.parentTaskId;

            // Handle subtask dragging
            // if ( type.startsWith( "subtask-" ) ) {
            if ( parentTaskId !== null ) {

                if ( !task ) return;

                // If dropped in the same parent list but different position
                if ( destination.droppableId === source.droppableId && destination.index !== source.index ) {
                    // Reorder within the same parent
                    const subtasks = getSubtasks( parentTaskId );
                    const newOrder = Array.from( subtasks );
                    const [ removed ] = newOrder.splice( source.index, 1 );
                    newOrder.splice( destination.index, 0, removed );

                    // Update orders
                    newOrder.forEach( ( task, index ) => {
                        updateTask( task?._id, { order: index } );
                    } );
                }
                // If dropped in a different list (changing parent)
                else if ( destination.droppableId !== source.droppableId ) {
                    // If dropped in main list (removing from parent)
                    if ( destination.droppableId === "main" ) {
                        updateTask( taskId, { parentTaskId: null } );
                    }
                    // If dropped in another task's subtask list
                    else {
                        const newParentId = destination.droppableId;
                        updateTask( taskId, { parentTaskId: newParentId } );
                    }
                }

                return;
            }

            // Handle main task dragging
            if ( !task ) return;

            // If dropped in the same group but different position
            if ( destination.droppableId === source.droppableId && destination.index !== source.index ) {
                const groupId = destination.droppableId;
                const tasksInColumn = filteredColumns[ destination.droppableId ] || [];

                // Calculate new order
                const newOrder = Array.from( tasksInColumn );
                const [ removed ] = newOrder.splice( source.index, 1 );
                newOrder.splice( destination.index, 0, removed );

                // Update orders
                newOrder.forEach( ( task, index ) => {
                    updateTask( task?._id, { order: index, index: index } );
                } );
            }
            // If dropped in a different group
            else if ( destination.droppableId !== source.droppableId ) {
                const sourceColumnId = source.droppableId;
                const destinationColumnId = destination.droppableId;

                moveTask( taskId, sourceColumnId, destinationColumnId, destination.index );
            }
        }
        , [ getTaskById, getSubtasks, filteredColumns, updateTask, moveTask ] );

    // const filteredColumns = getFilteredColumns();
    // const [ selectedColumnId, setSelectedColumnId ] = useState( null );

    // Handle drag end event
    const handleDragEnd2 = useCallback(
        ( result ) => {
            const { destination, source, draggableId, type } = result;

            // If there's no destination or the item was dropped back to its original position
            if (
                !destination ||
                ( destination.droppableId === source.droppableId &&
                    destination.index === source.index )
            ) {
                return;
            }

            // Handle group reordering
            if ( type === 'group' ) {
                const newColumnOrder = Array.from( columns ).map( ( group, index ) => ( {
                    id: group?._id,
                    order:
                        index === source.index
                            ? destination.index
                            : index === destination.index
                                ? source.index
                                : index,
                } ) );

                reorderColumns( newColumnOrder );
                return;
            }
            else {
                moveTask(
                    draggableId,
                    source.droppableId,
                    destination.droppableId,
                    destination.index,
                );
            }
        }
        , [ getTaskById, getSubtasks, filteredColumns, updateTask, moveTask ] );
*/

/*  { visibleColumns >= 5 && (
        <div className={ `grid grid-cols-4 items-center justify-center h-full gap-4` }>
            <h4 className="text-xs font-medium col-span-1 items-center justify-center h-full gap-4">Priority</h4>
            { buildSelect( {
                placeholder: 'Priority',
                className: `col-span-3`,
                opts: TODO_PRIORITY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.priority,
                initialData: task?.priority,
                key: 'priority',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'priority', value ),
            } ) }
        </div>
    ) }

    { visibleColumns >= 6 && (
        <div className={ `grid grid-cols-4 items-center justify-center h-full gap-4` }>
            <h4 className="text-xs font-medium col-span-1 items-center justify-center h-full gap-4">Status</h4>
            { buildSelect( {
                className: `col-span-3`,
                placeholder: 'Status',
                opts: TODO_STATUS_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.status,
                initialData: task?.status,
                key: 'status',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'status', value ),
            } ) }
        </div>
    ) }

    { visibleColumns >= 7 && (
        <div className={ `grid grid-cols-4 items-center justify-center h-full gap-4` }>
            <h4 className="text-xs font-medium col-span-1 items-center justify-center h-full gap-4">Difficulty</h4>
            { buildSelect( {
                placeholder: 'Difficulty',
                className: `col-span-3`,
                opts: TODO_DIFFICULTY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.difficulty,
                initialData: task?.difficulty,
                key: 'difficulty',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'difficulty', value ),
            } ) }
        </div>
    ) }
     
    { visibleColumns >= 5 && (
        <div className="w-20 flex-shrink-0">
            <Select
                value={ task?.priority || "medium" }
                onValueChange={ ( value ) => updateTask( task?._id, { priority: value } ) }
            >
                <SelectTrigger className="h-5 text-xs">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low" className="text-xs py-0.5">
                        Low
                    </SelectItem>
                    <SelectItem value="medium" className="text-xs py-0.5">
                        Medium
                    </SelectItem>
                    <SelectItem value="high" className="text-xs py-0.5">
                        High
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    ) } 
        
    { visibleColumns >= 6 && (
        <div className="w-20 flex-shrink-0">
            <Select
                value={ task?.difficulty || "medium" }
                onValueChange={ ( value ) => updateTask( task?._id, { difficulty: value } ) }
            >
                <SelectTrigger className="h-5 text-xs">
                    <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low" className="text-xs py-0.5">
                        Easy
                    </SelectItem>
                    <SelectItem value="medium" className="text-xs py-0.5">
                        Medium
                    </SelectItem>
                    <SelectItem value="high" className="text-xs py-0.5">
                        Hard
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    ) } 
*/
/*  { visibleColumns < 5 && (
        <div>
            <h4 className="text-xs font-medium">Priority</h4>
            { buildSelect( {
                placeholder: 'Priority',
                opts: TODO_PRIORITY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.priority,
                initialData: task?.priority,
                key: 'priority',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'priority', value ),
            } ) }
        </div>
    ) }

    { visibleColumns < 6 && (
        <div>
            <h4 className="text-xs font-medium">Status</h4>
            { buildSelect( {
                placeholder: 'Status',
                opts: TODO_STATUS_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.status,
                initialData: task?.status,
                key: 'status',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'status', value ),
            } ) }
        </div>
    ) }

    { visibleColumns < 7 && (
        <div>
            <h4 className="text-xs font-medium">Difficulty</h4>
            { buildSelect( {
                placeholder: 'Difficulty',
                opts: TODO_DIFFICULTY_OPTIONS.map( ( val, i ) => ( { name: caseCamelToSentence( val ), value: val } ) ),
                value: task?.difficulty,
                initialData: task?.difficulty,
                key: 'difficulty',
                multiple: false,
                handleChange: ( key, value ) => handleChange( task, 'difficulty', value ),
            } ) }
        </div>
    ) } 
*/
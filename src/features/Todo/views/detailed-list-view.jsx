import { useState, useEffect, useMemo, useCallback } from "react";
import useTasksStore from "@/store/task.store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Trash,
    Star,
    Clock,
    Calendar,
    Tag,
    User,
    ChevronsUp,
    ChevronsDown,
    StarOff,
} from "lucide-react";
import { TodoDialog } from "@/features/Todo/blocks/Dialog/task-dialog";
import { TodoNotesSidebar } from "@/features/Todo/blocks/Sidebar/TodoNotesSidebar";
import { FilterGroupSelector } from "@/features/Todo/blocks/Filters/FilterGroupSelector";
import { useTaskGroups /* , type GroupByOption */ } from "@/features/Todo/lib/hooks/use-task-groups";
import { FilterComponent } from "@/features/Todo/blocks/Filters/FilterComponent";
import * as utils from 'akashatools';
import { caseCamelToSentence } from "@/lib/utilities/string";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { twMerge } from "tailwind-merge";
import useTask from "@/lib/hooks/useTask";
import { stringAsColor } from "@/lib/utilities/color";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import type { KanbanTask } from "@/lib/types"

// interface DetailedListViewProps {
//   onAddTask: () => void
// }

export function DetailedListView ( {
    onAddTask,
    onUpdateTask,
    filteredColumns = [],
    defaultCollapsedMode = 'all',
    onCreateTodoGroup,
    onUpdateTodoGroup,
    onDeleteTodoGroup,
} ) {
    const {
        // State variables
        filters, setFilters,
        customGroups, setCustomGroups,
        getFilteredTaskColumns, getFilteredColumns,
        toggleTaskCompletion,

        // State Handler Functions
        sortTasks,
        sortDirection, setSortDirection,
        sortField, setSortField,
        handleSortChange,
        buildTaskColumns,
        getAllTasks,
        toggleTaskPinned,
        activeListId,
        tasksData, setTasksData,
        columns, setColumns,
        groups, setGroups,
        // customGroups, setCustomGroups,
        buildTaskGroupsData,
        buildTaskGroups,
        columnOrder, columnOrderMap,
        groupByField, setGroupByField, groupByFieldMode,
        tags, setTags, getTags,
        getAllTags, initTags,
        getTaskById,
        createTask, addTask, updateTask, deleteTask,
        moveTask,
        createGroup, addGroup, updateGroup, deleteGroup,
        reorderColumns,
    } = useTasksStore();
    // const allTasks = getAllTasks();

    const {
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleBulkUpdateTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleReorderTasks,
        handleOpenTaskNotes,
        handleCreateTaskGroup,
        handleUpdateTaskGroup,
        handleDeleteTaskGroup,
    } = useTask();

    const [ filteredTasks, setFilteredTasks ] = useState( tasksData );
    // const [ filters, setFilters ] = useState( [] );
    // const [ groupBy, setGroupByField ] = useState( "status" );
    // const [ customGroups, setCustomGroups ] = useState( [] );
    const [ groupsLocalData, setGroupsLocalData ] = useState( [] );
    const [ expandedGroups, setExpandedGroups ] = useState( {} );
    const [ expandedAllGroups, setExpandedAllGroups ] = useState( false );
    const [ expandedTasks, setExpandedTasks ] = useState( {} );
    const [ isTaskDialogOpen, setIsTaskDialogOpen ] = useState( false );
    const [ isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen ] = useState( false );
    const [ taskGroupDialogOpen, setTaskGroupDialogOpen ] = useState( false );
    const [ selectedTask, setSelectedTask ] = useState( null );
    const [ selectedTaskGroup, setSelectedTaskGroup ] = useState( null );
    const [ isNotesSidebarOpen, setIsNotesSidebarOpen ] = useState( false );

    // Apply filters to tasks
    /* useEffect( () => {
        if ( filters.length === 0 ) {
            setFilteredTasks( tasksData.filter( ( task ) => ( task?.todoListId === activeListId || activeListId === null ) ) );
            return;
        }

        const filtered = tasksData
            .filter( ( task ) => ( task?.todoListId === activeListId || activeListId === null ) )
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
                        case "difficulty":
                            return task?.difficulty?.toLowerCase().includes( value ) || false;
                        case "categories":
                            let allCategories = [];
                            tasksData?.forEach( ( t ) => {
                                let categories = t?.categories;
                                if ( categories && utils.val.isValidArray( categories, true ) ) {
                                    categories.forEach( ( c ) => {
                                        if ( !allCategories?.includes( c?.toLowerCase() ) ) {
                                            // Not already in categories list. Add it. 
                                            allCategories.push( c?.toLowerCase() );
                                        }
                                    } );
                                }
                            } );
                            return tasksData;
                        case "tags":
                            return task?.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) );
                        case "assignee":
                            return task?.user?.name.toLowerCase().includes( value ) || false;
                        default:
                            return true;
                    }
                } );
            } );

        setFilteredTasks( filtered.filter( ( task ) => ( task?.todoListId === activeListId ) ) );
    }, [ filters, tasksData, activeListId ] ); // Only depend on filters and allTasks
    */

    useEffect( () => {
        setGroupsLocalData( getFilteredColumns() );
    }, [ activeListId ] );

    // Apply filters to tasks
    useEffect( () => {
        // Init\ialize the filtered tasks object array. 
        if ( filters.length === 0 ) {
            setFilteredTasks( tasksData.filter( ( task ) => ( task?.todoListId === activeListId ) ) );
        }
        else {
            setGroupsLocalData( getFilteredColumns() );
            setFilteredTasks( filteredColumns );
        }

        // Initialize the collapsed / expanded groups based on passed props. 
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
    }, [ filters, tasksData, activeListId ] ); // Only depend on filters and tasksData


    // Use the task groups hook with filtered tasks
    /* const groups = useTaskGroups( {
        tasks: filteredTasks,
        groupByField,
        customGroups,
    } ); */

    // Toggle group expansion
    const toggleGroupExpansion = ( groupId ) => {
        setExpandedGroups( ( prev ) => ( {
            ...prev,
            [ groupId ]: !prev[ groupId ],
        } ) );
    };

    // Toggle task expansion
    const toggleTaskExpansion = ( taskId ) => {
        setExpandedTasks( ( prev ) => ( {
            ...prev,
            [ taskId ]: !prev[ taskId ],
        } ) );
    };

    // Toggle expand/collapse all groups
    /* const toggleAllGroups = () => {
        const expanded = {};
        groups.forEach( ( group ) => {
            expanded[ group?._id ] = !expandedAllGroups;
        } );
        setExpandedGroups( expanded );
        setExpandedAllGroups( !expandedAllGroups );
    }; */
    const toggleAllGroups = ( mode ) => {
        const expanded = {};
        filteredColumns.forEach( ( group ) => {
            if ( mode === true ) expanded[ group?._id ] = true; // Toggle expanded
            else if ( mode === false ) expanded[ group?._id ] = false; // Toggle collapsed
            else expanded[ group?._id ] = !expandedAllGroups; // Flip expanded state. 
        } );
        setExpandedGroups( expanded );
        setExpandedAllGroups( mode );
    };

    // Format date for display
    const formatDate = ( date ) => {
        if ( !date ) return "No date";

        try {
            const dateObj = typeof date === "string" ? parseISO( date ) : new Date( date );
            return isValid( dateObj ) ? format( dateObj, "MMM d, yyyy" ) : "Invalid date";
        } catch {
            return "Invalid date";
        }
    };

    // Handle edit task
    const handleEditTask = ( task ) => {
        setSelectedTask( task );
        setIsTaskDialogOpen( true );
    };

    // Handle delete task
    const handleDelete = async ( task ) => {
        if ( confirm( "Are you sure you want to delete this task?" ) ) {
            deleteTask( task?._id );
            let deletedTask = await handleDeleteTask( task );
        }
    };

    // Handle double click to open notes
    const handleTaskDoubleClick = ( task ) => {
        setSelectedTask( task );
        setIsNotesSidebarOpen( true );
    };

    const handleEdit = ( task ) => {
        setSelectedTask( task );
        setIsTaskDialogOpen( true );
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

    // Get sorted tasks for this column
    const sortedTasks = useMemo( ( group ) => {
        if ( !utils.val.isValidArray( group?.taskIds, true ) ) return [];

        return group?.taskIds
            .map( ( taskId ) => getTaskById( taskId ) )
            .filter( Boolean )
            .sort( ( a, b ) => {
                // First try to sort by todoListGroupIndex
                if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                    return a.todoListGroupIndex - b.todoListGroupIndex;
                }
                // Fall back to index if todoListGroupIndex is not available
                return ( a.index || 0 ) - ( b.index || 0 );
            } );
    }, [ groups, customGroups, getTaskById ] );


    const getSortedTasks = useCallback( ( group ) => {
        if ( !utils.val.isValidArray( group?.taskIds, true ) ) return [];

        return group?.taskIds
            ?.map( ( taskId ) => getTaskById( taskId ) )
            ?.filter( Boolean )
            ?.sort( ( a, b ) => {
                // First try to sort by todoListGroupIndex
                if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                    return a.todoListGroupIndex - b.todoListGroupIndex;
                }
                // Fall back to index if todoListGroupIndex is not available
                return ( a.index || 0 ) - ( b.index || 0 );
            } );
    }, [ groups, customGroups, getTaskById ] );

    /* const onCreateNewGroup = async ( group ) => {
        console.log( "detailed-list-view :: onCreateNewGroup :: new group = ", group );
        let groupData = {
            ...group,
            workspaceId: workspaceId,
        };
        let result = await handleCreateTaskGroup( group );
    }; */


    return (
        <div className="p-2">
            <div className={ `flex flex-row flex-wrap items-center gap-2` }>
                <FilterGroupSelector
                    value={ groupByField }
                    onChange={ setGroupByField }
                    onCustomGroupsChange={ onCreateTodoGroup }
                    onCreateCustomGroup={ onCreateTodoGroup }
                    onUpdateCustomGroup={ onUpdateTodoGroup }
                    onDeleteCustomGroup={ onDeleteTodoGroup }
                    customGroups={ customGroups }
                />

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className={ `size-8 aspect-square px-2 py-1` } onClick={ () => ( toggleAllGroups( !expandedAllGroups ) ) } title="Expand all groups">
                        { expandedAllGroups
                            ? ( <ChevronsDown className={ `size-4 aspect-square p-0 stroke-2` } /> )
                            : ( <ChevronsUp className={ `size-4 aspect-square p-0 stroke-2` } /> ) }
                    </Button>
                </div>

                { utils.val.isValidArray( tasksData, true ) && ( <FilterComponent
                    onFiltersChange={ setFilters }
                    // availableFields={ [
                    //     "title",
                    //     "description",
                    //     "status",
                    //     "priority",
                    //     "tags",
                    //     "assignee"
                    // ] }
                    availableFields={ Object.keys( tasksData?.[ 0 ] )?.map( ( k ) => ( k ) ) }
                /> ) }

                <Button onClick={ onAddTask } size="sm" className="ml-auto">
                    Add Task
                </Button>
            </div>

            <div className={ `rounded-md overflow-auto h-auto flex flex-col` }>
                <Collapsible
                    defaultOpen={ false }
                    className={ twMerge(
                        `py-0 px-0 m-0`,
                        `transition-all duration-300 ease-in-out`,
                    ) }
                    id={ `detailed-list-view-sorting-buttons-collapsible` }
                    key={ `detailed-list-view-sorting-buttons-collapsible` }
                >
                    <CollapsibleTrigger
                        className={ `py-0 px-0 transition-all duration-500 ease-in-out` }
                        asChild
                    >
                        <div className={ `flex items-center justify-start w-full h-8` }>
                            <ChevronRight className={ `py-0 px-0 w-4 h-4` } />
                            <span className={ `text-xs font-medium cursor-pointer` }>Actions</span>
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className={ `transition-all duration-300 ease-in-out` }>
                        <div className={ `grid grid-cols-12 xs:grid-cols-4 md:grid-cols-8 bg-background/50 border-b top-0 z-10` }>
                            { utils.val.isValidArray( tasksData, true ) && Object.keys( tasksData?.[ 0 ] )?.map( ( k ) => (
                                <div className={ `col-span-2 flex items-center justify-start w-full` }>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={ `h-6 w-full justify-start px-1 font-medium` }
                                        onClick={ () => handleSortChange( k ) }
                                    >
                                        { caseCamelToSentence( k ) }
                                        { sortField === k && <span className="ml-1">{ sortDirection === "asc" ? "↑" : "↓" }</span> }
                                    </Button>
                                </div>
                            ) ) }
                        </div>
                    </CollapsibleContent>
                </Collapsible>

            </div>

            <div className={ `rounded-md overflow-auto` }>

                {/* Groups */ }
                { groups && groups?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No tasks match your filters</div>
                ) : (
                    groups
                        ?.sort( ( a, b ) => a.index - b.index )
                        ?.map( ( group ) => (
                            <div key={ group?._id } className="">
                                <div
                                    className={ `flex items-center justify-between p-2 bg-background rounded-l-[0.25rem] cursor-pointer ${ expandedGroups[ group?._id ] === true ? 'border-l-8 rounded-md border-l-bodysecondary' : '' }` }
                                    onClick={ () => toggleGroupExpansion( group?._id ) }
                                >
                                    <div className="flex items-center gap-2">
                                        { expandedGroups[ group?._id ]
                                            ? ( <ChevronDown className="h-4 w-4 mr-2" /> )
                                            : ( <ChevronRight className="h-4 w-4 mr-2" /> ) }

                                        <div className="w-3 h-3 rounded-full mr-2" style={ { backgroundColor: group.color } } />
                                        <span className="font-medium">{ group.title }</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({ group?.taskIds?.length } { group?.taskIds?.length === 1 ? "task" : "tasks" })
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex items-center justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={ ( e ) => {
                                                e.stopPropagation();
                                                setSelectedTaskGroup( group );
                                                setTaskGroupDialogOpen( true );
                                            } }
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-destructive"
                                            onClick={ ( e ) => {
                                                e.stopPropagation();
                                                setSelectedTaskGroup( group );
                                                setIsDeleteGroupDialogOpen( true );
                                            } }
                                        >
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                { expandedGroups[ group?._id ] && (
                                    <div className={ `` }>
                                        { utils.val.isValidArray( group?.taskIds, true ) && group.taskIds.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground text-sm">No tasks in this group</div>
                                        ) : (
                                            <div>
                                                {/* { sortTasks( group?.taskIds, sortField ).map( ( task ) => ( */ }
                                                { getSortedTasks( group ).map( ( task ) => (
                                                    <div key={ task?._id } className={ `ml-2` }>
                                                        <div className={ `grid grid-cols-12 gap-2 p-2 hover:bg-background cursor-pointer border-x first:border-t-2 [&:not(:nth-last-child(-n+1))]:${ expandedGroups[ group?._id ] ? 'border-b-2' : 'border-b-0' } border-collapse` }
                                                            onClick={ () => toggleTaskExpansion( task?._id ) }
                                                            onDoubleClick={ () => handleTaskDoubleClick( task ) }
                                                        >
                                                            <div className="col-span-5 flex items-center">
                                                                <Checkbox
                                                                    checked={ task?.isCompleted }
                                                                    onCheckedChange={ () => {
                                                                        // toggleTaskCompletion( task?._id );
                                                                        handleChange( task, 'isCompleted', !task?.isCompleted );
                                                                    } }
                                                                    className="mr-2"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                    } }
                                                                />

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className={ `h-6 w-6 p-0 mr-1 ${ task?.isPinned ? "text-yellow-500" : "text-muted-foreground" }` }
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        // toggleTaskPinned( task?._id );
                                                                        handleChange( task, 'isPinned', !task?.isPinned );
                                                                    } }
                                                                >
                                                                    { task?.isPinned
                                                                        ? <Star className="size-4 aspect-square p-0 stroke-[0.125rem]" />
                                                                        : <StarOff className="size-4 aspect-square p-0 stroke-[0.125rem]" />
                                                                    }
                                                                </Button>

                                                                <span className={ `${ task?.isCompleted ? "line-through text-muted-foreground" : "" }` }>
                                                                    { task?.title }
                                                                </span>
                                                            </div>

                                                            <div className="col-span-2 flex items-center">
                                                                <Badge
                                                                    variant="outline"
                                                                    style={ {
                                                                        backgroundColor: stringAsColor( task?.priority, 100, 20, 0.5 ),
                                                                        color: stringAsColor( task?.priority, 100, 80, 1.0 ),
                                                                    } }
                                                                >
                                                                    {/* { task?.priority || "low" } */ }
                                                                    { caseCamelToSentence( task?.priority ) }
                                                                </Badge>
                                                            </div>

                                                            <div className="col-span-2 flex items-center">
                                                                <Badge
                                                                    variant="outline"
                                                                    style={ {
                                                                        backgroundColor: stringAsColor( task?.status, 100, 20, 0.5 ),
                                                                        color: stringAsColor( task?.status, 100, 80, 1.0 ),
                                                                    } }
                                                                >
                                                                    { caseCamelToSentence( task?.status ) }
                                                                    {/* { task?.status === "incomplete"
                                                                        ? "To Do"
                                                                        : task?.status === "inProgress"
                                                                            ? "In Progress"
                                                                            : "Done" } */}
                                                                </Badge>
                                                            </div>

                                                            <div className="col-span-2 flex items-center">
                                                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                                                <span className="text-xs">{ formatDate( task?.timestampDue ) }</span>
                                                            </div>

                                                            <div className="col-span-1 flex items-center justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        handleEditTask( task );
                                                                    } }
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 text-destructive"
                                                                    onClick={ ( e ) => {
                                                                        e.stopPropagation();
                                                                        handleDelete( task );
                                                                    } }
                                                                >
                                                                    <Trash className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Task Details */ }
                                                        { expandedTasks[ task?._id ] && (
                                                            <div className={ `p-2 ml-2 bg-background/10 border-x-2 border-t-0` }>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        { task?.description && (
                                                                            <div className="mb-3">
                                                                                <h4 className="text-xs font-medium mb-1">Description</h4>
                                                                                <p className="text-xs text-muted-foreground">{ task?.description }</p>
                                                                            </div>
                                                                        ) }

                                                                        { task?.notes && task?.notes.length > 0 && (
                                                                            <div className="mb-3">
                                                                                <h4 className="text-xs font-medium mb-1">Notes</h4>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    { task?.notes.map( ( note, index ) => (
                                                                                        <p key={ index } className="mb-1">
                                                                                            { note }
                                                                                        </p>
                                                                                    ) ) }
                                                                                </div>
                                                                            </div>
                                                                        ) }
                                                                    </div>

                                                                    <div>
                                                                        <div className="flex items-start mb-2">
                                                                            <Calendar className="h-3 w-3 mr-2 mt-0.5 text-muted-foreground" />
                                                                            <div>
                                                                                <h4 className="text-xs font-medium">Due Date</h4>
                                                                                <p className="text-xs text-muted-foreground">{ formatDate( task?.timestampDue ) }</p>
                                                                            </div>
                                                                        </div>

                                                                        { task?.user && (
                                                                            <div className="flex items-start mb-2">
                                                                                <User className="h-3 w-3 mr-2 mt-0.5 text-muted-foreground" />
                                                                                <div>
                                                                                    <h4 className="text-xs font-medium">Assigned To</h4>
                                                                                    {/* TODO :: Replace this with finding the user ID. We don't save the user name in each task, just the ID. */ }
                                                                                    <p className="text-xs text-muted-foreground">{ task?.user.name }</p>
                                                                                </div>
                                                                            </div>
                                                                        ) }

                                                                        { utils.val.isValidArray( task?.tags, true ) && task?.tags.length > 0 && (
                                                                            <div className="flex items-start mb-2">
                                                                                <Tag className="h-3 w-3 mr-2 mt-0.5 text-muted-foreground" />
                                                                                <div>
                                                                                    <h4 className="text-xs font-medium">Tags</h4>
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        { getAllTags( task )?.map( ( tag ) => (
                                                                                            <Badge
                                                                                                key={ tag.id }
                                                                                                style={ { backgroundColor: tag.color } }
                                                                                                className="text-xs py-0 px-1"
                                                                                            >
                                                                                                { tag.name }
                                                                                            </Badge>
                                                                                        ) ) }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) }

                                                                        <div className="flex items-start mb-2">
                                                                            <div className="h-3 w-3 mr-2" />
                                                                            <div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-6 text-xs"
                                                                                    onClick={ () => handleEditTask( task ) }
                                                                                >
                                                                                    Edit Task
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) }
                                                    </div>
                                                ) ) }
                                            </div>
                                        ) }
                                    </div>
                                ) }
                            </div>
                        ) )
                ) }
            </div>

            {/* Task Dialog */ }

            {/* Add Column Dialog */ }
            { selectedTaskGroup && ( <Dialog open={ taskGroupDialogOpen } onOpenChange={ setTaskGroupDialogOpen }>
                <DialogContent className="max-w-xs p-3">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-base">Update Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Title</Label>
                            <Input
                                placeholder="Enter group title..."
                                value={ selectedTaskGroup?.title ?? '' }
                                onChange={ ( e ) => setSelectedTaskGroup( { ...selectedTaskGroup, [ 'title' ]: e.target.value } ) }
                                onKeyDown={ ( e ) => {
                                    if ( e.key === "Enter" ) handleUpdateTaskGroup( selectedTaskGroup );
                                } }
                                className="h-6 text-xs"
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-1">
                        <Button variant="outline" className="h-6 text-xs" onClick={ () => {
                            setSelectedTaskGroup( null );
                            setTaskGroupDialogOpen( false );
                        } }>
                            Cancel
                        </Button>
                        <Button className="h-6 text-xs" onClick={ () => {
                            onUpdateTodoGroup( selectedTaskGroup );
                            setTaskGroupDialogOpen( false );
                        } }>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> ) }

            { selectedTaskGroup && ( <Dialog open={ isDeleteGroupDialogOpen } onOpenChange={ setIsDeleteGroupDialogOpen }>
                <DialogContent className="max-w-xs p-4">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-base">Delete Group</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm">
                        { `Are you sure you want to delete the group "${ selectedTaskGroup?.title }"? This will also delete all tasks in this group.` }
                    </p>
                    <DialogFooter className="pt-2">
                        <Button variant="outline" className="h-7 text-xs" onClick={
                            () => {
                                setSelectedTaskGroup( null );
                                setIsDeleteGroupDialogOpen( false );
                            } }>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="h-7 text-xs" onClick={ () => ( onDeleteTodoGroup( selectedTaskGroup?._id ) ) }>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> ) }

            <TodoDialog
                open={ isTaskDialogOpen }
                onOpenChange={ setIsTaskDialogOpen }
                task={ selectedTask }
            />

            {/* Notes Sidebar */ }
            <TodoNotesSidebar
                isOpen={ isNotesSidebarOpen }
                onClose={ () => setIsNotesSidebarOpen( false ) }
                task={ selectedTask }
            />
        </div>
    );
}

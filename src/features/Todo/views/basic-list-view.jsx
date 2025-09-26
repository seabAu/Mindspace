import { useState, useEffect } from "react";
import useTasksStore from "@/store/task.store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Edit, Trash, ChevronsUp, ChevronsDown } from "lucide-react";
import { TodoDialog } from "@/features/Todo/blocks/Dialog/task-dialog";
import { TodoNotesSidebar } from "@/features/Todo/blocks/Sidebar/TodoNotesSidebar";
import { FilterGroupSelector } from "@/features/Todo/blocks/Filters/FilterGroupSelector";
// import { useTaskGroups } from "@/features/Todo/lib/hooks/use-task-groups";
import { FilterComponent } from "@/features/Todo/blocks/Filters/FilterComponent";
import * as utils from 'akashatools';
import { stringAsColor } from "@/lib/utilities/color";
import { caseCamelToSentence } from "@/lib/utilities/string";
// import type { KanbanTask } from "@/lib/types"
// interface BasicListViewProps {
//   onAddTask: () => void
// }

export function BasicListView ( { onAddTask, onUpdateTask, filteredColumns = [], defaultCollapsedMode = 'all' } ) {
    const {
        activeListId,
        toggleTaskCompletion,
        tasksData, setTasksData,
        columns, setColumns,
        groups, setGroups,
        // customGroups, setCustomGroups,
        buildTaskGroupsData,
        buildTaskGroups,
        columnOrder, columnOrderMap,
        getFilteredColumns,
        groupByField, groupByFieldMode,
        tags, setTags, getTags, createTag, addTag, getAllTags, initTags,
        getTaskById,
        createTask, addTask, updateTask, deleteTask,
        moveTask,
        createGroup, addGroup, updateGroup, deleteGroup,
        reorderColumns,
    } = useTasksStore();

    const [ filteredTasks, setFilteredTasks ] = useState( tasksData );
    const [ filters, setFilters ] = useState( [] );
    const [ groupsLocalData, setGroupsLocalData ] = useState( [] );
    const [ groupBy, setGroupBy ] = useState( "status" );
    const [ customGroups, setCustomGroups ] = useState( [] );
    const [ expandedGroups, setExpandedGroups ] = useState( {} );
    const [ expandedAllGroups, setExpandedAllGroups ] = useState( false );
    const [ isTaskDialogOpen, setIsTaskDialogOpen ] = useState( false );
    const [ selectedTask, setSelectedTask ] = useState( null );
    const [ isNotesSidebarOpen, setIsNotesSidebarOpen ] = useState( false );

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

    useEffect( () => {
        setGroupsLocalData( getFilteredColumns() );
        initTags();
    }, [ activeListId ] );

    // Apply filters to tasks
    useEffect( () => {
        // Init\ialize the filtered tasks object array. 
        if ( filters.length === 0 ) {
            setFilteredTasks( tasksData.filter( ( task ) => ( task?.todoListId === activeListId ) ) );
        }
        else {
            setGroupsLocalData( filteredColumns );
            setFilteredTasks( filteredColumns );
        }

        // Initialize the collapsed / expanded groups based on passed props. 
        initializeExpandedGroups();
    }, [ filters, tasksData, activeListId ] ); // Only depend on filters and tasksData

    // Use the task groups hook with filtered tasks
    // const groups = useTaskGroups( {
    //     tasks: filteredTasks,
    //     groupBy,
    //     customGroups,
    // } );
    // const groups = filteredColumns;


    // Toggle group expansion
    const toggleGroupExpansion = ( groupId ) => {
        setExpandedGroups( ( prev ) => ( {
            ...prev,
            [ groupId ]: !prev[ groupId ],
        } ) );
    };

    // Expand all groups
    /* const expandAllGroups = () => {
        const expanded = {};
        filteredColumns.forEach( ( group ) => {
            expanded[ group?._id ] = true;
        } );
        setExpandedGroups( expanded );
    };

    // Collapse all groups
    const collapseAllGroups = () => {
        const collapsed = {};
        filteredColumns.forEach( ( group ) => {
            collapsed[ group?._id ] = false;
        } );
        setExpandedGroups( collapsed );
    }; */

    // Toggle expand/collapse all groups
    const toggleAllGroups = ( mode ) => {
        if ( utils.val.isValidArray( groups, true ) ) {
            const expanded = {};
            groups.forEach( ( group ) => {
                if ( mode === true ) expanded[ group?._id ] = true; // Toggle expanded
                else if ( mode === false ) expanded[ group?._id ] = false; // Toggle collapsed
                else expanded[ group?._id ] = mode; // Flip expanded state. 
            } );
            setExpandedGroups( expanded );
            setExpandedAllGroups( mode );
        }
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
    const handleDeleteTask = ( taskId ) => {
        if ( confirm( "Are you sure you want to delete this task?" ) ) {
            deleteTask( taskId );
        }
    };

    // Handle double click to open notes
    const handleTaskDoubleClick = ( task ) => {
        setSelectedTask( task );
        setIsNotesSidebarOpen( true );
    };

    return (
        <div className="p-2">
            <div className={ `flex flex-row flex-wrap items-center gap-2` }>
                <FilterGroupSelector
                    value={ groupBy }
                    onChange={ setGroupBy }
                    // onCustomGroupsChange={ setCustomGroups }
                    onCustomGroupsChange={ updateGroup }
                    onCreateCustomGroup={ createGroup }
                    customGroups={ customGroups }
                />

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className={ `size-7 aspect-square px-2 py-1` } onClick={ () => ( toggleAllGroups( !expandedAllGroups ) ) } title={ `${ expandedAllGroups ? 'Collapse' : 'Expand' } all groups` }>
                        { expandedAllGroups
                            ? ( <ChevronsDown className={ `size-4 aspect-square p-0 stroke-2` } /> )
                            : ( <ChevronsUp className={ `size-4 aspect-square p-0 stroke-2` } /> ) }
                    </Button>
                </div>

                {/* <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={ expandAllGroups } title="Expand all groups">
                        <ChevronsDown className="h-4 w-4" />
                        { expandedGroups[ group?._id ]
                            ? ( <ChevronDown className={ `size-4` } /> )
                            : ( <ChevronRight className={ `size-4` } /> ) }

                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={ collapseAllGroups }
                        title="Collapse all groups"
                    >
                        <ChevronsUp className="h-4 w-4" />
                    </Button>
                </div> */}

                <FilterComponent
                    onFiltersChange={ setFilters }
                    availableFields={ [ "title", "description", "status", "priority", "tags", "assignee" ] }
                />

                <Button onClick={ onAddTask } size="sm" className="ml-auto">
                    Add Task
                </Button>
            </div>

            <div className="flex-1 overflow-auto rounded-md">
                { groups && utils.val.isValidArray( groups, true )
                    ? (
                        groups?.map( ( group ) => (
                            <div key={ group?._id } className="">
                                <div
                                    className={ `flex items-center p-2 rounded-l-[0.25rem] cursor-pointer last:border-b-0 ${ expandedGroups[ group?._id ] === true ? 'border-l-8 border-y rounded-md border-l-bodysecondary' : '' }` }

                                    onClick={ () => toggleGroupExpansion( group?._id ) }
                                >
                                    { expandedGroups[ group?._id ]
                                        ? ( <ChevronDown className={ `size-4` } /> )
                                        : ( <ChevronRight className={ `size-4` } /> ) }

                                    <div className="flex items-center gap-4">
                                        <span className="font-medium">{ group?.title }</span>
                                        <span className="text-xs text-muted-foreground">
                                            { utils.val.isValidArray( group?.taskIds, true ) && (
                                                <>
                                                    ({ group?.taskIds?.length } { group?.taskIds.length === 1 ? "task" : "tasks" })
                                                </>
                                            ) }
                                        </span>
                                    </div>
                                </div>

                                { expandedGroups[ group?._id ] && (
                                    <div>
                                        { !utils.val.isValidArray( group?.tasks, true ) ? (
                                            <div className={ `p-4 text-center text-muted-foreground text-sm` }>
                                                No tasks in this group
                                            </div>
                                        ) : (
                                            <div>
                                                { group.tasks.map( ( task ) => (
                                                    <div
                                                        key={ task._id }
                                                        className="ml-2 border-x flex items-center p-2 hover:bg-muted/20 border-b last:border-b-1"
                                                        onDoubleClick={ () => handleTaskDoubleClick( task ) }
                                                    >
                                                        <Checkbox
                                                            checked={ task.isCompleted }
                                                            onCheckedChange={ () => toggleTaskCompletion( task._id ) }
                                                            className="mr-2"
                                                        />

                                                        <div className="flex-grow">
                                                            <div className="grid grid-cols-8 gap-4">
                                                                <span className={ `col-span-3 ${ task.isCompleted ? "line-through text-muted-foreground" : "" }` }>
                                                                    { task?.title }
                                                                </span>

                                                                { task?.priority && (
                                                                    <div className={ `col-span-1` }>
                                                                        <Badge
                                                                            className={ `` }
                                                                            variant="outline"
                                                                            style={ {
                                                                                backgroundColor: stringAsColor( task?.priority, 100, 20, 0.5 ),
                                                                                color: stringAsColor( task?.priority, 100, 80, 1.0 ),
                                                                            } }
                                                                        >
                                                                            { caseCamelToSentence( task?.priority ) }
                                                                        </Badge>
                                                                    </div>
                                                                ) }

                                                                { task?.status && (
                                                                    <div className={ `col-span-1` }>
                                                                        <Badge
                                                                            className={ `` }
                                                                            variant="outline"
                                                                            style={ {
                                                                                backgroundColor: stringAsColor( task?.status, 100, 80, 0.75 ),
                                                                                color: stringAsColor( task?.status, 100, 25, 1.0 ),
                                                                            } }
                                                                        >
                                                                            { caseCamelToSentence( task?.status ) }
                                                                        </Badge>
                                                                    </div>
                                                                ) }

                                                                { task.timestampDue && (
                                                                    <span className=" text-xs text-muted-foreground">{ formatDate( task.timestampDue ) }</span>
                                                                ) }
                                                            </div>

                                                            { utils.val.isValidArray( task?.tags, true ) && task.tags?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    { getTags( task )?.map( ( tag ) => (
                                                                        <Badge
                                                                            key={ tag?.name }
                                                                            style={ { backgroundColor: tag?.color } }
                                                                            className="text-xs py-0 px-1"
                                                                        >
                                                                            { tag?.name }
                                                                        </Badge>
                                                                    ) ) }
                                                                </div>
                                                            ) }
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={ () => handleEditTask( task ) }
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-destructive"
                                                                onClick={ () => handleDeleteTask( task._id ) }
                                                            >
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) ) }
                                            </div>
                                        ) }
                                    </div>
                                ) }
                            </div> ) )
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">No tasks match your filters</div>
                    ) }
            </div>

            {/* Task Dialog */ }
            <TodoDialog open={ isTaskDialogOpen } onOpenChange={ setIsTaskDialogOpen } task={ selectedTask } />

            {/* Notes Sidebar */ }
            <TodoNotesSidebar
                task={ selectedTask }
                isOpen={ isNotesSidebarOpen }
                onClose={ () => setIsNotesSidebarOpen( false ) }
            />
        </div>
    );
}

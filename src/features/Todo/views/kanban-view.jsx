import { useEffect, useMemo, useState } from "react";
import { Column } from "@/features/Todo/blocks/Kanban/column";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useTasksStore from "@/store/task.store";
import useTask from "@/lib/hooks/useTask";
import * as utils from "akashatools";
import TaskGroupDialog from "../blocks/Dialog/task-group-dialog";
import useGlobalStore from "@/store/global.store";

export function KanbanView ( {
    tasks,
    setTasks,
    onAddTask,
    // onCreateTask,
    // onDeleteTask,
    // onUpdateTask,
    // onMoveSubtask,
    // onCreateSubTask,
    onCreateTodoGroup,
    onUpdateTodoGroup,
    onDeleteTodoGroup,
    ...props
} ) {
    // console.log( "KanbanView :: props = ", props );
    const {
        activeListId,
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
        user,
        workspaceId,
    } = useGlobalStore();

    const {
        handleBulkReorderTasks,
        handleBulkReorderTaskIds,
        handleBulkUpdateTasks,
        handleCreateTaskGroup,
        handleUpdateTaskGroup,
        handleDeleteTaskGroup,
        handleUpdateTask,
        handleDragSimpleTaskEnd,
        handleDragGroupedTaskEnd,
    } = useTask();

    // Get filtered columns and ensure they're sorted by index
    // const filteredColumns = useMemo( () => {
    //     const columns = getFilteredColumns();
    //     return columns ? [ ...columns ].sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) ) : [];
    // }, [ tasksData, groupByField, groupByFieldMode, activeListId, getFilteredColumns ] );
    const [ isGroupDialogOpen, setIsGroupDialogOpen ] = useState( false );
    const [ groupDialogData, setGroupDialogData ] = useState( false );

    // Get filtered groups and ensure they're sorted by index
    const filteredGroups = useMemo( () => {
        const tempGroups = buildTaskGroups( tasksData, groups );
        console.log( "Todo :: kanban view :: filteredGroups called. :: tempGroups = ", tempGroups, " :: ", "groups = ", groups );
        return tempGroups ? [ ...tempGroups ].sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) ) : [];
    }, [ groups, tasksData, groupByField, groupByFieldMode, activeListId, buildTaskGroups ] );

    // const filteredGroups = useMemo( () => {
    //     const tempGroups = buildTaskGroups( tasksData, customGroups );
    //     console.log( "Todo :: kanban view :: filteredGroups called. :: tempGroups = ", tempGroups, " :: ", "customGroups = ", customGroups );
    //     return tempGroups ? [ ...tempGroups ].sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) ) : [];
    // }, [ customGroups, tasksData, groupByField, groupByFieldMode, activeListId, buildTaskGroups ] );

    const [ selectedColumnId, setSelectedColumnId ] = useState( null );
    /* console.log(
        "Kanban View :: on component mount",
        " :: ", "tasksData = ", tasksData,
        " :: ", "columnOrder = ", columnOrder,
        " :: ", "customGroups = ", customGroups,
        " :: ", "groups = ", groups,
        // " :: ", " filteredColumns = ", filteredColumns,
        " :: ", "filteredGroups = ", filteredGroups,
    ); */

    // useEffect( () => {
    //     // Initialize todoListGroupIndex for all tasks if not already set
    //     const tasksNeedingUpdate = tasksData.filter(
    //         ( task ) => task.todoListGroupIndex === undefined || task.todoListGroupIndex === -1,
    //     );

    //     if ( tasksNeedingUpdate.length > 0 ) {
    //         // Group tasks by their todoListGroupId
    //         const tasksByGroup = {};
    //         tasksData.forEach( ( task ) => {
    //             const groupId = task.todoListGroupId;
    //             if ( !tasksByGroup[ groupId ] ) tasksByGroup[ groupId ] = [];
    //             tasksByGroup[ groupId ].push( task );
    //         } );

    //         // Update todoListGroupIndex for each task
    //         const updates = [];
    //         const updatedTasksData = tasksData.map( ( task ) => {
    //             if ( task.todoListGroupIndex === undefined || task.todoListGroupIndex === -1 ) {
    //                 const groupTasks = tasksByGroup[ task.todoListGroupId ] || [];
    //                 const groupTaskIds = groupTasks.map( ( t ) => t._id );
    //                 const index = groupTaskIds.indexOf( task._id );

    //                 if ( index !== -1 ) {
    //                     const updatedTask = { ...task, todoListGroupIndex: index };
    //                     updates.push( {
    //                         id: updatedTask._id,
    //                         index: updatedTask.index,
    //                         todoListGroupIndex: updatedTask.todoListGroupIndex,
    //                     } );
    //                     return updatedTask;
    //                 }
    //             }
    //             return task;
    //         } );

    //         if ( updates.length > 0 ) {
    //             setTasksData( updatedTasksData );
    //             handleBulkReorderTasks( updates );
    //         }
    //     }
    // }, [] );

    const handleStartCreateGroup = () => {
        // Create initial data.
        setGroupDialogData( createGroup( {
            todoListId: activeListId,
            workspaceId: workspaceId,
            title: "New group",
        } ) );
        setIsGroupDialogOpen( true );
    };

    console.log( "Kanban view :: groups = ", groups, " :: ", "filteredGroups = ", filteredGroups, " :: ", "customGroups = ", customGroups, " :: ", "customGroups = ", customGroups );

    return (
        <div className="p-2 overflow-auto h-full flex-1">
            <DragDropContext onDragEnd={ handleDragGroupedTaskEnd }>
                <Droppable
                    className={ `max-h-[calc(90vh-14rem)] min-h-[calc(90vh-30rem)]` }
                    droppableId="groups"
                    direction="horizontal"
                    type="group"
                >
                    { ( provided, snapshot ) => (
                        <div
                            className={ `flex space-x-2 max-h-[calc(90vh-7rem)] min-h-[calc(100vh-30rem)]` }
                            ref={ provided.innerRef }
                            { ...provided.droppableProps }
                        >
                            { groups &&
                                utils.val.isValidArray( groups, true ) &&
                                groups
                                    .sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) )
                                    .map( ( group, index ) => {
                                        return (
                                            <Column
                                                group={ group }
                                                key={ group?._id }
                                                index={ group?.index ?? index }
                                                onCreateTodoGroup={ onCreateTodoGroup }
                                                onUpdateTodoGroup={ onUpdateTodoGroup }
                                                onDeleteTodoGroup={ onDeleteTodoGroup }
                                                { ...props }
                                            />
                                        );
                                    } ) }
                            { provided.placeholder }

                            <div className={ `w-72 flex-shrink-0 flex items-start pt-2` }>
                                <Button variant="outline" className="w-full border-dashed" onClick={ handleStartCreateGroup }>
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Column
                                </Button>
                            </div>
                        </div>
                    ) }
                </Droppable>
            </DragDropContext>

            <TaskGroupDialog
                data={ groupDialogData }
                setData={ setGroupDialogData }
                isOpen={ isGroupDialogOpen }
                setIsOpen={ setIsGroupDialogOpen }
                onOpenChange={ () => { setIsGroupDialogOpen( !isGroupDialogOpen ); } }
                onCreateTodoGroup={ onCreateTodoGroup }
                onUpdateTodoGroup={ onUpdateTodoGroup }
                onDeleteTodoGroup={ onDeleteTodoGroup }
            />
        </div>
    );
}

"use client";

import { useMemo } from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/features/Todo/blocks/Kanban/task-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import useTasksStore from "@/store/task.store";
import * as utils from "akashatools";
import useTask from "@/lib/hooks/useTask";

export function Column ( { group, index, onDeleteTodoGroup, onUpdateTodoGroup } ) {
    const {
        tasksData,
        getTaskById,
        groupByField,
        showEmptyGroups,
        groupByFieldMode,
        groups,
        setGroups,
        getFilteredColumns,
        createGroup,
        updateGroup,
        deleteGroup,
        addTask,
        buildTaskGroupsData,
    } = useTasksStore();

    const {
        handleCreateTask,
        handleUpdateTask,
        handleChange,
        handleSubmitRouting,
        handleBulkUpdateTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleReorderTasks,
        handleOpenTaskNotes,
        updateOrderFieldById,
    } = useTask();

    const [ editingField, setEditingField ] = useState( null );
    const [ isEditingTitle, setIsEditingTitle ] = useState( false );
    const [ title, setTitle ] = useState( group?.title ?? "" );
    const [ newTaskTitle, setNewTaskTitle ] = useState( "" );
    const [ isAddingTask, setIsAddingTask ] = useState( false );
    const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
    const titleInputRef = useRef( null );

    // Update title when group changes
    useEffect( () => {
        setTitle( group?.title ?? "" );
    }, [ group?.title ] );

    const handleTitleSave = () => {
        if ( title.trim() === "" ) return;

        // updateColumn( group?._id, { title } );
        onUpdateTodoGroup( { ...group, title: title } );
        setIsEditingTitle( false );
    };

    const handleAddTask = async () => {
        // Create the new task data.
        if ( newTaskTitle.trim() === "" ) return;

        const newTask = {
            title: newTaskTitle,
            todoListGroupId: group._id,
            todoListId: group.todoListId,
            index: group.taskIds ? group.taskIds.length : 0,
            order: group.taskIds ? group.taskIds.length : 0,
        };

        // Update the server.
        const result = await handleCreateTask( newTask );
        if ( result ) {
            // Update the state local to the app.
            addTask( result );

            // Update the group's taskIds array
            const updatedGroup = {
                ...group,
                taskIds: [ ...( group.taskIds || [] ), result._id ],
            };
            onUpdateTodoGroup( updatedGroup );

            // Refresh groups
            buildTaskGroupsData();
        }

        // Clear out state values.
        setNewTaskTitle( "" );
        setIsAddingTask( false );
    };

    const handleDeleteColumn = () => {
        // Close the dialog
        setIsDeleteDialogOpen( false );

        // Delete the group
        onDeleteTodoGroup( group?._id );
    };

    // Get sorted tasks for this group
    const sortedTasks = useMemo( () => {
        if ( !utils.val.isValidArray( group?.taskIds, true ) ) return [];

        return group.taskIds
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
    }, [ group?.taskIds, getTaskById ] );

    return (
        <Draggable key={ group?._id } draggableId={ group?._id } index={ index }>
            { ( provided, snapshot ) => (
                <div
                    className="w-72 flex-shrink-0"
                    ref={ provided.innerRef }
                    { ...provided.draggableProps }
                    { ...provided.dragHandleProps }
                >
                    <Card className={ `h-full max-h-[95vh] top-0 flex flex-col ${ snapshot.isDragging ? "opacity-70" : "" }` }>
                        <CardHeader className="p-2 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center space-x-1">
                                <div { ...provided.dragHandleProps } className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>

                                { isEditingTitle ? (
                                    <div className="flex w-full space-x-1">
                                        <Input
                                            ref={ titleInputRef }
                                            value={ title }
                                            onChange={ ( e ) => setTitle( e.target.value ) }
                                            className="h-6 text-sm"
                                            onKeyDown={ ( e ) => {
                                                if ( e.key === "Enter" ) handleTitleSave();
                                                if ( e.key === "Escape" ) setIsEditingTitle( false );
                                            } }
                                            autoFocus
                                        />
                                        <Button size="sm" className="h-6 px-1.5 text-xs" onClick={ handleTitleSave }>
                                            Save
                                        </Button>
                                    </div>
                                ) : (
                                    <CardTitle className="text-sm font-medium">{ group.title }</CardTitle>
                                ) }
                            </div>

                            <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-1">{ group?.taskIds?.length }</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-3 w-3" />
                                            <span className="sr-only">Column actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36">
                                        <DropdownMenuItem
                                            onClick={ () => {
                                                setIsEditingTitle( true );
                                                setTimeout( () => titleInputRef.current?.focus(), 0 );
                                            } }
                                            className="text-xs py-0.5 px-1.5"
                                        >
                                            <Pencil className="mr-1 h-3 w-3" />
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={ () => setIsDeleteDialogOpen( true ) }
                                            className="text-destructive text-xs py-0.5 px-1.5"
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="p-2 pt-0 flex-1 overflow-y-auto">
                            <Droppable
                                droppableId={ group?._id }
                                isCombineEnabled={ true }
                                type="task"
                            >
                                { ( provided, snapshot ) => (
                                    <div
                                        ref={ provided.innerRef }
                                        { ...provided.droppableProps }
                                        className={ `min-h-[100px] ${ snapshot.isDraggingOver ? "bg-muted/50 rounded-md" : "" }` }
                                    >
                                        { sortedTasks.map( ( task, index ) => (
                                            <Draggable
                                                key={ task._id }
                                                draggableId={ task._id }
                                                index={ index }
                                            >
                                                { ( provided, snapshot ) => (
                                                    <div ref={ provided.innerRef } { ...provided.draggableProps } { ...provided.dragHandleProps }>
                                                        <TaskCard task={ task } groupId={ group._id } isDragging={ snapshot.isDragging } />
                                                    </div>
                                                ) }
                                            </Draggable>
                                        ) ) }
                                        { provided.placeholder }
                                    </div>
                                ) }
                            </Droppable>

                            { isAddingTask ? (
                                <div className="mt-1 space-y-1">
                                    <Input
                                        placeholder="Enter task title..."
                                        value={ newTaskTitle }
                                        onChange={ ( e ) => setNewTaskTitle( e.target.value ) }
                                        onKeyDown={ ( e ) => {
                                            if ( e.key === "Enter" ) handleAddTask();
                                            if ( e.key === "Escape" ) {
                                                setNewTaskTitle( "" );
                                                setIsAddingTask( false );
                                            }
                                        } }
                                        className="h-6 text-xs"
                                        autoFocus
                                    />
                                    <div className="flex space-x-1">
                                        <Button size="sm" className="h-6 px-1.5 text-xs" onClick={ handleAddTask }>
                                            Add
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-1.5 text-xs"
                                            onClick={ () => {
                                                setNewTaskTitle( "" );
                                                setIsAddingTask( false );
                                            } }
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full mt-1 text-muted-foreground h-6 text-xs"
                                    size="sm"
                                    onClick={ () => setIsAddingTask( true ) }
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Task
                                </Button>
                            ) }
                        </CardContent>
                    </Card>

                    <Dialog open={ isDeleteDialogOpen } onOpenChange={ setIsDeleteDialogOpen }>
                        <DialogOverlay className={ `saturate-50 backdrop-blur-sm fill-mode-backwards` } />
                        <DialogContent className="max-w-xs p-4">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base">Delete Column</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm">
                                { `Are you sure you want to delete the group "${ group.title }"? This will also delete all tasks in this
                                group.`}
                            </p>
                            <DialogFooter className="pt-2">
                                <Button variant="outline" className="h-7 text-xs" onClick={ () => setIsDeleteDialogOpen( false ) }>
                                    Cancel
                                </Button>
                                <Button variant="destructive" className="h-7 text-xs" onClick={ handleDeleteColumn }>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) }
        </Draggable>
    );
}

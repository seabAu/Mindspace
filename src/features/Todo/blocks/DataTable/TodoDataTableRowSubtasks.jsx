import React, { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import TaskRow from "./TodoDataTableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as utils from 'akashatools';

const TodoDataTableRowSubtasks = ( { parentTask, subTasks, tasks, onUpdateTask, onMoveTask, visibleColumns, allColumns, ...props } ) => {
    // const { parentTask, subTasks, tasks, onUpdateTask, onMoveTask, visibleColumns, allColumns } = props;

    const handleAddSubtask = useCallback(
        ( taskId ) => {
            const newSubTasks = [ ...parentTask?.subtaskIds, taskId ];
            // onUpdateTask( parentTask._id, { subtaskIds: newSubtasks } );
            console.log( "TodoDataTableRowSubtasks :: handleAddSubtask :: taskId = ", taskId, " :: ", "newSubTasks = ", newSubTasks );
            let updatedTask = onUpdateTask( { ...parentTask, subtaskIds: newSubTasks } );
        },
        [ parentTask, onUpdateTask ],
    );

    const handleRemoveSubtask = useCallback(
        ( taskId ) => {
            const newSubtasks = parentTask?.subtaskIds?.filter( ( id ) => id !== taskId );
            // onUpdateTask( parentTask?._id, { tasks: newSubtasks } );
            onUpdateTask( { ...parentTask, subtaskIds: newSubtasks } );
            // Update the removed task to no longer be a subTask
            // onUpdateTask( taskId, { parentTaskId: null } );
            let t = tasks?.find( ( t, i ) => ( t?._id === taskId ) );
            if ( t ) onUpdateTask( { ...t, parentTaskId: null } );
        },
        [ parentTask, onUpdateTask ],
    );

    const availableTasks = tasks.filter(
        ( task ) => task?._id !== parentTask?._id && !parentTask?.tasks?.includes( task._id ) && !task?.parentTaskId,
    );

    const getTaskById = ( tasks, id ) => {
        if ( utils.val.isValidArray( tasks, true ) && utils.val.isDefined( id ) ) {
            return tasks?.filter( ( t, i ) => ( t?._id === id ) );
        }
        return null;
    };

    return (
        <div className="subTask-table w-full">
            <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-medium">Subtasks</h4>
                <Select onValueChange={ handleAddSubtask }>
                    <SelectTrigger className="w-[120px] h-6 text-xs">
                        <SelectValue placeholder="Add subTask" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new" className="text-xs">
                            <div className="flex items-center">
                                <Plus className="w-3 h-3 mr-1" />
                                Add New Task
                            </div>
                        </SelectItem>
                        { availableTasks.map( ( task ) => (
                            <SelectItem key={ task?._id } value={ task?._id } className="text-xs">
                                { task?.title }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>
            </div>

            <Table className="w-full">
                <TableHeader>
                    <TableRow className="bg-muted dark:bg-gray-800">
                        { visibleColumns.map( ( column ) => (
                            <TableHead key={ column?.field ?? 'ERRnoFieldNameFound' } className="p-0.5 text-left text-xs font-medium text-muted-foreground dark:text-gray-400">
                                { column?.field ?? 'ERRnoFieldNameFound' }
                            </TableHead>
                        ) ) }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { subTasks.map( ( id ) => {
                        let subTask = getTaskById( tasks, id );
                        if ( subTask ) {
                            return (
                                <TaskRow
                                    key={ subTask?._id }
                                    task={ subTask }
                                    tasks={ tasks }
                                    onUpdateTask={ onUpdateTask }
                                    onMoveTask={ onMoveTask }
                                    groupId={ parentTask ? parentTask?._id : 'none' }
                                    visibleColumns={ visibleColumns }
                                    allColumns={ allColumns }
                                />
                            );
                        }
                    } ) }
                </TableBody>
            </Table>
        </div>
    );
};

export default React.memo( TodoDataTableRowSubtasks )


import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useTasksStore from '@/store/task.store';
import useTask from '@/lib/hooks/useTask';
import { arrSafeTernary } from '@/lib/utilities/data';

const TaskGroupDialog = ( props ) => {
    const {
        type = 'add',
        isOpen, setIsOpen, onOpenChange,
        data, setData,
        // dialogType, dialogDataType,
        onCreateTodoGroup,
        onUpdateTodoGroup,
        onDeleteTodoGroup,
        children,
    } = props;

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

    const [ formData, setFormData ] = useState( data ? data : null );

    useEffect( () => { setFormData( data ); }, [] );

    const handleChange = ( name, value ) => {
        setFormData( { ...arrSafeTernary( formData ), [ name ]: value } );
    };

    const buildDialog = ( type ) => {
        if ( type ) {
            switch ( type ) {
                case 'add':
                    return (
                        <Dialog
                            open={ isOpen }
                            onOpenChange={ onOpenChange ?? setIsOpen }
                        >
                            <DialogOverlay className={ `bg-sextary-700/40 saturate-50 backdrop-blur-sm fill-mode-backwards` } />
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create Custom Group</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="group-name">Group Name</Label>
                                        <Input
                                            id="group-name"
                                            defaultValue={ formData?.title ?? 'New Group' }
                                            onChange={ ( e ) => {
                                                handleChange( 'title', e.target.value );
                                            } }
                                            placeholder="Enter group name..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="group-color">Group Color</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="group-color"
                                                type="color"
                                                defaultValue={ formData?.color ?? '#FFFFFF' }
                                                onChange={ ( e ) => {
                                                    handleChange( 'color', e.target.value );
                                                } }
                                                className="w-16 h-8 p-1"
                                            />
                                            <div className="w-8 h-8 rounded-md" style={ { backgroundColor: formData?.color ?? '#FFFFFF' } } />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={ () => {
                                        setData( null );
                                        setIsOpen( false );
                                    } }>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={ () => { handleCreateTaskGroup( formData ); } }
                                    >
                                        Create Group
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    );
                    break;
                case 'delete':
                    if ( !formData || !utils.val.isObject( formData ) ) { return; }
                    return (
                        <Dialog
                            open={ isOpen }
                            onOpenChange={ onOpenChange ?? setIsOpen }
                        >
                            <DialogContent className="max-w-xs p-4">
                                <DialogHeader className="space-y-1">
                                    <DialogTitle className="text-base">Delete Group</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm">
                                    { `Are you sure you want to delete the group "${ formData?.title }"? This will also delete all tasks in this group.` }
                                </p>
                                <DialogFooter className="pt-2">
                                    <Button variant="outline" className="h-7 text-xs" onClick={
                                        () => {
                                            setData( null );
                                            setIsOpen( false );
                                        } }>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" className="h-7 text-xs" onClick={ () => {
                                        handleDeleteTaskGroup( formData?._id );
                                        setIsOpen( false );
                                    } }>
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    );
                case 'update':
                    if ( !formData || !utils.val.isObject( formData ) ) { return; }
                    return (
                        <Dialog
                            open={ isOpen }
                            onOpenChange={ onOpenChange ?? setIsOpen }
                        >
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
                                            onChange={ ( e ) => {
                                                handleChange( 'title', e.target.value );
                                            } }
                                            onKeyDown={ ( e ) => {
                                                if ( e.key === "Enter" ) {
                                                    // handleUpdateTaskGroup( data );
                                                    handleUpdateTaskGroup( formData );
                                                    isOpen( false );
                                                }
                                            } }
                                            className="h-6 text-xs"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-1">
                                    <Button
                                        variant="outline"
                                        className="h-6 text-xs"
                                        onClick={ () => {
                                            setData( null );
                                            isOpen( false );
                                        } }>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="h-6 text-xs"
                                        onClick={ () => {
                                            handleUpdateTaskGroup( formData );
                                            isOpen( false );
                                        } }>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    );

                default:
                    break;
            }
        }
    };

    return (
        <div className={ `` }>
            { type && isOpen ? ( buildDialog( type ) ) : ( <></> ) }
        </div>
    );
};

export default TaskGroupDialog;
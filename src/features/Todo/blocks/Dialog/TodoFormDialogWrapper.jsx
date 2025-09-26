import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { DIALOG_TYPES } from '@/lib/config/config';
import { FormDialogWrapper } from '@/blocks/FormDialog/FormDialogWrapper.jsx';
import useTask from '@/lib/hooks/useTask';
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';
import { CLOSE_KEYBOARD_SHORTCUT } from '@/lib/config/constants';

const TodoFormDialog = ( props ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 
    const {
        initialData,
        data,
        setData = () => { },
        refData,
        dataSchema,
        dialogOpen,
        setDialogOpen = () => { },
        handleSubmit = () => { },
        handleChange = () => { },
        handleClose = () => { },
        dialogTrigger,
        dialogType = 'add',
        dataType = 'task', // Name of type of data being represented.
        debug = false,
    } = props;

    const {
        getData,
        schemas, getSchema, fetchSchemas,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData,
        fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
    } = useTasksStore();

    // Helper to close the dialog.
    const close = useCallback( () => {
        // handleClose();
    }, [ dialogOpen, setDialogOpen, handleClose ] );

    // Adds a keyboard shortcut to toggle the dialog.
    useEffect( () => {
        const handleKeyDown = ( e ) => {
            if ( e.key === CLOSE_KEYBOARD_SHORTCUT && ( e?.metaKey || e?.ctrlKey ) ) {
                e.preventDefault();
                close();
            }
        };

        window.addEventListener( "keydown", handleKeyDown );
        return () => window.removeEventListener( "keydown", handleKeyDown );
    }, [ close ] );

    const constructDialog = () => {
        return (
            dialogType && utils.val.isString( dialogType ) &&
            DIALOG_TYPES.includes( dialogType.toString().toLowerCase() ) &&
            ( <div className={ `content-body mx-auto h-auto w-full justify-center items-center` }>
                { ( dialogOpen ) && data && (
                    <FormDialogWrapper
                        data={ data }
                        setData={ setData }
                        refData={ getData() }
                        initialData={ initialData }
                        dataSchema={ getSchema( dataType ?? 'task' ) }
                        dialogOpen={ !!dialogOpen }
                        setDialogOpen={ setDialogOpen }
                        dialogTrigger={ dialogTrigger }
                        handleSubmit={ handleSubmit }
                        handleChange={ handleChange }
                        handleClose={ handleClose }
                        dialogType={ dialogType ?? 'add' }
                        dataType={ dataType ?? 'task' }
                        contentClassNames={ '' }
                        dialogClassNames={ '' }
                        useOverlay={ true }
                        classNames={ '' }
                        debug={ debug }
                    /> ) }
            </div> )
        );
    };

    return ( <div className={ `h-full w-full flow-root flex flex-col justify-start items-stretch gap-4 relative overflow-hidden` }>
        { constructDialog() }
    </div> );
};

const TodoFormDialogWrapper = ( { dialogProps } ) => {
    // Dialog menu for Edit and Create Task dialog menu functionality. 

    const {
        getData,
        schemas, getSchema, fetchSchemas,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces,
        workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData,
        fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
    } = useTasksStore();

    const {
        initialTaskData, setInitialTaskData,
        dialogInitialData, setDialogInitialData,
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
        buildDialog,
        // handleChange,
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleSubmitRouting,

        // GETTERS / SETTERS
        taskList, setTaskList,
        // dialogOpen, setDialogOpen,
        // dialogType, setDialogType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        dialogData, setDialogData,
        dialogSchema, setDialogSchema,
        dialogDataType, setDialogDataType,
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
        loading: loadingTasks, setLoading: setLoadingTasks,
        error: errorTasks, setError: setErrorTasks,
    } = useTask();

    return (
        <>
            { dialogType === 'add' && (
                // Create File Dialog
                <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    dataSchema={ getSchema( dialogDataType ?? 'task' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, dialogDataType ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dataType={ dialogDataType ?? 'task' }
                    dialogType={ dialogType ?? 'add' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'edit' && (
                // Edit File Dialog
                <TaskDialog
                    data={ dialogData ?? selectedTask }
                    setData={ setDialogData }
                    dataSchema={ getSchema( dialogDataType ?? 'task' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, dialogDataType ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dataType={ dialogDataType ?? 'task' }
                    dialogType={ dialogType ?? 'edit' }
                    debug={ debug }
                />
            ) }
        </>
    );
};

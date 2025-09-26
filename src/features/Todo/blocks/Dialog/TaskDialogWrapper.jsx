import React from 'react';
import * as utils from 'akashatools';
import useGlobalStore from '@/store/global.store';
import useTasksStore from '@/store/task.store';
import useTask from '@/lib/hooks/useTask';
import TaskDialog from './TaskDialog';

const TaskDialogWrapper = () => {
    const {
        // Debug state
        debug, setDebug,
        // Fetch requests state
        schemas, getSchema,
        data, getData,
    } = useGlobalStore();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
    } = useTasksStore();

    const {
        // VARIABLES
        taskData, setTaskData,
        initializeNewTask,
        // initialTaskData, setInitialTaskData,
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

        // GETTERS / SETTERS
        taskColumns, setTaskColumns,
        taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dataModel, setFormDataModel,
        dialogData, setDialogData,
        dialogDataType, setDialogDataType,
        dialogSchema, setDialogSchema,
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
        handleGetSchemas,
        getSchemaForDataType,
        loading, setLoading,
        error, setError,
        loadingTasks, setLoadingTasks,
        errorTasks, setErrorTasks,
    } = useTask();

    return (
        <>
            { dialogType === 'add' && (
                <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'add' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'add' ) }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data, 'task' ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
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
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogType === 'edit' }
                    setDialogOpen={ () => setDialogType( dialogType !== 'none' ? 'none' : 'edit' ) }
                    handleSubmit={ ( data ) => { handleEditSubmit( data, 'task' ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ dialogType ?? 'edit' }
                    dataType={ dialogDataType ?? 'task' }
                    debug={ debug }
                />
            ) }

        </>
    );
};

export default TaskDialogWrapper;


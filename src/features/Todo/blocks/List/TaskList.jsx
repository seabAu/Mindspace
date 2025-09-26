import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useTask from '@/lib/hooks/useTask';
import * as utils from 'akashatools';
// import './Task.css';
import TaskItemContent from './TaskItemContent';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';
import { TodoDialog } from '../Dialog/task-dialog';

const TaskList = ( props ) => {
    const {
        tasks = [], setTasks,
        moveTask,
        reorderTasks,
        layout,
        options,
        children,
    } = props;

    const { debug } = useGlobalStore();

    const {
        requestFetchTasks,
        setRequestFetchTasks,
        tasksData,
        setTasksData,
        fetchTasks,
        taskListData,
        setTaskListData,
        taskGoalsData,
        setTaskGoalsData,
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
        // taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        isEditing, setIsEditing,
        isCreating, setIsCreating,
        dialogData, setDialogData,
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
    } = useTask();

    const [ taskList, setTaskList ] = useState( [] );
    const [ isTaskDialogOpen, setIsTaskDialogOpen ] = useState( false );
    const [ selectedTask, setSelectedTask ] = useState( null );

    useEffect( () => {
        setTaskList( tasks );
    }, [ tasks ] );

    const reorderItem = ( items, item ) => {
        const [ removed ] = items.splice( item?.initial.index, 1 );
        items.splice( item?.destination.index, 0, removed );
    };

    const onDragEndHandle = ( result ) => {
        // dropped outside the list
        if ( !result.destination ) { return; }

        reorderItem( {
            initial: result.source.index,
            destination: result.destination.index,
        } );
    };

    const reorder = ( list, initialIndex, destinationIndex, doRenumber = false ) => {
        const result = [ ...list ];
        const [ removed ] = result.splice( initialIndex, 1 );
        result.splice( destinationIndex, 0, removed );

        if ( doRenumber ) {
            let updatedTasks = result?.map( ( item, index ) => {
                // if ( item?.index === destinationIndex ) { return { ...item, index: destinationIndex }; }
                // if ( item?.index > initialIndex ) { return { ...item, index: item?.index - 1 }; }
                // if ( item?.index >= destinationIndex ) { return { ...item, index: item?.index + 1 }; }
                if ( initialIndex >= destinationIndex ) {
                    // Item was moved up the list (to lower number).
                    // All items between the indexes should be incremented by 1.
                    // if ( item?.index === destinationIndex ) { return { ...item, index: destinationIndex }; }
                    if ( ( item?.index < initialIndex ) && ( item?.index >= destinationIndex ) ) {
                        return { ...item, index: item?.index + 1 };
                    }
                }
                else if ( initialIndex <= destinationIndex ) {
                    // Item was moved down the list (to higher number)
                    // All items between the indexes should be decremented by 1.
                    // if ( item?.index === destinationIndex ) { return { ...item, index: destinationIndex }; }
                    if ( ( item?.index > initialIndex ) && ( item?.index < destinationIndex ) ) {
                        return { ...item, index: item?.index - 1 };
                    }
                }
                // if ( item?.index >= destinationIndex ) { return { ...item, index: item?.index + 1 }; }
                // if ( item?.index > initialIndex ) { return { ...item, index: item?.index - 1 }; }
                return { ...item, index: index };
                // return { ...item };
            } );
            // let sortedTasks = handleSort( updatedTasks, sort );
            // return updatedTasks?.sort( ( a, b ) => ( a?.index - b?.index ) );
            // return handleSort( updatedTasks, sort );
            return updatedTasks;
            /* updatedTasks = updatedTasks?.map( ( t, i ) => {
                if ( i === dragIndex ) {
                    return { ...hoverItem, index: i };
                }
                if ( i === hoverIndex ) {
                    return { ...dragItem, index: i };
                }
                else {
                    return { ...t, index: i };
                }
            } ); */
        }
        else {
            return result;
        }
    };

    const onDragEnd = ( result ) => {
        if ( !result.destination ) return;
        const reorderedTasks = [ ...tasks ];
        const [ movedTask ] = reorderedTasks.splice( result.source.index, 1 );
        reorderedTasks.splice( result.destination.index, 0, movedTask );
        setTasks( reorderedTasks );

        // Lastly, update the global state and/or send change to server for update. 
        // dispatch( updatePosition( reorderedTasks ) );
    };

    /* const handleDragEnd = ( result ) => {
        const { destination, source } = result;

        if ( !destination ) return;
        if ( source.index === destination.index
            && source.droppableId === destination.droppableId
        ) { return; }

        setTasks( ( prevTasks ) =>
            reorder( prevTasks, source.index, destination.index )
        );
    }; */

    const handleDragHover = ( result ) => {
        const { destination, source } = result;

        if ( !destination ) return;
        if ( source.index === destination.index && source.droppableId === destination.droppableId ) { return; }

        setTasks( ( prevTasks ) =>
            reorder( prevTasks, source.index, destination.index, false )
        );
    };


    const handleBeforeCapture = useCallback( () => {
        /*...*/
        if ( debug === true ) console.log( "TaskList", " :: ", "handleBeforeCapture", " :: ", "tasks list = ", taskList );
    }, [] );

    const handleBeforeDragStart = useCallback( () => {
        /*...*/
        if ( debug === true ) console.log( "TaskList", " :: ", "handleBeforeDragStart", " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragStart = useCallback( () => {
        /*...*/
        if ( debug === true ) console.log( "TaskList", " :: ", "handleDragStart", " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragUpdate = useCallback( ( update ) => {
        /*...*/
        if ( debug === true ) console.log( "TaskList", " :: ", "handleDragUpdate", " :: ", "update = ", update, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragEnd = useCallback( ( result ) => {
        // the only one that is required
        const { destination, source } = result;

        if ( !destination ) return;
        if ( source.index === destination.index
            && source.droppableId === destination.droppableId
        ) { return; }

        // const reorderedTasks = [ ...taskList ];
        // const [ movedTask ] = reorderedTasks.splice( result.source.index, 1 );
        // reorderedTasks.splice( result.destination.index, 0, movedTask );

        let reorderedTasks = reorder( tasks, source.index, destination.index, true );
        // setTaskList( ( prevTasks ) => reorder( prevTasks, source.index, destination.index, true ) );
        setTaskList( reorderedTasks );
        setTasks( reorderedTasks );
        if ( debug === true )
            console.log(
                "TaskList",
                " :: ", "handleDragEnd",
                " :: ", "result = ", result,
                " :: ", "source = ", source,
                " :: ", "destination = ", destination,
                " :: ", "movedTask = ", movedTask,
                " :: ", "tasks list = ", taskList,
                " :: ", "reorderedTasks list = ", reorderedTasks,
            );
        handleBulkReorderTasks( reorderedTasks, true );
    }, [] );

    return (
        <div
            // className={ `task-interface-container !w-full !min-w-full !max-w-full !h-screen max-h-screen !px-0 mb-0 gap-0 !min-h-screen` }
            className={ `task-interface-container !w-full !min-w-full !max-w-full !h-full max-h-full !px-0 mb-0 gap-0 !min-h-full ` }
        >
            {/* <Tasks.List
                HTMLBackend={ HTMLBackend }
                tasks={ tasks }
                setTasks={ setTasks }
                reorderTasks={ reorderTasks }
                layout={ layout }
                options={ options }
            /> */}
            <DragDropContext
                onDragEnd={ handleDragEnd }
                onDragStart={ handleDragStart }
                onDragUpdate={ handleDragUpdate }
                onBeforeCapture={ handleBeforeCapture }
                onBeforeDragStart={ handleBeforeDragStart }
            >
                <Droppable droppableId="droppable">
                    { ( provided, snapshot ) => (
                        <div
                            { ...provided.droppableProps }
                            ref={ provided.innerRef }
                        >
                            { ( taskList && utils.val.isValidArray( taskList, true ) && (
                                taskList
                                    // ?.sort( ( a, b ) => ( a?.index - b?.index ) )
                                    ?.map( ( t, index ) => {
                                        // The <Task /> component will do all the checking for required data points.
                                        // if ( utils.val.isObject( t ) ) {
                                        // Valid object.
                                        return (
                                            <Draggable
                                                key={ t?._id }
                                                draggableId={ t?._id }
                                                index={ index }
                                                // index={ t?.index }
                                                style={ {
                                                    backgroundColor: snapshot.isDragging ? 'blue' : 'white',
                                                    fontSize: 18,
                                                    ...provided.draggableProps?.style,
                                                } }
                                            >
                                                { ( provided, snapshot ) => {
                                                    return (
                                                        <div
                                                            ref={ provided.innerRef }
                                                            data-testid="todo-list-item"
                                                            { ...provided.draggableProps }
                                                            { ...provided.dragHandleProps }
                                                            className="todo_list__todos__li"
                                                            onDoubleClick={ ( e ) => {
                                                                e.preventDefault();
                                                                setSelectedTask( t );
                                                                setIsTaskDialogOpen( true );
                                                            } }
                                                        >
                                                            <TaskItemContent
                                                                key={ `task-list-item-${ index }-${ t?.index }-${ t?._id }` }
                                                                // index={ t?.index }
                                                                index={ index }
                                                                task={ t }
                                                                setTask={ ( task, updates ) => (
                                                                    setTaskList(
                                                                        taskList?.map( ( t ) => ( t?._id === task?._id ? { ...task, ...updates } : t ) )
                                                                    )
                                                                ) }
                                                                updateTask={ handleUpdateTask }
                                                                deleteTask={ handleDeleteTask }
                                                                tasks={ taskList } // tasks={ [ ...tasks ] }
                                                                setTasks={ setTaskList }
                                                                layout={ layout }
                                                                options={ options }
                                                                moveTask={ moveTask }
                                                                reorderTasks={ reorderTasks }
                                                                handleDragEnd={ handleDragEnd }
                                                                handleDragHover={ handleDragHover }
                                                                { ...props }
                                                            />
                                                        </div>
                                                    );
                                                } }
                                            </Draggable>
                                        );
                                        // }
                                    } )
                            ) ) }
                            { provided.placeholder }
                        </div>
                    ) }
                </Droppable>
            </DragDropContext>

            {/* Task Dialog */ }
            <TodoDialog
                open={ isTaskDialogOpen }
                onOpenChange={ setIsTaskDialogOpen }
                task={ selectedTask }
            />
        </div>
    );
};

export default TaskList;
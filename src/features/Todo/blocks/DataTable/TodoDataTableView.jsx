import React, { useState, useCallback, useMemo, useEffect, useId } from "react";
import TodoDataTableRow from "./TodoDataTableRow";
import { TodoDialog } from "@/features/Todo/blocks/Dialog/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowBigDownDash, ArrowBigLeftDash, ArrowBigUpDash, Plus, X } from "lucide-react";
// import { useHotkeys } from "react-hotkeys-hook";
import * as utils from 'akashatools';
import { caseCamelToSentence, convertCamelCaseToSentenceCase } from "@/lib/utilities/string";
import useGlobalStore from "@/store/global.store";
import useTask from "@/lib/hooks/useTask";
import { TodoNotesSidebar } from "@/features/Todo/blocks/Sidebar/TodoNotesSidebar";
import { twMerge } from "tailwind-merge";
import useTasksStore from "@/store/task.store";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildSelect } from "@/lib/utilities/input";

const TodoDataTableView = ( props ) => {
    const {
        tasks, setTasks,
        // loadTasks,
        // fetchTasks,
        onUpdateTask,
        deleteTask,
        createTask,
        onClickTask,
        // reorderTasks,
        groupBy = 'status',
        activeFilters,
    } = props;

    const {
        debug, setDebug,
        user, setUser,
        workspaceId, setWorkspaceId,
        loading, setLoading,
        error, setError,
    } = useGlobalStore();

    if ( debug === true )
        console.log( 'TodoDataTableView :: rendering :: ', 'props = ', props );

    const {
        // VARIABLES
        columnConfig,
        initializeNewTask,
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
        dialogData, setDialogData,
        dialogSchema, setDialogSchema,
        notesOpen, setNotesOpen,
        notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        sort, setSort,

        // SCHEMA
        taskSchema, setTaskSchema,
        taskListSchema, setTaskListSchema,
        goalSchema, setGoalSchema,
        handleGetSchemas,
        getSchemaForDataType,
        loading: loadingTasks, setLoading: setLoadingTasks,
        error: errorTasks, setError: setErrorTasks,
        getColumnWidth,
    } = useTask();

    const {
        // State variables
        tasksData, setTasksData,
    } = useTasksStore();
    // const allTasks = getAllTasks();

    const [ taskList, setTaskList ] = useState( [] );
    useEffect( () => { setTaskList( tasks ); }, [ tasks ] );
    useEffect( () => { setTaskList( tasks ); }, [] );

    // const [ selectedTask, setSelectedTask ] = useState( null );
    // const [ isDrawerOpen, setIsDrawerOpen ] = useState( false );
    const [ isAddTaskDialogOpen, setIsAddTaskDialogOpen ] = useState( false );
    const [ filters, setFilters ] = useState( {} );
    const [ groupingType, setGroupingType ] = useState( groupBy ?? `status` );
    // const [ sort, setSort ] = useState( 1 ); // 1 for ascending; -1 for descending; 0 for neither. 
    // const [ visibleColumns, setVisibleColumns ] = useState( [] );
    // const [ notesOpen, setNotesOpen ] = useState( false );
    // const [ notesContent, setNotesContent ] = useState( false );

    // useHotkeys( "ctrl+shift+k", () => setIsAddTaskDialogOpen( true ), { enableOnFormTags: true } );

    /* const handleTaskClick = useCallback( ( task ) => {
        setSelectedTask( task );
        setIsDrawerOpen( true );
    }, [] ); */

    const filteredTasks = useMemo( () => {
        // if ( debug === true )
        // console.log( "Tasks Feature :: TableView :: filteredTasks() :: tasks = ", tasks, " :: ", "filters = ", filters );
        // let sortedTasks = handleSort( taskList, sort );
        return taskList?.filter( ( task ) => {
            return Object.entries( filters ).every( ( [ key, value ] ) => {
                if ( !value ) return true;
                // return task[ key ] === value;
                if ( task[ key ] === value ) return true;
                if ( String( task[ key ] ).toLowerCase().includes( String( value ).toLowerCase() ) ) {
                    return true;
                }
                return false;
            } );
        } );
    }, [ taskList, filters ] );

    const groupedTasks = useMemo( () => {
        // if ( debug === true )
        console.log( "Tasks Feature :: TableView :: groupedTasks() :: filteredTasks = ", filteredTasks, " :: ", "filters = ", filters );
        // let sortedTasks = handleSort( filteredTasks, sort );
        let grouped = filteredTasks?.reduce( ( acc, task ) => {
            // const group = task?.status || "No Status";
            let group;
            if ( task?.hasOwnProperty( groupingType ) ) {
                group = task?.[ groupingType ] || "None";
                if ( !acc[ group ] ) {
                    // Initialize new group if not found.
                    acc[ group ] = [];
                }
                acc[ group ].push( task );
            }

            console.log( "Acc = ", acc, " :: ", "group = ", group );
            return acc;
        }, {} );

        console.log( "GroupedTasks() :: grouped = ", grouped );
        return grouped;
    }, [ filteredTasks, groupingType ] );

    const allColumns = useMemo( () => columnConfig, [] );

    const handleAddFilter = useCallback( ( field, value ) => {
        setFilters( ( prev ) => ( { ...prev, [ field ]: value } ) );
    }, [] );

    const handleRemoveFilter = useCallback( ( field ) => {
        setFilters( ( prev ) => {
            const newFilters = { ...prev };
            delete newFilters[ field ];
            return newFilters;
        } );
    }, [] );

    useEffect( () => {
        const handleResize = () => {
            const containerWidth = document.querySelector( ".table-view" )?.clientWidth || 0;
            let totalWidth = 0;
            const newVisibleColumns = [];

            for ( const column of allColumns ) {
                // totalWidth += getColumnWidth( column );
                if ( column && column?.hasOwnProperty( 'hidden' ) && column?.hidden === true ) {
                    // if ( column?.hidden === true ) break;
                }
                else {
                    totalWidth += getColumnWidth( column );
                    if ( totalWidth <= containerWidth ) {
                        newVisibleColumns.push( column );
                    }
                    else { break; }
                }
            }

            setVisibleColumns( newVisibleColumns );
        };

        handleResize();
        window.addEventListener( "resize", handleResize );
        return () => window.removeEventListener( "resize", handleResize );
    }, [ allColumns ] );

    const gridStyles = {
        display: `grid`,
        // gridGap: `0.25rem`,
        // gridAutoRows: `2rem`,
        // gridAuto: `2rem`,
        // gridTemplateColumns: `span 1 / span 1`,
        gridTemplateColumns: `repeat(12, minmax(auto, 1fr))`,
    };

    const gridItemRowStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridTemplateColumns: `span 1 / span 1`,
        gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
    };

    const reorder = ( list, initialIndex, destinationIndex, doRenumber = false ) => {
        const result = [ ...list ];
        const [ removed ] = result.splice( initialIndex, 1 );
        result.splice( destinationIndex, 0, removed );

        if ( doRenumber ) {
            let updatedTasks = result?.map( ( item, index ) => {
                if ( initialIndex >= destinationIndex ) {
                    // Item was moved up the list (to lower number).
                    // All items between the indexes should be incremented by 1.
                    if ( ( item?.index < initialIndex ) && ( item?.index >= destinationIndex ) ) {
                        return { ...item, index: item?.index + 1 };
                    }
                }
                else if ( initialIndex <= destinationIndex ) {
                    // Item was moved down the list (to higher number)
                    // All items between the indexes should be decremented by 1.
                    if ( ( item?.index > initialIndex ) && ( item?.index < destinationIndex ) ) {
                        return { ...item, index: item?.index - 1 };
                    }
                }
                return { ...item, index: index };
            } );
            return updatedTasks;
        }
        else {
            return result;
        }
    };

    const handleBeforeCapture = useCallback( ( before ) => {
        /*  export interface BeforeCapture {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleBeforeCapture", " :: ", "before = ", before, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleBeforeDragStart = useCallback( ( start ) => {
        /*  export interface DragStart {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleBeforeDragStart", " :: ", "start = ", start, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragStart = useCallback( ( start ) => {
        /*  onDragStart will get notified when a drag starts. This responder is optional and therefore does not need to be provided. It is highly recommended that you use this function to block updates to all <Draggable /> and <Droppable /> components during a drag. (See Block updates during a drag below)

                // While the return type is `mixed`, the return value is not used.
                type OnDragStartResponder = (
                    start: DragStart,
                    provided: ResponderProvided,
                ) => unknown;

                // supporting types
                interface DraggableRubric {
                    draggableId: DraggableId;
                    type: TypeId;
                    source: DraggableLocation;
                }

                interface DragStart extends DraggableRubric {
                    mode: MovementMode;
                }

                interface DraggableLocation {
                    droppableId: DroppableId;
                    // the position of the draggable within a droppable
                    index: number;
                }

                type Id = string;
                type DraggableId = Id;
                type DroppableId = Id;
                type TypeId = Id;

                type MovementMode = 'FLUID' | 'SNAP';
                
                start.draggableId: the id of the <Draggable /> that is now dragging
                start.type: the type of the <Draggable /> that is now dragging
                start.source: the location (droppableId and index) of where the dragging item has started within a <Droppable />.
                start.mode: either 'SNAP' or 'FLUID'. This is a little bit of information about the type of movement that will be performed during this drag. 'SNAP' mode is where items jump around between positions (such as with keyboard dragging) and 'FLUID' mode is where the item moves underneath a pointer (such as mouse dragging).
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleDragStart", " :: ", "start = ", start, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragUpdate = useCallback( ( update ) => {
        /*  export interface DragUpdate {
                draggableId: DraggableId;
                mode: MovementMode;
            }
        */
        if ( debug === true ) console.log( "TodoDataTableView", " :: ", "handleDragUpdate", " :: ", "update = ", update, " :: ", "tasks list = ", taskList );
    }, [] );

    const handleDragEnd = useCallback( ( result ) => {
        // the only one that is required
        const { source, destination, type, draggableId } = result;
        console.log( "Data-Table-View :: handleDragEnd :: result = ", result );

        // Return if no destination.
        if ( !destination ) return;

        // Return if it hasn't moved at all. 
        if ( source.index === destination.index
            && source.droppableId === destination.droppableId
        ) { return; }

        // const reorderedTasks = [ ...taskList ];
        // const [ movedTask ] = reorderedTasks.splice( result.source.index, 1 );
        // reorderedTasks.splice( result.destination.index, 0, movedTask );

        // Find the task that was moved via its originating index.
        let updatedTasks = [ ...( utils.val.isValidArray( taskList, true ) ? taskList : [] ) ];
        let movedTask = updatedTasks?.[ source.index ];

        // Update the task's associated group name if it was moved outside of its group.
        if ( source.droppableId !== destination.droppableId ) {
            if ( movedTask ) {
                movedTask = {
                    ...movedTask,
                    [ groupingType ]: destination.droppableId
                };
            }
            updatedTasks = updatedTasks?.map( ( task, index ) => (
                task?.index === source.index
                    ? ( movedTask )
                    : ( task ) )
            );
            onUpdateTask( movedTask );
        }

        let reorderedTasks = reorder( updatedTasks, source.index, destination.index, true );
        setTaskList( ( prevTasks ) => reorder( prevTasks, source.index, destination.index, true ) );
        // setTaskList( reorderedTasks );
        // setTasks( reorderedTasks );
        // if ( debug === true )
        console.log(
            "TodoDataTableView",
            " :: ", "handleDragEnd",
            " :: ", "result = ", result,
            " :: ", "source = ", source,
            " :: ", "destination = ", destination,
            " :: ", "movedTask = ", movedTask,
            " :: ", "tasksData = ", tasks,
            " :: ", "tasks list = ", taskList,
            " :: ", "reorderedTasks list = ", reorderedTasks,
        );
        handleBulkReorderTasks( reorderedTasks, true );
    }, [] );

    const handleCompleteTask = ( t, isComplete = false ) => {
        if ( debug === true )
            console.log( "TodoDataTableView :: handleCompleteTask :: task = ", t, " :: ", "isComplete (override, optional) = ", isComplete );
        // if ( t ) handleToggleComplete( t );
        if ( utils.ao.hasAll( t, [ '_id', 'workspaceId', 'status', 'completed' ] ) ) {
            // Has the required properties.
            let _id = t._id;
            // let workspaceId = t?.workspaceId;
            // let completed = t?.completed;
            let data = { ...t, completed: isComplete, status: isComplete ? 'completed' : 'inProgress' };
            if ( debug === true )
                console.log( "TodoDataTableView :: handleCompleteTask :: before update task :: data = ", data );
            let result = onUpdateTask( data );
            return result;
        }
    };

    const buildTableControls = useCallback(
        () => {
            if ( utils.val.isValidArray( taskList, true ) ) {
                return (
                    <div className={ `controls w-full flex flex-row flex-nowrap justify-start items-center gap-2` }>

                        {/* Create new task */ }
                        <Button
                            variant={ 'outline' }
                            size={ 'sm' }
                            className={ `h-full w-auto !max-w-full m-0 items-stretch justify-stretch self-center rounded-[0.5rem] focus:outline-none focus-within:outline-none focus-visible:outline-none` }
                            // onClick={ () => { handleCreateStart( {} ); } }
                            onClick={ () => {
                                // handleCreateStart( {} );
                                createTask( {
                                    ...initialTaskData,
                                    status: "New",
                                    workspaceId: workspaceId,
                                    userId: user?.id,
                                    index: utils.val.isValidArray( taskList, true ) ? taskList?.length : -1,
                                } );
                            } }
                        >
                            <Plus className={ `!h-6 !w-6 !size-4` } />
                        </Button>

                        {/* Filters */ }
                        <div className={ `filters flex flex-wrap items-stretch justify-start self-center h-auto max-h-10 max-w-[80vw] gap-2` }>
                            <Select
                                defaultValue={ [] }
                                multiple={ true }
                                onValueChange={ ( value ) => handleAddFilter( value, "" ) }
                            >
                                <SelectTrigger className="h-full w-[100px] text-xs m-0 items-center justify-stretch self-center rounded-[0.5rem] ">
                                    <SelectValue placeholder="Add filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    { allColumns.map( ( column ) => (
                                        <SelectItem key={ column?.field ?? 'noNameGiven' } value={ column?.field ?? 'noNameGiven' } className="text-xs">
                                            { convertCamelCaseToSentenceCase( column?.field ?? 'noNameGiven' ) }
                                        </SelectItem>
                                    ) ) }
                                </SelectContent>
                            </Select>
                            { Object.entries( filters ).map( ( [ field, value ] ) => (
                                <div
                                    key={ field }
                                    className={ `flex items-center rounded-[0.5rem] p-0 text-xs px-2 !py-1 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-1 !focus-visible:outline-none !focus-visible:outline-0 !focus-visible:outline-transparent !bg-transparent` }
                                >
                                    <span className="mr-1">{ caseCamelToSentence( field ) }:</span>
                                    <Input
                                        value={ value }
                                        onChange={ ( e ) => handleAddFilter( field, e.target.value ) }
                                        className={ `w-[80px] h-full !p-0 text-xs items-stretch !my-0 !mx-0 !m-0 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg !px-2 !py-0 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 !focus-visible:outline-none !focus-visible:outline-0 !focus-visible:outline-transparent !bg-transparent` }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={ () => handleRemoveFilter( field ) }
                                        className={ `ml-0 p-0 h-full w-4` }
                                    >
                                        <X className="h-2 w-2" />
                                    </Button>
                                </div>
                            ) ) }
                        </div>

                        {/* Group-By Selector */ }
                        <div className={ `filters flex flex-wrap items-stretch justify-start self-center h-auto max-h-10 max-w-[80vw] gap-2` }>
                            { buildGroupByFieldSelect() }
                        </div>

                        {/* Sorting direction */ }
                        <Button
                            size={ 'sm' }
                            variant={ 'outline' }
                            onClick={ () => setSort( sort === 0 ? 1 : ( sort === 1 ? -1 : ( sort === -1 ? 0 : 0 ) ) ) }
                            className={ `h-full m-0 items-center justify-center self-center rounded-[0.5rem] focus:outline-none w-auto focus-within:outline-none focus-visible:outline-none` }
                        >
                            { sort === 1
                                ? <ArrowBigUpDash className="!h-6 !w-6" />
                                : ( sort === -1
                                    ? <ArrowBigDownDash className="!h-6 !w-6" />
                                    : ( sort === 0
                                        ? <ArrowBigLeftDash className="!h-6 !w-6" />
                                        : <ArrowLeftCircleIcon className="!h-6 !w-6" /> ) )
                            }
                        </Button>

                    </div>
                );
            }
        },
        [ tasksData, taskList ] );

    function getStyle ( style, snapshot ) {
        //  DropAnimation: 
        //      type DropReason = 'DROP' | 'CANCEL';
        //      interface DropAnimation {
        //          // how long the animation will run for
        //          duration: number;
        //          // the animation curve that we will be using for the drop
        //          curve: string;
        //          // the x,y position will be be animating to as a part of the drop
        //          moveTo: Position;
        //          // when combining with another item, we animate the opacity when dropping
        //          opacity: number | null;
        //          // when combining with another item, we animate the scale when dropping
        //          scale: number | null;
        //      }
        if ( !snapshot || !snapshot.isDropAnimating ) {
            return style;
        }
        const { moveTo, curve, duration } = snapshot.dropAnimation;
        // move to the right spot
        const translate = `translate(${ moveTo.x }px, ${ moveTo.y }px)`;
        // add a bit of turn for fun
        // const rotate = 'rotate(0.5turn)';
        const rotate = 'rotate(0.0turn)';

        // patching the existing style
        return {
            ...style,
            transform: `${ translate } ${ rotate }`,
            // slowing down the drop because we can
            transition: `all ${ curve } ${ duration + 0.125 }s`,
            // transitionDuration: `0.001s`,
        };
    }

    const getDraggableStyle = ( isDragging, draggableStyle ) => ( {
        // some basic styles to make the items look a bit nicer
        userSelect: "none",

        // change background colour if dragging
        backgroundColor: isDragging ? "#80088866" : "transparent",
        border: isDragging ? "dashed" : "none",
        borderWidth: isDragging ? "0.125rem" : "0.0rem",

        // styles we need to apply on draggables
        ...draggableStyle
    } );


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    const buildDragDropGroup = useCallback(
        ( groupTasks, groupTitle, groupIndex, provided, snapshot ) => {
            console.log( "buildDragDropGroup :: groupTasks = ", groupTasks, " :: ", "groupTitle = ", groupTitle, " :: ", "groupIndex = ", groupIndex );
            return (
                <Droppable
                    droppableId={ groupTitle }
                    type="task"
                >
                    { ( provided, snapshot ) => (
                        <TableBody
                            key={ `task-table-column-${ groupTitle }` }
                            className={ `table-row-group h-auto max-w-[95vw] border-collapse rounded-xl max-w-[80vw] self-center justify-center items-center` }
                            { ...provided.droppableProps }
                            ref={ provided.innerRef }
                        >
                            <React.Fragment key={ `task-table-column-${ groupTitle }` }>
                                <TableRow
                                    className={ twMerge(
                                        `border-[0.125rem] border-primary-900 bg-sextary-800 hover:bg-sextary-800 transition-all duration-200 ease-in-out`,
                                        // `grid grid-cols-1 bg-muted p-0 text-xs`,
                                        // `task-row !m-0 !p-0 flex justify-center items-center`,
                                        // `!table-row h-full max-h-screen min-h-full w-full min-w-full`,
                                        // `border-[1px] border-primary-900 dark:border-gray-700 bg-gray-900 hover:bg-primary-300 dark:hover:bg-sextary-400/60 transition-all duration-200 ease-in-out`,
                                    ) }
                                    key={ `task-table-column-${ groupTitle }` }
                                    style={ { /* display: 'grid', gridAutoRows: `minmax(auto, 2fr)`, */ } }
                                >
                                    <TableCell colSpan={ visibleColumns?.length + 1 }
                                        className={ `table-cell bg-sextary-200 hover:bg-sextary-800 transition-all duration-200 ease-in-out !h-4 !text-sm !p-[0.25rem] indent-2` }
                                        style={ { /* gridAutoRows: `minmax(auto, 1fr)` */ } }
                                    >
                                        { caseCamelToSentence( groupTitle ) }
                                    </TableCell>
                                </TableRow>

                                { ( groupTasks && utils.val.isValidArray( groupTasks, true ) && (
                                    // Build each task row individually. 
                                    handleSort( groupTasks, sort )
                                        ?.map( ( task, index ) => {
                                            // The <Task /> component will do all the checking for required data points.
                                            return (
                                                <React.Fragment>
                                                    <Draggable
                                                        key={ task?._id }
                                                        index={ task?.index }
                                                        draggableId={ task?._id }
                                                        // className={ twMerge(
                                                        //     `task-row !m-0 !p-0 flex justify-center items-center`,
                                                        //     `!table-row h-full max-h-screen min-h-full w-full min-w-full`,
                                                        //     `border-[1px] border-primary-900 dark:border-gray-700 bg-gray-900 hover:bg-primary-300 dark:hover:bg-sextary-400/60 transition-all duration-200 ease-in-out`,
                                                        // ) }
                                                        style={ {
                                                            backgroundColor: snapshot.isDragging ? 'blue' : 'white',
                                                            fontSize: 18,
                                                            ...provided.draggableProps?.style,
                                                        } }
                                                    >
                                                        { ( provided, snapshot ) => {
                                                            return (
                                                                <TodoDataTableRow
                                                                    // ref={ provided.innerRef }
                                                                    // data-testid="todo-list-item"
                                                                    // { ...provided.draggableProps }
                                                                    // { ...provided.dragHandleProps }
                                                                    // className="todo_list__todos__li"
                                                                    provided={ provided }
                                                                    snapshot={ snapshot }
                                                                    outerRef={ provided.innerRef }
                                                                    data-testid={ `todo-list-item` }
                                                                    // { ...provided.draggableProps }
                                                                    // { ...provided.dragHandleProps }
                                                                    className={ `todo_list__todos__li` }
                                                                    isDragging={ snapshot.isDragging && !snapshot.isDropAnimating }
                                                                    styles={ getStyle(
                                                                        getDraggableStyle(
                                                                            snapshot.isDragging,
                                                                            provided.draggableProps.style
                                                                        ),
                                                                        snapshot
                                                                    ) }
                                                                    /* styles={ getDraggableStyle(
                                                                        snapshot.isDragging,
                                                                        provided.draggableProps.style
                                                                    ) } */
                                                                    id={ task?._id }
                                                                    key={ task?._id }
                                                                    index={ task?.index }
                                                                    task={ task }
                                                                    tasks={ filteredTasks }
                                                                    onUpdateTask={ onUpdateTask }
                                                                    deleteTask={ deleteTask }
                                                                    // onChangeTask={ onChangeTask }
                                                                    onDeleteTask={ deleteTask }
                                                                    onCompleteTask={ handleCompleteTask }
                                                                    onClickTask={ handleOpenTaskNotes }
                                                                    // onMoveTask={ handleMoveTask }
                                                                    groupId={ groupTitle }
                                                                    visibleColumns={ visibleColumns }
                                                                    allColumns={ allColumns }
                                                                    columnConfig={ columnConfig }
                                                                />
                                                            );
                                                        } }
                                                    </Draggable>
                                                </React.Fragment>
                                            );
                                        } )
                                ) ) }

                                {/* Hover-over add new task button with the status (or whatever other way they're grouped) already set, one fro each group. */ }
                                { provided.placeholder }
                                { buildTaskCreateNewRowButton( groupIndex ) }
                            </React.Fragment>
                        </TableBody>
                    ) }
                </Droppable>
            );
        }
        , [ groupedTasks, filteredTasks ]
    );

    const buildTableHeader = useCallback(
        ( columns ) => {
            return (
                <TableHeader className={ `table-row-group !h-8 max-w-[95vw]` } style={ {} }>
                    <TableRow
                        aria-rowspan={ 1 }
                        className={ `!h-8 !max-h-8 !py-0 !m-0 task-table-header-row bg-primary-100 hover:bg-sextary-800 dark:bg-sextary-300 border-x border-x-primary-900` }
                    >
                        <TableHead
                            className={ twMerge( `!h-8 !max-h-8 !py-0 !m-0 border border-primary-900 dark:bg-gray-800 border-x border-x-primary-900`,
                                // `text-left grid grid-rows-12  text-xs font-medium text-muted-foreground dark:text-gray-400 gap-x-10`
                            ) }
                            id={ 'actions' }
                            key={ 'actions' }
                            name={ 'actions' }
                            // colSpan={ columns?.length }
                            width={ `${ 100 }px` } // width={ `${ Number( column?.width ?? 80 ) }px` }
                        >
                            <span
                                className={ twMerge( `text-muted-foreground dark:text-gray-400 overflow-hidden text-ellipsis w-min`,
                                    // `gap-2 grid grid-rows-1 items-center text-xs font-medium flex-nowrap whitespace-nowrap`
                                ) }
                                width={ `${ 100 }px` }
                                style={ {
                                    gridAutoRows: `minmax(auto, 1fr)`,
                                    width: `${ 100 }px`,
                                    ...gridStyles,
                                } }
                            >
                            </span>
                        </TableHead>
                        { columns?.map( ( column, index ) => {
                            let width = getColumnWidth( column );
                            return (
                                <TableHead
                                    className={ twMerge( `!h-8 !max-h-8 table-view-head table-auto relative overflow-auto w-[95vw] max-w-[95vw] !py-0 !m-0 border border-primary-900 dark:bg-gray-800 border-x border-x-primary-900 hover:bg-primary-600`,
                                        // `text-left grid grid-rows-12  text-xs font-medium text-muted-foreground dark:text-gray-400 gap-x-10`
                                    ) }
                                    id={ column?.field }
                                    key={ column?.field }
                                    name={ column?.field }
                                    // colSpan={ columns?.length }
                                    width={ `${ String( width ) }px` } // width={ `${ Number( column?.width ?? 80 ) }px` }
                                >
                                    <span
                                        className={ twMerge( `text-left text-nowrap text-xs font-medium text-muted-foreground dark:text-gray-400 overflow-hidden text-ellipsis`,
                                            // `gap-2 grid grid-rows-1 items-center text-xs font-medium flex-nowrap whitespace-nowrap`
                                        ) }
                                        width={ `${ String( width ) }px` }
                                        style={ {
                                            gridAutoRows: `minmax(auto, 1fr)`,
                                            width: `${ String( width ) }px`,
                                            ...gridStyles,
                                        } }
                                    >
                                        { caseCamelToSentence( column?.field ?? 'noNameGiven' ) }
                                    </span>
                                </TableHead> );
                        } ) }

                    </TableRow>
                </TableHeader>
            );
        }
        , [ groupedTasks, filteredTasks ]
    );

    const buildDragDropTable = useCallback(
        ( taskList ) => {
            // Create the drag-and-drop wrapper for the table, the groups in the table, as well as the task-rows themselves.
            console.log( "TodoDataTableView :: buildDragDropTable :: taskList = ", taskList );
            return (
                <DragDropContext
                    // onDragEnd={ handleDragEnd }
                    onDragEnd={ handleDragEnd }
                    onDragStart={ handleDragStart }
                    onDragUpdate={ handleDragUpdate }
                    onBeforeCapture={ handleBeforeCapture }
                    onBeforeDragStart={ handleBeforeDragStart }
                >
                    {/* <div className={ `task-interface-container !w-full !min-w-full !max-w-full !h-full max-h-full !px-0 mb-0 gap-0 !min-h-full` }> */ }
                    <Table className={ `table-view w-[980px] max-w-[980px] overflow-hidden border-collapse` }>

                        { buildTableHeader( visibleColumns ) }
                        {/* Create a <Droppable /> for each of the columns or groups. Use the droppableId to determine what to do once dropped. */ }
                        {/* { Object.entries( groupedTasks ).map( ( [ status, groupTasks ], groupIndex ) => (
                        buildDragDropGroup( groupTasks, status ?? 'undefined status', groupIndex )
                    ) ) } */}
                        { Object.entries( groupedTasks ).map( ( [ groupByValue, groupTasks ], groupIndex ) => {
                            // let groupTasks = groupedTasks?.[ groupByValue ];
                            // let groupByValue = groupedTasks?.[ groupingType ]?.[ groupingType ];
                            // console.log( "Grouptasks = ", groupTasks, groupedTasks, groupByValue );
                            return buildDragDropGroup( groupTasks, groupByValue ?? 'undefined groupByValue', groupIndex );
                        } ) }
                    </Table>
                    {/* </div> */ }
                </DragDropContext>
            );
        }
        , [ groupedTasks, filteredTasks ]
    );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////



    const buildTaskCreateNewRowButton =
        useCallback(
            ( index ) => {
                return (
                    <TableRow id={ `task-table-body-row-${ index }` }
                        key={ `task-table-body-row-${ index }` }
                        className={ `table-row task-table-body-row !h-2 !p-0 !m-0 bg-sextary-400 hover:bg-sextary-400 border bg-transparent border-primary-900 dark:bg-gray-800 transition-all duration-200 ease-in-out text-xs` }
                    >
                        <TableCell id={ `task-table-body-row-cell-${ index }` }
                            colSpan={ visibleColumns?.length + 1 }
                            className={ `!h-2 !p-0 !m-0 items-stretch justify-stretch !border-0 !border-none` }
                            style={ { /* gridAutoRows: `minmax(auto, 1fr)` */ } }
                        >
                            <Button
                                id={ `task-table-body-row-cell-button-create-new-task` }
                                className={ `!h-full !w-full !p-0 !m-0 items-stretch justify-stretch` }
                                variant={ 'outline' }
                                size={ 'sm' }
                                onClick={
                                    () => {
                                        // Open dialog and init edit. 
                                        // setOpenDialog( true );
                                        createTask( {
                                            ...initialTaskData,
                                            workspaceId: workspaceId,
                                            userId: user ? user?.id : null,
                                            index: utils.val.isValidArray( taskList, true ) ? taskList?.length : -1,
                                        } );
                                    }
                                }
                            >
                                <Plus className={ `!w-full !p-0 !m-0 !size-3` } />
                            </Button>
                        </TableCell>
                    </TableRow>
                );
            }
            , [ tasksData ] );

    const buildGroupByFieldSelect =
        useCallback(
            () => {
                return (
                    buildSelect( {
                        placeholder: 'Grouping',
                        opts: columnConfig
                            ?.map( ( col, i ) => ( col?.field ) )
                            ?.map( ( col, index ) => {
                                if ( col ) {
                                    return ( {
                                        value: col,
                                        name: caseCamelToSentence( col ),
                                        index: index,
                                    } );
                                }
                            } ),
                        value: groupingType ?? groupBy,
                        initialData: groupingType ?? groupBy,
                        key: groupingType ?? groupBy,
                        handleChange: ( key, value ) => {
                            console.log( "TodoDataTableView :: buildGroupByFieldSelect :: Select setGroupingType for taskjs :: value = ", String( value ) );
                            if ( value ) setGroupingType( value );
                        },
                        className: 'text-xs m-0 rounded-[0.5rem]',
                        multiple: false
                    } )
                );
            }
            , [ groupingType ] );

    return (
        <>
            <div className={ `border rounded-xl gap-1 overflow-hidden w-full h-full` }>

                {/* Table control buttons */ }
                { buildTableControls() }

                {/* The table */ }
                { utils.val.isValidArray( filteredTasks, true ) && buildDragDropTable( groupedTasks ) }

                { isAddTaskDialogOpen && ( <TodoDialog
                    isOpen={ isAddTaskDialogOpen }
                    onClose={ () => setIsAddTaskDialogOpen( false ) }
                    createTask={ createTask }
                /> ) }

            </div>

            {/* {
                // useMemo( () => ( (
                <TodoNotesSidebar
                    isOpen={ notesOpen }
                    onOpen={ () => { setNotesOpen( true ); } }
                    onClose={ () => {
                        setNotesContent( null );
                        setNotesOpen( false );
                    } }
                    task={ notesContent }
                    setTask={ () => { setNotesContent( t ); } }
                    onDeleteNotes={ ( notes ) => {
                        if ( onUpdateTask ) onUpdateTask( { ...notesContent, notes: [ '' ] } );
                    } }
                    onUpdateNotes={ ( notes ) => {
                        let t = { ...notesContent, notes: notes };
                        if ( onUpdateTask ) onUpdateTask( t );
                    } }
                />
                // ) ), [ notesOpen, tasks, selectedTask, onUpdateTask ] ) 
            } */}

        </>
    );
};


export default TodoDataTableView;



/* const buildTableRowGroup = ( groupTasks, groupTitle, index ) => {
    return (
        <React.Fragment key={ `task-table-column-${ groupTitle }` }>
            <TableRow className={ twMerge(
                `table-row border-[0.125rem] border-primary-900 bg-sextary-800 hover:bg-sextary-800 transition-all duration-200 ease-in-out`,
                // `grid grid-cols-1 bg-muted p-0 text-xs`,
            ) }
            >
                <TableCell colSpan={ visibleColumns?.length + 1 }
                    className={ `table-cell bg-sextary-200 hover:bg-sextary-800 transition-all duration-200 ease-in-out` }
                >
                    { caseCamelToSentence( groupTitle ) }
                </TableCell>
            </TableRow>

            { sortTasks( groupTasks, sort )
                .map( ( task ) => (
                    <TodoDataTableRow
                        id={ task?._id }
                        key={ task?._id }
                        index={ task?.index }
                        task={ task }
                        tasks={ filteredTasks }
                        onUpdateTask={ onUpdateTask }
                        deleteTask={ deleteTask }
                        // onChangeTask={ onChangeTask }
                        onDeleteTask={ deleteTask }
                        onCompleteTask={ handleCompleteTask }
                        onClickTask={ handleOpenTaskNotes }
                        // onMoveTask={ handleMoveTask }
                        groupId={ groupTitle }
                        visibleColumns={ visibleColumns }
                        allColumns={ allColumns }
                        columnConfig={ columnConfig }
                    />
                ) ) }

            { buildTaskCreateNewRowButton( index ) }
        </React.Fragment>
    );
}; */




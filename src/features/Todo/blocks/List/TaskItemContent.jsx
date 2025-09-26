import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useTask from '@/lib/hooks/useTask';

import * as utils from 'akashatools';
// import './Task.css';
import { ChevronDown, ChevronRight, DeleteIcon, Edit, Menu, Save, Trash, X } from 'lucide-react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from '@/components/Calendar/DatePicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDateTime } from '@/lib/utilities/time';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ScrollAreaScrollbar, ScrollAreaViewport } from '@radix-ui/react-scroll-area';
import { Label } from '@/components/ui/label';
import { DropTree } from '@/components/DropTree/DropTree';
import DropTable from '@/components/Droplist/droptable';
import { RECURRENCE_DEFAULT_INTERVALS, TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from '@/lib/config/config';
import { StatusSelect, StatusDot } from '@/features/Todo/components/Fields/StatusSelect';
import { caseCamelToSentence } from '@/lib/utilities/string';
import { TodoDialog } from '../Dialog/task-dialog';

const TaskItemContent = ( {
    index = 0,
    task = {}, setTask = ( t ) => { console.log( "TaskItemContent :: Default setTask func :: t = ", t ); },
    tasks = [], setTasks = ( ts ) => { console.log( "TaskItemContent :: Default setTasks func :: ts = ", ts ); },
    updateTask = ( t ) => { console.log( "TaskItemContent :: Default updateTask func :: t = ", t ); },
    deleteTask = ( t ) => { console.log( "TaskItemContent :: Default deleteTask func :: t = ", t ); },
    moveTask, // Handler for drag and drop events.
    isDragging = false,
    reorderTasks,
    handleDragHover,
    handleDragEnd,
    layout,
    minified = false,
    compact = false,
    options,
    children,
    ...props
}, ref ) => {

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
        // handleChange,
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleSubmitRouting,

        // GETTERS / SETTERS
        taskList, setTaskList,
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

    const [ isExpanded, setIsExpanded ] = useState( false ); // To toggle detailed view
    const [ taskLocalData, setTaskLocalData ] = useState( {} ); // To hold the updated fields

    useEffect( () => {
        // Initialize taskLocalData on component mount.
        setTaskLocalData( task );
    }, [] );

    useEffect( () => {
        // Reflect any changes in the provided task prop.
        setTaskLocalData( task );
    }, [ task, taskData ] );

    const handleChange =
        useCallback(
            async ( field, value ) => {
                // updateTask( task._id, { [ field ]: value } );
                // updateTask( { ...task, [ field ]: value } );
                let updatedTask = { ...task, [ field ]: value };
                console.log( "TaskItemContent :: handleFieldChange :: field, value, updatedTask = ", field, value, updatedTask );
                setTaskLocalData( updatedTask );
                updateTask( updatedTask );
                let result = await handleUpdateTask( updatedTask );
            }
            , [ task ] );

    /* useEffect( () => {
        console.log( "TaskItemContent :: props = ", props, " :: ", "Index changed! index = ", index );
    }, [ index ] ); */

    // const toggleTaskCompletion = useTasksStore( ( state ) => state.toggleTaskCompletion );
    // const deleteTask = useTasksStore( ( state ) => state.deleteTask );
    // const updateTask = useTasksStore( ( state ) => state.updateTask );

    const itemStyle = {
        border: `1px ${ isDragging ? 'dashed' : 'none' } gray`,
        padding: '0.125rem 0.25rem',
        // marginBottom: '.5rem',
        // backgroundColor: 'white',
        opacity: `${ isDragging ? 0 : 1 } !important`,
        backgroundColor: `${ isDragging ? 'transparent' : 'bg-sextary-400' } !important`,
        width: '100%',
    };

    const handleStyle = {
        backgroundColor: 'green',
        width: '1rem',
        height: '1rem',
        display: 'inline-block',
        marginRight: '0.75rem',
        cursor: 'move',
    };

    // Join the 2 refs together into one (both draggable and can be dropped on)

    const buildTaskItem =
        // useCallback(
        ( t ) => {
            // console.log( 'Task.List.Item :: buildTask rendering :: ', 't = ', t );

            // TODO :: Replace this with checking against an instanceOf the database schema.
            if (
                t &&
                utils.ao.hasAll( t, [
                    '_id',
                    'timestampDue',
                    'completeness',
                    'status',
                    'title',
                    'completed',
                    'status',
                    'priority',
                    'difficulty',
                    'workspaceId',
                    'index',
                ] )
            ) {
                return (
                    // useMemo( () =>
                    <div className={ `task-item-content-container w-full max-w-full` }
                        style={ { ...itemStyle, } }>
                        <div
                            className={ `task-item-content w-full max-w-full h-full cursor-move` }
                            id={ `task-item-${ index }-${ t?._id }` }
                            key={ `task-item-${ index }-${ t?._id }` }
                        >
                            <div className={ `rounded-[${ 0.5 }rem] shadow-md hover:shadow-2xl transition-shadow justify-center items-center bg-sextary-900/60 flex flex-col w-full p-0 m-0 gap-1 h-full` }
                                style={ {
                                    ...itemStyle,
                                    opacity: `${ isDragging ? 0 : 1 } !important`,
                                } }
                            >
                                <div className={ `items-center gap-2 w-full h-auto max-h-12 inline-flex` }>
                                    <Button
                                        className={ `m-0 size-6 aspect-square` }
                                        variant='ghost'
                                        size='icon'
                                        onClick={ () => setIsExpanded( !isExpanded ) }>
                                        <ChevronRight className={ `transition-all duration-300 ease-in-out ${ isExpanded ? 'rotate-90' : 'rotate-0' }` } />
                                    </Button>

                                    { minified === false && (
                                        <div className={ `p-0 m-0 size-4 self-center h-full w-auto cursor-move` }>
                                            <Menu className='text-gray-400' />
                                        </div>
                                    ) }

                                    <Checkbox
                                        className={ `p-0 m-0 size-4` }
                                        defaultChecked={ t?.completed }
                                        onCheckedChange={ ( checked ) =>
                                            handleChange( 'completed', checked )
                                        }
                                    />

                                    <div className={ `p-0 m-0 !text-sm` }>
                                        <div
                                            key={ `task-index` }
                                            name={ 'task-index' }
                                            className={ `w-auto h-full border rounded-lg py-2 px-1` }
                                        >
                                            { t?.index }
                                        </div>
                                    </div>

                                    <Input
                                        className={ `m-0 border-none h-8` }
                                        defaultValue={ t?.title }
                                        onChange={ ( e ) =>
                                            handleChange( 'title', e.target.value )
                                        }
                                    />

                                    { minified === false && (
                                        <>
                                            <Slider
                                                className={ `flex flex-row !w-4/6 !h-2` }
                                                placeholder='Completeness %'
                                                // className={ `w-4/6 h-${ 10 }` }
                                                id={ `task-list-item-${ t?.completeness }` }
                                                key={ `task-list-item-${ t?.completeness }` }
                                                max={ 100 }
                                                min={ 0 }
                                                step={ 1 }
                                                defaultValue={ [ t?.completeness ] }
                                                onValueChange={ ( [ newValue ] ) => handleChange( 'completeness', Number( newValue ) ) }
                                            />


                                            <div className={ `items-center justify-center w-full gap-2 flex-1 h-auto min-h-10` }>
                                                <StatusSelect
                                                    placeholder={ 'Priority' }
                                                    fieldName={ `priority` }
                                                    options={ TODO_PRIORITY_OPTIONS }
                                                    selected={ t?.priority ?? 'none' }
                                                    onSelect={ ( value ) => ( handleChange( 'priority', value ) ) }
                                                />

                                                <StatusSelect
                                                    placeholder={ 'Difficulty' }
                                                    fieldName={ `difficulty` }
                                                    options={ TODO_DIFFICULTY_OPTIONS }
                                                    selected={ t?.difficulty ?? 'none' }
                                                    onSelect={ ( value ) => ( handleChange( 'difficulty', value ) ) }
                                                />

                                                <StatusSelect
                                                    placeholder={ 'Status' }
                                                    fieldName={ `status` }
                                                    options={ TODO_STATUS_OPTIONS }
                                                    selected={ t?.status ?? 'none' }
                                                    onSelect={ ( value ) => ( handleChange( 'status', value ) ) }
                                                />
                                            </div>

                                            <DatePicker
                                                placeholder={ "Due Date" }
                                                mode={ `single` }
                                                className={ `p-0 w-full` }
                                                usePopover={ true }
                                                useSelect={ true }
                                                selectedDate={ formatDateTime( new Date( t?.timestampDue ) ) }
                                                setSelectedDate={ ( date ) => handleChange( 'timestampDue', formatDateTime( date ) ) } showOutsideDays={ true }
                                            />
                                        </>
                                    ) }

                                </div>
                                {
                                    // useMemo( () =>
                                    isExpanded && (
                                        <div className={ `justify-center items-center w-full` }>

                                            <div className={ `flex-col flex-1 gap-2 items-stretch justify-center !w-full max-w-full` }>
                                                <div className={ `items-center justify-center !flex-wrap max-w-full w-full gap-2 flex-1 h-auto` }>
                                                    <StatusSelect
                                                        className={ `p-0 w-full` }
                                                        placeholder={ 'Priority' }
                                                        fieldName={ `priority` }
                                                        options={ TODO_PRIORITY_OPTIONS }
                                                        selected={ t?.priority ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( 'priority', value ) ) }
                                                    />

                                                    <StatusSelect
                                                        className={ `p-0 w-full` }
                                                        placeholder={ 'Difficulty' }
                                                        fieldName={ `difficulty` }
                                                        options={ TODO_DIFFICULTY_OPTIONS }
                                                        selected={ t?.difficulty ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( 'difficulty', value ) ) }
                                                    />

                                                    <StatusSelect
                                                        className={ `p-0 w-full` }
                                                        placeholder={ 'Status' }
                                                        fieldName={ `status` }
                                                        options={ TODO_STATUS_OPTIONS }
                                                        selected={ t?.status ?? 'none' }
                                                        onSelect={ ( value ) => ( handleChange( 'status', value ) ) }
                                                    />
                                                </div>

                                                <div className={ `items-center justify-center !flex-wrap max-w-full w-full gap-2 flex-1 h-auto` }>
                                                    <DatePicker
                                                        placeholder={ "Due Date" }
                                                        mode={ `single` }
                                                        className={ `p-0 w-full` }
                                                        usePopover={ true }
                                                        useSelect={ true }
                                                        selectedDate={ new Date( t?.timestampDue ) }
                                                        setSelectedDate={ ( date ) => handleChange( 'timestampDue', formatDateTime( new Date( date ) ) ) }
                                                        showOutsideDays={ true }
                                                    />

                                                    <DatePicker
                                                        placeholder={ "Estimated Date" }
                                                        mode={ `single` }
                                                        className={ `p-0 w-full` }
                                                        usePopover={ true }
                                                        useSelect={ true }
                                                        selectedDate={ new Date( t?.timestampEstimated ) }
                                                        setSelectedDate={ ( date ) => handleChange( 'timestampEstimated', formatDateTime( new Date( date ) ) ) }
                                                        showOutsideDays={ true }
                                                    />

                                                    <DatePicker
                                                        placeholder={ "Started Date" }
                                                        mode={ `single` }
                                                        className={ `p-0 w-full` }
                                                        usePopover={ true }
                                                        useSelect={ true }
                                                        selectedDate={ new Date( t?.timestampStarted ) }
                                                        setSelectedDate={ ( date ) => handleChange( 'timestampStarted', formatDateTime( new Date( date ) ) ) }
                                                        showOutsideDays={ true }
                                                    />

                                                    <DatePicker
                                                        placeholder={ "Completed Date" }
                                                        mode={ `single` }
                                                        className={ `p-0 w-full` }
                                                        usePopover={ true }
                                                        useSelect={ true }
                                                        selectedDate={ new Date( t?.timestampCompleted ) }
                                                        setSelectedDate={ ( date ) => handleChange( 'timestampCompleted', formatDateTime( new Date( date ) ) ) }
                                                        showOutsideDays={ true }
                                                    />
                                                </div>
                                            </div>

                                            <Textarea
                                                defaultValue={ t?.description }
                                                onChange={ ( e ) =>
                                                    handleChange(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                className={ `p-2` }
                                                placeholder='Description'
                                            />

                                            <div className={ `border-t flex flex-col p-2 m-0 gap-2 w-full ` }>
                                                <Slider
                                                    className={ `flex flex-row w-4/6 h-${ 10 }` }
                                                    placeholder='Completeness %'
                                                    // className={ `w-4/6 h-${ 10 }` }
                                                    id={ `task-list-item-${ t?.completeness }` }
                                                    key={ `task-list-item-${ t?.completeness }` }
                                                    max={ 100 }
                                                    min={ 0 }
                                                    step={ 1 }
                                                    defaultValue={ [ t?.completeness ] }
                                                    onValueChange={ ( [ newValue ] ) => handleChange( 'completeness', Number( newValue ) ) }
                                                />

                                                <div className={ `flex items-center` }>
                                                    <span className={ `p-0 w-full` }>Recurring:</span>
                                                    <Switch
                                                        defaultChecked={ t?.isRecurring }
                                                        onCheckedChange={ ( checked ) =>
                                                            handleChange(
                                                                'isRecurring',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                { t?.isRecurring && (
                                                    <Select
                                                        defaultValue={ t?.recurrenceRules }
                                                        onValueChange={ ( value ) =>
                                                            handleChange(
                                                                'recurrenceRules',
                                                                value,
                                                            )
                                                        }>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Recurrence' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            { RECURRENCE_DEFAULT_INTERVALS.map( ( rule ) => (
                                                                <SelectItem
                                                                    key={ rule }
                                                                    value={ rule }>
                                                                    { rule }
                                                                </SelectItem>
                                                            ) ) }
                                                        </SelectContent>
                                                    </Select>
                                                ) }

                                                <Textarea
                                                    className={ `p-2 w-full flex items-center` }
                                                    defaultValue={ t?.data }
                                                    onChange={ ( e ) =>
                                                        handleChange(
                                                            'data',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder='Additional Data'
                                                />

                                                { utils.val.isValidArray( t?.notes, true ) && (
                                                    <div className={ `p-0 w-full flex items-center` }>
                                                        <p className={ `p-0 w-full flex items-center` }>Notes:</p>
                                                        { t?.notes.map( ( note, index ) => (
                                                            <Badge
                                                                key={ index }
                                                                variant='secondary'
                                                                className={ `p-0 w-full` }>
                                                                { note }
                                                            </Badge>
                                                        ) ) }
                                                    </div>
                                                ) }

                                                { utils.val.isValidArray( t?.categories, true ) && (
                                                    <div className={ `p-0 w-full flex items-center` }>
                                                        <p className={ `p-0 w-full flex items-center` }>Categories:</p>
                                                        { t?.categories.map( ( category, index ) => ( <Badge key={ index } variant='outline' className={ `p-0 w-full` }>{ category }</Badge> ) ) }
                                                    </div>
                                                ) }

                                                { utils.val.isValidArray( t?.prerequisites, true ) && (
                                                    <div className={ `p-0 w-full flex items-center` }>
                                                        <p className={ `p-0 w-full flex items-center` }>Prerequisites:</p>
                                                        { t?.prerequisites.map(
                                                            ( prereq, index ) => (
                                                                <Badge
                                                                    key={ index }
                                                                    variant='outline'
                                                                    className={ `p-0 w-full` }>
                                                                    { prereq }
                                                                </Badge>
                                                            ),
                                                        ) }
                                                    </div>
                                                ) }

                                                { utils.val.isValidArray( t?.subtaskIds, true ) && (
                                                    <div className={ `p-0 w-full flex items-center` }>
                                                        <p className={ `p-0 w-full flex items-center` }>{ `Sub-Tasks:` }</p>
                                                        { t?.subtaskIds.map(
                                                            ( task, i ) => (
                                                                <Badge
                                                                    key={ `task-item-setting-${ i }-${ task?.toString() }` }
                                                                    variant='outline'
                                                                    className={ `p-0 w-full flex items-center` }
                                                                >
                                                                    { task }
                                                                </Badge>
                                                            ),
                                                        ) }
                                                    </div>
                                                ) }

                                                { t?.settings && utils.val.isDefined( t?.settings ) && (
                                                    <div className={ `p-0 w-full flex flex-row items-stretch justify-start self-center` }>
                                                        <p className={ `p-0 w-full flex items-start py-2` }>Settings:</p>
                                                        <DropTable data={ t?.settings } className={ `` } />
                                                    </div>
                                                ) }

                                                {/* Replace this with an copy of the reminders form. */ }
                                                { t?.reminder && (
                                                    <div className={ `p-0 w-full flex items-center` }>
                                                        <span className={ `p-0 w-full` }>Reminder:</span>
                                                        <Switch
                                                            defaultChecked={ t?.reminder }
                                                            onCheckedChange={ ( checked ) =>
                                                                handleChange(
                                                                    'reminder',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                    </div> ) }

                                                <div className={ `p-0 w-full flex items-center` }>
                                                    <span className={ `p-0 w-full` }>In Trash:</span>
                                                    <Switch
                                                        className={ `p-0` }
                                                        defaultChecked={ t?.inTrash }
                                                        onCheckedChange={ ( checked ) =>
                                                            handleChange(
                                                                'inTrash',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>

                                            </div>

                                        </div>
                                    )
                                    // , [ t, expanded ]
                                    // )
                                }
                            </div>
                        </div>
                    </div>
                    // , [ t, expanded ]
                    // )
                );
            } else {
                return <></>;
            }
        };
    // , [ task, index, isExpanded ] );

    // const renderTaskItem = useMemo( () => buildTaskItem( task ), [ task ] );
    // RENDERING // 
    return (
        <div className={ `task-item-container p-0 m-0 !h-auto max-h-full w-max min-w-full max-w-full ` }>
            {/* { task && renderTaskItem } */ }
            { taskLocalData && buildTaskItem( taskLocalData ) }

        </div>
    );
};

export default TaskItemContent;
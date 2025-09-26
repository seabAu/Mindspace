import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import useTask from '@/lib/hooks/useTask';

import * as utils from 'akashatools';
// import './Task.css';
import { ChevronDown, ChevronRight, DeleteIcon, Edit, Menu, Save, Trash, X } from 'lucide-react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import DatePicker, { DateRangePicker } from '@/components/Calendar/DatePicker';
// import DatePicker from "./DatePicker";
import { formatDateTime } from '@/lib/utilities/time';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimestampDDMMYYYY } from "akashatools/lib/Time";
import { date } from "zod";
import { TODO_DIFFICULTY_OPTIONS, TODO_PRIORITY_OPTIONS, TODO_STATUS_OPTIONS } from "@/lib/config/config";
import { StatusSelect } from '../../components/Fields/StatusSelect';

const TaskListItem = ( props ) => {
    // { task, setTasks, updateTask, isKanban = false, columnId, moveTask }
    const {
        index = 0,
        tasks = [],
        setTasks,
        task = {},
        setTask,
        updateTask,
        isKanban = false,
        columnId,

        reorderTasks,
        reorderOnHover,
        reorderOnDrop,
        layout,
        options,
        children,
        moveTask, // Handler for drag and drop events.
    } = props;

    // console.log( 'Task.List.Item :: rendering :: ', 'props = ', props );

    const {
        // VARIABLES
        // HANDLER FUNCTIONS
        handleFetchTasks,
        handleClone,
        handleDelete,
        handleCreateSubmit,
        handleCreateStart,
        handleEditStart,
        handleCancel,
        handleToggleComplete,
        handleEditSubmit,
        handleChange: handleChangeTask,
    } = useTask();

    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ currentTaskData, setCurrentTaskData ] = useState( {} ); // To hold the updated fields
    const ref = useRef( null );

    useEffect( () => {
        // Reflect any changes in the provided task prop.
        setCurrentTaskData( task );
    }, [ task ] );

    const [ { opacity, isDragging }, drag, preview ] = useDrag( {
        type: "TASK",
        item: { id: task?._id, index: task?.index, columnId },
        collect: ( monitor ) => ( {
            opacity: monitor.isDragging() ? 0 : 1,
            isDragging: monitor.isDragging(),
        } ),
    } );

    const [ { isOver, isOverCurrent }, drop ] = useDrop( {
        accept: "TASK",
        hover ( item, monitor ) {
            if ( !ref.current ) {
                return;
            }
            const draggedId = item?.id;
            const hoveredId = task?._id;

            if ( draggedId === hoveredId ) {
                return;
            }
            if ( item?.index !== index ) {
                // const moveTask = ( fromIndex, toIndex, commit = false )
                moveTask( item?.index, index, false );
                item.index = index;
            };

            moveTask( draggedId, item?.columnId, columnId );
            item.columnId = columnId;
        },
    } );

    // Join the 2 refs together into one (both draggable and can be dropped on)
    let dragDropRef = drag( drop( ref ) );

    const handleChange = ( field, value ) => {
        const updatedTask = { ...task, [ field ]: value };
        // updateTask( task?._id, { [ field ]: value } );
        updateTask( updatedTask );
        setTasks( ( prevTasks ) => prevTasks.map( ( t ) => ( t._id === task?._id ? updatedTask : t ) ) );
    };

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

    const gridStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridAutoRows: `2rem`,
        gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
    };

    const gridItemRowStyles = {
        display: `grid`,
        gridGap: `0.25rem`,
        gridTemplateColumns: `span 1 / span 1`,
        // gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
    };

    const buildTaskItem =
        // useCallback(
        ( t ) => {
            // console.log( 'Task.List.Item :: buildTask rendering :: ', 't = ', t );

            // TODO :: Replace this with checking against an instanceOf the database schema.
            if (
                t &&
                utils.ao.hasAll( t, [
                    'dueDate',
                    'completeness',
                    'status',
                    'title',
                    'description',
                    'completed',
                    'reminder',
                    'isRecurring',
                    'workspaceId',
                    'index',
                ] )
            ) {
                let {
                    index, // utils.rand.rand( 0, 1e6 )
                    _id,
                    __v,
                    workspaceId,
                    categories,
                    data,
                    difficulty,
                    settings,
                    isRecurring,
                    reminder,
                    completed,
                    inTrash,
                    title,
                    category,
                    description,
                    notes,
                    priority,
                    status,
                    completeness,
                    prerequisites,
                    timestampDue,
                    timestampEstimated,
                    timestampCreated,
                    timestampUpdated,
                    dueDate,
                    createdDate,
                    updatedDate,
                } = t;

                return (
                    // useMemo( () =>
                    <div
                        ref={ preview }
                        className={ `task-item-content-container w-full max-w-full` }
                        style={ {
                            ...itemStyle,
                        } }
                    >
                        <div
                            className={ `task-item-content w-full max-w-full h-full` }
                            id={ `task-item-${ index }-${ _id }` }
                            key={ `task-item-${ index }-${ _id }` }
                            // ref={ ( node ) => drag( drop( node ) ) }
                            ref={ dragDropRef }
                        >
                            <div
                                // ref={ provided.innerRef }
                                // { ...provided.draggableProps }
                                className={ `rounded-xl shadow-xl hover:shadow-2xl transition-shadow justify-center items-center bg-sextary-400 flex flex-col w-full p-0 m-0 gap-1 h-full` }
                                style={ {
                                    ...itemStyle,
                                    opacity: `${ isDragging ? 0 : 1 } !important`,
                                } }
                            >
                                <div className=' items-center p-2 gap-2 w-full h-16 inline-flex'>
                                    <div
                                        // { ...provided.dragHandleProps }
                                        className={ `p-0 m-0 cursor-move` }
                                    >
                                        <Menu className='text-gray-400' />
                                    </div>
                                    <Checkbox
                                        defaultChecked={ t?.completed }
                                        onCheckedChange={ ( checked ) =>
                                            handleChange( 'completed', checked )
                                        }
                                        className={ `p-0 m-0` }
                                    />
                                    <Input
                                        className={ `p-1 m-0` }
                                        defaultValue={ t?.title }
                                        onChange={ ( e ) =>
                                            handleChange( 'title', e.target.value )
                                        }
                                    />
                                    <Select
                                        className={ `p-0 m-0 w-full` }
                                        defaultValue={ t?.priority }
                                        onValueChange={ ( value ) =>
                                            handleChange( 'priority', value )
                                        }>
                                        <SelectTrigger className={ `w-auto h-auto` }>
                                            <SelectValue placeholder='Priority' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            { TODO_PRIORITY_OPTIONS.map( ( priority ) => (
                                                <SelectItem
                                                    key={ priority }
                                                    value={ priority }>
                                                    { priority }
                                                </SelectItem>
                                            ) ) }
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        className={ `p-0 w-full` }
                                        defaultValue={ t?.status }
                                        onValueChange={ ( value ) =>
                                            handleChange( 'status', value )
                                        }>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            { TODO_STATUS_OPTIONS.map( ( status ) => (
                                                <SelectItem
                                                    key={ status }
                                                    value={ status }>
                                                    { status }
                                                </SelectItem>
                                            ) ) }
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        className={ `p-0 w-full` }
                                        defaultValue={ t?.difficulty }
                                        onValueChange={ ( value ) =>
                                            handleChange(
                                                'difficulty',
                                                value,
                                            )
                                        }>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Difficulty' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            { TODO_DIFFICULTY_OPTIONS.map( ( difficulty ) => (
                                                <SelectItem
                                                    key={ difficulty }
                                                    value={ difficulty }>
                                                    { difficulty }
                                                </SelectItem>
                                            ) ) }
                                        </SelectContent>
                                    </Select>

                                    <DatePicker
                                        placeholder={ "Due Date" }
                                        mode={ `single` }
                                        className={ `p-0 w-full` }
                                        usePopover={ true }
                                        useSelect={ true }
                                        selectedDate={ formatDateTime( t?.dueDate ) }
                                        setSelectedDate={ ( date ) =>
                                            handleChange(
                                                'dueDate',
                                                // date.toISOString(),
                                                formatDateTime( date )
                                            )
                                        }
                                        showOutsideDays={ true }
                                        footer={ <></> }
                                    />
                                    <Button
                                        className={ `p-0 m-0` }
                                        variant='ghost'
                                        size='icon'
                                        onClick={ () => setIsExpanded( !isExpanded ) }>
                                        { isExpanded ? (
                                            <ChevronDown />
                                        ) : (
                                            <ChevronRight />
                                        ) }
                                    </Button>
                                </div>
                                {
                                    // useMemo( () =>
                                    isExpanded && (
                                        <div
                                            className={ `gap-2 justify-center items-center overflow-auto w-full p-4` }
                                        >
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

                                            <div
                                                className={ `border-t flex flex-col p-2 m-0 gap-2` }
                                            >
                                                <Slider
                                                    className={ `w-full flex flex-row w-4/6 h-${ 10 }` }
                                                    placeholder='Completeness %'
                                                    // className={ `w-4/6 h-${ 10 }` }
                                                    id={ `task-list-item-${ completeness }` }
                                                    key={ `task-list-item-${ completeness }` }
                                                    max={ 100 }
                                                    min={ 0 }
                                                    step={ 1 }
                                                    defaultValue={ [ t?.completeness ] }
                                                    onValueChange={ ( [ newValue ] ) => handleChange( 'completeness', Number( newValue ) ) }
                                                />

                                                <DateRangePicker
                                                    placeholder={ "Estimated Date" }
                                                    mode={ `single` }
                                                    className={ `p-0 w-full` }
                                                    usePopover={ true }
                                                    useSelect={ true }
                                                    selectedDate={ formatDateTime( t?.estimatedDate ) }
                                                    setSelectedDate={ ( date ) =>
                                                        handleChange(
                                                            'estimatedDate',
                                                            // date.toISOString(),
                                                            formatDateTime( date )
                                                        )
                                                    }
                                                    showOutsideDays={ true }
                                                    footer={ <></> }
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
                                                            { [
                                                                '1D',
                                                                '2D',
                                                                '4D',
                                                                '1W',
                                                                '1M',
                                                                '1Y',
                                                            ].map( ( rule ) => (
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
                                                    <div
                                                        className={ `p-0 w-full flex items-center` }
                                                    >
                                                        <p
                                                            className={ `p-0 w-full flex items-center` }
                                                        >
                                                            Notes:
                                                        </p>
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
                                                    <div
                                                        className={ `p-0 w-full flex items-center` }
                                                    >
                                                        <p
                                                            className={ `p-0 w-full flex items-center` }
                                                        >
                                                            Categories:
                                                        </p>
                                                        { t?.categories.map(
                                                            ( category, index ) => (
                                                                <Badge
                                                                    key={ index }
                                                                    variant='outline'
                                                                    className={ `p-0 w-full` }>
                                                                    { category }
                                                                </Badge>
                                                            ),
                                                        ) }
                                                    </div>
                                                ) }

                                                { utils.val.isValidArray( t?.prerequisites, true ) && (
                                                    <div
                                                        className={ `p-0 w-full flex items-center` }
                                                    >
                                                        <p
                                                            className={ `p-0 w-full flex items-center` }
                                                        >
                                                            Prerequisites:
                                                        </p>
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
                                                    <div
                                                        className={ `p-0 w-full flex items-center` }
                                                    >
                                                        <p
                                                            className={ `p-0 w-full flex items-center` }
                                                        >
                                                            { `Sub-Tasks:` }
                                                        </p>
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

                                                <div
                                                    className={ `p-0 w-full flex items-center` }
                                                >
                                                    <p
                                                        className={ `p-0 w-full flex items-center` }
                                                    >Settings:</p>
                                                    { t?.settings.map( ( setting, i ) => (
                                                        <Badge
                                                            key={ `task-item-setting-${ i }-${ setting?.toString() }` }
                                                            variant='outline'
                                                            className={ `p-0 w-full flex items-center` }>
                                                            { setting }
                                                        </Badge>
                                                    ) ) }
                                                </div>
                                                <div
                                                    className={ `p-0 w-full flex items-center` }
                                                >
                                                    <span
                                                        className={ `p-0 w-full` }
                                                    >Reminder:</span>
                                                    <Switch
                                                        defaultChecked={ t?.reminder }
                                                        onCheckedChange={ ( checked ) =>
                                                            handleChange(
                                                                'reminder',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={ `p-0 w-full flex items-center` }
                                                >
                                                    <span
                                                        className={ `p-0 w-full` }
                                                    >In Trash:</span>
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
                );
            }
            else { return <></>; }
        };
    // , [ isExpanded ] );

    const content = (
        <>
            {/* <div className="flex items-center space-x-2"> */ }
            <div className={ `w-full items-center justify-stretch flex flex-grow flex-nowrap gap-2` }>
                <Checkbox checked={ task?.completed } onCheckedChange={ ( checked ) => handleChange( "completed", checked ) } />

                <div className={ `w-full items-center justify-stretch grid grid-cols-12` } style={ gridStyles }>
                    <Input
                        value={ task?.title }
                        onChange={ ( e ) => handleChange( "title", e.target.value ) }
                        className={ `grid col-span-1 ${ task?.completed ? "line-through" : "" }` }
                    />
                    { !isKanban && (
                        <>
                            <div className={ `w-full items-center justify-stretch grid-cols-1` }>
                                <DatePicker
                                    className={ `w-full flex flex-grow !p-0 !gap-2` }
                                    date={
                                        new Date(
                                            task?.dueDate
                                                ? ( formatTimestampDDMMYYYY( task?.dueDate ) )
                                                : Date.now()
                                        )
                                    }
                                    onDateChange={ ( date ) => handleChange( "dueDate", date?.toISOString() ) }
                                />
                            </div>
                        </>
                    ) }
                    <Button className={ `` } variant="ghost" size="icon" onClick={ () => setIsExpanded( !isExpanded ) }>
                        { isExpanded ? <ChevronDown /> : <ChevronRight /> }
                    </Button>
                </div>
            </div>
            { isExpanded && (
                <div className={ `space-y-2 grid col-span-1` }>
                    <div className={ `items-center justify-center w-full gap-2 flex-1 h-auto min-h-10` }>
                        <StatusSelect
                            placeholder={ 'Priority' }
                            fieldName={ `priority` }
                            options={ TODO_PRIORITY_OPTIONS }
                            selected={ task?.priority ?? 'none' }
                            onSelect={ ( value ) => ( handleChange( 'priority', value ) ) }
                        />
                    </div>

                    <div className={ `items-center justify-center w-full gap-2 flex-1 h-auto min-h-10` }>
                        <StatusSelect
                            placeholder={ 'Difficulty' }
                            fieldName={ `difficulty` }
                            options={ TODO_DIFFICULTY_OPTIONS }
                            selected={ task?.difficulty ?? 'none' }
                            onSelect={ ( value ) => ( handleChange( 'difficulty', value ) ) }
                        />
                    </div>

                    <div className={ `items-center justify-center w-full gap-2 flex-1 h-auto min-h-10` }>
                        <StatusSelect
                            placeholder={ 'Status' }
                            fieldName={ `status` }
                            options={ TODO_STATUS_OPTIONS }
                            selected={ task?.status ?? 'none' }
                            onSelect={ ( value ) => ( handleChange( 'status', value ) ) }
                        />
                    </div>
                    {/* Add more expanded view details here */ }
                </div>
            ) }
        </>
    );

    if ( isKanban ) {
        return (
            <Card ref={ ref } className={ `mb-2 ${ isDragging ? "opacity-50" : "" }` }>
                <CardContent className="p-2">{ content }</CardContent>
            </Card>
        );
    }

    return (
        <div ref={ ref } className={ `task-item mb-2 p-2 border rounded ${ isDragging ? "opacity-50" : "" }` }>
            { task && buildTaskItem( task ) }
            {/* { content } */ }
        </div>
    );
};

export default TaskListItem


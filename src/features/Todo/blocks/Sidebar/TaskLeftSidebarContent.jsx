/* eslint-disable react/prop-types */
import React, { useContext, createContext, useEffect, useState, useId, useMemo } from 'react';
import {
    PlusSquare,
    MinusSquare,
    Copy,
} from "lucide-react";

// Utilities
import * as utils from 'akashatools';
import { HashRouter, Navigate, Route, Router, Routes, useNavigate, useParams } from "react-router-dom";
import useTask from '@/lib/hooks/useTask';

// Data stores
import useTasksStore from '@/store/task.store';
import useGlobalStore from '@/store/global.store';

import Nav from '@/components/Nav/Nav';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { Spinner } from '@/components/Loader/Spinner';
import { Badge } from '@/components/ui/badge';
import { MdKeyboardControlKey } from 'react-icons/md';
import { addDays } from 'date-fns';
import { formatDate } from '@/lib/utilities/time';
import TaskDialog from '../Dialog/TaskDialog';

const TaskLeftSidebarContent = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const {
        debug, setDebug,
        schemas, getSchema,
        data, setData, getData,
    } = useGlobalStore();

    const {
        GetLocal,
        SetLocal,
    } = useLocalStorage();

    const {
        selectedTask, setSelectedTask,
        tasksData, setTasksData, fetchTasks,
        loading: loadingTasks, setLoading: setLoadingTasks,
        error: errorTasks, setError: setErrorTasks,
    } = useTasksStore();

    const {
        // VARIABLES
        modalInitialData, setModalInitialData,
        DatePickerOptions: DATE_PICKER_OPTIONS,

        // HANDLER FUNCTIONS
        handleGetPinnedTasks,
        handleGetOverdueTasks,
        handleGetTodayTasks,
        handleGetTasksDueBy,
        handleSort,
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
        buildTaskDialog,
        handleChange,

        // GETTERS / SETTERS
        dialogSchema, setDialogSchema,
        taskList, setTaskList,
        dialogOpen, setDialogOpen,
        dialogType, setDialogType,
        dialogData, setDialogData,
        notesOpen, setNotesOpen,
        notesContent, setNotesContent,
        isDrawerOpen, setIsDrawerOpen,
        visibleColumns, setVisibleColumns,
        filters, setFilters,
    } = useTask();
    let refData = getData();

    const pinnedTasks = handleGetPinnedTasks( tasksData );
    const overdueTasks = handleGetOverdueTasks( tasksData );
    const todayDueTasks = handleGetTodayTasks( tasksData );
    const upcomingDueTasks = handleGetTasksDueBy( tasksData, addDays( new Date( Date.now() ), 28 ) );

    let tasksControls = [
        {
            enabled: true,
            index: 0,
            id: 'context-menu-item-task-update',
            key: 'context-menu-item-task-update',
            type: 'button',
            // shortcut: '⌘⇧U',
            name: "editTask",
            label: "Edit Task ",
            icon: <PlusSquare className="fa fa-2x control-button-icon icon" />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log( 'Task nav list :: context :: edit task :: item = ', item );
                handleEditStart( item, 'task' );
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 1,
            id: 'context-menu-item-task-clone',
            key: 'context-menu-item-task-clone',
            type: 'button',
            shortcut: ( <><MdKeyboardControlKey />{ `C` }</> ),
            name: "cloneTask",
            label: "Clone Task ",
            icon: <Copy className="fa fa-2x control-button-icon icon" />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log( 'Task nav list :: context :: clone task :: item = ', item );
                handleClone( item );
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
        {
            enabled: true,
            index: 2,
            id: 'context-menu-item-task-delete',
            key: 'context-menu-item-task-delete',
            type: 'button',
            // shortcut: '⌘⇧D',
            name: "deleteTask",
            label: "Delete Task",
            icon: <MinusSquare className="fa fa-2x control-button-icon icon" />,
            classes: `control-list-item`,
            onClick: ( item ) => {
                console.log( 'Task nav list :: context :: delete task :: item = ', item );
                if ( item && utils.val.isObject( item ) ) {
                    if ( item?._id ) {
                        handleDeleteTask( item );
                    }
                }
            },
            useTooltip: false,
            // tooltipInfo: ( item ) => { return `${ item?.title ?? 'err' } (${ item?._id ?? 'err' })`; },
        },
    ];

    return (
        <div className={ `w-full !overflow-auto !max-h-full h-auto block justify-start place-items-start` }>
            { ( utils.val.isValidArray( tasksData, true )
                ? ( <>
                    <Nav.List
                        label={ <>{ `Pinned Tasks` } <Badge variant={ 'primary' } className={ `!bg-transparent !text-primary-500` }>{ pinnedTasks?.length }</Badge></> }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ true }
                        items={ pinnedTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a?.index - b?.index ) }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Tasks sidebar dropdown list :: items = ", handleGetPinnedTasks( tasksData ), " :: ", "onClickItem triggered :: item = ", item );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        subtitleRender={ ( item ) => ( formatDate( item?.timestampDue ) ) }
                    />

                    <Nav.List
                        label={ <>{ `Tasks Due Today` } <Badge variant={ 'primary' } className={ `!bg-transparent !text-primary-500` }>{ todayDueTasks?.length }</Badge></> }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ todayDueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a?.index - b?.index ) }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Tasks sidebar dropdown list :: items = ", handleGetPinnedTasks( tasksData ), " :: ", "onClickItem triggered :: item = ", item );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={ <>{ `Upcoming Due Tasks` } <Badge variant={ 'primary' } className={ `!bg-transparent !text-primary-500` }>{ upcomingDueTasks?.length }</Badge></> }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ upcomingDueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a?.index - b?.index ) }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Tasks sidebar dropdown list :: items = ", handleGetPinnedTasks( tasksData ), " :: ", "onClickItem triggered :: item = ", item );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={ <>{ `Overdue Tasks` } <Badge variant={ 'primary' } className={ `!bg-transparent !text-primary-500` }>{ overdueTasks?.length }</Badge></> }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ overdueTasks }
                        maxShow={ 10 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a?.index - b?.index ) }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Tasks sidebar dropdown list :: items = ", handleGetPinnedTasks( tasksData ), " :: ", "onClickItem triggered :: item = ", item );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                    <Nav.List
                        label={ <>{ `All Tasks` } <Badge variant={ 'primary' } className={ `!bg-transparent !text-primary-500` }>{ tasksData?.length }</Badge></> }
                        useSearch={ true }
                        searchField={ 'title' }
                        collapsible={ true }
                        collapsibleDefaultOpen={ false }
                        items={ tasksData }
                        maxShow={ 15 }
                        useSort={ true }
                        sortField={ 'index' }
                        sortFunc={ ( a, b ) => ( a?.index - b?.index ) }
                        activeItem={ selectedTask }
                        className={ `gap-1 p-0 m-0 w-full h-full` }
                        itemClassname={ `p-0 h-6` }
                        onClickItem={ ( item ) => {
                            console.log( "Dashboard :: Tasks sidebar dropdown list :: items = ", tasksData, " :: ", "onClickItem triggered :: item = ", item );
                            handleEditStart( item, 'task' );
                        } }
                        controls={ tasksControls }
                        showSubtitle={ true }
                        showSubtitleKey={ 'timestampDue' }
                    />

                </> )
                : <Spinner
                    variant={ 'grid' }
                    size={ 'xl' }
                    color={ 'currentColor' }
                    overlay={ true }
                    className={ `` }
                />
            )
            }
            {/* </Content.Footer> */ }
            {/* { dialogType === 'add' && ( <TaskDialog
                data={ dialogData ?? {} }
                setData={ setDialogData }
                refData={ refData }
                dataSchema={ getSchema( 'task' ) }
                dialogOpen={ dialogType === 'add' || isCreating === true }
                setDialogOpen={ ( open ) => {
                    if ( open ) { setDialogType( 'add' ); }
                    else { setDialogType( 'none' ); handleCancel(); }
                } }
                handleSubmit={ ( data ) => { handleCreateSubmit( data ); } }
                handleChange={ handleChange }
                handleClose={ () => { handleCancel(); } }
                dialogType={ dialogType ?? 'add' }
                dataType={ 'task' }
                debug={ debug }
            /> ) }

            { dialogType === 'edit' && ( <TaskDialog
                data={ dialogData ?? selectedTask }
                setData={ setDialogData }
                refData={ refData }
                dataSchema={ getSchema( 'task' ) }
                dialogOpen={ dialogType === 'edit' || isEditing === true }
                setDialogOpen={ ( open ) => {
                    if ( open ) { setDialogType( 'edit' ); }
                    else { setDialogType( 'none' ); handleCancel(); }
                } }
                handleSubmit={ ( data ) => { handleEditSubmit( data ); } }
                handleChange={ handleChange }
                handleClose={ () => { handleCancel(); } }
                dialogType={ dialogType ?? 'edit' }
                dataType={ 'task' }
                debug={ debug }
            /> ) } */}

            { dialogType === 'add' && (
                <TaskDialog
                    data={ dialogData ?? {} }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogOpen }
                    setDialogOpen={ setDialogOpen }
                    handleSubmit={ ( data ) => { handleCreateSubmit( data ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ 'add' }
                    dataType={ 'task' }
                    debug={ debug }
                />
            ) }

            { dialogType === 'edit' &&& (
                <TaskDialog
                    data={ dialogData ?? selectedTask }
                    setData={ setDialogData }
                    refData={ refData }
                    dataSchema={ getSchema( 'task' ) }
                    dialogOpen={ dialogOpen }
                    setDialogOpen={ setDialogOpen }
                    handleSubmit={ ( data ) => { handleEditSubmit( data ); } }
                    handleChange={ handleChange }
                    handleClose={ () => { handleCancel(); } }
                    dialogType={ 'edit' }
                    dataType={ 'task' }
                    debug={ debug }
                />
            ) }
        </div>
    );
};

export default TaskLeftSidebarContent;

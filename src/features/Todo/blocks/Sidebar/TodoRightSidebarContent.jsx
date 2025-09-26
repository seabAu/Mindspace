import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as utils from 'akashatools';
import { useLocation, useNavigate } from 'react-router-dom';
import useGlobalStore from '@/store/global.store';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import useTasksStore from '@/store/task.store';
import useTask from '@/lib/hooks/useTask';
import { Spinner } from '@/components/Loader/Spinner';
import TaskList from '@/features/Todo/blocks/List/TaskList';
import { SIDEBAR_WIDTH_RIGHT } from '@/lib/config/constants';





export const TodoTodayRightSidebarContent = ( props ) => {

    const {
        settings,
        options,
        classNames,
    } = props;

    const { GetLocal, SetLocal } = useLocalStorage();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    let endpoint = path?.[ path.indexOf( 'task' ) + 1 ];

    const {
        debug, setDebug,
        data, setData, getData,
        schemas, getSchema,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    let allData = getData();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
    } = useTasksStore();
    const [ tasksLocalData, setTasksLocalData ] = useState(
        utils.val.isValidArray( tasksData, true )
            ? ( [ ...tasksData ] )
            : ( null )
    );

    const {
        // VARIABLES
        // taskData, setTaskData,
        // initialTaskData, setInitialTaskData,
        modalInitialData, setModalInitialData,
        DatePickerOptions: DATE_PICKER_OPTIONS,

        // HANDLER FUNCTIONS
        handleGetPinnedTasks,
        handleGetTodayTasks,
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
        handleBulkUpdateTasks,
        handleReorderTasks,
        handleBulkReorderTasks,
        handleReorderTaskList,
        handleSubmitRouting,

        // GETTERS / SETTERS
        dialogSchema, setDialogSchema,
        taskList, setTaskList,
        modalOpen, setModalOpen,
        modalType, setModalType,
        dataModel, setFormDataModel,
        confirmed, setConfirmed,
        isEditing, setIsEditing,
        isCreating, setIsCreating,
        modalData, setModalData,
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
        loading, setLoading,
        error, setError,
        loadingTasks, setLoadingTasks,
        errorTasks, setErrorTasks,
        // fetchTasks,
        // fetchTasksByDateRange,
        // fetchTasksByDueDate,
        // fetchRecurringTasks,
        // fetchTasksByFilter,
        // createTask,
        // fetchTask,
        // updateTask,
        // deleteTask,
    } = useTask();

    const getDummyTasksList = () => {
        return (
            <div className="relative h-full data-list-container data-list-expandable">
                <ul className="data-list">
                    <li className="data-list-item ql-indent-1">Optimization</li>
                    <div className="data-list data-list-item ">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-1">Try to reduce the number of re-renders by using useMemo and useCallback appropriately across the app, and reducing the amount of interlinked state</li>
                            <li className="data-list-item ql-indent-1">Zustand </li>
                            <div className="data-list-container data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-2">Split zustand stores up into the slices pattern</li>
                                    <li className="data-list-item ql-indent-2">Add in the state management reducer functions to the stores (CRUD + any others)</li>
                                    <li className="data-list-item ql-indent-1">Consider redesigning the files and folders system for Notes to use folders as generalized containers of files, and files as generic content storage and editing ( notes and piles, boxes and records, etc)</li>
                                </ul>
                            </div>
                            <li className="data-list-item ql-indent-3">Other file types:</li>
                            <div className="data-list-container data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-2">Mixed</li>
                                    <li className="data-list-item ql-indent-2">Text / Markdown</li>
                                    <li className="data-list-item ql-indent-2">Data / Chart or table or csv</li>
                                </ul>
                            </div>
                        </ul>
                    </div>
                    <div className="data-list">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-1">Figure out a way to have the three main data types - notes, tasks, plans - be interrelated</li>
                            <li className="data-list-item ql-indent-1">So you can use a note in a todo task, or list todos for a given day (via planner) in a note file, or aggregate a day's events and reminders inside a todo list alongside the tasks for the day and any postponed past their due date or any past set deadlines</li>
                        </ul>
                    </div>
                    <div className="data-list">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-1">**This app's usefulness will be related to how accessible its components are from a unified screen, not just tabs on the sidebar.**</li>
                            <li className="data-list-item ql-indent-1">**Generalize the different page and subpage and subsubpage views into their own components and make them versatile to accept varied datatypes.**</li>
                        </ul>
                    </div>
                    <div className="data-list">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-1">Tabs</li>
                            <li className="data-list-item ql-indent-1">Replace the setViewType based subpage rendering (without routes) with a custom tabs component to reduce the amount of duplicated code used</li>
                            <div className="data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-1">Responsive</li>
                                    <div className="data-list">
                                        <ul className="data-list-value">
                                            <li className="data-list-item ql-indent-1">Implement the Responsive component wrapper for all cases using the dropdown switch for under/over a given width/height. </li>
                                        </ul>
                                    </div>
                                </ul>
                            </div>
                        </ul>
                    </div>
                    <li className="data-list-item ql-indent-1">Sidebar</li>
                    <div className="data-list">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-1">Left sidebar </li>
                            <div className="data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-2">Add a third 'icons' state for the main left sidebar; </li>
                                    <li className="data-list-item ql-indent-2">Larger icons, no text</li>
                                    <li className="data-list-item ql-indent-2">Add a second toggle button for this one specifically, and a keyboard shortcut (ctrl+shift+B)</li>
                                </ul>
                            </div>
                            <li className="data-list-item ql-indent-1">Right sidebar</li>
                            <div className="data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-1">Figure out a way to have the three main data types - notes, tasks, plans - be interrelated</li>
                                </ul>
                            </div>
                            <div className="data-list">
                                <ul className="data-list-value">
                                    <li className="data-list-item ql-indent-2">Put a pinned notes / todo lists / events section into this sidebar.</li>
                                    <li className="data-list-item ql-indent-2">Put all calendars content into a tab or collapsible dropdown and add other tabs: notes, tasks, events, etc. </li>
                                    <li className="data-list-item ql-indent-2">Use this space broadly for at-a-glance information or anything that was pinned</li>
                                    <li className="data-list-item ql-indent-2">(OPTIONAL) Use drag/drop to rearrange as desired?</li>
                                </ul>
                            </div>
                        </ul>
                    </div>
                    <li className="data-list-item ql-indent-1">Todo</li>
                    <div className="data-list">
                        <ul className="data-list-value">
                            <li className="data-list-item ql-indent-2">Implement pinning</li>
                            <li className="data-list-item ql-indent-2">Implement task and subtask trees. Make use of the folders / files hierarchy code for this, could use it as an opportunity to modularize it.</li>
                        </ul>
                    </div>
                </ul>
            </div>
        );
    };

    return (
        <div className={ `w-full h-full max-w-full min-w-full max-h-full min-h-full flex flex-col justify-stretch items-stretch overflow-y-auto overflow-x-hidden` }
            style={ {
                maxWidth: `${ SIDEBAR_WIDTH_RIGHT }rem`
            } }
        >
            {/* { getDummyTasksList() } */ }
            { utils.val.isValidArray( tasksLocalData, true )
                ? (
                    <>
                        <TaskList
                            tasks={ handleGetTodayTasks( tasksLocalData ) }
                            setTasks={ setTasksLocalData }
                            updateTask={ handleEditStart }
                            createTask={ handleCreateStart }
                            // deleteTask={ handleDeleteStart }
                            deleteTask={ handleDeleteTask }
                            fetchTasks={ handleFetchTasks }
                            reorderTasks={ handleBulkReorderTasks }
                            groupBy={ 'status' }
                            minified={ true }
                            compact={ true }
                        />
                    </>
                )
                : ( <Spinner
                    variant={ 'grid' }
                    size={ 'xl' }
                    color={ 'currentColor' }
                    overlay={ true }
                    className={ `` }
                /> ) }
        </div>
    );
};

export const TodoRightSidebarContent = ( props ) => {

    const {
        settings,
        options,
        classNames,
    } = props;

    const { GetLocal, SetLocal } = useLocalStorage();
    const location = useLocation();
    const navigate = useNavigate();
    const { hash, pathname, search } = location;
    const path = pathname?.split( '/' );
    let endpoint = path?.[ path.indexOf( 'task' ) + 1 ];

    const {
        debug, setDebug,
        data, setData, getData,
        schemas, getSchema,
        requestFetchWorkspaces, setRequestFetchWorkspaces,
        getWorkspaces, workspacesData, setWorkspacesData,
        activeWorkspace, setActiveWorkspace,
        workspaceId, setWorkspaceId,
    } = useGlobalStore();
    let allData = getData();

    const {
        requestFetchTasks, setRequestFetchTasks,
        tasksData, setTasksData, fetchTasks,
        taskListData, setTaskListData,
        taskGoalsData, setTaskGoalsData,
        selectedTask, setSelectedTask,
    } = useTasksStore();
    const [ tasksLocalData, setTasksLocalData ] = useState(
        utils.val.isValidArray( tasksData, true )
            ? ( [ ...tasksData ] )
            : ( null )
    );

    const {
        // HANDLER FUNCTIONS
        handleGetPinnedTasks,
        handleGetTodayTasks,
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
        handleBulkReorderTasks,
    } = useTask();

    return (
        <div className={ `w-full h-full max-w-full min-w-full max-h-full min-h-full flex flex-col justify-stretch items-stretch overflow-y-auto overflow-x-hidden bg-background` }
            style={ {
                maxWidth: `${ SIDEBAR_WIDTH_RIGHT }rem`
            } }
        >
            {/* { getDummyTasksList() } */ }
            { utils.val.isValidArray( tasksLocalData, true )
                ? (
                    <>
                        <TaskList
                            tasks={ tasksLocalData }
                            setTasks={ setTasksLocalData }
                            updateTask={ handleEditStart }
                            createTask={ handleCreateStart }
                            // deleteTask={ handleDeleteStart }
                            deleteTask={ handleDeleteTask }
                            fetchTasks={ handleFetchTasks }
                            reorderTasks={ handleBulkReorderTasks }
                            groupBy={ 'status' }
                            minified={ true }
                            compact={ true }
                        />
                    </>
                )
                : ( <Spinner
                    variant={ 'grid' }
                    size={ 'xl' }
                    color={ 'currentColor' }
                    overlay={ true }
                    className={ `` }
                /> ) }
        </div>
    );
};





// const TodoRightSidebarContent = ( props ) => {

//     const {
//         settings,
//         options,
//         classNames,
//     } = props;

//     const { GetLocal, SetLocal } = useLocalStorage();
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { hash, pathname, search } = location;
//     const path = pathname?.split( '/' );
//     let endpoint = path?.[ path.indexOf( 'task' ) + 1 ];

//     const {
//         debug, setDebug,
//         data, setData, getData,
//         schemas, getSchema,
//         requestFetchWorkspaces, setRequestFetchWorkspaces,
//         getWorkspaces, workspacesData, setWorkspacesData,
//         activeWorkspace, setActiveWorkspace,
//         workspaceId, setWorkspaceId,
//     } = useGlobalStore();
//     let allData = getData();

//     const {
//         requestFetchTasks, setRequestFetchTasks,
//         tasksData, setTasksData, fetchTasks,
//         taskListData, setTaskListData,
//         taskGoalsData, setTaskGoalsData,
//         selectedTask, setSelectedTask,
//     } = useTasksStore();
//     const [ tasksLocalData, setTasksLocalData ] = useState(
//         utils.val.isValidArray( tasksData, true )
//             ? ( [ ...tasksData ] )
//             : ( null )
//     );

//     const {
//         // VARIABLES
//         // taskData, setTaskData,
//         // initialTaskData, setInitialTaskData,
//         modalInitialData, setModalInitialData,
//         DatePickerOptions: DATE_PICKER_OPTIONS,

//         // HANDLER FUNCTIONS
//         handleGetPinnedTasks,
//         handleGetTodayTasks,
//         handleSort,
//         handleOpenTaskNotes,
//         handleFetchTasks,
//         handleClone,
//         // handleDelete,
//         handleDeleteTask,
//         handleDeleteStart,
//         handleDeleteSubmit,
//         handleCreateTask,
//         handleCreateSubmit,
//         handleCreateStart,
//         handleUpdateTask,
//         handleEditStart,
//         handleEditSubmit,
//         handleCancel,
//         handleToggleComplete,
//         // handleEditChange,
//         buildTaskDialog,
//         handleChange,
//         handleBulkUpdateTasks,
//         handleReorderTasks,
//         handleBulkReorderTasks,
//         handleReorderTaskList,
//         handleSubmitRouting,

//         // GETTERS / SETTERS
//         dialogSchema, setDialogSchema,
//         taskList, setTaskList,
//         modalOpen, setModalOpen,
//         modalType, setModalType,
//         dataModel, setFormDataModel,
//         confirmed, setConfirmed,
//         isEditing, setIsEditing,
//         isCreating, setIsCreating,
//         modalData, setModalData,
//         notesOpen, setNotesOpen,
//         notesContent, setNotesContent,
//         isDrawerOpen, setIsDrawerOpen,
//         visibleColumns, setVisibleColumns,
//         sort, setSort,
//         filters, setFilters,

//         // SCHEMA
//         taskSchema, setTaskSchema,
//         taskListSchema, setTaskListSchema,
//         goalSchema, setGoalSchema,
//         // taskDataSchema,
//         handleGetSchemas,
//         getSchemaForDataType,
//         // tasks,
//         loading, setLoading,
//         error, setError,
//         loadingTasks, setLoadingTasks,
//         errorTasks, setErrorTasks,
//         // fetchTasks,
//         // fetchTasksByDateRange,
//         // fetchTasksByDueDate,
//         // fetchRecurringTasks,
//         // fetchTasksByFilter,
//         // createTask,
//         // fetchTask,
//         // updateTask,
//         // deleteTask,
//     } = useTask();

//     const getDummyTasksList = () => {
//         return (
//             <div className="relative h-full data-list-container data-list-expandable">
//                 <ul className="data-list">
//                     <li className="data-list-item ql-indent-1">Optimization</li>
//                     <div className="data-list data-list-item ">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-1">Try to reduce the number of re-renders by using useMemo and useCallback appropriately across the app, and reducing the amount of interlinked state</li>
//                             <li className="data-list-item ql-indent-1">Zustand </li>
//                             <div className="data-list-container data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-2">Split zustand stores up into the slices pattern</li>
//                                     <li className="data-list-item ql-indent-2">Add in the state management reducer functions to the stores (CRUD + any others)</li>
//                                     <li className="data-list-item ql-indent-1">Consider redesigning the files and folders system for Notes to use folders as generalized containers of files, and files as generic content storage and editing ( notes and piles, boxes and records, etc)</li>
//                                 </ul>
//                             </div>
//                             <li className="data-list-item ql-indent-3">Other file types:</li>
//                             <div className="data-list-container data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-2">Mixed</li>
//                                     <li className="data-list-item ql-indent-2">Text / Markdown</li>
//                                     <li className="data-list-item ql-indent-2">Data / Chart or table or csv</li>
//                                 </ul>
//                             </div>
//                         </ul>
//                     </div>
//                     <div className="data-list">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-1">Figure out a way to have the three main data types - notes, tasks, plans - be interrelated</li>
//                             <li className="data-list-item ql-indent-1">So you can use a note in a todo task, or list todos for a given day (via planner) in a note file, or aggregate a day's events and reminders inside a todo list alongside the tasks for the day and any postponed past their due date or any past set deadlines</li>
//                         </ul>
//                     </div>
//                     <div className="data-list">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-1">**This app's usefulness will be related to how accessible its components are from a unified screen, not just tabs on the sidebar.**</li>
//                             <li className="data-list-item ql-indent-1">**Generalize the different page and subpage and subsubpage views into their own components and make them versatile to accept varied datatypes.**</li>
//                         </ul>
//                     </div>
//                     <div className="data-list">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-1">Tabs</li>
//                             <li className="data-list-item ql-indent-1">Replace the setViewType based subpage rendering (without routes) with a custom tabs component to reduce the amount of duplicated code used</li>
//                             <div className="data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-1">Responsive</li>
//                                     <div className="data-list">
//                                         <ul className="data-list-value">
//                                             <li className="data-list-item ql-indent-1">Implement the Responsive component wrapper for all cases using the dropdown switch for under/over a given width/height. </li>
//                                         </ul>
//                                     </div>
//                                 </ul>
//                             </div>
//                         </ul>
//                     </div>
//                     <li className="data-list-item ql-indent-1">Sidebar</li>
//                     <div className="data-list">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-1">Left sidebar </li>
//                             <div className="data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-2">Add a third 'icons' state for the main left sidebar; </li>
//                                     <li className="data-list-item ql-indent-2">Larger icons, no text</li>
//                                     <li className="data-list-item ql-indent-2">Add a second toggle button for this one specifically, and a keyboard shortcut (ctrl+shift+B)</li>
//                                 </ul>
//                             </div>
//                             <li className="data-list-item ql-indent-1">Right sidebar</li>
//                             <div className="data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-1">Figure out a way to have the three main data types - notes, tasks, plans - be interrelated</li>
//                                 </ul>
//                             </div>
//                             <div className="data-list">
//                                 <ul className="data-list-value">
//                                     <li className="data-list-item ql-indent-2">Put a pinned notes / todo lists / events section into this sidebar.</li>
//                                     <li className="data-list-item ql-indent-2">Put all calendars content into a tab or collapsible dropdown and add other tabs: notes, tasks, events, etc. </li>
//                                     <li className="data-list-item ql-indent-2">Use this space broadly for at-a-glance information or anything that was pinned</li>
//                                     <li className="data-list-item ql-indent-2">(OPTIONAL) Use drag/drop to rearrange as desired?</li>
//                                 </ul>
//                             </div>
//                         </ul>
//                     </div>
//                     <li className="data-list-item ql-indent-1">Todo</li>
//                     <div className="data-list">
//                         <ul className="data-list-value">
//                             <li className="data-list-item ql-indent-2">Implement pinning</li>
//                             <li className="data-list-item ql-indent-2">Implement task and subtask trees. Make use of the folders / files hierarchy code for this, could use it as an opportunity to modularize it.</li>
//                         </ul>
//                     </div>
//                 </ul>
//             </div>
//         );
//     };

//     return (
//         <div className={ `w-full h-full max-w-full min-w-full max-h-full min-h-full flex flex-col justify-stretch items-stretch overflow-y-auto overflow-x-hidden` }
//             style={ {
//                 maxWidth: `${ SIDEBAR_WIDTH_RIGHT }rem`
//             } }
//         >
//             {/* { getDummyTasksList() } */ }
//             { utils.val.isValidArray( tasksLocalData, true )
//                 ? (
//                         <TaskList
//                             tasks={ handleGetTodayTasks( tasksLocalData ) }
//                             setTasks={ setTasksLocalData }
//                             updateTask={ handleEditStart }
//                             createTask={ handleCreateStart }
//                             deleteTask={ handleDeleteStart }
//                             fetchTasks={ handleFetchTasks }
//                             reorderTasks={ handleBulkReorderTasks }
//                             groupBy={ 'status' }
//                             minified={ true }
//                             compact={ true }
//                         />
//                 )
//                 : ( <Spinner
//                     variant={ 'grid' }
//                     size={ 'xl' }
//                     color={ 'currentColor' }
//                     overlay={ true }
//                     className={ `` }
//                 /> ) }
//         </div>
//     );
// };

// export default TodoRightSidebarContent;

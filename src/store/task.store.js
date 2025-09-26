import { useId } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import useGlobalStore from "@/store/global.store";
import { useUpdateQueueStore } from "@/store/update-queue-store";
import API from "@/lib/services/api";
import * as utils from "akashatools";

import { ZUSTAND_TASKS_STORE_STORAGE_NAME } from "@/lib/config/constants";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { stringAsColor } from "@/lib/utilities/color";
import { arrSafeTernary } from "@/lib/utilities/data";

// Helpers and Types
// Task priorities
export const PRIORITIES = {
    LOW: { id: "low", name: "Low", color: "#3498db" },
    MEDIUM: { id: "medium", name: "Medium", color: "#f39c12" },
    HIGH: { id: "high", name: "High", color: "#e74c3c" },
};

// Task difficulties
export const DIFFICULTIES = {
    EASY: { id: "easy", name: "Easy", color: "#2ecc71" },
    MODERATE: { id: "moderate", name: "Moderate", color: "#f39c12" },
    HARD: { id: "hard", name: "Hard", color: "#e74c3c" },
};

// Task statuses
export const STATUSES = {
    TODO: { id: "todo", name: "To Do", color: "#3498db" },
    IN_PROGRESS: { id: "in-progress", name: "In Progress", color: "#f39c12" },
    DONE: { id: "done", name: "Done", color: "#2ecc71" },
};

// Due date categories
export const DUE_CATEGORIES = {
    OVERDUE: {
        id: "overdue",
        name: "Overdue",
        color: "#e74c3c",
        filterFn: () => { },
    },
    TODAY: { id: "today", name: "Today", color: "#f39c12", filterFn: () => { } },
    THIS_WEEK: {
        id: "this-week",
        name: "This Week",
        color: "#3498db",
        filterFn: () => { },
    },
    LATER: { id: "later", name: "Later", color: "#2ecc71", filterFn: () => { } },
};

// Helper to categorize a task by due date
const getDueDateCategory = ( dueDate ) => {
    const today = new Date();
    today.setHours( 0, 0, 0, 0 );

    const tomorrow = new Date( today );
    tomorrow.setDate( tomorrow.getDate() + 1 );

    const nextWeek = new Date( today );
    nextWeek.setDate( nextWeek.getDate() + 7 );

    if ( dueDate < today ) {
        return DUE_CATEGORIES.OVERDUE;
    } else if ( dueDate < tomorrow ) {
        return DUE_CATEGORIES.TODAY;
    } else if ( dueDate < nextWeek ) {
        return DUE_CATEGORIES.THIS_WEEK;
    } else {
        return DUE_CATEGORIES.LATER;
    }
};

// Slices
const createTasksSlice = ( set, get ) => ( {
    tasksData: [],
    setTasksData: ( tasksData ) => {
        set( { tasksData: tasksData } );
        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    clearTaskData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( {
            tasksData: [],
            tags: [],
            customGroups: null,
            todoLists: [],
            columns: [],
            groups: [],
            taskGoalsData: [],
        } );
    },

    requestFetchTasks: false,
    setRequestFetchTasks: ( requestFetchTasks ) => {
        set( { requestFetchTasks: requestFetchTasks } );
    },

    clearAllTasks: () => {
        set( { tasksData: [] } );
        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    fetchTasks: async () => {
        const workspaceId = useGlobalStore.getState().workspaceId;
        if ( !workspaceId ) {
            console.error( "Workspace ID is required." );
            return;
        }
        try {
            set( { loading: true, error: null } );
            const API_BASE_URL = "/api/app/task";
            const response = await API.get( `${ API_BASE_URL }/todo/?workspaceId=${ workspaceId }` );

            console.log( "fetchTasks :: workspaceId = ", workspaceId, "response = ", response );
            set( { tasksData: response.data.data } );
            return response.data.data;
        } catch ( err ) {
            set( { error: err.response?.data?.message || "Error fetching tasks" } );
        } finally {
            set( { loading: false } );
        }
    },

    addTask: ( taskData = {}, parentTaskId = null ) => {
        // Find the group this task belongs to
        const { groups, tasksData } = get();

        const groupId = taskData.todoListGroupId;
        let group;
        if ( utils.val.isValidArray( groups, true ) ) {
            group = get().groups.find( ( g ) => g._id === groupId );
        }
        else {

            const uncategorizedGroupData = {
                _id: 'uncategorizedGroup',
                id: 'uncategorizedGroup',
                title: 'Uncategorized',
                description: 'Group for tasks without a group!',
                index: 0,
                order: 0,
                taskIds: tasksData
                    ?.filter( ( task ) => ( !task?.todoListId || task?.todoListId === activeListId || activeListId === null ) && ( !task?.todoListGroupId ) )
                    ?.sort( ( a, b ) => {
                        if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                            return a.todoListGroupIndex - b.todoListGroupIndex;
                        }
                        return ( a.index || 0 ) - ( b.index || 0 );
                    } )
                    ?.map( ( task ) => task?._id ),
            };

            group = uncategorizedGroupData;
        }

        // Calculate the todoListGroupIndex
        let todoListGroupIndex = 0;
        if ( group && group?.taskIds ) {
            todoListGroupIndex = group?.taskIds?.length;
        }

        // Add todoListGroupIndex to the task data if not already set
        const taskWithIndex = {
            ...taskData,
            todoListGroupIndex: taskData?.todoListGroupIndex !== undefined ? taskData?.todoListGroupIndex : todoListGroupIndex,
        };

        set( ( state ) => ( {
            tasksData: [ ...state.tasksData, taskWithIndex ],
        } ) );

        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    createTask: ( taskData = {}, parentTaskId = null, groupId, listId ) => {
        const group = get().customGroups.find( ( col ) => col._id === groupId );

        // Create a new task with default values and provided data
        const tempId = -Date.now();
        const taskIndex = get().tasksData?.length + 1;
        const newTask = {
            // _id: tempId,
            id: tempId,
            workspaceId: useGlobalStore.getState().workspaceId,
            todoListGroupId: groupId ?? null,
            todoListId: get().activeListId ?? listId,
            index: taskIndex,
            order: taskIndex,
            // todoListIndex: -1,
            todoListGroupIndex: -1,
            user: taskData?.user || useGlobalStore.getState().user,
            userId: taskData?.user?.id || useGlobalStore.getState().user?.id,
            subtaskIds: taskData?.subtaskIds || [],
            parentTaskId: parentTaskId,
            title: taskData?.title || "New Task",
            description: taskData?.description || null,
            timestampDue: taskData?.timestampDue || null,
            status: taskData?.status || "none",
            priority: taskData?.priority || "none",
            difficulty: taskData?.difficulty || "none",
            progress: taskData?.progress || 0,
            createdAt: new Date().toISOString(),
            tags: taskData?.tags || [],
            categories: taskData?.categories || [],
            // links: taskData?.links || [],
            isCompleted: false,
            isPinned: false,
            notes: taskData?.notes || [],
            location: taskData?.location || "",
            completeness: taskData?.completeness || 0,
            ...taskData,
        };

        return newTask;
    },

    updateTask: ( id, updates ) => {
        set( ( state ) => ( {
            tasksData: state.tasksData.map( ( t ) => ( t._id === id ? { ...t, ...updates } : t ) ),
        } ) );
    },

    deleteTask: ( id ) => {
        set( ( state ) => ( {
            tasksData: state.tasksData.filter( ( t ) => t._id !== id ),
        } ) );
    },

    // Task operations
    addTaskToColumn: ( taskData, columnId, parentTaskId = null ) => {
        const { columns, tasksData } = get();
        const column = columns.find( ( col ) => col._id === columnId );

        if ( !column ) return;

        // Generate a temporary ID (negative to avoid conflicts with server IDs)
        const tempId = -Date.now();

        // Create a new task with default values and provided data
        const taskIndex = tasksData?.length + 1;
        const newTask = {
            id: tempId,
            index: taskIndex,
            order: taskIndex,
            // todoListIndex: -1,
            todoListGroupIndex: -1,
            user: taskData?.user || null,
            userId: taskData?.user?.id || null,
            title: taskData?.title || "New Task",
            description: taskData?.description || null,
            status: column.title.toLowerCase().includes( "progress" )
                ? "in_progress"
                : column.title.toLowerCase().includes( "done" )
                    ? "done"
                    : "todo",
            timestampDue: taskData?.timestampDue || null,
            order: column.tasks.length,
            status: taskData?.status || "none",
            priority: taskData?.priority || "medium",
            difficulty: taskData?.difficulty || "medium",
            progress: taskData?.progress || 0,
            createdAt: new Date().toISOString(),
            tags: taskData?.tags || [],
            subtaskIds: taskData?.subtaskIds || [],
            links: taskData?.links || [],
            parentTaskId: parentTaskId,
            isCompleted: false,
            isPinned: false,
            todoListId: get().activeListId,
            notes: taskData?.notes || [],
            location: taskData?.location || "",
            completeness: taskData?.completeness || 0,
            categories: taskData?.categories || [],
            ...taskData,
        };

        // Add the task to the column
        set( {
            columns: columns.map( ( col ) =>
                col.id === columnId
                    ? {
                        ...col,
                        tasks: [ ...col.tasks, newTask ],
                    }
                    : col,
            ),
        } );

        // Add to update queue
        useUpdateQueueStore.getState().addUpdate( "task", newTask );

        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    updateTaskInColumn: ( taskId, updates ) => {
        const { columns } = get();
        let updatedTask = null;

        // Find and update the task
        const updatedColumns = columns.map( ( column ) => {
            const taskIndex = column.tasks.findIndex( ( task ) => task?._id === taskId );

            if ( taskIndex >= 0 ) {
                const tasks = [ ...column.tasks ];
                updatedTask = { ...tasks[ taskIndex ], ...updates };
                tasks[ taskIndex ] = updatedTask;
                return { ...column, tasks };
            }

            return column;
        } );

        if ( updatedTask ) {
            set( { columns: updatedColumns } );

            // Add to update queue
            useUpdateQueueStore.getState().addUpdate( "task", updatedTask );

            // Refresh groups when tasks change
            get().buildTaskGroupsData();
        }
    },

    deleteTaskFromColumn: ( taskId ) => {
        const { columns } = get();

        // Remove the task from its column
        const updatedColumns = columns.map( ( column ) => ( {
            ...column,
            tasks: column.tasks.filter( ( task ) => {
                // Remove the task and any tasks that have it as a parent
                return task?._id !== taskId && task.parentTaskId !== taskId;
            } ),
        } ) );

        set( { columns: updatedColumns } );

        // Add to update queue (with special delete flag)
        useUpdateQueueStore.getState().addUpdate( "task", { id: taskId, _deleted: true } );

        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    reorderTasks: ( prevTasks, oldIndex, newIndex ) => {
        const result = Array.from( prevTasks );
        const [ removed ] = result.splice( oldIndex, 1 );
        result.splice( newIndex, 0, removed );

        // Update indexes for all tasks
        const updatedTasks = result.map( ( task, index ) => ( {
            ...task,
            index: index,
            order: index,
        } ) );

        set( ( state ) => ( {
            tasksData: updatedTasks,
        } ) );

        // Refresh groups when tasks change
        get().buildTaskGroupsData();
    },

    moveTask: ( taskId, sourceColumnId, destinationColumnId, newIndex ) => {
        const { groups, tasksData, groupByField } = get();

        // Find source and destination columns
        const sourceColumn = groups.find( ( col ) => col?._id === sourceColumnId );
        const destinationColumn = groups.find( ( col ) => col?._id === destinationColumnId );

        if ( !sourceColumn || !destinationColumn ) return;

        // Find the task to move
        const taskIndex = tasksData.findIndex( ( task ) => task?._id === taskId );
        if ( taskIndex < 0 ) return;

        // Create a copy of the task with updated properties
        const taskToMove = { ...tasksData[ taskIndex ] };

        // Update the task's group ID
        taskToMove.todoListGroupId = destinationColumnId;

        // Update the task's todoListGroupIndex to match the destination index
        taskToMove.todoListGroupIndex = newIndex;

        // Update the task's index and order
        taskToMove.index = newIndex;
        taskToMove.order = newIndex;

        // Create a new array of tasks with the updated task
        const updatedTasksData = tasksData.map( ( task ) => ( task._id === taskId ? taskToMove : task ) );

        // Update the source column's taskIds array (remove the task)
        const updatedSourceTaskIds = sourceColumn.taskIds.filter( ( id ) => id !== taskId );

        // Update the destination column's taskIds array (add the task at the right position)
        const updatedDestTaskIds = [ ...destinationColumn.taskIds ];
        updatedDestTaskIds.splice( newIndex, 0, taskId );

        // Create updated groups with the new taskIds arrays
        const updatedGroups = groups.map( ( group ) => {
            if ( group._id === sourceColumnId ) {
                return { ...group, taskIds: updatedSourceTaskIds };
            }
            if ( group._id === destinationColumnId ) {
                return { ...group, taskIds: updatedDestTaskIds };
            }
            return group;
        } );

        // Update todoListGroupIndex for all tasks in the source column
        const updatedSourceTasks = updatedSourceTaskIds
            .map( ( id ) => get().getTaskById( id ) )
            .filter( Boolean )
            .map( ( task, idx ) => ( {
                ...task,
                todoListGroupIndex: idx,
            } ) );

        // Update todoListGroupIndex for all tasks in the destination column
        const updatedDestTasks = updatedDestTaskIds
            .map( ( id ) => get().getTaskById( id ) )
            .filter( Boolean )
            .map( ( task, idx ) => {
                if ( task._id === taskId ) return taskToMove;
                return {
                    ...task,
                    todoListGroupIndex: idx,
                };
            } );

        // Combine all updated tasks
        const allUpdatedTasks = [ ...updatedSourceTasks, ...updatedDestTasks.filter( ( task ) => task._id !== taskId ) ];

        // Update all tasks in the store
        const finalUpdatedTasksData = updatedTasksData.map( ( task ) => {
            const updatedTask = allUpdatedTasks.find( ( t ) => t._id === task._id );
            return updatedTask || task;
        } );

        // Update the state
        set( {
            tasksData: finalUpdatedTasksData,
            groups: updatedGroups,
        } );

        // Add to update queue
        useUpdateQueueStore.getState().addUpdate( "task", taskToMove );
    },

    toggleTaskCompletion: ( taskId ) => {
        const task = get().getTaskById( taskId );
        if ( !task ) return;

        get().updateTask( taskId, { isCompleted: !task.isCompleted } );
    },

    toggleTaskPinned: ( taskId ) => {
        const task = get().getTaskById( taskId );
        if ( !task ) return;

        get().updateTask( taskId, { isPinned: !task.isPinned } );
    },

    addSubTask: ( parentTaskId, taskData ) => {
        const parent = get().getTaskById( parentTaskId );
        if ( !parent ) return;

        // Find the column of the parent task
        const { columns } = get();
        const column = columns.find( ( col ) => col.tasks.some( ( task ) => task?._id === parentTaskId ) );

        if ( !column ) return;

        // Add the task with the parent ID
        // get().addTaskToColumn( taskData, column?._id, parentTaskId );
        get().addTask( taskData, parentTaskId );

        // Update the subTaskIds array in the parent.
        const newParentTask = get().getTaskById( parentTaskId );
        get().updateTask( newParentTask?._id, { subtaskIds: [ ...newParentTask?.subtaskIds, taskData ] } );
    },

    moveSubtask: ( taskId, parentTaskId, newParentId ) => {
        const task = get().getTaskById( taskId );
        if ( !task ) return;
        const currentParentTask = get().getTaskById( parentTaskId );
        const newParentTask = get().getTaskById( newParentId );

        // Update the parent ID in the changed task.
        get().updateTask( taskId, { parentTaskId: newParentId } );

        // Update the subtasks array in the current and new parent tasks, if applicable.
        // Remove from current parent's subTaskIds array.
        if ( currentParentTask )
            get().updateTask( currentParentTask?._id, {
                subtaskIds: currentParentTask?.subtaskIds?.filter( ( id ) => id !== taskId ),
            } );

        // Add to new parent's subTaskIds array.
        if ( newParentTask ) get().updateTask( newParentTask?._id, { subtaskIds: [ ...newParentTask?.subtaskIds, taskId ] } );
    },

    // Computed values
    getAllTasks: () => {
        const { tasksData, todoLists, activeListId } = get();
        console.log( "task.store :: getAllTasks :: tasksData = ", tasksData, " :: activeListId = ", activeListId );

        if ( utils.val.isValidArray( tasksData, true ) ) {
            return (
                tasksData
                    // .map( ( task ) => ( { ...task, id: task?._id, todoListId: Math.floor( Math.random() * todoLists?.length + 1 ) } ) )
                    .filter( ( task ) => activeListId === 0 || task.todoListId === activeListId )
            );
        }
    },

    getAllTasksFromColumns: () => {
        const { columns, activeListId } = get();
        console.log( "task.store :: getAllTasks :: columns = ", columns, " :: activeListId = ", activeListId );

        if ( utils.val.isValidArray( columns, true ) ) {
            return columns.flatMap( ( column ) =>
                column.tasks.filter( ( task ) => activeListId === 0 || activeListId === null || task.todoListId === activeListId ),
            );
        }
    },

    getTasksWithSubtasks: () => {
        const { tasksData } = get();
        return tasksData.filter( ( task ) => tasksData.some( ( t ) => t.parentTaskId === task?._id ) );
    },

    getSubtasksOfTask: ( parentTaskId ) => {
        const { tasksData } = get();
        return tasksData.filter( ( task ) => task?.parentTaskId === parentTaskId );
    },

    getTopLevelTasks: () => {
        const { tasksData, activeListId } = get();
        console.log( "task.store :: getTopLevelTasks :: tasksData = ", tasksData, " :: activeListId = ", activeListId );
        if ( utils.val.isValidArray( tasksData, true ) ) {
            return tasksData.filter(
                ( task ) =>
                    ( activeListId === 0 || task.todoListId === activeListId ) &&
                    ( task.parentTaskId === null || task.parentTaskId === undefined ),
            );
        }
    },

    getTaskById: ( taskId ) => {
        const allTasks = get().tasksData;
        return allTasks.find( ( task ) => task?._id === taskId ) || null;
    },

    // Actions - UI
    searchTerm: "",
    setSearchTerm: ( searchTerm ) => set( { searchTerm } ),

    // filters: {
    //     tags: [],
    //     users: [],
    //     timestampDue: "all",
    //     priority: "all",
    // },
    filters: [],
    setFilters: ( filters ) => set( { filters } ),

    tags: [
        { id: 1, name: "Bug", color: "#EF4444" },
        { id: 2, name: "Feature", color: "#3B82F6" },
        { id: 3, name: "Enhancement", color: "#10B981" },
        { id: 4, name: "Documentation", color: "#F59E0B" },
        { id: 5, name: "High Priority", color: "#7C3AED" },
        { id: 6, name: "Backend", color: "#6366F1" },
        { id: 7, name: "Frontend", color: "#EC4899" },
        { id: 8, name: "Testing", color: "#14B8A6" },
        { id: 9, name: "Research", color: "#8B5CF6" },
        { id: 10, name: "Design", color: "#F97316" },
    ],
    setTags: ( tags ) => set( { tags } ),
    addTag: ( tag ) => {
        const { createTag, setTags, tags } = get();
        setTags( [
            ...tags,
            createTag( tag )
        ] );
    },
    createTag: ( tag ) => {
        if ( tag ) {
            let newTagData = {
                id: tag,
                name: tag,
                label: caseCamelToSentence( String( tag ) ),
                color: stringAsColor( tag, 100, 50, 1.0 ),
            };
            return newTagData;
        }
        else {
            return null;
        }
    },
    getAllTags: () => {
        const { tasksData } = get();
        const allTags = [];
        tasksData?.forEach( ( task ) => {
            const tags = task?.tags;
            if ( task?.tags && utils.val.isValidArray( task?.tags, true ) ) {
                // allTags.push( task?.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) ) );
                tags.forEach( ( tag, index ) => {
                    if ( !allTags?.includes( tag ) ) {
                        // Not already in tags list. Add it.
                        allTags.push( {
                            id: tag,
                            index: index,
                            name: tag,
                            label: caseCamelToSentence( String( tag ) ),
                            color: stringAsColor( tag, 100, 50, 1.0 ),
                        } );
                    }
                } );
            }
        } );
        return allTags;
    },
    getTags: ( task ) => {
        const allTags = [];
        if ( task?.tags && utils.val.isValidArray( task?.tags, true ) ) {
            task?.tags?.forEach( ( tag, index ) => {
                if ( !allTags?.includes( tag ) ) {
                    // Not already in tags list. Add it.
                    allTags.push( {
                        id: index,
                        index: index,
                        name: tag,
                        label: caseCamelToSentence( String( tag ) ),
                        color: stringAsColor( tag, 100, 50, 1.0 ),
                    } );
                }
            } );
        }
        return allTags;
    },
    initTags: () => {
        // Builds tags object array with colors and ids from a basic flat array of tag names.
        const { tags, setTags, getTags } = get();
        const allTagDefs = [];
        if ( utils.val.isValidArray( tags, true ) ) {
            tags.forEach( ( tag, index ) => {
                allTagDefs.push( {
                    id: index,
                    index: index,
                    name: tag,
                    label: caseCamelToSentence( String( tag ) ),
                    color: stringAsColor( tag, 100, 50, 1.0 ),
                } );
            } );
        }
        setTags( allTagDefs );
    },

    categories: [],
    setCategories: ( tags ) => set( { tags } ),
    getCategories: () => {
        const { tasksData } = get();
        const allCategories = [];
        tasksData?.forEach( ( t ) => {
            const categories = t?.categories;
            if ( categories && utils.val.isValidArray( categories, true ) ) {
                categories.forEach( ( c ) => {
                    if ( !allCategories?.includes( c?.toLowerCase() ) ) {
                        // Not already in categories list. Add it.
                        allCategories.push( c?.toLowerCase() );
                    }
                } );
            }
        } );

        return allCategories;
    },

    currentView: "kanban",
    setCurrentView: ( currentView ) => set( { currentView } ),
} );

const createTaskGroupsSlice = ( set, get ) => ( {
    // UI state
    allowedGroupByFields: [ "status", "difficulty", "priority" ],
    setAllowedGroupByFields: ( allowedGroupByFields ) => set( { allowedGroupByFields } ),

    groupByField: "status",
    setGroupByField: ( groupByField ) => set( { groupByField } ),

    columns: [],
    setColumns: ( columns ) => set( { columns } ),

    getGroupById: ( groupId ) => {
        const { customGroups } = get();
        return customGroups.find( ( group ) => group?._id === groupId ) || null;
    },

    getGroupDataById: ( groupId ) => {
        const { groups } = get();
        return groups.find( ( group ) => group?._id === groupId ) || null;
    },

    // Use a Map to maintain consistent column order
    columnOrderMap: new Map(),
    setColumnOrderMap: ( columnOrderMap ) => set( { columnOrderMap } ),

    columnOrder: [],
    setColumnOrder: ( columnOrder ) => set( { columnOrder } ),

    columnsToColumnOrder: ( columns ) => {
        return Array.from( columns ).map( ( column, index ) => ( {
            id: column?.id ?? column?._id,
            order: column?.order ?? index,
            index: column?.index ?? index,
        } ) );
    },

    showEmptyGroups: true,
    setShowEmptyGroups: ( showEmptyGroups ) => set( { showEmptyGroups } ),

    // If true, group tasks by a chosen field found in each task.
    // If false, show only custom groups / columns.
    groupByFieldMode: false,
    setGroupByFieldMode: ( groupByFieldMode ) => set( { groupByFieldMode } ),

    customGroups: [],
    setCustomGroups: ( customGroups ) => set( { customGroups } ),

    groups: [],
    setGroups: ( groups ) => set( { groups } ),

    initColumns: () => {
        // TODO :: This block re-renders every time the columns change. We need to split this up into a slices pattern to separate concerns and avoid unnecessary rerenders.
        const {
            columnsToColumnOrder,
            activeListId,
            customGroups,
            groupByFieldMode,
            tasksData,
            groupByField,
            buildTaskGroups,
            buildTaskColumns,
            getFilteredColumns,
        } = get();

        if ( groupByFieldMode === true ) {
            const cols = buildTaskColumns( tasksData, groupByField );
            // console.log(
            //     "task.store :: initColumns :: groupByFieldMode === true :: cols = ",
            //     cols,
            //     "activeListId = ",
            //     activeListId,
            // );
            set( () => ( {
                columns: cols,
                columnOrder: columnsToColumnOrder( cols ),
                filteredColumns: getFilteredColumns(),
            } ) );
        } else {
            // Show only custom groups
            if ( utils.val.isValidArray( customGroups, true ) ) {
                const groups = buildTaskGroups( tasksData, customGroups );
                // console.log(
                //     "task.store :: initColumns :: groupByFieldMode === false :: groups = ",
                //     groups,
                //     "activeListId = ",
                //     activeListId,
                // );
                set( () => ( {
                    groups: [ ...groups ],
                    columns: [ ...groups ],
                    columnOrder: columnsToColumnOrder( groups ),
                    filteredColumns: getFilteredColumns(),
                } ) );
            }
        }
    },

    buildTaskGroupsData: () => {
        const { activeListId, groups, customGroups, tasksData, columnsToColumnOrder, getFilteredColumns, buildTaskGroups } = get();
        if ( utils.val.isValidArray( customGroups, true ) ) {
            const taskGroups = buildTaskGroups( tasksData, customGroups ) ?? [];
            // console.log(
            //     "task.store :: initColumns :: groupByFieldMode === false :: groups = ",
            //     groups,
            //     "activeListId = ",
            //     activeListId,
            // );
            set( () => ( {
                groups: [ ...taskGroups ],
                columns: [ ...taskGroups ],
                columnOrder: columnsToColumnOrder( taskGroups ),
                filteredColumns: getFilteredColumns(),
            } ) );
        }
    },

    buildTaskGroups: ( tasks, groups ) => {
        const {
            columnsToColumnOrder,
            activeListId,
            customGroups,
            groupByFieldMode,
            tasksData,
            groupByField,
            buildTaskColumns,
        } = get();

        if ( utils.val.isValidArray( groups, true ) && utils.val.isValidArray( tasks, true ) ) {
            const visibleGroupsData = groups
                .filter( ( group ) => group.todoListId === activeListId || activeListId === null )
                .map( ( group, index ) => {
                    // Find all tasks with this group's ID in their todoListGroupId field.
                    const groupTasks = tasks
                        ?.filter(
                            ( task ) =>
                                ( task?.todoListId === group?.todoListId ) &&
                                ( task?.todoListGroupId === group?._id ),
                        )
                        // Sort by todoListGroupIndex if available, otherwise by index
                        ?.sort( ( a, b ) => {
                            if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                                return a.todoListGroupIndex - b.todoListGroupIndex;
                            }
                            return ( a.index || 0 ) - ( b.index || 0 );
                        } );

                    return {
                        ...group,
                        _id: group?._id,
                        id: group?._id,
                        title: caseCamelToSentence( group?.title ?? `Group ${ index }` ),
                        index: group?.index ?? index,
                        order: group?.order ?? index,
                        tasks: groupTasks,
                        taskIds: groupTasks?.map( ( task ) => task?._id ),
                    };
                } );

            const uncategorizedGroupData = {
                _id: 'uncategorizedGroup',
                id: 'uncategorizedGroup',
                title: 'Uncategorized',
                description: 'Group for tasks without a group!',
                index: 0,
                order: 0,
                taskIds: tasks
                    ?.filter( ( task ) => ( !task?.todoListId || task?.todoListId === activeListId || activeListId === null ) && ( !task?.todoListGroupId ) )
                    ?.sort( ( a, b ) => {
                        if ( a.todoListGroupIndex !== undefined && b.todoListGroupIndex !== undefined ) {
                            return a.todoListGroupIndex - b.todoListGroupIndex;
                        }
                        return ( a.index || 0 ) - ( b.index || 0 );
                    } )
                    ?.map( ( task ) => task?._id ),
            };

            // console.log(
            //     "task.store :: buildTaskGroups :: groupByFieldMode === false :: groups = ",
            //     groups,
            //     " :: ",
            //     "visibleGroupsData = ",
            //     visibleGroupsData,
            //     "activeListId = ",
            //     activeListId,
            // );

            return [ uncategorizedGroupData, ...visibleGroupsData ];
        }
    },

    buildTaskColumns: ( tasks, groupByField ) => {
        // Given all tasks, sorts them out into specific groups, gives the group its title, id, color, and order.
        const { todoLists } = get();
        let cols = [];
        if ( utils.val.isValidArray( tasks, true ) ) {
            tasks.forEach( ( task ) => {
                // Check if this task's [groupByField] field is already in the cols array.

                // const randomListId = Math.floor( Math.random( todoLists?.length ) );
                const t = { ...task, id: task?._id };
                const taskGroupValue = task?.[ groupByField ] ?? null;
                const col = cols?.find( ( c, i ) => c?.id === taskGroupValue );

                if ( col ) {
                    // Case where this col already exists in cols.
                    cols = cols.map( ( c, i ) =>
                        c?.id === col?.id
                            ? {
                                ...col,
                                tasks: [ ...col?.tasks, t ],
                            }
                            : c,
                    );
                    // col = { ...col, tasks: [ ...col?.tasks, { ...task, ...t } ] };
                    // cols = cols.map( ( c ) => ( c?.id === col?.id ? ( col ) : ( c ) ) );
                } else {
                    // Case where this col does not already exist in cols.
                    const colIndex = cols?.length > 0 ? cols?.length : 0;
                    cols.push( {
                        id: taskGroupValue,
                        title: caseCamelToSentence( taskGroupValue ),
                        order: colIndex,
                        index: colIndex,
                        tasks: [ t ],
                    } );
                }
            } );
        }

        // console.log( "task.store :: cols = ", cols, " :: ", "tasks = ", tasks );

        return cols;
    },

    // Sort tasks in a group
    sortDirection: "desc", // asc | desc
    setSortDirection: ( sortDirection ) => set( { sortDirection } ),
    sortField: "timestampDue",
    setSortField: ( sortField ) => set( { sortField } ),
    handleSortChange: ( field ) => {
        if ( field === get().sortField ) {
            get().setSortDirection( ( prev ) => ( prev === "asc" ? "desc" : "asc" ) );
        } else {
            get().setSortField( field );
            get().setSortDirection( "asc" );
        }
    },

    sortTasks: ( tasks, sortByField = "title" ) => {
        return [ ...tasks ].sort( ( a, b ) => {
            let valueA, valueB;

            switch ( sortByField ) {
                case "index":
                    valueA = a.index;
                    valueB = b.index;
                    break;
                case "order":
                    valueA = a.order;
                    valueB = b.order;
                    break;
                case "title":
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case "description":
                    valueA = a?.description ? a?.description?.toLowerCase() : false;
                    valueB = b?.description ? b?.description?.toLowerCase() : false;
                    break;
                case "priority":
                    valueA = a.priority || "none";
                    valueB = b.priority || "none";
                    break;
                case "difficulty":
                    valueA = a.difficulty || "none";
                    valueB = b.difficulty || "none";
                    break;
                case "status":
                    valueA = a.status || "none";
                    valueB = b.status || "none";
                    break;
                case "progress":
                    valueA = a?.progress || false;
                    valueB = b?.progress || false;
                    break;
                case "completeness":
                    valueA = a?.completeness || false;
                    valueB = b?.completeness || false;
                    break;
                case "isPinned":
                    valueA = a?.isPinned || false;
                    valueB = b?.isPinned || false;
                    break;
                case "isRecurring":
                    valueA = a?.isRecurring || false;
                    valueB = b?.isRecurring || false;
                    break;
                case "reminderEnabled":
                    valueA = a?.reminderEnabled || false;
                    valueB = b?.reminderEnabled || false;
                    break;
                case "inTrash":
                    valueA = a?.inTrash || false;
                    valueB = b?.inTrash || false;
                    break;
                case "completed":
                    valueA = a?.completed || false;
                    valueB = b?.completed || false;
                    break;
                case "timestampDue":
                    valueA = a.timestampDue ? new Date( a.timestampDue ).getTime() : Number.MAX_SAFE_INTEGER;
                    valueB = b.timestampDue ? new Date( b.timestampDue ).getTime() : Number.MAX_SAFE_INTEGER;
                    break;
                case "timestampStarted":
                    valueA = a.timestampStarted ? new Date( a.timestampStarted ).getTime() : Number.MAX_SAFE_INTEGER;
                    valueB = b.timestampStarted ? new Date( b.timestampStarted ).getTime() : Number.MAX_SAFE_INTEGER;
                    break;
                case "timestampCompleted":
                    valueA = a.timestampCompleted ? new Date( a.timestampCompleted ).getTime() : Number.MAX_SAFE_INTEGER;
                    valueB = b.timestampCompleted ? new Date( b.timestampCompleted ).getTime() : Number.MAX_SAFE_INTEGER;
                    break;
                case "timestampEstimated":
                    valueA = a.timestampEstimated ? new Date( a.timestampEstimated ).getTime() : Number.MAX_SAFE_INTEGER;
                    valueB = b.timestampEstimated ? new Date( b.timestampEstimated ).getTime() : Number.MAX_SAFE_INTEGER;
                    break;
                default:
                    valueA = a.order;
                    valueB = b.order;
            }

            if ( a?.isPinned ) return 1; // Force pinned to top.
            if ( b?.isPinned ) return -1; // Force pinned to top.
            if ( valueA < valueB ) return get( 0 ).sortDirection === "asc" ? -1 : 1;
            if ( valueA > valueB ) return get( 0 ).sortDirection === "asc" ? 1 : -1;
            return 0;
        } );
    },

    filteredTasks: [],
    setFilteredTasks: ( filteredTasks ) => set( { filteredTasks } ),
    getFilteredTasks: ( tasks ) => {
        const { tasksData, todoLists, filters, searchTerm, activeListId, groupByField, getCategories } = get();

        if ( utils.val.isValidArray( filters, true ) ) {
            return tasks.filter( ( task ) => task?.todoListId === activeListId || activeListId === null );
        }
        if ( utils.val.isValidArray( tasks, true ) ) {
            return tasks
                .filter( ( task ) => {
                    // Give only tasks that are in this column.
                    return task?.todoListId === activeListId || activeListId === null;
                } )
                .filter( ( task ) => {
                    // Filter by list ID (show all if activeListId is 0 - "All Lists")
                    // Search filter
                    const searchMatch =
                        searchTerm.trim() === "" ||
                        task.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
                        ( task.description && task.description.toLowerCase().includes( searchTerm.toLowerCase() ) ) ||
                        ( task?.tags &&
                            task?.tags?.length > 0 &&
                            task.tags.some( ( tag ) => tag.toLowerCase().includes( searchTerm.toLowerCase() ) ) ) ||
                        ( task?.categories &&
                            task?.categories?.length > 0 &&
                            task.categories.some( ( c ) => c.toLowerCase().includes( searchTerm.toLowerCase() ) ) );

                    // Filter by current custom grouping term.
                    const groupMatch = filters?.[ groupByField ] === "all" || task?.[ groupByField ] === filters?.[ groupByField ];

                    // Run filters gauntlet.
                    const filteredMatch = filters.every( ( filter ) => {
                        const value = filter.value.toLowerCase();

                        switch ( filter.field ) {
                            case "title":
                                return task?.title.toLowerCase().includes( value );
                            case "description":
                                return task?.description?.toLowerCase().includes( value ) || false;
                            case "status":
                                return task?.status?.toLowerCase().includes( value ) || false;
                            case "priority":
                                return task?.priority?.toLowerCase().includes( value ) || false;
                            case "difficulty":
                                return task?.difficulty?.toLowerCase().includes( value ) || false;
                            case "categories":
                                const allCategories = getCategories();
                                return allCategories?.includes( value );
                            case "tags":
                                return task?.tags.some( ( tag ) => tag.name.toLowerCase().includes( value ) );
                            case "user":
                            case "assignee":
                                return task?.user?.name.toLowerCase().includes( value ) || false;
                            case "userId":
                                return task?.userId.includes( value ) || false;
                            case "timestampDue":
                                // Filter by due date
                                let dueDateMatch = true;
                                const timestampDueFilter = filters.find( ( f ) => f?.id === "timestampDue" );
                                if ( timestampDueFilter && timestampDueFilter !== "all" && task.timestampDue ) {
                                    const today = new Date();
                                    today.setHours( 0, 0, 0, 0 );

                                    const tomorrow = new Date( today );
                                    tomorrow.setDate( tomorrow.getDate() + 1 );

                                    const taskDate = new Date( task.timestampDue );
                                    taskDate.setHours( 0, 0, 0, 0 );

                                    // Calculate start and end of current week
                                    const startOfWeek = new Date( today );
                                    startOfWeek.setDate( today.getDate() - today.getDay() ); // Sunday
                                    const endOfWeek = new Date( startOfWeek );
                                    endOfWeek.setDate( startOfWeek.getDate() + 6 ); // Saturday

                                    // Calculate start and end of next week
                                    const startOfNextWeek = new Date( endOfWeek );
                                    startOfNextWeek.setDate( endOfWeek.getDate() + 1 ); // Next Sunday
                                    const endOfNextWeek = new Date( startOfNextWeek );
                                    endOfNextWeek.setDate( startOfNextWeek.getDate() + 6 ); // Next Saturday

                                    if ( timestampDueFilter === "overdue" ) {
                                        dueDateMatch = taskDate < today;
                                    } else if ( timestampDueFilter === "today" ) {
                                        dueDateMatch = taskDate.getTime() === today.getTime();
                                    } else if ( timestampDueFilter === "this-week" ) {
                                        dueDateMatch = taskDate >= startOfWeek && taskDate <= endOfWeek;
                                    } else if ( timestampDueFilter === "next-week" ) {
                                        dueDateMatch = taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
                                    } else if ( timestampDueFilter === "upcoming" ) {
                                        dueDateMatch = taskDate >= today;
                                    }
                                }
                                return dueDateMatch;
                            default:
                                const groupByFieldFilter = filters.find( ( f ) => f.id === groupByField );
                                return task?.[ groupByField ] === groupByFieldFilter;
                        }
                    } );

                    return searchMatch && filteredMatch;
                } );
        } else {
            return [ { title: "No Tasks found." } ];
        }
    },

    filteredColumns: [],
    setFilteredColumns: ( filteredColumns ) => ( { filteredColumns } ),
    getFilteredColumns: () => {
        const {
            tasksData,
            todoLists,
            columns,
            groups,
            filters,
            searchTerm,
            activeListId,
            groupByField,
            groupByFieldMode,
            buildTaskColumns,
            getFilteredTasks,
            buildTaskGroups,
            customGroups,
        } = get();

        if ( utils.val.isValidArray( tasksData, true ) ) {
            // First filter through all the tasks.
            const filteredTasks = getFilteredTasks( tasksData ).sort( ( a, b ) => {
                // Pinned tasks first
                if ( a.isPinned && !b.isPinned ) return -1;
                if ( !a.isPinned && b.isPinned ) return 1;

                // Sort by groupIndex if applicable; by index or order as a fallback.
                if ( a?.todoListGroupIndex !== -1 && b?.todoListGroupIndex !== -1 ) {
                    // -1 is the "this is not set" default value.
                    return a?.todoListGroupIndex - b?.todoListGroupIndex;
                } else if ( a?.index >= 0 && b?.index >= 0 ) {
                    return a?.index - b?.index;
                }

                // Then by due date (if available)
                if ( a.timestampDue && b.timestampDue ) {
                    return new Date( a.timestampDue ).getTime() - new Date( b.timestampDue ).getTime();
                }

                return 0;
            } );

            // console.log(
            //     "task.store :: getFilteredColumns :: groups = ",
            //     groups,
            //     " :: ",
            //     "filteredTasks = ",
            //     filteredTasks,
            //     "activeListId = ",
            //     activeListId,
            // );

            // Second, with the filtered tasks list, run it through the column builder.
            const filteredColumns =
                groupByFieldMode === true
                    ? buildTaskColumns( filteredTasks, groupByField )
                    : buildTaskGroups( filteredTasks, customGroups );
            // console.log(
            //     "task.store :: getFilteredColumns :: activeListId = ",
            //     activeListId,
            //     " :: ",
            //     "filteredTasks result = ",
            //     filteredTasks,
            //     " :: ",
            //     "filteredColumns = ",
            //     filteredColumns,
            // );

            // return groups.map( ( group ) => {
            //     return {
            //         ...group,
            //         tasks: filteredTasks,
            //     };
            // } );
            return filteredColumns ? filteredColumns : [];
        } else {
            return [];
        }
    },

    getFilteredTaskColumns: () => {
        // Old version before the great column purge of 2025.
        const { columns: columnsData, searchTerm, filters, activeListId } = get();

        if ( utils.val.isValidArray( columnsData ) ) {
            return columnsData.map( ( column ) => {
                // console.log(
                //     "task.storegetFilteredColumns :: columnsData = ",
                //     columnsData,
                //     " :: ",
                //     "column = ",
                //     column,
                //     "activeListId = ",
                //     activeListId,
                // );
                const filteredTasks = column.tasks.filter( ( task ) => {
                    // Filter by list ID (show all if activeListId is 0 - "All Lists")
                    if ( activeListId !== 0 && task.todoListId !== activeListId ) return false;

                    // Search filter
                    const searchMatch =
                        searchTerm.trim() === "" ||
                        task.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
                        ( task.description && task.description.toLowerCase().includes( searchTerm.toLowerCase() ) ) ||
                        task.tags.some( ( tag ) => tag.name.toLowerCase().includes( searchTerm.toLowerCase() ) );

                    // Filter by tags
                    const tagMatch = filters.tags.length === 0 || task.tags.some( ( tag ) => filters.tags.includes( tag.id ) );

                    // Filter by users
                    const userMatch = filters.users.length === 0 || ( task.user && filters.users.includes( task.userId ) );

                    // Filter by priority
                    const priorityMatch = filters.priority === "all" || task.priority === filters.priority;

                    // Filter by current custom grouping term.
                    // const groupMatch = filters?.priority === "all" || task?.[ groupByField ] === filters?.[ groupByField ];
                    const groupMatch = task?.[ get().groupByField ] === column?._id;

                    // Filter by due date
                    let dueDateMatch = true;
                    if ( filters.timestampDue !== "all" && task.timestampDue ) {
                        const today = new Date();
                        today.setHours( 0, 0, 0, 0 );

                        const tomorrow = new Date( today );
                        tomorrow.setDate( tomorrow.getDate() + 1 );

                        const taskDate = new Date( task.timestampDue );
                        taskDate.setHours( 0, 0, 0, 0 );

                        // Calculate start and end of current week
                        const startOfWeek = new Date( today );
                        startOfWeek.setDate( today.getDate() - today.getDay() ); // Sunday
                        const endOfWeek = new Date( startOfWeek );
                        endOfWeek.setDate( startOfWeek.getDate() + 6 ); // Saturday

                        // Calculate start and end of next week
                        const startOfNextWeek = new Date( endOfWeek );
                        startOfNextWeek.setDate( endOfWeek.getDate() + 1 ); // Next Sunday
                        const endOfNextWeek = new Date( startOfNextWeek );
                        endOfNextWeek.setDate( startOfNextWeek.getDate() + 6 ); // Next Saturday

                        if ( filters.timestampDue === "overdue" ) {
                            dueDateMatch = taskDate < today;
                        } else if ( filters.timestampDue === "today" ) {
                            dueDateMatch = taskDate.getTime() === today.getTime();
                        } else if ( filters.timestampDue === "this-week" ) {
                            dueDateMatch = taskDate >= startOfWeek && taskDate <= endOfWeek;
                        } else if ( filters.timestampDue === "next-week" ) {
                            dueDateMatch = taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
                        } else if ( filters.timestampDue === "upcoming" ) {
                            dueDateMatch = taskDate >= today;
                        }
                    }

                    return searchMatch && tagMatch && userMatch && priorityMatch && groupMatch && dueDateMatch;
                } );

                // console.log( "task.store :: getFilteredColumns :: column = ", column, " :: ", "filteredTasks result = " );

                return {
                    ...column,
                    tasks: filteredTasks,
                };
            } );
        } else {
            return [];
        }
    },

    // Column operations
    createGroup: ( data ) => {
        // Create and format a valid task column/group.
        const { columns, activeListId, customGroups, setCustomGroups } = get();
        const groupIndex = utils.val.isValidArray( customGroups, true ) ? customGroups.length + 1 : -1;
        const newGroup = {
            ...data,
            title: data?.title ?? "New Group",
            index: data?.index ?? groupIndex,
            workspaceId: useGlobalStore.getState().workspaceId,
            todoListId: activeListId,
            todoListIndex: groupIndex,
        };

        useUpdateQueueStore.getState().addUpdate( "create-task-list-group", newGroup );
        return newGroup;
    },

    addGroup: ( data ) => {
        // const { columns } = get();
        // const { newColumn } = get();

        set( ( state ) => ( {
            // columns: [ ...state.columns, data ],
            customGroups: [ ...state.customGroups, data ]
        } ) );

        // Add to update queue
        useUpdateQueueStore.getState().addUpdate( "add-task-list-group", data );
    },



    updateGroup: ( groupId, updates ) => {
        const { customGroups } = get();
        let updatedGroup = null;

        // Find and update the group
        const updatedGroups = customGroups.map( ( group ) => {
            if ( group?._id === groupId ) {
                updatedGroup = { ...group, ...updates };
                return updatedGroup;
            }
            return group;
        } );

        if ( updatedGroup ) {
            set( { customGroups: updatedGroups } );

            // Add to update queue
            useUpdateQueueStore.getState().addUpdate( "update-task-list-group", updatedGroup );
        }
    },

    deleteGroup: ( groupId ) => {
        const { customGroups } = get();

        // Remove the group
        const updatedGroups = customGroups.filter( ( group ) => group?._id !== groupId );

        set( { customGroups: updatedGroups } );

        // Add to update queue (with special delete flag)
        useUpdateQueueStore.getState().addUpdate( "delete-task-list-group", { id: groupId, _deleted: true } );
    },

    reorderGroups: ( newGroupOrder ) => {
        const { customGroups } = get();

        // If newGroupOrder is an array of group objects, convert to proper format
        const orderMap =
            Array.isArray( newGroupOrder ) && newGroupOrder.length > 0 && typeof newGroupOrder[ 0 ] !== "string"
                ? new Map( newGroupOrder.map( ( col, idx ) => [ col._id || col.id, idx ] ) )
                : new Map( newGroupOrder.map( ( item ) => [ item.id, item.order ] ) );

        // Update group orders
        const updatedGroups = customGroups.map( ( group ) => {
            const newOrderValue = orderMap.get( group._id );
            if ( newOrderValue !== undefined ) {
                return {
                    ...group,
                    order: newOrderValue,
                    index: newOrderValue,
                };
            }
            return group;
        } );

        // Sort groups by order
        updatedGroups.sort( ( a, b ) => a.order - b.order );

        set( {
            customGroups: updatedGroups,
            columnOrder: Array.from( orderMap.entries() ).map( ( [ id, order ] ) => ( { id, order } ) ),
        } );

        // Add each group update to the queue
        updatedGroups.forEach( ( group ) => {
            useUpdateQueueStore.getState().addUpdate( "reorder-task-list-group", group );
        } );
    },

    // addColumn: ( data ) => {
    //     const { columns } = get();

    //     // Generate a temporary ID
    //     // const tempId = -Date.now();

    //     // Create a new column
    //     // const newColumn = {
    //     //     id: tempId,
    //     //     title: data.title || "New Column",
    //     //     order: columns.length + 1,
    //     //     index: columns.length + 1,
    //     //     tasks: [],
    //     // };

    //     // set( { columns: [ ...columns, newColumn ] } );

    //     // Add to update queue
    //     // useUpdateQueueStore.getState().addUpdate( "column", newColumn );
    // },

    updateColumn: ( columnId, updates ) => {
        const { columns } = get();
        let updatedColumn = null;

        // Find and update the column
        const updatedColumns = columns.map( ( column ) => {
            if ( column?._id === columnId ) {
                updatedColumn = { ...column, ...updates };
                return updatedColumn;
            }
            return column;
        } );

        if ( updatedColumn ) {
            set( { columns: updatedColumns } );

            // Add to update queue
            useUpdateQueueStore.getState().addUpdate( "column", updatedColumn );
        }
    },

    deleteColumn: ( columnId ) => {
        const { columns } = get();

        // Remove the column
        const updatedColumns = columns.filter( ( column ) => column?._id !== columnId );

        set( { columns: updatedColumns } );

        // Add to update queue (with special delete flag)
        useUpdateQueueStore.getState().addUpdate( "column", { id: columnId, _deleted: true } );
    },

    reorderColumns: ( newColumnOrder ) => {
        const { columns } = get();

        // If newColumnOrder is an array of column objects, convert to proper format
        const orderMap =
            Array.isArray( newColumnOrder ) && newColumnOrder.length > 0 && typeof newColumnOrder[ 0 ] !== "string"
                ? new Map( newColumnOrder.map( ( col, idx ) => [ col._id || col.id, idx ] ) )
                : new Map( newColumnOrder.map( ( item ) => [ item.id, item.order ] ) );

        // Update column orders
        const updatedColumns = columns.map( ( column ) => {
            const newOrderValue = orderMap.get( column._id );
            if ( newOrderValue !== undefined ) {
                return {
                    ...column,
                    order: newOrderValue,
                    index: newOrderValue,
                };
            }
            return column;
        } );

        // Sort columns by order
        updatedColumns.sort( ( a, b ) => a.order - b.order );

        set( {
            columns: updatedColumns,
            columnOrder: Array.from( orderMap.entries() ).map( ( [ id, order ] ) => ( { id, order } ) ),
        } );

        // Add each column update to the queue
        updatedColumns.forEach( ( column ) => {
            useUpdateQueueStore.getState().addUpdate( "column", column );
        } );
    },
} );

const createTaskListsSlice = ( set, get ) => ( {
    // Actions - Lists
    todoLists: [
        // { id: 1, index: 1, name: "Main List", isActive: true, icon: "home", bannerImage: "" },
        // { id: 2, index: 2, name: "Work Tasks", isActive: false, icon: "file", bannerImage: "" },
        // { id: 3, index: 3, name: "Personal", isActive: false, icon: "list", bannerImage: "" },
        // { id: 4, index: 4, name: "AAAAAAAA", isActive: false, icon: "list", bannerImage: "" },
        {
            _id: "66407d12f1c7f75c5ae6c1bb",
            workspaceId: "63f1e9128bcd5a42d28b4563",
            taskIds: [ "66407d26f1c7f75c5ae6c209", "66407d3bf1c7f75c5ae6c20a" ],
            goalIds: [],
            index: 1,
            customGroups: [],
            title: "Main List",
            description: "Central list containing all main tasks and notes.",
            category: "General",
            tags: [ "all", "central", "overview" ],
            filters: [ "today", "important" ],
            icon: "home",
            bannerImage: "",
            isActive: true,
        },
        {
            _id: "66407e02fffff75c5ae6c10a",
            workspaceId: "63f1e9128bcd5a42d28b4563",
            taskIds: [ "66407e16f1c7f75c5ae6c20f", "66407e2af1c7f75c5ae6c210" ],
            goalIds: "66407e3ef1c7f75c5ae6c304",
            index: 5,
            customGroups: [],
            title: "New Ideas",
            description: "A space to quickly jot down new thoughts, tasks, or inspirations.",
            category: "Creative",
            tags: [ "brainstorm", "notes", "new" ],
            filters: [ "future", "inspiration" ],
            icon: "lightbulb",
            bannerImage: "",
            isActive: false,
        },
        {
            _id: "680cb9f78fbaad160a8427ad",
            workspaceId: "63f1e9128bcd5a42d28b4563",
            index: 4,
            title: "AAAAAAAAAAAAAA",
            description: "Placeholder list for new ideas or emergency notes.",
            category: "Miscellaneous",
            tags: [ "ideas", "drafts", "emergency" ],
            filters: [ "urgent", "unsorted" ],
            icon: "list",
            bannerImage: "",
            isActive: false,
        },
        {
            _id: "66407e02faaaa75c5ae6c10a",
            workspaceId: "63f1e9128bcd5a42d28b4563",
            taskIds: "66407ddbf1c7f75c5ae6c20e",
            goalIds: [],
            index: 3,
            customGroups: [],
            title: "Personal",
            description: "Personal to-dos and errands outside of work.",
            category: "Personal",
            tags: [ "self", "errands", "daily life" ],
            filters: [ "weekend", "self-care" ],
            icon: "list",
            bannerImage: "",
            isActive: false,
        },
        {
            _id: "680cba1e8fbaad160a8427b0",
            workspaceId: "63f1e9128bcd5a42d28b4563",
            taskIds: [ "66407d64f1c7f75c5ae6c20b", "66407d78f1c7f75c5ae6c20c", "66407d8cf1c7f75c5ae6c20d" ],
            goalIds: "66407da0f1c7f75c5ae6c303",
            index: 2,
            customGroups: "66407db4f1c7f75c5ae6c403",
            title: "Work Tasks",
            description: "Tasks and objectives related to professional projects.",
            category: "Work",
            tags: [ "work", "career", "projects" ],
            filters: [ "Q2", "team" ],
            icon: "file",
            bannerImage: "",
            isActive: false,
        },
    ],
    setTodoLists: ( todoLists ) => set( { todoLists } ),

    // Active todo list
    activeListId: null,
    setActiveListId: ( activeListId ) => set( { activeListId } ),
    setActiveList: ( id ) => {
        const { todoLists } = get();

        // console.log( "task.store :: setActiveList :: todoLists = ", todoLists, " :: ", "id = ", id );

        const foundList = todoLists?.find( ( list ) => list?._id === id );
        if ( utils.val.isDefined( foundList ) ) {
            set( {
                activeListId: id,
                todoLists: todoLists.map( ( list ) => ( {
                    ...list,
                    isActive: list?._id === id,
                } ) ),
            } );
        } else {
            set( {
                activeListId: null,
                todoLists: todoLists.map( ( list ) => ( {
                    ...list,
                    isActive: false,
                } ) ),
            } );
        }
    },

    // createTodoList: ( name, icon = "list", bannerImage = "" ) => {
    createTodoList: ( data = {} ) => {
        const { todoLists } = get();
        // const listIndex = Math.max( 0, ...todoLists.map( ( list ) => list.index ) ) + 1;
        const listIndex = todoLists && todoLists?.length > 0 ? todoLists?.length + 1 : 1;
        const newTodoList = {
            // id: useId(),
            userId: useGlobalStore.getState().user?.id || null,
            workspaceId: useGlobalStore.getState().workspaceId || null,
            // index: listIndex,
            // order: listIndex,
            title: data?.title || `New todo list ${ listIndex }`,
            description: "",
            isActive: false,
            ...data
        };

        return newTodoList;
    },

    addTodoList: ( data = {} ) => {
        const { todoLists } = get();

        set( { todoLists: [ ...todoLists, data ] } );

        // Add to update queue
        useUpdateQueueStore.getState().addUpdate( "create-todoList", data );
    },

    // updateTodoList: ( id, name, icon = "list", bannerImage = "" ) => {
    updateTodoList: ( id, updates = {} ) => {
        const { todoLists } = get();

        set( {
            todoLists: todoLists.map( ( list ) => ( list?._id === id ? { ...list, ...updates } : list ) ),
        } );

        // Add to update queue
        const updatedList = todoLists.find( ( list ) => list?._id === id );
        if ( updatedList ) {
            useUpdateQueueStore.getState().addUpdate( "update-todoList", { ...updatedList } );
        }
    },

    deleteTodoList: ( id ) => {
        const { todoLists, activeListId } = get();

        // Don't delete the last list
        if ( todoLists.length <= 1 ) return;

        // If deleting active list, set another list as active
        let newActiveId = activeListId;
        if ( activeListId === id ) {
            const otherList = todoLists.find( ( list ) => list?._id !== id );
            if ( otherList ) {
                newActiveId = otherList.id;
            }
        }

        set( {
            todoLists: todoLists.filter( ( list ) => list?._id !== id ),
            activeListId: newActiveId,
        } );

        // Add to update queue
        useUpdateQueueStore.getState().addUpdate( "todoList", { id, _deleted: true } );
    },
} );

const createSelectedTaskSlice = ( set, get ) => ( {
    selectedTask: null,
    setSelectedTask: ( selectedTask ) => {
        set( { selectedTask: selectedTask } );
    },

    //
    notesOpen: null,
    setNotesOpen: ( notesOpen ) => {
        set( { notesOpen: !!notesOpen } );
    },

    //
    notesContent: null,
    setNotesContent: ( notesContent ) => {
        set( { notesContent: notesContent } );
    },

    //
    isDrawerOpen: null,
    setIsDrawerOpen: ( isDrawerOpen ) => {
        set( { isDrawerOpen: !!isDrawerOpen } );
    },

    //
    visibleColumns: null,
    setVisibleColumns: ( visibleColumns ) => {
        set( { visibleColumns: visibleColumns } );
    },
} );

const createTaskListDataSlice = ( set, get ) => ( {
    taskListData: null,
    setTaskListData: ( taskListData ) => {
        set( { taskListData: taskListData } );
    },
} );

const createTaskGoalsDataSlice = ( set, get ) => ( {
    taskGoalsData: null,
    setTaskGoalsData: ( taskGoalsData ) => {
        set( { taskGoalsData: taskGoalsData } );
    },

    addGoal: ( data = {} ) => {
        set( ( state ) => ( {
            taskGoalsData: [ ...state.taskGoalsData, taskWithIndex ],
        } ) );
    },

    createGoal: ( data = {} ) => {
        const newGoal = {
            workspaceId: useGlobalStore.getState().workspaceId,
            user: data?.user || useGlobalStore.getState().user,
            userId: data?.user?.id || useGlobalStore.getState().user?.id,
            relatedTaskIds: data?.relatedTaskIds || '',
            label: data?.label || 'New Goal',
            title: data?.title || 'New Goal',
            description: data?.description || '',
            category: data?.category || '',
            tags: data?.tags || [ '' ],
            importance: data?.importance || 0,
            progress: data?.progress || 0,
            dueDate: data?.dueDate || new Date(),
            isCompleted: data?.isCompleted || false,
            isRecurring: data?.isRecurring || false,
            recurrenceRules: data?.recurrenceRules || null,
            reminderEnabled: data?.reminderEnabled || false,
            ...data,
        };

        return newGoal;
    },

    updateGoal: ( id, updates ) => {
        set( ( state ) => ( {
            taskGoalsData: state.taskGoalsData.map( ( t ) => ( t._id === id ? { ...t, ...updates } : t ) ),
        } ) );
    },

    deleteGoal: ( id ) => {
        set( ( state ) => ( {
            taskGoalsData: state.taskGoalsData.filter( ( t ) => t._id !== id ),
        } ) );
    },

    getGoalById: ( id ) => {
        const { taskGoalsData } = get();
        return taskGoalsData.find( ( item ) => item?._id === id ) || null;
    },

} );

const createTaskFiltersSlice = ( set, get ) => ( {
    activeStatusFilters: null,
    setActiveStatusFilters: ( activeStatusFilters ) => {
        set( { activeStatusFilters: activeStatusFilters } );
    },

    activePriorityFilters: null,
    setActivePriorityFilters: ( activePriorityFilters ) => {
        set( { activePriorityFilters: activePriorityFilters } );
    },

    activeDifficultyFilters: null,
    setActiveDifficultyFilters: ( activeDifficultyFilters ) => {
        set( { activeDifficultyFilters: activeDifficultyFilters } );
    },
} );

const createDebugSlice = ( set, get, api ) => ( {
    // Fetch result helper variables
    loading: false,
    setLoading: ( loading ) => set( () => ( { loading } ) ),

    error: null,
    setError: ( error ) => set( () => ( { error } ) ),
} );

const useTasksStore = create(
    // devtools( ( set, get, api ) => ( {  } ),
    devtools(
        persist(
            ( ...a ) => ( {
                // Combine other sub-store slices.
                ...createDebugSlice( ...a ),
                ...createTasksSlice( ...a ),
                ...createTaskGroupsSlice( ...a ),
                ...createTaskListsSlice( ...a ),
                ...createTaskFiltersSlice( ...a ),
                ...createTaskListDataSlice( ...a ),
                ...createSelectedTaskSlice( ...a ),
                ...createTaskGoalsDataSlice( ...a ),
            } ),
            // { name: [ ZUSTAND_TASKS_STORE_STORAGE_NAME ], getStorage: () => localStorage },
            {
                name: [ ZUSTAND_TASKS_STORE_STORAGE_NAME ],
                partialize: ( state ) => ( {
                    // columns: state.columns, // Add columns to persisted state
                    groups: state.groups, // Add groups to persisted state
                    todoLists: state.todoLists,
                    customGroups: state.customGroups,
                    tasksData: state.tasksData,
                    currentView: state.currentView,
                    activeListId: state.activeListId,
                    groupByField: state.groupByField,
                } ),
                getStorage: () => localStorage,
            },
        ),
    ),
);

export default useTasksStore;

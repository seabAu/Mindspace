import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { generateRandomId, generateRandomTasks } from "@/lib/task-schema";

// Initial columns with random tasks
const initialColumns = [
    {
        id: "new",
        title: "New",
        status: "new",
        tasks: generateRandomTasks( 5 ),
    },
    {
        id: "inProgress",
        title: "In Progress",
        status: "inProgress",
        tasks: generateRandomTasks( 3 ),
    },
    {
        id: "completed",
        title: "Completed",
        status: "completed",
        tasks: generateRandomTasks( 4 ),
    },
];

const TaskContext = createContext( null );

export function TaskProvider ( { children } ) {
    const [ columns, setColumns ] = useState( initialColumns );
    const [ visibleColumns, setVisibleColumns ] = useState( initialColumns.map( ( col ) => col.id ) );
    const [ selectedTask, setSelectedTask ] = useState( null );
    const [ isTaskDetailOpen, setIsTaskDetailOpen ] = useState( false );

    // Memoized filtered columns
    const filteredColumns = useMemo(
        () => columns.filter( ( column ) => visibleColumns.includes( column.id ) ),
        [ columns, visibleColumns ],
    );

    // Add a new column
    const addColumn = useCallback( ( title ) => {
        if ( !title.trim() ) return false;

        const newColumnId = generateRandomId();
        const newStatus = title.toLowerCase().replace( /\s+/g, "" );

        const newColumn = {
            id: newColumnId,
            title,
            status: newStatus,
            tasks: [],
        };

        setColumns( ( prev ) => [ ...prev, newColumn ] );
        setVisibleColumns( ( prev ) => [ ...prev, newColumnId ] );
        return true;
    }, [] );

    // Add a new task to a column
    const addTask = useCallback( ( task, columnId ) => {
        setColumns( ( prevColumns ) => {
            return prevColumns.map( ( column ) => {
                if ( column.id === columnId ) {
                    return {
                        ...column,
                        tasks: [ ...column.tasks, task ],
                    };
                }
                return column;
            } );
        } );
    }, [] );

    // Move a task between columns
    const moveTask = useCallback( ( taskId, sourceColumnId, destinationColumnId, destinationIndex = -1 ) => {
        setColumns( ( prevColumns ) => {
            const newColumns = [ ...prevColumns ];

            // Find source and destination column indexes
            const sourceColumnIndex = newColumns.findIndex( ( c ) => c.id === sourceColumnId );
            const destColumnIndex = newColumns.findIndex( ( c ) => c.id === destinationColumnId );

            if ( sourceColumnIndex === -1 || destColumnIndex === -1 ) return prevColumns;

            // Find the task index in the source column
            const taskIndex = newColumns[ sourceColumnIndex ].tasks.findIndex( ( t ) => t.id === taskId );
            if ( taskIndex === -1 ) return prevColumns;

            // Get the task being moved
            const [ task ] = newColumns[ sourceColumnIndex ].tasks.splice( taskIndex, 1 );

            // Update the task's status to match the destination column
            const updatedTask = {
                ...task,
                status: newColumns[ destColumnIndex ].status,
                groupId: newColumns[ destColumnIndex ].id,
                updatedAt: new Date(),
            };

            // Add the task to the destination column
            if ( destinationIndex === -1 ) {
                // Add to the end if no specific index
                newColumns[ destColumnIndex ].tasks.push( updatedTask );
            } else {
                // Insert at the specified index
                newColumns[ destColumnIndex ].tasks.splice( destinationIndex, 0, updatedTask );
            }

            return newColumns;
        } );
    }, [] );

    // Update a task
    const updateTask = useCallback( ( updatedTask ) => {
        setColumns( ( prevColumns ) => {
            return prevColumns.map( ( column ) => {
                const taskIndex = column.tasks.findIndex( ( t ) => t.id === updatedTask.id );
                if ( taskIndex >= 0 ) {
                    const newTasks = [ ...column.tasks ];
                    newTasks[ taskIndex ] = updatedTask;
                    return { ...column, tasks: newTasks };
                }
                return column;
            } );
        } );

        // Update selected task if it's the one being edited
        setSelectedTask( ( prev ) => ( prev?.id === updatedTask.id ? updatedTask : prev ) );
    }, [] );

    // Delete a task
    const deleteTask = useCallback(
        ( taskId ) => {
            setColumns( ( prevColumns ) => {
                return prevColumns.map( ( column ) => {
                    const taskIndex = column.tasks.findIndex( ( t ) => t.id === taskId );
                    if ( taskIndex >= 0 ) {
                        const newTasks = [ ...column.tasks ];
                        newTasks.splice( taskIndex, 1 );
                        return { ...column, tasks: newTasks };
                    }
                    return column;
                } );
            } );

            // Close task detail if the deleted task is selected
            if ( selectedTask?.id === taskId ) {
                setSelectedTask( null );
                setIsTaskDetailOpen( false );
            }
        },
        [ selectedTask ],
    );

    // Open task detail
    const openTaskDetail = useCallback( ( task ) => {
        setSelectedTask( task );
        setIsTaskDetailOpen( true );
    }, [] );

    // Close task detail
    const closeTaskDetail = useCallback( () => {
        setIsTaskDetailOpen( false );
    }, [] );

    const showToast = ( message, type ) => {
        toast[ type ]( message );
    };

    /* const value = {
        columns,
        filteredColumns,
        visibleColumns,
        setVisibleColumns,
        selectedTask,
        isTaskDetailOpen,
        setIsTaskDetailOpen,
        addColumn,
        addTask,
        moveTask,
        updateTask,
        deleteTask,
        openTaskDetail,
        closeTaskDetail,
    }; */

    const value = useMemo( () => ( {
        columns,
        filteredColumns,
        visibleColumns,
        setVisibleColumns,
        selectedTask,
        isTaskDetailOpen,
        setIsTaskDetailOpen,
        addColumn,
        addTask,
        moveTask,
        updateTask,
        deleteTask,
        openTaskDetail,
        closeTaskDetail,
    } ), [
        columns, filteredColumns, visibleColumns, setVisibleColumns, selectedTask, isTaskDetailOpen, setIsTaskDetailOpen, addColumn, addTask, moveTask, updateTask, deleteTask, openTaskDetail, closeTaskDetail ] );

    return (
        <TaskContext.Provider value={ value }>
            { children }
        </TaskContext.Provider>
    );
}

export function useTaskContext () {
    const context = useContext( TaskContext );
    if ( !context ) {
        throw new Error( "useTaskContext must be used within a TaskProvider" );
    }
    return context;
}




/*  import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
    import axios from 'axios';
    import { toast } from 'react-hot-toast';

    export type Task = {
        _id: string;
        title: string;
        description: string;
        status: 'To Do' | 'In Progress' | 'Completed';
        priority: 'Low' | 'Medium' | 'High';
        dueDate: string;
    };

    export type TaskContextType = {
        tasks: Task[];
        loading: boolean;
        error: string | null;
        addTask: ( task: Omit<Task, '_id'> ) => Promise<void>;
        updateTask: ( id: string, task: Partial<Task> ) => Promise<void>;
        deleteTask: ( id: string ) => Promise<void>;
        fetchTasks: () => Promise<void>;
        showToast: ( message: string, type: 'success' | 'error' ) => void;
    };

    const TaskContext = createContext < TaskContextType | null > ( null );

    export const TaskProvider: React.FC<{ children: React.ReactNode; }> = ( { children } ) => {
        const [ tasks, setTasks ] = useState < Task[] > ( [] );
        const [ loading, setLoading ] = useState < boolean > ( true );
        const [ error, setError ] = useState < string | null > ( null );

        const getAuthHeader = useCallback( () => {
            const token = localStorage.getItem( 'token' );
            return token ? { Authorization: `Bearer ${ token }` } : {};
        }, [] );

        const fetchTasks = useCallback( async () => {
            try {
                setLoading( true );
                const token = localStorage.getItem( 'token' );
                const response = await axios.get( '/api/tasks', {
                    headers: { Authorization: `Bearer ${ token }` }
                } );
                setTasks( response.data );
                setError( null );
            } catch ( err ) {
                if ( axios.isAxiosError( err ) && err.response ) {
                    setError( `Failed to fetch tasks: ${ err.response.data.message || err.message }` );
                } else {
                    setError( 'Failed to fetch tasks' );
                }
                console.error( err );
            } finally {
                setLoading( false );
            }
        }, [] );

        const addTask = useCallback( async ( newTask: Omit<Task, '_id'> ) => {
            try {
                const response = await axios.post( '/api/tasks', newTask, {
                    headers: getAuthHeader()
                } );
                setTasks( prevTasks => [ ...prevTasks, response.data ] );
            } catch ( err ) {
                setError( 'Failed to add task' );
                console.error( err );
            }
        }, [ getAuthHeader ] );

        const updateTask = useCallback( async ( id: string, updatedFields: Partial<Task> ) => {
            try {
                const response = await axios.put( `/api/tasks/${ id }`, updatedFields, {
                    headers: getAuthHeader()
                } );
                setTasks( prevTasks => prevTasks.map( task => task._id === id ? { ...task, ...response.data } : task ) );
            } catch ( err ) {
                setError( 'Failed to update task' );
                throw err;
            }
        }, [ getAuthHeader ] );

        const deleteTask = useCallback( async ( taskId: string ) => {
            try {
                const token = localStorage.getItem( 'token' );
                if ( !token ) {
                    throw new Error( 'No authentication token found' );
                }
                await axios.delete( `/api/tasks/${ taskId }`, {
                    headers: { Authorization: `Bearer ${ token }` }
                } );
                setTasks( prevTasks => prevTasks.filter( task => task._id !== taskId ) );
                showToast( 'Task deleted successfully', 'success' );
            } catch ( error ) {
                console.error( 'Error deleting task:', error );
                showToast( 'Failed to delete task. Please try again.', 'error' );

                if ( axios.isAxiosError( error ) ) {
                    console.error( 'Response status:', error.response?.status );
                    console.error( 'Response data:', error.response?.data );
                }
            }
        }, [] );

        useEffect( () => {
            fetchTasks();
        }, [ fetchTasks ] );

        const showToast = ( message: string, type: 'success' | 'error' ) => {
            toast[ type ]( message );
        };

        const value = useMemo( () => ( {
            tasks,
            loading,
            error,
            fetchTasks,
            addTask,
            updateTask,
            deleteTask,
            showToast,
        } ), [ tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask ] );

        return (
            <TaskContext.Provider value={ value }>
                { children }
            </TaskContext.Provider>
        );
    };

    export const useTaskContext = () => {
        const context = useContext( TaskContext );
        if ( !context ) {
            throw new Error( 'useTaskContext must be used within a TaskProvider' );
        }
        return context;
    }; 
*/
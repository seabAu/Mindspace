import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import type { KanbanColumn } from "@/lib/actions/kanban-actions"
import * as utils from 'akashatools';
import { getAllUsers } from "@/features/Todo/lib/actions/kanban-actions";

const KanbanContext = createContext();

export function KanbanProvider ( { children, initialData } ) {
    const [ columns, setColumns ] = useState( initialData );
    const [ filters, setFilters ] = useState( {
        tags: [],
        users: [],
        dueDate: "all",
        priority: "all",
    } );
    const [ isDarkMode, setIsDarkMode ] = useState( false );
    const [ availableTags, setAvailableTags ] = useState( [] );
    const [ availableUsers, setAvailableUsers ] = useState( [] );
    const [ searchTerm, setSearchTerm ] = useState( "" );

    // Fetch tags and users
    useEffect( () => {
        const fetchData = async () => {
            const tags = await getAllTags();
            const users = await getAllUsers();
            setAvailableTags( tags );
            setAvailableUsers( users );
        };
        fetchData();
    }, [] );

    // Memoized functions to get tags and users
    const getTagsCallback = useCallback( async () => {
        if ( availableTags.length === 0 ) {
            const tags = await getAllTags();
            setAvailableTags( tags );
            return tags;
        }
        return availableTags;
    }, [ availableTags ] );

    const getUsersCallback = useCallback( async () => {
        if ( availableUsers.length === 0 ) {
            const users = await getAllUsers();
            setAvailableUsers( users );
            return users;
        }
        return availableUsers;
    }, [ availableUsers ] );

    // Apply filters to columns
    const filteredColumns = columns.map( ( column ) => {
        const filteredTasks = column.tasks.filter( ( task ) => {
            // Search filter
            const searchMatch =
                searchTerm.trim() === "" ||
                task?.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
                ( task?.description && task?.description.toLowerCase().includes( searchTerm.toLowerCase() ) ) ||
                task?.tags.some( ( tag ) => tag.name.toLowerCase().includes( searchTerm.toLowerCase() ) );

            // Filter by tags
            const tagMatch = filters.tags.length === 0 || task?.tags.some( ( tag ) => filters.tags.includes( tag.id ) );

            // Filter by users
            const userMatch = filters.users.length === 0 || ( task?.user && filters.users.includes( task?.user.id ) );

            // Filter by priority
            const priorityMatch = filters.priority === "all" || task?.priority === filters.priority;

            // Filter by due date
            let dueDateMatch = true;
            if ( filters.dueDate !== "all" && task?.dueDate ) {
                const today = new Date();
                today.setHours( 0, 0, 0, 0 );

                const tomorrow = new Date( today );
                tomorrow.setDate( tomorrow.getDate() + 1 );

                const taskDate = new Date( task?.dueDate );
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

                if ( filters.dueDate === "overdue" ) {
                    dueDateMatch = taskDate < today;
                } else if ( filters.dueDate === "today" ) {
                    dueDateMatch = taskDate.getTime() === today.getTime();
                } else if ( filters.dueDate === "this-week" ) {
                    dueDateMatch = taskDate >= startOfWeek && taskDate <= endOfWeek;
                } else if ( filters.dueDate === "next-week" ) {
                    dueDateMatch = taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
                } else if ( filters.dueDate === "upcoming" ) {
                    dueDateMatch = taskDate >= today;
                }
            }

            return searchMatch && tagMatch && userMatch && priorityMatch && dueDateMatch;
        } );

        return {
            ...column,
            tasks: filteredTasks,
        };
    } );

    // Effect to toggle dark mode class on body
    useEffect( () => {
        if ( isDarkMode ) {
            document.documentElement.classList.add( "dark" );
        } else {
            document.documentElement.classList.remove( "dark" );
        }
    }, [ isDarkMode ] );

    return (
        <KanbanContext.Provider
            value={ {
                columns,
                setColumns,
                filters,
                setFilters,
                filteredColumns,
                isDarkMode,
                setIsDarkMode,
                availableTags,
                availableUsers,
                getAllTags: getTagsCallback,
                getAllUsers: getUsersCallback,
                searchTerm,
                setSearchTerm,
            } }
        >
            { children }
        </KanbanContext.Provider>
    );
}

export function useKanban () {
    const context = useContext( KanbanContext );
    if ( context === undefined ) {
        throw new Error( "useKanban must be used within a KanbanProvider" );
    }
    return context;
}

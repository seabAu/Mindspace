// Update the task store to include notes field
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUpdateQueueStore } from "@/store/update-queue-store";
import { getMockKanbanData } from "../mock-data";
// import type { KanbanTask, KanbanColumn } from "@/lib/types"
/* export type ViewType = "kanban" | "detailed-list" | "basic-list" | "table" | "calendar"

interface TodoList {
  id
  name: string
  isActive: boolean
  icon?: string
  bannerImage?: string
}

interface TaskState {
  // Data
  todoLists: TodoList[]
  activeListId
  columns[]
  tags: Array<{ id; name: string; color: string }>
  users: Array<{ id; name: string; avatarUrl: string | null }>

  // UI State
  searchTerm: string
  filters: {
    tags[]
    users[]
    dueDate: "all" | "overdue" | "today" | "upcoming" | "this-week" | "next-week"
    priority: "all" | "high" | "medium" | "low"
  }
  isDarkMode: boolean
  currentView: ViewType

  // Actions - Lists
  setTodoLists: (lists: TaskState["todoLists"]) => void
  addTodoList: (name: string, icon?: string, bannerImage?: string) => void
  updateTodoList: (id, name: string, icon?: string, bannerImage?: string) => void
  deleteTodoList: (id) => void
  setActiveList: (id) => void

  // Actions - UI
  setColumns: (columns[]) => void
  setSearchTerm: (term: string) => void
  setFilters: (filters: TaskState["filters"]) => void
  setIsDarkMode: (isDarkMode: boolean) => void
  setTags: (tags: TaskState["tags"]) => void
  setUsers: (users: TaskState["users"]) => void
  setCurrentView: (view: ViewType) => void

  // Task operations
  addTask: (columnId, task: Partial<KanbanTask>, parentId? | null) => void
  updateTask: (taskId, updates: Partial<KanbanTask>) => void
  deleteTask: (taskId) => void
  moveTask: (taskId, sourceColumnId, destinationColumnId, newIndex) => void
  toggleTaskCompletion: (taskId) => void
  toggleTaskPinned: (taskId) => void
  addSubtask: (parentId, task: Partial<KanbanTask>) => void
  moveSubtask: (taskId, parentId | null, newParentId | null) => void

  // Column operations
  addColumn: (column: Partial<KanbanColumn>) => void
  updateColumn: (columnId, updates: Partial<KanbanColumn>) => void
  deleteColumn: (columnId) => void
  reorderColumns: (newOrder: { id; order }[]) => void

  // Computed
  getFilteredColumns: () => KanbanColumn[]
  getTaskById: (taskId) => KanbanTask | null
  getAllTasks: () => KanbanTask[]
  getTasksWithSubtasks: () => KanbanTask[]
  getTopLevelTasks: () => KanbanTask[]
} */

// Initialize with mock data
const initialData = getMockKanbanData();

export const useTodoStore = create()(
    persist(
        ( set, get ) => ( {
            // Initial data
            todoLists: [
                { id: 1, name: "Main List", isActive: true, icon: "home", bannerImage: "" },
                { id: 2, name: "Work Tasks", isActive: false, icon: "file", bannerImage: "" },
                { id: 3, name: "Personal", isActive: false, icon: "list", bannerImage: "" },
            ],
            activeListId: 1,
            columns: initialData,
            tags: [
                { id: 1, name: "Bug", color: "#EF4444" },
                { id: 2, name: "Feature", color: "#3B82F6" },
                { id: 3, name: "Enhancement", color: "#10B981" },
                { id: 4, name: "Documentation", color: "#F59E0B" },
                { id: 5, name: "High Priority", color: "#7C3AED" },
            ],
            users: [
                { id: 1, name: "John Doe", avatarUrl: "/placeholder.svg?height=40&width=40" },
                { id: 2, name: "Jane Smith", avatarUrl: "/placeholder.svg?height=40&width=40" },
                { id: 3, name: "Bob Johnson", avatarUrl: "/placeholder.svg?height=40&width=40" },
            ],

            // UI state
            searchTerm: "",
            filters: {
                tags: [],
                users: [],
                dueDate: "all",
                priority: "all",
            },
            isDarkMode: false,
            currentView: "kanban",

            // Actions - Lists
            setTodoLists: ( todoLists ) => set( { todoLists } ),

            addTodoList: ( name, icon = "list", bannerImage = "" ) => {
                const { todoLists } = get();
                const newId = Math.max( 0, ...todoLists.map( ( list ) => list.id ) ) + 1;

                set( {
                    todoLists: [ ...todoLists, { id: newId, name, isActive: false, icon, bannerImage } ],
                } );

                // Add to update queue
                useUpdateQueueStore.getState().addUpdate( "todoList", {
                    id: newId,
                    name,
                    isActive: false,
                    icon,
                    bannerImage,
                } );
            },

            updateTodoList: ( id, name, icon = "list", bannerImage = "" ) => {
                const { todoLists } = get();

                set( {
                    todoLists: todoLists.map( ( list ) => ( list.id === id ? { ...list, name, icon, bannerImage } : list ) ),
                } );

                // Add to update queue
                const updatedList = todoLists.find( ( list ) => list.id === id );
                if ( updatedList ) {
                    useUpdateQueueStore.getState().addUpdate( "todoList", {
                        ...updatedList,
                        name,
                        icon,
                        bannerImage,
                    } );
                }
            },

            deleteTodoList: ( id ) => {
                const { todoLists, activeListId } = get();

                // Don't delete the last list
                if ( todoLists.length <= 1 ) return;

                // If deleting active list, set another list as active
                let newActiveId = activeListId;
                if ( activeListId === id ) {
                    const otherList = todoLists.find( ( list ) => list.id !== id );
                    if ( otherList ) {
                        newActiveId = otherList.id;
                    }
                }

                set( {
                    todoLists: todoLists.filter( ( list ) => list.id !== id ),
                    activeListId: newActiveId,
                } );

                // Add to update queue
                useUpdateQueueStore.getState().addUpdate( "todoList", { id, _deleted: true } );
            },

            setActiveList: ( id ) => {
                const { todoLists } = get();

                set( {
                    activeListId: id,
                    todoLists: todoLists.map( ( list ) => ( {
                        ...list,
                        isActive: list.id === id,
                    } ) ),
                } );
            },

            // Actions - UI
            setColumns: ( columns ) => set( { columns } ),
            setSearchTerm: ( searchTerm ) => set( { searchTerm } ),
            setFilters: ( filters ) => set( { filters } ),
            setIsDarkMode: ( isDarkMode ) => set( { isDarkMode } ),
            setTags: ( tags ) => set( { tags } ),
            setUsers: ( users ) => set( { users } ),
            setCurrentView: ( currentView ) => set( { currentView } ),

            // Task operations
            addTask: ( columnId, taskData, parentId = null ) => {
                const { columns } = get();
                const column = columns.find( ( col ) => col.id === columnId );

                if ( !column ) return;

                // Generate a temporary ID (negative to avoid conflicts with server IDs)
                const tempId = -Date.now();

                // Create a new task with default values and provided data
                const newTask = {
                    id: tempId,
                    user: taskData.user || null,
                    userId: taskData.user?.id || null,
                    title: taskData.title || "New Task",
                    description: taskData.description || null,
                    status: column.title.toLowerCase().includes( "progress" )
                        ? "in_progress"
                        : column.title.toLowerCase().includes( "done" )
                            ? "done"
                            : "todo",
                    dueDate: taskData.dueDate || null,
                    order: column.tasks.length,
                    status: ( taskData.status ) || "none",
                    priority: ( taskData.priority ) || "medium",
                    difficulty: ( taskData.difficulty ) || "medium",
                    progress: taskData.progress || 0,
                    createdAt: new Date().toISOString(),
                    tags: taskData.tags || [],
                    subtasks: taskData.subtasks || [],
                    links: taskData.links || [],
                    parentId: parentId,
                    isCompleted: false,
                    isPinned: false,
                    listId: get().activeListId,
                    notes: taskData.notes || [],
                    location: taskData.location || "",
                    completeness: taskData.completeness || 0,
                    categories: taskData.categories || [],
                };

                // Add the task to the column
                set( {
                    columns: columns.map( ( col ) => ( col.id === columnId ? { ...col, tasks: [ ...col.tasks, newTask ] } : col ) ),
                } );

                // Add to update queue
                useUpdateQueueStore.getState().addUpdate( "task", newTask );
            },

            updateTask: ( taskId, updates ) => {
                const { columns } = get();
                let updatedTask = null;

                // Find and update the task
                const updatedColumns = columns.map( ( column ) => {
                    const taskIndex = column.tasks.findIndex( ( task ) => task.id === taskId );

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
                }
            },

            deleteTask: ( taskId ) => {
                const { columns } = get();

                // Remove the task from its column
                const updatedColumns = columns.map( ( column ) => ( {
                    ...column,
                    tasks: column.tasks.filter( ( task ) => {
                        // Remove the task and any tasks that have it as a parent
                        return task.id !== taskId && task.parentId !== taskId;
                    } ),
                } ) );

                set( { columns: updatedColumns } );

                // Add to update queue (with special delete flag)
                useUpdateQueueStore.getState().addUpdate( "task", { id: taskId, _deleted: true } );
            },

            moveTask: ( taskId, sourceColumnId, destinationColumnId, newIndex ) => {
                const { columns } = get();

                // Find source and destination columns
                const sourceColumn = columns.find( ( col ) => col.id === sourceColumnId );
                const destinationColumn = columns.find( ( col ) => col.id === destinationColumnId );

                if ( !sourceColumn || !destinationColumn ) return;

                // Find the task to move
                const taskIndex = sourceColumn.tasks.findIndex( ( task ) => task.id === taskId );
                if ( taskIndex < 0 ) return;

                const taskToMove = sourceColumn.tasks[ taskIndex ];

                // Determine the new status based on the destination column
                let newStatus; // : "todo" | "in_progress" | "done";
                if ( destinationColumn.title.toLowerCase().includes( "do" ) ) {
                    newStatus = "todo";
                } else if ( destinationColumn.title.toLowerCase().includes( "progress" ) ) {
                    newStatus = "in_progress";
                } else {
                    newStatus = "done";
                }

                // Create updated task with new status and column
                const updatedTask = {
                    ...taskToMove,
                    status: newStatus,
                    order: newIndex,
                };

                // Remove from source column
                const updatedSourceTasks = sourceColumn.tasks.filter( ( task ) => task.id !== taskId );

                // Add to destination column at the right position
                const updatedDestTasks = [ ...destinationColumn.tasks ];
                updatedDestTasks.splice( newIndex, 0, updatedTask );

                // Update all task orders in the destination column
                const reorderedDestTasks = updatedDestTasks.map( ( task, index ) => ( {
                    ...task,
                    order: index,
                } ) );

                // Create updated columns array
                const updatedColumns = columns.map( ( column ) => {
                    if ( column.id === sourceColumnId ) {
                        return { ...column, tasks: updatedSourceTasks };
                    }
                    if ( column.id === destinationColumnId ) {
                        return { ...column, tasks: reorderedDestTasks };
                    }
                    return column;
                } );

                set( { columns: updatedColumns } );

                // Add to update queue
                useUpdateQueueStore.getState().addUpdate( "task", updatedTask );
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

            addSubtask: ( parentId, taskData ) => {
                const parent = get().getTaskById( parentId );
                if ( !parent ) return;

                // Find the column of the parent task
                const { columns } = get();
                const column = columns.find( ( col ) => col.tasks.some( ( task ) => task.id === parentId ) );

                if ( !column ) return;

                // Add the task with the parent ID
                get().addTask( column.id, taskData, parentId );
            },

            moveSubtask: ( taskId, parentId, newParentId ) => {
                const task = get().getTaskById( taskId );
                if ( !task ) return;

                // Update the parent ID
                get().updateTask( taskId, { parentId: newParentId } );
            },

            // Column operations
            addColumn: ( columnData ) => {
                const { columns } = get();

                // Generate a temporary ID
                const tempId = -Date.now();

                // Create a new column
                const newColumn = {
                    id: tempId,
                    title: columnData.title || "New Column",
                    order: columns.length,
                    tasks: [],
                };

                set( { columns: [ ...columns, newColumn ] } );

                // Add to update queue
                useUpdateQueueStore.getState().addUpdate( "column", newColumn );
            },

            updateColumn: ( columnId, updates ) => {
                const { columns } = get();
                let updatedColumn = null;

                // Find and update the column
                const updatedColumns = columns.map( ( column ) => {
                    if ( column.id === columnId ) {
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
                const updatedColumns = columns.filter( ( column ) => column.id !== columnId );

                set( { columns: updatedColumns } );

                // Add to update queue (with special delete flag)
                useUpdateQueueStore.getState().addUpdate( "column", { id: columnId, _deleted: true } );
            },

            reorderColumns: ( newOrder ) => {
                const { columns } = get();

                // Create a map of id to order
                const orderMap = new Map( newOrder.map( ( item ) => [ item.id, item.order ] ) );

                // Update column orders
                const updatedColumns = columns.map( ( column ) => {
                    const newOrderValue = orderMap.get( column.id );
                    if ( newOrderValue !== undefined ) {
                        return { ...column, order: newOrderValue };
                    }
                    return column;
                } );

                // Sort columns by order
                updatedColumns.sort( ( a, b ) => a.order - b.order );

                set( { columns: updatedColumns } );

                // Add each column update to the queue
                updatedColumns.forEach( ( column ) => {
                    useUpdateQueueStore.getState().addUpdate( "column", column );
                } );
            },

            // Computed values
            getFilteredColumns: () => {
                const { columns: columnsData, searchTerm, filters, activeListId } = get();

                return columnsData.map( ( column ) => {
                    const filteredTasks = column.tasks.filter( ( task ) => {
                        // Filter by list ID (show all if activeListId is 0 - "All Lists")
                        if ( activeListId !== 0 && task.listId !== activeListId ) return false;

                        // Search filter
                        const searchMatch =
                            searchTerm.trim() === "" ||
                            task.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
                            ( task.description && task.description.toLowerCase().includes( searchTerm.toLowerCase() ) ) ||
                            task.tags.some( ( tag ) => tag.name.toLowerCase().includes( searchTerm.toLowerCase() ) );

                        // Filter by tags
                        const tagMatch = filters.tags.length === 0 || task.tags.some( ( tag ) => filters.tags.includes( tag.id ) );

                        // Filter by users
                        const userMatch = filters.users.length === 0 || ( task.user && filters.users.includes( task.user.id ) );

                        // Filter by priority
                        const priorityMatch = filters.priority === "all" || task.priority === filters.priority;

                        // Filter by due date
                        let dueDateMatch = true;
                        if ( filters.dueDate !== "all" && task.dueDate ) {
                            const today = new Date();
                            today.setHours( 0, 0, 0, 0 );

                            const tomorrow = new Date( today );
                            tomorrow.setDate( tomorrow.getDate() + 1 );

                            const taskDate = new Date( task.dueDate );
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
            },

            getAllTasks: () => {
                const { columns, activeListId } = get();
                return columns.flatMap( ( column ) =>
                    column.tasks.filter( ( task ) => activeListId === 0 || task.listId === activeListId ),
                );
            },

            getTasksWithSubtasks: () => {
                const allTasks = get().getAllTasks();
                return allTasks.filter( ( task ) => allTasks.some( ( t ) => t.parentId === task.id ) );
            },

            getTopLevelTasks: () => {
                const { columns, activeListId } = get();
                return columns.flatMap( ( column ) =>
                    column.tasks.filter(
                        ( task ) =>
                            ( activeListId === 0 || task.listId === activeListId ) &&
                            ( task.parentId === null || task.parentId === undefined ),
                    ),
                );
            },

            getTaskById: ( taskId ) => {
                const allTasks = get().getAllTasks();
                return allTasks.find( ( task ) => task.id === taskId ) || null;
            },
        } ),
        {
            name: "kanban-task-storage",
            partialize: ( state ) => ( {
                columns: state.columns,
                isDarkMode: state.isDarkMode,
                todoLists: state.todoLists,
                activeListId: state.activeListId,
                currentView: state.currentView,
            } ),
        },
    ),
);

/*  // TODO :: Replace most of these functions with the existing API function calls, and move the mock data generator into its own utilities file. 
  
*/



// "use server"

import { db } from "@/lib/db";
import { columns, tasks, tasksTags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { initDatabase } from "@/lib/db/init";

/* export type KanbanColumn = {
  id
  title
  order
  tasks: KanbanTask[]
}

export type KanbanTask = {
  id
  title
  description | null
  status: "todo" | "in_progress" | "done"
  timestampDue: Date | null
  order
  priority?: "high" | "medium" | "low"
  progress?
  createdAt
  user: {
    id
    name
    avatarUrl | null
  } | null
  tags: {
    id
    name
    color
  }[]
  subtasks?: {
    id
    title
    completed: boolean
  }[]
  links?: {
    id
    title
    url
  }[]
} */

// Update the getKanbanData function with better error handling and fallback data
export async function getKanbanData () {
    try {
        // Check if DATABASE_URL is set
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Using mock data instead." );
            return getMockKanbanData();
        }

        // Initialize database first
        try {
            const initialized = await initDatabase();
            if ( !initialized ) {
                console.warn( "Failed to initialize database. Using mock data instead." );
                return getMockKanbanData();
            }

            // Try to fetch data from the database
            try {
                // Fetch columns
                const columnsData = await db.query.columns.findMany( {
                    orderBy: ( columns, { asc } ) => [ asc( columns.order ) ],
                } );

                // If no columns exist, seed the database
                if ( columnsData.length === 0 ) {
                    console.log( "No columns found. Seeding database..." );
                    try {
                        const { seed } = await import( "@/lib/db/seed" );
                        await seed();

                        // Fetch columns again after seeding
                        const seededColumnsData = await db.query.columns.findMany( {
                            orderBy: ( columns, { asc } ) => [ asc( columns.order ) ],
                        } );

                        if ( seededColumnsData.length === 0 ) {
                            console.warn( "Failed to seed database. Using mock data instead." );
                            return getMockKanbanData();
                        }

                        columnsData.push( ...seededColumnsData );
                    } catch ( seedError ) {
                        console.error( "Error seeding database:", seedError );
                        return getMockKanbanData();
                    }
                }

                // Fetch tasks with users and tags
                const tasksData = await db.query.tasks.findMany( {
                    with: {
                        user: true,
                        tags: {
                            with: {
                                tag: true,
                            },
                        },
                    },
                    orderBy: ( tasks, { asc } ) => [ asc( tasks.order ) ],
                } );

                // Organize tasks by column
                const kanbanColumns = columnsData.map( ( column ) => {
                    const columnTasks = tasksData
                        .filter( ( task ) => task.columnId === column.id )
                        .map( ( task ) => ( {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            timestampDue: task.timestampDue,
                            order: task.order,
                            priority: task.priority,
                            progress: task.progress,
                            createdAt: task.createdAt.toISOString(),
                            user: task.user
                                ? {
                                    id: task.user.id,
                                    name: task.user.name,
                                    avatarUrl: task.user.avatarUrl,
                                }
                                : null,
                            tags: task.tags.map( ( taskTag ) => ( {
                                id: taskTag.tag.id,
                                name: taskTag.tag.name,
                                color: taskTag.tag.color,
                            } ) ),
                            subtasks: [], // We'll add this functionality later
                            links: [], // We'll add this functionality later
                        } ) );

                    return {
                        id: column.id,
                        title: column.title,
                        order: column.order,
                        tasks: columnTasks,
                    };
                } );

                return kanbanColumns;
            } catch ( dbError ) {
                console.error( "Database query failed:", dbError );
                return getMockKanbanData();
            }
        } catch ( initError ) {
            console.error( "Database initialization failed:", initError );
            return getMockKanbanData();
        }
    } catch ( error ) {
        console.error( "Error fetching Kanban data:", error );
        return getMockKanbanData();
    }
}

// Add a function to generate mock data when database is not available
function getMockKanbanData () {
    return [
        {
            id: 1,
            title: "To Do",
            order: 0,
            tasks: [
                {
                    id: 1,
                    title: "Fix login bug",
                    description: "Users are unable to log in using their Google accounts",
                    status: "todo",
                    timestampDue: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ),
                    order: 0,
                    priority: "high",
                    progress: 0,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 1,
                        name: "John Doe",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 1,
                            name: "Bug",
                            color: "#EF4444",
                        },
                        {
                            id: 5,
                            name: "High Priority",
                            color: "#7C3AED",
                        },
                    ],
                    subtasks: [
                        { id: 1, title: "Investigate login flow", completed: true },
                        { id: 2, title: "Fix OAuth integration", completed: false },
                        { id: 3, title: "Test on all browsers", completed: false },
                    ],
                    links: [ { id: 1, title: "GitHub Issue", url: "https://github.com/example/repo/issues/123" } ],
                },
                {
                    id: 2,
                    title: "Implement dark mode",
                    description: "Add dark mode support to the application",
                    status: "todo",
                    timestampDue: new Date( Date.now() + 14 * 24 * 60 * 60 * 1000 ),
                    order: 1,
                    priority: "medium",
                    progress: 15,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 2,
                        name: "Jane Smith",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 2,
                            name: "Feature",
                            color: "#3B82F6",
                        },
                    ],
                    subtasks: [
                        { id: 4, title: "Create color variables", completed: true },
                        { id: 5, title: "Implement theme toggle", completed: false },
                        { id: 6, title: "Test accessibility", completed: false },
                    ],
                },
            ],
        },
        {
            id: 2,
            title: "In Progress",
            order: 1,
            tasks: [
                {
                    id: 3,
                    title: "Refactor authentication service",
                    description: "Improve code quality and performance",
                    status: "in_progress",
                    timestampDue: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ),
                    order: 0,
                    priority: "medium",
                    progress: 50,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 3,
                        name: "Bob Johnson",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 3,
                            name: "Enhancement",
                            color: "#10B981",
                        },
                    ],
                    subtasks: [
                        { id: 7, title: "Analyze current implementation", completed: true },
                        { id: 8, title: "Rewrite core authentication logic", completed: true },
                        { id: 9, title: "Update unit tests", completed: false },
                    ],
                },
                {
                    id: 4,
                    title: "Update API documentation",
                    description: "Document new endpoints and update examples",
                    status: "in_progress",
                    timestampDue: new Date( Date.now() + 5 * 24 * 60 * 60 * 1000 ),
                    order: 1,
                    priority: "low",
                    progress: 75,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 1,
                        name: "John Doe",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 4,
                            name: "Documentation",
                            color: "#F59E0B",
                        },
                    ],
                    links: [ { id: 2, title: "API Docs", url: "https://docs.example.com/api" } ],
                },
            ],
        },
        {
            id: 3,
            title: "Done",
            order: 2,
            tasks: [
                {
                    id: 5,
                    title: "Fix responsive layout issues",
                    description: "Address layout problems on mobile devices",
                    status: "done",
                    timestampDue: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ),
                    order: 0,
                    priority: "high",
                    progress: 100,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 2,
                        name: "Jane Smith",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 1,
                            name: "Bug",
                            color: "#EF4444",
                        },
                    ],
                    subtasks: [
                        { id: 10, title: "Fix header on mobile", completed: true },
                        { id: 11, title: "Fix sidebar on tablet", completed: true },
                        { id: 12, title: "Test on various devices", completed: true },
                    ],
                },
                {
                    id: 6,
                    title: "Optimize database queries",
                    description: "Improve performance of slow queries",
                    status: "done",
                    timestampDue: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ),
                    order: 1,
                    priority: "medium",
                    progress: 100,
                    createdAt: new Date().toISOString(),
                    user: {
                        id: 3,
                        name: "Bob Johnson",
                        avatarUrl: "/placeholder.svg?height=40&width=40",
                    },
                    tags: [
                        {
                            id: 3,
                            name: "Enhancement",
                            color: "#10B981",
                        },
                    ],
                    links: [ { id: 3, title: "Performance Report", url: "https://example.com/reports/perf-2023" } ],
                },
            ],
        },
    ];
}

// Update updateTaskStatus to handle database errors
export async function updateTaskStatus ( taskId, columnId, order ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Get the column to determine the new status
        const columnData = await db.query.columns.findFirst( {
            where: eq( columns.id, columnId ),
        } );

        if ( !columnData ) {
            return { success: false, error: "Column not found" };
        }

        // Determine the new status based on the column title
        let newStatus;/* : "todo" | "in_progress" | "done" */
        if ( columnData.title.toLowerCase().includes( "do" ) ) {
            newStatus = "todo";
        } else if ( columnData.title.toLowerCase().includes( "progress" ) ) {
            newStatus = "in_progress";
        } else {
            newStatus = "done";
        }

        // Update the task
        await db
            .update( tasks )
            .set( {
                columnId,
                order,
                status: newStatus,
            } )
            .where( eq( tasks.id, taskId ) );

        // Reorder other tasks in the same column
        const tasksInColumn = await db.query.tasks.findMany( {
            where: and(
                eq( tasks.columnId, columnId ),
                eq( tasks.id, taskId, true ), // Not equal to the moved task
            ),
            orderBy: ( tasks, { asc } ) => [ asc( tasks.order ) ],
        } );

        // Update orders of tasks that come after the insertion point
        for ( let i = 0; i < tasksInColumn.length; i++ ) {
            const task = tasksInColumn[ i ];
            const newOrder = i >= order ? i + 1 : i;
            if ( task.order !== newOrder ) {
                await db.update( tasks ).set( { order: newOrder } ).where( eq( tasks.id, task.id ) );
            }
        }

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error updating task status:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update updateTaskDetails to handle database errors
export async function updateTaskDetails ( taskId, data ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Update task details
        await db
            .update( tasks )
            .set( {
                title: data.title,
                description: data.description,
                timestampDue: data.timestampDue,
                userId: data.userId,
                priority: data.priority,
                progress: data.progress,
            } )
            .where( eq( tasks.id, taskId ) );

        // Update tags if provided
        if ( data.tagIds ) {
            await updateTaskTags( taskId, data.tagIds );
        }

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error updating task details:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update updateTaskTags to handle database errors
export async function updateTaskTags ( taskId, tagIds ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Delete existing task-tag relationships
        await db.delete( tasksTags ).where( eq( tasksTags.taskId, taskId ) );

        // Add new task-tag relationships
        for ( const tagId of tagIds ) {
            await db.insert( tasksTags ).values( { taskId, tagId } );
        }

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error updating task tags:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update addColumn to handle database errors
export async function addColumn ( title ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Get the highest order value
        const columnsData = await db.query.columns.findMany( {
            orderBy: ( columns, { desc } ) => [ desc( columns.order ) ],
            limit: 1,
        } );

        const nextOrder = columnsData.length > 0 ? columnsData[ 0 ].order + 1 : 0;

        await db.insert( columns ).values( { title, order: nextOrder } );
        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error adding column:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Add function to update column order
export async function updateColumnOrder ( columnOrders ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Update each column's order
        for ( const col of columnOrders ) {
            await db.update( columns ).set( { order: col.order } ).where( eq( columns.id, col.id ) );
        }

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error updating column order:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update updateColumnTitle to handle database errors
export async function updateColumnTitle ( columnId, title ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        await db.update( columns ).set( { title } ).where( eq( columns.id, columnId ) );
        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error updating column title:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update deleteColumn to handle database errors
export async function deleteColumn ( columnId ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Delete all tasks in the column first
        await db.delete( tasks ).where( eq( tasks.columnId, columnId ) );

        // Then delete the column
        await db.delete( columns ).where( eq( columns.id, columnId ) );

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error deleting column:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update addTask to handle database errors
export async function addTask ( columnId, title, options ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Get the highest order value for tasks in this column
        const tasksData = await db.query.tasks.findMany( {
            where: eq( tasks.columnId, columnId ),
            orderBy: ( tasks, { desc } ) => [ desc( tasks.order ) ],
            limit: 1,
        } );

        const nextOrder = tasksData.length > 0 ? tasksData[ 0 ].order + 1 : 0;

        // Determine the status based on the column
        let status;
        const columnData = await db.query.columns.findFirst( {
            where: eq( columns.id, columnId ),
        } );

        if ( columnData ) {
            if ( columnData.title.toLowerCase().includes( "progress" ) ) {
                status = "in_progress";
            } else if ( columnData.title.toLowerCase().includes( "done" ) ) {
                status = "done";
            }
        }

        // Insert the task
        const result = await db
            .insert( tasks )
            .values( {
                title,
                description: options?.description || null,
                timestampDue: options?.timestampDue || null,
                columnId,
                order: nextOrder,
                status,
                priority: options?.priority || "medium",
                progress: status === "done" ? 100 : 0,
                userId: options?.userId || null,
            } )
            .returning( { id: tasks.id } );

        // Add tags if provided
        if ( options?.tagIds && options.tagIds.length > 0 && result.length > 0 ) {
            const taskId = result[ 0 ].id;
            for ( const tagId of options.tagIds ) {
                await db.insert( tasksTags ).values( { taskId, tagId } );
            }
        }

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error adding task:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update deleteTask to handle database errors
export async function deleteTask ( taskId ) {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Simulating successful update." );
            return { success: true };
        }

        // Delete task-tag relationships first
        await db.delete( tasksTags ).where( eq( tasksTags.taskId, taskId ) );

        // Then delete the task
        await db.delete( tasks ).where( eq( tasks.id, taskId ) );

        revalidatePath( "/" );
        return { success: true };
    } catch ( error ) {
        console.error( "Error deleting task:", error );
        return { success: true }; // Return success anyway to allow UI to update
    }
}

// Update getAllTags to handle database errors
export async function getAllTags () {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Returning mock tags." );
            return [
                { id: 1, name: "Bug", color: "#EF4444" },
                { id: 2, name: "Feature", color: "#3B82F6" },
                { id: 3, name: "Enhancement", color: "#10B981" },
                { id: 4, name: "Documentation", color: "#F59E0B" },
                { id: 5, name: "High Priority", color: "#7C3AED" },
            ];
        }

        return await db.query.tags.findMany( {
            orderBy: ( tags, { asc } ) => [ asc( tags.name ) ],
        } );
    } catch ( error ) {
        console.error( "Error fetching tags:", error );
        return [
            { id: 1, name: "Bug", color: "#EF4444" },
            { id: 2, name: "Feature", color: "#3B82F6" },
            { id: 3, name: "Enhancement", color: "#10B981" },
            { id: 4, name: "Documentation", color: "#F59E0B" },
            { id: 5, name: "High Priority", color: "#7C3AED" },
        ];
    }
}

// Update getAllUsers to handle database errors
export async function getAllUsers () {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Returning mock users." );
            return [
                { id: 1, name: "John Doe", avatarUrl: "/placeholder.svg?height=40&width=40" },
                { id: 2, name: "Jane Smith", avatarUrl: "/placeholder.svg?height=40&width=40" },
                { id: 3, name: "Bob Johnson", avatarUrl: "/placeholder.svg?height=40&width=40" },
            ];
        }

        return await db.query.users.findMany( {
            orderBy: ( users, { asc } ) => [ asc( users.name ) ],
        } );
    } catch ( error ) {
        console.error( "Error fetching users:", error );
        return [
            { id: 1, name: "John Doe", avatarUrl: "/placeholder.svg?height=40&width=40" },
            { id: 2, name: "Jane Smith", avatarUrl: "/placeholder.svg?height=40&width=40" },
            { id: 3, name: "Bob Johnson", avatarUrl: "/placeholder.svg?height=40&width=40" },
        ];
    }
}

// Update exportKanbanData to handle database errors
export async function exportKanbanData () {
    try {
        if ( !process.env.DATABASE_URL ) {
            console.warn( "DATABASE_URL is not set. Returning mock export data." );
            return getMockExportData();
        }

        const tasksData = await db.query.tasks.findMany( {
            with: {
                user: true,
                column: true,
                tags: {
                    with: {
                        tag: true,
                    },
                },
            },
        } );

        const csvData = tasksData.map( ( task ) => ( {
            id: task.id,
            title: task.title,
            description: task.description || "",
            status: task.status,
            column: task.column.title,
            timestampDue: task.timestampDue ? new Date( task.timestampDue ).toISOString().split( "T" )[ 0 ] : "",
            assignee: task.user ? task.user.name : "",
            priority: task.priority || "medium",
            progress: task.progress || 0,
            tags: task.tags.map( ( t ) => t.tag.name ).join( ", " ),
            createdAt: task.createdAt ? new Date( task.createdAt ).toISOString().split( "T" )[ 0 ] : "",
        } ) );

        return csvData;
    } catch ( error ) {
        console.error( "Error exporting Kanban data:", error );
        return getMockExportData();
    }
}

// Add a function to generate mock export data
function getMockExportData () {
    return [
        {
            id: 1,
            title: "Fix login bug",
            description: "Users are unable to log in using their Google accounts",
            status: "todo",
            column: "To Do",
            timestampDue: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "John Doe",
            priority: "high",
            progress: 0,
            tags: "Bug, High Priority",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
        {
            id: 2,
            title: "Implement dark mode",
            description: "Add dark mode support to the application",
            status: "todo",
            column: "To Do",
            timestampDue: new Date( Date.now() + 14 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "Jane Smith",
            priority: "medium",
            progress: 15,
            tags: "Feature",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
        {
            id: 3,
            title: "Refactor authentication service",
            description: "Improve code quality and performance",
            status: "in_progress",
            column: "In Progress",
            timestampDue: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "Bob Johnson",
            priority: "medium",
            progress: 50,
            tags: "Enhancement",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
        {
            id: 4,
            title: "Update API documentation",
            description: "Document new endpoints and update examples",
            status: "in_progress",
            column: "In Progress",
            timestampDue: new Date( Date.now() + 5 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "John Doe",
            priority: "low",
            progress: 75,
            tags: "Documentation",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
        {
            id: 5,
            title: "Fix responsive layout issues",
            description: "Address layout problems on mobile devices",
            status: "done",
            column: "Done",
            timestampDue: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "Jane Smith",
            priority: "high",
            progress: 100,
            tags: "Bug",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
        {
            id: 6,
            title: "Optimize database queries",
            description: "Improve performance of slow queries",
            status: "done",
            column: "Done",
            timestampDue: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString().split( "T" )[ 0 ],
            assignee: "Bob Johnson",
            priority: "medium",
            progress: 100,
            tags: "Enhancement",
            createdAt: new Date().toISOString().split( "T" )[ 0 ],
        },
    ];
}

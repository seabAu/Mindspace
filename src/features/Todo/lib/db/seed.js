/* import { db } from "./index"
import { users, columns, tasks, tags, tasksTags } from "./schema"
import { initDatabase } from "./init"

export async function seed () {
    try {
        // Initialize database first
        const initialized = await initDatabase()
        if ( !initialized ) {
            throw new Error( "Failed to initialize database" )
        }

        // Check if data already exists
        const existingColumns = await db.query.columns.findMany()
        if ( existingColumns.length > 0 ) {
            console.log( "Database already seeded" )
            return
        }

        // Create users
        const usersData = [
            { name: "John Doe", email: "john@example.com", avatarUrl: "/placeholder.svg?height=40&width=40" },
            { name: "Jane Smith", email: "jane@example.com", avatarUrl: "/placeholder.svg?height=40&width=40" },
            { name: "Bob Johnson", email: "bob@example.com", avatarUrl: "/placeholder.svg?height=40&width=40" },
        ]

        for ( const user of usersData ) {
            await db.insert( users ).values( user )
        }

        // Create columns
        const columnsData = [
            { title: "To Do", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Done", order: 2 },
        ]

        for ( const column of columnsData ) {
            await db.insert( columns ).values( column )
        }

        // Get created users and columns
        const createdUsers = await db.query.users.findMany()
        const createdColumns = await db.query.columns.findMany()

        // Create tags
        const tagsData = [
            { name: "Bug", color: "#EF4444" },
            { name: "Feature", color: "#3B82F6" },
            { name: "Enhancement", color: "#10B981" },
            { name: "Documentation", color: "#F59E0B" },
            { name: "High Priority", color: "#7C3AED" },
        ]

        for ( const tag of tagsData ) {
            await db.insert( tags ).values( tag )
        }

        const createdTags = await db.query.tags.findMany()

        // Create tasks
        const tasksData = [
            {
                title: "Fix login bug",
                description: "Users are unable to log in using their Google accounts",
                status: "todo",
                dueDate: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ), // 7 days from now
                userId: createdUsers[ 0 ].id,
                columnId: createdColumns[ 0 ].id,
                order: 0,
            },
            {
                title: "Implement dark mode",
                description: "Add dark mode support to the application",
                status: "todo",
                dueDate: new Date( Date.now() + 14 * 24 * 60 * 60 * 1000 ), // 14 days from now
                userId: createdUsers[ 1 ].id,
                columnId: createdColumns[ 0 ].id,
                order: 1,
            },
            {
                title: "Refactor authentication service",
                description: "Improve code quality and performance",
                status: "in_progress",
                dueDate: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ), // 3 days from now
                userId: createdUsers[ 2 ].id,
                columnId: createdColumns[ 1 ].id,
                order: 0,
            },
            {
                title: "Update API documentation",
                description: "Document new endpoints and update examples",
                status: "in_progress",
                dueDate: new Date( Date.now() + 5 * 24 * 60 * 60 * 1000 ), // 5 days from now
                userId: createdUsers[ 0 ].id,
                columnId: createdColumns[ 1 ].id,
                order: 1,
            },
            {
                title: "Fix responsive layout issues",
                description: "Address layout problems on mobile devices",
                status: "done",
                dueDate: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ), // 2 days ago
                userId: createdUsers[ 1 ].id,
                columnId: createdColumns[ 2 ].id,
                order: 0,
            },
            {
                title: "Optimize database queries",
                description: "Improve performance of slow queries",
                status: "done",
                dueDate: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ), // 5 days ago
                userId: createdUsers[ 2 ].id,
                columnId: createdColumns[ 2 ].id,
                order: 1,
            },
        ]

        for ( const task of tasksData ) {
            await db.insert( tasks ).values( task )
        }

        // Get created tasks
        const createdTasks = await db.query.tasks.findMany()

        // Assign tags to tasks
        const tasksTagsData = [
            { taskId: createdTasks[ 0 ].id, tagId: createdTags[ 0 ].id }, // Bug tag for login bug
            { taskId: createdTasks[ 0 ].id, tagId: createdTags[ 4 ].id }, // High Priority for login bug
            { taskId: createdTasks[ 1 ].id, tagId: createdTags[ 1 ].id }, // Feature for dark mode
            { taskId: createdTasks[ 2 ].id, tagId: createdTags[ 2 ].id }, // Enhancement for refactor
            { taskId: createdTasks[ 3 ].id, tagId: createdTags[ 3 ].id }, // Documentation for API docs
            { taskId: createdTasks[ 4 ].id, tagId: createdTags[ 0 ].id }, // Bug for layout issues
            { taskId: createdTasks[ 5 ].id, tagId: createdTags[ 2 ].id }, // Enhancement for DB optimization
        ]

        for ( const taskTag of tasksTagsData ) {
            await db.insert( tasksTags ).values( taskTag )
        }

        console.log( "Database seeded successfully" )
    } catch ( error ) {
        console.error( "Error seeding database:", error )
        throw error
    }
}
 */
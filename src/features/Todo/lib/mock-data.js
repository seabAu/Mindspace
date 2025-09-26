// import type { KanbanColumn, KanbanTask } from "@/lib/types"
import { caseCamelToSentence } from '@/lib/utilities/string';
import { Value } from '@radix-ui/react-select';
import * as utils from 'akashatools';

// Generate a large array of dummy tasks
export function getMockKanbanData () {
    // const { tasksData, setTasksData } = useTasksStore();

    // Create users
    const users = [
        { id: 1, name: "John Doe", avatarUrl: "/placeholder.svg?height=40&width=40" },
        { id: 2, name: "Jane Smith", avatarUrl: "/placeholder.svg?height=40&width=40" },
        { id: 3, name: "Bob Johnson", avatarUrl: "/placeholder.svg?height=40&width=40" },
        { id: 4, name: "Alice Williams", avatarUrl: "/placeholder.svg?height=40&width=40" },
        { id: 5, name: "David Brown", avatarUrl: "/placeholder.svg?height=40&width=40" },
    ];

    // Create tags
    const tags = [
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
    ];

    // Create tasks
    const todoTasks = [
        {
            id: 1,
            title: "Fix login authentication bug",
            description:
                "Users are unable to log in using their Google accounts. Need to investigate the OAuth flow and fix the integration.",
            status: "todo",
            timestampDue: new Date( Date.now() + 2 * 24 * 60 * 60 * 1000 ), // 2 days from now
            order: 0,
            priority: "high",
            difficulty: "medium",
            progress: 0,
            createdAt: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 0 ], tags[ 4 ], tags[ 5 ] ],
            subtaskIds: [
                { id: 101, title: "Investigate OAuth flow", completed: true },
                { id: 102, title: "Fix token validation", completed: false },
                { id: 103, title: "Test on all browsers", completed: false },
            ],
            links: [ { id: 1, title: "GitHub Issue #123", url: "https://github.com/example/repo/issues/123" } ],
            isCompleted: false,
            isPinned: true,
            todoListId: 1,
        },
        {
            id: 2,
            title: "Implement dark mode",
            description:
                "Add dark mode support to the application. Create a theme toggle and ensure all components support both light and dark themes.",
            status: "todo",
            timestampDue: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ), // 7 days from now
            order: 1,
            priority: "medium",
            difficulty: "medium",
            progress: 15,
            createdAt: new Date( Date.now() - 3 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 1 ],
            tags: [ tags[ 2 ], tags[ 6 ] ],
            subtaskIds: [
                { id: 104, title: "Create color variables", completed: true },
                { id: 105, title: "Implement theme toggle", completed: false },
                { id: 106, title: "Test accessibility", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 3,
            title: "Design new landing page",
            description:
                "Create a new design for the landing page that highlights our key features and improves conversion rates.",
            status: "todo",
            timestampDue: new Date( Date.now() + 10 * 24 * 60 * 60 * 1000 ), // 10 days from now
            order: 2,
            priority: "medium",
            difficulty: "high",
            progress: 0,
            createdAt: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 4 ],
            tags: [ tags[ 9 ], tags[ 6 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 4,
            title: "Research competitor pricing",
            description:
                "Analyze competitor pricing strategies and prepare a report with recommendations for our pricing model.",
            status: "todo",
            timestampDue: new Date( Date.now() + 5 * 24 * 60 * 60 * 1000 ), // 5 days from now
            order: 3,
            priority: "low",
            difficulty: "medium",
            progress: 0,
            createdAt: new Date( Date.now() - 1 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 3 ],
            tags: [ tags[ 8 ] ],
            subtaskIds: [
                { id: 107, title: "Identify top 5 competitors", completed: true },
                { id: 108, title: "Gather pricing data", completed: false },
                { id: 109, title: "Analyze pricing models", completed: false },
                { id: 110, title: "Prepare recommendations", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 5,
            title: "Set up CI/CD pipeline",
            description: "Configure continuous integration and deployment pipeline using GitHub Actions.",
            status: "todo",
            timestampDue: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ), // 3 days from now
            order: 4,
            priority: "medium",
            difficulty: "high",
            progress: 0,
            createdAt: new Date( Date.now() - 4 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 5 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 6,
            title: "Write API documentation",
            description: "Create comprehensive documentation for our REST API endpoints.",
            status: "todo",
            timestampDue: new Date( Date.now() + 14 * 24 * 60 * 60 * 1000 ), // 14 days from now
            order: 5,
            priority: "low",
            difficulty: "medium",
            progress: 0,
            createdAt: new Date( Date.now() - 6 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 3 ], tags[ 5 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 7,
            title: "Create onboarding tutorial",
            description: "Design and implement an interactive onboarding tutorial for new users.",
            status: "todo",
            timestampDue: new Date( Date.now() + 20 * 24 * 60 * 60 * 1000 ), // 20 days from now
            order: 6,
            priority: "medium",
            difficulty: "medium",
            progress: 0,
            createdAt: new Date( Date.now() - 7 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 1 ],
            tags: [ tags[ 6 ], tags[ 9 ] ],
            subtaskIds: [
                { id: 111, title: "Design tutorial flow", completed: false },
                { id: 112, title: "Create tutorial content", completed: false },
                { id: 113, title: "Implement UI components", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 8,
            title: "Optimize database queries",
            description: "Identify and optimize slow database queries to improve application performance.",
            status: "todo",
            timestampDue: new Date( Date.now() + 4 * 24 * 60 * 60 * 1000 ), // 4 days from now
            order: 7,
            priority: "high",
            difficulty: "high",
            progress: 0,
            createdAt: new Date( Date.now() - 8 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 5 ], tags[ 4 ] ],
            isCompleted: false,
            isPinned: true,
            todoListId: 1,
        },
        {
            id: 9,
            title: "Implement user feedback form",
            description: "Create a form for collecting user feedback and store responses in the database.",
            status: "todo",
            timestampDue: new Date( Date.now() + 6 * 24 * 60 * 60 * 1000 ), // 6 days from now
            order: 8,
            priority: "low",
            difficulty: "low",
            progress: 0,
            createdAt: new Date( Date.now() - 9 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 3 ],
            tags: [ tags[ 6 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
    ];

    const inProgressTasks = [
        {
            id: 10,
            title: "Refactor authentication service",
            description: "Improve code quality and performance of the authentication service.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ), // 3 days from now
            order: 0,
            priority: "high",
            difficulty: "high",
            progress: 50,
            createdAt: new Date( Date.now() - 10 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 2 ], tags[ 5 ] ],
            subtaskIds: [
                { id: 114, title: "Analyze current implementation", completed: true },
                { id: 115, title: "Rewrite core authentication logic", completed: true },
                { id: 116, title: "Update unit tests", completed: false },
                { id: 117, title: "Benchmark performance", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 11,
            title: "Implement file upload feature",
            description: "Add support for file uploads, including validation, storage, and retrieval.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 5 * 24 * 60 * 60 * 1000 ), // 5 days from now
            order: 1,
            priority: "medium",
            difficulty: "medium",
            progress: 35,
            createdAt: new Date( Date.now() - 11 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 1 ], tags[ 5 ], tags[ 6 ] ],
            subtaskIds: [
                { id: 118, title: "Design API endpoints", completed: true },
                { id: 119, title: "Implement file validation", completed: true },
                { id: 120, title: "Set up cloud storage", completed: false },
                { id: 121, title: "Create UI components", completed: false },
            ],
            isCompleted: false,
            isPinned: true,
            todoListId: 1,
        },
        {
            id: 12,
            title: "Update API documentation",
            description: "Document new endpoints and update examples in the API documentation.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 2 * 24 * 60 * 60 * 1000 ), // 2 days from now
            order: 2,
            priority: "low",
            difficulty: "low",
            progress: 75,
            createdAt: new Date( Date.now() - 12 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 1 ],
            tags: [ tags[ 3 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 13,
            title: "Implement data visualization dashboard",
            description: "Create interactive charts and graphs for the analytics dashboard.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ), // 7 days from now
            order: 3,
            priority: "medium",
            difficulty: "high",
            progress: 40,
            createdAt: new Date( Date.now() - 13 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 3 ],
            tags: [ tags[ 6 ], tags[ 9 ] ],
            subtaskIds: [
                { id: 122, title: "Select visualization library", completed: true },
                { id: 123, title: "Design dashboard layout", completed: true },
                { id: 124, title: "Implement data fetching", completed: true },
                { id: 125, title: "Create chart components", completed: false },
                { id: 126, title: "Add interactivity", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 14,
            title: "Improve mobile responsiveness",
            description: "Fix layout issues and improve user experience on mobile devices.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 4 * 24 * 60 * 60 * 1000 ), // 4 days from now
            order: 4,
            priority: "high",
            difficulty: "medium",
            progress: 60,
            createdAt: new Date( Date.now() - 14 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 4 ],
            tags: [ tags[ 6 ], tags[ 2 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 15,
            title: "Implement user roles and permissions",
            description: "Add role-based access control to the application.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 8 * 24 * 60 * 60 * 1000 ), // 8 days from now
            order: 5,
            priority: "high",
            difficulty: "high",
            progress: 25,
            createdAt: new Date( Date.now() - 15 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 5 ], tags[ 1 ] ],
            subtaskIds: [
                { id: 127, title: "Define role hierarchy", completed: true },
                { id: 128, title: "Implement permission checks", completed: false },
                { id: 129, title: "Create role management UI", completed: false },
            ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 16,
            title: "Write unit tests for core modules",
            description: "Increase test coverage for core application modules.",
            status: "in_progress",
            timestampDue: new Date( Date.now() + 6 * 24 * 60 * 60 * 1000 ), // 6 days from now
            order: 6,
            priority: "medium",
            difficulty: "medium",
            progress: 45,
            createdAt: new Date( Date.now() - 16 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 7 ] ],
            isCompleted: false,
            isPinned: false,
            todoListId: 1,
        },
    ];

    const doneTasks = [
        {
            id: 17,
            title: "Fix responsive layout issues",
            description: "Address layout problems on mobile devices.",
            status: "done",
            timestampDue: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ), // 2 days ago
            order: 0,
            priority: "high",
            difficulty: "medium",
            progress: 100,
            createdAt: new Date( Date.now() - 17 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 1 ],
            tags: [ tags[ 0 ], tags[ 6 ] ],
            subtaskIds: [
                { id: 130, title: "Fix header on mobile", completed: true },
                { id: 131, title: "Fix sidebar on tablet", completed: true },
                { id: 132, title: "Test on various devices", completed: true },
            ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 18,
            title: "Optimize database queries",
            description: "Improve performance of slow queries.",
            status: "done",
            timestampDue: new Date( Date.now() - 5 * 24 * 60 * 60 * 1000 ), // 5 days ago
            order: 1,
            priority: "medium",
            difficulty: "high",
            progress: 100,
            createdAt: new Date( Date.now() - 18 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 2 ], tags[ 5 ] ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 19,
            title: "Implement user authentication",
            description: "Add user registration, login, and password reset functionality.",
            status: "done",
            timestampDue: new Date( Date.now() - 10 * 24 * 60 * 60 * 1000 ), // 10 days ago
            order: 2,
            priority: "high",
            difficulty: "high",
            progress: 100,
            createdAt: new Date( Date.now() - 25 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 1 ], tags[ 5 ] ],
            subtaskIds: [
                { id: 133, title: "Implement registration", completed: true },
                { id: 134, title: "Implement login", completed: true },
                { id: 135, title: "Implement password reset", completed: true },
                { id: 136, title: "Add email verification", completed: true },
            ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 20,
            title: "Create landing page design",
            description: "Design the landing page for the marketing website.",
            status: "done",
            timestampDue: new Date( Date.now() - 15 * 24 * 60 * 60 * 1000 ), // 15 days ago
            order: 3,
            priority: "medium",
            difficulty: "medium",
            progress: 100,
            createdAt: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 4 ],
            tags: [ tags[ 9 ] ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 21,
            title: "Set up analytics tracking",
            description: "Implement Google Analytics and event tracking.",
            status: "done",
            timestampDue: new Date( Date.now() - 7 * 24 * 60 * 60 * 1000 ), // 7 days ago
            order: 4,
            priority: "low",
            difficulty: "low",
            progress: 100,
            createdAt: new Date( Date.now() - 20 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 3 ],
            tags: [ tags[ 6 ] ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 22,
            title: "Implement payment integration",
            description: "Integrate Stripe for payment processing.",
            status: "done",
            timestampDue: new Date( Date.now() - 20 * 24 * 60 * 60 * 1000 ), // 20 days ago
            order: 5,
            priority: "high",
            difficulty: "high",
            progress: 100,
            createdAt: new Date( Date.now() - 35 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 2 ],
            tags: [ tags[ 5 ], tags[ 1 ] ],
            subtaskIds: [
                { id: 137, title: "Set up Stripe account", completed: true },
                { id: 138, title: "Implement payment API", completed: true },
                { id: 139, title: "Create checkout UI", completed: true },
                { id: 140, title: "Test payment flow", completed: true },
            ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 23,
            title: "Create user onboarding flow",
            description: "Design and implement the onboarding experience for new users.",
            status: "done",
            timestampDue: new Date( Date.now() - 12 * 24 * 60 * 60 * 1000 ), // 12 days ago
            order: 6,
            priority: "medium",
            difficulty: "medium",
            progress: 100,
            createdAt: new Date( Date.now() - 22 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 1 ],
            tags: [ tags[ 6 ], tags[ 9 ] ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 24,
            title: "Implement email notifications",
            description: "Set up email templates and notification system.",
            status: "done",
            timestampDue: new Date( Date.now() - 8 * 24 * 60 * 60 * 1000 ), // 8 days ago
            order: 7,
            priority: "low",
            difficulty: "medium",
            progress: 100,
            createdAt: new Date( Date.now() - 19 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 0 ],
            tags: [ tags[ 5 ] ],
            subtaskIds: [
                { id: 141, title: "Design email templates", completed: true },
                { id: 142, title: "Set up email service", completed: true },
                { id: 143, title: "Implement notification triggers", completed: true },
            ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
        {
            id: 25,
            title: "Create API documentation",
            description: "Document all API endpoints and usage examples.",
            status: "done",
            timestampDue: new Date( Date.now() - 25 * 24 * 60 * 60 * 1000 ), // 25 days ago
            order: 8,
            priority: "medium",
            difficulty: "low",
            progress: 100,
            createdAt: new Date( Date.now() - 40 * 24 * 60 * 60 * 1000 ).toISOString(),
            user: users[ 3 ],
            tags: [ tags[ 3 ] ],
            isCompleted: true,
            isPinned: false,
            todoListId: 1,
        },
    ];

    const groupByField = 'status';
    const buildTaskColumns = ( tasks ) => {
        // Given all tasks, sorts them out into specific groups, gives the group its title, id, color, and order.
        let cols = [];
        if ( utils.val.isValidArray( tasks, true ) ) {
            tasks.forEach( ( task, index ) => {
                // Check if this task's [groupByField] field is already in the cols array.

                const taskGroupValue = task?.[ groupByField ] ?? null;
                let col = cols?.find( ( c, i ) => ( c?.id === taskGroupValue ) );
                if ( col ) {
                    // Case where this col already exists in cols.
                    col = { ...col, tasks: [ ...col?.tasks, task ] };
                    cols = cols.map( ( c, i ) => ( c?.index === col?.index ? ( col ) : ( c ) ) );
                }
                else {
                    // Case where this col does not already exist in cols.
                    cols.push( {
                        id: task?.[ groupByField ],
                        title: caseCamelToSentence( task?.[ groupByField ] ),
                        order: index,
                        tasks: [ task ]
                    } );
                }
            } );
        }
    };

    // Create columns with tasks
    // return [
    //     {
    //         id: 1,
    //         title: "To Do",
    //         order: 0,
    //         tasks: todoTasks,
    //     },
    //     {
    //         id: 2,
    //         title: "In Progress",
    //         order: 1,
    //         tasks: inProgressTasks,
    //     },
    //     {
    //         id: 3,
    //         title: "Done",
    //         order: 2,
    //         tasks: doneTasks,
    //     },
    // ];

    return buildTaskColumns( [ ...todoTasks, ...inProgressTasks, ...doneTasks ] );
}

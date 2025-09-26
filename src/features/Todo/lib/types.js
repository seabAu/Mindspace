export const KanbanTask = {
    id: number,
    title: string,
    description: string | null,
    timestampDue: Date | null,
    order: number,
    status: "todo" | "in_progress" | "done",
    priority: "high" | "medium" | "low",
    difficulty: "high" | "medium" | "low",
    progress: number,
    createdAt: string,
    user: {
        id: number,
        name: string,
        avatarUrl: string | null,
    } | null,
    tags: {
        id: number,
        name: string,
        color: string,
    },
    subtasks: {
        id: number,
        title: string,
        completed: boolean,
    },
    links: {
        id: number,
        title: string,
        url: string,
    },
    parentId: number | null,
    isCompleted: boolean,
    isPinned: boolean,
    listId: number,
    notes: string,
    location: string,
    completeness: number,
    userId: number | null,
    categories: string,
    timestampDue: Date | null,
};

export const KanbanColumn = {
    id: number,
    title: string,
    order: number,
    tasks: KanbanTask,
};

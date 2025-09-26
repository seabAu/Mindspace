
const TodoListSchema = new Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
        },
        taskIds: [
            {
                // Array of tasks in this todoList.
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        goalIds: [
            {
                // Array of goals in this todoList.
                type: mongoose.Schema.Types.ObjectId,
                ref: "Goal",
            },
        ],
        index: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            trim: true,
            required: [ true, "A title must be provided." ],
            maxlength: [ 64, "name must be less than 100 characters" ],
        },
        description: {
            type: String,
            default: "",
        },
        categories: [
            {
                type: String,
            },
        ],
        tags: [
            {
                type: String,
            },
        ],
        filters: [
            {
                type: String,
            },
        ],
        icon: {
            type: String,
            default: "list",
        },
        bannerImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
)

// This would be used in a real backend
// export default mongoose.model('TodoList', TodoListSchema);

// For reference only in this frontend project
export { TodoListSchema }
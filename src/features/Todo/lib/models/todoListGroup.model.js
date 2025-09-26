
const TodoListGroupSchema = new Schema(
    {
        index: {
            type: Number,
            default: 0,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
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
                default: [],
            },
        ],
        tags: [
            {
                type: String,
                default: [],
            },
        ],
        filters: [
            {
                type: String,
                default: [],
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
// export default mongoose.model('TodoListGroup', TodoListGroupSchema);

// For reference only in this frontend project
export { TodoListGroupSchema }
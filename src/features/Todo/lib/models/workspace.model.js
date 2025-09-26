const WorkspaceSchema = new Schema(
    {
        name: {
            type: String,
            required: [ true, "A workspace name is required" ],
            trim: true,
            maxlength: [ 100, "Workspace name must be less than 100 characters" ],
        },
        description: {
            type: String,
            default: "",
            maxlength: [ 500, "Description must be less than 500 characters" ],
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                role: {
                    type: String,
                    enum: [ "admin", "editor", "viewer" ],
                    default: "viewer",
                },
            },
        ],
        todoListGroupIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TodoListGroup",
            },
        ],
        settings: {
            theme: {
                type: String,
                default: "light",
            },
            defaultView: {
                type: String,
                enum: [ "kanban", "list", "calendar", "table" ],
                default: "kanban",
            },
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
)

// This would be used in a real backend
// export default mongoose.model('Workspace', WorkspaceSchema);

// For reference only in this frontend project
export { WorkspaceSchema }

// Simplified RecurrenceRulesSchema for our frontend reference
const RecurrenceRulesSchema = new Schema( {
    frequency: {
        type: String,
        enum: [ "daily", "weekly", "monthly", "yearly" ],
        default: "daily",
    },
    interval: {
        type: Number,
        default: 1,
    },
    endDate: {
        type: Date,
    },
} )

// Simplified ReminderSchema for our frontend reference
const ReminderSchema = new Schema( {
    time: {
        type: Date,
        required: true,
    },
    notificationType: {
        type: String,
        enum: [ "email", "push", "both" ],
        default: "push",
    },
} )

// Simplified SettingSchema for our frontend reference
const SettingSchema = new Schema( {
    key: {
        type: String,
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
} )

const TaskSchema = new Schema(
    {
        index: {
            type: Number,
            default: 0,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        todoList: {
            // Parent todo-list containing this todo item.
            type: mongoose.Schema.Types.ObjectId,
            ref: "TodoList",
        },
        subtaskIds: [
            {
                // Array of subtasks.
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        parentTaskId: {
            // Task to whom this task is a subtask.
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
        groupId: {
            // Group within the todo list categorizing this todo item.
            type: mongoose.Schema.Types.ObjectId,
            ref: "TodoListGroup",
        },
        fileIds: [
            {
                // Array of notes attached / hyperlinked to this task.
                type: mongoose.Schema.Types.ObjectId,
                ref: "File",
            },
        ],
        parentFolderId: {
            // Folder optionally containing this task.
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
        },
        prerequisites: [
            {
                // Array of subtasks.
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        title: {
            type: String,
            required: [ true, "A title must be provided." ],
            maxlength: [ 128, "Title must be less than 128 characters" ],
            trim: true,
        },
        description: {
            type: String,
            maxlength: [ 2048, "Description must be less than 2048 characters" ],
            trim: true,
        },
        categories: [
            {
                type: String,
            },
        ],
        notes: [
            {
                // Array of notes - just string content.
                type: String,
                default: "",
            },
        ],
        // ENUMS //
        difficulty: {
            type: String,
            enum: {
                values: [ "none", "very low", "low", "medium", "high", "very high", "extreme", "?????" ],
                message: "{VALUE} is not supported",
            },
            default: "none",
            required: true,
        },
        priority: {
            type: String,
            enum: {
                values: [ "none", "low", "medium", "high", "urgent", "asap", "critical" ],
                message: "{VALUE} is not supported",
            },
            default: "none",
            required: true,
        },
        status: {
            type: String,
            enum: {
                values: [
                    "none",
                    "new",
                    "cancelled",
                    "postponed",
                    "waitingRequirements",
                    "incomplete",
                    "inProgress",
                    "completed",
                ],
                message: "{VALUE} is not supported",
            },
            default: "none",
            required: true,
        },
        completeness: {
            type: Number,
            default: 0,
            min: [ 0, "Must be equal to or more than 0, got {VALUE}" ],
            max: [ 100, "Must be equal to or less than 100, got {VALUE}" ],
        },

        // BOOLEANS //
        isPinned: {
            type: Boolean,
            default: false,
        },

        isRecurring: { type: Boolean, default: false },
        recurrenceRules: RecurrenceRulesSchema,
        reminderEnabled: { type: Boolean, default: false },
        reminders: [ ReminderSchema ],

        location: {
            type: String,
            default: "",
        },

        data: {
            // For containing any miscellaneous data inside this todo item.
            type: String,
            default: "",
        },
        settings: [ SettingSchema ],

        reminder: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
        inTrash: { type: Boolean, default: false },

        timestampDue: { type: Date, default: Date.now },
        timestampStarted: { type: Date, default: Date.now },
        timestampEstimated: { type: Date, default: Date.now },
        timestampCompleted: {
            type: Date,
            default: function () {
                if ( this.completed ) {
                    return Date.now()
                }
                return null
            },
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: {
            createdAt: "createdDate",
            updatedAt: "updatedDate",
        },
    },
)

// This would be used in a real backend
// export default mongoose.model('Task', TaskSchema);

// For reference only in this frontend project
export { TaskSchema }
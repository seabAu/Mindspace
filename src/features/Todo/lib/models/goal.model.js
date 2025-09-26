
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

const GoalSchema = new Schema(
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
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Task",
                },
                order: { type: Number, default: 0, index: { unique: true } },
                isConcurrent: { type: Boolean, default: false },
                isOnHold: { type: Boolean, default: false },
                startDate: { type: Date, required: true },
                dueDate: { type: Date, required: true },
            },
        ],
        label: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        category: { type: String, trim: true },
        tags: [ { type: String, trim: true } ],

        importance: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        dueDate: {
            type: Date,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },

        isRecurring: { type: Boolean, default: false },
        recurrenceRules: RecurrenceRulesSchema,

        reminderEnabled: { type: Boolean, default: false },
        reminders: [ ReminderSchema ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    },
)

// This would be used in a real backend
// export default mongoose.model('Goal', GoalSchema);

// For reference only in this frontend project
export { GoalSchema }
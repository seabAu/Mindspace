// As referenced in your models, this provides a centralized list of document types.

export const DATA_TYPE_CONFIG = {
    Event: {
        fetchUrl: "/api/app/planner",
        titleField: "title",
        fields: [
            { name: "title", label: "Title", type: "text", required: true, placeholder: "Event Title" },
            { name: "start", label: "Date & Time", type: "datetime-local", required: true },
            { name: "end", label: "Date & Time", type: "datetime-local", required: false },
            { name: "duration", label: "Duration", type: "text", placeholder: "e.g., 1 hour" },
        ],
    },
    Task: {
        fetchUrl: "/api/app/task",
        titleField: "title",
        fields: [
            { name: "title", label: "Title", type: "text", required: true, placeholder: "Todo Title" },
            { name: "deadline", label: "Deadline", type: "datetime-local", required: true },
        ],
    },
    Goal: {
        fetchUrl: "/api/app/task/goals",
        titleField: "title",
        fields: [
            { name: "title", label: "Title", type: "text", required: true, placeholder: "Goal Title" },
            { name: "targetDate", label: "Target Date", type: "date", required: true },
        ],
    },
};

export const RULE_TYPES = [
    { value: "onDay", label: "On Specific Day(s) of Week" },
    { value: "every", label: "Every X Interval" },
];

export const DAYS_OF_WEEK = [
    { value: "sun", label: "Sunday" },
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thurs", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
];

export const INTERVAL_UNITS = [
    { value: "minute", label: "Minute(s)" },
    { value: "hour", label: "Hour(s)" },
    { value: "day", label: "Day(s)" },
    { value: "week", label: "Week(s)" },
    { value: "month", label: "Month(s)" },
    { value: "year", label: "Year(s)" },
];

export const NOTIFICATION_TYPES = [
    { value: "none", label: "None" },
    { value: "toast", label: "Toast (In-App)" },
    { value: "sms", label: "SMS Text Message" },
    { value: "email", label: "Email" },
    { value: "alert", label: "System Alert" },
    { value: "push", label: "Push Notification" },
];

export const REMINDER_DOC_TYPES = [
    { value: "Task", label: "Task", type: 'task' },
    { value: "Goal", label: "Goal", type: 'goal' },
    { value: "Day", label: "Day", type: 'day' },
    { value: "Event", label: "Event", type: 'event' },
    { value: "Custom", label: "Custom", type: 'custom' },
];

// export const REMINDER_DOC_TYPES = [ "Task", "Goal", "Day", "Event", "Custom" ];
export const DEFAULT_TIMEZONE = "UTC"



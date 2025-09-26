import * as utils from 'akashatools';
import { daysInMonth } from "@/lib/utilities/time";
import { getDaysInMonth } from 'date-fns';

// export const SIDEBAR_WIDTH_LEFT_MOBILE = `10rem`;
// export const SIDEBAR_WIDTH_RIGHT_MOBILE = `12rem`;
// export const SIDEBAR_WIDTH_LEFT = "14rem";
// export const SIDEBAR_WIDTH_RIGHT = "16rem";
// export const SIDEBAR_WIDTH_ICON = "3rem";
export const SIDEBAR_WIDTH_LEFT_MOBILE = 10;
export const SIDEBAR_WIDTH_RIGHT_MOBILE = 12;
export const SIDEBAR_WIDTH_LEFT = 14;
export const SIDEBAR_WIDTH_RIGHT = 24;
export const SIDEBAR_WIDTH_RIGHT_MINI = 18;
export const SIDEBAR_WIDTH_LEFT_ICON = 2.5;
export const SIDEBAR_WIDTH_RIGHT_ICON = 2.5;
export const SIDEBAR_WIDTH_ICON = 2.5;
export const NAV_ICON_WIDTH = 6;
export const NAV_ICON_HEIGHT = 6;
export const CONTENT_HEADER_HEIGHT = 2.5;
export const CONTENT_NAV_HEADER_HEIGHT = 2.0;
export const CONTENT_BREADCRUMBS_HEIGHT = 1.25;
export const SIDEBAR_LEFT_KEYBOARD_SHORTCUT = 'shift+b';
export const SIDEBAR_RIGHT_KEYBOARD_SHORTCUT = 'shift+n';
export const CLOSE_KEYBOARD_SHORTCUT = 'esc';
export const HEADER_TRIGGER_DROPDOWN_WIDTH_XL = 1024;
export const HEADER_TRIGGER_DROPDOWN_WIDTH_LG = 896;
export const HEADER_TRIGGER_DROPDOWN_WIDTH_MD = 768;
export const HEADER_TRIGGER_DROPDOWN_WIDTH_SM = 440;

export const tasksUpcomingDate = 14;

// All valid names that can be used to fetch the schema of a given data type. 
export const DB_SCHEMA_TYPES = [
    'workspace',
    'user',
    'calendar',
    'planner',
    'event',
    'log',
    'day',
    'note',
    'task',
    'record',
    'todolist',
    'todolistgroup',
    'goal',
    'reminder',
    'notification',
    'recurrence',
    'data',
    'stats',
    'habit',
    'journal',
    'insights',
    'settings',
];

export const DEFAULT_DATA_TYPES = [
    'String',
    'Date',
    'DateTimeLocal',
    'Number',
    'Decimal',
    'Int32',
    'Boolean',
    'Object',
    'ObjectId'
];

// Route names
export const ROUTES_HOME = [
    'dashboard',
    'dash',
    'home',
    'login',
    'signup'
];

export const ROUTES_DASHBOARD = [
    'home',
    'todo',
    'notes',
    'planner',
    'journal',
    'reflect',
    'orion',
    'search',
    // 'habits',
    'stats',
    'workspaces',
    'messages',
    // 'notifications',
    'account',
    'settings',
    'trash',
    'help',
];

export const ROUTES_TRASH = [
    'all',
    'events',
    'logs',
    'data',
    'tasks',
    'workspaces',
    'habits',
    'reflections',
    'journals',
    'notifications',
    'account',
    'settings',
];

export const ROUTES_SETTINGS = [
    "home",
    "notifications",
    "navigation",
    "appearance",
    "messages-media",
    "language-region",
    "accessibility",
    "mark-as-read",
    "audio-video",
    "connected-accounts",
    "privacy-visibility",
    "advanced"
];

export const ROUTES_REFLECT = [
    'dash',
    'stats',
    'habits',
    'insights',
    'journal',
];

export const ROUTES_STATS = [
    'dashboard',
    'data',
    'analysis',
    'calendar',
    'dailyLog',
    'habitInsights',
];

export const ROUTES_DOCUMENTS = [
    'new',
    'edit',
    'detail',
    'schema',
    'metadata',
    'stats',
];

export const ROUTES_PLANNER = [
    'today',
    'scheduler',
    'agenda',
    // 'pomodoro',
    // 'timers',
    // 'timeBlocks',
    // 'logs',
    'events',
    'planners',
    'calendars',
    // 'heatmap',
    // 'custom',
    // 'myDay',
    // 'settings',
];

export const ROUTES_TIME = [
    // 'time',
    // 'myDay',
    // 'myWeek',
    // 'myMonth',
    // 'myYear',
    'today',
    // 'pomodoro',
    'focus',
    'timers',
    // 'visualizer',
    'timeBlockVisualizer',
    'heatmap',
    'settings',
];

export const ROUTES_PLANNER_LOGS = [
    'new',
    'dailylog',
    'list',
    'calendar',
];

export const ROUTES_PLANNER_LOGS2 = [
    { label: 'new', value: 'new' },
    { label: 'dailylog', value: 'dailylog' },
    { label: 'list', value: '' },
    { label: 'calendar', value: 'calendar' },
];

export const ROUTES_PLANNER_PLANNERS = [
    'new',
    'list',
    'detail',
    'schema',
];

export const ROUTES_PLANNER_CALENDARS = [
    'new',
    'list',
    'detail',
    'schema',
];

export const ROUTES_PLANNER_EVENTS = [
    'new',
    'list',
    'detail',
    'schema',
    'calendarView',
];

export const ROUTES_NOTES = [
    'scratchPad',
    'explorer',
];

// export const ROUTES_TASK = [
//     'data',
//     'list',
//     'table',
//     'kanban',
//     // 'gantt',
//     // 'heatmap',
//     // 'custom',
//     // 'settings',
// ];

// export const ROUTES_TODO = [
//     // 'rolling',
//     // 'dueSoon',
//     // 'overDue',
//     'today',
//     'agenda',
//     'dueSoon',
//     'overDue',
//     'pinned',
//     // 'gantt',
//     'heatmap',
//     'calendar',
//     // 'custom',
//     // 'settings',
// ];

export const VIEWS_TODO = [
    'basicList',
    'detailedList',
    'table',
    'dataTable',
    'kanban',
    'calendar',
];

export const ROUTES_MESSAGES = [
    'reminders',
    'notifications',
    'history',
    'inbox'
];

export const ROUTES_REMINDERS = [
    'events',
    'tasks',
    'goals',
];

export const ROUTES_NOTIFICATIONS = [
    'all',
    'unread',
    'dismissed',
    'history',
];

export const ROUTES_INSIGHTS = [
    'heatmap',
    'overview',
    'data',
    'habits',
    'compare',
    'trends',
    'heatmap',
    'moods',
    'correlations',
    'summarize',
];


// Localstorage Routes Config
export const AUTH_TOKEN_STORAGE_NAME = [ 'mindspace', 'app', 'user', 'token' ].join( '_' );
export const USER_DATA_STORAGE_NAME = [ 'mindspace', 'app', 'user', 'data' ].join( '_' );
export const THEME_STORAGE_NAME = [ 'mindspace', 'app', 'theme', 'mode' ].join( '_' );
export const THEME_MODES = [ "system", "light", "dark", "cool" ];
export const ZUSTAND_SETTINGS_STORE_BACKUP_NAME = [ `mindspace`, `app`, `settings`, `backup`, `storage` ].join( '_' );
export const ZUSTAND_GLOBAL_STORE_STORAGE_NAME = [ 'mindspace', 'app', 'store', 'global', 'storage' ].join( '_' );
export const ZUSTAND_TASKS_STORE_STORAGE_NAME = [ 'mindspace', 'app', 'store', 'tasks', 'storage' ].join( '_' );
export const ZUSTAND_PLANNER_STORE_STORAGE_NAME = [ 'mindspace', 'app', 'store', 'planner', 'storage' ].join( '_' );
export const ZUSTAND_NOTES_STORE_STORAGE_NAME = [ 'mindspace', 'app', 'store', 'notes', 'storage' ].join( '_' );
export const ZUSTAND_NOTES_STORE_DIRECTORY_NAME = [ `mindspace`, `app`, `notes`, `directory`, `path` ].join( '_' );
export const ZUSTAND_REFLECT_STORE_DIRECTORY_NAME = [ `mindspace`, `app`, `reflect`, `directory`, `path` ].join( '_' );
export const ZUSTAND_SETTINGS_STORE_DIRECTORY_NAME = [ `mindspace`, `app`, `settings`, `directory`, `path` ].join( '_' );
export const ZUSTAND_REMINDER_STORE_STORAGE_NAME = [ `mindspace`, `app`, `reminder`, `directory`, `path` ].join( '_' );
export const ZUSTAND_NOTIFICATION_STORE_STORAGE_NAME = [ `mindspace`, `app`, `notification`, `directory`, `path` ].join( '_' );
export const ZUSTAND_FORM_STORE_STORAGE_NAME = [ 'mindspace', 'app', 'store', 'form', 'generator', 'storage' ].join( '_' );

export const ROUTES_WORKSPACE_PAGE = [ 'mindspace', 'app', 'page', 'workspace', 'route' ].join( '_' );
export const ROUTES_TASK_PAGE = [ 'mindspace', 'app', 'page', 'task', 'route' ].join( '_' );
export const ROUTES_NOTE_PAGE = [ 'mindspace', 'app', 'page', 'note', 'route' ].join( '_' );
export const ROUTES_REFLECT_PAGE = [ 'mindspace', 'app', 'page', 'reflect', 'route' ].join( '_' );
export const ROUTES_REFLECT_STATS_PAGE = [ 'mindspace', 'app', 'page', 'reflect', 'stats', 'route' ].join( '_' );
export const ROUTES_PLANNER_PAGE = [ 'mindspace', 'app', 'page', 'planner', 'route' ].join( '_' );
export const ROUTES_TIME_PAGE = [ 'mindspace', 'app', 'page', 'time', 'route' ].join( '_' );
export const ROUTES_JOURNAL_PAGE = [ 'mindspace', 'app', 'page', 'journal', 'route' ].join( '_' );
export const ROUTES_PLANNER_PAGE_LOG_SUBPAGE = [ 'mindspace', 'app', 'page', 'planner', 'log', 'route' ].join( '_' );

export const SIDEBAR_MAIN_STATE_NAME = [ 'mindspace', 'app', 'sidebar', 'main', 'state' ].join( '_' );
export const SIDEBAR_PRIMARY_STATE_NAME = [ 'mindspace', 'app', 'sidebar', 'primary', 'state' ].join( '_' );
export const SIDEBAR_SECONDARY_STATE_NAME = [ 'mindspace', 'app', 'sidebar', 'secondary', 'state' ].join( '_' );
export const SIDEBAR_SECONDARY_MAXIMIZED_NAME = [ 'mindspace', 'app', 'sidebar', 'secondary', 'maximized' ].join( '_' );
export const ROUTE_NOTES_ACTIVE_FILE_NAME = [ 'mindspace', 'app', 'notes', 'active', 'file', 'content' ].join( '_' );
export const ROUTE_NOTES_ACTIVE_FOLDER_NAME = [ 'mindspace', 'app', 'notes', 'active', 'folder', 'content' ].join( '_' );

// Form Input Config
export const DATE_PICKER_OPTIONS = [
    { name: 'Today', value: 0 },
    { name: 'Next Day', value: 1 },
    { name: 'Next 2 Days', value: 2 },
    { name: 'Next 3 Days', value: 3 },
    { name: 'Next 4 Days', value: 4 },
    { name: 'Next 5 Days', value: 5 },
    { name: 'Next 6 Days', value: 6 },
    { name: 'Next 7 Days', value: 7 },
    { name: 'Two Weeks', value: 14 },
    { name: 'Three Weeks', value: 21 },
    { name: 'Four Weeks', value: 28 },
    { name: 'This month', value: daysInMonth( new Date( Date.now() ) ) },
    { name: 'Two Months', value: 60 },
    { name: 'This year', value: 365 },
];

export const RECURRENCE_PICKER_OPTIONS = [
    { name: 'Today', value: 0 },
    { name: 'Next 1 Day', value: 1 },
    { name: 'Next 2 Days', value: 2 },
    { name: 'Next 3 Days', value: 3 },
    { name: 'Next 4 Days', value: 4 },
    { name: 'Next 5 Days', value: 5 },
    { name: 'Next 6 Days', value: 6 },
    { name: 'Next 7 Days', value: 7 },
    { name: 'Work Week', value: 5 },
    { name: 'Two Weeks', value: 14 },
    { name: 'Three Weeks', value: 21 },
    { name: 'Four Weeks', value: 28 },
    { name: 'This month', value: daysInMonth( new Date( Date.now() ) ) },
    { name: 'Two Months', value: 60 },
    { name: 'This year', value: 365 },
];

export const HABIT_INTERVAL_OPTIONS = [
    { name: "Daily", value: 0 },
    { name: "Every Other Day", value: 1 },
    { name: "Every 2 Days", value: 2 },
    { name: "Every 3 Days", value: 3 },
    { name: "Every 4 Days", value: 4 },
    { name: "Every 5 Days", value: 5 },
    { name: "Every 6 Days", value: 6 },
    { name: "Once A Week", value: 7 },
    { name: "Once Every Two Weeks", value: 14 },
    { name: "Once Every Three Weeks", value: 21 },
    { name: "Once Every Four Weeks", value: 28 },
    { name: "Once A Month", value: getDaysInMonth( new Date() ) },
    { name: "Once Every Other Month", value: 60 },
    { name: "Once A Year", value: 365 },
];

export const HABIT_DIFFICULTY_OPTIONS = [
    {
        name: "Relaxed",
        value: "relaxed",
        description: "Forgiving - up to 3 missed intervals allowed",
        graceMultiplier: 3,
        pointsMultiplier: 0.8,
        maxMissedIntervals: Number.POSITIVE_INFINITY,
    },
    {
        name: "Determined",
        value: "determined",
        description: "Moderate - up to 2 missed intervals allowed",
        graceMultiplier: 2,
        pointsMultiplier: 1.0,
        maxMissedIntervals: Number.POSITIVE_INFINITY,
    },
    {
        name: "Hero",
        value: "hero",
        description: "Strict - only 1 missed interval allowed total",
        graceMultiplier: 1,
        pointsMultiplier: 1.5,
        maxMissedIntervals: 1,
    },
];

export const STREAK_MILESTONES = [
    { days: 3, points: 25, name: "Getting Started" },
    { days: 7, points: 50, name: "Week Warrior" },
    { days: 14, points: 100, name: "Two Week Champion" },
    { days: 30, points: 200, name: "Monthly Master" },
    { days: 60, points: 400, name: "Consistency King" },
    { days: 90, points: 600, name: "Quarter Champion" },
    { days: 180, points: 1000, name: "Half Year Hero" },
    { days: 365, points: 2000, name: "Year Legend" },
];

export const DAILY_POINTS = {
    SIGN_IN: 10,
    HABIT_COMPLETION: 5,
    STREAK_BONUS_BASE: 2,
    NEW_HABIT: 25,
    MILESTONE_BONUS: 50,
};





// Reminders constants
export const RECURRENCE_RULE_TYPES = [
    { value: "onDay", label: "On Specific Day(s) of Week" },
    { value: "every", label: "Every X Interval" },
];

export const RECURRENCE_TERM_TYPES = [
    { value: "specific", label: "Specific Date & Time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "hourly_on_days_range", label: "Hourly on specific days/range" },
];

export const DAYS_OF_WEEK_SHORT = [
    { value: "SU", label: "Sun" },
    { value: "MO", label: "Mon" },
    { value: "TU", label: "Tue" },
    { value: "WE", label: "Wed" },
    { value: "TH", label: "Thu" },
    { value: "FR", label: "Fri" },
    { value: "SA", label: "Sat" },
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

// Assuming REMINDER_DOC_TYPES is available from your modelConfig.js
// For example:
// export const REMINDER_DOC_TYPES = ["Task", "Goal", "Day", "Event", "Custom"];
// We'll map it for select options if needed.



let viewsConfig =
{
    // areasTimeline: {
    //     type: 'resourceTimeline',
    //     duration: { days: 1 },
    //     resourceAreaHeaderContent: "Areas",
    //     resourceAreaWidth: '15%',
    //     slotDuration: '00:10:00',
    //     slotMinTime: "11:00:00"
    // },
    month: { // name of view
        // titleFormat: 'YYYY, MM, DD'
        // other view-specific options here
    },
    agendaDetailed: {
        type: 'agenda',
        buttonText: 'Detailed',
        defaultTimedEventDuration: '00:05:00',
        slotDuration: "00:05:00"
    },
    list: {
        // component: ListView,
        component: (
            <div className={ `fc-list-view` }>
                ListView
            </div>
        ),
        buttonTextKey: 'list',
        listDaySideFormat: { month: 'short', day: 'numeric', year: 'numeric' },
        listDayFormat: { month: 'short', day: 'numeric', year: 'numeric' }, // like "January 1, 2016"
    },
    listDay: {
        type: 'list',
        duration: { days: 1 },
        listDayFormat: { weekday: 'short' }, // day-of-week is all we need. full date is probably in headerToolbar
    },
    listWeek: {
        type: 'list',
        duration: { weeks: 1 },
        listDayFormat: { weekday: 'short' },
        listDaySideFormat: { month: 'short', day: 'numeric', year: 'numeric' },
    },
    listMonth: {
        type: 'list',
        duration: { month: 1 },
        listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },
    listYear: {
        type: 'list',
        duration: { year: 1 },
        listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },
    week: {
        // options apply to dayGridWeek and timeGridWeek views
        defaultTimedEventDuration: '00:15:00',
        slotDuration: "00:15:00"
    },
    timeGrid: {
        // options apply to timeGridWeek and timeGridDay views
        // component: DayTimeColsView,
        eventLimit: 6, // adjust to 6 only for timeGridWeek/timeGridDay
        usesMinMaxTime: true, // indicates that slotMinTime/slotMaxTime affects rendering
        allDaySlot: true,
        slotDuration: '00:15:00',
        slotEventOverlap: true, // a bad name. confused with overlap/constraint system
        buttonText: 'GRID'
    },
    timeGridDay: {
        type: 'timeGrid',
        duration: { days: 1 },
        buttonText: '1D'
    },
    timeGridWeek: {
        type: 'timeGrid',
        duration: { weeks: 1 },
        buttonText: '1W'
    },
    day: {
        // options apply to dayGridDay and timeGridDay views
        defaultTimedEventDuration: '00:15:00',
        slotDuration: "00:15:00",
        buttonText: 'DAY'
    },
    dayGrid: {
        // options apply to dayGridMonth, dayGridWeek, and dayGridDay views
    },
    // dayGrid: {
    //     options apply to dayGridMonth, dayGridWeek, and dayGridDay views
    //     component: DayTableView,
    //     dateProfileGeneratorClass: TableDateProfileGenerator,
    // },
    dayGridDay: {
        type: 'dayGrid',
        duration: { days: 1 },
        buttonText: '1D'
    },
    dayGridWeek: {
        type: 'dayGrid',
        duration: { weeks: 1 },
        buttonText: '1W'
    },
    dayGridMonth: {
        titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
        // other view-specific options here
        type: 'dayGrid',
        duration: { months: 1 },
        fixedWeekCount: true,
        buttonText: '1M'
    },
    dayGridYear: {
        titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
        type: 'dayGrid',
        duration: { years: 1 },
        buttonText: '1Y'
    },
    dayGridFourWeek: {
        titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
        type: 'dayGrid',
        duration: { weeks: 4 },
        buttonText: '4W'
    },
    timeGridFourDay: {
        titleFormat: { year: 'numeric', month: 'short', day: '2-digit' },
        type: 'timeGrid',
        duration: { days: 4 },
        buttonText: '4D'
    },
    multiMonth: {
        //   component: MultiMonthView,
        // dateProfileGeneratorClass: TableDateProfileGenerator,
        multiMonthTitleFormat: { month: 'short' },
        multiMonthMinWidth: 350,
        multiMonthMaxColumns: 3,
        buttonText: '3M'
    },
    multiMonthFourMonth: {
        type: 'multiMonth',
        duration: { months: 4 },
        buttonText: '4M'
    }
};

export default viewsConfig;
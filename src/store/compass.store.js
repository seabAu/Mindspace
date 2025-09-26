import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useCompassStore = create(
    devtools(
        persist(
            ( set, get ) => ( {
                workspacesData: [],
                activeWorkspace: null,
                calendarsData: [],
                eventsData: [],
                tasksData: [],
                logsData: [],
                setWorkspacesData: ( workspacesData ) => set( { workspacesData } ),
                setCurrentWorkspace: ( workspace ) =>
                    set( { activeWorkspace: workspace } ),
                setCalendars: ( calendarsData ) => set( { calendarsData } ),
                setEventsData: ( eventsData ) => set( { eventsData } ),
                setTodosData: ( tasksData ) => set( { tasksData } ),
                setLogsData: ( logsData ) => set( { logsData } ),
                addWorkspace: ( workspace ) =>
                    set( ( state ) => ( {
                        workspacesData: [ ...state.workspacesData, workspace ],
                    } ) ),
                addCalendar: ( calendar ) =>
                    set( ( state ) => ( {
                        calendarsData: [ ...state.calendarsData, calendar ],
                    } ) ),
                addEvent: ( event ) =>
                    set( ( state ) => ( { eventsData: [ ...state.eventsData, event ] } ) ),
                addTodo: ( todo ) =>
                    set( ( state ) => ( { tasksData: [ ...state.tasksData, todo ] } ) ),
                addLog: ( log ) =>
                    set( ( state ) => ( { logsData: [ ...state.logsData, log ] } ) ),
                updateWorkspace: ( id, updates ) =>
                    set( ( state ) => ( {
                        workspacesData: state.workspacesData.map( ( w ) =>
                            w._id === id ? { ...w, ...updates } : w,
                        ),
                    } ) ),
                updateCalendar: ( id, updates ) =>
                    set( ( state ) => ( {
                        calendarsData: state.calendarsData.map( ( c ) =>
                            c._id === id ? { ...c, ...updates } : c,
                        ),
                    } ) ),
                updateEvent: ( id, updates ) =>
                    set( ( state ) => ( {
                        eventsData: state.eventsData.map( ( e ) =>
                            e._id === id ? { ...e, ...updates } : e,
                        ),
                    } ) ),
                updateTodo: ( id, updates ) =>
                    set( ( state ) => ( {
                        tasksData: state.tasksData.map( ( t ) =>
                            t._id === id ? { ...t, ...updates } : t,
                        ),
                    } ) ),
                updateLog: ( id, updates ) =>
                    set( ( state ) => ( {
                        logsData: state.logsData.map( ( l ) =>
                            l._id === id ? { ...l, ...updates } : l,
                        ),
                    } ) ),
                deleteWorkspace: ( id ) =>
                    set( ( state ) => ( {
                        workspacesData: state.workspacesData.filter(
                            ( w ) => w._id !== id,
                        ),
                    } ) ),
                deleteCalendar: ( id ) =>
                    set( ( state ) => ( {
                        calendarsData: state.calendarsData.filter( ( c ) => c._id !== id ),
                    } ) ),
                deleteEvent: ( id ) =>
                    set( ( state ) => ( {
                        eventsData: state.eventsData.filter( ( e ) => e._id !== id ),
                    } ) ),
                deleteTodo: ( id ) =>
                    set( ( state ) => ( {
                        tasksData: state.tasksData.filter( ( t ) => t._id !== id ),
                    } ) ),
                deleteLog: ( id ) =>
                    set( ( state ) => ( {
                        logsData: state.logsData.filter( ( l ) => l._id !== id ),
                    } ) ),
            } ),
            {
                name: [ 'mindspace', 'app', 'compass', 'store', 'storage' ].join( '_' ),
                getStorage: () => localStorage,
            },
        ),
    ),
);

export default useCompassStore;

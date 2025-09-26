import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';
import { HABIT_DIFFICULTY_OPTIONS, ZUSTAND_REFLECT_STORE_DIRECTORY_NAME } from '@/lib/config/constants';
import * as utils from 'akashatools';
// import * as api from '@/lib/services/reflectService';
import useGlobalStore from "./global.store";
import {
    createLog,
    updateLog,
    fetchLogById,
    fetchLogs,
    deleteLog,
    createHabitApi,
    fetchAllHabits,
} from "@/lib/services/reflectService";
// import { calculateHabitStreak } from "@/features/Reflect/Habit/lib/utilities/rewards-system";

function normalizeDayStr ( date ) {
    return new Date( date ).toDateString();
}

const createReflectionStatusSlice = ( set, get, api ) => ( {
    error: null,
    setError: ( error ) => set( { error } ),
    clearError: () => set( { error: null } ),
    loading: false,
    setLoading: ( loading ) => set( { loading } ),
} );

const createStatsSlice = ( set, get, api ) => ( {
    requestFetchStats: false,
    setRequestFetchStats: ( requestFetchStats ) => {
        set( () => ( { requestFetchStats } ) );
    },

    statsData: [],
    setStatsData: ( statsData ) => set( { statsData } ),

    selectedStat: null,
    setSelectedStat: ( selectedStat ) => {
        set( { selectedStat: selectedStat } );
    },

    selectedDate: null,
    setSelectedDate: ( selectedDate ) => {
        console.log( "reflect.store.js :: selectedDate changed: selectedDate = ", selectedDate );
        set( { selectedDate: selectedDate } );
    },

    selectedEndDate: null,
    setSelectedEndDate: ( selectedEndDate ) => {
        console.log( "reflect.store.js :: selectedEndDate changed: selectedEndDate = ", selectedEndDate );
        set( { selectedEndDate: selectedEndDate } );
    },

    activePageTab: "data",
    setActivePageTab: ( activePageTab ) => {
        if ( [ "data", "dashboard", "calendar", "analysis" ].includes( activePageTab ) ) {
            set( { activePageTab: activePageTab } );
        }
    },

    showSidebarCalendar: true,
    setShowSidebarCalendar: ( showSidebarCalendar ) => set( { showSidebarCalendar } ),
    toggleShowSidebarCalendar: () => {
        set( ( state ) => ( {
            ...state,
            showSidebarCalendar: !state.showSidebarCalendar,
        } ) );
    },

    activeSidebarTab: "list",
    setActiveSidebarTab: ( activeSidebarTab ) => set( { activeSidebarTab } ),

    sidebarOpen: true,
    setSidebarOpen: ( sidebarOpen ) => set( { sidebarOpen } ),

    // Function to handle date selection
    handleDateSelect: ( date, endDate = null ) => {
        console.log( "reflect.store.js :: handleDateSelect triggered; date = ", date, " :: ", "endDate = ", endDate );
        set( {
            selectedDate: date ? new Date( date ).getTime() : null,
            selectedEndDate: endDate ? new Date( endDate ).getTime() : null
        } );
    },

    // Function to clear date selection
    clearDateSelection: () => {
        console.log( "reflect.store.js :: clearDateSelection triggered." );
        set( {
            selectedDate: null,
            selectedEndDate: null
        } );
    },

    // Function to toggle sidebar
    toggleSidebar: () => {
        get().setSidebarOpen( ( prev ) => !prev );
    },

    itemsPerPage: 25,
    setStatsPerPage: ( itemsPerPage ) => set( { itemsPerPage } ),

    // Get all unique data keys from items
    getAllUniqueDataKeys: () => {
        const statsData = get().statsData.filter( ( item ) => ( utils.val.isDefined( item ) ) );
        const uniqueKeys = [ ...new Set( statsData.map( ( item ) => item.dataKey ) ) ];
        return uniqueKeys.sort();
    },

    addStat: ( data ) => {
        // Already created the item's initial data and handled the backend; just insert into array. 
        set( ( state ) => ( {
            statsData: [ { ...data }, ...state.statsData ],
            ...state,
        } ) );
    },

    addStats: ( data ) => {
        // Add multiple items at once.
        if ( utils.val.isValidArray( data, true ) ) {
            set( ( state ) => ( {
                statsData: [ ...data, ...state.statsData ],
                ...state,
            } ) );
        }
    },

    insertStat: ( item, insertIndex ) => {

        set( ( state ) => {
            let newStats;

            // If insertIndex is valid, insert at that position
            if ( insertIndex >= 0 && insertIndex <= state.statsData.length ) {
                newStats = [ ...state.statsData ];
                newStats.splice( insertIndex, 0, item );
            } else {
                // Otherwise, add to the end
                newStats = [ ...state.statsData, item ];
            }

            return {
                statsData: newStats,
                error: null,
            };
        } );

    },

    createStat: ( insertIndex = -1, initialData = {} ) => {
        try {
            const newStat = {
                // _id: `item_${ Date.now() }_${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
                // _id: getDefaultValueForType( ObjectId ),
                // _id: uuidv4(),
                workspaceId: useGlobalStore.getState().workspaceId,
                userId: useGlobalStore.getState().user?.id ?? null,
                timeStamp: new Date( Date.now() ).getTime(),
                startTime: new Date( Date.now() ).getTime(),
                endTime: new Date( Date.now() ).getTime(),
                entryType: "String",
                // dataKey: `dataKey_${ Math.floor( Math.random() * 10000 ) }`,
                dataKey: `dataKey_${ get().statsData.length + 1 }`,
                dataType: "String",
                dataValue: "",
                tags: [],
                category: "",
                inTrash: false,
                _metadata: "",
                ...( initialData ? initialData : {} ),
            };

            get().insertStat( newStat, insertIndex );

            return newStat;
        } catch ( error ) {
            set( { error: error.message } );
            throw error;
        }
    },

    updateStat: ( id, updates ) => {
        try {
            // set( ( state ) => ( {
            //   items: state.statsData.map( ( item ) => ( item._id === id ? { ...item, ...updates } : item ) ),
            //   error: null,
            // } ) );

            set( ( state ) => {
                const index = state.statsData.findIndex( ( item ) => item._id === id );
                if ( index !== -1 ) {
                    // If timeStamp is being updated, ensure it's a Date object
                    if ( updates.timeStamp && !( updates.timeStamp instanceof Date ) ) {
                        updates.timeStamp = new Date( updates.timeStamp ).getTime();
                    }

                    const updatedStats = [ ...state.statsData ];
                    updatedStats[ index ] = { ...updatedStats[ index ], ...updates };

                    return {
                        ...state,
                        statsData: updatedStats,
                    };
                }
                return state;
            } );
        } catch ( error ) {
            console.error( "Error updating item:", error );
            set( { error: error.message } );
            throw error;
        }
    },

    // Update many items
    updateMany: ( updates ) => {
        try {
            set( ( state ) => {
                const updatedStats = [ ...state.statsData ];

                updates.forEach( ( update ) => {
                    const index = updatedStats.findIndex( ( item ) => item._id === update._id );
                    if ( index !== -1 ) {
                        // If timeStamp is being updated, ensure it's a Date object
                        if ( update.timeStamp && !( update.timeStamp instanceof Date ) ) {
                            update.timeStamp = new Date( update.timeStamp ).getTime();
                        }
                        updatedStats[ index ] = { ...updatedStats[ index ], ...update };
                    }
                } );

                return {
                    ...state,
                    statsData: updatedStats,
                };
            } );
        } catch ( error ) {
            console.error( "Error updating statsData:", error );
            set( { error: error.message } );
        }
    },

    deleteStat: ( id ) => {
        try {
            set( ( state ) => ( {
                statsData: state.statsData.filter( ( item ) => item._id !== id ),
                error: null,
            } ) );
        } catch ( error ) {
            console.error( "Error deleting item:", error );
            set( { error: error.message } );
            throw error;
        }
    },

    deleteStats: ( ids ) => {
        try {
            set( ( state ) => ( {
                statsData: state.statsData.filter( ( item ) => !ids.includes( item._id ) ),
                error: null,
            } ) );
        } catch ( error ) {
            console.error( "Error deleting statsData:", error );
            set( { error: error.message } );
            throw error;
        }
    },

    clearStatsData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( {
            statsData: [],
        } );
    },

    rearrangeStats: ( fromIndex, toIndex ) => {
        try {
            set( ( state ) => {
                // Make a copy of the items array
                const statsData = [ ...state.statsData ];

                // Get the item being moved
                const [ movedStat ] = statsData.splice( fromIndex, 1 );

                // Insert the item at the destination index
                statsData.splice( toIndex, 0, movedStat );

                return { statsData, error: null };
            } );
        } catch ( error ) {
            set( { error: error.message } );
            throw error;
        }
    },

    exportStats: ( data ) => {
        const { statsData } = get();
        let exportData;
        if ( utils.val.isValidArray( data, true ) ) {
            // Provided specific object array to export; typically 
            // already filtered, sorted, etc. 
            exportData = data;
        }
        else {
            exportData = statsData;
        }

        exportData = exportData.map( ( item, index ) => ( {
            ...item,
            timeStamp: new Date( item?.timeStamp ? item?.timeStamp : Date.now() ).getTime(),
            startTime: new Date( item?.startTime ? item?.startTime : Date.now() ).getTime(),
            endTime: new Date( item?.endTime ? item?.endTime : Date.now() ).getTime(),
        } ) );
        try {
            return JSON.stringify( exportData, null, 2 );
        } catch ( error ) {
            console.error( "Error exporting statsData:", error );
            set( { error: error.message } );
            throw error;
        }
    },

    fetchStats: async () => {
        const workspaceId = useGlobalStore.getState().workspaceId;
        if ( !workspaceId ) {
            console.error( "Workspace ID is required." );
            return;
        }
        try {
            set( { isLoading: true, error: null } );
            const API_BASE_URL = '/api/app/data';
            const response = await API.get( `${ API_BASE_URL }/?workspaceId=${ workspaceId }` );
            if ( response ) set( { statsData: response?.data?.data } );
            return response?.data?.data;
        } catch ( err ) {
            set( { error: err.response?.data?.message || "Error fetching stats data." } );
        } finally {
            set( { isLoading: false } );
        }
    },

    // importData: async ( data ) => {
    //   const { statsData, addStat, addStats } = get();
    //   let result = await importBulkData( {
    //     data: data,
    //     stateSetter: ( data ) => {
    //       if ( utils.val.isValidArray( data, true ) ) {
    //         addStats( data );
    //       }
    //     },
    //   } );
    // },

    importStats: ( jsonString ) => {
        const { statsData } = get();
        try {
            const importedData = JSON.parse( jsonString );
            if ( Array.isArray( importedData ) ) {
                // Validate each item has required fields
                const isValid = importedData.every( ( item ) =>
                    item._id
                    && typeof item.dataKey === "String"
                    && typeof item.dataType === "String"
                    && "dataValue" in item,
                );

                if ( !isValid ) {
                    set( { error: "Invalid data format. Some items are missing required fields." } );
                    return false;
                }

                // Ensure timestamps are Date objects
                const processedStats = importedData.map( ( item ) => ( {
                    ...item,
                    timeStamp: new Date( item?.timeStamp ? item?.timeStamp : Date.now() ).getTime(),
                    startTime: new Date( item?.startTime ? item?.startTime : Date.now() ).getTime(),
                    endTime: new Date( item?.endTime ? item?.endTime : Date.now() ).getTime(),
                } ) );

                set( {
                    statsData: [ ...statsData, ...processedStats ],
                    error: null
                } );
                return processedStats;
            }
            else {
                set( { error: "Invalid data format. Expected an array." } );
                return false;
            }

        } catch ( error ) {
            set( { error: error.message } );
            return false;
        }
    },

    // Get item by ID
    getStatById: ( id ) => {
        return get().statsData.find( ( item ) => item._id === id );
    },

    // Get items by data type
    getStatsByType: ( dataType ) => {
        return get().statsData.filter( ( item ) => item.dataType === dataType );
    },

    // Get items by date range
    getStatsByDateRange: ( startDate, endDate ) => {
        return get().statsData.filter( ( item ) => {
            const itemDate = new Date( item.timeStamp );
            return itemDate >= startDate && itemDate <= endDate;
        } );
    },
} );

const createHabitsSlice = ( set, get, api ) => ( {
    // State
    habitsData: [],
    setHabitsData: ( habitsData ) => set( { habitsData } ),

    selectedHabit: null,
    setSelectedHabit: ( selectedHabit ) => {
        set( { selectedHabit: selectedHabit } );
    },

    selectedHabitsDate: new Date(),
    setSelectedHabitsDate: ( date ) => {
        console.log( "reflect.store.js :: date changed: selectedHabitsDate = ", date );
        set( { selectedHabitsDate: date } );
    },

    visibleHabits: {},
    setVisibleHabits: ( visibleHabits ) => set( { visibleHabits } ),

    activeTab: "gantt",
    setActiveTab: ( tab ) => set( { activeTab: tab } ),

    // Actions
    toggleHabitVisibility: ( habitId, value = null ) =>
        set( ( state ) => ( {
            visibleHabits: {
                ...state.visibleHabits,
                [ habitId ]: value ? value : !state.visibleHabits[ habitId ],
            },
        } ) ),

    // toggleAllHabitsVisibility: ( value = null ) =>
    //     set( ( state ) => ( {
    //         visibleHabits: {value 
    //         ?  {...state.habitsData?.map((h)=>([h._id]: !!value))}
    //         : state.visibleHabits}
    //     } ) )

    toggleAllHabitsVisibility: ( habits = [], value = null ) => {
        if ( value !== null ) {
            if ( habits.length === 0 ) habits = get().habitsData;
            const active = !!value;
            if ( utils.val.isValidArray( habits, true ) ) {
                let visible = {};
                habits.forEach( ( h ) => {
                    visible[ h._id ] = active;
                } );
                set( ( state ) => ( {
                    visibleHabits: visible
                } ) );
            }
        }
    },

    loadHabits: async () => {
        set( { loading: true } );
        try {
            // const response = await api.fetchAllHabits();
            const response = await fetchAllHabits( {
                workspaceId: useGlobalStore.getState().workspaceId,
                userId: useGlobalStore.getState().user?.id ?? null
            } );
            if ( response.success ) {
                const habits = response.data;

                // Only initialize visibleHabits if we don't have any yet.
                set( ( state ) => {
                    let nextVisible = state.visibleHabits;
                    if ( !nextVisible || Object.keys( nextVisible ).length === 0 ) {
                        const initialVisible = habits
                            .filter( ( h ) => h.isActive )
                            .reduce( ( acc, h ) => {
                                acc[ h._id ] = true;
                                return acc;
                            }, {} );
                        nextVisible = initialVisible;
                    } else {
                        // Ensure any new habits get a default visibility (true) and keep existing toggles.
                        const merged = { ...nextVisible };
                        habits.forEach( ( h ) => {
                            if ( merged[ h._id ] === undefined && h.isActive ) merged[ h._id ] = true;
                        } );
                        nextVisible = merged;
                    }

                    return { habitsData: habits, visibleHabits: nextVisible, loading: false };
                } );
            } else {
                set( { loading: false } );
            }
        } catch ( e ) {
            console.error( "Error loading habits:", e );
            set( { loading: false } );
        }
    },

    createHabitAsync: async ( habitData ) => {
        try {
            const response = await createHabitApi( habitData );
            if ( response.success ) {
                const newHabit = response.data;
                set( ( state ) => ( {
                    habitsData: [ ...state.habitsData, newHabit ],
                    visibleHabits: { ...state.visibleHabits, [ newHabit_id ]: true },
                } ) );
                return { success: true };
            }
            return { success: false, error: response.error || "Failed to create habit" };
        } catch ( error ) {
            console.error( "Error creating habit:", error );
            return { success: false, error };
        }
    },

    addHabit: ( data ) => {
        // Already created the item's initial data and handled the backend; just insert into array. 
        set( ( state ) => ( {
            habitsData: [ data, ...state.habitsData ],
            ...state,
        } ) );
    },

    createHabit: ( initialData = {} ) => {
        try {
            const newHabit = {
                workspaceId: useGlobalStore.getState().workspaceId,
                userId: useGlobalStore.getState().user?.id ?? null,
                title: 'New Habit',
                description: '',
                isActive: true,
                isBadHabit: false,
                color: "#FF2222",
                habitType: "none",
                importance: 5,
                progress: 0,
                inputType: "toggle",
                habitValueType: "none",
                minValue: null,
                maxValue: null,
                difficulty: 0,
                priority: 0,
                activity: [],
                ...( initialData ? initialData : {} ),
            };

            get().addHabit( newHabit );

            return newHabit;
        } catch ( error ) {
            set( { error: error.message } );
            throw error;
        }
    },

    updateHabit: ( id, updates ) => {
        try {
            set( ( state ) => {
                const index = state.habitsData.findIndex( ( item ) => item._id === id );
                if ( index !== -1 ) {
                    const updated = [ ...state.habitsData ];
                    updated[ index ] = { ...updated[ index ], ...updates };

                    return {
                        ...state,
                        habitsData: updated,
                    };
                }
                return state;
            } );
        } catch ( error ) {
            console.error( "reflect.store.js :: Error updating habit item:", error );
            set( { error: error.message } );
            throw error;
        }
    },

    saveUserHabitData: ( data ) => {

    },

    updateHabitActivity: ( habitId, date, value, notes ) => {
        // Optimistic update
        const dayStr = normalizeDayStr( date );
        const prevState = get().habitsData;

        let habit = prevState?.find( ( h ) => ( h._id === habitId ) );
        let updatedHabit = habit;
        if ( habit ) {
            const activityIdx = habit.activity.findIndex( ( a ) => normalizeDayStr( a.date ) === dayStr );
            const nextActivity = { date: new Date( date ).toISOString(), value, notes: notes || "" };
            updatedHabit = { ...habit, activity: [ ...habit.activity ] };
            if ( activityIdx >= 0 ) {
                updatedHabit.activity[ activityIdx ] = nextActivity;
            } else {
                updatedHabit.activity = [ ...updatedHabit.activity, nextActivity ];
            }
        }

        // Create the optimistic next state
        const nextHabits = prevState.map( ( h ) => {
            if ( h._id !== habitId ) return h;
            return updatedHabit;
        } );

        set( { habitsData: nextHabits } );

        return updatedHabit;

        // // Persist via API; if it fails, revert
        // try {
        //     const response = await api.updateHabitActivityApi( habitId, date, value, notes );
        //     if ( !response.success ) {
        //         set( { habits: prevState } );
        //         return { success: false, error: response.error || "Failed to update habit activity" };
        //     }
        //     return { success: true };
        // } catch ( error ) {
        //     console.error( "Error updating habit activity:", error );
        //     set( { habits: prevState } );
        //     return { success: false, error };
        // }
    },

    // Computed values
    getActiveHabits: () => {
        const { habitsData } = get();
        return habitsData.filter( ( h ) => h.isActive );
    },

    getInactiveHabits: () => {
        const { habitsData } = get();
        return habitsData.filter( ( h ) => !h.isActive );
    },

    getVisibleHabits: () => {
        const { habitsData, visibleHabits } = get();
        return habitsData.filter( ( h ) => h.isActive && visibleHabits[ h.id ] );
    },

    getHabitsForDate: ( date ) => {
        const { habitsData, visibleHabits } = get();
        return habitsData.filter( ( habit ) => {
            if ( !habit.isActive || !visibleHabits[ habit._id ] ) return false;
            const activity = habit.activity.find( ( a ) => normalizeDayStr( a.date ) === normalizeDayStr( date ) );
            if ( habit.inputType === "custom" ) {
                return activity && activity.notes && activity.notes.trim() !== "";
            }
            return activity && activity.value > 0;
        } );
    },

    getActivityForDate: ( habitId, date ) => {
        const { habitsData } = get();
        const habit = habitsData.find( ( h ) => h._id === habitId );
        if ( !habit ) return null;
        return (
            habit.activity.find( ( a ) => normalizeDayStr( a.date ) === normalizeDayStr( date ) ) || {
                value: habit.inputType === "toggle" ? 0 : "",
                notes: "",
            }
        );
    },

    // Get item by ID
    getHabitById: ( id ) => {
        return get().habitsData.find( ( item ) => item._id === id );
    },

    toggleHabitActive: ( id ) => {
        const habit = get().getHabitById( id );
        if ( !habit ) return;

        get().updateHabit( habit, { isActive: !habit.isActive } );
    },

    clearHabitsData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( {
            habitsData: [],
        } );
    },

    getHabitStreak: ( habitId ) => {
        const { habitsData } = get();
        const habit = habitsData.find( ( h ) => h.id === habitId );
        if ( !habit ) return null;
        return calculateHabitStreak( habit );
    },

    /**
     * Award points to user and save
     */
    awardPoints: ( points, reason ) => {
        // const userData = getUserData();
        const { user } = useGlobalStore.getState();
        user.habitTrackerData.totalPoints += points;
        user.habitTrackerData.pointsHistory.unshift( {
            date: new Date().toDateString(),
            points,
            reason,
        } );
        // Keep only last 100 entries
        user.habitTrackerData.pointsHistory = user.habitTrackerData.pointsHistory.slice( 0, 100 );
        setUser( user );
        return user;
    },

    calculateHabitStreak: ( habit ) => {
        const difficulty = HABIT_DIFFICULTY_OPTIONS.find( ( d ) => d.value === habit.difficulty ) || HABIT_DIFFICULTY_OPTIONS[ 1 ];
        const interval = habit.interval || 0;
        const intervalDays = interval === 0 ? 1 : interval;

        const sortedActivity = habit.activity
            .filter( ( a ) => {
                if ( habit.inputType === "custom" ) {
                    return a.notes && a.notes.trim() !== "";
                }
                return a.value > 0;
            } )
            .sort( ( a, b ) => new Date( a.date ) - new Date( b.date ) );

        if ( sortedActivity.length === 0 ) {
            return { current: 0, longest: 0, total: 0, lastActivity: null, missedIntervals: 0 };
        }

        const today = new Date();
        const lastActivityDate = new Date( sortedActivity[ sortedActivity.length - 1 ].date );

        // Calculate current streak
        let currentStreak = 0;
        const missedIntervals = 0;
        let totalMissedInCurrentStreak = 0;

        // Check if we're within grace period from today
        const daysSinceLastActivity = differenceInDays( today, lastActivityDate );
        const allowedGap = intervalDays * difficulty.graceMultiplier;

        if ( daysSinceLastActivity <= allowedGap ) {
            currentStreak = 1;

            // Count backwards through activities
            for ( let i = sortedActivity.length - 2; i >= 0; i-- ) {
                const currentDate = new Date( sortedActivity[ i + 1 ].date );
                const prevDate = new Date( sortedActivity[ i ].date );
                const daysBetween = differenceInDays( currentDate, prevDate );

                // Expected gap is the interval
                const expectedGap = intervalDays;
                const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

                if ( daysBetween <= maxAllowedGap ) {
                    currentStreak++;

                    // Count missed intervals in this gap
                    if ( daysBetween > expectedGap ) {
                        const missedInThisGap = Math.floor( ( daysBetween - expectedGap ) / intervalDays );
                        totalMissedInCurrentStreak += missedInThisGap;

                        // For "hero" difficulty, check if we've exceeded the limit
                        if ( difficulty.value === "hero" && totalMissedInCurrentStreak > difficulty.maxMissedIntervals ) {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak (similar logic but for all time)
        let longestStreak = 0;
        let tempStreak = 1;
        let tempMissed = 0;

        for ( let i = 1; i < sortedActivity.length; i++ ) {
            const currentDate = new Date( sortedActivity[ i ].date );
            const prevDate = new Date( sortedActivity[ i - 1 ].date );
            const daysBetween = differenceInDays( currentDate, prevDate );
            const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

            if ( daysBetween <= maxAllowedGap ) {
                tempStreak++;

                if ( daysBetween > intervalDays ) {
                    const missedInThisGap = Math.floor( ( daysBetween - intervalDays ) / intervalDays );
                    tempMissed += missedInThisGap;

                    if ( difficulty.value === "hero" && tempMissed > difficulty.maxMissedIntervals ) {
                        longestStreak = Math.max( longestStreak, tempStreak - 1 );
                        tempStreak = 1;
                        tempMissed = 0;
                    }
                }
            } else {
                longestStreak = Math.max( longestStreak, tempStreak );
                tempStreak = 1;
                tempMissed = 0;
            }
        }
        longestStreak = Math.max( longestStreak, tempStreak );

        return {
            current: currentStreak,
            longest: longestStreak,
            total: sortedActivity.length,
            lastActivity: lastActivityDate,
            missedIntervals: totalMissedInCurrentStreak,
            difficulty: difficulty.value,
            pointsMultiplier: difficulty.pointsMultiplier,
        };
    },
} );

const createJournalLogsSlice = ( set, get, api ) => ( {
    // Log state
    requestFetchLogs: false,
    setRequestFetchLogs: ( requestFetchLogs ) => set( () => ( { requestFetchLogs } ) ),

    logsData: null,
    setLogsData: ( logsData ) => { set( { logsData: logsData } ); },

    addLog: ( log ) => {
        set( ( state ) => ( { logsData: [ ...( state.logsData && utils.val.isValidArray( state.logsData, true ) ? state.logsData : [] ), log ] } ) );
    },

    updateLog: ( id, updates ) => {
        set( ( state ) => ( {
            logsData: state.logsData.map( ( l ) => ( l._id === id ? { ...l, ...updates } : l ) ),
        } ) );
    },

    deleteLog: ( id ) => {
        set( ( state ) => ( {
            logsData: state.logsData?.filter( ( l ) => l._id !== id ),
        } ) );
    },

    sortLogs: ( logs ) => (
        utils.val.isValidArray( logs, true )
            ? logs?.sort( ( a, b ) => new Date( b?.date ) - new Date( a?.date ) )
            : logs
    ),


    getLogById: ( id ) => {
        const logs = get().logsData;
        return logs?.find( ( item ) => item?._id === id ) || null;
    },

    getLogByDate: ( date ) => {
        const logs = get().logsData;
        return logs?.find( ( item ) => isSameDay( new Date( item?.date ), new Date( date ) ) ) || null;
    },

    // Selected Log State

    selectedLog: null,
    setSelectedLog: ( selectedLog ) => {
        set( { selectedLog: selectedLog } );
    },

    //
    notesOpen: null,
    setNotesOpen: ( notesOpen ) => {
        set( { notesOpen: !!notesOpen } );
    },

    //
    notesContent: null,
    setNotesContent: ( notesContent ) => {
        set( { notesContent: notesContent } );
    },

    //
    isDrawerOpen: null,
    setIsDrawerOpen: ( isDrawerOpen ) => {
        set( { isDrawerOpen: !!isDrawerOpen } );
    },

    clearLogsData: ( pass ) => {
        // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
        set( {
            logsData: [],
        } );
    },

} );


const useReflectStore = create(
    // devtools( ( set, get, api ) => ( {  } ),
    devtools(
        persist(
            ( ...a ) => ( {
                // Combine other sub-store slices. 
                ...createReflectionStatusSlice( ...a ),
                ...createJournalLogsSlice( ...a ),
                ...createHabitsSlice( ...a ),
                ...createStatsSlice( ...a ),
            } ),
            // { name: [ ZUSTAND_GLOBAL_STORE_STORAGE_NAME ], getStorage: () => localStorage, },
            // { name: [ ZUSTAND_TASKS_STORE_STORAGE_NAME ], getStorage: () => localStorage },
            {
                name: [ ZUSTAND_REFLECT_STORE_DIRECTORY_NAME ],
                partialize: ( state ) => ( {
                    // Habits
                    habitsData: state.habitsData,
                    visibleHabits: state.visibleHabits,
                    activeTab: state.activeTab,

                    // Stats
                    statsData: state.statsData,
                    selectedDate: state.selectedDate,
                    selectedEndDate: state.selectedEndDate,
                    activePageTab: state.activePageTab,
                    showSidebarCalendar: state.showSidebarCalendar,
                    activeSidebarTab: state.activeSidebarTab,
                    sidebarOpen: state.sidebarOpen,
                    itemsPerPage: state.itemsPerPage,

                    // Logs
                    logsData: state.logsData,
                    selectedLog: state.selectedLog,
                } ),
                getStorage: () => localStorage
            },
        ),
    ),
);

export default useReflectStore;



// Old solo stats store
/* 
    const createStatsSlice = ( set, get, api ) => ( {
        statsData: [],
        activeStatsData: null,
        setStatsData: ( statsData ) => set( { statsData } ),
        setActiveStatsData: ( stats ) => set( { activeStatsData: stats } ),
        addStats: ( stats ) => set( ( state ) => ( { statsData: [ ...state.statsData, stats ] } ) ),
        updateStats: ( id, updates ) =>
            set( ( state ) => ( {
                statsData: state.statsData.map( ( s ) =>
                    s?._id === id ? { ...s, ...updates } : s,
                ),
            } ) ),
        deleteStats: ( id ) =>
            set( ( state ) => ( {
                statsData: state.statsData.filter(
                    ( s ) => s?._id !== id,
                )
            } ) ),


        items: [],
        isLoading: false,
        error: null,

        // Add a new item
        addItem: () => {
            try {
                const newItem = {
                    // _id: `item_${ Date.now() }_${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
                    // _id: getDefaultValueForType( ObjectId ),
                    _metadata: "",
                    workspaceId: useGlobalStore.getState().workspaceId,
                    userId: useGlobalStore.getState().user?_id ?? null,
                    timeStamp: new Date( Date.now() ).getTime(),
                    startTime: new Date( Date.now() ).getTime(),
                    endTime: new Date( Date.now() ).getTime(),
                    entryType: "String",
                    dataKey: `dataKey_${ get().items.length + 1 }`,
                    dataType: "String",
                    dataValue: "",
                    tags: [],
                    category: "",
                    inTrash: false,
                };

                set( ( state ) => ( {
                    ...state,
                    items: [ ...state.items, { ...newItem } ],
                } ) );

                return newItem;
            } catch ( error ) {
                console.error( "Error adding item:", error );
                set( { error: error.message } );
                return null;
            }
        },

        // Update an item
        updateItem: ( id, updates ) => {
            try {
                set( ( state ) => {
                    const index = state.items.findIndex( ( item ) => item._id === id );
                    if ( index !== -1 ) {
                        // If timeStamp is being updated, ensure it's a Date object
                        if ( updates.timeStamp && !( updates.timeStamp instanceof Date ) ) {
                            updates.timeStamp = new Date( updates.timeStamp );
                        }

                        const updatedItems = [ ...state.items ];
                        updatedItems[ index ] = { ...updatedItems[ index ], ...updates };

                        return {
                            ...state,
                            items: updatedItems,
                        };
                    }
                    return state;
                } );
            } catch ( error ) {
                console.error( "Error updating item:", error );
                set( { error: error.message } );
            }
        },

        // Delete an item
        deleteItem: ( id ) => {
            try {
                set( ( state ) => ( {
                    ...state,
                    items: state.items.filter( ( item ) => item._id !== id ),
                } ) );
            } catch ( error ) {
                console.error( "Error deleting item:", error );
                set( { error: error.message } );
            }
        },

        // Delete multiple items
        deleteItems: ( ids ) => {
            try {
                set( ( state ) => ( {
                    ...state,
                    items: state.items.filter( ( item ) => !ids.includes( item._id ) ),
                } ) );
            } catch ( error ) {
                console.error( "Error deleting items:", error );
                set( { error: error.message } );
            }
        },

        // Update many items
        updateMany: ( updates ) => {
            try {
                set( ( state ) => {
                    const updatedItems = [ ...state.items ];

                    updates.forEach( ( update ) => {
                        const index = updatedItems.findIndex( ( item ) => item._id === update._id );
                        if ( index !== -1 ) {
                            // If timeStamp is being updated, ensure it's a Date object
                            if ( update.timeStamp && !( update.timeStamp instanceof Date ) ) {
                                update.timeStamp = new Date( update.timeStamp );
                            }
                            updatedItems[ index ] = { ...updatedItems[ index ], ...update };
                        }
                    } );

                    return {
                        ...state,
                        items: updatedItems,
                    };
                } );
            } catch ( error ) {
                console.error( "Error updating items:", error );
                set( { error: error.message } );
            }
        },

        // Rearrange items
        rearrangeItems: ( fromIndex, toIndex ) => {
            try {
                set( ( state ) => {
                    const updatedItems = [ ...state.items ];
                    const item = updatedItems[ fromIndex ];
                    updatedItems.splice( fromIndex, 1 );
                    updatedItems.splice( toIndex, 0, item );

                    return {
                        ...state,
                        items: updatedItems,
                    };
                } );
            } catch ( error ) {
                console.error( "Error rearranging items:", error );
                set( { error: error.message } );
            }
        },

        // Set all items (useful for initialization)
        setItems: ( items ) => {
            try {
                set( {
                    items: items.map( ( item ) => ( {
                        ...item,
                        // Ensure timestamps are Date objects
                        timeStamp: item.timeStamp instanceof Date ? item.timeStamp : new Date( item.timeStamp ),
                    } ) ),
                    error: null,
                } );
            } catch ( error ) {
                console.error( "Error setting items:", error );
                set( { error: error.message } );
            }
        },

        // Get item by ID
        getItemById: ( id ) => {
            return get().items.find( ( item ) => item._id === id );
        },

        // Get items by data type
        getItemsByType: ( dataType ) => {
            return get().items.filter( ( item ) => item.dataType === dataType );
        },

        // Get items by date range
        getItemsByDateRange: ( startDate, endDate ) => {
            return get().items.filter( ( item ) => {
                const itemDate = new Date( item.timeStamp );
                return itemDate >= startDate && itemDate <= endDate;
            } );
        },

        // Export all items as JSON
        exportItems: () => {
            let { items } = get();
            items = items.map( ( item, index ) => ( {
                ...item,
                timeStamp: new Date( item?.timeStamp ? item?.timeStamp : Date.now() ).getTime(),
                startTime: new Date( item?.startTime ? item?.startTime : Date.now() ).getTime(),
                endTime: new Date( item?.endTime ? item?.endTime : Date.now() ).getTime(),
            } ) );
            try {
                return JSON.stringify( items, null, 2 );
            } catch ( error ) {
                console.error( "Error exporting items:", error );
                set( { error: error.message } );
                return "[]";
            }
        },

        // Import items from JSON
        importItems: ( jsonString ) => {
            try {
                const items = JSON.parse( jsonString );
                if ( Array.isArray( items ) ) {
                    // Ensure timestamps are Date objects
                    const processedItems = items.map( ( item ) => ( {
                        ...item,
                        timeStamp: item.timeStamp ? new Date( item.timeStamp ) : new Date(),
                    } ) );
                    set( { items: processedItems, error: null } );
                    return true;
                }
                set( { error: "Invalid data format. Expected an array." } );
                return false;
            } catch ( error ) {
                console.error( "Error importing items:", error );
                set( { error: error.message } );
                return false;
            }
        },

        // Clear error state
        clearError: () => set( { error: null } ),

    } );
*/



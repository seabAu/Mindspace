import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools, persist } from "zustand/middleware";
// import { immer } from "zustand/middleware/immer"; // Optional: for easier nested state updates
import { ZUSTAND_REFLECT_STORE_DIRECTORY_NAME, ZUSTAND_REMINDER_STORE_STORAGE_NAME } from '@/lib/config/constants';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import API from "../lib/services/api";
import useNotificationsStore from "./notification.store";
import { calculateNextTriggerTime } from "@/features/Remind/lib/notificationUtils";

const useReminderStore = create(
    devtools(
        persist(
            ( set, get ) => ( {
                requestFetchReminders: false,
                setRequestFetchReminders: ( requestFetchReminders ) => {
                    set( () => ( { requestFetchReminders } ) );
                },

                reminderData: [],
                setReminderData: ( reminderData ) => set( { reminderData } ),

                // notificationData: [],
                // setNotificationData: ( notificationData ) => set( { notificationData } ),

                // selectedStartDate: null,
                // setSelectedStartDate: ( selectedStartDate ) => {
                //     console.log( "reminder.store.js :: selectedStartDate changed: selectedStartDate = ", selectedStartDate );
                //     set( { selectedStartDate: selectedStartDate } );
                // },

                // selectedEndDate: null,
                // setSelectedEndDate: ( selectedEndDate ) => {
                //     console.log( "reminder.store.js :: selectedEndDate changed: selectedEndDate = ", selectedEndDate );
                //     set( { selectedEndDate: selectedEndDate } );
                // },

                // // Function to handle startDate selection
                // handleDateSelect: ( startDate, endDate = null ) => {
                //     console.log( "reminder.store.js :: handleDateSelect triggered; startDate = ", startDate, " :: ", "endDate = ", endDate );
                //     set( {
                //         selectedStartDate: startDate ? new Date( startDate ).getTime() : null,
                //         selectedEndDate: endDate ? new Date( endDate ).getTime() : null
                //     } );
                // },

                // // Function to clear startDate selection
                // clearDateSelection: () => {
                //     console.log( "reminder.store.js :: clearDateSelection triggered." );
                //     set( {
                //         selectedStartDate: null,
                //         selectedEndDate: null
                //     } );
                // },

                error: null,
                setError: ( error ) => set( { error } ),
                clearError: () => set( { error: null } ),

                remindersPerPage: 25,
                setRemindersPerPage: ( remindersPerPage ) => set( { remindersPerPage } ),

                // Get all unique data keys from items
                getAllUniqueDataKeys: () => {
                    const reminderData = get().reminderData?.filter( ( item ) => ( utils.val.isDefined( item ) ) );
                    const uniqueKeys = [ ...new Set( reminderData.map( ( item ) => item.dataKey ) ) ];
                    return uniqueKeys.sort();
                },

                addReminder: ( data ) => {
                    // Already created the item's initial data and handled the backend; just insert into array. 
                    set( ( state ) => ( {
                        reminderData: [ { ...data }, ...state.reminderData ],
                        ...state,
                    } ) );
                },

                addReminders: ( data ) => {
                    // Add multiple items at once.
                    if ( utils.val.isValidArray( data, true ) ) {
                        set( ( state ) => ( {
                            reminderData: [ ...data, ...state.reminderData ],
                            ...state,
                        } ) );
                    }
                },

                insertReminder: ( item, insertIndex ) => {

                    set( ( state ) => {
                        let newReminders;

                        // If insertIndex is valid, insert at that position
                        if ( insertIndex >= 0 && insertIndex <= state.reminderData.length ) {
                            newReminders = [ ...state.reminderData ];
                            newReminders.splice( insertIndex, 0, item );
                        } else {
                            // Otherwise, add to the end
                            newReminders = [ ...state.reminderData, item ];
                        }

                        return {
                            reminderData: newReminders,
                            error: null,
                        };
                    } );

                },

                createReminder: ( insertIndex = -1, initialData = {} ) => {
                    try {
                        const newReminder = {
                            workspaceId: useGlobalStore.getState().workspaceId,
                            userId: useGlobalStore.getState().user?.id ?? null,
                            inTrash: false,
                            isEnabled: true,
                            isActive: true,
                            isPinned: false,
                            title: "New Reminder",
                            message: "",
                            notes: "",
                            triggerDates: [ new Date().toISOString() ],
                            docId: null,
                            docType: 'Custom',
                            // startDate: new Date( Date.now() ).getTime(),
                            // endDate: new Date( Date.now() ).getTime(),
                            isRecurring: false,
                            rrules: [],
                            recurrenceDesc: "",
                            notificationType: 'none',
                            ...( initialData ? initialData : {} ),
                        };

                        get().insertReminder( newReminder, insertIndex );

                        return newReminder;
                    } catch ( error ) {
                        set( { error: error.message } );
                        throw error;
                    }
                },

                cleanReminderData: ( updates ) => {
                    let updatedData = { ...updates };
                    if ( updatedData.startDate && !( updatedData.startDate instanceof Date ) ) {
                        updatedData.startDate = new Date( updatedData.startDate );
                    }
                    if ( updatedData.endDate && !( updatedData.endDate instanceof Date ) ) {
                        updatedData.endDate = new Date( updatedData.endDate );
                    }
                    if ( updatedData.triggerDates && ( utils.val.isValidArray( updatedData?.triggerDates, true ) ) ) {
                        // Run through each triggerDate and check each.
                        let triggerDates = [ ...updatedData.triggerDates.map( ( date ) => {
                            if ( date instanceof Date ) return date;
                            else return new Date( date );
                        } ) ];
                        updatedData.triggerDates = triggerDates;
                    }

                    return updatedData;
                },

                updateReminder: ( id, updates ) => {
                    try {
                        const { reminderData, cleanReminderData } = get();
                        const index = reminderData.findIndex( ( item ) => item._id === id );
                        let updatedReminders = [ ...reminderData ];
                        if ( index !== -1 ) {
                            // If timeStamp is being updated, ensure it's a Date object
                            let updatesCleaned = cleanReminderData( updates );
                            updatedReminders[ index ] = { ...updatedReminders[ index ], ...updatesCleaned };

                            set( ( state ) => ( {
                                ...state,
                                reminderData: updatedReminders,
                                // state.reminderData.map( ( item ) => ( item._id === id ? { ...item, ...updates } : item ) ),
                                error: null,
                                loading: false,
                            } ) );

                            return updatedReminders;
                        }

                        // set( ( state ) => {
                        //     const index = state.reminderData.findIndex( ( item ) => item._id === id );
                        //     if ( index !== -1 ) {
                        //         // If timeStamp is being updated, ensure it's a Date object
                        //         if ( updates.startDate && !( updates.startDate instanceof Date ) ) {
                        //             updates.startDate = new Date( updates.startDate );
                        //         }
                        //         if ( updates.endDate && !( updates.endDate instanceof Date ) ) {
                        //             updates.endDate = new Date( updates.endDate );
                        //         }
                        //         if ( updates.triggerDates && ( utils.val.isValidArray( updates?.triggerDates, true ) ) ) {
                        //             // Run through each triggerDate and check each.
                        //             let triggerDates = [ ...updates.triggerDates.map( ( date ) => {
                        //                 if ( date instanceof Date ) return date;
                        //                 else return new Date( date );
                        //             } ) ];
                        //             updates.triggerDates = triggerDates;
                        //         }

                        //         const updatedReminders = [ ...state.reminderData ];
                        //         updatedReminders[ index ] = { ...updatedReminders[ index ], ...updates };

                        //         return {
                        //             ...state,
                        //             reminderData: updatedReminders,
                        //         };
                        //     }
                        //     return state;
                        // } );
                    } catch ( error ) {
                        console.error( `Error updating reminder: ${ error.message }` );
                        set( { error: `Error updating reminder: ${ error.message }` } );
                        throw error;
                    }
                },

                // Update many items
                updateReminders: ( updates ) => {
                    const { reminderData, cleanReminderData } = get();
                    let updatedReminders = [ ...reminderData ];

                    try {
                        updates.forEach( ( update ) => {
                            const index = updatedReminders.findIndex( ( item ) => item._id === update._id );
                            if ( index !== -1 ) {
                                let updateCleaned = cleanReminderData( updates );
                                updatedReminders[ index ] = { ...updatedReminders[ index ], ...updateCleaned };
                            }
                        } );

                        set( ( state ) => ( {
                            ...state,
                            reminderData: updatedReminders,
                            error: null,
                            loading: false,
                        } ) );

                        return updatedReminders;
                    } catch ( error ) {
                        console.error( "Error updating reminderData:", error );
                        set( { error: error.message } );
                    }
                },

                deleteReminder: ( id ) => {
                    try {
                        set( ( state ) => ( {
                            reminderData: state.reminderData.filter( ( item ) => item._id !== id ),
                            error: null,
                        } ) );
                    } catch ( error ) {
                        console.error( "Error deleting item:", error );
                        set( { error: error.message } );
                        throw error;
                    }
                },

                deleteReminders: ( ids ) => {
                    try {
                        set( ( state ) => ( {
                            reminderData: state.reminderData.filter( ( item ) => !ids.includes( item._id ) ),
                            error: null,
                        } ) );
                    } catch ( error ) {
                        console.error( "Error deleting reminderData:", error );
                        set( { error: error.message } );
                        throw error;
                    }
                },

                fetchReminder: async () => {
                    const workspaceId = useGlobalStore.getState().workspaceId;
                    if ( !workspaceId ) {
                        console.error( "Workspace ID is required." );
                        return;
                    }
                    try {
                        set( { isLoading: true, error: null } );
                        const API_BASE_URL = '/api/app/remind';
                        const response = await API.get( `${ API_BASE_URL }/?workspaceId=${ workspaceId }` );
                        if ( response ) set( { reminderData: response?.data?.data } );
                        return response?.data?.data;
                    } catch ( err ) {
                        set( { error: err.response?.data?.message || "Error fetching reminder data." } );
                    } finally {
                        set( { isLoading: false } );
                    }
                },

                setReminderToEdit: ( reminder ) => set( { reminderToEdit: reminder, reminderToClone: null } ),
                clearReminderToEdit: () => set( { reminderToEdit: null } ),
                setReminderToClone: ( reminder ) => {
                    const reminderDataToClone = { ...reminder };
                    delete reminderDataToClone._id; // Remove ID for cloning
                    set( { reminderToClone: reminderDataToClone, reminderToEdit: null } );
                },
                clearReminderToClone: () => set( { reminderToClone: null } ),

                // --- Selectors / Getters ---
                getFilteredReminders: ( dataType ) => {
                    if ( !dataType ) return get().reminderData;
                    return get().reminderData.filter( ( r ) => r.docType === dataType );
                },
                getActiveReminders: () => get().reminderData.filter( ( r ) => r.isActive ),
                getInactiveReminders: () => get().reminderData.filter( ( r ) => !r.isActive ),



                // Sort reminderData by TriggerDate.
                sortReminders: ( sortConfig = { key: "triggerDates", direction: "ascending" } ) => {
                    // TODO :: Update this to reflect the triggerDates date-to-array change. Need to sort in-reminder dates to get chronologically next date. 

                    const sortableItems = [ ...get().reminderData ];
                    if ( sortConfig.key !== null ) {
                        sortableItems.sort( ( a, b ) => {
                            let valA = a[ sortConfig.key ];
                            let valB = b[ sortConfig.key ];
                            if ( sortConfig.key === "triggerDates" || sortConfig.key === "nextTrigger" ) {
                                valA = a[ sortConfig.key ] ? new Date( a[ sortConfig.key ] ) : new Date( 0 ); // Handle null nextTrigger
                                valB = b[ sortConfig.key ] ? new Date( b[ sortConfig.key ] ) : new Date( 0 );
                            }
                            if ( valA < valB ) return sortConfig.direction === "ascending" ? -1 : 1;
                            if ( valA > valB ) return sortConfig.direction === "ascending" ? 1 : -1;
                            return 0;
                        } );
                    }
                    return sortableItems.map( ( r ) => ( { ...r, nextTrigger: calculateNextTriggerTime( r ) } ) ); // Add nextTrigger here
                },

                // Get reminder by ID
                getReminderById: ( id ) => {
                    return get().reminderData?.find( ( item ) => item._id === id );
                },

                // Get notificationData by reminder-ID
                getNotificationsByReminderId: ( id ) => {
                    if ( id ) return useNotificationsStore.getState().notificationData?.find( ( item ) => item.reminderId === id );
                    else return [];
                },

                // Get items by data type
                getRemindersByType: ( dataType ) => {
                    return get().reminderData?.filter( ( item ) => ( item.docType === dataType || dataType === "all" || dataType === "All" ) );
                },

                getActiveRemindersByType: ( dataType ) => {
                    const { reminderData } = get();
                    if ( utils.val.isValidArray( reminderData, true ) ) {
                        return reminderData.filter( ( r ) => (
                            ( r?.docType === dataType || dataType === "All" || dataType === "all" )
                            && ( r?.isActive )
                            && ( r?.isEnabled )
                            && ( !r?.inTrash )
                        ) );
                    }
                },

                // Get items by startDate range
                getRemindersByDateRange: ( startDate, endDate ) => {
                    return get().reminderData?.filter( ( item ) => {
                        const itemDate = new Date( item.startDate );
                        return itemDate >= startDate && itemDate <= endDate;
                    } );
                },

                getActiveReminderTypes: () => {
                    const { reminderData } = get();
                    let types = [ "All" ];
                    if ( utils.val.isValidArray( reminderData, true ) ) {
                        reminderData.forEach( ( reminder ) => {
                            // Does it already exist in the list?
                            let type = reminder?.docType;
                            let foundType = types?.find( ( t, i ) => ( t === type ) );
                            if ( !foundType ) { types.push( type ); }
                        } );
                    }
                    return types;
                },

                clearAllReminders: () => {
                    if ( confirm( "Are you sure you want to delete ALL reminders? This cannot be undone." ) ) {
                        set( { reminderData: [] } );
                    }
                },

                clearReminderData: ( pass ) => {
                    // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
                    set( { reminderData: [] } );
                },
            } ),
            {
                name: ZUSTAND_REMINDER_STORE_STORAGE_NAME,
                getStorage: () => localStorage,
            },
        ),
    ),
);


export default useReminderStore;

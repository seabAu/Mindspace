import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools, persist } from "zustand/middleware";
import { ZUSTAND_REFLECT_STORE_DIRECTORY_NAME } from '@/lib/config/constants';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import API from "../lib/services/api";
// import { importBulkData } from "../lib/services/_defunct/statsService";

const useStatsStore = create(
    devtools(
        persist(
            ( set, get ) => ( {
                requestFetchStats: false,
                setRequestFetchStats: ( requestFetchStats ) => {
                    set( () => ( { requestFetchStats } ) );
                },

                statsData: [],
                setStatsData: ( statsData ) => set( { statsData } ),

                selectedDate: null,
                setSelectedDate: ( selectedDate ) => {
                    console.log( "stats.store.js :: selectedDate changed: selectedDate = ", selectedDate );
                    set( { selectedDate: selectedDate } );
                },

                selectedEndDate: null,
                setSelectedEndDate: ( selectedEndDate ) => {
                    console.log( "stats.store.js :: selectedEndDate changed: selectedEndDate = ", selectedEndDate );
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
                    console.log( "stats.store.js :: handleDateSelect triggered; date = ", date, " :: ", "endDate = ", endDate );
                    set( {
                        selectedDate: date ? new Date( date ).getTime() : null,
                        selectedEndDate: endDate ? new Date( endDate ).getTime() : null
                    } );
                },

                // Function to clear date selection
                clearDateSelection: () => {
                    console.log( "stats.store.js :: clearDateSelection triggered." );
                    set( {
                        selectedDate: null,
                        selectedEndDate: null
                    } );
                },

                // Function to toggle sidebar
                toggleSidebar: () => {
                    get().setSidebarOpen( ( prev ) => !prev );
                },

                error: null,
                setError: ( error ) => set( { error } ),
                clearError: () => set( { error: null } ),

                itemsPerPage: 25,
                setItemsPerPage: ( itemsPerPage ) => set( { itemsPerPage } ),

                // Get all unique data keys from items
                getAllUniqueDataKeys: () => {
                    const statsData = get().statsData.filter( ( item ) => ( utils.val.isDefined( item ) ) );
                    const uniqueKeys = [ ...new Set( statsData.map( ( item ) => item.dataKey ) ) ];
                    return uniqueKeys.sort();
                },

                addItem: ( data ) => {
                    // Already created the item's initial data and handled the backend; just insert into array. 
                    set( ( state ) => ( {
                        statsData: [ { ...data }, ...state.statsData ],
                        ...state,
                    } ) );
                },

                addItems: ( data ) => {
                    // Add multiple items at once.
                    if ( utils.val.isValidArray( data, true ) ) {
                        set( ( state ) => ( {
                            statsData: [ ...data, ...state.statsData ],
                            ...state,
                        } ) );
                    }
                },

                insertItem: ( item, insertIndex ) => {

                    set( ( state ) => {
                        let newItems;

                        // If insertIndex is valid, insert at that position
                        if ( insertIndex >= 0 && insertIndex <= state.statsData.length ) {
                            newItems = [ ...state.statsData ];
                            newItems.splice( insertIndex, 0, item );
                        } else {
                            // Otherwise, add to the end
                            newItems = [ ...state.statsData, item ];
                        }

                        return {
                            statsData: newItems,
                            error: null,
                        };
                    } );

                },

                createItem: ( insertIndex = -1, initialData = {} ) => {
                    try {
                        const newItem = {
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

                        get().insertItem( newItem, insertIndex );

                        return newItem;
                    } catch ( error ) {
                        set( { error: error.message } );
                        throw error;
                    }
                },

                updateItem: ( id, updates ) => {
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

                                const updatedItems = [ ...state.statsData ];
                                updatedItems[ index ] = { ...updatedItems[ index ], ...updates };

                                return {
                                    ...state,
                                    statsData: updatedItems,
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
                            const updatedItems = [ ...state.statsData ];

                            updates.forEach( ( update ) => {
                                const index = updatedItems.findIndex( ( item ) => item._id === update._id );
                                if ( index !== -1 ) {
                                    // If timeStamp is being updated, ensure it's a Date object
                                    if ( update.timeStamp && !( update.timeStamp instanceof Date ) ) {
                                        update.timeStamp = new Date( update.timeStamp ).getTime();
                                    }
                                    updatedItems[ index ] = { ...updatedItems[ index ], ...update };
                                }
                            } );

                            return {
                                ...state,
                                statsData: updatedItems,
                            };
                        } );
                    } catch ( error ) {
                        console.error( "Error updating statsData:", error );
                        set( { error: error.message } );
                    }
                },

                deleteItem: ( id ) => {
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

                deleteItems: ( ids ) => {
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

                rearrangeItems: ( fromIndex, toIndex ) => {
                    try {
                        set( ( state ) => {
                            // Make a copy of the items array
                            const statsData = [ ...state.statsData ];

                            // Get the item being moved
                            const [ movedItem ] = statsData.splice( fromIndex, 1 );

                            // Insert the item at the destination index
                            statsData.splice( toIndex, 0, movedItem );

                            return { statsData, error: null };
                        } );
                    } catch ( error ) {
                        set( { error: error.message } );
                        throw error;
                    }
                },

                exportItems: ( data ) => {
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
                //   const { statsData, addItem, addItems } = get();
                //   let result = await importBulkData( {
                //     data: data,
                //     stateSetter: ( data ) => {
                //       if ( utils.val.isValidArray( data, true ) ) {
                //         addItems( data );
                //       }
                //     },
                //   } );
                // },

                importItems: ( jsonString ) => {
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
                            const processedItems = importedData.map( ( item ) => ( {
                                ...item,
                                timeStamp: new Date( item?.timeStamp ? item?.timeStamp : Date.now() ).getTime(),
                                startTime: new Date( item?.startTime ? item?.startTime : Date.now() ).getTime(),
                                endTime: new Date( item?.endTime ? item?.endTime : Date.now() ).getTime(),
                            } ) );

                            set( {
                                statsData: [ ...statsData, ...processedItems ],
                                error: null
                            } );
                            return processedItems;
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
                getItemById: ( id ) => {
                    return get().statsData.find( ( item ) => item._id === id );
                },

                // Get items by data type
                getItemsByType: ( dataType ) => {
                    return get().statsData.filter( ( item ) => item.dataType === dataType );
                },

                // Get items by date range
                getItemsByDateRange: ( startDate, endDate ) => {
                    return get().statsData.filter( ( item ) => {
                        const itemDate = new Date( item.timeStamp );
                        return itemDate >= startDate && itemDate <= endDate;
                    } );
                },

            } ),
            {
                name: ZUSTAND_REFLECT_STORE_DIRECTORY_NAME,
                getStorage: () => localStorage,
            },
        ),
    ),
);


export default useStatsStore;

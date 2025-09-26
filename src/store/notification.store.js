import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer"; // Optional: for easier nested state updates
import { ZUSTAND_NOTIFICATION_STORE_STORAGE_NAME } from '@/lib/config/constants';
import useGlobalStore from '@/store/global.store';
import * as utils from 'akashatools';
import API from "../lib/services/api";
import { toast } from "@/hooks/use-toast";
import { ObjectId } from "@/lib/config/types";
import useReminderStore from "./reminder.store";

const useNotificationsStore = create(
    devtools(
        persist(
            ( set, get ) => ( {
                // { id, reminderId, reminderTitle, reminderNotes, triggeredAt, isRead, isDismissed, notificationType }
                notificationData: [],
                setNotificationData: ( notificationData ) => set( { notificationData } ),

                createNotification: ( data ) => {

                    const newNotification = {
                        id: data?._id ?? data?.id,
                        title: data?.title ?? 'New notification',
                        message: data?.message ?? '',
                        docType: data?.docType,
                        docId: data?.docId,
                        triggerDate: new Date( data?.triggerDate ) ?? new Date(),
                        // lastTriggeredAt: new Date( Date.now() ),
                        reminderId: data?.reminderId,
                        isDismissed: data?.isDismissed ?? false,
                        isPinned: data?.isPinned ?? false,
                        inTrash: data?.inTrash ?? false,
                        isRead: false,
                        notificationType: data?.notificationType,
                        notificationContact: data?.notificationContact,
                    };

                    return newNotification;
                },

                createNotificationFromReminder: ( reminder, triggerDate ) => {
                    if ( !triggerDate ) { return null; }

                    const newNotification = {
                        reminderId: reminder?._id,
                        title: reminder?.title ?? 'New notification',
                        message: reminder?.message ?? '',
                        docType: reminder?.docType,
                        docId: reminder?.docId,
                        isDismissed: false,
                        isPinned: reminder?.isPinned ?? false,
                        inTrash: reminder?.inTrash ?? false,
                        isRead: false,
                        notificationType: reminder?.notificationType,
                        notificationContact: reminder?.notificationContact,
                        // triggerDate: new Date( reminder?.triggerDate ) ?? new Date(),
                        triggerDate: new Date( triggerDate ),
                    };

                    return newNotification;
                },

                addNotification: ( data ) => {
                    const { notificationData, createNotification } = get();
                    const reminderId = data?.reminderId;
                    const { reminderData } = useReminderStore().getState();
                    let reminder = reminderData?.find( ( r ) => ( r?._id === reminderId ) );
                    // const newNotification = createNotification( reminder );

                    console.log( "notification.store.js :: addNotification :: notificationData = ", notificationData, " :: ", "newNotification = ", data );

                    if ( utils.val.isValidArray( notificationData, true ) ) {
                        // A notification already exists if it: 
                        // 1. A notification with the same reminderId exists
                        // 2. A notification with the above condition and the reminder's specific triggerDate is already accounted for.
                        let existing = notificationData?.find( ( n ) => ( n.reminderId === reminder._id && !n.isDismissed ) )
                            && !reminder?.triggerDates.findIndex( ( item ) => date === data?.triggerDate );
                        if ( !existing ) {
                            // notificationData.unshift( newNotification ); // Add to top
                            set( ( state ) => ( {
                                ...state,
                                notificationData: [
                                    { ...data },
                                    ...( utils.val.isValidArray( state.notificationData, true )
                                        ? state.notificationData
                                        : [] ),
                                ],
                            } ) );
                        } else if ( existing && existing.isRead ) {
                            // If it exists but was isRead, make it unread again
                            existing.isRead = false;
                            existing.lastTriggeredAt = new Date(); // Update trigger time
                            get().updateNotification( existing?._id ?? existing?.id, existing );
                        }
                    }
                    else {
                        // We have no notifications yet. Start a new array with this item as its 1st index. 
                        set( ( state ) => ( {
                            ...state,
                            notificationData: [ newNotification ]
                        } ) );
                    }

                    // Simulate browser alert for 'alert' type
                    switch ( newNotification?.notificationType ) {
                        case "alert":
                            if ( typeof window !== "undefined" ) {
                                window.alert( `Reminder: ${ newNotification?.title }\n${ newNotification?.message || '' }` );
                            }
                            break;

                        case "toast":
                            toast( {
                                title: `Reminder: ${ newNotification?.title }`,
                                description: newNotification?.message || "Check your notificationData!",
                                duration: 1500, // Reduced from 2000ms
                            } );
                            break;

                        case "sms":
                            toast( {
                                title: `Notification (sms placeholder): ${ newNotification?.title }`,
                                description: newNotification?.message || "Check your notificationData!",
                                duration: 1500, // Reduced from 2000ms
                            } );
                            break;
                        case "email":
                            toast( {
                                title: `Notification (email placeholder): ${ newNotification?.title }`,
                                description: newNotification?.message || "Check your notificationData!",
                                duration: 1500, // Reduced from 2000ms
                            } );
                            break;
                        case "push":
                            toast( {
                                title: `Notification (push placeholder): ${ newNotification?.title }`,
                                description: newNotification?.message || "Check your notificationData!",
                                duration: 1500, // Reduced from 2000ms
                            } );
                            break;
                        case "none":
                            toast( {
                                title: `Notification (none placeholder): ${ newNotification?.title }`,
                                description: newNotification?.message || "Check your notificationData!",
                                duration: 1500, // Reduced from 2000ms
                            } );
                            break;
                            break;
                        default:
                            break;
                    }
                },

                cleanNotificationData: ( updates ) => {
                    let updatedData = { ...updates };

                    // If timeStamp is being updated, ensure it's a Date object
                    if ( update.triggerDate && !( updatedData.triggerDate instanceof Date ) ) {
                        updatedData.triggerDate = new Date( updatedData.triggerDate );
                    }

                    return updatedData;
                },

                updateNotification: ( id, updates ) => {
                    const { notificationData, cleanNotificationData } = get();
                    const updatedNotifications = [ ...notificationData ];

                    const index = updatedNotifications.findIndex( ( item ) => item._id === id );
                    if ( index !== -1 ) {
                        let updatesCleaned = cleanNotificationData( updates );
                        updatedNotifications[ index ] = { ...updatedNotifications[ index ], ...updatesCleaned };
                    }

                    try {
                        set( ( state ) => ( {
                            ...state,
                            notificationData: updatedNotifications,
                        } ) );
                        return updatedNotifications;
                    } catch ( error ) {
                        console.error( `Error updating notification: ${ error.message }` );
                        set( { error: `Error updating notification: ${ error.message }` } );
                        throw error;
                    }
                },

                // Update many items
                updateNotifications: ( updates ) => {
                    const { notificationData, cleanNotificationData } = get();
                    const updatedNotifications = [ ...notificationData ];

                    updates.forEach( ( update ) => {
                        const index = updatedNotifications.findIndex( ( item ) => item._id === update._id );
                        if ( index !== -1 ) {
                            let updatesCleaned = cleanNotificationData( updates );
                            updatedNotifications[ index ] = { ...updatedNotifications[ index ], ...updatesCleaned };
                        }
                    } );

                    try {
                        set( ( state ) => ( {
                            ...state,
                            notificationData: updatedNotifications,
                        } ) );
                    } catch ( error ) {
                        console.error( "Error updating notificationData:", error );
                        set( { error: error.message } );
                    }
                },

                deleteNotification: ( id ) => {
                    try {
                        set( ( state ) => ( {
                            notificationData: state.notificationData?.filter( ( item ) => item._id !== id ),
                            error: null,
                        } ) );
                    } catch ( error ) {
                        console.error( "Error deleting item:", error );
                        set( { error: error.message } );
                        throw error;
                    }
                },

                deleteNotifications: ( ids ) => {
                    try {
                        set( ( state ) => ( {
                            notificationData: state.notificationData?.filter( ( item ) => !ids.includes( item._id ) ),
                            error: null,
                        } ) );
                    } catch ( error ) {
                        console.error( "Error deleting notificationData:", error );
                        set( { error: error.message } );
                        throw error;
                    }
                },

                toggleRead: ( notificationId, isRead = false ) => {
                    updateNotification( notificationId, { isRead: !!isRead } );
                },

                markAsUnread: ( notificationId ) => {
                    updateNotification( notificationId, { isRead: false } );
                },

                markAsRead: ( notificationId ) => {
                    updateNotification( notificationId, { isRead: true } );
                },

                markAllAsRead: () => {
                    set( ( state ) => ( {
                        ...state,
                        notificationData: state.notificationData?.map( ( n ) => {
                            if ( !n.isDismissed ) n.isRead = true;
                            return n;
                        } ),
                    } ) );
                },

                clearDismissed: () => {
                    set( ( state ) => ( {
                        ...state,
                        notificationData: state.notificationData?.filter( ( n ) => !n.isDismissed )
                    } ) );
                },

                markNotificationAsPinned: ( notificationId, value = true ) =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.map( ( n ) => ( n._id === notificationId ? { ...n, isPinned: !!value } : n ) ),
                    } ) ),
                markNotificationAsRead: ( notificationId, value = true ) =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.map( ( n ) => ( n._id === notificationId ? { ...n, isRead: !!value } : n ) ),
                    } ) ),
                markAllNotificationsAsRead: ( value = true ) =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.map( ( n ) => ( { ...n, isRead: !!value } ) ),
                    } ) ),
                dismissNotification: ( notificationId, value = true ) =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.map( ( n ) =>
                            n._id === notificationId ? { ...n, isDismissed: !!value, isRead: !!value } : n,
                        ),
                    } ) ),
                dismissAllNotifications: ( value = true ) =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.map( ( n ) => ( { ...n, isDismissed: !!value } ) ),
                    } ) ),
                clearDismissedNotifications: () =>
                    set( ( state ) => ( {
                        notificationData: state.notificationData?.filter( ( n ) => !n.isDismissed ),
                    } ) ),
                clearAllNotifications: () => {
                    if ( confirm( "Are you sure you want to delete ALL notificationData? This cannot be undone." ) ) {
                        set( { notificationData: [] } );
                    }
                },
                clearNotificationData: ( pass ) => {
                    // No confirmation on this one, done only via the global store when it's time to full-wipe the data when changing workspaces or users.
                    set( { notificationData: [] } );
                },

                // --- Selectors ---
                getUnreadNotifications: () =>
                    get()
                        .notificationData
                        ?.filter( ( n ) => !n.isRead && !n.isDismissed )
                    || []
                // .sort( ( a, b ) => new Date( b.triggerDate ) - new Date( a.triggerDate ) )
                ,

                getDismissedNotifications: () =>
                    get()
                        .notificationData
                        ?.filter( ( n ) => n.isDismissed === true )
                    || []
                // .sort( ( a, b ) => new Date( b.triggerDate ) - new Date( a.triggerDate ) )
                ,

                getUndismissedNotifications: () =>
                    get()
                        .notificationData
                        ?.filter( ( n ) => !n.isDismissed )
                    || []
                // .sort( ( a, b ) => new Date( b.triggerDate ) - new Date( a.triggerDate ) )
                ,

                getVisibleNotifications: () =>
                    get()
                        .notificationData
                        ?.filter( ( n ) => !n.isDismissed )
                    || []
                // .sort( ( a, b ) => new Date( b.triggerDate ) - new Date( a.triggerDate ) )
                ,

            } ),
            {
                name: ZUSTAND_NOTIFICATION_STORE_STORAGE_NAME,
                getStorage: () => localStorage,
            },
        ),
    ),
);


export default useNotificationsStore;

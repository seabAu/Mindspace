import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
    redirect,
    useNavigate,
    useLocation,
} from "react-router-dom";
import * as utils from 'akashatools';
import APIBuffer from "@/pages/APIBuffer";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import useReminderStore from "@/store/reminder.store";
import { socket } from "@/lib/socket/socket";
// import { useSocket } from "@/lib/providers/SocketContext";
import useMessage from "@/lib/hooks/useMessage";
import useNotificationsStore from "@/store/notification.store";
// import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer, toast } from 'react-toastify';
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { isInvalid } from "@/lib/utilities/data";
import useGlobalStore from "@/store/global.store";


const NotifyHandler = ( { enabled = true, children }, ...props ) => {

    /* 
        const {
            setReminders,
            addNotification,
            reminderData,
            notificationData,
        } = useReminderStore( ( state ) => ( {
            setReminders: state.setReminders,
            addNotification: state.addNotification,
            reminderData: state.reminderData,
            notificationData: state.notificationData,
        } ) );
    */
    const user = useGlobalStore( ( state ) => state.user );
    const userToken = useGlobalStore( ( state ) => state.userToken );
    const userLoggedIn = useGlobalStore( ( state ) => state.userLoggedIn );

    const {
        setReminders,
        setReminderData,
        reminderData,
    } = useReminderStore();
    const {
        addNotification,
        setNotificationData,
        notificationData,
    } = useNotificationsStore();
    const { handleFetchAllReminders, handleFetchAllNotifications } = useMessage();
    // const { socket, setSocket, socketConnected, setSocketConnected } = useSocket();

    const [ isLoading, setIsLoading ] = useState( true );

    /* const fetchReminders = useCallback( async () => {
        try {
            const response = await fetch( `/api/app/alert/reminder?workspaceId=${ workspaceId }&userId=${ user?.id }` );
            if ( !response.ok ) throw new Error( "Failed to fetch reminders" );
            const data = await response.json();
            setReminderData( data );
        } catch ( error ) {
            console.error( error );
            toast.error( "Could not load reminders from the server." );
        } finally {
            setIsLoading( false );
        }
    }, [ setReminderData ] ); */

    useEffect( () => {
        if ( user && !isInvalid( userToken ) ) {
            // if ( !reminderData ) fetchReminders();
            if ( !reminderData ) handleFetchAllReminders();

            function onConnect () {
                console.log( "Socket connected!" );
                if ( user ) {
                    socket.emit( "registerUser", user?.id );
                }
            }

            function onDisconnect () {
                console.log( "Socket disconnected." );
            }

            console.log( "APP.JSX :: ON COMPONENT MOUNT SOCKET BLOCK :: socket.io message received. " );

            if ( !socket.connected ) {
                socket.connect();
            }

            socket.on( "connect", onConnect );
            socket.on( "disconnect", onDisconnect );

            return () => {
                socket.off( "connect", onConnect );
                socket.off( "disconnect", onDisconnect );
                // socket.disconnect();
            };
        }
    }, [] );

    useEffect( () => {
        // if ( !reminderData ) fetchReminders();
        if ( user && !isInvalid( userToken ) ) {
            if ( !reminderData ) handleFetchAllReminders();

            function onNewNotification ( notification ) {
                console.log( "Received new notification from server:", notification );
                // addNotification( notification, notification?.triggerDate ?? new Date() );
                if ( notification && utils.val.isObject( notification ) ) {
                    setNotificationData( [
                        ...( utils.val.isValidArray( notificationData, true )
                            ? notificationData
                            : []
                        ), notification ] );
                }

                // --- Client-side handling of notification types ---
                const title = `Reminder: ${ notification.titleSnapshot }`;
                const description = notification.messageSnapshot || "A reminder has been triggered.";
                const action = {
                    label: "View",
                    onClick: () => {
                        navigate( notification?.docURL ?? `/dash/messages/notifications/${ notification?._id }` );
                    },
                };

                switch ( notification.notificationType ) {
                    case "email":
                        toast.success( "Email Sent", {
                            description: `An email was sent to ${ notification.notificationContact }.`,
                        } );
                        break;
                    case "sms":
                        toast.success( "SMS Sent", {
                            description: `An SMS was sent to ${ notification.notificationContact }.`,
                        } );
                        break;
                    case "alert":
                        // For a web app, a prominent toast can serve as an "alert"
                        toast.warning( title, { description, duration: 10000, action } );
                        break;
                    case "push":
                        // toast.info( title, { description, duration: 10000, action } );
                        toast.success( "Push Notification Sent", {
                            description: `A Push Notification was sent to ${ notification.notificationContact }.`,
                        } );
                        break;
                    case "toast":
                        toast.success( "Toast", {
                            description: `A Toast Notification was sent!`,
                        } );
                        break;
                    default:
                        toast.success( "Default Notification Sent", {
                            description: `A Default Notification was sent to ${ notification.notificationContact }.`,
                        } );
                        break;
                }

                handleFetchAllReminders(); // Refetch to show updated reminder states
            }

            console.log( "APP.JSX :: DEPENDENCY-ARRAY SOCKET BLOCK :: socket.io message received. " );

            if ( !socket.connected ) {
                socket.connect();
            }

            socket.on( "new_notification", onNewNotification );

            return () => {
                socket.off( "new_notification", onNewNotification );
                // socket.disconnect();
            };
        }
    }, [] );

    return (
        <>
            <div id="notifications-center">
                {/* <NotificationCenter /> */ }
            </div>

            { children }
        </>
    );
};

export default NotifyHandler;
// Provides functionality for push and desktop notifications. 

import React from 'react';
import logoIcon from '@/assets/img/mindspace_logo_sunset.png';
import { Button } from '@/components/ui/button';
import { BellRingIcon } from 'lucide-react';

const useNotification = () => {

    const showNotification = ( {
        title,
        onClick,
        onDismiss,
        redirectURL,

        // Additional (optional) options
        icon,
        body,
        dir,
        data,
        badge,
        image = "",
        renotify = false,
        requireInteraction = false,
        silent = false,
        tag = "",
        timestamp,
    } ) => {
        // Make sure to set up notification permissions first.
        handleNotificationPermissions(
            () => {
                try {
                    let options = {
                        body: body || 'Notification body',
                        icon: icon || logoIcon
                    };
                    if ( dir ) options.dir = dir;
                    if ( data ) options.data = data;
                    if ( badge ) options.badge = badge;
                    if ( image ) options.image = image;
                    if ( renotify ) options.renotify = renotify;
                    if ( requireInteraction ) options.requireInteraction = requireInteraction;
                    if ( silent ) options.silent = silent;
                    if ( tag ) options.tag = tag;
                    if ( timestamp ) options.timestamp = timestamp;

                    const notification = new Notification(
                        title || 'Notification message',
                        options
                        // {
                        //     body: body || 'Notification body',
                        //     icon: icon || logoIcon
                        // }
                    );

                    // if ( notification.permission === 'denied' || notification.permission === 'default' ) {
                    //     notification.style.display = 'block';
                    // } else {
                    //     notification.style.display = 'none';
                    // }

                    notification.onclick = ( e ) => {
                        e.preventDefault();
                        console.log( "useNotification :: notification.onclick triggered." );
                        if ( redirectURL ) {
                            window.location.href = redirectURL || `./dash/home`;
                        }
                        if ( onClick ) {
                            onClick( e );
                        }
                    };

                    notification.onclose = ( e ) => {
                        e.preventDefault();
                        console.log( "useNotification :: notification.onclose triggered." );
                        if ( onDismiss ) onDismiss( e );
                    };

                    notification.onerror = ( e ) => {
                        e.preventDefault();
                        console.log( "useNotification :: notification.onerror triggered." );
                    };

                    notification.onshow = ( e ) => {
                        e.preventDefault();
                        console.log( "useNotification :: notification.onshow triggered." );
                    };
                } catch ( error ) {
                    console.error( `An error occurred when displaying a push desktop notification: ${ error?.message } -> Stack = `, error?.stack );
                    if ( error instanceof TypeError ) {
                        // Type error. 
                        //      Thrown if:
                        //      The constructor is called within the ServiceWorkerGlobalScope.
                        //      The actions option is specified and is not empty.
                        //      The silent option is true and the vibrate option is specified.
                        //      The renotify option is true but the tag option is empty.
                    }
                } finally {

                }
            }
        );
    };

    const handleNotificationPermissions = ( onSuccessCallback, customMessage ) => {
        // 'granted', 'denied', 'default
        if ( Notification.permission === 'granted' ) {
            if ( onSuccessCallback ) onSuccessCallback();
        }
        else if ( Notification.permission !== 'denied' ) {
            Notification.requestPermission().then( permission => {
                console.log( permission );
            } );
        }
        else {
            console.log( "Notification Permissions check: ", Notification.permission );
        }
    };

    const notificationButton = ( args = {
        icon: logoIcon,
        body: "Notification body",
        message: "Notification",
        onClick: () => { },
        onDismiss: () => { },
        redirectURL: "./dash/home",
    } ) => {
        return (
            <Button
                size={ 'icon' }
                variant={ 'outline' }
                className={ `px-2 py-1` }
                onClick={ ( e ) => {
                    e.preventDefault();
                    showNotification( { ...args } );
                } }
            >
                <BellRingIcon className={ `aspect-square size-4` } />
            </Button>
        );
    };

    return {
        handleNotificationPermissions,
        notificationButton,
        showNotification,
    };
};

export default useNotification;


/*  // USAGE: 
    { notificationButton( {
        body: "Notification body",
        message: "Notification",
        onClick: () => { console.log( "NotesPage :: onClick notification event triggered." ); },
        onDismiss: () => { console.log( "NotesPage :: onDismiss notification event triggered." ); },
        redirectURL: "./dash/home",
    } ) }
*/


import {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from 'react';
import * as utils from 'akashatools';
import useReminderStore from '@/store/reminder.store';
import useNotificationsStore from '@/store/notification.store';

const MessageContext = createContext( null );

export function MessageProvider ( { children, initialData = [] } ) {
    const reminderStore = useReminderStore();
    const notificationStore = useNotificationsStore();

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ( {
            ...reminderStore,
            ...notificationStore,
        } ),
        [ reminderStore, notificationStore ],
    );

    return (
        <MessageContext.Provider value={ contextValue }>
            { children }
        </MessageContext.Provider>
    );
}

export function useMessageContext () {
    const context = useContext( MessageContext );
    if ( !context ) {
        throw new Error(
            'useMessageContext must be used within a MessageProvider',
        );
    }
    return context;
}

import useGlobalStore from "@/store/global.store";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_IO_PORT = process.env.VITE_PUBLIC_SOCKET_SERVER_PORT || 4201;
const SOCKET_IO_URL = process.env.VITE_PUBLIC_SOCKET_SERVER_URL || `http://localhost:${ SOCKET_IO_PORT }`;

const SocketContext = createContext();

// Define a useSocket hook for using the context provider.
// Calling this hook will provide the socket. 
export const useSocket = () => {
    return useContext( SocketContext );
};

// We use this to wrap the application in a socket.io context provider.
export const SocketContextProvider = ( { children } ) => {
    const [ socket, setSocket ] = useState( null );
    const user = useGlobalStore( ( state ) => state.user );

    const [ socketConnected, setSocketConnected ] = useState( [] );

    useEffect( () => {
        const socket = io( SOCKET_IO_URL, {
            autoConnect: true,
            reconnectionAttempts: 5,
            query: {
                userId: user?.id
            }
        } );

        setSocket( socket );

        // // Socket.on listens for events, both client and server side.
        // socket.on( "getOnlineUsers", ( users ) => {
        //     setOnlineUsers( users );
        // } );

        // On unmount:
        return () => socket && socket.close();
    }, [ user?._id ] );

    console.log( "SocketContextProvider -> socket.on(connect) -> socket = ", socket );

    return (
        <SocketContext.Provider value={ { socket, setSocket, socketConnected, setSocketConnected } }>
            { children }
        </SocketContext.Provider>
    );
};

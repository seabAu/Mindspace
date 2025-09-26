import { io } from "socket.io-client";

const SOCKET_IO_PORT = process.env.VITE_PUBLIC_SOCKET_SERVER_PORT || 4201;
const SOCKET_IO_URL = process.env.VITE_PUBLIC_SOCKET_SERVER_URL || `http://localhost:${ SOCKET_IO_PORT }`;

export const socket = io( SOCKET_IO_URL, {
    autoConnect: false,
    reconnectionAttempts: 5,
    // query: {
    //     userId: user?.id
    // }
} );

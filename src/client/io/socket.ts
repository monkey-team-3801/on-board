import socketIOClient from "socket.io-client";

/**
 * Global socketIO instance.
 */
export const socket: SocketIOClient.Socket = socketIOClient("/").connect();

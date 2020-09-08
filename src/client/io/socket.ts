import socketIOClient from "socket.io-client";

export const socket: SocketIOClient.Socket = socketIOClient("/").connect();

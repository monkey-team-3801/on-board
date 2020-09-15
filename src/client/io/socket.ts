import socketIOClient from "socket.io-client";

export const socket = socketIOClient("/").connect();

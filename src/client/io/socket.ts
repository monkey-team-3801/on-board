import socketIOClient from "socket.io-client";

export const socket = (socketIOClient.Socket = socketIOClient("/"));

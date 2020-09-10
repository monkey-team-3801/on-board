import { MessageData } from "./types";

export enum ChatEvent {
    CHAT_MESSAGE_SEND = "CHAT_MESSAGE_SEND",
    CHAT_MESSAGE_RECEIVE = "CHAT_MESSAGE_RECEIVE",
}

export type ChatMessageSendType = MessageData;

export type ChatMessageReceiveType = MessageData;

export enum RoomEvent {
    PRIVATE_ROOM_JOIN = "PRIVATE_ROOM_JOIN",
}

export type PrivateRoomJoinData = {
    sessionId: string;
};

export enum VideoEvent {
    USER_JOIN_ROOM = "USER_JOIN_ROOM",
    USER_LEAVE_ROOM = "USER_LEAVE_ROOM",
    UPDATE_USERS = "USER_CHANGED"
}

export type PrivateVideoRoomJoinData = {
    sessionId: string;
    userId: string;
};

export type PrivateVideoRoomLeaveData = {
    sessionId: string;
    userId: string;
}

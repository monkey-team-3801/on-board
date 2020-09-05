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

export enum ExecutingEvent {
    ANNOUNCEMENT,
    CLASS_OPEN,
}

export enum AnnouncementEvent {
    NEW = "ANNOUNCEMENT_NEW",
}

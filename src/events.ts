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

export enum SignInEvent {
    USER_SIGNEDIN = "USER_SIGNEDIN",
    USER_SIGNEDOUT= "USER_SIGNEDOUT",
}

export enum SendOnlineUsersEvent {
    ONLINE_USERS_LIST = "ONLINE_USERS_LIST",
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
    COURSE_ANNOUNCEMENTS_SUBSCRIBE = "COURSE_ANNOUNCEMENTS_SUBSCRIBE",
}

export enum ClassEvent {
    OPEN = "OPEN",
}

export enum FileUploadEvent {
    NEW_FILE = "NEW_FILE",
}

export enum CanvasEvent {
    CHANGE = "CANVAS_CHANGE",
    DRAW = "CANVAS_DRAW",
    CLEAR = "CANVAS_CLEAR",
}

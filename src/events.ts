import { MessageData } from "./types";

export enum ChatEvent {
    CHAT_MESSAGE_SEND = "CHAT_MESSAGE_SEND",
    CHAT_MESSAGE_RECEIVE = "CHAT_MESSAGE_RECEIVE",
}

export type ChatMessageSendType = MessageData;

export type ChatMessageReceiveType = MessageData;

export enum RoomEvent {
    PRIVATE_ROOM_JOIN = "PRIVATE_ROOM_JOIN",
    SESSION_JOIN = "SESSION_JOIN",
    SESSION_LEAVE = "SESSION_LEAVE",
    BREAKOUT_ROOM_ALLOCATE = "BREAKOUT_ROOM_ALLOCATE",
}

export type PrivateRoomJoinData = {
    sessionId: string;
};

export enum VideoEvent {
    USER_JOIN_ROOM = "USER_JOIN_ROOM",
    USER_LEAVE_ROOM = "USER_LEAVE_ROOM",
    UPDATE_USERS = "USER_CHANGED",
}

export type PrivateVideoRoomJoinData = {
    sessionId: string;
    peerId: string;
    userId: string;
};

export type PrivateVideoRoomLeaveData = {
    sessionId: string;
    userId: string;
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

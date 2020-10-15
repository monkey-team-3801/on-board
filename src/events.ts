import { MessageData } from "./types";

export enum ChatEvent {
    CHAT_MESSAGE_SEND = "CHAT_MESSAGE_SEND",
    CHAT_MESSAGE_RECEIVE = "CHAT_MESSAGE_RECEIVE",
    CHAT_STATUS_CHANGE = "CHAT_STATUS_CHANGE",
    CHAT_JOIN = "CHAT_JOIN",
    CHAT_LEAVE = "CHAT_LEAVE",
    CHAT_NEW_PRIVATE_MESSAGE = "CHAT_NEW_PRIVATE_MESSAGE",
}

export type ChatMessageSendType = MessageData;

export type ChatMessageReceiveType = MessageData;

export enum GlobalEvent {
    USER_ONLINE_STATUS_CHANGE = "USER_ONLINE_STATUS_CHANGE",
}

export enum RoomEvent {
    PRIVATE_ROOM_JOIN = "PRIVATE_ROOM_JOIN",
    SESSION_JOIN = "SESSION_JOIN",
    SESSION_LEAVE = "SESSION_LEAVE",
    BREAKOUT_ROOM_ALLOCATE = "BREAKOUT_ROOM_ALLOCATE",
    USER_HAND_STATUS_CHANGED = "USER_HAND_STATUS_CHANGED",
}

export type PrivateRoomJoinData = {
    sessionId: string;
};

export enum VideoEvent {
    USER_JOIN_ROOM = "USER_JOIN_ROOM",
    USER_LEAVE_ROOM = "USER_LEAVE_ROOM",
    USER_STOP_STREAMING = "USER_STOP_STREAMING",
    USER_START_STREAMING = "USER_START_STREAMING",
    USER_START_SCREEN_SHARING = "USER_START_SCREEN_SHARING",
    USER_STOP_SCREEN_SHARING = "USER_STOP_SCREEN_SHARING",
    FORCE_STOP_SCREEN_SHARING = "FORCE_STOP_SCREEN_SHARING",
}

export type PrivateVideoRoomStopSharingData = {
    sessionId: string;
    peerId: string;
    userId: string;
};

export type PrivateVideoRoomShareScreenData = {
    sessionId: string;
    peerId: string;
    userId: string;
};

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
    FILE_DELETED = "FILE_DELETED",
}

export enum CanvasEvent {
    CHANGE = "CANVAS_CHANGE",
    DRAW = "CANVAS_DRAW",
    CLEAR = "CANVAS_CLEAR",
}

export enum ResponseFormEvent {
    NEW_FORM = "NEW_FORM",
    NEW_RESPONSE = "NEW_RESPONSE",
}

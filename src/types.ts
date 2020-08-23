export type AnyObjectMap<S> = { [key: string]: S };

export type SessionData = SessionInfo & {
    id: string;
    name: string;
    messages?: Array<Omit<MessageData, "sessionId">>;
};

export type SessionInfo = {
    id: string;
    name: string;
};

export type SessionResponseType = {
    sessions: Array<SessionInfo>;
};

export type MessageData = {
    sendUser: string;
    content: string;
    sessionId: string;
    sentTime: string;
};

export interface TimetableSession {
    name: string;
    startTime: Date;
    duration: Number;
}

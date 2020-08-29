export type AnyObjectMap<S> = { [key: string]: S };

export enum ExecutingEvent {
    ANNOUNCEMENT,
    CLASS_OPEN,
}

export interface BaseJob<T = string> {
    jobDate: string;
    executingEvent: ExecutingEvent;
    data: T;
}

export interface AnnouncementJob extends BaseJob<string> {
    executingEvent: ExecutingEvent.ANNOUNCEMENT;
}

export interface ClassOpenJob extends BaseJob<string> {
    executingEvent: ExecutingEvent.CLASS_OPEN;
}

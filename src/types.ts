import { ExecutingEvent } from "./events";

export type AnyObjectMap<S> = { [key: string]: S };

export type SessionInfo = {
    id: string;
    name: string;
    description: string;
    courseCode?: string;
    parentSessionId?: string;
    createdBy?: string;
};

export type MessageData = {
    sendUser: string;
    content: string;
    sessionId: string;
    sentTime: string;
};

export type SessionData = SessionInfo & {
    messages: Array<Omit<MessageData, "sessionId">>;
};

export type ClassroomSessionData = SessionData & {
    courseCode: string;
    roomType: string;
    startTime: string;
    endTime: string;
    colourCode: string;
};

export type UpcomingClassroomSessionData = Omit<
    ClassroomSessionData,
    "messages" | "id"
>;

export type NewMessageRequestType = Omit<MessageData, "sentTime"> & {
    roomType: RoomType;
};

export type CourseActivityUnique = {
    code: string;
    type: string;
};

export type CourseActivityRequestFilterType = Partial<CourseActivityUnique> & {
    filter: {
        chosenYear?: number;
        chosenMonth?: number;
    };
};

export type CourseActivity = CourseActivityUnique & {
    time: number;
    startDate: Date;
    duration: number;
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Monday->Sunday in ISO week
    weeks: Array<1 | 0>;
};

export type CourseActivityResponseType = {
    [courseCode: string]: Array<CourseActivity>
}

export type CourseDataUnique = {
    code: string;
    description: string;
};

export type CourseResponseType = CourseDataUnique & {
    activities: Array<CourseActivity>;
    announcements: Array<CourseAnnouncementsType>;
};

export type CoursesType = Array<CourseResponseType>;

export type CoursesResponseType = CoursesType;

export type CourseCodesType = Array<Pick<CourseDataUnique, "code">>;

export type CourseListResponseType = CourseCodesType;

export type CourseListRequestType = CourseCodesType;

export type CourseAnnouncementsType = {
    id: string;
    title: string;
    content: string;
    courseCode: string;
    userId: string;
    date: string;
};

export enum UserType {
    STUDENT,
    TUTOR,
    COORDINATOR,
}

export enum RoomType {
    CLASS,
    PRIVATE,
    BREAKOUT,
    UPCOMING,
}

export type SessionRequestType = {
    roomType?: RoomType;
};

export type SessionResponseType = {
    sessions: Array<SessionInfo>;
};

export type SessionDeleteRequestType = SessionRequestType & {
    id: string;
};

export type LoginUserRequestType = {
    username: string;
    password: string;
};

export type LoginSuccessResponseType = {
    id: string;
    jwtToken: string;
};

export type CreateUserRequestType = {
    username: string;
    password: string;
    userType: UserType;
};

export type UserDataResponseType = {
    id: string;
    username: string;
    userType: UserType;
    courses: Array<string>;
};

export type ClassroomData = ClassroomSessionData;

export interface BaseJob<T = any> {
    jobDate: string;
    executingEvent: ExecutingEvent;
    data: T;
    createdBy: string;
}

export interface AnnouncementJob<T = Omit<CourseAnnouncementsType, "userId">>
    extends BaseJob<T> {
    executingEvent: ExecutingEvent.ANNOUNCEMENT;
}

export interface ClassOpenJob<T = ClassroomData> extends BaseJob<T> {
    executingEvent: ExecutingEvent.CLASS_OPEN;
}

type WithUserId = {
    userId: string;
};

export type CreateAnnouncementJobRequestType = Omit<
    AnnouncementJob<
        Omit<CourseAnnouncementsType, "date" | "userId" | "createdBy">
    >,
    "createdBy"
>;

export type EnrolCourseRequestType = WithUserId & {
    courses: Array<string>;
};

export type UserEnrolledCoursesResponseType = {
    courses: Array<string>;
};

export type GetAnnouncementsRequestType = WithUserId;

export type GetAnnouncementsResponseType = {
    announcements: Array<CourseAnnouncementsType & { username: string }>;
};

export type CreateClassroomJobRequestType = Omit<
    ClassOpenJob<Omit<ClassroomData, "messages" | "id">>,
    "createdBy"
>;

export enum FileUploadType {
    PROFILE,
    DOCUMENTS,
    RESPONSE,
}

export type FileStorageType = {
    filename: string;
    fileExtension: string;
    size: number;
    file: Buffer;
};

export type SaveCanvasRequestType = {
    sessionId: string;
    strokes: Array<Stroke>;
};

export type GetCanvasResponseType = {
    strokes: Array<Stroke>;
};

export type GetCanvasRequestType = {
    sessionId: string;
};

export type Stroke = {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    colour: string;
    size: number;
};

export type VideoSessionResponseType = {
    sessionId: string;
};

export type UserPeer = {
    userId: string;
    peerId: string;
};

export type VideoPeersResponseType = {
    peers: Array<UserPeer>;
};

export type BreakoutRoomData = {
    name: string;
    roomId: string;
    description: string;
};

export type UserData = Omit<UserDataResponseType, "courses">;

export enum ResponseFormType {
    SHORT_ANSWER,
    MULTIPLE_CHOICE,
    FILE,
}

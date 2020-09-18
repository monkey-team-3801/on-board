import { ExecutingEvent } from "./events";

export type AnyObjectMap<S> = { [key: string]: S };

export type SessionInfo = {
    id: string;
    name: string;
};

export type MessageData = {
    sendUser: string;
    content: string;
    sessionId: string;
    sentTime: string;
};

export type SessionData = SessionInfo & {
    id: string;
    name: string;
    messages?: Array<Omit<MessageData, "sessionId">>;
};

export type SessionResponseType = {
    sessions: Array<SessionInfo>;
};

export type NewMessageRequestType = Omit<MessageData, "sentTime">;

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

export type CourseActivityResponseType = CourseActivityUnique & {
    time: string;
    startDate: Date;
    duration: number;
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Monday->Sunday in ISO week
    weeks: Array<1 | 0>;
};

export type CourseDataUnique = {
    code: string;
    description: string;
};

export type CourseResponseType = CourseDataUnique & {
    activities: Array<CourseActivityResponseType>;
    StudentsList: Array<UserDataResponseType>;
    TutorsList: Array<UserDataResponseType>;
};

export type CoursesType = Array<CourseResponseType>;

export type CoursesResponseType = CoursesType;

export type CourseCodesType = Array<Pick<CourseDataUnique, "code">>;

export type CourseListResponseType = CourseCodesType;

export type CourseListRequestType = CourseCodesType;

export type CourseAnnouncementsType = {
    title: string;
    content: string;
    courseCode: string;
    user: string;
    date: string;
};

export enum UserType {
    STUDENT,
    TUTOR,
    COORDINATOR,
}

export type CourseParticipantsResponseType = {
    code: String;
    StudentsList: Array<UserDataResponseType>;
    TutorsList: Array<UserDataResponseType>;
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
    isUserOnline: boolean;
    courses: Array<string>;
};

export interface BaseJob<T = any> {
    jobDate: string;
    executingEvent: ExecutingEvent;
    data: T;
}

export interface AnnouncementJob<T = CourseAnnouncementsType>
    extends BaseJob<T> {
    executingEvent: ExecutingEvent.ANNOUNCEMENT;
}

export interface ClassOpenJob extends BaseJob<any> {
    executingEvent: ExecutingEvent.CLASS_OPEN;
}

type WithUserId = {
    userId: string;
};

export type CreateAnnouncementJobRequestType = AnnouncementJob<
    Omit<CourseAnnouncementsType, "date">
>;

export type EnrolCourseRequestType = WithUserId & {
    courses: Array<string>;
};

export type UserEnrolledCoursesResponseType = {
    courses: Array<string>;
};

export type GetAnnouncementsRequestType = WithUserId;

export type GetAnnouncementsResponseType = {
    announcements: Array<CourseAnnouncementsType>;
};

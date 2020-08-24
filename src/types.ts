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
};

export type CoursesResponseType = Array<CourseResponseType>;

export enum UserType {
    STUDENT,
    TUTOR,
    COORDINATOR,
}

export type LoginUserRequestType = {
    username: string;
    password: string;
};

export type LoginUserResponseType = {
    id: string;
};

export type CreateUserRequestType = {
    username: string;
    password: string;
    userType: UserType;
};

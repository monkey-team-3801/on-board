import { UserType, UserEnrolledCoursesResponseType } from "../types";

export type HttpMethod =
    | "get"
    | "post"
    | "put"
    | "patch"
    | "delete"
    | "head"
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEAD";

export type CachedFetchData<T> = {
    fetchedTime: Date;
    responseData: T;
};

export enum RequestState {
    LOADING,
    LOADED,
    ERROR,
    UNAUTHORISED,
    UNINITIALISED,
}

export interface BaseResponseType<T> {
    state: RequestState;
    data: T | undefined;
    message?: string | undefined;
}

export interface ResponseType<T> extends BaseResponseType<T> {
    state: RequestState.LOADED;
    data: T;
}

export interface ErrorResponseType extends BaseResponseType<undefined> {
    state: RequestState.LOADED;
    data: undefined;
    message?: string | undefined;
}

export enum LocalStorageKey {
    JWT_TOKEN = "JWT_TOKEN",
}

export type TopLayerContainerProps = {
    userData: {
        username: string;
        id: string;
        userType: UserType;
    };
    coursesResponse: BaseResponseType<UserEnrolledCoursesResponseType>;
    refreshCourses?: () => Promise<void>;
    refreshUserData?: () => Promise<void>;
};

export type CourseOptionType = {
    value: string;
    label: string;
};

export type ClassOpenEventData =
    | {
          id: string;
          course: string;
          roomName: string;
      }
    | undefined;

export type BreakoutAllocationEventData =
    | {
          id: string;
          roomIndex: number;
      }
    | undefined;

export type ChatModalStatusType = {
    open: boolean;
    selectedId?: string;
};

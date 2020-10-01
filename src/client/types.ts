export enum RequestState {
    LOADING,
    LOADED,
    ERROR,
    UNAUTHORISED,
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
        courses: Array<string>;
    };
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

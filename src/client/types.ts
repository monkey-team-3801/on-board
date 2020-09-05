export enum RequestState {
    LOADING,
    LOADED,
    ERROR,
    UNAUTHORISED,
}

export interface BaseResponseType<T> {
    state: RequestState;
    data: T | undefined;
}

export interface ResponseType<T> extends BaseResponseType<T> {
    state: RequestState.LOADED;
    data: T;
}

export enum LocalStorageKey {
    JWT_TOKEN = "JWT_TOKEN",
}

export type TopLayerContainerProps = {
    userData: {
        username: string;
        id: string;
    }
}

export type CourseOptionType = {
    value: string;
    label: string;
};

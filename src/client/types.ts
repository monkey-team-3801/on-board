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

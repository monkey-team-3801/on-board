export enum RequestState {
    LOADING,
    LOADED,
    ERROR,
}

export interface BaseResponseType<T> {
    state: RequestState;
    data: T | undefined;
}

export interface ResponseType<T> extends BaseResponseType<T> {
    state: RequestState.LOADED;
    data: T;
}

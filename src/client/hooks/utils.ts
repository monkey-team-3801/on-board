import { RequestState } from "../types";

export const HTTPStatusCodeToResponseState = (
    statusCode: number
): RequestState => {
    if (200 <= statusCode && statusCode <= 300) {
        return RequestState.LOADED;
    } else if (statusCode === 401) {
        return RequestState.UNAUTHORISED;
    } else {
        return RequestState.ERROR;
    }
};

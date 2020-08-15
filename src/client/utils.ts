import { BaseResponseType, RequestState } from "./types";

import { ResponseType } from "./types";

/**
 * Type guard to check if a request was loaded.
 * @param responseType Request response.
 */
export const requestIsLoaded = <T>(
    responseType: BaseResponseType<T>
): responseType is ResponseType<T> => {
    return responseType.state === RequestState.LOADED;
};

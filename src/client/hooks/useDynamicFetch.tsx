import React from "react";
import axios, { AxiosError } from "axios";

import {
    RequestState,
    BaseResponseType,
    LocalStorageKey,
    ErrorResponseType,
} from "../types";
import { AnyObjectMap } from "../../types";
import { HTTPStatusCodeToResponseState } from "./utils";

/**
 * Custom hook to fetch data from some api endpoint. The internal state is set depending on the response from the server, which will cause react to rerender with the new data.
 * @param apiEndpoint API endpoint.
 * @param apiRequestData Data to send to the endpoint.
 * @param invokeImmediately Should the fetch execute on first component render?
 * @param onFetchSuccess Callback for when the fetch was successful.
 * @param onFetchError Callback when the fetch failed.
 * @returns ResponseType<T> object with the current state of the request: LOADED, LOADING, ERROR which is set accordingly.
 * ResponseType<T>.data contains the response data from the endpoint.
 * T: Response data type.
 * S: Request data type as any form of a valid JSON object.
 *
 * Example: Getting a list of user names for a course:
 * // Always fetch from MATH1000 immediately.
 * const [response, refetch] = useDynamicFetch<{ users: Array<string> }, { courseCode: string }>("/users", { courseCode: "MATH1000" });
 *
 * React.useEffect(() => {
 *     // If courseCode changes, refetch the new users from the same endpoint.
 *     refetch({ courseCode });
 * }, [courseCode])
 *
 * // Render the usernames.
 * return (
 * {
 *     isRequestLoaded(response) && response.data.users.map((name) => {
 *         return <div>name</div>;
 *     })
 * }
 * )
 */
export const useDynamicFetch = <
    T,
    S extends AnyObjectMap<any> | undefined = undefined
>(
    apiEndpoint: string,
    apiRequestData?: S,
    invokeImmediately: boolean | undefined = true,
    onFetchSuccess?: (response: T) => void,
    onFetchError?: (err: AxiosError<ErrorResponseType>) => void
): [BaseResponseType<T>, (newRequestData: S | undefined) => Promise<void>] => {
    const componentMounted: React.MutableRefObject<boolean> = React.useRef<
        boolean
    >(false);

    const [responseType, setResponseType] = React.useState<BaseResponseType<T>>(
        {
            state: RequestState.LOADING,
            data: undefined,
        }
    );

    const fetchData = React.useCallback(
        async (endpoint: string, requestData?: AnyObjectMap<any>) => {
            try {
                setResponseType({
                    state: RequestState.LOADING,
                    data: undefined,
                });
                const response = await axios.post<T>(endpoint, requestData, {
                    headers: {
                        Authorization:
                            localStorage.getItem(LocalStorageKey.JWT_TOKEN) ||
                            "",
                    },
                });
                setResponseType({
                    state: HTTPStatusCodeToResponseState(response.status),
                    data: response.data,
                });
                onFetchSuccess?.(response.data);
            } catch (e) {
                const err: AxiosError<ErrorResponseType> = e;
                if (err.response) {
                    setResponseType({
                        state: HTTPStatusCodeToResponseState(
                            err.response.status
                        ),
                        data: undefined,
                    });
                    onFetchError?.(err);
                }
            }
        },
        [onFetchSuccess, onFetchError]
    );

    const refetch = React.useCallback(
        async (newRequestData: S | undefined) => {
            await fetchData(apiEndpoint, newRequestData);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [fetchData, apiEndpoint]
    );

    React.useEffect(() => {
        if (componentMounted.current || invokeImmediately) {
            fetchData(apiEndpoint, apiRequestData);
        } else {
            componentMounted.current = true;
            setResponseType((response: BaseResponseType<T>) => {
                return {
                    ...response,
                    state: RequestState.LOADED,
                };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, apiEndpoint]);

    return [responseType, refetch];
};

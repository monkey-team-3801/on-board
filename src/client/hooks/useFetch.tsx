import React from "react";

import { BaseResponseType } from "../types";
import { useDynamicFetch } from "./useDynamicFetch";
import { AnyObjectMap } from "../../types";

/**
 * Custom hook to fetch data from some api endpoint. Use this if you never need to change the data sent to the server, i.e static fetch.
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
 * Example: Getting the current server time.
 * const [response, refresh] = useFetch<{ time: string }>("/time");
 *
 * React.useEffect(() => {
 *     setInterval(() => {
 *         // refresh every 1000ms i.e 1s.
 *         refresh();
 *     }, 1000)
 * }, [])
 *
 * // Render the time.
 * return (
 *     isRequestLoaded(response) && <div>{`The current time is: ${response.time}`}</div>
 * )
 */
export const useFetch = <
    T,
    S extends AnyObjectMap<any> | undefined = undefined
>(
    apiEndpoint: string,
    apiRequestData?: S,
    invokeImmediately: boolean = true,
    onFetchSuccess?: () => void,
    onFetchError?: () => void
): [BaseResponseType<T>, () => Promise<void>] => {
    const [responseType, refresh]: [
        BaseResponseType<T>,
        (newRequestData?: S) => Promise<void>,
        (responseType: BaseResponseType<T>) => void
    ] = useDynamicFetch<T, AnyObjectMap<any>>(
        apiEndpoint,
        apiRequestData,
        invokeImmediately,
        onFetchSuccess,
        onFetchError
    );

    const staticRefresh = React.useCallback(async () => {
        await refresh(apiRequestData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiEndpoint, apiRequestData]);

    return [responseType, staticRefresh];
};

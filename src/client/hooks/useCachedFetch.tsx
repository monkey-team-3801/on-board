import { AnyObjectMap } from "../../types";
import {
    BaseResponseType,
    CachedFetchData,
    HttpMethod,
    RequestState,
} from "../types";
import { differenceInSeconds, parseJSON } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";
import { useDynamicFetch } from "./useDynamicFetch";

/**
 * Fetch and check if entry exists in sessionStorage first. If it does and
 * timeout hasn't been reached, use sessionStorage
 * @param method
 * @param apiEndpoint
 * @param apiRequestData
 * @param timeout: how long after fetching is the data considered invalid, in seconds, defaults to 1 minute
 *              A value of 0 means this doesn't timeout, i.e. data will only be cleared if user closes tab
 * @param forceFetch: ignore cache, just fetch from server
 */
export const useCachedFetch = <
    T,
    S extends AnyObjectMap<any> | undefined = undefined
>(
    method: HttpMethod,
    apiEndpoint: string,
    timeout: number = 60,
    apiRequestData?: S,
    forceFetch?: boolean
): [BaseResponseType<T>, (newRequestData: S | undefined) => Promise<void>] => {
    const itemKey = useMemo<string>(() => `cached-fetch-${apiEndpoint}`, [
        apiEndpoint,
    ]);
    const onFetchSuccess = useCallback(
        (response: T) => {
            const toCache: CachedFetchData<T> = {
                fetchedTime: new Date(),
                responseData: response,
            };
            sessionStorage.setItem(itemKey, JSON.stringify(toCache));
        },
        [itemKey]
    );

    const [response, refetch, setResponseType] = useDynamicFetch<T, S>(
        apiEndpoint,
        apiRequestData,
        false,
        onFetchSuccess,
        undefined,
        method
    );
    useEffect(() => {
        const storageEntry = sessionStorage.getItem(itemKey);
        if (storageEntry && !forceFetch) {
            const cachedData = JSON.parse(storageEntry);
            const parsedCachedData: CachedFetchData<T> = {
                responseData: cachedData.responseData,
                fetchedTime: parseJSON(cachedData.fetchedTime),
            };
            if (
                timeout === 0 ||
                differenceInSeconds(new Date(), parsedCachedData.fetchedTime) <=
                    timeout
            ) {
                const mockResponseType: BaseResponseType<T> = {
                    state: RequestState.LOADED,
                    data: parsedCachedData.responseData,
                };
                setResponseType(mockResponseType);
            } else {
                // Timed out
                refetch(apiRequestData);
            }
        } else {
            // No cache
            refetch(apiRequestData);
        }
    }, [
        apiRequestData,
        forceFetch,
        refetch,
        itemKey,
        timeout,
        setResponseType,
    ]);

    return [response, refetch];
};

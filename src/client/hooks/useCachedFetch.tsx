import { useDynamicFetch2 } from "./useDynamicFetch2";
import { AnyObjectMap } from "../../types";
import { BaseResponseType, CachedFetchData, HttpMethod, RequestState } from "../types";
import { differenceInSeconds, parseJSON } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";

/**
 * Fetch and check if entry exists in sessionStorage first. If it does and
 * timeout hasn't been reached, use sessionStorage
 * @param method
 * @param apiEndpoint
 * @param apiRequestData
 * @param timeout: how long after fetching is the data considered invalid, in seconds, defaults to 1 minute
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
	forceFetch?: boolean,
): [BaseResponseType<T>, (newRequestData: S | undefined) => Promise<void>] => {
	const itemKey = useMemo<string>(() => `cached-fetch-${apiEndpoint}`, [apiEndpoint]);
	const onFetchSuccess = useCallback((response: T) => {
		const toCache: CachedFetchData<T> = {
			fetchedTime: new Date(),
			responseData: response
		};
		sessionStorage.setItem(itemKey, JSON.stringify(toCache));
	}, [itemKey]);

	const [response, refetch, setResponseType] = useDynamicFetch2<T, S>(method, apiEndpoint, apiRequestData, false, onFetchSuccess);
	useEffect(() => {
		const storageEntry = sessionStorage.getItem(itemKey);
		if (storageEntry && !forceFetch) {
			const cachedData = JSON.parse(storageEntry);
			const parsedCachedData: CachedFetchData<T> = {
				responseData: cachedData.responseData,
				fetchedTime: parseJSON(cachedData.fetchedTime)
			};
			if (differenceInSeconds(new Date(), parsedCachedData.fetchedTime) <= timeout) {
				const mockResponseType: BaseResponseType<T> = {
					state: RequestState.LOADED,
					data: parsedCachedData.responseData
				};
				setResponseType(mockResponseType);
			} else {
				refetch(apiRequestData);
			}
		} else {
			refetch(apiRequestData);
		}
	}, [apiRequestData, forceFetch, refetch, itemKey, timeout, setResponseType]);

	return [response, refetch];
};
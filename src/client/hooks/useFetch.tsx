import React from "react";

import { BaseResponseType } from "../types";
import { useDynamicFetch } from "./useDynamicFetch";
import { AnyObjectMap } from "../../server/types";

/**
 * Custom hook to fetch data from some api endpoint.
 * @param apiEndpoint API endpoint
 * @param apiRequestData Data to send
 * @param invokeImmediately Fetches on first render if true
 * @param T: Response data type
 * @param S: Request data type
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
        (newRequestData?: S) => Promise<void>
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

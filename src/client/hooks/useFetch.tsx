import React from "react";
import axios from "axios";

import { RequestState, BaseResponseType } from "../types";

/**
 * Custom hook to fetch data from some api endpoint.
 * @param apiEndpoint API endpoint
 * @param apiRequestData Data to send
 */
export const useFetch = <T, S = {}>(
    apiEndpoint: string,
    apiRequestData: S,
    onFetchSuccess?: () => void,
    onFetchError?: () => void
): [BaseResponseType<T>, () => void] => {
    const [responseType, setResponseType] = React.useState<BaseResponseType<T>>(
        {
            state: RequestState.LOADING,
            data: undefined,
        }
    );

    const fetchData = React.useCallback(
        async (endpoint: string, requestData: S) => {
            try {
                const response = await axios.post<T>(endpoint, requestData);
                setResponseType({
                    state: RequestState.LOADED,
                    data: response.data,
                });
                onFetchSuccess?.();
            } catch (e) {
                setResponseType({
                    state: RequestState.ERROR,
                    data: undefined,
                });
                onFetchError?.();
            }
        },
        [onFetchSuccess, onFetchError]
    );

    const refresh = React.useCallback(() => {
        fetchData(apiEndpoint, apiRequestData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, apiEndpoint]);

    React.useEffect(() => {
        fetchData(apiEndpoint, apiRequestData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, apiEndpoint]);

    return [responseType, refresh];
};

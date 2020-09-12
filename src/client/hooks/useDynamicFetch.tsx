import React from "react";
import axios from "axios";

import { RequestState, BaseResponseType, LocalStorageKey } from "../types";
import { AnyObjectMap } from "../../types";
import { HTTPStatusCodeToResponseState } from "./utils";

/**
 * Custom hook to fetch data from some api endpoint, but allows new request data to be
 * sent to the same route.
 * @param apiEndpoint API endpoint
 * @param apiRequestData Data to send
 * @param invokeImmediately Fetches on first render if true
 * @param T: Response data type
 * @param S: Request data type
 */
export const useDynamicFetch = <
    T,
    S extends AnyObjectMap<any> | undefined = undefined
>(
    apiEndpoint: string,
    apiRequestData?: S,
    invokeImmediately: boolean | undefined = true,
    onFetchSuccess?: (response: T) => void,
    onFetchError?: () => void
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
                setResponseType((response) => {
                    return {
                        ...response,
                        state: RequestState.LOADING,
                    };
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
                setResponseType({
                    state: HTTPStatusCodeToResponseState(e.response.status),
                    data: undefined,
                });
                onFetchError?.();
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
